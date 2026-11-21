-- جدول المخصصات: المبادر (محسوب أو يدوي) + خدمة المستفيدين + المبتكر لكل مديرية.
-- التنفيذ الفعلي طُبّق على Supabase؛ هذا الملف مرجع للنقل. (انظر الدوال: _calc_base, compute_allocations, budget_table, budget_summary)
alter table division_years add column if not exists initiator_override numeric(12,3);
-- راجع المستودع (supabase/migrations/006_budget_table_full.sql) للتعريفات الكاملة.
