-- جدول المخصصات: المبادر (محسوب أو يدوي) + خدمة المستفيدين + المبتكر لكل مديرية.
alter table division_years add column if not exists initiator_override numeric(12,3);

-- الحساب الأساسي (داخلي): مخصص المبادر المحسوب بدقة البيسة وطريقة الباقي الأكبر
create or replace function _calc_base(p_year int)
returns table (division_id uuid, headcount int, computed numeric)
language plpgsql stable security definer set search_path = public as $$
declare ys year_settings; svc_n int; remaining_b bigint; inc_hc bigint;
begin
  select * into ys from year_settings where year = p_year;
  if ys.approved_headcount is null then return; end if;
  select count(*) into svc_n from divisions where is_service and active;
  remaining_b := round(ys.rate_per_employee * ys.approved_headcount * 1000)
               - round(ys.service_award * svc_n * 4 * 1000)
               - round((select coalesce(sum(value::numeric),0) from jsonb_each_text(ys.innovator_prizes)) * 2 * 1000);
  select coalesce(sum(dy.headcount),0) into inc_hc from division_years dy join divisions d on d.id = dy.division_id
    where dy.year = p_year and d.active and not d.counted_in_parent;
  if inc_hc = 0 or remaining_b <= 0 then return; end if;
  return query
  with base as (
    select dy.division_id as did, dy.headcount as hc,
           (remaining_b * dy.headcount) / inc_hc as fl,
           ((remaining_b * dy.headcount) % inc_hc) as rem
    from division_years dy join divisions d on d.id = dy.division_id
    where dy.year = p_year and d.active and not d.counted_in_parent
  ), ranked as (
    select *, row_number() over (order by rem desc, did) as rn, sum(fl) over () as sfl from base
  )
  select did, hc, ((fl + case when rn <= (remaining_b - sfl) then 1 else 0 end)::numeric / 1000) from ranked;
end $$;

-- المخصص الفعّال = اليدوي إن وُجد وإلا المحسوب (يُستخدم في فحص الرصيد)
create or replace function compute_allocations(p_year int)
returns table (division_id uuid, headcount int, allocation numeric)
language sql stable security definer set search_path = public as $$
  select b.division_id, b.headcount, coalesce(dy.initiator_override, b.computed)
  from _calc_base(p_year) b
  join division_years dy on dy.division_id = b.division_id and dy.year = p_year
  where my_role() is not null
$$;

create or replace function budget_table(p_year int)
returns table (division_id uuid, division_name text, headcount int, is_service boolean, computed numeric, override numeric, allocation numeric,
               service_amount numeric, innovator_amount numeric, q1 numeric, q2 numeric, q3 numeric, q4 numeric, paid numeric, unpaid numeric, balance numeric, total numeric)
language sql stable security definer set search_path = public as $$
  select d.id, d.name, dy.headcount, d.is_service, b.computed, dy.initiator_override,
    coalesce(dy.initiator_override, b.computed, 0),
    case when d.is_service then (select service_award * 4 from year_settings where year = p_year) else 0 end,
    coalesce((select sum(n.amount) from nominations n where n.division_id = d.id and n.year = p_year and n.track = 'innovator' and n.status in ('approved','to_pay','paid','honored')), 0),
    i.q1, i.q2, i.q3, i.q4, i.paid, i.unpaid,
    coalesce(dy.initiator_override, b.computed, 0) - (i.q1 + i.q2 + i.q3 + i.q4),
    coalesce(dy.initiator_override, b.computed, 0)
      + case when d.is_service then (select service_award * 4 from year_settings where year = p_year) else 0 end
      + coalesce((select sum(n.amount) from nominations n where n.division_id = d.id and n.year = p_year and n.track = 'innovator' and n.status in ('approved','to_pay','paid','honored')), 0)
  from divisions d
  join division_years dy on dy.division_id = d.id and dy.year = p_year
  left join _calc_base(p_year) b on b.division_id = d.id
  cross join lateral (
    select coalesce(sum(n.amount) filter (where n.period = 1 and n.status in ('approved','to_pay','paid','honored')), 0) q1,
           coalesce(sum(n.amount) filter (where n.period = 2 and n.status in ('approved','to_pay','paid','honored')), 0) q2,
           coalesce(sum(n.amount) filter (where n.period = 3 and n.status in ('approved','to_pay','paid','honored')), 0) q3,
           coalesce(sum(n.amount) filter (where n.period = 4 and n.status in ('approved','to_pay','paid','honored')), 0) q4,
           coalesce(sum(n.amount) filter (where n.status in ('paid','honored')), 0) paid,
           coalesce(sum(n.amount) filter (where n.status in ('approved','to_pay')), 0) unpaid
    from nominations n where n.division_id = d.id and n.year = p_year and n.track = 'initiator') i
  where d.active and (my_role() in ('ejada','admin_fin') or (my_role() = 'dg' and d.id = my_division()))
  order by d.name
$$;

create or replace function budget_summary(p_year int)
returns table (total_pool numeric, service_total numeric, innovator_total numeric, remaining numeric, per_employee numeric,
               included_headcount int, approved_headcount int, allocated numeric, unallocated numeric)
language sql stable security definer set search_path = public as $$
  with ys as (select * from year_settings where year = p_year),
  s as (select count(*)::int c from divisions where is_service and active),
  h as (select coalesce(sum(dy.headcount),0)::int hc from division_years dy join divisions d on d.id = dy.division_id where dy.year = p_year and d.active and not d.counted_in_parent),
  a as (select coalesce(sum(allocation),0) t from compute_allocations(p_year))
  select ys.approved_headcount * ys.rate_per_employee,
         s.c * ys.service_award * 4,
         (select coalesce(sum(value::numeric),0) from jsonb_each_text(ys.innovator_prizes)) * 2,
         ys.approved_headcount * ys.rate_per_employee - s.c * ys.service_award * 4 - (select coalesce(sum(value::numeric),0) from jsonb_each_text(ys.innovator_prizes)) * 2,
         case when h.hc > 0 then round((ys.approved_headcount * ys.rate_per_employee - s.c * ys.service_award * 4 - (select coalesce(sum(value::numeric),0) from jsonb_each_text(ys.innovator_prizes)) * 2) / h.hc, 3) end,
         h.hc, ys.approved_headcount, a.t,
         ys.approved_headcount * ys.rate_per_employee - s.c * ys.service_award * 4 - (select coalesce(sum(value::numeric),0) from jsonb_each_text(ys.innovator_prizes)) * 2 - a.t
  from ys, s, h, a
  where my_role() in ('ejada','admin_fin') and ys.approved_headcount is not null
$$;

revoke execute on function _calc_base(int) from public, anon, authenticated;
revoke execute on function budget_table(int) from public, anon;
revoke execute on function budget_summary(int) from public, anon;
grant execute on function budget_table(int) to authenticated;
grant execute on function budget_summary(int) to authenticated;
