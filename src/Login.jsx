import { useEffect, useState } from 'react'
import { sb } from './supabase'
import { asset, ROLES, shortName } from './lib'
import Icon from './Icon'

const REQ_ROLES = [['dg', 'مدير عام / مسؤول أعلى لتقسيم'], ['ejada', 'فريق الإجادة المؤسسية'], ['dev', 'جهة اعتماد: المديرية العامة للتطوير والدراسات (خدمة المستفيدين والمبتكر)'], ['admin_fin', 'جهة اعتماد: المديرية العامة للشؤون الإدارية والمالية (المبادر)']]

function Frame({ children, onSubmit, onClose }) {
  return <div className="authov" onClick={onClose}>
    <form className="card ch authbox" onSubmit={onSubmit} onClick={(e) => e.stopPropagation()}>
      {onClose && <button type="button" className="authx" onClick={onClose} aria-label="إغلاق">✕</button>}
      <img src={asset('brand/logo-horizontal.png')} alt="وزارة الإسكان والتخطيط العمراني" style={{ width: '100%', maxWidth: 260, alignSelf: 'center' }} />
      <h2 style={{ textAlign: 'center', fontSize: 20 }}>منصة حوافز الإجادة المؤسسية</h2>
      {children}
    </form></div>
}

function RequestForm({ back, presetEmail, onClose }) {
  const [divs, setDivs] = useState([]); const [done, setDone] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const [f, setF] = useState({ full_name: '', email: presetEmail || '', phone: '', job_title: '', requested_role: 'dg', division_id: '', note: '' })
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  useEffect(() => { sb.rpc('public_divisions').then((r) => setDivs(r.data || [])) }, [])
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    const { data, error } = await sb.rpc('request_access', { p: f }); setBusy(false)
    if (error) setErr(error.message); else setDone(data)
  }
  if (done) return <Frame onClose={onClose} onSubmit={(e) => { e.preventDefault(); back() }}>
    <div className="alert ok" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8 }}><Icon n="check" size={34} />
      {done === 'exists' ? 'هذا البريد مسجل لدينا بالفعل. ارجع وسجّل الدخول.' : 'استُلم طلبك. سيراجعه فريق الإجادة، وبعد اعتماده تدخل برمز يصل إلى بريدك.'}</div>
    <button className="btn t">العودة لتسجيل الدخول</button></Frame>
  return <Frame onClose={onClose} onSubmit={submit}>
    <div className="small muted" style={{ textAlign: 'center' }}>طلب حساب جديد. يُفعَّل بعد اعتماد فريق الإجادة.</div>
    <div className="f"><label>الاسم الكامل <span className="req">*</span></label><input required value={f.full_name} onChange={(e) => set('full_name', e.target.value)} /></div>
    <div className="f"><label>البريد الإلكتروني الحكومي <span className="req">*</span></label><input type="email" required dir="ltr" value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
    <div className="f"><label>الصفة المطلوبة <span className="req">*</span></label><select value={f.requested_role} onChange={(e) => set('requested_role', e.target.value)}>{REQ_ROLES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
    {f.requested_role === 'dg' && <div className="f"><label>التقسيم <span className="req">*</span></label><select required value={f.division_id} onChange={(e) => set('division_id', e.target.value)}><option value="">اختر التقسيم</option>{divs.map((d) => <option key={d.id} value={d.id}>{shortName(d.name)}</option>)}</select></div>}
    <div className="f"><label>المسمى الوظيفي</label><input value={f.job_title} onChange={(e) => set('job_title', e.target.value)} /></div>
    <div className="f"><label>رقم الهاتف</label><input dir="ltr" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></div>
    {err && <div className="alert r">{err}</div>}
    <button className="btn t" disabled={busy}><Icon n="send" size={18} />إرسال الطلب</button>
    <button type="button" className="btn o" onClick={back}>رجوع</button></Frame>
}

export default function Login({ start = 'login', onClose }) {
  const [mode, setMode] = useState(start)
  const [email, setEmail] = useState(''); const [step, setStep] = useState(0); const [code, setCode] = useState(''); const [err, setErr] = useState('')
  if (mode === 'request') return <RequestForm back={() => setMode('login')} presetEmail={email} onClose={onClose} />
  const send = async (e) => {
    e.preventDefault(); setErr('')
    const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false, emailRedirectTo: location.origin + location.pathname } })
    if (error) setErr('تعذر إرسال الرمز. إن لم يكن لك حساب فقدّم طلب انضمام، وإن كنت مسجلاً فانتظر قليلاً قبل إعادة المحاولة.'); else setStep(1)
  }
  const verify = async (e) => {
    e.preventDefault(); setErr('')
    const { error } = await sb.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' })
    if (error) setErr('الرمز غير صحيح أو منتهي.')
  }
  return <Frame onClose={onClose} onSubmit={step ? verify : send}>
    <div className="muted small" style={{ textAlign: 'center' }}>يديرها فريق الإجادة المؤسسية</div>
    <div className="f"><label>البريد الإلكتروني الحكومي</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!step} dir="ltr" /></div>
    {step === 1 && <div className="f"><label>رمز الدخول المرسل إلى بريدك</label><input required value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" dir="ltr" autoFocus /></div>}
    {err && <div className="alert r">{err}</div>}
    <button className="btn t"><Icon n={step ? 'shield' : 'mail'} size={18} />{step ? 'دخول' : 'إرسال رمز الدخول'}</button>
    {!step && <button type="button" className="linkbtn" onClick={() => setMode('request')}><Icon n="users" size={15} />ليس لديك حساب؟ قدّم طلب انضمام</button>}
  </Frame>
}
