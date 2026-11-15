import { useEffect, useState } from 'react'
import { sb, configured } from './supabase'
import { Provider, useApp, ROLES, asset } from './lib'
import Icon from './Icon'
import Home from './screens/Home'
import DG from './screens/DG'
import Form from './screens/Form'
import Innovator from './screens/Innovator'
import Dashboard from './screens/Dashboard'
import Review from './screens/Review'
import Budget from './screens/Budget'
import Cycles from './screens/Cycles'
import Reports from './screens/Reports'
import Settings from './screens/Settings'

const NAV = [
  ['home', 'الرئيسية', ['dg', 'ejada', 'dev', 'admin_fin'], 'home'],
  ['dg', 'تقسيمي', ['dg'], 'unit'],
  ['service', 'استمارة خدمة المستفيدين', ['dg'], 'service'],
  ['initiator', 'استمارة المبادر', ['dg'], 'spark'],
  ['dash', 'الداشبورد', ['ejada', 'dev', 'admin_fin'], 'dash'],
  ['review', 'المراجعة والإشراف', ['ejada', 'dev', 'admin_fin'], 'review'],
  ['innovator', 'نتائج المبتكر', ['ejada', 'dev'], 'bulb'],
  ['budget', 'الميزانية والمخصصات', ['dg', 'ejada', 'admin_fin'], 'coin'],
  ['cycles', 'الدورات والإقفال', ['ejada'], 'cycle'],
  ['reports', 'القوائم والتقارير', ['ejada', 'dev', 'admin_fin'], 'report'],
  ['settings', 'الإعدادات', ['ejada'], 'gear'],
]

function Login() {
  const [email, setEmail] = useState(''); const [step, setStep] = useState(0); const [code, setCode] = useState(''); const [err, setErr] = useState('')
  const send = async (e) => {
    e.preventDefault(); setErr('')
    const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false, emailRedirectTo: location.origin + location.pathname } })
    if (error) setErr('تعذر إرسال الرمز. تأكد أن بريدك مسجل لدى فريق الإجادة.'); else setStep(1)
  }
  const verify = async (e) => {
    e.preventDefault(); setErr('')
    const { error } = await sb.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' })
    if (error) setErr('الرمز غير صحيح أو منتهي.')
  }
  return <div className="login">
    <i className="cubef" style={{ top: '12%', insetInlineStart: '10%' }} /><i className="cubef" style={{ bottom: '14%', insetInlineEnd: '12%', animationDelay: '-3s', width: 60, height: 60 }} /><i className="cubef" style={{ top: '60%', insetInlineStart: '22%', animationDelay: '-5s', width: 44, height: 44 }} />
    <form className="card ch" onSubmit={step ? verify : send}>
    <img src={asset('brand/logo-horizontal.png')} alt="وزارة الإسكان والتخطيط العمراني" style={{ width: '100%', maxWidth: 300, alignSelf: 'center' }} />
    <h2 style={{ textAlign: 'center' }}>منصة حوافز الإجادة المؤسسية</h2>
    <div className="muted small" style={{ textAlign: 'center' }}>يديرها فريق الإجادة المؤسسية</div>
    <div className="f"><label>البريد الإلكتروني الحكومي</label>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!step} dir="ltr" /></div>
    {step === 1 && <div className="f"><label>رمز الدخول المرسل إلى بريدك</label>
      <input required value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" dir="ltr" autoFocus /></div>}
    {err && <div className="alert r">{err}</div>}
    <button className="btn t"><Icon n={step ? 'shield' : 'mail'} size={18} />{step ? 'دخول' : 'إرسال رمز الدخول'}</button>
    <img src={asset('brand/slogan-2line-navy.png')} alt="نتقدّم بثقة، وبالثقة" style={{ height: 44, alignSelf: 'center', marginTop: 6 }} />
  </form></div>
}

function Shell() {
  const { me, year, setYear, years, toast, loaded } = useApp()
  const [page, setPage] = useState((location.hash || '#home').slice(1).split('?')[0])
  const [open, setOpen] = useState(false)
  useEffect(() => { const h = () => setPage((location.hash || '#home').slice(1).split('?')[0]); addEventListener('hashchange', h); return () => removeEventListener('hashchange', h) }, [])
  const nav = NAV.filter((n) => n[2].includes(me.role))
  const go = (p) => { location.hash = p; setOpen(false) }
  const cur = nav.find((n) => n[0] === page) || nav[0]
  const S = { home: Home, dg: DG, service: Form, initiator: Form, innovator: Innovator, dash: Dashboard, review: Review, budget: Budget, cycles: Cycles, reports: Reports, settings: Settings }[cur[0]]
  return <div className="app">
    <aside className={`side ${open ? 'open' : ''}`}>
      <img src={asset('brand/logo-horizontal-white.png')} alt="وزارة الإسكان والتخطيط العمراني" style={{ width: '100%' }} />
      <div className="brand">منصة حوافز الإجادة المؤسسية</div>
      <nav className="nav">{nav.map(([k, l, , ic]) => <a key={k} href={'#' + k} className={cur[0] === k ? 'on' : ''} onClick={() => setOpen(false)}><Icon n={ic} />{l}</a>)}</nav>
      <div className="role"><label>{ROLES[me.role]}</label><b>{me.full_name}</b>
        <button className="btn o s" style={{ marginTop: 8 }} onClick={() => sb.auth.signOut()}><Icon n="out" size={14} />خروج</button></div>
      {import.meta.env.VITE_DEMO === '1' && <div className="role"><label>معاينة بالأدوار (بيانات وهمية)</label>
        {[['ejada', 'فريق الإجادة'], ['dg', 'مدير عام'], ['dev', 'التطوير والدراسات'], ['fin', 'الشؤون المالية']].map(([r, l]) => <a key={r} href={'?role=' + r + location.hash} style={{ display: 'block', color: '#4ad6ed', padding: '3px 0' }}>{l}</a>)}</div>}
      <div style={{ flex: 1 }} />
      <img src={asset('brand/ejada-logo-white.png')} alt="إجادة" style={{ width: 120, alignSelf: 'flex-start', opacity: .9 }} />
      <img src={asset('brand/slogan-2line-white.png')} alt="نتقدّم بثقة، وبالثقة" style={{ width: 150 }} />
    </aside>
    <div className="main">
      <div className="topbar"><button className="btn o s mtop" onClick={() => setOpen(!open)}><Icon n="menu" size={18} /></button>
        <h1><Icon n={cur[3]} size={24} />{cur[1]}</h1>
        <div className="yr">السنة <select value={year} onChange={(e) => setYear(+e.target.value)}>{years.map((y) => <option key={y.year}>{y.year}</option>)}</select></div></div>
      <div className="content">{loaded ? <div className="page" key={cur[0] + year}><S track={cur[0]} go={go} /></div> : <div className="grid g4">{[0, 1, 2, 3].map((i) => <div key={i} className="skel" />)}</div>}</div>
    </div>
    <div className={`toast ${toast ? 'on' : ''}`}>{toast}</div>
  </div>
}

export default function App() {
  const [session, setSession] = useState(undefined); const [me, setMe] = useState(null); const [denied, setDenied] = useState(false)
  useEffect(() => {
    if (!configured) return
    sb.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s)); return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!session) { setMe(null); return }
    sb.rpc('me').then(({ data }) => { if (data && data.id) setMe(data); else setDenied(true) })
  }, [session])
  if (!configured) return <div className="login"><div className="card"><h2>المنصة غير مهيأة</h2><div className="muted">لم تُضبط مفاتيح Supabase (VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY).</div></div></div>
  if (session === undefined) return null
  if (!session) return <Login />
  if (denied) return <div className="login"><div className="card"><h2>الحساب غير مسجل</h2><div className="muted">بريدك غير مضاف في قائمة المستخدمين. تواصل مع فريق الإجادة.</div>
    <button className="btn o" onClick={() => { setDenied(false); sb.auth.signOut() }}>خروج</button></div></div>
  if (!me) return null
  return <Provider me={me}><Shell /></Provider>
}
