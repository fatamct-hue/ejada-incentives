import { useApp, TRACKS, ROLES, approverOf } from '../lib'

const STEPS = ['مسودة', 'مرسل', 'قيد المراجعة', 'موصى به', 'معتمد', 'أُحيل للصرف', 'صُرف', 'تم التكريم']
export default function Home({ go }) {
  const { me, noms } = useApp()
  const cnt = (f) => noms.filter(f).length
  const todo = {
    dg: [[cnt((n) => n.status === 'needs_info'), 'ترشيحات معادة تحتاج استكمالاً'], [cnt((n) => n.status === 'draft'), 'مسودات لم تُرسل']],
    ejada: [[cnt((n) => n.status === 'sent'), 'ترشيحات مرسلة بانتظار الاستلام'], [cnt((n) => n.status === 'review'), 'قيد المراجعة بانتظار التوصية'], [cnt((n) => n.status === 'paid'), 'مصروفة بانتظار تسجيل التكريم']],
    dev: [[cnt((n) => n.status === 'recommended' && approverOf(n.track) === 'dev'), 'موصى بها بانتظار اعتمادكم']],
    admin_fin: [[cnt((n) => n.status === 'recommended' && n.track === 'initiator'), 'مبادرات موصى بها بانتظار اعتمادكم'], [cnt((n) => n.status === 'approved'), 'معتمدة بانتظار الإحالة للصرف'], [cnt((n) => n.status === 'to_pay'), 'محالة بانتظار تسجيل الصرف']],
  }[me.role]
  return <>
    <div className="hero"><div><h2>مرحباً، {me.full_name}</h2><p>{ROLES[me.role]}</p></div></div>
    <div className="sec"><h2>المطلوب منك الآن</h2></div>
    <div className="card">{todo.map(([n, l]) => <div className="todo" key={l}><div className="n num">{n}</div><div>{l}</div></div>)}</div>
    <div className="sec"><h2>المسارات</h2></div>
    <div className="grid g3">{Object.entries(TRACKS).map(([k, T]) => <div className="card trk" key={k} style={{ '--c': T.c }}>
      <h3 style={{ fontSize: 18 }}>{T.name}</h3><div className="muted small">{T.desc}</div>
      <dl><dt>الاعتماد</dt><dd>{T.appr}</dd><dt>الدورية</dt><dd>{T.period}</dd><dt>المكافأة</dt><dd>{T.reward}</dd><dt>المشمولون</dt><dd>{T.scope}</dd></dl></div>)}</div>
    <div className="sec"><h2>مراحل الترشيح</h2></div>
    <div className="card"><div className="steps">{STEPS.map((s, i) => <div className="step" key={s}><div className="dot">{i + 1}</div>{s}</div>)}</div></div>
  </>
}
