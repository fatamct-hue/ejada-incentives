-- الدوال والصلاحيات. كل كتابة على الترشيحات تمر عبر دوال security definer.

create or replace function me() returns profiles language sql stable security definer set search_path = public as $$
  select * from profiles where lower(email) = lower(coalesce(auth.jwt() ->> 'email','')) and active limit 1
$$;
create or replace function my_role() returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where lower(email) = lower(coalesce(auth.jwt() ->> 'email','')) and active limit 1
$$;
create or replace function my_division() returns uuid language sql stable security definer set search_path = public as $$
  select division_id from profiles where lower(email) = lower(coalesce(auth.jwt() ->> 'email','')) and active limit 1
$$;

-- ===== الميزانية (دقة البيسة، الباقي الأكبر) =====
create or replace function compute_allocations(p_year int)
returns table (division_id uuid, headcount int, allocation numeric)
language plpgsql stable security definer set search_path = public as $$
declare
  ys year_settings; svc_n int; remaining_b bigint; inc_hc bigint; assigned bigint := 0; left_b bigint;
begin
  if my_role() is null then return; end if;
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
           (remaining_b * dy.headcount) / inc_hc as fl,                    -- floor
           ((remaining_b * dy.headcount) % inc_hc) as rem
    from division_years dy join divisions d on d.id = dy.division_id
    where dy.year = p_year and d.active and not d.counted_in_parent
  ), ranked as (
    select *, row_number() over (order by rem desc, did) as rn, sum(fl) over () as sfl from base
  )
  select did, hc, ((fl + case when rn <= (remaining_b - sfl) then 1 else 0 end)::numeric / 1000)
  from ranked;
end $$;

create or replace function division_budget(p_year int)
returns table (division_id uuid, division_name text, headcount int, allocation numeric,
               q1 numeric, q2 numeric, q3 numeric, q4 numeric, paid numeric, unpaid numeric, balance numeric)
language sql stable security definer set search_path = public as $$
  select a.division_id, d.name, a.headcount, a.allocation,
    coalesce(sum(n.amount) filter (where n.period=1 and n.status in ('approved','to_pay','paid','honored')),0),
    coalesce(sum(n.amount) filter (where n.period=2 and n.status in ('approved','to_pay','paid','honored')),0),
    coalesce(sum(n.amount) filter (where n.period=3 and n.status in ('approved','to_pay','paid','honored')),0),
    coalesce(sum(n.amount) filter (where n.period=4 and n.status in ('approved','to_pay','paid','honored')),0),
    coalesce(sum(n.amount) filter (where n.status in ('paid','honored')),0),
    coalesce(sum(n.amount) filter (where n.status in ('approved','to_pay')),0),
    a.allocation - coalesce(sum(n.amount) filter (where n.status in ('approved','to_pay','paid','honored')),0)
  from compute_allocations(p_year) a
  join divisions d on d.id = a.division_id
  left join nominations n on n.division_id = a.division_id and n.year = p_year and n.track = 'initiator'
  where my_role() in ('ejada','admin_fin') or (my_role() = 'dg' and a.division_id = my_division())
  group by a.division_id, d.name, a.headcount, a.allocation
  order by d.name
$$;

-- ===== مساعدات =====
create or replace function _log(n nominations, p_action text, p_from nom_status, p_note text) returns void
language plpgsql security definer set search_path = public as $$
declare p profiles;
begin
  select * into p from me();
  insert into nomination_events(nomination_id, actor_id, actor_name, actor_role, action, from_status, to_status, note)
  values (n.id, p.id, p.full_name, p.role, p_action, p_from, n.status, p_note);
end $$;

create or replace function _committed(p_div uuid, p_year int, p_exclude uuid) returns numeric
language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount),0) from nominations
  where division_id = p_div and year = p_year and track='initiator'
    and status in ('approved','to_pay','paid','honored') and id is distinct from p_exclude
$$;

create or replace function _allocation(p_div uuid, p_year int) returns numeric
language sql stable security definer set search_path = public as $$
  select coalesce((select allocation from compute_allocations(p_year) where division_id = p_div), 0)
$$;

-- البحث عن موظف ضمن تقسيم المدير العام فقط
create or replace function lookup_employee(p_emp_no text)
returns table (emp_no text, name text, title text)
language sql stable security definer set search_path = public as $$
  select e.emp_no, e.name, e.title from employees e
  where e.emp_no = trim(p_emp_no)
    and (my_role() in ('ejada','dev','admin_fin') or (my_role()='dg' and e.division_id = my_division()))
$$;

-- ===== حفظ المسودة =====
create or replace function save_nomination(p jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare pr profiles; n nominations; v_id uuid := nullif(p->>'id','')::uuid; e employees; c cycles;
        v_track track_kind := (p->>'track')::track_kind; v_period int := (p->>'period')::int; v_year int := (p->>'year')::int;
        v_total int := 0; k text; sc int; mx int;
begin
  select * into pr from me();
  if pr.role is distinct from 'dg' then raise exception 'غير مصرح: الترشيح للمدير العام فقط'; end if;
  if v_track = 'innovator' then raise exception 'نتائج المبتكر تُدخل عبر فريق الإجادة'; end if;
  select * into e from employees where emp_no = trim(p->>'emp_no');
  if not found or e.division_id <> pr.division_id then raise exception 'الموظف غير موجود ضمن تقسيمك'; end if;
  if v_track = 'service' and not (select is_service from divisions where id = pr.division_id) then
    raise exception 'التقسيم غير مشمول بمسار خدمة المستفيدين'; end if;
  select * into c from cycles where year = v_year and track = v_track and period = v_period;
  if not found or not c.is_open then raise exception 'الدورة غير مفتوحة لاستقبال الترشيحات'; end if;
  if (select closed from year_settings where year = v_year) then raise exception 'السنة مقفلة'; end if;
  for k, sc in select key, value::int from jsonb_each_text(coalesce(p->'scores','{}')) loop
    select max_score into mx from criteria where id = k::int and track = v_track;
    if mx is null or sc < 0 or sc > mx then raise exception 'درجة غير صالحة للمعيار %', k; end if;
    v_total := v_total + sc;
  end loop;
  if v_id is null then
    insert into nominations(year, track, period, division_id, outlet_id, emp_no, emp_name, job_title, department, direct_manager,
      scores, evidence_notes, total, justification, initiative_title, initiative_date, beneficiaries, amount, people, created_by)
    values (v_year, v_track, v_period, pr.division_id, nullif(p->>'outlet_id','')::uuid, e.emp_no, e.name, e.title,
      p->>'department', p->>'direct_manager', coalesce(p->'scores','{}'), coalesce(p->'evidence_notes','{}'), v_total,
      p->>'justification', p->>'initiative_title', nullif(p->>'initiative_date','')::date, p->>'beneficiaries',
      nullif(p->>'amount','')::numeric, array[e.emp_no], pr.id)
    returning * into n;
    perform _log(n,'save_draft',null,null);
  else
    select * into n from nominations where id = v_id and division_id = pr.division_id;
    if not found then raise exception 'الترشيح غير موجود'; end if;
    if n.status not in ('draft','needs_info') then raise exception 'لا يمكن تعديل ترشيح بعد إرساله'; end if;
    update nominations set outlet_id = nullif(p->>'outlet_id','')::uuid, emp_no = e.emp_no, emp_name = e.name, job_title = e.title,
      department = p->>'department', direct_manager = p->>'direct_manager', scores = coalesce(p->'scores','{}'),
      evidence_notes = coalesce(p->'evidence_notes','{}'), total = v_total, justification = p->>'justification',
      initiative_title = p->>'initiative_title', initiative_date = nullif(p->>'initiative_date','')::date,
      beneficiaries = p->>'beneficiaries', amount = nullif(p->>'amount','')::numeric, people = array[e.emp_no], updated_at = now()
    where id = v_id returning * into n;
    perform _log(n,'save_draft',n.status,null);
  end if;
  return n.id;
end $$;

-- ===== الانتقالات =====
-- p_action: submit | receive | recommend | needs_info | approve | to_pay | pay | honor
create or replace function transition_nomination(p_id uuid, p_action text, p_note text default null, p_date date default null)
returns nominations language plpgsql security definer set search_path = public as $$
declare pr profiles; n nominations; old nom_status; ncrit int; nscored int; att int; approver user_role; alloc numeric;
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
    update nominations set status='review', updated_at=now() where id = n.id returning * into n;

  elsif p_action = 'recommend' then
    if pr.role <> 'ejada' or old not in ('sent','review') then raise exception 'غير مصرح أو حالة غير صالحة'; end if;
    update nominations set status='recommended', committee_by = pr.full_name, committee_at = now(), updated_at=now()
      where id = n.id returning * into n;

  elsif p_action = 'needs_info' then
    if coalesce(trim(p_note),'') = '' then raise exception 'سبب الإعادة إلزامي'; end if;
    if old not in ('sent','review','recommended') then raise exception 'حالة غير صالحة'; end if;
    if not (pr.role = 'ejada' or pr.role = approver) then raise exception 'غير مصرح'; end if;
    update nominations set status='needs_info', needs_info_reason = p_note, updated_at=now() where id = n.id returning * into n;

  elsif p_action = 'approve' then
    if pr.role <> approver then raise exception 'الاعتماد من اختصاص الجهة المعنية بالمسار'; end if;
    if old <> 'recommended' then raise exception 'يجب أن يكون الترشيح موصى به'; end if;
    if exists (select 1 from nominations o where o.year = n.year and o.track <> n.track and o.id <> n.id
               and o.people && n.people and o.status in ('approved','to_pay','paid','honored')) then
      raise exception 'الموظف معتمد في مسار آخر لهذه السنة';
    end if;
    if n.track = 'service' and exists (select 1 from nominations o where o.year=n.year and o.period=n.period and o.division_id=n.division_id
        and o.track='service' and o.id<>n.id and o.status in ('approved','to_pay','paid','honored')) then
      raise exception 'يوجد فائز معتمد للجهة نفسها في هذا الربع';
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

-- ===== نتائج المبتكر (فريق الإجادة يُدخل، والتطوير والدراسات تعتمد عبر approve) =====
create or replace function save_innovator_result(p jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare pr profiles; n nominations; v_year int := (p->>'year')::int; v_half int := (p->>'period')::int; v_rank int := (p->>'rank')::int;
        lead employees; v_people text[]; v_share numeric; v_prize numeric; m jsonb; v_id uuid := nullif(p->>'id','')::uuid;
begin
  select * into pr from me();
  if pr.role <> 'ejada' then raise exception 'إدخال نتائج المبتكر لفريق الإجادة'; end if;
  if v_half not in (1,2) or v_rank not in (1,2,3) then raise exception 'نصف السنة أو المركز غير صالح'; end if;
  select * into lead from employees where emp_no = trim(p->>'emp_no');
  if not found then raise exception 'الرقم الوظيفي غير مسجل'; end if;
  v_people := array[lead.emp_no];
  v_prize := (select (innovator_prizes ->> v_rank::text)::numeric from year_settings where year = v_year);
  v_share := 0;
  if coalesce((p->>'is_team')::boolean,false) then
    for m in select * from jsonb_array_elements(coalesce(p->'team','[]')) loop
      if not exists (select 1 from employees where emp_no = m->>'emp_no') then raise exception 'عضو فريق غير مسجل: %', m->>'emp_no'; end if;
      v_people := v_people || (m->>'emp_no'); v_share := v_share + coalesce((m->>'share')::numeric,0);
    end loop;
    if v_share > v_prize then raise exception 'مجموع الحصص يتجاوز قيمة المركز'; end if;
  end if;
  if v_id is null then
    insert into nominations(year, track, period, division_id, emp_no, emp_name, job_title, status, rank, idea_title, idea_no,
        approved_on, results_doc, is_team, team, people, amount, created_by, committee_by, committee_at, submitted_by_name, submitted_at)
    values (v_year,'innovator',v_half, coalesce(nullif(p->>'division_id','')::uuid, lead.division_id), lead.emp_no, lead.name, lead.title,
        'recommended', v_rank, p->>'idea_title', p->>'idea_no', nullif(p->>'approved_on','')::date, p->>'results_doc',
        coalesce((p->>'is_team')::boolean,false), coalesce(p->'team','[]'), v_people, v_prize, pr.id, pr.full_name, now(), pr.full_name, now())
    returning * into n;
  else
    update nominations set emp_no=lead.emp_no, emp_name=lead.name, job_title=lead.title, rank=v_rank, period=v_half,
      division_id = coalesce(nullif(p->>'division_id','')::uuid, lead.division_id), idea_title=p->>'idea_title', idea_no=p->>'idea_no',
      approved_on = nullif(p->>'approved_on','')::date, results_doc = p->>'results_doc',
      is_team = coalesce((p->>'is_team')::boolean,false), team = coalesce(p->'team','[]'), people = v_people, amount = v_prize, updated_at=now()
    where id = v_id and track='innovator' and status in ('recommended','needs_info') returning * into n;
    if not found then raise exception 'لا يمكن تعديل النتيجة بعد اعتمادها'; end if;
  end if;
  perform _log(n,'save_innovator',null,null);
  return n.id;
end $$;

-- ===== التعارض بين المسارات (لفريق الإجادة) =====
create or replace function find_conflicts(p_year int)
returns table (emp_no text, emp_name text, nomination_id uuid, track track_kind, period int, status nom_status)
language sql stable security definer set search_path = public as $$
  select p.emp, (select name from employees where employees.emp_no = p.emp), n.id, n.track, n.period, n.status
  from (select unnest(people) as emp, id from nominations where year = p_year and status not in ('draft','needs_info')) p
  join nominations n on n.id = p.id
  where my_role() = 'ejada'
    and p.emp in (select unnest(people) from nominations where year = p_year and status not in ('draft','needs_info')
                  group by 1 having count(distinct track) > 1)
  order by 1, 4, 5
$$;

create or replace function resolve_conflict(p_keep uuid, p_note text default null) returns int
language plpgsql security definer set search_path = public as $$
declare k nominations; o nominations; cnt int := 0; old nom_status;
begin
  if my_role() <> 'ejada' then raise exception 'غير مصرح'; end if;
  select * into k from nominations where id = p_keep;
  for o in select * from nominations where year = k.year and track <> k.track and people && k.people and id <> k.id
           and status in ('sent','review','recommended') loop
    old := o.status;
    update nominations set status = 'needs_info', needs_info_reason = coalesce(p_note,'تعارض مسار: حُسم لصالح مسار آخر'), updated_at=now()
      where id = o.id returning * into o;
    perform _log(o,'conflict_resolved',old,p_note); cnt := cnt + 1;
  end loop;
  return cnt;
end $$;

-- ===== حالة الدورات =====
create or replace function cycle_status(p_year int)
returns table (cycle_id uuid, track track_kind, period int, is_open boolean, closes_on date, state text, approved_count int, expected int, pending int)
language sql stable security definer set search_path = public as $$
  with s as (select count(*)::int c from divisions where is_service and active)
  select c.id, c.track, c.period, c.is_open, c.closes_on,
    case when c.closes_on is not null and c.closes_on >= current_date then 'not_ended'
         when ap = ex and ex > 0 then 'complete'
         when pn > 0 then 'awaiting'
         when c.track = 'initiator' and ap > 0 then 'complete'
         else 'incomplete' end,
    ap, ex, pn
  from cycles c, s,
  lateral (select case c.track when 'service' then s.c when 'innovator' then 3 else 0 end as ex) e,
  lateral (select count(*) filter (where status in ('approved','to_pay','paid','honored'))::int ap,
                  count(*) filter (where status in ('sent','review','recommended'))::int pn
           from nominations n where n.year = c.year and n.track = c.track and n.period = c.period) q
  where c.year = p_year and my_role() is not null
  order by c.track, c.period
$$;

-- ===== تهيئة سنة =====
create or replace function init_year(p_year int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if my_role() <> 'ejada' then raise exception 'غير مصرح'; end if;
  insert into year_settings(year) values (p_year) on conflict do nothing;
  insert into cycles(year, track, period)
  select p_year, t, p from (values ('service'::track_kind,1),('service',2),('service',3),('service',4),
    ('initiator',1),('initiator',2),('initiator',3),('initiator',4),('innovator',1),('innovator',2)) v(t,p)
  on conflict do nothing;
end $$;

-- ===== نسخة النشر الرسمية =====
create or replace function approve_publish(p_year int) returns uuid
language plpgsql security definer set search_path = public as $$
declare pr profiles; v_id uuid;
begin
  select * into pr from me();
  if pr.role <> 'ejada' then raise exception 'غير مصرح'; end if;
  insert into publish_versions(year, approved_by, rows)
  select p_year, pr.full_name, coalesce(jsonb_agg(jsonb_build_object('name', emp_name, 'division', d.name, 'track', n.track,
         'period', n.period, 'rank', n.rank, 'team', case when n.is_team then n.team end) order by n.track, n.period, d.name), '[]')
  from nominations n join divisions d on d.id = n.division_id
  where n.year = p_year and n.status = 'honored'
  returning id into v_id;
  return v_id;
end $$;

create or replace function close_year(p_year int) returns void
language plpgsql security definer set search_path = public as $$
declare pr profiles;
begin
  select * into pr from me();
  if pr.role <> 'ejada' then raise exception 'غير مصرح'; end if;
  update year_settings set closed = true, closed_by = pr.id, closed_at = now() where year = p_year;
  update cycles set is_open = false where year = p_year;
end $$;

-- ===== RLS =====
alter table year_settings enable row level security;   alter table divisions enable row level security;
alter table outlets enable row level security;         alter table division_years enable row level security;
alter table profiles enable row level security;        alter table employees enable row level security;
alter table cycles enable row level security;          alter table criteria enable row level security;
alter table nominations enable row level security;     alter table attachments enable row level security;
alter table nomination_events enable row level security; alter table publish_versions enable row level security;

-- مرجعيات: يقرؤها كل مستخدم مسجل، ويديرها فريق الإجادة
do $$ declare t text; begin
  foreach t in array array['year_settings','divisions','outlets','division_years','cycles','criteria'] loop
    execute format('create policy %I_read on %I for select using (my_role() is not null)', t, t);
    execute format('create policy %I_ejada on %I for all using (my_role() = ''ejada'') with check (my_role() = ''ejada'')', t, t);
  end loop; end $$;

create policy profiles_self on profiles for select using (lower(email) = lower(coalesce(auth.jwt()->>'email','')) or my_role() = 'ejada');
create policy profiles_ejada on profiles for all using (my_role() = 'ejada') with check (my_role() = 'ejada');

create policy emp_read on employees for select using (
  my_role() in ('ejada','dev','admin_fin') or (my_role() = 'dg' and division_id = my_division()));
create policy emp_ejada on employees for all using (my_role() = 'ejada') with check (my_role() = 'ejada');

create policy nom_read on nominations for select using (
  case my_role()
    when 'ejada' then true
    when 'dg' then division_id = my_division()
    when 'dev' then track in ('service','innovator')
    when 'admin_fin' then track = 'initiator' or status in ('approved','to_pay','paid','honored')
    else false end);
-- لا سياسات كتابة مباشرة على nominations: الكتابة عبر الدوال فقط.

create policy att_read on attachments for select using (exists (select 1 from nominations n where n.id = nomination_id));
create policy att_write on attachments for insert with check (my_role() = 'dg' and exists (
  select 1 from nominations n where n.id = nomination_id and n.division_id = my_division() and n.status in ('draft','needs_info')));
create policy att_delete on attachments for delete using (my_role() = 'dg' and exists (
  select 1 from nominations n where n.id = nomination_id and n.division_id = my_division() and n.status in ('draft','needs_info')));

create policy ev_read on nomination_events for select using (exists (select 1 from nominations n where n.id = nomination_id));
create policy pub_read on publish_versions for select using (my_role() is not null);

-- ===== التخزين =====
insert into storage.buckets (id, name, public) values ('evidence','evidence', false) on conflict do nothing;
-- المسار: {division_id}/{nomination_id}/{file}
create policy ev_obj_read on storage.objects for select using (bucket_id = 'evidence' and exists (
  select 1 from public.nominations n where n.id::text = (storage.foldername(name))[2] and n.division_id::text = (storage.foldername(name))[1]));
create policy ev_obj_ins on storage.objects for insert with check (bucket_id = 'evidence' and public.my_role() = 'dg' and exists (
  select 1 from public.nominations n where n.id::text = (storage.foldername(name))[2]
   and n.division_id = public.my_division() and n.status in ('draft','needs_info')));
create policy ev_obj_del on storage.objects for delete using (bucket_id = 'evidence' and public.my_role() = 'dg' and exists (
  select 1 from public.nominations n where n.id::text = (storage.foldername(name))[2]
   and n.division_id = public.my_division() and n.status in ('draft','needs_info')));

revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;
