import { useState } from 'react'
import { useApp, Sec, Pill, periodName, fmt, fdate } from '../lib'
import NomModal from './NomModal'

export default function Innovator() {
  const { me, year, ys, noms, divisions, divName, rpc, reload, say } = useApp()
  const list = noms.filter((n) => n.year === year && n.track === 'innovator')
  const blank = { period: 1, rank: 1, emp_no: '', division_id: '', idea_title: '', idea_no: '', approved_on: '', results_doc: '', is_team: false, team: [] }
  const [f, setF] = useState(blank); const [sel, setSel] = useState(null)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const prize = ys?.innovator_prizes?.[f.rank]
  const share = f.team.reduce((s, m) => s + (+m.share || 0), 0)
  const save = async () => { await rpc('save_innovator_result', { p: { ...f, year } }); await reload(); say('حُفظت النتيجة'); setF(blank) }
  return <>
    {me.role === 'ejada' && <div className="card"><h3>إدخال نتيجة معتمدة من «نبتكر»</h3><div className="form" style={{ marginTop: 10 }}>
      <div className="f"><label>النصف</label><select value={f.period} onChange={(e) => set('period', +e.target.value)}><option value={1}>النصف الأول</option><option value={2}>النصف الثاني</option></select></div>
      <div className="f"><label>المركز</label><select value={f.rank} onChange={(e) => set('rank', +e.target.value)}>{[1, 2, 3].map((r) => <option key={r} value={r}>المركز {r} — {fmt(ys?.innovator_prizes?.[r])} ر.ع</option>)}</select></div>
      <div className="f"><label>الرقم الوظيفي للفائز (أو قائد الفريق)</label><input value={f.emp_no} onChange={(e) => set('emp_no', e.target.value)} dir="ltr" /></div>
      <div className="f"><label>المديرية</label><select value={f.division_id} onChange={(e) => set('division_id', e.target.value)}><option value="">حسب تقسيم الموظف</option>{divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
      <div className="f"><label>اسم الفكرة</label><input value={f.idea_title} onChange={(e) => set('idea_title', e.target.value)} /></div>
      <div className="f"><label>رقم الفكرة في «نبتكر»</label><input value={f.idea_no} onChange={(e) => set('idea_no', e.target.value)} /></div>
      <div className="f"><label>تاريخ الاعتماد</label><input type="date" value={f.approved_on} onChange={(e) => set('approved_on', e.target.value)} /></div>
      <div className="f"><label>مستند اعتماد النتائج (رابط أو رقم)</label><input value={f.results_doc} onChange={(e) => set('results_doc', e.target.value)} /></div>
      <div className="f w"><label><input type="checkbox" checked={f.is_team} onChange={(e) => set('is_team', e.target.checked)} /> فريق</label></div>
      {f.is_team && <div className="f w">{f.team.map((m, i) => <div className="flt" key={i}>
        <input className="inp" placeholder="الرقم الوظيفي" value={m.emp_no} dir="ltr" onChange={(e) => set('team', f.team.map((x, j) => j === i ? { ...x, emp_no: e.target.value } : x))} />
        <input className="inp" type="number" placeholder="الحصة (ر.ع)" value={m.share} onChange={(e) => set('team', f.team.map((x, j) => j === i ? { ...x, share: e.target.value } : x))} /></div>)}
        <div className="flt"><button className="btn o s" onClick={() => set('team', [...f.team, { emp_no: '', share: '' }])}>+ عضو</button>
          <span className={share > prize ? 'alert r' : 'muted small'}>مجموع الحصص {fmt(share)} من {fmt(prize)}</span></div></div>}
    </div><div style={{ marginTop: 12 }}><button className="btn g" onClick={save}>حفظ النتيجة</button></div></div>}
    <Sec t={`نتائج ${year}`} />
    <div className="card tw"><table><thead><tr><th>النصف</th><th>المركز</th><th>الفائز</th><th>المديرية</th><th>الفكرة</th><th>الاعتماد</th><th>الحالة</th><th /></tr></thead><tbody>
      {list.sort((a, b) => a.period - b.period || a.rank - b.rank).map((n) => <tr key={n.id}><td>{periodName('innovator', n.period)}</td><td>{n.rank}</td><td>{n.emp_name}{n.is_team ? ' (فريق)' : ''}</td><td>{divName(n.division_id)}</td>
        <td>{n.idea_title} <span className="muted small">{n.idea_no}</span></td><td>{fdate(n.approved_on)}</td><td><Pill s={n.status} /></td><td><button className="btn s o" onClick={() => setSel(n)}>فتح</button></td></tr>)}
      {!list.length && <tr><td colSpan="8" className="muted">لا توجد نتائج مدخلة.</td></tr>}</tbody></table></div>
    {sel && <NomModal nom={sel} onClose={() => setSel(null)} />}
  </>
}
