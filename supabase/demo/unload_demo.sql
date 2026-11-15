-- يحذف كل البيانات التجريبية دون المساس بالحقيقية
delete from nomination_events where nomination_id in (select id from nominations where is_demo);
delete from nominations where is_demo
   or emp_no in (select emp_no from employees where is_demo)
   or division_id in (select id from divisions where is_demo);
delete from profiles where is_demo;
delete from employees where is_demo;
delete from outlets where is_demo;
delete from division_years where division_id in (select id from divisions where is_demo);
delete from divisions where is_demo;
update year_settings set approved_headcount = null where headcount_is_demo;
update year_settings set headcount_is_demo = false;
