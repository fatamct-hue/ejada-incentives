import { useEffect, useMemo, useRef, useState } from 'react'
import { sb } from '../supabase'
import { useApp, Sec, TRACKS, periodName, fmt } from '../lib'
import { PriorAlert } from './NomModal'
import Icon, { TRACK_ICON } from '../Icon'
import { CountUp } from '../motion'

const SC = ['#e4c6ac', '#dcb89c', '#d2a98b', '#9fb4c6', '#7f9fbb', '#5f8cb0', '#2fb5ac', '#00a393', '#1fae7a', '#43b987']
const rating = (v, max = 10) => { const r = v / max; return r >= 0.95 ? ['ممتاز', '#43b987'] : r >= 0.8 ? ['جيد جداً', '#00a393'] : r >= 0.6 ? ['جيد', '#5f8cb0'] : r >= 0.4 ? ['مقبول', '#9fb4c6'] : ['ضعيف', '#c79a7f'] }
const GCOL = ['#006452', '#0f446c', '#aa7f67', '#00827a']
const GICON = [['service', 'service'], ['initiator', 'spark']]
const STAR_COL = ['#d2a98b', '#9fb4c6', '#5f8cb0', '#00a393', '#43b987']
function NumScale({ value, max, onChange }) {
  return <div className="scale" style={{ gridTemplateColumns: `repeat(${Math.min(max, 10)},1fr)` }} role="radiogroup">{Array.from({ length: max }, (_, i) => i + 1).map((n) => {
    const on = value >= n; const c = SC[Math.min(9, Math.round((n / max) * 10) - 1)]
    return <button type="button" key={n} className={`${on ? 'on' : ''} ${value === n ? 'cur' : ''}`} style={{ '--sc': c }} onClick={() => onChange(value === n ? undefined : n)}>{n}</button> })}</div>
}
function Scale({ value, max, onChange }) {
  if (max % 5 !== 0) return <NumScale value={value} max={max} onChange={onChange} />
  const step = max / 5; const stars = Math.round(value / step)
  return <div className="stars" role="radiogroup">{[1, 2, 3, 4, 5].map((n) => {
    const on = stars >= n; const c = STAR_COL[Math.max(0, stars - 1)]
    return <button type="button" key={n} className={`star ${on ? 'on' : ''}`} style={{ '--sc': c, '--i': n }} onClick={() => onChange(stars === n ? undefined : n * step)} aria-label={`${n} من 5`}>
      <svg viewBox="0 0 24 24" width="34" height="34"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.3 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" strokeLinejoin="round" /></svg></button> })}</div>
}
function Gauge({ total, max = 100 }) {
  const R = 86, C = Math.PI * R; const len = (Math.min(max, total) / (max || 1)) * C; const [t, c] = rating(total, max)
  return <svg className="gauge" viewBox="0 0 200 120"><path className="arc" d="M14 106 A86 86 0 0 1 186 106" stroke="rgba(0,37,62,.1)" />
    <path className="arc val" d="M14 106 A86 86 0 0 1 186 106" stroke={c} strokeDasharray={`${len} ${C}`} />
    <text x="100" y="92" textAnchor="middle" fontSize="40" fontWeight="900" fill="#00253e" style={{ fontFamily: 'var(--fb)' }}>{total}</text>
    <text x="100" y="112" textAnchor="middle" fontSize="13" fill="#5d7383" style={{ fontFamily: 'var(--fb)' }}>من {max} · {total ? t : '—'}</text></svg>
}
export default function Form({ track, go }) {
  const { me, year, ys, criteria, cycles, outlets, divisions, noms, rpc, reload, say } = useApp()
  const T = TRACKS[track]; const div = divisions.find((d) => d.id === me.division_id)
  const crit = useMemo(() => criteria.filter((c) => c.track === track && c.active), [criteria, track])
  const groups = useMemo(() => { const g = {}; crit.forEach((c) => (g[c.group_title] ||= []).push(c)); return g }, [crit])
  const open = cycles.filter((c) => c.year === year && c.track === track && c.is_open)
  const blank = { id: null, period: open[0]?.period || '', emp_no: '', department: '', direct_manager: '', outlet_id: '', scores: {}, evidence_notes: {}, justification: '', initiative_title: '', initiative_date: '', beneficiaries: '', amount: '' }
  const [f, setF] = useState(blank); const [emp, setEmp] = useState(null); const [files, setFiles] = useState([]); const [bud, setBud] = useState(null); const [busy, setBusy] = useState(false); const [evOpen, setEvOpen] = useState({}); const [prior, setPrior] = useState([])
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  useEffect(() => {
    const id = sessionStorage.getItem('edit')
    if (id) { sessionStorage.removeItem('edit'); const n = noms.find((x) => x.id === id); if (n && n.track === track) {
      setF({ ...blank, ...n, emp_no: n.emp_no, outlet_id: n.outlet_id || '', initiative_date: n.initiative_date || '', amount: n.amount ?? '' }); loadFiles(id) } }
    if (track === 'initiator') rpc('budget_table', { p_year: year }).then((r) => setBud(r?.[0] || null)).catch(() => {})
  }, [])
  useEffect(() => {
    const t = setTimeout(async () => { if (!f.emp_no.trim()) { setPrior([]); return setEmp(null) } const r = await sb.rpc('lookup_employee', { p_emp_no: f.emp_no }); const e = r.data?.[0] || false; setEmp(e)
      if (e) { const pr = await sb.rpc('employee_honors', { p_emp_no: f.emp_no, p_exclude: f.id || null }); setPrior(pr.data || []) } else setPrior([]) }, 350)
    return () => clearTimeout(t)
  }, [f.emp_no])
  const loadFiles = async (id) => { const r = await sb.from('attachments').select('*').eq('nomination_id', id); setFiles(r.data || []) }
  const maxTotal = crit.reduce((s, c) => s + c.max_score, 0)
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
  const done = {
    scores: crit.every((c) => f.scores[c.id] !== undefined && f.scores[c.id] !== ''),
    just: !!(f.justification || '').trim(), ev: files.length > 0, mgr: !!(f.direct_manager || '').trim(), emp: !!emp,
    ...(track === 'initiator' ? { amt: Number(f.amount) >= (ys?.initiator_min ?? 50) && Number(f.amount) <= (ys?.initiator_max ?? 300), title: !!(f.initiative_title || '').trim() } : {}) }
  const checks = [['emp', 'الموظف'], ['scores', `الدرجات (${crit.filter((c) => f.scores[c.id] !== undefined).length}/${crit.length})`], ...(track === 'initiator' ? [['title', 'عنوان المبادرة'], ['amt', 'المبلغ المقترح']] : []), ['just', 'مسوغات الترشيح'], ['ev', 'الشاهد'], ['mgr', 'المسؤول المباشر']]
  const pct = Math.round((checks.filter(([k]) => done[k]).length / checks.length) * 100)
  const ready = pct === 100
  return <div className="fgrid">
   <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div className="card" style={{ '--c': T.c }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><div className="ic-box" style={{ width: 52, height: 52, borderRadius: 15, display: 'grid', placeItems: 'center', background: T.cb, color: T.c }}><Icon n={TRACK_ICON[track]} size={28} /></div>
        <div><h2 style={{ fontSize: 20 }}>{`استمارة ترشيح ${T.name}`}</h2><div className="muted small">{div?.name}</div></div></div>
      {bud && <div className="budbanner"><div><div className="bl">المتاح لتقسيمك في مسار المبادر</div><div className="bv num">{fmt(bud.balance)}<small> ر.ع</small></div></div>
        <div className="bbar"><div className="prog"><i style={{ width: `${Math.min(100, ((bud.allocation - bud.balance) / (bud.allocation || 1)) * 100)}%` }} /></div><div className="small">المستهلك {fmt(bud.allocation - bud.balance)} من {fmt(bud.allocation)} ر.ع</div></div>
        <div className="blim"><Icon n="shield" size={16} />المبلغ للموظف الواحد: من <b className="num">{fmt(ys?.initiator_min ?? 50)}</b> إلى <b className="num">{fmt(ys?.initiator_max ?? 300)}</b> ر.ع</div></div>}
      <div className="sect" style={{ marginTop: 16 }}><span className="nn">1</span>البيانات الأساسية</div>
      <div className="form" style={{ marginTop: 10 }}>
        <div className="f"><label>الربع <span className="req">*</span></label><select value={f.period} onChange={(e) => set('period', +e.target.value)} disabled={!!f.id}>{open.map((c) => <option key={c.id} value={c.period}>{periodName(track, c.period)}</option>)}</select></div>
        <div className="f"><label>المديرية</label><input readOnly value={div?.name || ''} /></div>
        <div className="f"><label>الرقم الوظيفي <span className="req">*</span></label><input value={f.emp_no} onChange={(e) => set('emp_no', e.target.value)} dir="ltr" placeholder="اكتب الرقم الوظيفي" />
          {emp === false && <span className="hint" style={{ color: 'var(--danger)' }}>الرقم غير مسجل ضمن تقسيمك</span>}</div>
        <div className="f"><label>الموظف</label><input readOnly value={emp ? `${emp.name} — ${emp.title || ''}` : ''} /></div>
        {prior.length > 0 && <div className="f w"><PriorAlert rows={prior} year={year} track={track} /></div>}
        <div className="f"><label>الدائرة / القسم</label><input value={f.department || ''} onChange={(e) => set('department', e.target.value)} /></div>
        {track === 'service' && <div className="f"><label>المنفذ</label><select value={f.outlet_id} onChange={(e) => set('outlet_id', e.target.value)}><option value="">—</option>{divOutlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>}
        {track === 'initiator' && <>
          <div className="f"><label>عنوان المبادرة <span className="req">*</span></label><input value={f.initiative_title || ''} onChange={(e) => set('initiative_title', e.target.value)} /></div>
          <div className="f"><label>تاريخ التنفيذ</label><input type="date" value={f.initiative_date || ''} onChange={(e) => set('initiative_date', e.target.value)} /></div>
          <div className="f"><label>المستفيدون</label><input value={f.beneficiaries || ''} onChange={(e) => set('beneficiaries', e.target.value)} /></div></>}
      </div></div>

    <div className="sect"><span className="nn">2</span>معايير التقييم والأداء</div>
    {Object.entries(groups).map(([g, cs], gi) => { const gmax = cs.reduce((s, c) => s + c.max_score, 0); const gs = cs.reduce((s, c) => s + (Number(f.scores[c.id]) || 0), 0)
      return <div className="card fcard" key={g} style={{ '--gc': GCOL[gi % 4] }}>
        <div className="fhead"><span className="gi"><Icon n={['service', 'spark', 'users', 'trophy'][gi % 4]} size={20} /></span><h3>{g}</h3><span className="gs num" dir="ltr">{gs}<small style={{ opacity: .7, fontSize: 13 }}> / {gmax}</small></span></div>
        <div className="gbar"><i style={{ width: `${(gs / gmax) * 100}%` }} /></div>
        {cs.map((c) => { const v = f.scores[c.id]; const [rt, rc] = v ? rating(v, c.max_score) : ['', '#9aa7ae']
          return <div className="crt" key={c.id}>
            <div className="crt-top"><span>{c.label}</span><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{v ? <span className="rate" style={{ '--rc': rc }}>{rt}</span> : null}<b className="num" dir="ltr">{v ? (c.max_score % 5 === 0 ? Math.round(v / (c.max_score / 5)) : v) : '—'}<small className="muted"> / {c.max_score % 5 === 0 ? 5 : c.max_score}</small></b></span></div>
            <Scale value={v || 0} max={c.max_score} onChange={(n) => setF((x) => ({ ...x, scores: { ...x.scores, [c.id]: n } }))} />
            <button type="button" className="evb" onClick={() => setEvOpen((o) => ({ ...o, [c.id]: !o[c.id] }))}><Icon n={evOpen[c.id] || f.evidence_notes[c.id] ? 'check' : 'plus'} size={14} />الدليل والأمثلة (اختياري)</button>
            {(evOpen[c.id] || f.evidence_notes[c.id]) && <input className="evi" placeholder="اكتب الدليل أو المثال" value={f.evidence_notes[c.id] || ''} onChange={(e) => setF((x) => ({ ...x, evidence_notes: { ...x.evidence_notes, [c.id]: e.target.value } }))} />}
          </div> })}</div> })}

    <div className="sect"><span className="nn">3</span>مسوغات الترشيح <span className="req" style={{ color: 'var(--danger)' }}>*</span></div>
    <div className="card"><textarea style={{ width: '100%', minHeight: 110, border: '1px solid var(--grey-a)', borderRadius: 12, padding: 12, background: 'rgba(255,255,255,.8)' }} value={f.justification || ''} onChange={(e) => set('justification', e.target.value)} placeholder={track === 'initiator' ? 'صف المبادرة، وما تجاوز فيه واجباته، ودوره الشخصي، والأثر' : 'اذكر أبرز الإنجازات والمبادرات التي تجعله نموذجاً للتميز'} /></div>

    <div className="sect"><span className="nn">4</span>الشواهد <span className="req" style={{ color: 'var(--danger)' }}>*</span></div>
    <div className="card"><label className="btn o" style={{ cursor: 'pointer' }}><Icon n="upload" size={18} />رفع شاهد<input type="file" onChange={upload} style={{ display: 'none' }} /></label>
      <div className="flt" style={{ marginTop: 10 }}>{files.map((a) => <span key={a.id} className="pill st-sent"><Icon n="report" size={14} />{a.file_name} <a href="#" onClick={(e) => { e.preventDefault(); delFile(a) }}>✕</a></span>)}{!files.length && <span className="muted small">لم يُرفع شاهد بعد. شاهد واحد على الأقل مطلوب.</span>}</div></div>

    <div className="sect"><span className="nn">5</span>الاعتمادات</div>
    <div className="card form">
      {track === 'initiator' && <div className="f"><label>المبلغ المقترح (ر.ع) <span className="req">*</span></label><input type="number" min={ys?.initiator_min ?? 50} max={ys?.initiator_max ?? 300} step="1" value={f.amount} onChange={(e) => set('amount', e.target.value)} />
        <span className="hint" style={{ color: f.amount !== '' && (Number(f.amount) < (ys?.initiator_min ?? 50) || Number(f.amount) > (ys?.initiator_max ?? 300)) ? 'var(--danger)' : undefined }}>بين {fmt(ys?.initiator_min ?? 50)} و{fmt(ys?.initiator_max ?? 300)} ر.ع للموظف الواحد</span></div>}
      <div className="f"><label>المسؤول المباشر <span className="req">*</span></label><input value={f.direct_manager || ''} onChange={(e) => set('direct_manager', e.target.value)} /></div>
      <div className="f"><label>اعتماد المدير العام</label><input readOnly value={me.full_name} /></div></div>
   </div>

   <aside className="aside">
    <div className="card" style={{ textAlign: 'center' }}><div className="muted small">مجموع الدرجات</div><Gauge total={total} max={maxTotal} />
      <div className="prog" style={{ marginTop: 8 }}><i style={{ width: `${pct}%` }} /></div><div className="muted small" style={{ marginTop: 4 }}>اكتمال الاستمارة {pct}%</div></div>
    <div className="card">{checks.map(([k, l]) => <div key={k} className={`chk ${done[k] ? 'ok' : ''}`}><span className="cc"><Icon n="check" size={14} stroke={2.5} /></span>{l}</div>)}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button className="btn o" style={{ flex: 1 }} disabled={busy || !emp} onClick={onSave}>حفظ كمسودة</button>
        <button className="btn g" style={{ flex: 1 }} disabled={busy || !ready} onClick={onSubmit}><Icon n="send" size={16} />اعتماد وإرسال</button></div></div>
   </aside>
  </div>
}
