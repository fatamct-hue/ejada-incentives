-- 013: يصل الترشيح بعد الإرسال مباشرة إلى جهة الاعتماد (بلا خطوة استلام من فريق الإجادة)،
-- وفريق الإجادة للمتابعة والمؤشرات. الشاهد اختياري في خدمة المستفيدين وإلزامي في المبادر.
-- الحالات: مسودة ← قيد المراجعة (بانتظار اعتماد الجهة) ← معتمد ← أُحيل للصرف ← تم التكريم، و«يحتاج استكمال» بسبب إلزامي من جهة الاعتماد.

update nominations set status = 'review' where status = 'sent';

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
    if n.track = 'initiator' then
      select count(*) into att from attachments where nomination_id = n.id;
      if att < 1 then raise exception 'شاهد واحد على الأقل إلزامي في مسار المبادر'; end if;
      select * into ys from year_settings where year = n.year;
      if coalesce(n.initiative_title,'') = '' then raise exception 'عنوان المبادرة إلزامي'; end if;
      if coalesce(n.amount,0) <= 0 then raise exception 'المبلغ المقترح إلزامي'; end if;
      if n.amount < ys.initiator_min or n.amount > ys.initiator_max then raise exception 'مبلغ المبادر للموظف الواحد بين % و% ر.ع', ys.initiator_min::int, ys.initiator_max::int; end if;
      alloc := _allocation(n.division_id, n.year);
      if n.amount + _committed(n.division_id, n.year, n.id) > alloc then raise exception 'المبلغ يتجاوز الرصيد السنوي المتاح'; end if;
    end if;
    update nominations set status='review', submitted_by_name = pr.full_name, submitted_at = now(), needs_info_reason = null, updated_at = now()
      where id = n.id returning * into n;

  elsif p_action = 'needs_info' then
    if coalesce(trim(p_note),'') = '' then raise exception 'سبب الإعادة إلزامي'; end if;
    if old <> 'review' then raise exception 'حالة غير صالحة'; end if;
    if pr.role <> approver then raise exception 'الإعادة للاستكمال من جهة الاعتماد'; end if;
    update nominations set status='needs_info', needs_info_reason = p_note, updated_at=now() where id = n.id returning * into n;

  elsif p_action = 'approve' then
    if pr.role <> approver then raise exception 'الاعتماد من اختصاص الجهة المعنية بالمسار'; end if;
    if old <> 'review' then raise exception 'حالة غير صالحة للاعتماد'; end if;
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
