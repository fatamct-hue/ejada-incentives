-- =====================================================================
-- منصة حوافز الإجادة المؤسسية — تجهيز قاعدة البيانات (Supabase)
-- الصق هذا الملف كاملاً في SQL Editor ثم اضغط Run مرة واحدة.
-- آمن لإعادة التشغيل (يتخطى ما هو موجود).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- الجداول ----------
create table if not exists public.units (
  id text primary key,
  name text not null,
  short text not null,
  type text not null default 'central' check (type in ('regional','customer','central','office')),
  gov text default 'مسقط',
  parent_id text references public.units(id),
  in_parent boolean not null default false,      -- محسوب ضمن عدد التقسيم الأعلى (لا يُعد مرتين)
  bs boolean not null default false,             -- مشمول بخدمة المستفيدين
  employees integer not null default 0 check (employees >= 0),
  outlets text[] not null default '{}',
  active boolean not null default true
);

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,                           -- يُربط بحساب الدخول عند التفعيل
  email text,
  name text not null,
  role text not null check (role in ('central','dev','adm','dg')),
  unit_id text references public.units(id),
  invite_code text unique default upper(substr(md5(gen_random_uuid()::text),1,8)),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  check (role <> 'dg' or unit_id is not null)
);
create unique index if not exists app_users_one_dg_per_unit on public.app_users(unit_id) where role = 'dg';

create table if not exists public.years (
  year integer primary key,
  approved_total integer not null default 0,
  ref_date date,
  closing_confirmed text
);

create table if not exists public.cycles (
  year integer references public.years(year) on delete cascade,
  code text check (code in ('Q1','Q2','Q3','Q4','H1','H2')),
  close_date date,
  open boolean not null default true,
  primary key (year, code)
);

create table if not exists public.employees (
  emp_no text primary key,
  name text not null,
  title text,
  unit_id text references public.units(id)
);

create table if not exists public.nominations (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  track text not null check (track in ('bs','inv','mob')),
  cycle text not null check (cycle in ('Q1','Q2','Q3','Q4','H1','H2')),
  unit_id text not null references public.units(id),
  status text not null default 'draft' check (status in ('draft','sent','needs_info','review','recommended','approved','to_pay','paid','honored')),
  emp_no text, emp_name text, emp_title text, dept text, outlet text,
  scores integer[], score_ev text[],
  justification text, supervisor text,
  initiative text, exec_date date, benef text, proposed numeric(12,3),
  amount numeric(12,3) not null default 0,
  place integer, kind text, idea text, nb_ref text, members jsonb, approval_date date,
  evidence jsonb not null default '[]',
  return_reason text,
  prepared_by text, approved_by text,
  paid_at date, honored_at date,
  demo boolean not null default false,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists nominations_year_idx on public.nominations(year, track, cycle);
create index if not exists nominations_unit_idx on public.nominations(unit_id);
create index if not exists nominations_emp_idx on public.nominations(emp_no);

create table if not exists public.audit_log (
  id bigserial primary key,
  nomination_id uuid references public.nominations(id) on delete cascade,
  at timestamptz not null default now(),
  by_name text, action text, from_status text, to_status text, note text
);

create table if not exists public.pub_versions (
  id bigserial primary key,
  year integer, track text, cycle text, by_name text, at timestamptz default now(), count integer
);

-- ---------- دوال الهوية ----------
create or replace function public.me() returns public.app_users
language sql stable security definer set search_path = public as
$$ select * from public.app_users where user_id = auth.uid() limit 1 $$;

create or replace function public.me_role() returns text
language sql stable security definer set search_path = public as
$$ select role from public.app_users where user_id = auth.uid() limit 1 $$;

create or replace function public.me_unit() returns text
language sql stable security definer set search_path = public as
$$ select unit_id from public.app_users where user_id = auth.uid() limit 1 $$;

create or replace function public.me_name() returns text
language sql stable security definer set search_path = public as
$$ select coalesce(
   (select case role when 'dg' then 'المدير العام — ' || (select short from units where id = unit_id)
                     when 'central' then 'فريق الإجادة المؤسسية'
                     when 'dev' then 'م.ع للتطوير والدراسات'
                     when 'adm' then 'م.ع للشؤون الإدارية والمالية' end
           || ' (' || name || ')'
      from public.app_users where user_id = auth.uid()), 'غير معروف') $$;

-- تفعيل الحساب برمز الدعوة
create or replace function public.claim_invite(p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare r public.app_users; v_email text := lower(coalesce(auth.jwt()->>'email',''));
begin
  if auth.uid() is null then raise exception 'يجب تسجيل الدخول أولاً'; end if;
  if exists (select 1 from app_users where user_id = auth.uid()) then return 'ok'; end if;
  select * into r from app_users where invite_code = upper(trim(p_code)) and user_id is null;
  if not found then raise exception 'رمز التفعيل غير صحيح أو مستخدم'; end if;
  if r.email is not null and lower(r.email) <> v_email then
    raise exception 'هذا الرمز مخصص لبريد إلكتروني آخر';
  end if;
  update app_users set user_id = auth.uid(), email = coalesce(email, v_email), claimed_at = now() where id = r.id;
  return 'ok';
end $$;

-- ---------- حساب المخصص ----------
create or replace function public.unit_allocation(p_year integer, p_unit text) returns numeric
language sql stable security definer set search_path = public as $$
  with y as (select approved_total from years where year = p_year),
       s as (select sum(employees) e from units where active and not in_parent),
       mob as (select greatest(0, (select approved_total from y) * 15
                 - 300 * 4 * (select count(*) from units where active and (bs or type in ('regional','customer')))
                 - 2400) m)
  select case when (select e from s) > 0
    then round((select m from mob) * (select employees from units where id = p_unit and not in_parent) / (select e from s), 3)
    else 0 end
$$;

create or replace function public.unit_mob_committed(p_year integer, p_unit text, p_except uuid default null) returns numeric
language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount),0) from nominations
   where year = p_year and unit_id = p_unit and track = 'mob'
     and status in ('approved','to_pay','paid','honored') and (p_except is null or id <> p_except)
$$;

create or replace function public.emp_in_other_track(n public.nominations) returns text
language sql stable security definer set search_path = public as $$
  select x.track from nominations x
   where x.year = n.year and x.id <> n.id and x.track <> n.track
     and x.status in ('approved','to_pay','paid','honored')
     and (
       (x.track <> 'inv' and n.track <> 'inv' and x.emp_no = n.emp_no) or
       (x.track = 'inv' and n.track <> 'inv' and exists (select 1 from jsonb_array_elements(x.members) m where m->>'empNo' = n.emp_no)) or
       (n.track = 'inv' and x.track <> 'inv' and exists (select 1 from jsonb_array_elements(n.members) m where m->>'empNo' = x.emp_no))
     )
   limit 1
$$;

create or replace function public.log_action(p_id uuid, p_action text, p_from text, p_to text, p_note text)
returns void language sql security definer set search_path = public as
$$ insert into audit_log(nomination_id, by_name, action, from_status, to_status, note)
   values (p_id, public.me_name(), p_action, p_from, p_to, p_note) $$;

-- ---------- إرسال الترشيح من المدير العام ----------
create or replace function public.submit_nomination(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare n nominations; u units; bal numeric; was text;
begin
  select * into n from nominations where id = p_id for update;
  if not found then raise exception 'الترشيح غير موجود'; end if;
  if me_role() <> 'dg' or n.unit_id <> me_unit() then raise exception 'لا تملك صلاحية إرسال هذا الترشيح'; end if;
  if n.status not in ('draft','needs_info') then raise exception 'لا يمكن إرسال ترشيح بهذه الحالة'; end if;
  select * into u from units where id = n.unit_id;
  if n.track = 'bs' and not (u.bs or u.type in ('regional','customer')) then raise exception 'التقسيم غير مشمول بخدمة المستفيدين'; end if;
  if n.track not in ('bs','mob') then raise exception 'مسار غير صالح'; end if;
  if not coalesce((select open from cycles where year = n.year and code = n.cycle), false) and n.status = 'draft' then
    raise exception 'الدورة مغلقة لاستقبال الترشيحات'; end if;
  if coalesce(trim(n.emp_no),'') = '' or coalesce(trim(n.emp_name),'') = '' or coalesce(trim(n.emp_title),'') = '' then raise exception 'أكمل بيانات الموظف'; end if;
  if n.scores is null or array_length(n.scores,1) <> 10 or exists (select 1 from unnest(n.scores) s where s is null or s < 0 or s > 10) then
    raise exception 'أكمل درجات جميع المعايير الفرعية (من 0 إلى 10)'; end if;
  if coalesce(trim(n.justification),'') = '' then raise exception 'مسوغات الترشيح مطلوبة'; end if;
  if coalesce(trim(n.supervisor),'') = '' then raise exception 'اسم المسؤول المباشر مطلوب'; end if;
  if jsonb_array_length(n.evidence) = 0 then raise exception 'أرفق شاهداً واحداً على الأقل'; end if;
  if n.track = 'mob' then
    if coalesce(trim(n.initiative),'') = '' then raise exception 'عنوان المبادرة مطلوب'; end if;
    if coalesce(n.proposed,0) <= 0 then raise exception 'المبلغ المقترح مطلوب'; end if;
    bal := unit_allocation(n.year, n.unit_id) - unit_mob_committed(n.year, n.unit_id);
    if n.proposed > bal + 0.001 then raise exception 'المبلغ المقترح (%) يتجاوز رصيد التقسيم (%)', n.proposed, round(bal,3); end if;
  end if;
  was := n.status;
  perform set_config('app.rpc','1',true);
  update nominations set status = 'sent', return_reason = null, approved_by = me_name(), updated_at = now() where id = p_id;
  perform set_config('app.rpc','',true);
  perform log_action(p_id, case when was = 'needs_info' then 'استكمال وإعادة إرسال' else 'اعتماد المدير العام وإرسال' end, was, 'sent', null);
end $$;

-- ---------- انتقالات الحالة ----------
create or replace function public.transition(p_id uuid, p_to text, p_note text default null, p_date date default null)
returns void language plpgsql security definer set search_path = public as $$
declare n nominations; r text := me_role(); appr text; other text; bal numeric;
begin
  select * into n from nominations where id = p_id for update;
  if not found then raise exception 'الترشيح غير موجود'; end if;
  appr := case when n.track = 'mob' then 'adm' else 'dev' end;

  if p_to = 'review' and n.status = 'sent' and r = 'central' then null;
  elsif p_to = 'recommended' and n.status = 'review' and r = 'central' then null;
  elsif p_to = 'needs_info' and n.status in ('sent','review','recommended') and (r = 'central' or r = appr) then
    if coalesce(trim(p_note),'') = '' then raise exception 'سبب الإرجاع مطلوب'; end if;
    update nominations set return_reason = p_note where id = p_id;
  elsif p_to = 'approved' and n.status = 'recommended' and r = appr then
    other := emp_in_other_track(n);
    if other is not null then raise exception 'لا يمكن الاعتماد: الموظف معتمد في مسار آخر هذه السنة، ويحسم فريق الإجادة المسار'; end if;
    if n.track = 'bs' then
      if exists (select 1 from nominations where year = n.year and track = 'bs' and unit_id = n.unit_id and cycle = n.cycle
                 and status in ('approved','to_pay','paid','honored') and id <> n.id) then
        raise exception 'لا يمكن الاعتماد: يوجد فائز معتمد لهذه الجهة في الربع نفسه'; end if;
      update nominations set amount = 300 where id = p_id;
    elsif n.track = 'mob' then
      bal := unit_allocation(n.year, n.unit_id) - unit_mob_committed(n.year, n.unit_id, n.id);
      if coalesce(n.proposed,0) > bal + 0.001 then raise exception 'لا يمكن الاعتماد: المبلغ يتجاوز رصيد التقسيم (%)', round(bal,3); end if;
      update nominations set amount = n.proposed where id = p_id;
    end if;
  elsif p_to = 'to_pay' and n.status = 'approved' and r = 'adm' then null;
  elsif p_to = 'paid' and n.status = 'to_pay' and r = 'adm' then
    update nominations set paid_at = coalesce(p_date, current_date) where id = p_id;
  elsif p_to = 'honored' and n.status = 'paid' and r = 'central' then
    update nominations set honored_at = coalesce(p_date, current_date) where id = p_id;
  else
    raise exception 'إجراء غير مسموح لهذا الدور أو لهذه الحالة';
  end if;

  update nominations set status = p_to, updated_at = now() where id = p_id;
  perform set_config('app.rpc','',true);
  perform log_action(p_id, case p_to when 'review' then 'استلام للمراجعة' when 'recommended' then 'توصية بالاعتماد'
    when 'needs_info' then 'إعادة للاستكمال' when 'approved' then 'اعتماد' when 'to_pay' then 'إحالة للصرف'
    when 'paid' then 'تسجيل الصرف' when 'honored' then 'تسجيل التكريم' end, n.status, p_to, p_note);
end $$;

-- ---------- نتائج نبتكر ----------
create or replace function public.add_inv_result(p_year integer, p_cycle text, p_place integer, p_kind text, p_idea text,
  p_nb_ref text, p_unit text, p_members jsonb, p_approval_date date, p_doc jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare r text := me_role(); prize numeric; total numeric; new_id uuid; n nominations;
begin
  if r not in ('central','dev') then raise exception 'لا تملك صلاحية إدخال نتائج المبتكر'; end if;
  if p_cycle not in ('H1','H2') or p_place not in (1,2,3) then raise exception 'دورة أو مركز غير صالح'; end if;
  if exists (select 1 from nominations where year = p_year and track = 'inv' and cycle = p_cycle and place = p_place) then
    raise exception 'نتيجة هذا المركز مُدخلة مسبقاً'; end if;
  prize := case p_place when 1 then 500 when 2 then 400 else 300 end;
  select coalesce(sum((m->>'share')::numeric),0) into total from jsonb_array_elements(p_members) m;
  if jsonb_array_length(p_members) = 0 then raise exception 'أدخل الفائز'; end if;
  if total > prize then raise exception 'مجموع الحصص يتجاوز قيمة الجائزة (%)', prize; end if;
  insert into nominations(year, track, cycle, unit_id, status, place, kind, idea, nb_ref, members, approval_date, evidence,
     emp_no, emp_name, amount, prepared_by, approved_by)
  values (p_year, 'inv', p_cycle, p_unit, 'recommended', p_place, p_kind, p_idea, p_nb_ref, p_members, p_approval_date, coalesce(p_doc,'[]'),
     p_members->0->>'empNo',
     case when p_kind = 'team' then 'فريق: ' || (select string_agg(split_part(m->>'name',' ',1), ' و') from jsonb_array_elements(p_members) m) else p_members->0->>'name' end,
     prize, me_name(), 'منصة نبتكر')
  returning id into new_id;
  perform log_action(new_id, 'إدخال نتيجة معتمدة من نبتكر', null, 'recommended', null);
  if r = 'dev' then
    select * into n from nominations where id = new_id;
    if emp_in_other_track(n) is null then
      update nominations set status = 'approved' where id = new_id;
      perform log_action(new_id, 'اعتماد', 'recommended', 'approved', null);
    end if;
  end if;
  return new_id;
end $$;

-- ---------- قائمة الأعضاء للتقسيم (المدير العام يرى بيانات مستخدمي تقسيمه فقط) ----------
-- ---------- الصلاحيات (RLS) ----------
alter table public.units enable row level security;
alter table public.app_users enable row level security;
alter table public.years enable row level security;
alter table public.cycles enable row level security;
alter table public.employees enable row level security;
alter table public.nominations enable row level security;
alter table public.audit_log enable row level security;
alter table public.pub_versions enable row level security;

do $$ begin
  -- قراءة الإعدادات العامة لكل مستخدم مفعّل
  drop policy if exists units_read on public.units;          create policy units_read on public.units for select using (me_role() is not null);
  drop policy if exists units_write on public.units;         create policy units_write on public.units for all using (me_role() = 'central') with check (me_role() = 'central');
  drop policy if exists years_read on public.years;          create policy years_read on public.years for select using (me_role() is not null);
  drop policy if exists years_write on public.years;         create policy years_write on public.years for all using (me_role() = 'central') with check (me_role() = 'central');
  drop policy if exists cycles_read on public.cycles;        create policy cycles_read on public.cycles for select using (me_role() is not null);
  drop policy if exists cycles_write on public.cycles;       create policy cycles_write on public.cycles for all using (me_role() = 'central') with check (me_role() = 'central');
  -- المستخدمون: كل مستخدم يرى سجله، وفريق الإجادة يدير الجميع
  drop policy if exists users_read on public.app_users;      create policy users_read on public.app_users for select using (user_id = auth.uid() or me_role() = 'central');
  drop policy if exists users_write on public.app_users;     create policy users_write on public.app_users for all using (me_role() = 'central') with check (me_role() = 'central');
  -- الموظفون: الجهات المركزية ترى الجميع، والمدير العام يرى موظفي تقسيمه فقط
  drop policy if exists emp_read on public.employees;        create policy emp_read on public.employees for select using (me_role() in ('central','dev','adm') or unit_id = me_unit());
  drop policy if exists emp_write on public.employees;       create policy emp_write on public.employees for all using (me_role() = 'central') with check (me_role() = 'central');
  -- الترشيحات
  drop policy if exists nom_read on public.nominations;
  create policy nom_read on public.nominations for select using (
       me_role() = 'central'
    or (me_role() = 'dev' and track in ('bs','inv'))
    or (me_role() = 'adm' and (track = 'mob' or status in ('approved','to_pay','paid','honored')))
    or (me_role() = 'dg' and unit_id = me_unit()));
  drop policy if exists nom_dg_insert on public.nominations;
  create policy nom_dg_insert on public.nominations for insert with check (
    me_role() = 'dg' and unit_id = me_unit() and status = 'draft' and track in ('bs','mob') and amount = 0 and not demo);
  drop policy if exists nom_dg_update on public.nominations;
  create policy nom_dg_update on public.nominations for update
    using (me_role() = 'dg' and unit_id = me_unit() and status in ('draft','needs_info'))
    with check (me_role() = 'dg' and unit_id = me_unit() and status in ('draft','needs_info') and amount = 0);
  drop policy if exists nom_dg_delete on public.nominations;
  create policy nom_dg_delete on public.nominations for delete using (me_role() = 'dg' and unit_id = me_unit() and status = 'draft');
  drop policy if exists nom_central_delete on public.nominations;
  create policy nom_central_delete on public.nominations for delete using (me_role() = 'central' and demo);
  -- سجل التدقيق: يُقرأ لمن يرى الترشيح، ويُكتب عبر الدوال فقط
  drop policy if exists audit_read on public.audit_log;
  create policy audit_read on public.audit_log for select using (exists (select 1 from public.nominations n where n.id = nomination_id));
  drop policy if exists pub_read on public.pub_versions;     create policy pub_read on public.pub_versions for select using (me_role() in ('central','dev','adm'));
  drop policy if exists pub_write on public.pub_versions;    create policy pub_write on public.pub_versions for insert with check (me_role() = 'central');
end $$;

-- منع المدير العام من تعديل الحقول الحساسة مباشرة
create or replace function public.guard_nomination() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if me_role() = 'dg' and coalesce(current_setting('app.rpc', true),'') <> '1' then
    if tg_op = 'INSERT' then
      new.prepared_by := me_name(); new.approved_by := null; new.paid_at := null; new.honored_at := null; new.return_reason := null;
    else
      new.status := old.status; new.amount := old.amount; new.year := old.year; new.unit_id := old.unit_id; new.track := old.track;
      new.approved_by := old.approved_by; new.paid_at := old.paid_at; new.honored_at := old.honored_at; new.return_reason := old.return_reason;
      new.prepared_by := old.prepared_by; new.demo := old.demo;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists nominations_guard on public.nominations;
create trigger nominations_guard before insert or update on public.nominations for each row execute function public.guard_nomination();

-- صلاحيات تنفيذ الدوال
revoke all on function public.submit_nomination(uuid) from public;
revoke all on function public.transition(uuid,text,text,date) from public;
revoke all on function public.add_inv_result(integer,text,integer,text,text,text,text,jsonb,date,jsonb) from public;
revoke all on function public.claim_invite(text) from public;
revoke all on function public.log_action(uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_nomination(uuid) to authenticated;
grant execute on function public.transition(uuid,text,text,date) to authenticated;
grant execute on function public.add_inv_result(integer,text,integer,text,text,text,text,jsonb,date,jsonb) to authenticated;
grant execute on function public.claim_invite(text) to authenticated;
grant execute on function public.unit_allocation(integer,text) to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke insert, update, delete on public.audit_log from authenticated;

-- ---------- تخزين الشواهد ----------
insert into storage.buckets (id, name, public) values ('evidence', 'evidence', false) on conflict (id) do nothing;
do $$ begin
  drop policy if exists evidence_read on storage.objects;
  create policy evidence_read on storage.objects for select using (
    bucket_id = 'evidence' and (public.me_role() in ('central','dev','adm') or (storage.foldername(name))[1] = public.me_unit()));
  drop policy if exists evidence_insert on storage.objects;
  create policy evidence_insert on storage.objects for insert with check (
    bucket_id = 'evidence' and (public.me_role() = 'central' or public.me_role() = 'dev' or (storage.foldername(name))[1] = public.me_unit()));
end $$;

-- ---------- البيانات الأساسية (عدّل الأعداد والأسماء من شاشة الإعدادات) ----------
insert into public.units(id, name, short, type, gov, bs, outlets) values
 ('r-msq','المديرية العامة بمحافظة مسقط','مسقط','regional','مسقط',true,'{}'),
 ('r-dhf','المديرية العامة بمحافظة ظفار','ظفار','regional','ظفار',true,'{}'),
 ('r-msn','المديرية العامة بمحافظة مسندم','مسندم','regional','مسندم',true,'{}'),
 ('r-brm','المديرية العامة بمحافظة البريمي','البريمي','regional','البريمي',true,'{}'),
 ('r-dkh','المديرية العامة بمحافظة الداخلية','الداخلية','regional','الداخلية',true,'{}'),
 ('r-nbt','المديرية العامة بمحافظة شمال الباطنة','شمال الباطنة','regional','شمال الباطنة',true,'{}'),
 ('r-sbt','المديرية العامة بمحافظة جنوب الباطنة','جنوب الباطنة','regional','جنوب الباطنة',true,'{}'),
 ('r-ssh','المديرية العامة بمحافظة جنوب الشرقية','جنوب الشرقية','regional','جنوب الشرقية',true,'{}'),
 ('r-nsh','المديرية العامة بمحافظة شمال الشرقية','شمال الشرقية','regional','شمال الشرقية',true,'{}'),
 ('r-dhr','المديرية العامة بمحافظة الظاهرة','الظاهرة','regional','الظاهرة',true,'{}'),
 ('r-wst','المديرية العامة بمحافظة الوسطى','الوسطى','regional','الوسطى',true,'{}'),
 ('c-crs','دائرة خدمة المراجعين','خدمة المراجعين','customer','مسقط',true,'{"قاعة خدمة المراجعين"}'),
 ('d-dev','المديرية العامة للتطوير والدراسات','التطوير والدراسات','central','مسقط',true,'{"مركز الاتصال","فريق تجاوب"}'),
 ('d-gis','دائرة نظم المعلومات الجغرافية','نظم المعلومات الجغرافية','central','مسقط',true,'{"الدعم الفني (التقني)"}'),
 ('d-adm','المديرية العامة للشؤون الإدارية والمالية','الشؤون الإدارية والمالية','central','مسقط',false,'{}'),
 ('o-min','مكتب معالي الوزير','مكتب معالي الوزير','office','مسقط',false,'{}')
on conflict (id) do nothing;

insert into public.years(year, approved_total, ref_date) values (2026, 0, current_date) on conflict do nothing;
insert into public.cycles(year, code, close_date, open) values
 (2026,'Q1','2026-03-31',true),(2026,'Q2','2026-06-30',true),(2026,'Q3','2026-09-30',true),(2026,'Q4','2026-12-10',true),
 (2026,'H1','2026-06-30',false),(2026,'H2','2026-12-15',false)
on conflict do nothing;

-- حساب فريق الإجادة الأول (يُفعَّل بالرمز الذي يظهر في النتيجة)
insert into public.app_users(name, role)
select 'فريق الإجادة المؤسسية — المسؤول', 'central'
where not exists (select 1 from public.app_users where role = 'central');

select 'رمز تفعيل حساب فريق الإجادة: ' || invite_code as "النتيجة"
from public.app_users where role = 'central' and user_id is null order by created_at limit 1;
