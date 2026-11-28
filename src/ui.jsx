import Icon from './Icon'
import { CountUp } from './motion'
import { ROLE_META, ST } from './lib'

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

// أعمدة متحركة (مقارنة الأرباع)
export function Bars({ labels, series }) {
  const max = Math.max(1, ...series.flatMap((s) => s.v))
  return <><div className="bars">{labels.map((l, i) => <div className="bgrp" key={l}><div className="bcols">
    {series.map((s, j) => <div className="bcol" key={j} style={{ height: `${Math.max(3, (s.v[i] / max) * 100)}%`, background: s.c, '--i': i * series.length + j }}><b className="num">{s.v[i]}</b></div>)}</div></div>)}</div>
    <div className="blabs">{labels.map((l) => <span key={l}>{l}</span>)}</div></>
}
export const DCOL = { review: '#0f446c', approved: '#43b987', to_pay: '#aa7f67', honored: '#00253e', needs_info: '#d9a441' }
export function Donut({ parts, total }) {
  const R = 54, C = 2 * Math.PI * R; let off = 0
  return <svg className="donut" viewBox="0 0 150 150" role="img"><circle cx="75" cy="75" r={R} stroke="#eceae4" />
    {parts.filter((p) => p.v).map((p, i) => { const len = (p.v / (total || 1)) * C; const el = <circle key={p.k} cx="75" cy="75" r={R} stroke={p.c} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} style={{ animationDelay: `${i * 120}ms` }} />; off += len; return el })}
    <text x="75" y="82" textAnchor="middle" fontSize="26" fill="#00253e">{total}</text></svg>
}

// حلقة تقدّم متحركة
export function Ring({ value = 0, max = 1, size = 76, color = '#00827a', children }) {
  const R = 30, C = 2 * Math.PI * R, p = Math.max(0, Math.min(1, max ? value / max : 0))
  return <span className="ring" style={{ width: size, height: size }}><svg viewBox="0 0 76 76"><circle cx="38" cy="38" r={R} className="rbg" /><circle cx="38" cy="38" r={R} className="rfg" stroke={color} strokeDasharray={`${p * C} ${C}`} /></svg><b className="num">{children}</b></span>
}
