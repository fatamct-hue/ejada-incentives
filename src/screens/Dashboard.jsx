import { useMemo, useState } from 'react'
import { useApp, Kpi, Sec, TRACKS, ST, STN, Tk, periodName, APPROVED, fmt } from '../lib'
import Icon from '../Icon'

function Bars({ labels, series }) {
  const max = Math.max(1, ...series.flatMap((s) => s.v))
  return <><div className="bars">{labels.map((l, i) => <div className="bgrp" key={l}><div className="bcols">
    {series.map((s, j) => <div className="bcol" key={j} style={{ height: `${Math.max(3, (s.v[i] / max) * 100)}%`, background: s.c, '--i': i * series.length + j }}><b className="num">{s.v[i]}</b></div>)}</div></div>)}</div>
    <div className="blabs">{labels.map((l) => <span key={l}>{l}</span>)}</div></>
}
const DCOL = { sent: '#6f92b4', review: '#0f446c', recommended: '#00827a', approved: '#43b987', to_pay: '#aa7f67', paid: '#e4c6ac', honored: '#00253e', needs_info: '#d9a441' }
function Donut({ parts, total }) {
  const R = 54, C = 2 * Math.PI * R; let off = 0
  return <svg className="donut" viewBox="0 0 150 150" role="img"><circle cx="75" cy="75" r={R} stroke="#eceae4" />
    {parts.filter((p) => p.v).map((p, i) => { const len = (p.v / total) * C; const el = <circle key={p.k} cx="75" cy="75" r={R} stroke={p.c} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} style={{ animationDelay: `${i * 120}ms` }} />; off += len; return el })}
    <text x="75" y="82" textAnchor="middle" fontSize="26" fill="#00253e">{total}</text></svg>
}
export default function Dashboard() {
  const { year, noms, divisions, dyears, cycles, divName } = useApp()
  const [fl, setFl] = useState({ track: '', period: '', gov: '', div: '' })
  const ns = useMemo(() => noms.filter((n) => n.year === year && n.status !== 'draft').filter((n) =>
    (!fl.track || n.track === fl.track) && (!fl.period || n.period === +fl.period) && (!fl.div || n.division_id === fl.div) &&
    (!fl.gov || divisions.find((d) => d.id === n.division_id)?.governorate === fl.gov)), [noms, fl, year, divisions])
  const govs = [...new Set(divisions.map((d) => d.governorate).filter(Boolean))]
  const cnt = (f) => ns.filter(f).length
  const q = [1, 2, 3, 4]
  const tr = (t, p) => ns.filter((n) => n.track === t && n.period === p && APPROVED.includes(n.status)).length
  const follow = divisions.filter((d) => d.active && (!fl.div || d.id === fl.div)).map((d) => {
    const mine = noms.filter((n) => n.year === year && n.division_id === d.id)
    return { d, started: mine.length, sent: mine.filter((n) => n.status !== 'draft').length, wait: mine.filter((n) => ['sent', 'review', 'recommended'].includes(n.status)).length, back: mine.filter((n) => n.status === 'needs_info').length }
  })
  const alerts = follow.filter((x) => x.sent === 0).length
  return <>
    <div className="card flt">
      <select value={fl.track} onChange={(e) => setFl({ ...fl, track: e.target.value })}><option value="">كل المسارات</option>{Object.entries(TRACKS).map(([k, t]) => <option key={k} value={k}>{t.short}</option>)}</select>
      <select value={fl.period} onChange={(e) => setFl({ ...fl, period: e.target.value })}><option value="">كل الدورات</option>{[1, 2, 3, 4].map((p) => <option key={p} value={p}>الدورة {p}</option>)}</select>
      <select value={fl.gov} onChange={(e) => setFl({ ...fl, gov: e.target.value })}><option value="">كل المحافظات</option>{govs.map((g) => <option key={g}>{g}</option>)}</select>
      <select value={fl.div} onChange={(e) => setFl({ ...fl, div: e.target.value })}><option value="">كل التقسيمات</option>{divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
    <div className="grid g4 stg" style={{ marginTop: 14 }}><Kpi i={0} icon="send" c="#0f446c" l="ترشيحات مرسلة" v={ns.length} /><Kpi i={1} icon="clock" c="#aa7f67" l="قيد المراجعة" v={cnt((n) => ['sent', 'review', 'recommended'].includes(n.status))} />
      <Kpi i={2} icon="check" c="#43b987" l="معتمدة" v={cnt((n) => APPROVED.includes(n.status))} /><Kpi i={3} icon="trophy" c="#00253e" l="تم تكريمهم" v={cnt((n) => n.status === 'honored')} /></div>
    <div className="grid g2 stg" style={{ marginTop: 14 }}>
      <div className="card"><h3>مقارنة الأرباع — المعتمدون</h3><Bars labels={['ر1', 'ر2', 'ر3', 'ر4']} series={[{ c: TRACKS.service.c, v: q.map((p) => tr('service', p)) }, { c: TRACKS.initiator.c, v: q.map((p) => tr('initiator', p)) }]} />
        <div className="legend"><span><i style={{ background: TRACKS.service.c }} />خدمة المستفيدين</span><span><i style={{ background: TRACKS.initiator.c }} />المبادر</span></div></div>
      <div className="card"><h3>المبتكر — نصفا السنة</h3><Bars labels={['الأول', 'الثاني']} series={[{ c: TRACKS.innovator.c, v: [1, 2].map((p) => tr('innovator', p)) }]} /></div></div>
    <Sec t="توزيع الحالات" /><div className="card" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}><Donut total={ns.length} parts={ST.filter((s) => s[0] !== 'draft').map(([k]) => ({ k, c: DCOL[k], v: cnt((n) => n.status === k) }))} /><div className="flt" style={{ flex: 1 }}>{ST.filter((s) => s[0] !== 'draft').map(([k, l]) => <span key={k} className={`pill st-${k}`}>{l}: {cnt((n) => n.status === k)}</span>)}</div></div>
    <Sec t="متابعة الجهات" />{alerts > 0 && <div className="alert w" style={{ marginBottom: 8 }}>{alerts} جهة لم ترسل أي ترشيح هذه السنة.</div>}
    <div className="card tw"><table><thead><tr><th>الجهة</th><th>بدأت الإدخال</th><th>أرسلت</th><th>بانتظار الاعتماد</th><th>معادة</th></tr></thead><tbody>
      {follow.map((x) => <tr key={x.d.id}><td>{x.d.name}</td><td>{x.started ? 'نعم' : 'لا'}</td><td className="num">{x.sent}</td><td className="num">{x.wait}</td><td className="num">{x.back}</td></tr>)}</tbody></table></div>
  </>
}
