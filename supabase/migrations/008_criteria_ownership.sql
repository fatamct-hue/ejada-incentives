-- جهة اعتماد كل مسار تدير معايير تقييمه (المحاور والأسئلة والأوزان)
create policy criteria_dev on criteria for all using (my_role() = 'dev' and track = 'service') with check (my_role() = 'dev' and track = 'service');
create policy criteria_fin on criteria for all using (my_role() = 'admin_fin' and track = 'initiator') with check (my_role() = 'admin_fin' and track = 'initiator');
alter table criteria add constraint criteria_weight_chk check (max_score between 1 and 100);
update criteria set group_title = trim(regexp_replace(group_title, '\s*\(\d+\)\s*$', ''));
