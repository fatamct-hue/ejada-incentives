// وضع المعاينة: بيانات وهمية في الذاكرة بدل Supabase (يُفعَّل ببناء VITE_DEMO=1 فقط)
const uid = () => crypto.randomUUID()
const D = (n) => n
const divs = ['المديرية العامة للإسكان والتخطيط العمراني (مسقط)', 'المديرية العامة للإسكان والتخطيط العمراني (ظفار)', 'المديرية العامة للإسكان والتخطيط العمراني (الداخلية)', 'دائرة خدمة المراجعين', 'المديرية العامة للتطوير والدراسات', 'دائرة نظم المعلومات الجغرافية', 'المديرية العامة للشؤون الإدارية والمالية'].map((name, i) => ({
  id: 'd' + i, name, parent_id: null, counted_in_parent: i === 5, governorate: ['مسقط', 'ظفار', 'الداخلية', 'مسقط', 'مسقط', 'مسقط', 'مسقط'][i], is_service: i < 6, active: true }))
divs[5].parent_id = 'd4'
const heads = [180, 140, 150, 60, 90, 25, 45]
const crit = (t, rows) => rows.flatMap(([g, ls], gi) => ls.map((label, li) => ({ track: t, group_title: g, group_ord: gi + 1, label, max_score: 10, active: true })))
const sc = crit('service', [['جودة وكفاءة تقديم الخدمة', ['دقة إنجاز المعاملات واكتمالها، وخلوها من الأخطاء', 'الإلمام الشامل بأنظمة وإجراءات العمل المحدثة', 'القدرة على تقديم حلول مرنة وبدائل مناسبة تسعد المستفيدين']],
  ['اللباقة وحسن التعامل', ['الاستقبال الإيجابي والترحيب بالمستفيدين باهتمام', 'القدرة على احتواء المواقف والتعامل مع الملاحظات بهدوء ورقي', 'الوضوح والشفافية والأسلوب الإيجابي في الرد على الاستفسارات']],
  ['سرعة الإنجاز', ['إنجاز المعاملات ضمن الإطار الزمني المعتمد للخدمة', 'الاستجابة الفورية والتعامل السريع مع الحالات العاجلة']],
  ['المهنية والاحترافية', ['الالتزام التام بأوقات العمل والمظهر الوظيفي اللائق', 'روح المبادرة، والتعاون الفعال، ونشر الإيجابية بين زملاء العمل']]])
const ic = crit('initiator', [['الإنجاز خارج نطاق المهام المعتادة', ['إنجاز أعمال إضافية خارج الوصف الوظيفي', 'المبادرة الذاتية دون تكليف مباشر', 'الالتزام بتنفيذ المبادرة ومتابعتها حتى اكتمالها']],
  ['حل المشكلات والتحسين', ['تحديد مشكلة أو فرصة تحسين بوضوح', 'تقديم حل عملي قابل للتطبيق', 'تحسين الأداء أو تقليل الوقت أو التكلفة بشكل ملموس']],
  ['العمل الجماعي ونقل المعرفة', ['المشاركة الفعالة في الفرق واللجان', 'التعلم الذاتي ونقل المعرفة للزملاء']], ['الأثر', ['أثر ملموس وقابل للقياس على العمل أو المستفيدين', 'استدامة الأثر أو قابلية تعميم المبادرة']]])
const criteria = [...sc, ...ic].map((c, i) => ({ ...c, id: i + 1, ord: i + 1 }))
const names = ['سالم الحارثي', 'مريم البلوشي', 'خالد الرواحي', 'أمل السعدي', 'يوسف الكندي', 'هدى المعمري', 'ناصر الهنائي', 'فاطمة الشكيلي', 'سعيد العامري', 'ليلى البوسعيدي']
const employees = names.map((name, i) => ({ emp_no: String(1001 + i), name, title: 'أخصائي', division_id: divs[i % 4].id }))
const cyc = []; for (const [t, ps] of [['service', 4], ['initiator', 4], ['innovator', 2]]) for (let p = 1; p <= ps; p++) cyc.push({ id: `c-${t}-${p}`, year: 2026, track: t, period: p, is_open: p <= 2, closes_on: p === 1 ? '2026-04-15' : null })
const score = (v) => Object.fromEntries(criteria.filter((c) => c.track === 'service').map((c) => [c.id, v]))
const mkNom = (o) => ({ id: uid(), year: 2026, status: 'draft', scores: {}, evidence_notes: {}, total: 0, team: [], people: [o.emp_no], created_at: new Date().toISOString(), job_title: 'أخصائي', direct_manager: 'مدير الدائرة',
  justification: 'تميز في الأداء وإنجاز المعاملات بدقة وسرعة ملحوظة.', ...o, emp_name: employees.find((e) => e.emp_no === o.emp_no).name })
const db = {
  year_settings: [{ year: 2026, approved_headcount: 1500, reference_date: '2026-01-01', rate_per_employee: 15, service_award: 300, innovator_prizes: { 1: 500, 2: 400, 3: 300 }, closed: false }, { year: 2027, approved_headcount: null, closed: false }],
  divisions: divs, outlets: [], division_years: divs.map((d, i) => ({ division_id: d.id, year: 2026, headcount: heads[i] })), cycles: cyc, criteria,
  employees, attachments: [], nomination_events: [], publish_versions: [],
  access_requests: [{ id: 'r1', full_name: 'سعيد بن علي الحارثي', email: 'saeed@example.test', requested_role: 'dg', division_id: 'd1', job_title: 'مدير عام', phone: '99000000', status: 'pending', created_at: new Date().toISOString() }, { id: 'r2', full_name: 'مريم بنت سالم', email: 'maryam@example.test', requested_role: 'dev', job_title: 'أخصائية', status: 'pending', created_at: new Date().toISOString() }],
  profiles: [{ id: 'u1', email: 'ejada@demo', full_name: 'عضو فريق الإجادة', role: 'ejada', is_super: true, active: true }, { id: 'u2', email: 'dg@demo', full_name: 'المدير العام لمديرية مسقط', role: 'dg', division_id: 'd0', active: true },
    { id: 'u3', email: 'dev@demo', full_name: 'التطوير والدراسات', role: 'dev', active: true }, { id: 'u4', email: 'fin@demo', full_name: 'الشؤون الإدارية والمالية', role: 'admin_fin', active: true }],
  nominations: [
    mkNom({ track: 'service', period: 1, division_id: 'd0', emp_no: '1001', status: 'honored', total: 92, scores: score(9), honored_on: '2026-04-30', paid_on: '2026-04-20', amount: 300 }),
    mkNom({ track: 'service', period: 1, division_id: 'd1', emp_no: '1002', status: 'approved', total: 88, scores: score(9), amount: 300 }),
    mkNom({ track: 'service', period: 1, division_id: 'd2', emp_no: '1003', status: 'review', total: 85, scores: score(8), amount: 300 }),
    mkNom({ track: 'service', period: 2, division_id: 'd0', emp_no: '1005', status: 'sent', total: 90, scores: score(9) }),
    mkNom({ track: 'service', period: 2, division_id: 'd0', emp_no: '1009', status: 'needs_info', total: 70, scores: score(7), needs_info_reason: 'يرجى إرفاق شاهد إضافي' }),
    mkNom({ track: 'initiator', period: 1, division_id: 'd0', emp_no: '1005', status: 'approved', initiative_title: 'أتمتة طلبات الفحص', amount: 400, total: 86 }),
    mkNom({ track: 'initiator', period: 1, division_id: 'd1', emp_no: '1002', status: 'review', initiative_title: 'دليل الإجراءات المبسط', amount: 250, total: 80 }),
    mkNom({ track: 'initiator', period: 2, division_id: 'd0', emp_no: '1001', status: 'draft', initiative_title: 'مبادرة تجريبية', amount: 150 }),
    mkNom({ track: 'innovator', period: 1, rank: 1, division_id: 'd2', emp_no: '1003', status: 'review', amount: 500, idea_title: 'نظام تنبيه ذكي', idea_no: 'NB-102', approved_on: '2026-06-10' }),
  ],
}
const role = new URLSearchParams(location.search).get('role') || 'ejada'
const me = () => db.profiles.find((p) => p.email === role + '@demo') || db.profiles[0]
const alloc = (year) => { const ys = db.year_settings.find((y) => y.year === year); if (!ys?.approved_headcount) return []
  const svc = db.divisions.filter((d) => d.is_service).length; const rem = ys.rate_per_employee * ys.approved_headcount - ys.service_award * svc * 4 - 2400
  const rows = db.division_years.filter((r) => r.year === year && !db.divisions.find((d) => d.id === r.division_id).counted_in_parent); const tot = rows.reduce((s, r) => s + r.headcount, 0)
  return rows.map((r) => ({ division_id: r.division_id, headcount: r.headcount, allocation: Math.round(rem * r.headcount / tot * 1000) / 1000 })) }
const log = (n, action, from) => db.nomination_events.push({ id: Date.now() + Math.random(), nomination_id: n.id, actor_name: me().full_name, action, from_status: from, to_status: n.status, at: new Date().toISOString() })
const rpcs = {
  me: () => me(),
  set_view_as: ({ p_role }) => { const m = { admin_fin: 'fin', dg: 'dg', dev: 'dev' }; history.replaceState(null, '', '?role=' + (m[p_role] || 'ejada') + location.hash) },
  lookup_employee: ({ p_emp_no }) => db.employees.filter((e) => e.emp_no === String(p_emp_no).trim() && (me().role !== 'dg' || e.division_id === me().division_id)),
  division_budget: ({ p_year }) => alloc(p_year).filter((a) => me().role !== 'dg' || a.division_id === me().division_id).map((a) => {
    const ns = db.nominations.filter((n) => n.year === p_year && n.track === 'initiator' && n.division_id === a.division_id); const ap = ['approved', 'to_pay', 'paid', 'honored']
    const q = (p) => ns.filter((n) => n.period === p && ap.includes(n.status)).reduce((s, n) => s + +n.amount, 0)
    const committed = ns.filter((n) => ap.includes(n.status)).reduce((s, n) => s + +n.amount, 0)
    return { ...a, division_name: db.divisions.find((d) => d.id === a.division_id).name, q1: q(1), q2: q(2), q3: q(3), q4: q(4), paid: ns.filter((n) => ['paid', 'honored'].includes(n.status)).reduce((s, n) => s + +n.amount, 0), unpaid: ns.filter((n) => ['approved', 'to_pay'].includes(n.status)).reduce((s, n) => s + +n.amount, 0), balance: a.allocation - committed } }),
  save_nomination: ({ p }) => { const e = db.employees.find((x) => x.emp_no === p.emp_no); const total = Object.values(p.scores || {}).reduce((s, v) => s + (+v || 0), 0)
    if (p.id) { Object.assign(db.nominations.find((n) => n.id === p.id), { ...p, emp_name: e.name, total }); return p.id }
    const n = mkNom({ ...p, division_id: me().division_id, total, emp_no: e.emp_no }); db.nominations.unshift(n); log(n, 'save_draft'); return n.id },
  transition_nomination: ({ p_id, p_action, p_note, p_date }) => { const n = db.nominations.find((x) => x.id === p_id); const from = n.status
    const to = { submit: 'sent', receive: 'review', needs_info: 'needs_info', approve: 'approved', to_pay: 'to_pay', pay: 'paid', honor: 'honored' }[p_action]
    if (p_action === 'needs_info') n.needs_info_reason = p_note; if (p_action === 'pay') n.paid_on = p_date || '2026-11-15'; if (p_action === 'honor') n.honored_on = p_date || '2026-11-15'
    n.status = to; log(n, p_action, from); return n },
  save_innovator_result: ({ p }) => { const e = db.employees.find((x) => x.emp_no === p.emp_no); db.nominations.unshift(mkNom({ track: 'innovator', year: p.year, period: p.period, rank: p.rank, emp_no: e.emp_no, division_id: p.division_id || e.division_id, status: 'review',
    amount: db.year_settings.find((y) => y.year === p.year).innovator_prizes[p.rank], idea_title: p.idea_title, idea_no: p.idea_no, approved_on: p.approved_on, is_team: p.is_team, team: p.team })); return 'ok' },
  budget_summary: ({ p_year }) => { const a = alloc(p_year); const ys = db.year_settings.find((y) => y.year === p_year); const svc = db.divisions.filter((d) => d.is_service).length; const pool = ys.approved_headcount * 15; const rem = pool - svc * 1200 - 2400
    const hc = a.reduce((s, x) => s + x.headcount, 0); return [{ total_pool: pool, service_total: svc * 1200, innovator_total: 2400, remaining: rem, per_employee: Math.round(rem / hc * 1000) / 1000, included_headcount: hc, approved_headcount: ys.approved_headcount, allocated: a.reduce((s, x) => s + x.allocation, 0), unallocated: 0 }] },
  budget_table: ({ p_year }) => alloc(p_year).filter((a) => me().role !== 'dg' || a.division_id === me().division_id).map((a) => { const d = db.divisions.find((x) => x.id === a.division_id)
    const ns = db.nominations.filter((n) => n.year === p_year && n.division_id === a.division_id); const ap = ['approved', 'to_pay', 'paid', 'honored']
    const q = (p) => ns.filter((n) => n.track === 'initiator' && n.period === p && ap.includes(n.status)).reduce((s, n) => s + +n.amount, 0)
    const inv = ns.filter((n) => n.track === 'innovator' && ap.includes(n.status)).reduce((s, n) => s + +n.amount, 0); const used = q(1) + q(2) + q(3) + q(4)
    return { division_id: a.division_id, division_name: d.name, headcount: a.headcount, is_service: d.is_service, computed: a.allocation, override: null, allocation: a.allocation, service_amount: d.is_service ? 1200 : 0, innovator_amount: inv, q1: q(1), q2: q(2), q3: q(3), q4: q(4),
      paid: ns.filter((n) => n.track === 'initiator' && ['paid', 'honored'].includes(n.status)).reduce((s, n) => s + +n.amount, 0), unpaid: 0, balance: a.allocation - used, total: a.allocation + (d.is_service ? 1200 : 0) + inv } }),
  public_divisions: () => db.divisions.map((d) => ({ id: d.id, name: d.name })),
  request_access: () => 'ok', approve_access_request: ({ p_id }) => { const r = db.access_requests.find((x) => x.id === p_id); if (r) r.status = 'approved'; }, reject_access_request: ({ p_id }) => { const r = db.access_requests.find((x) => x.id === p_id); if (r) r.status = 'rejected'; },
  find_conflicts: () => [], resolve_conflict: () => 0, init_year: () => null, close_year: () => null,
  cycle_status: ({ p_year }) => db.cycles.filter((c) => c.year === p_year).map((c) => { const ns = db.nominations.filter((n) => n.track === c.track && n.period === c.period && n.year === p_year); const ap = ns.filter((n) => ['approved', 'to_pay', 'paid', 'honored'].includes(n.status)).length
    const ex = c.track === 'service' ? 6 : c.track === 'innovator' ? 3 : 0; const pn = ns.filter((n) => ['sent', 'review'].includes(n.status)).length
    return { cycle_id: c.id, track: c.track, period: c.period, is_open: c.is_open, closes_on: c.closes_on, state: c.closes_on && c.closes_on > '2026-11-15' ? 'not_ended' : ap === ex && ex ? 'complete' : pn ? 'awaiting' : 'incomplete', approved_count: ap, expected: ex, pending: pn } }),
  approve_publish: ({ p_year }) => { db.publish_versions.unshift({ id: uid(), year: p_year, approved_by: me().full_name, approved_at: new Date().toISOString(), rows: db.nominations.filter((n) => n.status === 'honored').map((n) => ({ name: n.emp_name, division: db.divisions.find((d) => d.id === n.division_id).name, track: n.track, period: n.period, rank: n.rank })) }); return 'ok' },
}
const res = (data, error = null) => Promise.resolve({ data, error })
function from(t) {
  let rows = db[t]; let mode = 'select'; let patch = null; let single = false; let filters = []; let lim = null; let ord = null
  const run = () => {
    let out = rows.filter((r) => filters.every(([k, v]) => r[k] === v))
    if (mode === 'update') { out.forEach((r) => Object.assign(r, patch)); return res(null) }
    if (mode === 'delete') { db[t] = db[t].filter((r) => !out.includes(r)); return res(null) }
    if (ord) out = [...out].sort((a, b) => (a[ord] < b[ord] ? 1 : -1)); if (lim) out = out.slice(0, lim)
    return res(single ? out[0] : out)
  }
  const q = { select: () => q, order: (c) => { ord = c; return q }, limit: (n) => { lim = n; return q }, eq: (k, v) => { filters.push([k, v]); return q }, single: () => { single = true; return q },
    insert: (o) => { const r = { id: uid(), ...o }; db[t].push(r); rows = [r]; return q }, update: (p) => { mode = 'update'; patch = p; return q }, delete: () => { mode = 'delete'; return q },
    upsert: (o) => { for (const r of [].concat(o)) { const k = db[t].find((x) => (r.emp_no ? x.emp_no === r.emp_no : r.division_id && r.year ? x.division_id === r.division_id && x.year === r.year : x.name === r.name)); if (k) Object.assign(k, r); else db[t].push({ id: uid(), ...r }) } rows = db[t]; return q },
    then: (a, b) => run().then(a, b) }
  return q
}
export const mockSb = {
  from, rpc: (fn, args) => (rpcs[fn] ? (() => { try { return res(rpcs[fn](args || {})) } catch (e) { return res(null, { message: e.message }) } })() : res(null, { message: 'غير متاح في المعاينة' })),
  auth: { getSession: () => res({ session: { user: {} } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }), signOut: () => { location.search = '' }, signInWithOtp: () => res({}), verifyOtp: () => res({}) },
  storage: { from: () => ({ upload: () => res({}), remove: () => res({}), createSignedUrl: () => res({ signedUrl: '#' }) }) },
}
