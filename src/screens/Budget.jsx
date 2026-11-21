import { useEffect, useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { sb } from '../supabase'
import { useApp, Kpi, Sec, fmt, shortName } from '../lib'
import Icon from '../Icon'

export default function Budget() {
  const { me, year, ys, rpc, say, dyears } = useApp()
  const [rows, setRows] = useState([]); const [sum, setSum] = useState(null)
  const load = useCallback(async () => {
    const t = await rpc('budget_table', { p_year: year }).catch(() => []); setRows(t || [])
    if (me.role !== 'dg') { const s = await rpc('budget_summary', { p_year: year }).catch(() => []); setSum(s?.[0] || null) }
  }, [year, me.role])
  useEffect(() => { load() }, [load])
  const canEdit = me.role === 'ejada' && !ys?.closed
  const saveOverride = async (r, v) => {
    const val = v === '' ? null : Number(v); if (val !== null && (!Number.isFinite(val) || val < 0)) return say('قيمة غير صالحة')
    if ((val ?? null) === (r.override === null ? null : Number(r.override))) return
    const { error } = await sb.from('division_years').update({ initiator_override: val }).eq('division_id', r.division_id).eq('year', year)
    if (error) say(error.message); else { say(val === null ? 'أُعيد للحساب التلقائي' : 'حُفظ المخصص'); load() }
  }
  const tot = (k) => rows.reduce((s, r) => s + Number(r[k] || 0), 0)
  const exp = () => { const ws = XLSX.utils.json_to_sheet(rows.map((r) => ({ 'التقسيم': r.division_name, 'عدد الموظفين': r.headcount, 'مخصص المبادر المحسوب': r.computed, 'مخصص المبادر المعتمد': r.allocation, 'خدمة المستفيدين': r.service_amount, 'المبتكر': r.innovator_amount, 'الإجمالي': r.total, 'المعتمد من المبادر': Number(r.q1) + Number(r.q2) + Number(r.q3) + Number(r.q4), 'المصروف': r.paid, 'الرصيد': r.balance })))
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'المخصصات'); XLSX.writeFile(wb, `budget-${year}.xlsx`) }
  const hcSum = dyears.filter((d) => d.year === year).reduce((s, d) => s + d.headcount, 0)

  if (me.role === 'dg') { const r = rows[0]; if (!r) return <div className="card empty"><Icon n="coin" size={26} />لم تُحدَّد مخصصات تقسيمك بعد.</div>
    const used = Number(r.q1) + Number(r.q2) + Number(r.q3) + Number(r.q4)
    return <>
      <div className="grid g4 stg"><Kpi i={0} icon="spark" c="#00827a" l="مخصص المبادر" v={fmt(r.allocation)} s="ر.ع للسنة" />
        {r.is_service && <Kpi i={1} icon="service" c="#0f446c" l="خدمة المستفيدين" v={fmt(r.service_amount)} s="ر.ع للسنة (4 جوائز)" />}
        {Number(r.innovator_amount) > 0 && <Kpi i={2} icon="bulb" c="#aa7f67" l="المبتكر (فوز من تقسيمك)" v={fmt(r.innovator_amount)} s="ر.ع" />}
        <Kpi i={3} icon="coin" c="#00253e" l="إجمالي مخصصات تقسيمك" v={fmt(r.total)} s="ر.ع" /></div>
      <Sec t="مخصص المبادر" /><div className="grid g4 stg"><Kpi i={0} icon="check" c="#43b987" l="المعتمد" v={fmt(used)} /><Kpi i={1} icon="download" c="#aa7f67" l="المصروف" v={fmt(r.paid)} /><Kpi i={2} icon="clock" c="#0f446c" l="معتمد غير مصروف" v={fmt(r.unpaid)} /><Kpi i={3} icon="shield" c="#00253e" l="الرصيد" v={fmt(r.balance)} /></div>
    </>
  }
  return <>
    {sum && <><div className="grid stg bsum"><Kpi i={0} icon="coin" c="#00253e" l="إجمالي حوافز الوزارة" v={fmt(sum.total_pool)} s={`${fmt(sum.approved_headcount)} موظفاً × ${fmt(ys?.rate_per_employee)} ر.ع`} />
      <Kpi i={1} icon="service" c="#0f446c" l="خدمة المستفيدين" v={fmt(sum.service_total)} s="ر.ع" /><Kpi i={2} icon="bulb" c="#aa7f67" l="المبتكر" v={fmt(sum.innovator_total)} s="ر.ع" />
      <Kpi i={3} icon="spark" c="#00827a" l="المتبقي للمبادر" v={fmt(sum.remaining)} s="ر.ع" /><Kpi i={4} icon="users" c="#43b987" l="قيمة الموظف الواحد" v={fmt(sum.per_employee)} s="ر.ع للمبادر" /></div>
      {sum.included_headcount !== sum.approved_headcount && <div className="alert w" style={{ marginTop: 12 }}><Icon n="alert" size={18} />مجموع موظفي التقسيمات ({fmt(sum.included_headcount)}) يختلف عن العدد المعتمد ({fmt(sum.approved_headcount)}) بمقدار {fmt(Math.abs(sum.approved_headcount - sum.included_headcount))}.</div>}
      {Math.abs(Number(sum.unallocated)) > 0.0005 && <div className="alert i" style={{ marginTop: 8 }}><Icon n="alert" size={18} />{Number(sum.unallocated) > 0 ? 'غير موزَّع على التقسيمات' : 'الموزَّع يتجاوز المتبقي'}: <b className="num">{fmt(Math.abs(sum.unallocated))}</b> ر.ع (بسبب التعديل اليدوي).</div>}</>}
    {!sum && !ys?.approved_headcount && <div className="alert i"><Icon n="alert" size={18} />لم يُدخل العدد الإجمالي المعتمد للموظفين لهذه السنة بعد (من الإعدادات).</div>}
    <Sec t="مخصصات التقسيمات"><span className="muted small">{canEdit ? 'يمكنك تعديل مخصص المبادر لأي تقسيم يدوياً' : ''}</span><button className="btn o s" onClick={exp}><Icon n="download" size={15} />Excel</button></Sec>
    <div className="card tw"><table className="btab"><thead><tr><th>التقسيم</th><th>الموظفون</th><th>المبادر المحسوب</th><th>المبادر المعتمد</th><th>خدمة المستفيدين</th><th>المبتكر</th><th>الإجمالي</th><th>معتمد مبادر</th><th>مصروف</th><th>الرصيد</th></tr></thead><tbody>
      {rows.map((r) => <tr key={r.division_id}><td>{shortName(r.division_name)}</td><td className="num">{fmt(r.headcount)}</td><td className="num muted">{r.computed === null ? '—' : fmt(r.computed)}</td>
        <td className="num">{canEdit ? <span className="ovr"><input className="inp" type="number" min="0" step="0.001" key={`${r.division_id}-${r.allocation}`} defaultValue={Number(r.allocation)} onBlur={(e) => saveOverride(r, e.target.value === String(Number(r.computed)) ? '' : e.target.value)} />{r.override !== null && <button className="rst" title="إعادة للحساب التلقائي" onClick={() => saveOverride(r, '')}>↺</button>}</span> : <>{fmt(r.allocation)}{r.override !== null && <span className="pill st-needs_info" style={{ marginInlineStart: 6 }}>يدوي</span>}</>}</td>
        <td className="num">{r.is_service ? fmt(r.service_amount) : <span className="muted">—</span>}</td><td className="num">{Number(r.innovator_amount) ? fmt(r.innovator_amount) : <span className="muted">—</span>}</td><td className="num"><b>{fmt(r.total)}</b></td>
        <td className="num">{fmt(Number(r.q1) + Number(r.q2) + Number(r.q3) + Number(r.q4))}</td><td className="num">{fmt(r.paid)}</td><td className="num">{fmt(r.balance)}</td></tr>)}</tbody>
      <tfoot><tr><td>الإجمالي</td><td className="num">{fmt(tot('headcount'))}</td><td className="num">{fmt(tot('computed'))}</td><td className="num">{fmt(tot('allocation'))}</td><td className="num">{fmt(tot('service_amount'))}</td><td className="num">{fmt(tot('innovator_amount'))}</td><td className="num">{fmt(tot('total'))}</td>
        <td className="num">{fmt(tot('q1') + tot('q2') + tot('q3') + tot('q4'))}</td><td className="num">{fmt(tot('paid'))}</td><td className="num">{fmt(tot('balance'))}</td></tr></tfoot></table></div>
  </>
}
