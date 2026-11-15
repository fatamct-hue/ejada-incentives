\set ON_ERROR_STOP off
\set QUIET on
create or replace function as_user(e text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claims', json_build_object('email',e)::text, false); end $$;
\echo '--- DG A يرى ترشيحاته فقط'
set role authenticated;
select as_user('dga@t');
select count(*) as dga_sees_divisions_budget from division_budget(2026);
select * from lookup_employee('E2');   -- يجب ألا يرجع شيئاً
select * from lookup_employee('E1');
select save_nomination(jsonb_build_object('track','service','period',1,'year',2026,'emp_no','E1','direct_manager','م',
  'justification','مسوغات','scores',(select jsonb_object_agg(id::text,9) from criteria where track='service'))) as nom_a \gset
\echo '--- إرسال بدون شاهد يجب أن يفشل'
select transition_nomination(:'nom_a','submit');
reset role;
insert into attachments(nomination_id,path,file_name) values (:'nom_a','x','x');
set role authenticated; select as_user('dga@t');
select (transition_nomination(:'nom_a','submit')).status as after_submit;
\echo '--- DG B لا يرى ترشيح A (عبر الاستعلام المباشر)'
select as_user('dgb@t');
select count(*) as b_sees_a_nominations from nominations;
select * from lookup_employee('E1');
\echo '--- موظف من خارج التقسيم يُرفض'
select save_nomination(jsonb_build_object('track','service','period',1,'year',2026,'emp_no','E1'));
\echo '--- الاعتماد من جهة خاطئة'
select as_user('ej@t'); select (transition_nomination(:'nom_a','receive')).status;
select (transition_nomination(:'nom_a','recommend')).status;
select transition_nomination(:'nom_a','approve');   -- إجادة لا تعتمد
select as_user('fin@t'); select transition_nomination(:'nom_a','approve');  -- مالية لا تعتمد خدمة
select as_user('dev@t'); select (transition_nomination(:'nom_a','approve')).status as approved;
\echo '--- إعادة للاستكمال بدون سبب'
select as_user('ej@t'); select transition_nomination(:'nom_a','needs_info','');
\echo '--- مسار المبادر: تجاوز الرصيد'
reset role; insert into criteria(track,group_title,group_ord,ord,label) select 'initiator','x',1,99,'x' where false;
set role authenticated; select as_user('dga@t');
select save_nomination(jsonb_build_object('track','initiator','period',1,'year',2026,'emp_no','E1','direct_manager','م',
  'justification','م','initiative_title','ع','amount',999999,'scores',(select jsonb_object_agg(id::text,9) from criteria where track='initiator'))) as nom_i \gset
reset role; insert into attachments(nomination_id,path,file_name) values (:'nom_i','x','x'); set role authenticated; select as_user('dga@t');
select transition_nomination(:'nom_i','submit');
\echo '--- منع الاعتماد في مسارين (E1 معتمد في الخدمة)'
reset role; update nominations set amount=100 where id=:'nom_i'; set role authenticated; select as_user('dga@t');
select (transition_nomination(:'nom_i','submit')).status as init_sent;
select as_user('ej@t'); select (transition_nomination(:'nom_i','recommend')).status;
select as_user('fin@t'); select transition_nomination(:'nom_i','approve');
select as_user('ej@t'); select count(*) as conflict_rows from find_conflicts(2026);
\echo '--- الكتابة المباشرة ممنوعة'
select as_user('dga@t'); update nominations set status='honored'; delete from nominations;
insert into nominations(year,track,period,division_id,emp_no,emp_name) values (2026,'service',1,(select division_id from profiles limit 1),'E1','x');
\echo '--- فائز ثانٍ للجهة نفسها'
reset role; insert into employees select 'E3','ثالث','م',division_id from employees where emp_no='E1';
select save_nomination(jsonb_build_object('track','service','period',1,'year',2026,'emp_no','E3','direct_manager','م','justification','م',
 'scores',(select jsonb_object_agg(id::text,5) from criteria where track='service'))) as nom_2 \gset
