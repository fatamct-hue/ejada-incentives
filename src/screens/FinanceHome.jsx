import { useState, useEffect, useMemo } from 'react'
import { useApp, Kpi, Sec, TRACKS, periodName, Pill, fmt } from '../lib'
import Icon from '../Icon'
import { RoleHero } from '../ui'
import NomModal from './NomModal'

export default function FinanceHome({ go }) {
  const { me, year, noms, divName, rpc } = useApp()
  const [sel, setSel] = useState(null); const [rows, setRows] = useState([])
  useEffect(() => { rpc('budget_table', { p_year: year }).then((r) => setRows(r || [])).catch(() => {}) }, [year])
  const yr = useMemo(() => noms.filter((n) => n.year === year), [noms, year])
  const sum = (k) => rows.reduce((s, r) => s + Number(r[k]), 0)
  const lanes = [
    ['wait', 'بانتظار اعتمادي (المبادر)', 'review', yr.filter((n) => n.track === 'initiator' && n.status === 'review'), '#0f446c'],
    ['appr', 'معتمدة بانتظار الإحالة للصرف', 'check', yr.filter((n) => n.status === 'approved'), '#43b987'],
    ['pay', 'محالة بانتظار تسجيل الصرف', 'coin', yr.filter((n) => n.status === 'to_pay'), '#aa7f67'],
  ]
  const todo = lanes.reduce((s, l) => s + l[3].length, 0)
  const top = [...rows].sort((a, b) => b.allocation - a.allocation).slice(0, 10)
  return <>
    <RoleHero role="admin_fin" name={me.full_name} stat={[todo, todo === 1 ? 'إجراء مالي بانتظارك' : 'إجراءات مالية بانتظارك']} />
    <div className="grid g4 stg" style={{ marginTop: 14 }}>
      <Kpi i={0} icon="coin" c="#aa7f67" l="إجمالي مخصصات المبادر" v={fmt(sum('allocation'))} s="ر.ع" />
      <Kpi i={1} icon="check" c="#43b987" l="المعتمد" v={fmt(sum('q1') + sum('q2') + sum('q3') + sum('q4'))} s="ر.ع" />
      <Kpi i={2} icon="download" c="#0f446c" l="المصروف فعلياً" v={fmt(sum('paid'))} s="ر.ع" />
      <Kpi i={3} icon="shield" c="#00253e" l="الرصيد المتاح" v={fmt(sum('balance'))} s="ر.ع" /></div>
    <Sec t="مسار الصرف" /><div className="grid g3 stg">{lanes.map(([k, l, ic, list, col], i) => <div className="card lane" key={k} style={{ '--c': col, '--i': i }}>
      <div className="lh"><Icon n={ic} size={20} /><b>{l}</b><span className="lc num">{list.length}</span></div>
      {list.slice(0, 5).map((n) => <button key={n.id} className="li" onClick={() => setSel(n)}><span>{n.emp_name}</span><span className="muted small">{divName(n.division_id)}</span><b className="num">{fmt(n.amount)}</b></button>)}
      {!list.length && <div className="muted small" style={{ padding: '8px 0' }}>لا يوجد.</div>}
      {list.length > 5 && <button className="btn s o" onClick={() => go('review')}>عرض الكل ({list.length})</button>}</div>)}</div>
    <Sec t="استهلاك المخصصات"><button className="btn s o" onClick={() => go('budget')}>التفاصيل الكاملة</button></Sec>
    <div className="card">{top.length ? top.map((r) => { const used = r.q1 + r.q2 + r.q3 + r.q4; const pct = r.allocation ? Math.min(100, (used / r.allocation) * 100) : 0
      return <div className="ur" key={r.division_id}><span className="un">{r.division_name}</span><span className="ub"><i style={{ width: `${pct}%` }} /></span><span className="num uv">{fmt(used)} / {fmt(r.allocation)}</span></div> }) : <span className="muted">أدخل العدد المعتمد وأعداد التقسيمات لتظهر المخصصات.</span>}</div>
    {sel && <NomModal nom={sel} onClose={() => setSel(null)} />}
  </>
}
