import { useState } from 'react'
import * as XLSX from 'xlsx'
import { sb } from '../supabase'
import { useApp, Sec, ROLES, shortName, fdate } from '../lib'
import Icon from '../Icon'

const readXlsx = async (file) => { const wb = XLSX.read(await file.arrayBuffer()); return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' }) }
export default function Settings() {
  const { year, ys, divisions, dyears, users, requests, reload, say, rpc } = useApp()
  const [dec, setDec] = useState({})
  const pending = (requests || []).filter((r) => r.status === 'pending')
  const decide = async (r, ok) => {
    const d = dec[r.id] || {}; const role = d.role || r.requested_role; const div = d.division ?? r.division_id
    try { if (ok) { await rpc('approve_access_request', { p_id: r.id, p_role: role, p_division: role === 'dg' ? div : null }); say('اعتُمد الطلب. يستطيع المستخدم الدخول الآن برمز البريد.') } else { await rpc('reject_access_request', { p_id: r.id, p_note: null }); say('رُفض الطلب') } reload() } catch { /* رسالة الخطأ تظهر من rpc */ }
  }
  const [tab, setTab] = useState(() => (sessionStorage.getItem('settab') || 'year'))
  const [nd, setNd] = useState({ name: '', parent_id: '', counted_in_parent: false, governorate: '', is_service: false, headcount: '' })
  const [nu, setNu] = useState({ email: '', full_name: '', role: 'dg', division_id: '' })
  const run = async (p, ok = 'تم الحفظ') => { const { error } = await p; if (error) say(error.message); else { say(ok); reload() } }
  const hc = (id) => dyears.find((d) => d.division_id === id && d.year === year)?.headcount ?? ''
  const importEmployees = async (e) => {
    const rows = await readXlsx(e.target.files[0]); const byName = Object.fromEntries(divisions.map((d) => [d.name.trim(), d.id])); const bad = []
    const recs = rows.map((r, i) => { const div = byName[String(r['التقسيم']).trim()]; if (!div) bad.push(i + 2)
      return { emp_no: String(r['الرقم الوظيفي']).trim(), name: String(r['الاسم']).trim(), title: String(r['المسمى الوظيفي'] || '').trim(), division_id: div } })
    if (bad.length) return say(`تقسيم غير معروف في الصفوف: ${bad.slice(0, 10).join('، ')}`)
    for (let i = 0; i < recs.length; i += 500) { const { error } = await sb.from('employees').upsert(recs.slice(i, i + 500)); if (error) return say(error.message) }
    say(`استُوردت ${recs.length} سجلاً`); e.target.value = ''
  }
  const importDivisions = async (e) => {
    const rows = await readXlsx(e.target.files[0])
    for (const r of rows) {
      const { data, error } = await sb.from('divisions').upsert({ name: String(r['التقسيم']).trim(), governorate: r['المحافظة'] || null, is_service: r['خدمة المستفيدين'] === 'نعم', counted_in_parent: r['محسوب ضمن الأعلى'] === 'نعم' }, { onConflict: 'name' }).select().single()
      if (error) return say(error.message)
      await sb.from('division_years').upsert({ division_id: data.id, year, headcount: +r['عدد الموظفين'] || 0, reference_date: ys?.reference_date })
    }
    for (const r of rows.filter((r) => r['التقسيم الأعلى'])) { const p = (await sb.from('divisions').select('id').eq('name', String(r['التقسيم الأعلى']).trim()).single()).data
      if (p) await sb.from('divisions').update({ parent_id: p.id }).eq('name', String(r['التقسيم']).trim()) }
    say('اكتمل الاستيراد'); reload(); e.target.value = ''
  }
  const addDiv = async () => {
    const { data, error } = await sb.from('divisions').insert({ name: nd.name, parent_id: nd.parent_id || null, counted_in_parent: nd.counted_in_parent, governorate: nd.governorate || null, is_service: nd.is_service }).select().single()
    if (error) return say(error.message)
    await sb.from('division_years').upsert({ division_id: data.id, year, headcount: +nd.headcount || 0 }); setNd({ name: '', parent_id: '', counted_in_parent: false, governorate: '', is_service: false, headcount: '' }); say('أُضيف التقسيم'); reload()
  }
  return <>
    <div className="tabs">{[['req', `طلبات الانضمام${pending.length ? ' (' + pending.length + ')' : ''}`], ['year', 'السنة'], ['div', 'التقسيمات'], ['users', 'المستخدمون'], ['emp', 'سجل الموظفين']].map(([k, l]) => <button key={k} className={`btn s ${tab === k ? '' : 'o'}`} onClick={() => setTab(k)}>{l}</button>)}</div>
    {tab === 'req' && <>
      {!pending.length && <div className="card empty"><Icon n="check" size={26} />لا توجد طلبات انضمام معلّقة.</div>}
      <div className="grid g2 stg">{pending.map((r, i) => { const d = dec[r.id] || {}; const role = d.role || r.requested_role
        return <div className="card reqc" key={r.id} style={{ '--i': i }}>
          <div className="rq-h"><span className="rq-av"><Icon n="users" size={20} /></span><div><b>{r.full_name}</b><div className="muted small" dir="ltr" style={{ textAlign: 'right' }}>{r.email}</div></div><span className="muted small" style={{ marginInlineStart: 'auto' }}>{fdate(r.created_at)}</span></div>
          <div className="muted small">{[r.job_title, r.phone].filter(Boolean).join(' · ')}</div>
          <div className="form" style={{ marginTop: 10 }}>
            <div className="f"><label>الصفة</label><select value={role} onChange={(e) => setDec({ ...dec, [r.id]: { ...d, role: e.target.value } })}>{Object.entries(ROLES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            {role === 'dg' && <div className="f"><label>التقسيم</label><select value={d.division ?? r.division_id ?? ''} onChange={(e) => setDec({ ...dec, [r.id]: { ...d, division: e.target.value } })}><option value="">اختر</option>{divisions.map((x) => <option key={x.id} value={x.id}>{shortName(x.name)}</option>)}</select></div>}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><button className="btn g" style={{ flex: 1 }} onClick={() => decide(r, true)}><Icon n="check" size={16} />اعتماد وتفعيل</button><button className="btn o" onClick={() => decide(r, false)}>رفض</button></div></div> })}</div>
      {(requests || []).some((r) => r.status !== 'pending') && <><Sec t="الطلبات المنتهية" /><div className="card tw"><table><thead><tr><th>الاسم</th><th>البريد</th><th>الصفة</th><th>القرار</th><th>بواسطة</th></tr></thead><tbody>
        {requests.filter((r) => r.status !== 'pending').map((r) => <tr key={r.id}><td>{r.full_name}</td><td dir="ltr">{r.email}</td><td>{ROLES[r.requested_role]}</td><td><span className={`pill ${r.status === 'approved' ? 'st-approved' : 'st-draft'}`}>{r.status === 'approved' ? 'معتمد' : 'مرفوض'}</span></td><td>{r.decided_by}</td></tr>)}</tbody></table></div></>}</>}
    {tab === 'year' && ys && <div className="card form">
      <div className="f"><label>العدد المعتمد لإجمالي الموظفين</label><input type="number" defaultValue={ys.approved_headcount ?? ''} onBlur={(e) => run(sb.from('year_settings').update({ approved_headcount: e.target.value === '' ? null : +e.target.value, headcount_is_demo: false }).eq('year', year))} /></div>
      <div className="f"><label>التاريخ المرجعي</label><input type="date" defaultValue={ys.reference_date || ''} onBlur={(e) => run(sb.from('year_settings').update({ reference_date: e.target.value || null }).eq('year', year))} /></div>
      <div className="f"><label>مكافأة خدمة المستفيدين (ر.ع)</label><input type="number" defaultValue={ys.service_award} onBlur={(e) => run(sb.from('year_settings').update({ service_award: +e.target.value }).eq('year', year))} /></div>
      <div className="f"><label>نصيب الموظف (ر.ع)</label><input type="number" defaultValue={ys.rate_per_employee} onBlur={(e) => run(sb.from('year_settings').update({ rate_per_employee: +e.target.value }).eq('year', year))} /></div>
      <div className="f"><button className="btn o" onClick={async () => { const y = +prompt('السنة الجديدة (مثال 2028)'); if (y) { await rpc('init_year', { p_year: y }); reload() } }}>إضافة سنة جديدة</button></div></div>}
    {tab === 'div' && <><div className="card tw"><table><thead><tr><th>التقسيم</th><th>الأعلى</th><th>المحافظة</th><th>خدمة</th><th>محسوب ضمن الأعلى</th><th>العدد {year}</th></tr></thead><tbody>
      {divisions.map((d) => <tr key={d.id}><td>{d.name}</td><td>{divisions.find((x) => x.id === d.parent_id)?.name || '—'}</td><td>{d.governorate}</td>
        <td><input type="checkbox" checked={d.is_service} onChange={(e) => run(sb.from('divisions').update({ is_service: e.target.checked }).eq('id', d.id))} /></td>
        <td><input type="checkbox" checked={d.counted_in_parent} onChange={(e) => run(sb.from('divisions').update({ counted_in_parent: e.target.checked }).eq('id', d.id))} /></td>
        <td><input className="inp" type="number" style={{ width: 90 }} defaultValue={hc(d.id)} onBlur={(e) => run(sb.from('division_years').upsert({ division_id: d.id, year, headcount: +e.target.value || 0 }))} /></td></tr>)}</tbody></table></div>
      <Sec t="إضافة تقسيم" /><div className="card form">
        <div className="f"><label>الاسم</label><input value={nd.name} onChange={(e) => setNd({ ...nd, name: e.target.value })} /></div>
        <div className="f"><label>التقسيم الأعلى</label><select value={nd.parent_id} onChange={(e) => setNd({ ...nd, parent_id: e.target.value })}><option value="">—</option>{divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div className="f"><label>المحافظة</label><input value={nd.governorate} onChange={(e) => setNd({ ...nd, governorate: e.target.value })} /></div>
        <div className="f"><label>عدد الموظفين</label><input type="number" value={nd.headcount} onChange={(e) => setNd({ ...nd, headcount: e.target.value })} /></div>
        <div className="f"><label><input type="checkbox" checked={nd.is_service} onChange={(e) => setNd({ ...nd, is_service: e.target.checked })} /> مشمول بخدمة المستفيدين</label></div>
        <div className="f"><label><input type="checkbox" checked={nd.counted_in_parent} onChange={(e) => setNd({ ...nd, counted_in_parent: e.target.checked })} /> موظفوه محسوبون ضمن الأعلى</label></div>
        <div className="f"><button className="btn t" disabled={!nd.name} onClick={addDiv}>إضافة</button></div></div>
      <Sec t="استيراد من Excel" /><div className="card"><div className="muted small">الأعمدة: التقسيم، التقسيم الأعلى، المحافظة، خدمة المستفيدين (نعم/لا)، محسوب ضمن الأعلى (نعم/لا)، عدد الموظفين</div><input type="file" accept=".xlsx,.xls,.csv" onChange={importDivisions} /></div></>}
    {tab === 'users' && <><div className="card tw"><table><thead><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>التقسيم</th><th>فعّال</th></tr></thead><tbody>
      {users.map((u) => <tr key={u.id}><td>{u.full_name}</td><td dir="ltr">{u.email}</td><td>{ROLES[u.role]}</td><td>{divisions.find((d) => d.id === u.division_id)?.name || '—'}</td>
        <td><input type="checkbox" checked={u.active} onChange={(e) => run(sb.from('profiles').update({ active: e.target.checked }).eq('id', u.id))} /></td></tr>)}</tbody></table></div>
      <Sec t="إضافة مستخدم" /><div className="card form">
        <div className="f"><label>الاسم</label><input value={nu.full_name} onChange={(e) => setNu({ ...nu, full_name: e.target.value })} /></div>
        <div className="f"><label>البريد الحكومي</label><input dir="ltr" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} /></div>
        <div className="f"><label>الدور</label><select value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })}>{Object.entries(ROLES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        {nu.role === 'dg' && <div className="f"><label>التقسيم</label><select value={nu.division_id} onChange={(e) => setNu({ ...nu, division_id: e.target.value })}><option value="">—</option>{divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>}
        <div className="f"><button className="btn t" disabled={!nu.email || !nu.full_name} onClick={() => run(sb.from('profiles').insert({ ...nu, division_id: nu.role === 'dg' ? nu.division_id : null }), 'أُضيف المستخدم').then(() => setNu({ email: '', full_name: '', role: 'dg', division_id: '' }))}>إضافة</button></div></div></>}
    {tab === 'emp' && <div className="card"><div className="muted small">الأعمدة: الرقم الوظيفي، الاسم، المسمى الوظيفي، التقسيم (يطابق اسم التقسيم تماماً)</div><input type="file" accept=".xlsx,.xls,.csv" onChange={importEmployees} /></div>}
  </>
}
