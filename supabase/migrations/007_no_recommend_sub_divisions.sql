-- 007: إلغاء خطوة «التوصية» (الاعتماد مباشرة بعد الاستلام والمراجعة)، ودعم التقسيم التابع (دائرة خدمة المراجعين).
-- الحالات المعتمدة الآن: مسودة ← مرسل ← قيد المراجعة (استلام فريق الإجادة) ← معتمد ← أُحيل للصرف ← صُرف ← تم التكريم
-- (قيمة 'recommended' تبقى في النوع للتوافق ولا تُستخدم.)

update nominations set status = 'review' where status = 'recommended';

-- التقسيم الذي تُحسب ميزانيته: التابع المحسوب موظفوه ضمن الأعلى يُحاسَب على مخصص الأعلى
create or replace function _budget_div(p_div uuid) returns uuid language sql stable security definer set search_path = public as $$
  select case when d.counted_in_parent and d.parent_id is not null then d.parent_id else d.id end from divisions d where d.id = p_div
$$;

create or replace function _committed(p_div uuid, p_year int, p_exclude uuid) returns numeric
language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount), 0) from nominations
  where _budget_div(division_id) = _budget_div(p_div) and year = p_year and track = 'initiator'
    and status in ('approved','to_pay','paid','honored') and id is distinct from p_exclude
$$;

create or replace function _allocation(p_div uuid, p_year int) returns numeric
language sql stable security definer set search_path = public as $$
  select coalesce((select allocation from compute_allocations(p_year) where division_id = _budget_div(p_div)), 0)
$$;

create or replace function budget_table(p_year int)
returns table (division_id uuid, division_name text, headcount int, is_service boolean, computed numeric, override numeric, allocation numeric,
               service_amount numeric, innovator_amount numeric, q1 numeric, q2 numeric, q3 numeric, q4 numeric, paid numeric, unpaid numeric, balance numeric, total numeric)
language sql stable security definer set search_path = public as $$
  select d.id, d.name, dy.headcount, d.is_service, b.computed, dy.initiator_override,
    coalesce(dy.initiator_override, b.computed, 0),
    sv.n * (select service_award * 4 from year_settings where year = p_year),
    inv.amt, i.q1, i.q2, i.q3, i.q4, i.paid, i.unpaid,
    coalesce(dy.initiator_override, b.computed, 0) - (i.q1 + i.q2 + i.q3 + i.q4),
    coalesce(dy.initiator_override, b.computed, 0) + sv.n * (select service_award * 4 from year_settings where year = p_year) + inv.amt
  from divisions d
  join division_years dy on dy.division_id = d.id and dy.year = p_year
  left join _calc_base(p_year) b on b.division_id = d.id
  cross join lateral (select (case when d.is_service then 1 else 0 end
        + (select count(*) from divisions c where c.parent_id = d.id and c.counted_in_parent and c.is_service and c.active))::int n) sv
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
  where d.active and (my_role() in ('ejada','admin_fin') or (my_role() = 'dg' and d.id = _budget_div(my_division())))
  order by d.name
$$;

-- الانتقالات بدون توصية: الاستلام ← الاعتماد من الجهة المختصة مباشرة
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

-- نتائج المبتكر: يدخلها فريق الإجادة فتدخل «قيد المراجعة» لاعتماد التطوير والدراسات
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
        'review', v_rank, p->>'idea_title', p->>'idea_no', nullif(p->>'approved_on','')::date, p->>'results_doc',
        coalesce((p->>'is_team')::boolean,false), coalesce(p->'team','[]'), v_people, v_prize, pr.id, pr.full_name, now(), pr.full_name, now())
    returning * into n;
  else
    update nominations set emp_no=lead.emp_no, emp_name=lead.name, job_title=lead.title, rank=v_rank, period=v_half,
      division_id = coalesce(nullif(p->>'division_id','')::uuid, lead.division_id), idea_title=p->>'idea_title', idea_no=p->>'idea_no',
      approved_on = nullif(p->>'approved_on','')::date, results_doc = p->>'results_doc',
      is_team = coalesce((p->>'is_team')::boolean,false), team = coalesce(p->'team','[]'), people = v_people, amount = v_prize, updated_at=now()
    where id = v_id and track='innovator' and status in ('review','needs_info') returning * into n;
    if not found then raise exception 'لا يمكن تعديل النتيجة بعد اعتمادها'; end if;
  end if;
  perform _log(n,'save_innovator',null,null);
  return n.id;
end $$;

revoke execute on function _budget_div(uuid) from public, anon, authenticated;
