import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { useApp, Kpi, Sec, fmt } from '../lib'

export default function Budget() {
  const { year, ys, rpc, divisions, dyears, me } = useApp()
  const [rows, setRows] = useState([])
  useEffect(() => { rpc('division_budget', { p_year: year }).then((r) => setRows(r || [])).catch(() => {}) }, [year])
  const sum = (k) => rows.reduce((s, r) => s + Number(r[k]), 0)
  const exp = () => { const ws = XLSX.utils.json_to_sheet(rows.map((r) => ({ 'التقسيم': r.division_name, 'عدد الموظفين': r.headcount, 'المخصص': r.allocation, 'ر1': r.q1, 'ر2': r.q2, 'ر3': r.q3, 'ر4': r.q4, 'المصروف': r.paid, 'الالتزامات غير المصروفة': r.unpaid, 'الرصيد': r.balance })))
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'الميزانية'); XLSX.writeFile(wb, `budget-${year}.xlsx`) }
  const hcSum = dyears.filter((d) => d.year === year).reduce((s, d) => s + d.headcount, 0)
  return <>
    {me.role === 'ejada' && ys?.approved_headcount && hcSum !== ys.approved_headcount &&
      <div className="alert w" style={{ marginBottom: 12 }}>مجموع موظفي التقسيمات ({hcSum}) يختلف عن العدد الإجمالي المعتمد ({ys.approved_headcount}).</div>}
    {!ys?.approved_headcount && <div className="alert i">لم يُدخل العدد الإجمالي المعتمد للموظفين لهذه السنة بعد (من الإعدادات).</div>}
    {me.role !== 'dg' && <div className="grid g4"><Kpi l="إجمالي المخصصات" v={fmt(sum('allocation'))} /><Kpi l="المعتمد" v={fmt(sum('q1') + sum('q2') + sum('q3') + sum('q4'))} /><Kpi l="المصروف" v={fmt(sum('paid'))} /><Kpi l="الرصيد" v={fmt(sum('balance'))} /></div>}
    <Sec t="مخصصات المبادر"><button className="btn o s" onClick={exp}>تصدير Excel</button></Sec>
    <div className="card tw"><table><thead><tr><th>التقسيم</th><th>الموظفون</th><th>المخصص</th><th>ر1</th><th>ر2</th><th>ر3</th><th>ر4</th><th>المصروف</th><th>غير مصروف</th><th>الرصيد</th></tr></thead><tbody>
      {rows.map((r) => <tr key={r.division_id}><td>{r.division_name}</td><td className="num">{r.headcount}</td><td className="num">{fmt(r.allocation)}</td>
        {['q1', 'q2', 'q3', 'q4', 'paid', 'unpaid', 'balance'].map((k) => <td className="num" key={k}>{fmt(r[k])}</td>)}</tr>)}</tbody></table></div>
  </>
}
