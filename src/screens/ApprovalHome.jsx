import { useState, useMemo } from 'react'
import { useApp, Kpi, Sec, TRACKS, APPROVED, periodName, Pill, Tk } from '../lib'
import Icon from '../Icon'
import { RoleHero, Task } from '../ui'
import NomModal from './NomModal'

export default function ApprovalHome({ go }) {
  const { me, year, noms, divisions, divName } = useApp()
  const [sel, setSel] = useState(null)
  const yr = useMemo(() => noms.filter((n) => n.year === year && n.track !== 'initiator'), [noms, year])
  const wait = yr.filter((n) => n.status === 'review')
  const svcDivs = divisions.filter((d) => d.active && d.is_service)
  const won = (d, q) => yr.find((n) => n.track === 'service' && n.division_id === d.id && n.period === q && APPROVED.includes(n.status))
  const pend = (d, q) => yr.find((n) => n.track === 'service' && n.division_id === d.id && n.period === q && n.status === 'review')
  const inv = yr.filter((n) => n.track === 'innovator')
  return <>
    <RoleHero role="dev" name={me.full_name} stat={[wait.length, wait.length === 1 ? 'ترشيح بانتظار اعتمادك' : 'ترشيحات بانتظار اعتمادك']} />
    <div className="grid g4 stg" style={{ marginTop: 14 }}>
      <Kpi i={0} icon="review" c="#0f446c" l="بانتظار اعتمادي" v={wait.length} />
      <Kpi i={1} icon="check" c="#43b987" l="معتمدة" v={yr.filter((n) => APPROVED.includes(n.status)).length} />
      <Kpi i={2} icon="alert" c="#d9a441" l="مُعادة للاستكمال" v={yr.filter((n) => n.status === 'needs_info').length} />
      <Kpi i={3} icon="service" c="#00253e" l="جهات لها فائز معتمد" v={new Set(yr.filter((n) => n.track === 'service' && APPROVED.includes(n.status)).map((n) => n.division_id)).size} s={`من ${svcDivs.length}`} /></div>
    <Sec t="بانتظار اعتمادك"></Sec>
    <div className="card tw">{wait.length ? <table><thead><tr><th>الموظف</th><th>الجهة</th><th>المسار</th><th>الدورة</th><th>الحالة</th><th /></tr></thead><tbody>
      {wait.map((n) => <tr key={n.id}><td>{n.emp_name}</td><td>{divName(n.division_id)}</td><td><Tk t={n.track} /></td><td>{n.rank ? `المركز ${n.rank} · ` : ''}{periodName(n.track, n.period)}</td><td><Pill s={n.status} /></td>
        <td><button className="btn s g" onClick={() => setSel(n)}>مراجعة واعتماد</button></td></tr>)}</tbody></table> : <div className="empty"><Icon n="check" size={26} />لا توجد ترشيحات بانتظار اعتمادك.</div>}</div>
    <Sec t="خدمة المستفيدين — فائز كل جهة في كل ربع" />
    <div className="card tw"><table className="matrix"><thead><tr><th>الجهة</th>{[1, 2, 3, 4].map((q) => <th key={q}>{periodName('service', q)}</th>)}</tr></thead><tbody>
      {svcDivs.map((d) => <tr key={d.id}><td>{d.name}</td>{[1, 2, 3, 4].map((q) => { const w = won(d, q), p = pend(d, q)
        return <td key={q}>{w ? <span className="cell win" title={w.emp_name}><Icon n="trophy" size={14} />{w.emp_name}</span> : p ? <span className="cell pend"><Icon n="clock" size={14} />بانتظار</span> : <span className="cell none">—</span>}</td> })}</tr>)}</tbody></table></div>
    <Sec t="المبتكر — النتائج (يُدخلها فريق الإجادة من منصة نبتكر)" /><div className="grid g3 stg">{[1, 2].flatMap((h) => [1, 2, 3].map((r) => ({ h, r }))).map(({ h, r }, i) => { const n = inv.find((x) => x.period === h && x.rank === r)
      return <div key={`${h}-${r}`} className="card lift" style={{ '--i': i }}><div className="muted small">{periodName('innovator', h)} · المركز {r}</div>{n ? <><b>{n.emp_name}</b><div className="muted small">{n.idea_title}</div><Pill s={n.status} /></> : <span className="muted">لم تُدخل بعد</span>}</div> })}</div>
    {sel && <NomModal nom={sel} onClose={() => setSel(null)} />}
  </>
}
