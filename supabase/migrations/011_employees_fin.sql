-- 011: المديرية العامة للشؤون الإدارية والمالية تدير سجل الموظفين
create policy emp_fin on employees for all using (my_role() = 'admin_fin') with check (my_role() = 'admin_fin');
