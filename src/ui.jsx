import Icon from './Icon'
import { CountUp } from './motion'
import { ROLE_META } from './lib'

// بانر الدور: يوضح من أنت وما مسؤولياتك
export function RoleHero({ role, name, children, stat }) {
  const m = ROLE_META[role]
  return <div className="hero2 rh" style={{ '--h1': m.c2, '--h2': m.c }}><i className="orb" />
    <div><div className="rtag"><Icon n={m.icon} size={16} />{m.title}</div>
      <h2>مرحباً، {name}</h2>
      <div className="duties">{m.duties.map((d) => <span key={d}><Icon n="check" size={13} stroke={2.4} />{d}</span>)}</div>
      {children}</div>
    {stat && <div className="rstat"><div className="rn num"><CountUp value={stat[0]} /></div><div>{stat[1]}</div></div>}
  </div>
}

// قمع المراحل: عدد الترشيحات في كل مرحلة
export function Funnel({ stages, onPick }) {
  const max = Math.max(1, ...stages.map((s) => s.n))
  return <div className="funnel">{stages.map((s, i) => <button key={s.k} className="fstage" style={{ '--i': i, '--c': s.c }} onClick={() => onPick && onPick(s)} disabled={!onPick}>
    <span className="fl">{s.l}</span><span className="fbar"><i style={{ width: `${Math.max(4, (s.n / max) * 100)}%` }} /></span><b className="num">{s.n}</b></button>)}</div>
}

// بطاقة مهمة قابلة للضغط
export function Task({ n, label, icon, onClick, tone }) {
  return <button className={`task ${n ? 'hot' : ''} ${tone || ''}`} onClick={onClick}><span className="tn num">{n ? <CountUp value={n} /> : <Icon n="check" size={20} />}</span>
    <Icon n={icon} size={18} /><span className="tl">{label}</span><Icon n="arrow" size={16} className="tgo" /></button>
}
