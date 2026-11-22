import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { sb } from './supabase'
import Icon from './Icon'
import { CountUp } from './motion'

export const asset = (p) => import.meta.env.BASE_URL + p
export const TRACKS = {
  service: { name: 'موظف خدمة المستفيدين', short: 'خدمة المستفيدين', c: '#0f446c', cb: '#e1ecf6', period: 'ربع سنوية',
    appr: 'المديرية العامة للتطوير والدراسات', reward: '300 ر.ع لكل فائز',
    desc: 'ترسيخ ثقافة تقديم خدمات متميزة، بتكريم الموظف المتميز في التقسيمات التي تقدم خدمات مباشرة للمستفيدين.',
    long: 'يهدف المسار إلى ترسيخ ثقافة تقديم الخدمات المتميزة، من خلال تكريم الموظف المتميز في كل جهة تقدّم خدماتها مباشرة للمستفيدين. يُكرَّم فائز واحد عن كل جهة في كل ربع، وتُقيَّم الترشيحات وفق معايير الجودة واللباقة وسرعة الإنجاز والمهنية.',
    scope: 'الجهات التي تقدم خدمات مباشرة للمستفيدين، جائزة واحدة لكل جهة في كل ربع' },
  innovator: { name: 'الموظف المبتكر', short: 'المبتكر', c: '#aa7f67', cb: '#ede4df', period: 'نصف سنوية',
    appr: 'المديرية العامة للتطوير والدراسات', reward: '500 / 400 / 300 ر.ع',
    desc: 'تعزيز ثقافة الابتكار، بتكريم أصحاب الأفكار المعتمدة نتائجها في منصة «نبتكر».',
    long: 'يستهدف المسار تعزيز ثقافة الابتكار، بتكريم أصحاب الأفكار والحلول الجديدة التي تحسّن الأداء أو تطوّر الخدمات أو تخفّض التكاليف. تُقدَّم الأفكار وتُحكَّم في منصة «نبتكر»، ثم تُدخل هنا النتائج المعتمدة ويُكرَّم ثلاثة فائزين في كل نصف سنة.', scope: 'جميع التقسيمات' },
  initiator: { name: 'الموظف المبادر', short: 'المبادر', c: '#00827a', cb: '#c2f2e4', period: 'ربع سنوية',
    appr: 'المديرية العامة للشؤون الإدارية والمالية', reward: 'ضمن مخصص التقسيم السنوي',
    desc: 'تحفيز الموظفين على المبادرة وتنفيذ أعمال خارج مهامهم المعتادة تحقق نتائج إيجابية.',
    long: 'يهدف المسار إلى تحفيز الموظفين على المبادرة وتنفيذ أعمال خارج مهامهم المعتادة تحقق نتائج إيجابية. يُرشَّح المتميزون في كل ربع، وتُصرف حوافزهم ضمن المخصص السنوي لتقسيمهم الذي يحدده المدير العام.', scope: 'جميع التقسيمات' },
}
export const PERIOD = { service: ['', 'الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  initiator: ['', 'الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'], innovator: ['', 'النصف الأول', 'النصف الثاني'] }
export const periodName = (t, p) => PERIOD[t]?.[p] || ''
export const ST = [['draft', 'مسودة'], ['sent', 'مرسل'], ['needs_info', 'يحتاج استكمال'], ['review', 'قيد المراجعة'],
  ['approved', 'معتمد'], ['to_pay', 'أُحيل للصرف'], ['paid', 'صُرف'], ['honored', 'تم التكريم']]
export const STN = Object.fromEntries(ST)
export const APPROVED = ['approved', 'to_pay', 'paid', 'honored']
export const ROLES = { dg: 'المدير العام / المسؤول الأعلى للتقسيم', ejada: 'فريق الإجادة المؤسسية', dev: 'جهة اعتماد خدمة المستفيدين والمبتكر', admin_fin: 'جهة اعتماد المبادر والصرف' }
export const ROLE_META = {
  dg: { title: 'المدير العام للتقسيم', org: 'تعبئة الاستمارات واعتماد وإرسال الترشيحات', home: 'الرئيسية', c: '#006452', c2: '#00827a', icon: 'unit', duties: ['تعبئة الاستمارات', 'اعتماد وإرسال الترشيحات', 'استكمال المُعاد'] },
  ejada: { title: 'فريق الإجادة المؤسسية', org: 'التجميع والحصر والنظرة العامة', home: 'لوحة القيادة', c: '#00827a', c2: '#0f446c', icon: 'shield', duties: ['تجميع الترشيحات وحصر الجهات', 'النظرة العامة على المنصة', 'استلام الترشيحات ومراجعتها', 'إدخال نتائج المبتكر', 'تسجيل التكريم والتقارير'] },
  dev: { title: 'جهة اعتماد خدمة المستفيدين والمبتكر', org: 'المديرية العامة للتطوير والدراسات', home: 'لوحة الاعتماد', c: '#0f446c', c2: '#00253e', icon: 'review', duties: ['اعتماد مسار خدمة المستفيدين', 'اعتماد نتائج المبتكر بعد إدخالها', 'إدارة معايير التقييم وأوزانها'] },
  admin_fin: { title: 'جهة اعتماد المبادر والصرف', org: 'المديرية العامة للشؤون الإدارية والمالية', home: 'لوحة الصرف', c: '#aa7f67', c2: '#5c3f2e', icon: 'coin', duties: ['اعتماد مسار المبادر', 'الإحالة للصرف وتسجيله', 'إدارة سجل الموظفين', 'إدارة معايير التقييم وأوزانها'] },
}
export const shortName = (n = '') => n
export const fmt = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })
export const fdate = (d) => (d ? new Date(d).toLocaleDateString('ar-OM-u-nu-latn') : '—')
export const approverOf = (t) => (t === 'initiator' ? 'admin_fin' : 'dev')

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function Provider({ me, children }) {
  const [year, setYear] = useState(2026)
  const [d, setD] = useState({ years: [], divisions: [], outlets: [], dyears: [], cycles: [], criteria: [], noms: [], users: [], requests: [], loaded: false })
  const [toast, setToast] = useState('')
  const say = useCallback((m) => { setToast(m); setTimeout(() => setToast(''), 3200) }, [])
  const reload = useCallback(async () => {
    const q = (t, f) => (f ? f(sb.from(t).select('*')) : sb.from(t).select('*'))
    const [years, divisions, outlets, dyears, cycles, criteria, noms, users, requests] = await Promise.all([
      q('year_settings'), q('divisions'), q('outlets'), q('division_years'), q('cycles'), q('criteria'),
      sb.from('nominations').select('*').order('created_at', { ascending: false }).limit(5000),
      me.role === 'ejada' ? q('profiles') : Promise.resolve({ data: [] }),
      me.role === 'ejada' ? sb.from('access_requests').select('*').order('created_at', { ascending: false }) : Promise.resolve({ data: [] })])
    setD({ years: years.data || [], divisions: divisions.data || [], outlets: outlets.data || [], dyears: dyears.data || [],
      cycles: cycles.data || [], criteria: (criteria.data || []).sort((a, b) => a.ord - b.ord), noms: noms.data || [], users: users.data || [], requests: requests.data || [], loaded: true })
  }, [me.role])
  useEffect(() => { reload() }, [reload])
  const ys = d.years.find((y) => y.year === year)
  const divName = (id) => d.divisions.find((x) => x.id === id)?.name || '—'
  const rpc = async (fn, args) => {
    const { data, error } = await sb.rpc(fn, args)
    if (error) { say(error.message); throw error }
    return data
  }
  const value = { me, year, setYear, ...d, ys, divName, reload, say, rpc, toast }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const Pill = ({ s }) => <span className={`pill st-${s}`}>{STN[s]}</span>
export const Tk = ({ t }) => <span className="tk"><i style={{ background: TRACKS[t].c }} />{TRACKS[t].short}</span>
export function Modal({ title, onClose, children, foot }) {
  return <div className="mdl on" onClick={onClose}><div className="box" onClick={(e) => e.stopPropagation()}>
    <h3>{title}</h3>{children}{foot && <div className="ft">{foot}</div>}</div></div>
}
export const Kpi = ({ l, v, s, icon = 'dash', c, i = 0 }) => <div className="card kpi lift" style={{ '--c': c || 'var(--teal)', '--i': i }}><span className="kic"><Icon n={icon} size={22} /></span><div className="l">{l}</div><div className="v num"><CountUp value={v} /></div>{s && <div className="s">{s}</div>}</div>
export const Sec = ({ t, children }) => <div className="sec"><h2>{t}</h2><div className="sp" />{children}</div>
