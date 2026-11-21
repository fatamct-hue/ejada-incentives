-- مشرف أعلى: حساب واحد (يحدَّد بالـ SQL فقط) يعرض المنصة كأي دور وتقسيم.
-- الدور الفعّال يُحسب على الخادم، فتبقى كل قواعد RLS والدوال تعمل بالدور المعروض.

alter table profiles add column if not exists is_super boolean not null default false;

create table if not exists super_view (
  email text primary key,
  as_role user_role,
  as_division uuid references divisions(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table super_view enable row level security;  -- بلا سياسات: لا وصول مباشر

-- الحساب الفعلي (بدون العرض)
create or replace function _actual() returns profiles language sql stable security definer set search_path = public as $$
  select * from profiles where lower(email) = lower(coalesce(auth.jwt() ->> 'email','')) and active limit 1
$$;

-- الحساب الفعّال: المشرف الأعلى يظهر بالدور والتقسيم المعروضين
create or replace function me() returns profiles language sql stable security definer set search_path = public as $$
  select p.id, p.email, p.full_name,
         case when p.is_super then coalesce(v.as_role, p.role) else p.role end,
         case when p.is_super and v.as_role is not null then v.as_division else p.division_id end,
         p.active, p.is_demo, p.created_at, p.is_super
  from profiles p left join super_view v on lower(v.email) = lower(p.email)
  where lower(p.email) = lower(coalesce(auth.jwt() ->> 'email','')) and p.active limit 1
$$;
create or replace function my_role() returns user_role language sql stable security definer set search_path = public as $$
  select role from me()
$$;
create or replace function my_division() returns uuid language sql stable security definer set search_path = public as $$
  select division_id from me()
$$;

create or replace function set_view_as(p_role user_role default null, p_division uuid default null) returns void
language plpgsql security definer set search_path = public as $$
declare a profiles;
begin
  select * into a from _actual();
  if a.id is null or not a.is_super then raise exception 'غير مصرح'; end if;
  if p_role is null then
    delete from super_view where lower(email) = lower(a.email);
  else
    if p_role = 'dg' and p_division is null then raise exception 'اختر التقسيم'; end if;
    insert into super_view(email, as_role, as_division) values (a.email, p_role, case when p_role = 'dg' then p_division end)
    on conflict (email) do update set as_role = excluded.as_role, as_division = excluded.as_division, updated_at = now();
  end if;
end $$;

-- لا يمنح أحد نفسه صفة المشرف من الواجهة (تُمنح بـ SQL من لوحة Supabase فقط)
create or replace function _guard_super() returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated','anon') then
    if tg_op = 'INSERT' and new.is_super then raise exception 'غير مصرح'; end if;
    if tg_op = 'UPDATE' and new.is_super is distinct from old.is_super then raise exception 'غير مصرح'; end if;
  end if;
  return new;
end $$;
drop trigger if exists guard_super on profiles;
create trigger guard_super before insert or update on profiles for each row execute function _guard_super();

revoke execute on function _actual() from public, anon, authenticated;
revoke execute on function set_view_as(user_role, uuid) from public, anon;
grant execute on function set_view_as(user_role, uuid) to authenticated;
revoke execute on function _guard_super() from public, anon, authenticated;
