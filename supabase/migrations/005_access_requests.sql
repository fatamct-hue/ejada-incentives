-- طلبات انضمام المستخدمين: يقدّم المستخدم طلباً (بدون حساب)، ويعتمده فريق الإجادة فيُنشأ حسابه فوراً.

create table if not exists access_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  job_title text,
  division_id uuid references divisions(id) on delete set null,
  requested_role user_role not null default 'dg',
  note text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  decided_by text, decided_at timestamptz, decision_note text,
  created_at timestamptz not null default now()
);
create unique index if not exists access_requests_one_pending on access_requests (lower(email)) where status = 'pending';
alter table access_requests enable row level security;
create policy ar_ejada on access_requests for all using (my_role() = 'ejada') with check (my_role() = 'ejada');

-- قائمة التقسيمات لنموذج الطلب (أسماء فقط، متاحة قبل الدخول)
create or replace function public_divisions() returns table (id uuid, name text)
language sql stable security definer set search_path = public as $$
  select id, name from divisions where active order by name
$$;

create or replace function request_access(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare v_email text := lower(trim(coalesce(p->>'email','')));
        v_name text := trim(coalesce(p->>'full_name',''));
        v_role user_role := coalesce(nullif(p->>'requested_role',''),'dg')::user_role;
        v_div uuid := nullif(p->>'division_id','')::uuid;
begin
  if length(v_name) < 3 or length(v_name) > 120 then raise exception 'اكتب الاسم الكامل'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 160 then raise exception 'البريد الإلكتروني غير صالح'; end if;
  if v_role = 'dg' and v_div is null then raise exception 'اختر التقسيم'; end if;
  if exists (select 1 from profiles where lower(email) = v_email and active) then return 'exists'; end if;
  if (select count(*) from access_requests where status = 'pending') >= 300 then raise exception 'تعذر استقبال الطلب حالياً'; end if;
  insert into access_requests (full_name, email, phone, job_title, division_id, requested_role, note)
  values (v_name, v_email, left(p->>'phone',30), left(p->>'job_title',120), v_div, v_role, left(p->>'note',500))
  on conflict (lower(email)) where status = 'pending' do update
    set full_name = excluded.full_name, phone = excluded.phone, job_title = excluded.job_title,
        division_id = excluded.division_id, requested_role = excluded.requested_role, note = excluded.note, created_at = now();
  return 'ok';
end $$;

-- الاعتماد: ينشئ المستخدم والحساب فيدخل بالرمز فوراً دون دعوة من لوحة Supabase
create or replace function approve_access_request(p_id uuid, p_role user_role, p_division uuid default null) returns void
language plpgsql security definer set search_path = public as $$
declare pr profiles; r access_requests;
begin
  select * into pr from me();
  if pr.role is distinct from 'ejada' then raise exception 'غير مصرح'; end if;
  select * into r from access_requests where id = p_id and status = 'pending' for update;
  if not found then raise exception 'الطلب غير موجود أو سبق البت فيه'; end if;
  if p_role = 'dg' then
    if p_division is null then raise exception 'اختر التقسيم'; end if;
    if exists (select 1 from profiles where role = 'dg' and active and division_id = p_division and lower(email) <> lower(r.email)) then
      raise exception 'لهذا التقسيم مدير عام مسجل بالفعل'; end if;
  end if;
  insert into profiles (email, full_name, role, division_id, active)
  values (lower(r.email), r.full_name, p_role, case when p_role = 'dg' then p_division end, true)
  on conflict (lower(email)) do update set full_name = excluded.full_name, role = excluded.role, division_id = excluded.division_id, active = true;
  if not exists (select 1 from auth.users u where lower(u.email) = lower(r.email)) then
    insert into auth.users (instance_id,id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,
      confirmation_token,recovery_token,email_change_token_new,email_change,email_change_token_current,phone_change,phone_change_token,reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(),'authenticated','authenticated', lower(r.email), now(),
      '{"provider":"email","providers":["email"]}','{}', now(), now(), '','','','','','','','');
    insert into auth.identities (provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
    select u.id::text, u.id, jsonb_build_object('sub',u.id::text,'email',u.email,'email_verified',true), 'email', now(), now(), now()
    from auth.users u where lower(u.email) = lower(r.email) and not exists (select 1 from auth.identities i where i.user_id = u.id);
  end if;
  update access_requests set status = 'approved', decided_by = pr.full_name, decided_at = now(), requested_role = p_role,
         division_id = case when p_role = 'dg' then p_division end where id = p_id;
end $$;

create or replace function reject_access_request(p_id uuid, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
declare pr profiles;
begin
  select * into pr from me();
  if pr.role is distinct from 'ejada' then raise exception 'غير مصرح'; end if;
  update access_requests set status = 'rejected', decided_by = pr.full_name, decided_at = now(), decision_note = p_note
   where id = p_id and status = 'pending';
end $$;

revoke execute on function public_divisions() from public;
revoke execute on function request_access(jsonb) from public;
grant execute on function public_divisions() to anon, authenticated;
grant execute on function request_access(jsonb) to anon, authenticated;
revoke execute on function approve_access_request(uuid, user_role, uuid) from public, anon;
revoke execute on function reject_access_request(uuid, text) from public, anon;
grant execute on function approve_access_request(uuid, user_role, uuid) to authenticated;
grant execute on function reject_access_request(uuid, text) to authenticated;
