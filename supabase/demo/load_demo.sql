-- بيانات تجريبية للعرض فقط. كل سجل عليه is_demo = true. للحذف: شغّل unload_demo.sql
-- المستخدمون التجريبيون بعناوين فرعية (+) من بريد واحد تصل كلها إلى صندوق بريدك:
--   fatamct+dg1@gmail.com  مدير عام مسقط      | fatamct+dg2@gmail.com  مدير عام ظفار
--   fatamct+dev@gmail.com  التطوير والدراسات   | fatamct+fin@gmail.com  الشؤون الإدارية والمالية
-- (أُنشئ لهم حسابات Auth مؤكدة، فيدخلون برمز يصل إلى البريد الأصلي)

insert into divisions (name, governorate, is_service, is_demo) values
 ('[تجريبي] مديرية مسقط','مسقط',true,true), ('[تجريبي] مديرية ظفار','ظفار',true,true), ('[تجريبي] مديرية الداخلية','الداخلية',true,true),
 ('[تجريبي] دائرة خدمة المراجعين','مسقط',true,true), ('[تجريبي] المديرية العامة للتطوير والدراسات','مسقط',true,true),
 ('[تجريبي] دائرة نظم المعلومات الجغرافية','مسقط',true,true), ('[تجريبي] دائرة الشؤون المالية','مسقط',false,true);
update divisions set parent_id = (select id from divisions where name='[تجريبي] المديرية العامة للتطوير والدراسات'), counted_in_parent = true
 where name = '[تجريبي] دائرة نظم المعلومات الجغرافية';
insert into division_years (division_id, year, headcount, reference_date)
 select id, 2026, case name when '[تجريبي] مديرية مسقط' then 360 when '[تجريبي] مديرية ظفار' then 280 when '[تجريبي] مديرية الداخلية' then 300
   when '[تجريبي] دائرة خدمة المراجعين' then 120 when '[تجريبي] المديرية العامة للتطوير والدراسات' then 180
   when '[تجريبي] دائرة نظم المعلومات الجغرافية' then 50 else 90 end, '2026-01-01' from divisions where is_demo;
insert into outlets (division_id, name, is_demo) select id, o, true from divisions, unnest(case name
   when '[تجريبي] المديرية العامة للتطوير والدراسات' then array['مركز الاتصال','فريق تجاوب']
   when '[تجريبي] دائرة نظم المعلومات الجغرافية' then array['الدعم الفني التقني'] else array[]::text[] end) o where is_demo;
update year_settings set approved_headcount = 1330, reference_date = '2026-01-01', headcount_is_demo = true where year = 2026 and approved_headcount is null;

insert into employees (emp_no, name, title, division_id, is_demo)
 select 'D' || (1000 + row_number() over (order by d.name, n)), 'موظف تجريبي ' || (row_number() over (order by d.name, n)), 'أخصائي', d.id, true
 from divisions d, generate_series(1,3) n where d.is_demo;

insert into profiles (email, full_name, role, division_id, is_demo)
 select 'fatamct+dg1@gmail.com','مدير عام مسقط (تجريبي)','dg',id,true from divisions where name='[تجريبي] مديرية مسقط';
insert into profiles (email, full_name, role, division_id, is_demo)
 select 'fatamct+dg2@gmail.com','مدير عام ظفار (تجريبي)','dg',id,true from divisions where name='[تجريبي] مديرية ظفار';
insert into profiles (email, full_name, role, is_demo) values
 ('fatamct+dev@gmail.com','التطوير والدراسات (تجريبي)','dev',true), ('fatamct+fin@gmail.com','الشؤون الإدارية والمالية (تجريبي)','admin_fin',true);

-- حسابات Auth مؤكدة للمستخدمين التجريبيين (تُحذف في unload_demo.sql)
insert into auth.users (instance_id,id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,
  confirmation_token,recovery_token,email_change_token_new,email_change,email_change_token_current,phone_change,phone_change_token,reauthentication_token)
 select '00000000-0000-0000-0000-000000000000', gen_random_uuid(),'authenticated','authenticated', e, now(),
  '{"provider":"email","providers":["email"]}','{}', now(), now(), '','','','','','','',''
 from unnest(array['fatamct+dg1@gmail.com','fatamct+dg2@gmail.com','fatamct+dev@gmail.com','fatamct+fin@gmail.com']) e
 where not exists (select 1 from auth.users u where lower(u.email)=lower(e));
insert into auth.identities (provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
 select u.id::text, u.id, jsonb_build_object('sub',u.id::text,'email',u.email,'email_verified',true), 'email', now(), now(), now()
 from auth.users u where u.email like 'fatamct+%@gmail.com' and not exists (select 1 from auth.identities i where i.user_id=u.id);

-- الدورات (المفتوحة: خدمة والمبادر للربعين الأول والثاني، والمبتكر للنصف الأول)
insert into cycles (year, track, period, is_open)
 select 2026, t, p, (t <> 'innovator' and p <= 2) or (t = 'innovator' and p = 1)
 from (values ('service'::track_kind,1),('service',2),('service',3),('service',4),('initiator',1),('initiator',2),('initiator',3),('initiator',4),('innovator',1),('innovator',2)) v(t,p)
 on conflict (year, track, period) do nothing;

-- ترشيحات في مراحل مختلفة
create temp table _d as select e.emp_no, e.name, e.division_id, d.name dname, row_number() over (partition by e.division_id order by e.emp_no) k from employees e join divisions d on d.id=e.division_id where e.is_demo;
create temp table _s as select jsonb_object_agg(id::text, 9) j from criteria where track='service';
create temp table _i as select jsonb_object_agg(id::text, 8) j from criteria where track='initiator';
insert into nominations (year,track,period,division_id,emp_no,emp_name,job_title,direct_manager,status,scores,total,justification,initiative_title,amount,
    rank,idea_title,idea_no,approved_on,people,submitted_by_name,submitted_at,approved_by,approved_at,paid_on,honored_on,needs_info_reason,is_demo)
 select 2026,x.t::track_kind,x.p,d.division_id,d.emp_no,d.name,'أخصائي','مدير الدائرة',x.st::nom_status,
   case when x.t='service' then (select j from _s) when x.t='initiator' then (select j from _i) else '{}' end, x.tot, 'تميز في الأداء وإنجاز العمل بدقة وجودة عالية.',
   x.title, x.amt, x.rk, x.idea, x.ideano, x.apd, array[d.emp_no], 'مدير عام (تجريبي)', now() - interval '20 days',
   case when x.st in ('approved','to_pay','paid','honored') then 'معتمد (تجريبي)' end, case when x.st in ('approved','to_pay','paid','honored') then now() - interval '10 days' end,
   case when x.st in ('paid','honored') then date '2026-04-20' end, case when x.st = 'honored' then date '2026-04-30' end, x.why, true
 from (values
  ('service',1,'[تجريبي] مديرية مسقط',1,'honored',92,null,null::numeric,null::int,null,null,null::date,null),
  ('service',1,'[تجريبي] مديرية ظفار',1,'approved',88,null,null,null,null,null,null,null),
  ('service',1,'[تجريبي] مديرية الداخلية',1,'recommended',85,null,null,null,null,null,null,null),
  ('service',2,'[تجريبي] مديرية مسقط',2,'sent',90,null,null,null,null,null,null,null),
  ('service',2,'[تجريبي] مديرية ظفار',2,'needs_info',70,null,null,null,null,null,null,'يرجى إرفاق شاهد إضافي يدعم المسوغات'),
  ('initiator',1,'[تجريبي] مديرية مسقط',3,'approved',80,'أتمتة طلبات الفحص',400,null,null,null,null,null),
  ('initiator',1,'[تجريبي] مديرية ظفار',3,'recommended',80,'دليل الإجراءات المبسط',250,null,null,null,null,null),
  ('innovator',1,'[تجريبي] مديرية الداخلية',2,'recommended',0,null,500,1,'نظام تنبيه ذكي للمعاملات','NB-102',date '2026-06-10',null)
 ) x(t,p,dn,k,st,tot,title,amt,rk,idea,ideano,apd,why)
 join _d d on d.dname = x.dn and d.k = x.k;
insert into nomination_events (nomination_id, actor_name, actor_role, action, to_status)
 select id, 'تحميل تجريبي', 'ejada', 'demo_seed', status from nominations where is_demo;
