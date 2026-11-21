import { useMemo } from 'react'
import { useApp, Kpi, Sec, TRACKS, APPROVED, periodName } from '../lib'
import Icon from '../Icon'
import { RoleHero, Funnel, Task } from '../ui'

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
    <Sec t="مسار الترشيحات"><span className="muted small">اضغط مرحلة لفتح قائمتها</span></Sec>
    <div className="card"><Funnel stages={stages} onPick={() => go('review')} /></div>
    <Sec t="الدورات المفتوحة" /><div className="card flt">{openCycles.length ? openCycles.sort((a, b) => a.track.localeCompare(b.track) || a.period - b.period).map((x) => <span key={x.id} className="pill st-approved">{TRACKS[x.track].short} · {periodName(x.track, x.period)}</span>) : <span className="muted">لا توجد دورات مفتوحة. افتحها من «الدورات والإقفال».</span>}</div>
  </>
}
