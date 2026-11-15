import { useState, useEffect } from 'react'
import { useApp, Kpi, Sec, Pill, Tk, TRACKS, periodName, fmt, APPROVED } from '../lib'
import NomModal from './NomModal'

export default function DG({ go }) {
  const { me, year, ys, noms, cycles, divisions, rpc } = useApp()
  const [sel, setSel] = useState(null); const [bud, setBud] = useState(null)
  const div = divisions.find((d) => d.id === me.division_id)
  const mine = noms.filter((n) => n.year === year && n.division_id === me.division_id)
  useEffect(() => { rpc('division_budget', { p_year: year }).then((r) => setBud(r?.[0] || null)).catch(() => {}) }, [year])
  const c = (f) => mine.filter(f).length
  return <>
    <Sec t={div?.name}><button className="btn t" onClick={() => go('initiator')}>ترشيح مبادر</button>
      {div?.is_service && <button className="btn" onClick={() => go('service')}>ترشيح خدمة المستفيدين</button>}</Sec>
    <div className="grid g4"><Kpi l="مسودات" v={c((n) => n.status === 'draft')} /><Kpi l="مرسلة" v={c((n) => ['sent', 'review', 'recommended'].includes(n.status))} />
      <Kpi l="معادة" v={c((n) => n.status === 'needs_info')} /><Kpi l="معتمدة" v={c((n) => APPROVED.includes(n.status))} /></div>
    {div?.is_service && <><Sec t="جوائز خدمة المستفيدين" /><div className="grid g4">{[1, 2, 3, 4].map((q) => {
      const w = mine.find((n) => n.track === 'service' && n.period === q && APPROVED.includes(n.status))
      return <div className="card" key={q}><b>{periodName('service', q)}</b><div>{w ? w.emp_name : <span className="muted">{mine.some((n) => n.track === 'service' && n.period === q) ? 'قيد المراجعة' : '—'}</span>}</div>{w && <><div className="num">{fmt(ys?.service_award)} ر.ع</div><Pill s={w.status} /></>}</div>
    })}</div></>}
    {bud && <><Sec t="مخصص المبادر" /><div className="grid g4"><Kpi l="المخصص" v={fmt(bud.allocation)} /><Kpi l="المعتمد" v={fmt(bud.q1 + bud.q2 + bud.q3 + bud.q4)} /><Kpi l="المصروف" v={fmt(bud.paid)} /><Kpi l="الرصيد" v={fmt(bud.balance)} /></div></>}
    <Sec t="دورات السنة" /><div className="card flt">{cycles.filter((x) => x.year === year && x.track !== 'innovator').sort((a, b) => a.track.localeCompare(b.track) || a.period - b.period).map((x) =>
      <span key={x.id} className={`pill ${x.is_open ? 'st-approved' : 'st-draft'}`}>{TRACKS[x.track].short} · {periodName(x.track, x.period)} · {x.is_open ? 'مفتوحة' : 'مغلقة'}</span>)}</div>
    <Sec t="ترشيحات التقسيم" /><div className="card tw"><table><thead><tr><th>الموظف</th><th>المسار</th><th>الدورة</th><th>الحالة</th><th /></tr></thead><tbody>
      {mine.map((n) => <tr key={n.id}><td>{n.emp_name}</td><td><Tk t={n.track} /></td><td>{periodName(n.track, n.period)}</td><td><Pill s={n.status} /></td>
        <td>{['draft', 'needs_info'].includes(n.status) && n.track !== 'innovator' ? <button className="btn s t" onClick={() => { sessionStorage.setItem('edit', n.id); go(n.track) }}>استكمال</button> : <button className="btn s o" onClick={() => setSel(n)}>فتح</button>}</td></tr>)}
      {!mine.length && <tr><td colSpan="5" className="muted">لا توجد ترشيحات بعد.</td></tr>}</tbody></table></div>
    {sel && <NomModal nom={sel} onClose={() => setSel(null)} />}
  </>
}
