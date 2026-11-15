-- اختبارات القواعد على الخادم. تُشغَّل على قاعدة محلية بعد محاكاة Supabase.
\set ON_ERROR_STOP off
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
grant all on storage.objects to authenticated;

-- بيانات الاختبار (تُنشأ ثم تُرجع بـ ROLLBACK)
begin;
insert into divisions(name,is_service,governorate) values ('A',true,'x'),('B',true,'y'),('C',false,'z'),('G',true,'x');
update divisions set parent_id=(select id from divisions where name='A'), counted_in_parent=true where name='G';
insert into division_years select id,2026,case name when 'A' then 100 when 'B' then 233 when 'C' then 71 else 30 end from divisions;
update year_settings set approved_headcount=1000 where year=2026;
insert into profiles(email,full_name,role,division_id) select 'dga@t','DG A','dg',id from divisions where name='A';
insert into profiles(email,full_name,role,division_id) select 'dgb@t','DG B','dg',id from divisions where name='B';
insert into profiles(email,full_name,role) values ('ej@t','Ejada','ejada'),('dev@t','Dev','dev'),('fin@t','Fin','admin_fin');
insert into employees select 'E1','موظف أ','مسمى',id from divisions where name='A';
insert into employees select 'E2','موظف ب','مسمى',id from divisions where name='B';
select init_year(2026) where false;
insert into cycles(year,track,period,is_open) select 2026,t,1,true from unnest(enum_range(null::track_kind)) t;

\echo == allocation sum equals remaining
select sum(allocation) as sum_alloc, count(*) from compute_allocations(2026);
select (15*1000 - 16800*0) as note;  -- (قيمة توضيحية)
commit;
