import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { sb } from '../supabase'
import { useApp, Kpi, Sec, TRACKS, STN, fmt, fdate, asset, periodName, ROLE_META } from '../lib'
import Icon from '../Icon'

const todayStr = () => new Date().toLocaleDateString('ar-OM-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })
const inPeriod = (n, q) => q === 0 || (n.track === 'innovator' ? n.period === Math.ceil(q / 2) : n.period === q)

export default function Payroll() {
  const { me, year, noms, divName, rpc, reload, say } = useApp()
  const [track, setTrack] = useState(''); const [q, setQ] = useState(0); const [status, setStatus] = useState('approved')
  const [sel, setSel] = useState({}); const [names, setNames] = useState({}); const [busy, setBusy] = useState(false)
  const canAct = me.role === 'admin_fin'
  const filtered = useMemo(() => noms.filter((n) => n.year === year && (status === 'all' ? ['approved', 'to_pay', 'honored'] : [status]).includes(n.status)
    && (!track || n.track === track) && inPeriod(n, q)).sort((a, b) => a.track.localeCompare(b.track) || a.period - b.period || divName(a.division_id).localeCompare(divName(b.division_id))), [noms, year, status, track, q])

  useEffect(() => { const ids = [...new Set(filtered.filter((n) => n.is_team).flatMap((n) => (n.team || []).map((m) => m.emp_no)))]
    if (ids.length) sb.from('employees').select('emp_no,name').in('emp_no', ids).then((r) => setNames(Object.fromEntries((r.data || []).map((e) => [e.emp_no, e.name])))) }, [filtered])

  // صفوف الكشف: الفريق يُفصَّل إلى أعضائه بحصصهم، والباقي للقائد
  const lines = useMemo(() => filtered.flatMap((n) => {
    const base = { n, division: divName(n.division_id), track: TRACKS[n.track].short, period: `${n.rank ? `المركز ${n.rank} · ` : ''}${periodName(n.track, n.period)}`,
      detail: n.track === 'initiator' ? n.initiative_title : n.track === 'innovator' ? `${n.idea_title || ''}${n.idea_no ? ` (${n.idea_no})` : ''}` : '', approved: n.approved_at, by: n.approved_by, st: STN[n.status] }
    if (!n.is_team) return [{ ...base, key: n.id, first: true, emp_no: n.emp_no, name: n.emp_name, title: n.job_title, amount: Number(n.amount || 0) }]
    const members = (n.team || []).map((m) => ({ emp_no: m.emp_no, share: Number(m.share || 0) })); const rest = Number(n.amount || 0) - members.reduce((s, m) => s + m.share, 0)
    return [{ ...base, key: n.id, first: true, emp_no: n.emp_no, name: `${n.emp_name} (قائد الفريق)`, title: n.job_title, amount: rest },
      ...members.map((m) => ({ ...base, key: `${n.id}-${m.emp_no}`, first: false, emp_no: m.emp_no, name: names[m.emp_no] || m.emp_no, title: 'عضو فريق', amount: m.share }))]
  }), [filtered, names])
  const total = lines.reduce((s, l) => s + l.amount, 0)
  const byTrack = Object.keys(TRACKS).map((t) => ({ t, n: filtered.filter((x) => x.track === t).length, sum: lines.filter((l) => l.n.track === t).reduce((s, l) => s + l.amount, 0) })).filter((x) => x.n)
  const pickable = filtered.filter((n) => n.status === 'approved'); const chosen = pickable.filter((n) => sel[n.id])
  const scopeLabel = `${track ? TRACKS[track].name : 'جميع المسارات'} — ${q ? ['', 'الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'][q] : 'السنة كاملة'} ${year}`
  const target = (chosen.length ? lines.filter((l) => sel[l.n.id]) : lines)
  const targetTotal = target.reduce((s, l) => s + l.amount, 0)

  const exp = () => {
    const rows = target.map((l, i) => ({ 'م': i + 1, 'الرقم الوظيفي': l.emp_no, 'الاسم': l.name, 'المسمى الوظيفي': l.title, 'التقسيم': l.division, 'المسار': l.track, 'الدورة / المركز': l.period, 'المبلغ (ر.ع)': l.amount }))
    const sum = [...Object.keys(TRACKS).map((t) => ({ 'البند': TRACKS[t].name, 'العدد': target.filter((l) => l.n.track === t && l.first).length, 'المبلغ (ر.ع)': target.filter((l) => l.n.track === t).reduce((s, l) => s + l.amount, 0) })), { 'البند': 'الإجمالي', 'العدد': target.filter((l) => l.first).length, 'المبلغ (ر.ع)': targetTotal }]
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'الكشف'); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sum), 'الملخص'); XLSX.writeFile(wb, `payout-statement-${year}.xlsx`)
  }
  const print = () => {
    const base = location.origin + asset('brand/'); const font = location.origin + asset('fonts/zarid-regular.woff2'); const w = window.open('', '_blank')
    const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
    w.document.write(`<html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>كشف الإحالة للصرف</title><style>@font-face{font-family:Zarid;src:url(${font})}@page{size:A4 landscape;margin:12mm}body{font-family:Zarid,Tahoma;color:#00253e;font-size:12px}
      .hd{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #00827a;padding-bottom:8px}.hd img{height:54px}h1{font-size:20px;margin:6px 0}.meta{display:flex;gap:24px;margin:8px 0;font-size:12px}
      table{width:100%;border-collapse:collapse;margin-top:8px}th{background:#00253e;color:#fff;padding:6px 5px;font-size:11px}td{border:1px solid #cfd8de;padding:5px;vertical-align:top}tr:nth-child(even) td{background:#f4f7f9}.num{text-align:center}
      .sum{margin-top:12px;display:flex;gap:30px}.sum table{width:auto}.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:46px;text-align:center}.sign div{border-top:1px solid #00253e;padding-top:6px}</style></head><body>
      <div class="hd"><div><h1>كشف الإحالة للصرف</h1><div>وزارة الإسكان والتخطيط العمراني · المديرية العامة للشؤون الإدارية والمالية</div></div><img src="${base}logo-horizontal.png"></div>
      <div class="meta"><span><b>النطاق:</b> ${esc(scopeLabel)}</span><span><b>تاريخ الإصدار:</b> ${todayStr()}</span><span><b>أعدّه:</b> ${esc(me.full_name)}</span><span><b>عدد المستحقين:</b> ${target.filter((l) => l.first).length}</span></div>
      <table><thead><tr><th>م</th><th>الرقم الوظيفي</th><th>الاسم</th><th>المسمى</th><th>التقسيم</th><th>المسار</th><th>الدورة / المركز</th><th>المبلغ المعتمد (ر.ع)</th></tr></thead><tbody>
      ${target.map((l, i) => `<tr><td class="num">${i + 1}</td><td class="num">${esc(l.emp_no)}</td><td>${esc(l.name)}</td><td>${esc(l.title)}</td><td>${esc(l.division)}</td><td>${esc(l.track)}</td><td>${esc(l.period)}</td><td class="num">${fmt(l.amount)}</td></tr>`).join('')}
      <tr><td colspan="7" style="text-align:left;font-weight:bold">الإجمالي</td><td class="num"><b>${fmt(targetTotal)}</b></td></tr></tbody></table>
      <div class="sum"><table><thead><tr><th>المسار</th><th>العدد</th><th>المبلغ (ر.ع)</th></tr></thead><tbody>${Object.keys(TRACKS).map((t) => ({ t, n: target.filter((l) => l.n.track === t && l.first).length, s: target.filter((l) => l.n.track === t).reduce((a, l) => a + l.amount, 0) })).filter((x) => x.n).map((x) => `<tr><td>${esc(TRACKS[x.t].name)}</td><td class="num">${x.n}</td><td class="num">${fmt(x.s)}</td></tr>`).join('')}</tbody></table></div>
      <div class="sign"><div>أعدّه<br>${esc(me.full_name)}</div><div>مدير الدائرة المالية</div><div>اعتماد المدير العام للشؤون الإدارية والمالية</div></div></body></html>`)
    w.document.close(); w.focus(); setTimeout(() => w.print(), 500)
  }
  const refer = async () => {
    if (!chosen.length) return say('حدّد الترشيحات المعتمدة أولاً')
    if (!window.confirm(`تصنيف ${chosen.length} ترشيحاً كـ«أُحيل للصرف»؟ تأكد أن الكشف اعتُمد داخلياً.`)) return
    setBusy(true); let ok = 0
    for (const n of chosen) { try { await rpc('transition_nomination', { p_id: n.id, p_action: 'to_pay' }); ok++ } catch { break } }
    setBusy(false); setSel({}); await reload(); say(`صُنّف ${ok} ترشيحاً كمُحال للصرف`)
  }
  const allSel = pickable.length > 0 && pickable.every((n) => sel[n.id])
  return <>
    <div className="card rolebar" style={{ '--c': ROLE_META.admin_fin.c }}><Icon n="coin" size={22} /><div><b>كشف الإحالة للصرف</b><div className="muted small">الصرف الفعلي يتم خارج المنصة. استخرج الكشف (Excel أو طباعة) وأرسله للاعتماد الداخلي، ثم صنّف الحوافز «أُحيل للصرف».</div></div></div>
    <div className="card flt" style={{ marginTop: 12 }}>
      <select value={track} onChange={(e) => { setTrack(e.target.value); setSel({}) }}><option value="">كل المسارات</option>{Object.entries(TRACKS).map(([k, T]) => <option key={k} value={k}>{T.short}</option>)}</select>
      <select value={q} onChange={(e) => { setQ(+e.target.value); setSel({}) }}><option value={0}>السنة كاملة</option>{[1, 2, 3, 4].map((x) => <option key={x} value={x}>{['', 'الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'][x]}</option>)}</select>
      <select value={status} onChange={(e) => { setStatus(e.target.value); setSel({}) }}><option value="approved">معتمدة بانتظار الإحالة</option><option value="to_pay">أُحيلت للصرف</option><option value="all">الكل (معتمد وما بعده)</option></select></div>
    <div className="grid g4 stg" style={{ marginTop: 12 }}><Kpi i={0} icon="users" c="#00827a" l="المستحقون" v={lines.filter((l) => l.first).length} /><Kpi i={1} icon="coin" c="#aa7f67" l="إجمالي المبالغ" v={fmt(total)} s="ر.ع" />
      {byTrack.slice(0, 2).map((x, i) => <Kpi key={x.t} i={i + 2} icon="spark" c={TRACKS[x.t].c} l={TRACKS[x.t].short} v={fmt(x.sum)} s={`${x.n} مستحق · ر.ع`} />)}</div>
    <Sec t="الكشف"><span className="muted small">{chosen.length ? `المحدد: ${chosen.length}` : 'يشمل الكشف كل الظاهر'} · الإجمالي <b className="num">{fmt(targetTotal)}</b> ر.ع</span>
      <button className="btn o s" onClick={exp} disabled={!target.length}><Icon n="download" size={15} />Excel</button><button className="btn o s" onClick={print} disabled={!target.length}><Icon n="report" size={15} />طباعة / PDF</button>
      {canAct && <button className="btn g s" onClick={refer} disabled={busy || !chosen.length}><Icon n="check" size={15} />تصنيف المحدد: أُحيل للصرف</button>}</Sec>
    <div className="card tw"><table><thead><tr>{canAct && <th><input type="checkbox" checked={allSel} onChange={(e) => setSel(e.target.checked ? Object.fromEntries(pickable.map((n) => [n.id, true])) : {})} /></th>}<th>م</th><th>الرقم</th><th>الاسم</th><th>المسمى</th><th>التقسيم</th><th>المسار</th><th>الدورة / المركز</th><th>المبلغ المعتمد</th><th>الحالة</th></tr></thead><tbody>
      {lines.map((l, i) => <tr key={l.key}>{canAct && <td>{l.first && l.n.status === 'approved' ? <input type="checkbox" checked={!!sel[l.n.id]} onChange={(e) => setSel({ ...sel, [l.n.id]: e.target.checked })} /> : null}</td>}<td className="num">{i + 1}</td><td className="num" dir="ltr">{l.emp_no}</td><td>{l.name}</td><td>{l.title}</td><td>{l.division}</td><td>{l.track}</td><td>{l.period}</td><td className="num"><b>{fmt(l.amount)}</b></td><td><span className={`pill st-${l.n.status}`}>{l.st}</span></td></tr>)}
      {!lines.length && <tr><td colSpan={canAct ? 10 : 9} className="muted">لا توجد حوافز بهذه المعايير.</td></tr>}</tbody>
      {lines.length > 0 && <tfoot><tr><td colSpan={canAct ? 8 : 7}>الإجمالي</td><td className="num">{fmt(total)}</td><td /></tr></tfoot>}</table></div>
  </>
}
