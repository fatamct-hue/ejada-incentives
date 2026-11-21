-- 009: عدد مستفيدي خدمة المستفيدين في السنة لكل مديرية (يحدده فريق الإجادة)، وإضافة المعلومات الجغرافية للمسار.
-- الافتراضي 4 (مستفيد واحد في كل ربع). الحد الأقصى في الربع الواحد = تقريب (العدد السنوي ÷ 4) إلى الأعلى.

alter table division_years add column if not exists service_quota int not null default 4 check (service_quota between 0 and 100);

-- صف لدائرة خدمة المراجعين (تابعة) لتخزين عدد مستفيديها
insert into division_years (division_id, year, headcount, service_quota)
select d.id, 2026, 0, 4 from divisions d where d.name = 'دائرة خدمة المراجعين' on conflict do nothing;

update divisions set is_service = true where name = 'المديرية العامة للمعلومات الجغرافية';

-- لم يعد مستفيد واحد فقط لكل جهة في الربع: الفحص صار بالعدد المقرر داخل دالة الاعتماد
drop index if exists one_service_winner;

create or replace function _calc_base(p_year int)
returns table (division_id uuid, headcount int, computed numeric)
language plpgsql stable security definer set search_path = public as $$
declare ys year_settings; svc_q int; remaining_b bigint; inc_hc bigint;
begin
  select * into ys from year_settings where year = p_year;
  if ys.approved_headcount is null then return; end if;
  select coalesce(sum(dy.service_quota), 0) into svc_q from division_years dy join divisions d on d.id = dy.division_id
    where dy.year = p_year and d.is_service and d.active;
  remaining_b := round(ys.rate_per_employee * ys.approved_headcount * 1000)
               - round(ys.service_award * svc_q * 1000)
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

create or replace function budget_table(p_year int)
returns table (division_id uuid, division_name text, headcount int, is_service boolean, computed numeric, override numeric, allocation numeric,
               service_amount numeric, innovator_amount numeric, q1 numeric, q2 numeric, q3 numeric, q4 numeric, paid numeric, unpaid numeric, balance numeric, total numeric)
language sql stable security definer set search_path = public as $$
  select d.id, d.name, dy.headcount, d.is_service, b.computed, dy.initiator_override,
    coalesce(dy.initiator_override, b.computed, 0),
    sv.amt, inv.amt, i.q1, i.q2, i.q3, i.q4, i.paid, i.unpaid,
    coalesce(dy.initiator_override, b.computed, 0) - (i.q1 + i.q2 + i.q3 + i.q4),
    coalesce(dy.initiator_override, b.computed, 0) + sv.amt + inv.amt
  from divisions d
  join division_years dy on dy.division_id = d.id and dy.year = p_year
  left join _calc_base(p_year) b on b.division_id = d.id
  cross join lateral (select coalesce(sum(x.service_quota), 0) * (select service_award from year_settings where year = p_year) amt
        from division_years x join divisions c on c.id = x.division_id
        where x.year = p_year and c.active and c.is_service and (c.id = d.id or (c.parent_id = d.id and c.counted_in_parent))) sv
  cross join lateral (select coalesce(sum(n.amount), 0) amt from nominations n
        where _budget_div(n.division_id) = d.id and n.year = p_year and n.track = 'innovator' and n.status in ('approved','to_pay','paid','honored')) inv
  cross join lateral (
    select coalesce(sum(n.amount) filter (where n.period = 1 and n.status in ('approved','to_pay','paid','honored')), 0) q1,
           coalesce(sum(n.amount) filter (where n.period = 2 and n.status in ('approved','to_pay','paid','honored')), 0) q2,
           coalesce(sum(n.amount) filter (where n.period = 3 and n.status in ('approved','to_pay','paid','honored')), 0) q3,
           coalesce(sum(n.amount) filter (where n.period = 4 and n.status in ('approved','to_pay','paid','honored')), 0) q4,
           coalesce(sum(n.amount) filter (where n.status in ('paid','honored')), 0) paid,
           coalesce(sum(n.amount) filter (where n.status in ('approved','to_pay')), 0) unpaid
    from nominations n where _budget_div(n.division_id) = d.id and n.year = p_year and n.track = 'initiator') i
  where d.active and not d.counted_in_parent
    and (my_role() in ('ejada','admin_fin') or (my_role() = 'dg' and d.id = _budget_div(my_division())))
  order by d.name
$$;

create or replace function budget_summary(p_year int)
returns table (total_pool numeric, service_total numeric, innovator_total numeric, remaining numeric, per_employee numeric,
               included_headcount int, approved_headcount int, allocated numeric, unallocated numeric)
language sql stable security definer set search_path = public as $$
  with ys as (select * from year_settings where year = p_year),
  s as (select coalesce(sum(dy.service_quota), 0)::int q from division_years dy join divisions d on d.id = dy.division_id where dy.year = p_year and d.is_service and d.active),
  h as (select coalesce(sum(dy.headcount),0)::int hc from division_years dy join divisions d on d.id = dy.division_id where dy.year = p_year and d.active and not d.counted_in_parent),
  a as (select coalesce(sum(allocation),0) t from compute_allocations(p_year))
  select ys.approved_headcount * ys.rate_per_employee,
         s.q * ys.service_award,
         (select coalesce(sum(value::numeric),0) from jsonb_each_text(ys.innovator_prizes)) * 2,
         ys.approved_headcount * ys.rate_per_employee - s.q * ys.service_award - (select coalesce(sum(value::numeric),0) from jsonb_each_text(ys.innovator_prizes)) * 2,
         case when h.hc > 0 then round((ys.approved_headcount * ys.rate_per_employee - s.q * ys.service_award - (select coalesce(sum(value::numeric),0) from jsonb_each_text(ys.innovator_prizes)) * 2) / h.hc, 3) end,
         h.hc, ys.approved_headcount, a.t,
         ys.approved_headcount * ys.rate_per_employee - s.q * ys.service_award - (select coalesce(sum(value::numeric),0) from jsonb_each_text(ys.innovator_prizes)) * 2 - a.t
  from ys, s, h, a
  where my_role() in ('ejada','admin_fin') and ys.approved_headcount is not null
$$;

-- الاعتماد: التحقق من عدد المستفيدين المقرر للجهة (سنوياً وفي الربع)
create or replace function transition_nomination(p_id uuid, p_action text, p_note text default null, p_date date default null)
returns nominations language plpgsql security definer set search_path = public as $$
declare pr profiles; n nominations; old nom_status; ncrit int; nscored int; att int; approver user_role; alloc numeric; quota int;
begin
  select * into pr from me();
  if pr.id is null then raise exception 'غير مصرح'; end if;
  select * into n from nominations where id = p_id for update;
  if not found then raise exception 'الترشيح غير موجود'; end if;
  old := n.status;
  approver := case when n.track = 'initiator' then 'admin_fin'::user_role else 'dev'::user_role end;

  if p_action = 'submit' then
    if pr.role <> 'dg' or n.division_id <> pr.division_id then raise exception 'غير مصرح'; end if;
    if old not in ('draft','needs_info') then raise exception 'حالة غير صالحة للإرسال'; end if;
    if not (select is_open from cycles where year=n.year and track=n.track and period=n.period) then raise exception 'الدورة مغلقة'; end if;
    select count(*) into ncrit from criteria where track = n.track and active;
    select count(*) into nscored from criteria c where c.track = n.track and c.active and n.scores ? c.id::text;
    if nscored < ncrit then raise exception 'يجب إكمال جميع الدرجات'; end if;
    if coalesce(trim(n.justification),'') = '' then raise exception 'مسوغات الترشيح إلزامية'; end if;
    if coalesce(trim(n.direct_manager),'') = '' then raise exception 'اسم المسؤول المباشر إلزامي'; end if;
    select count(*) into att from attachments where nomination_id = n.id;
    if att < 1 then raise exception 'شاهد واحد على الأقل إلزامي'; end if;
    if n.track = 'initiator' then
      if coalesce(n.initiative_title,'') = '' then raise exception 'عنوان المبادرة إلزامي'; end if;
      if coalesce(n.amount,0) <= 0 then raise exception 'المبلغ المقترح إلزامي'; end if;
      alloc := _allocation(n.division_id, n.year);
      if n.amount + _committed(n.division_id, n.year, n.id) > alloc then raise exception 'المبلغ يتجاوز الرصيد السنوي المتاح'; end if;
    end if;
    update nominations set status='sent', submitted_by_name = pr.full_name, submitted_at = now(), needs_info_reason = null, updated_at = now()
      where id = n.id returning * into n;

  elsif p_action = 'receive' then
    if pr.role <> 'ejada' or old <> 'sent' then raise exception 'غير مصرح أو حالة غير صالحة'; end if;
    update nominations set status='review', committee_by = pr.full_name, committee_at = now(), updated_at=now() where id = n.id returning * into n;

  elsif p_action = 'needs_info' then
    if coalesce(trim(p_note),'') = '' then raise exception 'سبب الإعادة إلزامي'; end if;
    if old not in ('sent','review') then raise exception 'حالة غير صالحة'; end if;
    if not (pr.role = 'ejada' or pr.role = approver) then raise exception 'غير مصرح'; end if;
    update nominations set status='needs_info', needs_info_reason = p_note, updated_at=now() where id = n.id returning * into n;

  elsif p_action = 'approve' then
    if pr.role <> approver then raise exception 'الاعتماد من اختصاص الجهة المعنية بالمسار'; end if;
    if old <> 'review' then raise exception 'يجب أن يستلم فريق الإجادة الترشيح قبل الاعتماد'; end if;
    if exists (select 1 from nominations o where o.year = n.year and o.track <> n.track and o.id <> n.id
               and o.people && n.people and o.status in ('approved','to_pay','paid','honored')) then
      raise exception 'الموظف معتمد في مسار آخر لهذه السنة';
    end if;
    if n.track = 'service' then
      select coalesce(max(dy.service_quota), 4) into quota from division_years dy where dy.division_id = n.division_id and dy.year = n.year;
      if (select count(*) from nominations o where o.year = n.year and o.track = 'service' and o.division_id = n.division_id and o.id <> n.id
            and o.status in ('approved','to_pay','paid','honored')) >= quota then
        raise exception 'اكتمل عدد مستفيدي خدمة المستفيدين المقرر للجهة هذه السنة';
      end if;
      if (select count(*) from nominations o where o.year = n.year and o.track = 'service' and o.division_id = n.division_id and o.period = n.period and o.id <> n.id
            and o.status in ('approved','to_pay','paid','honored')) >= ceil(quota / 4.0) then
        raise exception 'اكتمل عدد مستفيدي الجهة في هذا الربع';
      end if;
    end if;
    if n.track = 'initiator' then
      alloc := _allocation(n.division_id, n.year);
      if n.amount + _committed(n.division_id, n.year, n.id) > alloc then raise exception 'المبلغ يتجاوز الرصيد السنوي'; end if;
    end if;
    update nominations set status='approved', approved_by = pr.full_name, approved_at = now(),
      fin_by = case when track='initiator' then pr.full_name end, fin_at = case when track='initiator' then now() end, updated_at=now()
      where id = n.id returning * into n;

  elsif p_action = 'to_pay' then
    if pr.role <> 'admin_fin' or old <> 'approved' then raise exception 'غير مصرح أو حالة غير صالحة'; end if;
    update nominations set status='to_pay', updated_at=now() where id = n.id returning * into n;

  elsif p_action = 'pay' then
    if pr.role <> 'admin_fin' or old <> 'to_pay' then raise exception 'غير مصرح أو حالة غير صالحة'; end if;
    update nominations set status='paid', paid_on = coalesce(p_date, current_date), updated_at=now() where id = n.id returning * into n;

  elsif p_action = 'honor' then
    if pr.role <> 'ejada' or old <> 'paid' then raise exception 'التكريم يسجله فريق الإجادة بعد الصرف'; end if;
    update nominations set status='honored', honored_on = coalesce(p_date, current_date), updated_at=now() where id = n.id returning * into n;
  else
    raise exception 'إجراء غير معروف';
  end if;
  perform _log(n, p_action, old, p_note);
  return n;
end $$;
