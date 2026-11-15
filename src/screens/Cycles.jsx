import { useEffect, useState } from 'react'
import { sb } from '../supabase'
import { useApp, Sec, TRACKS, periodName } from '../lib'

const STATE = { complete: ['مكتملة', 'st-approved'], incomplete: ['ناقصة', 'st-needs_info'], awaiting: ['بانتظار الاعتماد', 'st-recommended'], not_ended: ['غير منتهية', 'st-draft'] }
export default function Cycles() {
  const { year, ys, rpc, reload, say } = useApp(); const [rows, setRows] = useState([])
  const load = () => rpc('cycle_status', { p_year: year }).then((r) => setRows(r || []))
  useEffect(() => { load() }, [year])
  const upd = async (id, patch) => { const { error } = await sb.from('cycles').update(patch).eq('id', id); if (error) say(error.message); else { await reload(); load() } }
  return <>
    {!rows.length && <div className="card"><button className="btn t" onClick={async () => { await rpc('init_year', { p_year: year }); await reload(); load() }}>تهيئة دورات {year}</button></div>}
    {rows.length > 0 && <div className="card tw"><table><thead><tr><th>المسار</th><th>الدورة</th><th>الاستقبال</th><th>تاريخ الإقفال</th><th>الحالة</th><th>المعتمد</th></tr></thead><tbody>
      {rows.map((r) => <tr key={r.cycle_id}><td>{TRACKS[r.track].short}</td><td>{periodName(r.track, r.period)}</td>
        <td><button className={`btn s ${r.is_open ? 'g' : 'o'}`} disabled={ys?.closed} onClick={() => upd(r.cycle_id, { is_open: !r.is_open })}>{r.is_open ? 'مفتوحة' : 'مغلقة'}</button></td>
        <td><input type="date" className="inp" defaultValue={r.closes_on || ''} onBlur={(e) => upd(r.cycle_id, { closes_on: e.target.value || null })} /></td>
        <td><span className={`pill ${STATE[r.state][1]}`}>{STATE[r.state][0]}</span></td><td className="num">{r.expected ? `${r.approved_count} / ${r.expected}` : r.approved_count}</td></tr>)}</tbody></table></div>}
    <Sec t="إقفال السنة" /><div className="card">{ys?.closed ? <span className="pill st-honored">السنة مقفلة</span> :
      <button className="btn d" onClick={async () => { if (window.confirm(`اعتماد إقفال ${year}؟ لن يُقبل أي ترشيح جديد.`)) { await rpc('close_year', { p_year: year }); await reload(); load() } }}>اعتماد إقفال السنة</button>}</div>
  </>
}
