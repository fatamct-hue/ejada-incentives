import { useState } from 'react'
import { useApp, TRACKS, periodName, fmt, fdate, APPROVED, Pill } from '../lib'
import Icon, { TRACK_ICON } from '../Icon'
import { CountUp } from '../motion'
import NomModal from './NomModal'

export default function MyHome({ go }) {
  const { me, year, ys, noms, divisions, divName, years } = useApp()
  const [sel, setSel] = useState(null)
  const div = divisions.find((d) => d.id === me.division_id)
  const mine = noms.filter((n) => n.division_id === me.division_id)
  const yr = mine.filter((n) => n.year === year)
  const honored = yr.filter((n) => n.status === 'honored')
  const approved = yr.filter((n) => APPROVED.includes(n.status))
  const pending = yr.filter((n) => ['sent', 'review'].includes(n.status))
  const back = yr.filter((n) => n.status === 'needs_info'); const drafts = yr.filter((n) => n.status === 'draft')
  const per = (t) => ({ h: honored.filter((n) => n.track === t).length, a: approved.filter((n) => n.track === t).length })
  const byYear = years.map((y) => ({ y: y.year, c: mine.filter((n) => n.year === y.year && n.status === 'honored').length }))
  const dq = useApp().dyears.find((x) => x.division_id === me.division_id && x.year === year)?.service_quota
  const svc = (q) => yr.find((n) => n.track === 'service' && n.period === q && APPROVED.includes(n.status)) || yr.find((n) => n.track === 'service' && n.period === q && n.status !== 'draft')
  const ini = yr.filter((n) => n.track === 'initiator'); const inv = yr.filter((n) => n.track === 'innovator')
  return <>
    <div className="hero2"><i className="orb" />
      <div><div className="small" style={{ color: 'var(--cyan)', fontWeight: 600 }}>{div?.name}</div><h2>مرحباً، {me.full_name}</h2>
        <p>{back.length ? <>لديك <b style={{ color: 'var(--cyan)' }}>{back.length}</b> ترشيح مُعاد يحتاج استكمالك.</> : drafts.length ? <>لديك <b style={{ color: 'var(--cyan)' }}>{drafts.length}</b> مسودة لم تُرسل.</> : 'كل ترشيحاتك في مسارها.'}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <button className="btn c" style={{ background: 'var(--cyan)', color: 'var(--navy)' }} onClick={() => go('initiator')}><Icon n="spark" size={18} />ترشيح مبادر</button>
          {div?.is_service && <button className="btn o" style={{ background: 'transparent', color: '#fff', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.45)' }} onClick={() => go('service')}><Icon n="service" size={18} />ترشيح خدمة المستفيدين</button>}</div></div>
      <div className="cubes">{['trophy', 'service', 'spark'].map((k, i) => <div className="cube" key={k} style={{ '--d': `${i * -1.4}s` }}><Icon n={k} size={34} stroke={1.5} /></div>)}</div></div>

    <div className="sec"><h2>حصيلة التكريم في {year}</h2></div>
    <div className="honor stg">
      <div className="card kpi hbig" style={{ '--i': 0 }}><span className="kic"><Icon n="trophy" size={24} /></span><div className="l">مُكرَّمون هذه السنة</div><div className="v num"><CountUp value={honored.length} /></div><div className="s">{approved.length} معتمد · {pending.length} قيد الاعتماد</div></div>
      {Object.entries(TRACKS).map(([k, T], i) => { const p = per(k); return <div className="card kpi lift" key={k} style={{ '--c': T.c, '--i': i + 1 }}>
        <span className="kic"><Icon n={TRACK_ICON[k]} size={22} /></span><div className="l">{T.short}</div><div className="v num"><CountUp value={p.h} /></div><div className="s">مكرَّم · {p.a} معتمد</div></div> })}
    </div>

    {years.length > 1 && <><div className="sec"><h2>التكريم عبر السنوات</h2></div><div className="years">{byYear.map((b) => <div key={b.y} className={`yb ${b.y === year ? 'on' : ''}`}><b className="num">{b.c}</b><span>{b.y}</span></div>)}</div></>}

    {div?.is_service && <><div className="sec"><h2>خدمة المستفيدين — المستفيدون في كل ربع</h2><div className="sp" /><span className="muted small">المقرر للسنة: {dq ?? 4}</span></div>
      <div className="card tcard" style={{ '--c': TRACKS.service.c }}><div className="slots">{[1, 2, 3, 4].map((q) => { const n = svc(q); const win = n && APPROVED.includes(n.status)
        return <div key={q} className={`slot ${win ? 'win' : n ? 'pend' : ''}`} style={{ '--i': q, '--c': TRACKS.service.c }}><span className="muted">{periodName('service', q)}</span>
          {win ? <><Icon n="trophy" size={26} style={{ color: 'var(--sand)' }} /><span className="sn">{n.emp_name}</span><Pill s={n.status} /></> : n ? <><Icon n="clock" size={22} style={{ color: TRACKS.service.c }} /><b>قيد المراجعة</b></> : <><Icon n="clock" size={22} style={{ color: '#9aa7ae' }} /><span className="muted">لا ترشيح</span></>}</div> })}</div></div></>}

    {div && !div.is_service && <><div className="sec"><h2>خدمة المستفيدين</h2></div>
      <div className="card lockcard" style={{ display: 'flex', gap: 14, alignItems: 'center' }}><div className="ic-box" style={{ width: 52, height: 52, borderRadius: 15, display: 'grid', placeItems: 'center', background: 'var(--grey-b)', color: '#7b878b' }}><Icon n="lock" size={26} /></div>
        <div><b>المسار غير متاح لتقسيمك</b><div className="muted small">مسار خدمة المستفيدين مخصص للجهات التي تقدم خدمات مباشرة للمستفيدين. إن كان تقسيمك مستحقاً فتواصل مع فريق الإجادة لإضافته.</div></div></div></>}
    <div className="sec"><h2>المبادر — ترشيحات السنة</h2><div className="sp" /><button className="btn s t" onClick={() => go('initiator')}><Icon n="plus" size={15} />جديد</button></div>
    <div className="card tcard" style={{ '--c': TRACKS.initiator.c }}>{ini.length ? <div className="tw"><table><thead><tr><th>الموظف</th><th>المبادرة</th><th>الدورة</th><th>المبلغ</th><th>الحالة</th><th /></tr></thead><tbody>
      {ini.map((n) => <tr key={n.id}><td>{n.emp_name}</td><td>{n.initiative_title || '—'}</td><td>{periodName('initiator', n.period)}</td><td className="num">{fmt(n.amount)}</td><td><Pill s={n.status} /></td>
        <td>{['draft', 'needs_info'].includes(n.status) ? <button className="btn s t" onClick={() => { sessionStorage.setItem('edit', n.id); go('initiator') }}>استكمال</button> : <button className="btn s o" onClick={() => setSel(n)}>فتح</button>}</td></tr>)}</tbody></table></div> : <span className="muted">لا توجد ترشيحات مبادر هذه السنة.</span>}</div>

    {inv.length > 0 && <><div className="sec"><h2>المبتكر — فوز تقسيمك</h2></div><div className="card tcard" style={{ '--c': TRACKS.innovator.c }}><div className="slots" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
      {inv.map((n, i) => <div key={n.id} className="slot win" style={{ '--c': TRACKS.innovator.c, '--i': i }}><Icon n="bulb" size={26} style={{ color: TRACKS.innovator.c }} /><b>المركز {n.rank} · {periodName('innovator', n.period)}</b><span className="sn">{n.emp_name}</span><span className="muted">{n.idea_title}</span><Pill s={n.status} /></div>)}</div></div></>}
    {sel && <NomModal nom={sel} onClose={() => setSel(null)} />}
  </>
}
