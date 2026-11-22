-- 012: ضوابط مبلغ المبادر (حد أدنى وأقصى للموظف)، وخطوتان بعد الاعتماد (أُحيل للصرف ثم تم التكريم)، وتنبيه من سبق اعتماده/تكريمه.
-- الصرف الفعلي يتم خارج المنصة؛ فريق الشؤون الإدارية والمالية يستخرج الكشف ويصنّف الحافز «أُحيل للصرف».

alter table year_settings add column if not exists initiator_min numeric(10,3) not null default 50;
alter table year_settings add column if not exists initiator_max numeric(10,3) not null default 300;

-- لا توجد خطوة «صُرف»: ما كان كذلك يصبح «أُحيل للصرف»
update nominations set status = 'to_pay' where status = 'paid';
delete from nomination_events where action = 'pay';
update nominations set amount = 50 + (abs(hashtext(emp_no)) % 26) * 10 where is_demo and track = 'initiator' and (amount > 300 or amount < 50);

-- تنبيه سبق اعتماده/تكريمه (الموظف ضمن تقسيم المدير العام فقط)
create or replace function employee_honors(p_emp_no text, p_exclude uuid default null)
returns table (year int, track track_kind, period int, rank int, status nom_status, amount numeric, honored_on date)
language sql stable security definer set search_path = public as $$
  select n.year, n.track, n.period, n.rank, n.status, n.amount, n.honored_on from nominations n
  where trim(p_emp_no) = any(n.people) and n.status in ('approved','to_pay','paid','honored') and n.id is distinct from p_exclude
    and (my_role() in ('ejada','dev','admin_fin')
         or (my_role() = 'dg' and exists (select 1 from employees e where e.emp_no = trim(p_emp_no) and e.division_id = my_division())))
  order by n.year desc, n.period
$$;
revoke execute on function employee_honors(text, uuid) from public, anon;
grant execute on function employee_honors(text, uuid) to authenticated;

-- المحال للصرف = أُحيل للصرف + مكرَّم (الأعمدة paid/unpaid باقية للتوافق: paid = المحال، unpaid = بانتظار الإحالة)
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
           coalesce(sum(n.amount) filter (where n.status in ('to_pay','paid','honored')), 0) paid,
           coalesce(sum(n.amount) filter (where n.status = 'approved'), 0) unpaid
    from nominations n where _budget_div(n.division_id) = d.id and n.year = p_year and n.track = 'initiator') i
  where d.active and not d.counted_in_parent
    and (my_role() in ('ejada','admin_fin') or (my_role() = 'dg' and d.id = _budget_div(my_division())))
  order by d.name
$$;

-- حفظ المسودة: مبلغ المبادر بين الحد الأدنى والأقصى للموظف الواحد
create or replace function save_nomination(p jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare pr profiles; n nominations; v_id uuid := nullif(p->>'id','')::uuid; e employees; c cycles; ys year_settings;
        v_track track_kind := (p->>'track')::track_kind; v_period int := (p->>'period')::int; v_year int := (p->>'year')::int;
        v_total int := 0; k text; sc int; mx int; v_amount numeric := nullif(p->>'amount','')::numeric;
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
  select * into ys from year_settings where year = v_year;
  if ys.closed then raise exception 'السنة مقفلة'; end if;
  if v_track = 'initiator' and v_amount is not null and (v_amount < ys.initiator_min or v_amount > ys.initiator_max) then
    raise exception 'مبلغ المبادر للموظف الواحد بين % و% ر.ع', trim(trailing '.' from trim(trailing '0' from ys.initiator_min::text)), trim(trailing '.' from trim(trailing '0' from ys.initiator_max::text)); end if;
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
      v_amount, array[e.emp_no], pr.id)
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
      beneficiaries = p->>'beneficiaries', amount = v_amount, people = array[e.emp_no], updated_at = now()
    where id = v_id returning * into n;
    perform _log(n,'save_draft',n.status,null);
  end if;
  return n.id;
end $$;

-- الانتقالات: بعد الاعتماد خطوتان فقط (أُحيل للصرف ← تم التكريم)
create or replace function transition_nomination(p_id uuid, p_action text, p_note text default null, p_date date default null)
returns nominations language plpgsql security definer set search_path = public as $$
declare pr profiles; n nominations; old nom_status; ncrit int; nscored int; att int; approver user_role; alloc numeric; quota int; ys year_settings;
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
      select * into ys from year_settings where year = n.year;
      if coalesce(n.initiative_title,'') = '' then raise exception 'عنوان المبادرة إلزامي'; end if;
      if coalesce(n.amount,0) <= 0 then raise exception 'المبلغ المقترح إلزامي'; end if;
      if n.amount < ys.initiator_min or n.amount > ys.initiator_max then raise exception 'مبلغ المبادر للموظف الواحد بين % و% ر.ع', ys.initiator_min::int, ys.initiator_max::int; end if;
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
    update nominations set status='to_pay', paid_on = coalesce(p_date, current_date), updated_at=now() where id = n.id returning * into n;

  elsif p_action = 'honor' then
    if pr.role <> 'ejada' or old <> 'to_pay' then raise exception 'التكريم يسجله فريق الإجادة بعد الإحالة للصرف'; end if;
    update nominations set status='honored', honored_on = coalesce(p_date, current_date), updated_at=now() where id = n.id returning * into n;
  else
    raise exception 'إجراء غير معروف';
  end if;
  perform _log(n, p_action, old, p_note);
  return n;
end $$;
