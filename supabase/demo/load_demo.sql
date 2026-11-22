-- بيانات تجريبية موسّعة للعرض (is_demo = true). تُحمَّل فوق الهيكل الحقيقي للتقسيمات، ويمكن إعادة تشغيلها (تستبدل التجريبي السابق).
-- للحذف: شغّل unload_demo.sql
-- الأسماء مختلقة، وكل سجل تجريبي موسوم بـ is_demo ولا يمس البيانات الحقيقية.
do $$
declare
  firsts text[] := array['سالم','خالد','ناصر','سعيد','حمد','يوسف','محمد','عبدالله','أحمد','علي','راشد','سلطان','مريم','فاطمة','أمل','هدى','ليلى','زينب','سلمى','نورة','آمنة','شيخة'];
  fathers text[] := array['علي','سالم','حمد','ناصر','سعيد','خلفان','راشد','سلطان','محمد','خميس'];
  families text[] := array['الحارثي','البلوشي','الرواحي','السعدي','الكندي','المعمري','الهنائي','الشكيلي','العامري','البوسعيدي','المقبالي','الريامي','الفارسي','الجابري'];
  titles text[] := array['أخصائي خدمات','مشرف قسم','أخصائي أول','فني','أخصائي','مساعد إداري'];
  ini_titles text[] := array['أتمتة طلبات الفحص','دليل الإجراءات المبسط','لوحة متابعة الأداء','تبسيط نموذج الطلبات','تحسين زمن الاستجابة','الأرشفة الرقمية للمعاملات','برنامج تدريب الزملاء الجدد','قاعدة المعرفة الداخلية','تحسين مسار الشكاوى','تقرير الإنجاز الأسبوعي','مبادرة الاجتماعات الفعّالة','تحديث دليل الخدمات','فرز المعاملات الذكي','تبادل الخبرات بين الأقسام','قياس رضا المراجعين','تقليل استهلاك الورق','حل مشكلة تكرار الطلبات','تنظيم الأرشيف الفني','تسريع إصدار الشهادات','بوابة متابعة الطلبات','نموذج التقييم السريع'];
  st_s1 text[] := array['honored','honored','honored','honored','honored','honored','honored','paid','paid','to_pay','approved','approved','review','review'];
  st_s2 text[] := array['sent','sent','sent','sent','review','review','review','review','needs_info','draft','draft','approved','review','sent'];
  st_i1 text[] := array['honored','paid','paid','to_pay','approved','approved','approved','review','review'];
  st_i2 text[] := array['review','review','sent','sent','draft','needs_info'];
begin
  -- 0) تنظيف التجريبي السابق
  delete from nominations where is_demo or emp_no in (select emp_no from employees where is_demo);
  delete from employees where is_demo;
  delete from access_requests where email like '%@example.test';

  -- 1) موظفون: 6 لكل تقسيم (أرقام وظيفية D1001...)
  insert into employees (emp_no, name, title, division_id, is_demo)
  select 'D' || (1000 + s), firsts[1 + (s * 7) % 22] || case when 1 + (s * 7) % 22 > 12 then ' بنت ' else ' بن ' end || fathers[1 + (s * 3) % 10] || ' ' || families[1 + (s * 5) % 14],
         titles[1 + s % 6], did, true
  from (select d.id did, (row_number() over (order by d.name, k))::int s from divisions d cross join generate_series(1, 6) k where d.active) x;

  create temp table _e on commit drop as select e.emp_no, e.name, e.title, e.division_id, (row_number() over (partition by e.division_id order by e.emp_no))::int k from employees e where e.is_demo;
  create temp table _sv on commit drop as select id, name, (row_number() over (order by name))::int sr from divisions where active and is_service;
  create temp table _bd on commit drop as select id, name, (row_number() over (order by name))::int ir from divisions where active and not counted_in_parent;
  create temp table _sc on commit drop as
    select e.emp_no, t.track, jsonb_object_agg(c.id::text, v.v) scores, sum(v.v)::int total
    from _e e cross join (values ('service'), ('initiator')) t(track)
    join criteria c on c.track = t.track::track_kind and c.active
    cross join lateral (select greatest(1, round(c.max_score * (0.62 + (abs(hashtext(e.emp_no || c.id::text)) % 36) / 100.0)))::int v) v
    group by e.emp_no, t.track;

  -- 2) خطة الترشيحات
  create temp table _plan (track track_kind, period int, division_id uuid, k int, status nom_status, amount numeric, title text, rk int, idea text, ideano text, team boolean default false, why text) on commit drop;
  insert into _plan (track, period, division_id, k, status) select 'service'::track_kind, 1, sv.id, 1, st_s1[sv.sr::int]::nom_status from _sv sv;
  insert into _plan (track, period, division_id, k, status, why) select 'service'::track_kind, 2, sv.id, 2, st_s2[sv.sr::int]::nom_status, case when st_s2[sv.sr::int] = 'needs_info' then 'يرجى إرفاق شاهد إضافي يدعم المسوغات' end from _sv sv;
  insert into _plan (track, period, division_id, k, status, amount, title)
    select 'initiator'::track_kind, 1, b.id, 3, st_i1[b.ir::int]::nom_status, 200 + (abs(hashtext(b.name)) % 45) * 10, ini_titles[b.ir::int] from _bd b where b.ir <= 9;
  insert into _plan (track, period, division_id, k, status, amount, title, why)
    select 'initiator'::track_kind, 2, b.id, 4, st_i2[(b.ir - 9)::int]::nom_status, 150 + (abs(hashtext(b.name)) % 40) * 10, ini_titles[b.ir::int],
           case when st_i2[(b.ir - 9)::int] = 'needs_info' then 'يرجى توضيح الأثر القابل للقياس' end
    from _bd b where b.ir between 10 and 15;
  -- حالة تعارض مسارات: الموظف نفسه مرشّح في خدمة المستفيدين والمبادر في الربع الثاني
  insert into _plan (track, period, division_id, k, status, amount, title)
    select 'initiator'::track_kind, 2, p.division_id, 2, 'sent'::nom_status, 300, 'مبادرة موازية لنفس الموظف' from _plan p where p.track = 'service' and p.period = 2 and p.status in ('sent','review') order by p.division_id limit 1;
  -- المبتكر (النصف الأول): فردي، وفريق، وفردي
  insert into _plan (track, period, division_id, k, status, rk, title, idea, ideano, team)
    select 'innovator'::track_kind, 1, d.id, 5, v.st::nom_status, v.rk, null, v.idea, v.no, v.team
    from (values ('المديرية العامة للإسكان والتخطيط العمراني (الداخلية)', 1, 'approved', 'نظام تنبيه ذكي لاستحقاق المعاملات', 'NB-102', false),
                 ('المديرية العامة للتخطيط العمراني', 2, 'review', 'لوحة تحليل مكاني تفاعلية للمخططات', 'NB-118', true),
                 ('المديرية العامة للأراضي', 3, 'review', 'أتمتة مطابقة الإحداثيات مع السجل', 'NB-127', false)) v(dn, rk, st, idea, no, team)
    join divisions d on d.name = v.dn;

  -- 3) الترشيحات
  insert into nominations (year, track, period, division_id, emp_no, emp_name, job_title, direct_manager, status, scores, total, justification, initiative_title, initiative_date, beneficiaries, amount,
      rank, idea_title, idea_no, approved_on, is_team, team, people, submitted_by_name, submitted_at, committee_by, committee_at, approved_by, approved_at, fin_by, fin_at, paid_on, honored_on, needs_info_reason, is_demo, created_at, updated_at)
  select 2026, p.track, p.period, p.division_id, e.emp_no, e.name, e.title, 'مدير الدائرة', p.status,
    case when p.track = 'innovator' then '{}'::jsonb else coalesce(sc.scores, '{}'::jsonb) end,
    case when p.track = 'innovator' then 0 else coalesce(sc.total, 0) end,
    case p.track when 'service' then 'تميّز في إنجاز المعاملات بدقة وسرعة، ونال إشادة المستفيدين خلال الربع.'
                 when 'initiator' then 'بادر بتنفيذ عمل خارج مهامه المعتادة، فحقق أثراً ملموساً في جودة العمل وتقليل الوقت.'
                 else 'فكرة معتمدة نتائجها في منصة «نبتكر»، تحسّن الأداء وتخفّض التكلفة.' end,
    p.title, case when p.track = 'initiator' then date '2026-01-20' + (p.period - 1) * 90 end,
    case when p.track = 'initiator' then 'فريق العمل والمستفيدون من الخدمة' end,
    case when p.track = 'innovator' then (select (innovator_prizes ->> p.rk::text)::numeric from year_settings where year = 2026)
         when p.track = 'service' then (select service_award from year_settings where year = 2026) else p.amount end,
    p.rk, p.idea, p.ideano, case when p.track = 'innovator' then date '2026-06-10' end, p.team,
    case when p.team then jsonb_build_array(jsonb_build_object('emp_no', m1.emp_no, 'share', 120), jsonb_build_object('emp_no', m2.emp_no, 'share', 120)) else '[]'::jsonb end,
    array[e.emp_no] || case when p.team then array[m1.emp_no, m2.emp_no] else '{}'::text[] end,
    case when p.track = 'innovator' then 'فريق الإجادة المؤسسية' else 'مدير عام (تجريبي)' end,
    b.base::timestamptz,
    case when p.status in ('review','approved','to_pay','paid','honored') then 'فريق الإجادة المؤسسية' end,
    case when p.status in ('review','approved','to_pay','paid','honored') then (b.base + 2)::timestamptz end,
    case when p.status in ('approved','to_pay','paid','honored') then case when p.track = 'initiator' then 'جهة اعتماد المبادر والصرف' else 'جهة اعتماد خدمة المستفيدين والمبتكر' end end,
    case when p.status in ('approved','to_pay','paid','honored') then (b.base + 5)::timestamptz end,
    case when p.track = 'initiator' and p.status in ('approved','to_pay','paid','honored') then 'جهة اعتماد المبادر والصرف' end,
    case when p.track = 'initiator' and p.status in ('approved','to_pay','paid','honored') then (b.base + 5)::timestamptz end,
    case when p.status in ('paid','honored') then b.base + 12 end,
    case when p.status = 'honored' then b.base + 20 end,
    p.why, true, b.base::timestamptz, b.base::timestamptz
  from _plan p
  join _e e on e.division_id = p.division_id and e.k = p.k
  left join _sc sc on sc.emp_no = e.emp_no and sc.track = p.track::text
  left join _e m1 on p.team and m1.division_id = p.division_id and m1.k = 6
  left join _e m2 on p.team and m2.division_id = p.division_id and m2.k = 1
  cross join lateral (select (case p.period when 1 then date '2026-04-05' else date '2026-07-05' end) + (abs(hashtext(e.emp_no)) % 7) as base) b
  ;

  -- 4) سجل الإجراءات
  insert into nomination_events (nomination_id, actor_name, actor_role, action, from_status, to_status, at)
  select n.id, s.who, s.rl::user_role, s.act, s.f::nom_status, s.t::nom_status, n.submitted_at + s.dly
  from nominations n
  cross join lateral (values
    ('save_draft', 'مدير عام (تجريبي)', 'dg', null, 'draft', interval '-1 day', n.track <> 'innovator'),
    ('submit', 'مدير عام (تجريبي)', 'dg', 'draft', 'sent', interval '0', n.status <> 'draft' and n.track <> 'innovator'),
    ('needs_info', 'فريق الإجادة المؤسسية', 'ejada', 'sent', 'needs_info', interval '1 day', n.status = 'needs_info'),
    ('receive', 'فريق الإجادة المؤسسية', 'ejada', 'sent', 'review', interval '2 days', n.status in ('review','approved','to_pay','paid','honored') and n.track <> 'innovator'),
    ('save_innovator', 'فريق الإجادة المؤسسية', 'ejada', null, 'review', interval '0', n.track = 'innovator'),
    ('approve', case when n.track = 'initiator' then 'جهة اعتماد المبادر والصرف' else 'جهة اعتماد خدمة المستفيدين والمبتكر' end, case when n.track = 'initiator' then 'admin_fin' else 'dev' end, 'review', 'approved', interval '5 days', n.status in ('approved','to_pay','paid','honored')),
    ('to_pay', 'جهة اعتماد المبادر والصرف', 'admin_fin', 'approved', 'to_pay', interval '8 days', n.status in ('to_pay','paid','honored')),
    ('pay', 'جهة اعتماد المبادر والصرف', 'admin_fin', 'to_pay', 'paid', interval '12 days', n.status in ('paid','honored')),
    ('honor', 'فريق الإجادة المؤسسية', 'ejada', 'paid', 'honored', interval '20 days', n.status = 'honored')
  ) s (act, who, rl, f, t, dly, ok)
  where n.is_demo and s.ok;

  -- 5) طلبا انضمام معلّقان لعرض الشاشة
  insert into access_requests (full_name, email, phone, job_title, division_id, requested_role)
  select 'سيف بن خلفان البوسعيدي', 'saif@example.test', '99000011', 'مدير عام', (select id from divisions where name like '%(جنوب الباطنة)'), 'dg'::user_role
  union all select 'عائشة بنت سالم الهنائية', 'aisha@example.test', null, 'أخصائية متابعة', null::uuid, 'ejada'::user_role
  on conflict do nothing;

  -- 6) الدورات المفتوحة للتجربة
  update cycles set is_open = true where year = 2026 and ((track in ('service','initiator') and period <= 2) or (track = 'innovator' and period = 1));
end $$;
