import { useEffect, useMemo, useRef, useState } from 'react'
import { sb } from '../supabase'
import { useApp, Sec, TRACKS, periodName, fmt } from '../lib'

export default function Form({ track, go }) {
  const { me, year, ys, criteria, cycles, outlets, divisions, noms, rpc, reload, say } = useApp()
  const T = TRACKS[track]; const div = divisions.find((d) => d.id === me.division_id)
  const crit = useMemo(() => criteria.filter((c) => c.track === track && c.active), [criteria, track])
  const groups = useMemo(() => { const g = {}; crit.forEach((c) => (g[c.group_title] ||= []).push(c)); return g }, [crit])
  const open = cycles.filter((c) => c.year === year && c.track === track && c.is_open)
  const blank = { id: null, period: open[0]?.period || '', emp_no: '', department: '', direct_manager: '', outlet_id: '', scores: {}, evidence_notes: {}, justification: '', initiative_title: '', initiative_date: '', beneficiaries: '', amount: '' }
  const [f, setF] = useState(blank); const [emp, setEmp] = useState(null); const [files, setFiles] = useState([]); const [bud, setBud] = useState(null); const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  useEffect(() => {
    const id = sessionStorage.getItem('edit')
    if (id) { sessionStorage.removeItem('edit'); const n = noms.find((x) => x.id === id); if (n && n.track === track) {
      setF({ ...blank, ...n, emp_no: n.emp_no, outlet_id: n.outlet_id || '', initiative_date: n.initiative_date || '', amount: n.amount ?? '' }); loadFiles(id) } }
    if (track === 'initiator') rpc('division_budget', { p_year: year }).then((r) => setBud(r?.[0] || null)).catch(() => {})
  }, [])
  useEffect(() => {
    const t = setTimeout(async () => { if (!f.emp_no.trim()) return setEmp(null); const r = await sb.rpc('lookup_employee', { p_emp_no: f.emp_no }); setEmp(r.data?.[0] || false) }, 350)
    return () => clearTimeout(t)
  }, [f.emp_no])
  const loadFiles = async (id) => { const r = await sb.from('attachments').select('*').eq('nomination_id', id); setFiles(r.data || []) }
  const total = crit.reduce((s, c) => s + (Number(f.scores[c.id]) || 0), 0)
  const payload = () => ({ ...f, track, year, amount: f.amount === '' ? null : f.amount })
  const save = async () => { setBusy(true); try { const id = await rpc('save_nomination', { p: payload() }); setF((x) => ({ ...x, id })); await reload(); return id } finally { setBusy(false) } }
  const onSave = async () => { await save(); say('حُفظت المسودة') }
  const onSubmit = async () => {
    if (!window.confirm('اعتماد وإرسال الترشيح؟ سيُسجَّل اسمك وتاريخ الإرسال.')) return
    const id = await save(); await rpc('transition_nomination', { p_id: id, p_action: 'submit' }); await reload(); say('أُرسل الترشيح'); go('dg')
  }
  const upload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    const id = f.id || (await save()); const path = `${me.division_id}/${id}/${Date.now()}-${file.name.replace(/[^\w.\-؀-ۿ]/g, '_')}`
    const up = await sb.storage.from('evidence').upload(path, file); if (up.error) return say(up.error.message)
    const ins = await sb.from('attachments').insert({ nomination_id: id, path, file_name: file.name, uploaded_by: me.id }); if (ins.error) return say(ins.error.message)
    loadFiles(id); e.target.value = ''
  }
  const delFile = async (a) => { await sb.storage.from('evidence').remove([a.path]); await sb.from('attachments').delete().eq('id', a.id); loadFiles(f.id) }
  if (track === 'service' && !div?.is_service) return <div className="alert i">تقسيمك غير مشمول بمسار خدمة المستفيدين.</div>
  if (!open.length) return <div className="alert w">لا توجد دورة مفتوحة لاستقبال الترشيحات في هذا المسار حالياً.</div>
  const divOutlets = outlets.filter((o) => o.division_id === me.division_id)
  return <div className="card">
    <h2 style={{ fontSize: 20 }}>{`استمارة ترشيح ${T.name}`}</h2>
    {bud && <div className="alert i" style={{ margin: '8px 0' }}>الرصيد المتاح لمخصص المبادر: <b className="num">{fmt(bud.balance)}</b> ر.ع</div>}
    <div className="form">
      <div className="fs">البيانات الأساسية</div>
      <div className="f"><label>الربع <span className="req">*</span></label><select value={f.period} onChange={(e) => set('period', +e.target.value)} disabled={!!f.id}>
        {open.map((c) => <option key={c.id} value={c.period}>{periodName(track, c.period)}</option>)}</select></div>
      <div className="f"><label>المديرية</label><input readOnly value={div?.name || ''} /></div>
      <div className="f"><label>الرقم الوظيفي <span className="req">*</span></label><input value={f.emp_no} onChange={(e) => set('emp_no', e.target.value)} dir="ltr" />
        {emp === false && <span className="hint" style={{ color: 'var(--danger)' }}>الرقم غير مسجل ضمن تقسيمك</span>}</div>
      <div className="f"><label>اسم الموظف / المسمى الوظيفي</label><input readOnly value={emp ? `${emp.name} — ${emp.title || ''}` : ''} /></div>
      <div className="f"><label>الدائرة / القسم</label><input value={f.department || ''} onChange={(e) => set('department', e.target.value)} /></div>
      {track === 'service' && <div className="f"><label>المنفذ</label><select value={f.outlet_id} onChange={(e) => set('outlet_id', e.target.value)}><option value="">—</option>{divOutlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>}
      {track === 'initiator' && <>
        <div className="f"><label>عنوان المبادرة <span className="req">*</span></label><input value={f.initiative_title || ''} onChange={(e) => set('initiative_title', e.target.value)} /></div>
        <div className="f"><label>تاريخ التنفيذ</label><input type="date" value={f.initiative_date || ''} onChange={(e) => set('initiative_date', e.target.value)} /></div>
        <div className="f"><label>المستفيدون</label><input value={f.beneficiaries || ''} onChange={(e) => set('beneficiaries', e.target.value)} /></div></>}
      <div className="fs">أولاً — معايير التقييم والأداء</div>
      <div className="f w"><div className="ctab">{Object.entries(groups).map(([g, cs]) => <div className="cg" key={g}><div className="cm">{g}</div>
        {cs.map((c) => <div className="cr" key={c.id}><span>{c.label}</span>
          <input type="number" min="0" max={c.max_score} placeholder={`/${c.max_score}`} value={f.scores[c.id] ?? ''} onChange={(e) => { const v = e.target.value; setF((x) => ({ ...x, scores: { ...x.scores, [c.id]: v === '' ? undefined : Math.min(c.max_score, Math.max(0, +v)) } })) }} />
          <input placeholder="الدليل والأمثلة (اختياري)" value={f.evidence_notes[c.id] || ''} onChange={(e) => setF((x) => ({ ...x, evidence_notes: { ...x.evidence_notes, [c.id]: e.target.value } }))} /></div>)}</div>)}
        <div className="ctot">المجموع: <b className="num">{total}</b> / 100</div></div></div>
      <div className="fs">ثانياً — مسوغات الترشيح <span className="req">*</span></div>
      <div className="f w"><textarea value={f.justification || ''} onChange={(e) => set('justification', e.target.value)} /></div>
      <div className="fs">الشواهد <span className="req">*</span></div>
      <div className="f w"><input type="file" onChange={upload} />
        <div className="flt">{files.map((a) => <span key={a.id} className="pill st-sent">{a.file_name} <a href="#" onClick={(e) => { e.preventDefault(); delFile(a) }}>✕</a></span>)}</div></div>
      {track === 'initiator' && <div className="f"><label>المبلغ المقترح (ر.ع) <span className="req">*</span></label><input type="number" min="0" step="0.001" value={f.amount} onChange={(e) => set('amount', e.target.value)} /></div>}
      <div className="fs">ثالثاً — الاعتمادات</div>
      <div className="f"><label>المسؤول المباشر <span className="req">*</span></label><input value={f.direct_manager || ''} onChange={(e) => set('direct_manager', e.target.value)} /></div>
      <div className="f"><label>اعتماد المدير العام</label><input readOnly value={me.full_name} /></div>
    </div>
    <div className="ft" style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <button className="btn o" disabled={busy || !emp} onClick={onSave}>حفظ كمسودة</button>
      <button className="btn g" disabled={busy || !emp} onClick={onSubmit}>اعتماد وإرسال</button></div>
  </div>
}
