-- بيانات تجريبية للعرض فقط. كل سجل عليه is_demo = true. للحذف: شغّل unload_demo.sql
-- تنبيه: بريد المستخدمين التجريبيين افتراضي؛ بدّله ببريد حقيقي لتجرب الدخول.
insert into divisions (name, governorate, is_service, is_demo) values
 ('[تجريبي] مديرية 1','مسقط',true,true), ('[تجريبي] مديرية 2','ظفار',true,true), ('[تجريبي] دائرة مركزية','مسقط',false,true);
insert into division_years (division_id, year, headcount) select id, 2026, case name when '[تجريبي] مديرية 1' then 120 when '[تجريبي] مديرية 2' then 90 else 40 end from divisions where is_demo;
update year_settings set approved_headcount = 250, headcount_is_demo = true where year = 2026 and approved_headcount is null;
insert into profiles (email, full_name, role, division_id, is_demo)
 select 'demo-dg1@example.test','مدير عام تجريبي 1','dg',id,true from divisions where name='[تجريبي] مديرية 1';
insert into profiles (email, full_name, role, division_id, is_demo)
 select 'demo-dg2@example.test','مدير عام تجريبي 2','dg',id,true from divisions where name='[تجريبي] مديرية 2';
insert into employees (emp_no, name, title, division_id, is_demo)
 select 'D'||n, 'موظف تجريبي '||n, 'مسمى تجريبي', (select id from divisions where name = case when n<=3 then '[تجريبي] مديرية 1' else '[تجريبي] مديرية 2' end), true
 from generate_series(1,6) n;
select init_year(2026) where false;
insert into cycles (year, track, period, is_open)
 select 2026, t, p, true from (values ('service'::track_kind,1),('initiator',1),('innovator',1)) v(t,p) on conflict do nothing;
