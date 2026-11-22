-- يحذف كل البيانات التجريبية دون المساس بالحقيقية.
-- ملاحظة: التقسيمات الحقيقية (22 تقسيماً من ملف الوزارة) لا تُحذف لأنها ليست تجريبية.
delete from access_requests where email like '%@example.test';
delete from nomination_events where nomination_id in (select id from nominations where is_demo);
delete from attachments where nomination_id in (select id from nominations where is_demo);
delete from nominations where is_demo
   or emp_no in (select emp_no from employees where is_demo)
   or division_id in (select id from divisions where is_demo);
delete from profiles where is_demo;
delete from auth.identities where user_id in (select id from auth.users where email like 'fatamct+%@gmail.com');
delete from auth.users where email like 'fatamct+%@gmail.com';
delete from employees where is_demo;
delete from outlets where is_demo;
delete from division_years where division_id in (select id from divisions where is_demo);
delete from divisions where is_demo;
update year_settings set approved_headcount = null, reference_date = null where headcount_is_demo;
update year_settings set headcount_is_demo = false;
