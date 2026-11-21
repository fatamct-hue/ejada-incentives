import { Component, useEffect, useState } from 'react'
import { sb, configured } from './supabase'
import { Provider, useApp, ROLES, ROLE_META, asset, shortName } from './lib'
import Icon from './Icon'
import Landing from './Landing'
import CommandHome from './screens/CommandHome'
import ApprovalHome from './screens/ApprovalHome'
import FinanceHome from './screens/FinanceHome'
import MyHome from './screens/MyHome'
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
  ['home', 'home', { dg: 'الرئيسية', ejada: 'لوحة القيادة', dev: 'لوحة الاعتماد', admin_fin: 'لوحة الصرف' }],
  ['dg', 'unit', { dg: 'ترشيحاتي' }],
  ['service', 'service', { dg: 'استمارة خدمة المستفيدين' }],
  ['initiator', 'spark', { dg: 'استمارة المبادر' }],
  ['review', 'review', { ejada: 'المراجعة والتوصية', dev: 'اعتماد الترشيحات', admin_fin: 'الاعتماد والصرف' }],
  ['innovator', 'bulb', { ejada: 'نتائج المبتكر', dev: 'نتائج المبتكر' }],
  ['dash', 'dash', { ejada: 'المتابعة والتحليل', dev: 'المتابعة والتحليل', admin_fin: 'المتابعة والتحليل' }],
  ['budget', 'coin', { dg: 'ميزانيتي', ejada: 'الميزانية والمخصصات', admin_fin: 'الميزانية والمخصصات' }],
  ['cycles', 'cycle', { ejada: 'الدورات والإقفال' }],
  ['reports', 'report', { ejada: 'القوائم والتقارير', dev: 'القوائم والتقارير', admin_fin: 'التقارير' }],
  ['settings', 'gear', { ejada: 'الإعدادات' }],
]

class Boundary extends Component {
  state = { err: null }
  static getDerivedStateFromError(err) { return { err } }
  componentDidCatch(err) { console.error(err) }
  render() {
    if (!this.state.err) return this.props.children
    return <div className="card" style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center' }}><Icon n="alert" size={34} style={{ color: 'var(--danger)', margin: 'auto' }} />
      <h3 style={{ margin: '8px 0' }}>تعذّر عرض هذه الشاشة</h3><div className="muted small" dir="ltr" style={{ wordBreak: 'break-word' }}>{String(this.state.err.message || this.state.err)}</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}><button className="btn t" onClick={() => { location.hash = 'home'; location.reload() }}>الرئيسية</button><button className="btn o" onClick={() => location.reload()}>إعادة التحميل</button></div></div>
  }
}

function ViewAs() {
  const { me, divisions, rpc } = useApp()
  const [busy, setBusy] = useState(false)
  const go = async (role, d) => { setBusy(true); try { await rpc('set_view_as', { p_role: role, p_division: d || null }); location.hash = 'home'; location.reload() } catch { setBusy(false) } }
  const opts = [['ejada', 'فريق الإجادة', 'shield'], ['dev', 'التطوير والدراسات', 'review'], ['admin_fin', 'الشؤون الإدارية والمالية', 'coin']]
  return <div className="role viewas"><label><Icon n="shield" size={14} /> وضع العرض (مشرف أعلى)</label>
    <div className="vhint">شاهد المنصة بصفة:</div>
    {opts.map(([r, l, ic]) => <button key={r} disabled={busy} className={`vbtn ${me.role === r ? 'on' : ''}`} onClick={() => go(r)}><Icon n={ic} size={16} />{l}</button>)}
    <select className={`vsel ${me.role === 'dg' ? 'on' : ''}`} disabled={busy} value={me.role === 'dg' ? me.division_id || '' : ''} onChange={(e) => e.target.value && go('dg', e.target.value)}>
      <option value="">مدير عام — اختر التقسيم</option>{divisions.filter((d) => d.active).map((d) => <option key={d.id} value={d.id}>{shortName(d.name)}</option>)}</select>
    {me.role !== 'ejada' && <button className="vbtn reset" disabled={busy} onClick={() => go(null)}><Icon n="arrow" size={16} />العودة لوضعي الأصلي</button>}</div>
}

function Shell() {
  const { me, year, setYear, years, toast, loaded, divisions, requests } = useApp()
  const [page, setPage] = useState((location.hash || '#home').slice(1).split('?')[0])
  const [open, setOpen] = useState(false)
  useEffect(() => { const h = () => setPage((location.hash || '#home').slice(1).split('?')[0]); addEventListener('hashchange', h); return () => removeEventListener('hashchange', h) }, [])
  const nav = NAV.filter((n) => n[2][me.role]).map(([k, ic, lb]) => [k, lb[me.role], null, ic])
  const pendReq = (requests || []).filter((r) => r.status === 'pending').length
  const go = (p) => { location.hash = p; setOpen(false) }
  const cur = nav.find((n) => n[0] === page) || nav[0]
  const S = { home: { dg: MyHome, ejada: CommandHome, dev: ApprovalHome, admin_fin: FinanceHome }[me.role], dg: DG, service: Form, initiator: Form, innovator: Innovator, dash: Dashboard, review: Review, budget: Budget, cycles: Cycles, reports: Reports, settings: Settings }[cur[0]]
  return <div className="app">
    <aside className={`side ${open ? 'open' : ''}`}>
      <img src={asset('brand/logo-horizontal-white.png')} alt="وزارة الإسكان والتخطيط العمراني" style={{ width: '100%' }} />
      <div className="brand">منصة حوافز الإجادة المؤسسية</div>
      <nav className="nav">{nav.map(([k, l, , ic]) => <a key={k} href={'#' + k} className={cur[0] === k ? 'on' : ''} onClick={() => setOpen(false)}><Icon n={ic} />{l}{k === 'settings' && pendReq > 0 && <span className="nbadge">{pendReq}</span>}</a>)}</nav>
      <div className="role"><label>{ROLE_META[me.role].title}</label><b>{me.full_name}</b>
        <button className="btn o s" style={{ marginTop: 8 }} onClick={() => sb.auth.signOut()}><Icon n="out" size={14} />خروج</button></div>
      {me.is_super && <ViewAs />}
      {import.meta.env.VITE_DEMO === '1' && !me.is_super && <div className="role"><label>معاينة بالأدوار (بيانات وهمية)</label>
        {[['ejada', 'فريق الإجادة'], ['dg', 'مدير عام'], ['dev', 'التطوير والدراسات'], ['fin', 'الشؤون المالية']].map(([r, l]) => <a key={r} href={'?role=' + r + location.hash} style={{ display: 'block', color: '#4ad6ed', padding: '3px 0' }}>{l}</a>)}</div>}
      <div style={{ flex: 1 }} />
      <img src={asset('brand/ejada-logo-white.png')} alt="إجادة" style={{ width: 120, alignSelf: 'flex-start', opacity: .9 }} />
      <img src={asset('brand/slogan-2line-white.png')} alt="نتقدّم بثقة، وبالثقة" style={{ width: 150 }} />
    </aside>
    <div className="main">
      <div className="topbar"><button className="btn o s mtop" onClick={() => setOpen(!open)}><Icon n="menu" size={18} /></button>
        <h1><Icon n={cur[3]} size={24} />{cur[1]}</h1>
        <div className="yr">السنة <select value={year} onChange={(e) => setYear(+e.target.value)}>{years.map((y) => <option key={y.year}>{y.year}</option>)}</select></div></div>
      {me.is_super && me.role !== 'ejada' && <div className="vbanner"><Icon n="shield" size={16} />وضع العرض: تُشاهد المنصة الآن كـ <b>{ROLE_META[me.role].title}{me.role === 'dg' ? ' — ' + shortName(divisions.find((d) => d.id === me.division_id)?.name || '') : ''}</b></div>}
      <div className="content">{loaded ? <div className="page" key={cur[0] + year}><Boundary key={cur[0]}><S track={cur[0]} go={go} /></Boundary></div> : <div className="grid g4">{[0, 1, 2, 3].map((i) => <div key={i} className="skel" />)}</div>}</div>
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
  if (!session) return <Landing />
  if (denied) return <div className="login"><div className="card"><h2>الحساب غير مسجل</h2><div className="muted">بريدك غير مضاف في قائمة المستخدمين. قدّم طلب انضمام ليعتمده فريق الإجادة.</div>
    <div style={{ display: 'flex', gap: 8 }}><button className="btn t" onClick={() => { sessionStorage.setItem('reqmode', '1'); setDenied(false); sb.auth.signOut() }}>تقديم طلب انضمام</button><button className="btn o" onClick={() => { setDenied(false); sb.auth.signOut() }}>خروج</button></div></div></div>
  if (!me) return null
  return <Provider me={me}><Shell /></Provider>
}
