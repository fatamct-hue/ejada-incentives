import { useMemo } from 'react'
import { useApp, Kpi, Sec, TRACKS, APPROVED, periodName, shortName } from '../lib'
import Icon from '../Icon'
import { RoleHero, Funnel, Task } from '../ui'
import { TRACK_ICON } from '../Icon'

export default function CommandHome({ go }) {
  const { me, year, noms, divisions, cycles, requests } = useApp()
  const yr = useMemo(() => noms.filter((n) => n.year === year), [noms, year])
  const c = (f) => yr.filter(f).length
  const sent = c((n) => n.status === 'sent'), review = c((n) => n.status === 'review'), paid = c((n) => n.status === 'paid')
  const back = c((n) => n.status === 'needs_info'); const pendReq = requests.filter((r) => r.status === 'pending').length
  const notStarted = divisions.filter((d) => d.active && d.is_service && !yr.some((n) => n.division_id === d.id && n.status !== 'draft')).length
  const tasks = [[sent, 'ترشيحات مرسلة بانتظار الاستلام', 'send', 'review'], [review, 'قيد المراجعة بانتظار التوصية', 'review', 'review'], [paid, 'مصروفة بانتظار تسجيل التكريم', 'trophy', 'review'], [pendReq, 'طلبات انضمام مستخدمين بانتظار الاعتماد', 'users', 'settings']]
  const total = tasks.reduce((s, t) => s + t[0], 0)
  const stages = [['sent', 'مرسل', '#6f92b4'], ['review', 'قيد المراجعة', '#0f446c'], ['recommended', 'موصى به', '#00827a'], ['approved', 'معتمد', '#43b987'], ['to_pay', 'أُحيل للصرف', '#aa7f67'], ['paid', 'صُرف', '#c79a7f'], ['honored', 'تم التكريم', '#00253e']].map(([k, l, col]) => ({ k, l, c: col, n: c((n) => n.status === k) }))
  const svcDivs = divisions.filter((d) => d.active && d.is_service)
  const openCycles = cycles.filter((x) => x.year === year && x.is_open)
  return <>
    <RoleHero role="ejada" name={me.full_name} stat={[total, total === 1 ? 'إجراء بانتظارك' : 'إجراءات بانتظارك']} />
    <div className="grid g4 stg" style={{ marginTop: 14 }}>
      <Kpi i={0} icon="send" c="#0f446c" l="ترشيحات واردة" v={c((n) => n.status !== 'draft')} />
      <Kpi i={1} icon="clock" c="#aa7f67" l="قيد المراجعة والتوصية" v={sent + review + c((n) => n.status === 'recommended')} />
      <Kpi i={2} icon="check" c="#43b987" l="معتمدة" v={c((n) => APPROVED.includes(n.status))} />
      <Kpi i={3} icon="trophy" c="#00253e" l="مُكرَّمون" v={c((n) => n.status === 'honored')} /></div>
    <Sec t="المطلوب منك الآن" />
    <div className="tasks stg">{tasks.map(([n, l, ic, to], i) => <Task key={l} n={n} label={l} icon={ic} onClick={() => go(to)} />)}</div>
    {(back > 0 || notStarted > 0) && <div className="alerts" style={{ marginTop: 10 }}>
      {back > 0 && <div className="alert w"><Icon n="alert" size={18} />{back} ترشيح مُعاد للجهات بانتظار الاستكمال.</div>}
      {notStarted > 0 && <div className="alert i"><Icon n="clock" size={18} />{notStarted} جهة مشمولة بخدمة المستفيدين لم ترسل أي ترشيح هذه السنة.</div>}</div>}
    <Sec t="نظرة عامة على المسارات" />
    <div className="grid g3 stg">{Object.entries(TRACKS).map(([k, T], i) => { const t = yr.filter((n) => n.track === k); const ap = t.filter((n) => APPROVED.includes(n.status)).length
      const exp = k === 'service' ? svcDivs.length * 4 : k === 'innovator' ? 6 : 0
      return <div className="card trk lift" key={k} style={{ '--c': T.c, '--i': i }}><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><div className="ic-box"><Icon n={TRACK_ICON[k]} size={26} /></div><div><h3 style={{ fontSize: 17 }}>{T.name}</h3><div className="muted small">يعتمده: {T.appr}</div></div></div>
        <div className="tmini"><div><b className="num">{t.filter((n) => n.status !== 'draft').length}</b><span>واردة</span></div><div><b className="num">{t.filter((n) => n.status === 'recommended').length}</b><span>بانتظار الاعتماد</span></div><div><b className="num">{ap}</b><span>معتمدة</span></div><div><b className="num">{t.filter((n) => n.status === 'honored').length}</b><span>مُكرَّمة</span></div></div>
        {exp > 0 && <><div className="prog"><i style={{ width: `${Math.min(100, (ap / exp) * 100)}%`, background: T.c }} /></div><div className="muted small">{ap} من {exp} {k === 'service' ? 'جائزة (جهة × ربع)' : 'مراكز'}</div></>}</div> })}</div>
    <Sec t="حصر الجهات"><span className="muted small">حالة كل جهة في المسارات</span></Sec>
    <div className="card tw"><table className="matrix"><thead><tr><th>الجهة</th><th colSpan="4">خدمة المستفيدين (الأرباع)</th><th>المبادر</th><th>المبتكر</th></tr></thead><tbody>
      {divisions.filter((d) => d.active).map((d) => { const dn = yr.filter((n) => n.division_id === d.id)
        const sv = (q) => { const w = dn.find((n) => n.track === 'service' && n.period === q && APPROVED.includes(n.status)); const p = dn.find((n) => n.track === 'service' && n.period === q && ['sent', 'review', 'recommended', 'needs_info'].includes(n.status)); return w ? <span className="cell win" title={w.emp_name}><Icon n="trophy" size={13} />{q}</span> : p ? <span className="cell pend">{q}</span> : <span className="cell none">{d.is_service ? '·' : '—'}</span> }
        const ini = dn.filter((n) => n.track === 'initiator' && n.status !== 'draft'); const inv = dn.filter((n) => n.track === 'innovator')
        return <tr key={d.id}><td>{shortName(d.name)}</td>{[1, 2, 3, 4].map((q) => <td key={q}>{sv(q)}</td>)}<td>{ini.length ? <span className="cell win">{ini.length} · معتمد {ini.filter((n) => APPROVED.includes(n.status)).length}</span> : <span className="cell none">·</span>}</td><td>{inv.length ? <span className="cell win"><Icon n="bulb" size={13} />{inv.length}</span> : <span className="cell none">·</span>}</td></tr> })}</tbody></table></div>
    <Sec t="مسار الترشيحات"><span className="muted small">اضغط مرحلة لفتح قائمتها</span></Sec>
    <div className="card"><Funnel stages={stages} onPick={() => go('review')} /></div>
    <Sec t="الدورات المفتوحة" /><div className="card flt">{openCycles.length ? openCycles.sort((a, b) => a.track.localeCompare(b.track) || a.period - b.period).map((x) => <span key={x.id} className="pill st-approved">{TRACKS[x.track].short} · {periodName(x.track, x.period)}</span>) : <span className="muted">لا توجد دورات مفتوحة. افتحها من «الدورات والإقفال».</span>}</div>
  </>
}
