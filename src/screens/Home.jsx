import { useApp, TRACKS, ROLES, approverOf } from '../lib'
import Icon, { TRACK_ICON } from '../Icon'
import { CountUp } from '../motion'

const STEPS = [['مسودة', 'form'], ['مرسل', 'send'], ['قيد المراجعة', 'review'], ['موصى به', 'shield'], ['معتمد', 'check'], ['أُحيل للصرف', 'coin'], ['صُرف', 'download'], ['تم التكريم', 'trophy']]
export default function Home({ go }) {
  const { me, noms, year } = useApp()
  const cnt = (f) => noms.filter((n) => n.year === year && f(n)).length
  const todo = {
    dg: [[cnt((n) => n.status === 'needs_info'), 'ترشيحات معادة تحتاج استكمالاً', 'alert'], [cnt((n) => n.status === 'draft'), 'مسودات لم تُرسل', 'form']],
    ejada: [[cnt((n) => n.status === 'sent'), 'ترشيحات مرسلة بانتظار الاستلام', 'send'], [cnt((n) => n.status === 'review'), 'قيد المراجعة بانتظار التوصية', 'review'], [cnt((n) => n.status === 'paid'), 'مصروفة بانتظار تسجيل التكريم', 'trophy']],
    dev: [[cnt((n) => n.status === 'recommended' && approverOf(n.track) === 'dev'), 'موصى بها بانتظار اعتمادكم', 'check']],
    admin_fin: [[cnt((n) => n.status === 'recommended' && n.track === 'initiator'), 'مبادرات موصى بها بانتظار اعتمادكم', 'check'], [cnt((n) => n.status === 'approved'), 'معتمدة بانتظار الإحالة للصرف', 'coin'], [cnt((n) => n.status === 'to_pay'), 'محالة بانتظار تسجيل الصرف', 'download']],
  }[me.role]
  const total = todo.reduce((s, t) => s + t[0], 0)
  return <>
    <div className="hero2"><i className="orb" />
      <div><div className="small" style={{ color: 'var(--cyan)', fontWeight: 600 }}>{ROLES[me.role]}</div>
        <h2>مرحباً، {me.full_name}</h2>
        <p>{total ? <>لديك <b className="num" style={{ color: 'var(--cyan)', fontSize: 22 }}><CountUp value={total} /></b> {total === 1 ? 'إجراء بانتظارك' : 'إجراءات بانتظارك'} اليوم.</> : 'لا توجد إجراءات معلّقة. يومك هادئ.'}</p></div>
      <div className="cubes">{['service', 'bulb', 'spark'].map((k, i) => <div className="cube" key={k} style={{ '--d': `${i * -1.4}s` }}><Icon n={k} size={34} stroke={1.5} /></div>)}</div>
    </div>
    <div className="sec"><h2>المطلوب منك الآن</h2></div>
    <div className="card stg">{todo.map(([n, l, ic], i) => <div className="todo" key={l} style={{ '--i': i }}>
      <div className={`n num ${n ? '' : 'zero'}`}>{n ? <CountUp value={n} /> : <Icon n="check" size={26} />}</div><Icon n={ic} size={20} style={{ color: 'var(--teal)' }} /><div>{l}</div></div>)}</div>
    <div className="sec"><h2>المسارات</h2></div>
    <div className="grid g3 stg">{Object.entries(TRACKS).map(([k, T], i) => <div className="card trk lift" key={k} style={{ '--c': T.c, '--i': i }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><div className="ic-box"><Icon n={TRACK_ICON[k]} size={28} /></div><h3 style={{ fontSize: 18 }}>{T.name}</h3></div>
      <div className="muted small">{T.desc}</div>
      <dl><dt>الاعتماد</dt><dd>{T.appr}</dd><dt>الدورية</dt><dd>{T.period}</dd><dt>المكافأة</dt><dd>{T.reward}</dd><dt>المشمولون</dt><dd>{T.scope}</dd></dl></div>)}</div>
    <div className="sec"><h2>مراحل الترشيح</h2></div>
    <div className="card"><div className="steps2">{STEPS.map(([s, ic], i) => <div className="stp" key={s} style={{ '--i': i }}><div className="dot"><Icon n={ic} size={20} /></div>{s}</div>)}</div></div>
  </>
}
