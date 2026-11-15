-- منصة حوافز الإجادة المؤسسية — المخطط الأساسي
create extension if not exists pgcrypto;

create type user_role as enum ('dg','ejada','dev','admin_fin');
create type track_kind as enum ('service','innovator','initiator');
create type nom_status as enum ('draft','sent','needs_info','review','recommended','approved','to_pay','paid','honored');

-- السنوات والإعدادات (كل سنة منفصلة)
create table year_settings (
  year int primary key,
  approved_headcount int,                    -- إجمالي موظفي الوزارة المعتمد للحساب
  reference_date date,
  rate_per_employee numeric(10,3) not null default 15,
  service_award numeric(10,3) not null default 300,
  innovator_prizes jsonb not null default '{"1":500,"2":400,"3":300}',
  headcount_is_demo boolean not null default false,
  closed boolean not null default false,
  closed_by uuid, closed_at timestamptz,
  created_at timestamptz not null default now()
);

-- التقسيمات
create table divisions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  parent_id uuid references divisions(id),
  counted_in_parent boolean not null default false, -- موظفوه محسوبون ضمن التقسيم الأعلى
  governorate text,
  is_service boolean not null default false,        -- مشمول بمسار خدمة المستفيدين
  active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create table outlets (
  id uuid primary key default gen_random_uuid(),
  division_id uuid not null references divisions(id) on delete cascade,
  name text not null,
  is_demo boolean not null default false,
  unique (division_id, name)
);
create table division_years (
  division_id uuid references divisions(id) on delete cascade,
  year int references year_settings(year),
  headcount int not null check (headcount >= 0),
  reference_date date,
  primary key (division_id, year)
);

-- المستخدمون (مسجلون مسبقاً بالبريد؛ يُربط الدخول بالبريد في JWT)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  role user_role not null,
  division_id uuid references divisions(id),
  active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  constraint dg_has_division check (role <> 'dg' or division_id is not null)
);
create unique index profiles_email_uq on profiles (lower(email));
create unique index profiles_one_dg_per_division on profiles (division_id) where role = 'dg' and active;

-- سجل الموظفين
create table employees (
  emp_no text primary key,
  name text not null,
  title text,
  division_id uuid not null references divisions(id),
  is_demo boolean not null default false
);
create index on employees (division_id);

-- الدورات
create table cycles (
  id uuid primary key default gen_random_uuid(),
  year int not null references year_settings(year),
  track track_kind not null,
  period int not null check (period between 1 and 4),
  is_open boolean not null default false,
  closes_on date,
  unique (year, track, period)
);

-- معايير الاستمارات (قابلة للتحديث دون تعديل الكود)
create table criteria (
  id serial primary key,
  track track_kind not null,
  group_title text not null,
  group_ord int not null,
  ord int not null,
  label text not null,
  max_score int not null default 10,
  active boolean not null default true
);

-- الترشيحات / النتائج
create table nominations (
  id uuid primary key default gen_random_uuid(),
  year int not null references year_settings(year),
  track track_kind not null,
  period int not null,
  division_id uuid not null references divisions(id),
  outlet_id uuid references outlets(id),
  emp_no text not null references employees(emp_no),
  emp_name text not null,
  job_title text,
  department text,
  direct_manager text,
  status nom_status not null default 'draft',
  scores jsonb not null default '{}',
  evidence_notes jsonb not null default '{}',
  total int not null default 0,
  justification text,
  initiative_title text, initiative_date date, beneficiaries text,
  amount numeric(12,3),
  -- المبتكر
  rank int, idea_title text, idea_no text, approved_on date, results_doc text,
  is_team boolean not null default false,
  team jsonb not null default '[]',
  people text[] not null default '{}',
  -- الاعتمادات
  created_by uuid, submitted_by_name text, submitted_at timestamptz,
  committee_by text, committee_at timestamptz,
  approved_by text, approved_at timestamptz,
  fin_by text, fin_at timestamptz,
  paid_on date, honored_on date,
  needs_info_reason text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on nominations (year, track, period);
create index on nominations (division_id);
create index on nominations using gin (people);
-- فائز واحد لخدمة المستفيدين لكل جهة في كل ربع
create unique index one_service_winner on nominations (year, period, division_id)
  where track = 'service' and status in ('approved','to_pay','paid','honored');
-- مركز واحد لكل نصف سنة
create unique index one_innovator_rank on nominations (year, period, rank)
  where track = 'innovator';

create table attachments (
  id uuid primary key default gen_random_uuid(),
  nomination_id uuid not null references nominations(id) on delete cascade,
  path text not null,
  file_name text not null,
  uploaded_by uuid,
  created_at timestamptz not null default now()
);

create table nomination_events (
  id bigserial primary key,
  nomination_id uuid not null references nominations(id) on delete cascade,
  actor_id uuid, actor_name text, actor_role user_role,
  action text not null,
  from_status nom_status, to_status nom_status,
  note text,
  at timestamptz not null default now()
);

create table publish_versions (
  id uuid primary key default gen_random_uuid(),
  year int not null references year_settings(year),
  approved_by text not null,
  approved_at timestamptz not null default now(),
  rows jsonb not null
);

-- معايير مبدئية (إعدادات لا بيانات تجريبية)
insert into year_settings (year) values (2026), (2027);

insert into criteria (track, group_title, group_ord, ord, label, max_score) values
('service','جودة وكفاءة تقديم الخدمة (30)',1,1,'دقة إنجاز المعاملات واكتمالها، وخلوها من الأخطاء',10),
('service','جودة وكفاءة تقديم الخدمة (30)',1,2,'الإلمام الشامل بأنظمة وإجراءات العمل المحدثة',10),
('service','جودة وكفاءة تقديم الخدمة (30)',1,3,'القدرة على تقديم حلول مرنة وبدائل مناسبة تسعد المستفيدين',10),
('service','اللباقة وحسن التعامل (30)',2,4,'الاستقبال الإيجابي والترحيب بالمستفيدين باهتمام',10),
('service','اللباقة وحسن التعامل (30)',2,5,'القدرة على احتواء المواقف والتعامل مع الملاحظات بهدوء ورقي',10),
('service','اللباقة وحسن التعامل (30)',2,6,'الوضوح والشفافية والأسلوب الإيجابي في الرد على الاستفسارات',10),
('service','سرعة الإنجاز (20)',3,7,'إنجاز المعاملات ضمن الإطار الزمني المعتمد للخدمة',10),
('service','سرعة الإنجاز (20)',3,8,'الاستجابة الفورية والتعامل السريع مع الحالات العاجلة',10),
('service','المهنية والاحترافية (20)',4,9,'الالتزام التام بأوقات العمل والمظهر الوظيفي اللائق',10),
('service','المهنية والاحترافية (20)',4,10,'روح المبادرة، والتعاون الفعال، ونشر الإيجابية بين زملاء العمل',10),
('initiator','الإنجاز خارج نطاق المهام المعتادة (30)',1,1,'إنجاز أعمال إضافية خارج الوصف الوظيفي',10),
('initiator','الإنجاز خارج نطاق المهام المعتادة (30)',1,2,'المبادرة الذاتية دون تكليف مباشر',10),
('initiator','الإنجاز خارج نطاق المهام المعتادة (30)',1,3,'الالتزام بتنفيذ المبادرة ومتابعتها حتى اكتمالها',10),
('initiator','حل المشكلات والتحسين (30)',2,4,'تحديد مشكلة أو فرصة تحسين بوضوح',10),
('initiator','حل المشكلات والتحسين (30)',2,5,'تقديم حل عملي قابل للتطبيق',10),
('initiator','حل المشكلات والتحسين (30)',2,6,'تحسين الأداء أو تقليل الوقت أو التكلفة بشكل ملموس',10),
('initiator','العمل الجماعي ونقل المعرفة (20)',3,7,'المشاركة الفعالة في الفرق واللجان',10),
('initiator','العمل الجماعي ونقل المعرفة (20)',3,8,'التعلم الذاتي ونقل المعرفة للزملاء',10),
('initiator','الأثر (20)',4,9,'أثر ملموس وقابل للقياس على العمل أو المستفيدين',10),
('initiator','الأثر (20)',4,10,'استدامة الأثر أو قابلية تعميم المبادرة',10);
