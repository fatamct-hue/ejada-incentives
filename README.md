# منصة حوافز الإجادة المؤسسية

وزارة الإسكان والتخطيط العمراني — سلطنة عُمان. يديرها فريق الإجادة المؤسسية.

- `PROMPT.md` المواصفات، و`reference/` المعاينة المعتمدة.
- `supabase/migrations/` المخطط والدوال وRLS (001، 002). `supabase/demo/` بيانات تجريبية قابلة للحذف. `supabase/tests/` اختبارات القواعد.
- الواجهة: Vite + React، من جذر المستودع.

## التشغيل
1. أنشئ مشروع Supabase، ونفّذ `001_schema.sql` ثم `002_functions_rls.sql` في SQL Editor.
2. Authentication ← Providers ← Email: فعّل الرمز/الرابط (OTP) وعطّل التسجيل الذاتي (Disable sign ups).
3. أضف أول مستخدم (فريق الإجادة) من SQL Editor، ثم ادخل وأضف الباقين من الإعدادات:
   `insert into profiles(email,full_name,role) values ('name@gov.om','الاسم','ejada');`
   ثم أنشئ المستخدم في Authentication ← Users بنفس البريد (أو اترك الدخول بالرمز يرسل له).
   ملاحظة: مع تعطيل التسجيل الذاتي يجب إنشاء المستخدم في Auth يدوياً مرة واحدة (Invite user) لكل بريد.
4. في GitHub: Settings ← Secrets ← Actions: أضف `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY`. ثم Settings ← Pages ← Source: GitHub Actions. النشر يتم عند الدفع إلى `main`.
5. الخطوط الرسمية (Zarid وManchette): ضع ملفات woff2 في `public/fonts/` بالأسماء الموجودة في `src/styles.css`.
6. تشغيل محلي: `cp .env.example .env` ثم `npm i && npm run dev`.

## إضافة المستخدمين
الإعدادات ← المستخدمون ← إضافة (الاسم، البريد، الدور، التقسيم للمدير العام). مدير عام واحد لكل تقسيم.
ثم Invite user للبريد نفسه من لوحة Supabase.

## النسخ الاحتياطي
`pg_dump "postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" -Fc -f backup.dump`
(لوحة Supabase تحفظ نسخاً يومية في الخطط المدفوعة). الشواهد: Storage ← bucket `evidence` تُنسخ بـ `supabase storage` CLI أو من اللوحة.

## النقل إلى خوادم الوزارة
المخطط كله في SQL. على Supabase مستضاف ذاتياً أو PostgreSQL + GoTrue + Storage: نفّذ ملفات migrations بالترتيب، واستعد النسخة بـ `pg_restore`، ثم غيّر `VITE_SUPABASE_URL` وأعد البناء.

## المطلوب من الموارد البشرية وتقنية المعلومات
- سجل الموظفين (الرقم الوظيفي، الاسم، المسمى، التقسيم) Excel.
- هيكل التقسيمات وأعداد موظفيها والتبعية والتاريخ المرجعي، والعدد الإجمالي المعتمد.
- قائمة المديرين العامين وبريد كل منهم، وبريد فريق الإجادة والتطوير والدراسات والشؤون المالية.

## البيانات التجريبية
`supabase/demo/load_demo.sql` للتحميل، و`unload_demo.sql` للحذف بأمر واحد.

## الاختبارات
```
psql -f supabase/tests/00_mock_supabase.sql; psql -f supabase/migrations/001_schema.sql; psql -f supabase/migrations/002_functions_rls.sql
psql -f supabase/tests/01_rules.sql; psql -f supabase/tests/02_workflow.sql
```
(على قاعدة محلية فارغة؛ الملف 00 يحاكي Supabase للاختبار فقط.)
