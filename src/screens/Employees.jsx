import { useEffect, useMemo, useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { sb } from '../supabase'
import { useApp, Kpi, Sec, fmt } from '../lib'
import Icon from '../Icon'

// توحيد أسماء التقسيمات لمطابقة صيغ مختلفة («بمحافظة مسقط» = «(مسقط)»، وهمزات وتاء مربوطة)
const norm = (s) => String(s || '').replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
  .replace(/بمحافظه\s*(.+)$/, '($1)').replace(/\s*\(\s*/g, ' (').replace(/\s*\)\s*/g, ')').replace(/\s+/g, ' ').trim()
const pick = (row, names) => { const k = Object.keys(row).find((x) => names.some((n) => String(x).replace(/\s/g, '').includes(n))); return k ? String(row[k]).trim() : '' }

export default function Employees() {
  const { me, divisions, dyears, year, say } = useApp()
  const [list, setList] = useState([]); const [q, setQ] = useState(''); const [div, setDiv] = useState(''); const [hideDemo, setHideDemo] = useState(true)
  const [prev, setPrev] = useState(null); const [busy, setBusy] = useState(false)
  const load = useCallback(async () => { const out = []; for (let from = 0; from < 20000; from += 1000) { const { data, error } = await sb.from('employees').select('*').order('emp_no').range(from, from + 999); if (error) { say(error.message); break } out.push(...data); if (data.length < 1000) break } setList(out) }, [])
  useEffect(() => { load() }, [load])
  const byNorm = useMemo(() => Object.fromEntries(divisions.map((d) => [norm(d.name), d.id])), [divisions])
  const real = list.filter((e) => !e.is_demo); const demoN = list.length - real.length
  const counts = useMemo(() => { const m = {}; real.forEach((e) => { m[e.division_id] = (m[e.division_id] || 0) + 1 }); return m }, [real])
  const hc = (id) => dyears.find((d) => d.division_id === id && d.year === year)?.headcount ?? 0
  const shown = useMemo(() => list.filter((e) => (!hideDemo || !e.is_demo) && (!div || e.division_id === div) && (!q || `${e.emp_no} ${e.name} ${e.title || ''}`.includes(q))).slice(0, 300), [list, hideDemo, div, q])

  const onFile = async (ev) => {
    const f = ev.target.files[0]; if (!f) return
    const wb = XLSX.read(await f.arrayBuffer()); const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' })
    const ok = [], badDiv = {}, seen = new Set(); let missing = 0, dups = 0
    rows.forEach((r) => {
      const emp_no = pick(r, ['الرقمالوظيفي', 'رقمالموظف', 'الرقم']), name = pick(r, ['الاسم', 'اسمالموظف']), title = pick(r, ['المسمى']), dn = pick(r, ['التقسيم', 'المديرية', 'الجهة'])
      if (!emp_no || !name) { missing++; return }
      if (seen.has(emp_no)) { dups++; return } seen.add(emp_no)
      const id = byNorm[norm(dn)]; if (!id) { badDiv[dn || '(فارغ)'] = (badDiv[dn || '(فارغ)'] || 0) + 1; return }
      ok.push({ emp_no, name, title: title || null, division_id: id, is_demo: false })
    })
    setPrev({ file: f.name, total: rows.length, ok, badDiv, missing, dups }); ev.target.value = ''
  }
  const commit = async () => {
    setBusy(true)
    for (let i = 0; i < prev.ok.length; i += 500) { const { error } = await sb.from('employees').upsert(prev.ok.slice(i, i + 500), { onConflict: 'emp_no' }); if (error) { setBusy(false); return say(error.message) } }
    setBusy(false); say(`اعتُمد استيراد ${prev.ok.length} موظفاً`); setPrev(null); load()
  }
  const exp = () => { const ws = XLSX.utils.json_to_sheet(list.filter((e) => !e.is_demo).map((e) => ({ 'الرقم الوظيفي': e.emp_no, 'الاسم': e.name, 'المسمى الوظيفي': e.title, 'التقسيم': divisions.find((d) => d.id === e.division_id)?.name }))); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'الموظفون'); XLSX.writeFile(wb, 'employees.xlsx') }
  const divRows = divisions.filter((d) => d.active && !d.counted_in_parent)
  return <>
    <div className="grid g4 stg"><Kpi i={0} icon="users" c="#00827a" l="الموظفون في السجل" v={fmt(real.length)} /><Kpi i={1} icon="unit" c="#0f446c" l="العدد المعتمد للتقسيمات" v={fmt(divRows.reduce((s, d) => s + hc(d.id), 0))} />
      <Kpi i={2} icon="check" c="#43b987" l="تقسيمات مكتملة" v={divRows.filter((d) => counts[d.id] >= hc(d.id) && hc(d.id) > 0).length} s={`من ${divRows.length}`} /><Kpi i={3} icon="alert" c="#aa7f67" l="سجلات تجريبية" v={demoN} s="تُحذف قبل التفعيل" /></div>
    <Sec t="استيراد من Excel"><button className="btn o s" onClick={exp} disabled={!real.length}><Icon n="download" size={15} />تصدير السجل</button></Sec>
    <div className="card"><div className="muted small" style={{ marginBottom: 8 }}>الأعمدة: <b>الرقم الوظيفي، الاسم، المسمى الوظيفي، التقسيم</b>. اسم التقسيم يقبل صيغة «بمحافظة مسقط» أو «(مسقط)». الرقم المكرر يُحدَّث ولا يُكرَّر.</div>
      <label className="btn t" style={{ cursor: 'pointer' }}><Icon n="upload" size={18} />اختيار ملف Excel<input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} style={{ display: 'none' }} /></label>
      {prev && <div className="prevbox"><b>{prev.file}</b> — {prev.total} صفاً
        <div className="grid g3" style={{ margin: '10px 0' }}><div className="alert ok"><Icon n="check" size={18} />صالح للاستيراد: <b className="num">{prev.ok.length}</b></div>
          <div className={`alert ${Object.keys(prev.badDiv).length ? 'r' : 'i'}`}><Icon n="alert" size={18} />تقسيم غير معروف: <b className="num">{Object.values(prev.badDiv).reduce((a, b) => a + b, 0)}</b></div>
          <div className="alert w"><Icon n="alert" size={18} />ناقص/مكرر: <b className="num">{prev.missing + prev.dups}</b></div></div>
        {Object.keys(prev.badDiv).length > 0 && <div className="small" style={{ marginBottom: 8 }}>أسماء لم تُطابَق: {Object.entries(prev.badDiv).slice(0, 8).map(([k, v]) => `«${k}» (${v})`).join('، ')}. صحّحها في الملف أو أضف التقسيم من الإعدادات.</div>}
        <div style={{ display: 'flex', gap: 8 }}><button className="btn g" disabled={busy || !prev.ok.length} onClick={commit}><Icon n="check" size={16} />اعتماد استيراد {prev.ok.length} موظفاً</button><button className="btn o" onClick={() => setPrev(null)}>إلغاء</button></div></div>}</div>
    <Sec t="مطابقة الأعداد مع التقسيمات" /><div className="card tw"><table><thead><tr><th>التقسيم</th><th>العدد المعتمد</th><th>في السجل</th><th>الفرق</th></tr></thead><tbody>
      {divRows.map((d) => { const diff = (counts[d.id] || 0) - hc(d.id); return <tr key={d.id}><td>{d.name}</td><td className="num">{fmt(hc(d.id))}</td><td className="num">{fmt(counts[d.id] || 0)}</td><td className="num"><span className={`pill ${diff === 0 ? 'st-approved' : 'st-needs_info'}`}>{diff === 0 ? 'مطابق' : diff > 0 ? `+${diff}` : diff}</span></td></tr> })}</tbody></table></div>
    <Sec t="السجل"><div className="flt"><input className="inp" placeholder="بحث بالاسم أو الرقم" value={q} onChange={(e) => setQ(e.target.value)} /><select value={div} onChange={(e) => setDiv(e.target.value)}><option value="">كل التقسيمات</option>{divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
      <label className="small"><input type="checkbox" checked={hideDemo} onChange={(e) => setHideDemo(e.target.checked)} /> إخفاء التجريبي</label></div></Sec>
    <div className="card tw"><table><thead><tr><th>الرقم</th><th>الاسم</th><th>المسمى</th><th>التقسيم</th></tr></thead><tbody>
      {shown.map((e) => <tr key={e.emp_no}><td className="num" dir="ltr">{e.emp_no}</td><td>{e.name}{e.is_demo && <span className="tag">تجريبي</span>}</td><td>{e.title}</td><td>{divisions.find((d) => d.id === e.division_id)?.name}</td></tr>)}
      {!shown.length && <tr><td colSpan="4" className="muted">لا توجد سجلات. استورد ملف الموظفين.</td></tr>}</tbody></table>{list.length > 300 && <div className="muted small" style={{ padding: 8 }}>يُعرض أول 300 نتيجة، استخدم البحث.</div>}</div>
  </>
}
