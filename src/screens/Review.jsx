import { useEffect, useState } from 'react'
import { useApp, Pill, Tk, periodName, approverOf, Sec, ROLE_META } from '../lib'
import Icon from '../Icon'
import NomModal from './NomModal'

const TABS = {
  ejada: [['new', 'بانتظار الاستلام', (n) => n.status === 'sent'], ['rev', 'بانتظار اعتماد الجهة', (n) => n.status === 'review'], ['ret', 'معادة', (n) => n.status === 'needs_info'], ['hon', 'محالة للصرف بانتظار التكريم', (n) => n.status === 'to_pay'], ['all', 'الكل', (n) => n.status !== 'draft']],
  dev: [['wait', 'بانتظار الاعتماد', (n) => n.status === 'review'], ['done', 'المعتمدة', (n) => ['approved', 'to_pay', 'honored'].includes(n.status)]],
  admin_fin: [['wait', 'بانتظار الاعتماد', (n) => n.status === 'review' && n.track === 'initiator'], ['appr', 'معتمدة للإحالة', (n) => n.status === 'approved'],
    ['pay', 'محالة للصرف', (n) => n.status === 'to_pay'], ['done', 'مكرَّمة', (n) => n.status === 'honored']],
}
export default function Review() {
  const { me, year, noms, divName, rpc } = useApp()
  const tabs = TABS[me.role]; const [tab, setTab] = useState(tabs[0][0]); const [sel, setSel] = useState(null); const [conf, setConf] = useState([])
  useEffect(() => { if (me.role === 'ejada') rpc('find_conflicts', { p_year: year }).then((r) => setConf(r || [])).catch(() => {}) }, [year, noms])
  const f = tabs.find((t) => t[0] === tab)[2]
  const rows = noms.filter((n) => n.year === year && f(n))
  const emps = [...new Set(conf.map((c) => c.emp_no))]
  const M = ROLE_META[me.role]
  return <>
    <div className="card rolebar" style={{ '--c': M.c }}><Icon n={M.icon} size={22} /><div><b>{M.title}</b><div className="muted small">{M.duties.join(' · ')}</div></div></div>
    {emps.length > 0 && <div className="alert w" style={{ marginBottom: 12 }}><div><b>تعارض مسارات:</b> {emps.length} موظف مرشحون في أكثر من مسار هذه السنة.
      {emps.map((e) => { const rs = conf.filter((c) => c.emp_no === e); return <div key={e} className="small">{rs[0].emp_name} ({e}): {rs.map((r, i) => <span key={i}>{r.track} {periodName(r.track, r.period)} — </span>)}
        {rs.map((r) => <button key={r.nomination_id} className="btn s o" style={{ marginInlineStart: 4 }} onClick={async () => { await rpc('resolve_conflict', { p_keep: r.nomination_id, p_note: 'تعارض مسار' }); location.reload() }}>إبقاء {r.track}</button>)}</div> })}</div></div>}
    <div className="tabs">{tabs.map(([k, l, fn]) => <button key={k} className={`btn s ${k === tab ? '' : 'o'}`} onClick={() => setTab(k)}>{l} ({noms.filter((n) => n.year === year && fn(n)).length})</button>)}</div>
    <div className="card tw"><table><thead><tr><th>الموظف</th><th>الجهة</th><th>المسار</th><th>الدورة</th><th>الحالة</th><th /></tr></thead><tbody>
      {rows.map((n) => <tr key={n.id}><td>{n.emp_name}</td><td>{divName(n.division_id)}</td><td><Tk t={n.track} /></td><td>{periodName(n.track, n.period)}</td><td><Pill s={n.status} /></td>
        <td><button className="btn s t" onClick={() => setSel(n)}>فتح</button></td></tr>)}
      {!rows.length && <tr><td colSpan="6" className="muted">لا توجد عناصر.</td></tr>}</tbody></table></div>
    {sel && <NomModal nom={sel} onClose={() => setSel(null)} />}
  </>
}
