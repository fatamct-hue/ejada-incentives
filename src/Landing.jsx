import { useState } from 'react'
import Login from './Login'
import Icon, { TRACK_ICON } from './Icon'
import { TRACKS, asset } from './lib'
import { useInView } from './motion'

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, on] = useInView()
  return <div ref={ref} className={`rv ${on ? 'in' : ''} ${className}`} style={{ '--d': `${delay}ms` }}>{children}</div>
}

const FLOW = [['إعداد الترشيح وإرساله', 'send', 'يعبّئ المدير العام الاستمارة ويرسلها مباشرة إلى جهة اعتماد المسار.'], ['الاعتماد', 'check', 'تعتمده الجهة المختصة بالمسار أو تعيده للاستكمال بسبب موثّق.'], ['الإحالة للصرف', 'coin', 'تستخرج الشؤون الإدارية والمالية كشف الحوافز وتصنّفه محالاً للصرف.'], ['التكريم', 'trophy', 'يُسجَّل التكريم ويُدرج في قوائم التكريم.']]
const ROLES_INFO = [
  ['dg', 'unit', 'المدير العام / المسؤول الأعلى', 'يعبّئ استمارات الترشيح لتقسيمه، ويعتمد ويرسل، ويستكمل ما يُعاد إليه، ويتابع جوائز تقسيمه ومخصصاته.', '#006452'],
  ['ejada', 'shield', 'فريق الإجادة المؤسسية', 'يتابع عن بُعد أداء المسارات الثلاثة بالمؤشرات والإحصاءات، ويدخل نتائج المبتكر، ويسجّل التكريم، ويُصدر التقارير.', '#00827a'],
  ['dev', 'review', 'جهة اعتماد خدمة المستفيدين والمبتكر', 'المديرية العامة للتطوير والدراسات: تعتمد ترشيحات مسار خدمة المستفيدين، ونتائج مسار المبتكر («نبتكر») بعد إدخالها، وتدير معايير تقييم المسار وأوزانها.', '#0f446c'],
  ['fin', 'coin', 'جهة اعتماد المبادر والصرف', 'المديرية العامة للشؤون الإدارية والمالية: تعتمد ترشيحات مسار المبادر، وتحيل الحوافز للصرف وتسجّله، وتدير معايير تقييم المسار وأوزانها.', '#aa7f67'],
]

export default function Landing() {
  const [auth, setAuth] = useState(sessionStorage.getItem('reqmode') ? 'request' : null)
  const open = (m) => { sessionStorage.removeItem('reqmode'); setAuth(m) }
  return <div className="landing">
    <header className="lhead"><img src={asset('brand/logo-horizontal-white.png')} alt="وزارة الإسكان والتخطيط العمراني" />
      <nav><a href="#about">عن المنصة</a><a href="#tracks">المسارات</a><a href="#flow">كيف تعمل</a><a href="#roles">الأدوار</a></nav>
      <div className="lact"><button className="btn o s" onClick={() => open('request')}>طلب حساب</button><button className="btn c s" onClick={() => open('login')}><Icon n="shield" size={16} />دخول</button></div></header>

    <section className="lhero"><i className="orb" /><i className="orb o2" />
      <div className="lh-in"><Reveal><div className="rtag"><Icon n="spark" size={16} />وزارة الإسكان والتخطيط العمراني · سلطنة عُمان</div>
        <h1>منصة حوافز <em>الإجادة المؤسسية</em></h1>
        <p>منصة موحّدة تجمع ترشيحات الجهات وتعتمدها وتصرف حوافزها وتوثّق تكريم المتميزين، في ثلاثة مسارات تحفّز التميز والابتكار والمبادرة.</p>
        <div className="lh-cta"><button className="btn c" onClick={() => open('login')}><Icon n="shield" size={18} />دخول المنصة</button><button className="btn o" onClick={() => open('request')}><Icon n="users" size={18} />قدّم طلب انضمام</button></div></Reveal>
        <div className="lh-tracks">{Object.entries(TRACKS).map(([k, T], i) => <div className="cube big" key={k} style={{ '--d': `${i * -1.3}s` }}><Icon n={TRACK_ICON[k]} size={40} stroke={1.4} /><span>{T.short}</span></div>)}</div></div>
      <a className="lscroll" href="#about" aria-label="للأسفل"><Icon n="arrow" size={20} style={{ transform: 'rotate(-90deg)' }} /></a></section>

    <section id="about" className="lsec"><Reveal><h2 className="lt">عن المنصة</h2><p className="ls">تحوّل المنصة الدورة الورقية لحوافز الإجادة إلى مسار إلكتروني واضح، تعبّئ فيه الجهات استمارات الترشيح من أجهزتها فتصل مباشرة إلى المنصة المركزية.</p></Reveal>
      <div className="grid g4 stg">{[['form', 'الترشيح الإلكتروني', 'استمارات موحّدة بمعايير تقييم معتمدة وشواهد مرفقة.'], ['review', 'المراجعة والاعتماد', 'يعتمد كل مسار الجهة المختصة به، مع سجل كامل للإجراءات.'], ['coin', 'الصرف وفق المخصصات المعتمدة', 'مخصص سنوي لكل مديرية، مع التحقق من الرصيد قبل الاعتماد والصرف.'], ['trophy', 'التكريم والتقارير', 'قوائم تكريم رسمية وشهادات وتقارير لقيادة الوزارة.']].map(([ic, t, d], i) =>
        <Reveal key={t} delay={i * 90}><div className="card lift vc"><div className="vi"><Icon n={ic} size={26} /></div><h3>{t}</h3><p>{d}</p></div></Reveal>)}</div></section>

    <section id="tracks" className="lsec"><Reveal><h2 className="lt">المسارات الثلاثة</h2><p className="ls">لكل مسار هدفه ودوريته وجهة اعتماده ومكافأته.</p></Reveal>
      <div className="grid g3 stg">{Object.entries(TRACKS).map(([k, T], i) => <Reveal key={k} delay={i * 110}><div className="card trk lift tcl" style={{ '--c': T.c }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><div className="ic-box"><Icon n={TRACK_ICON[k]} size={30} /></div><h3>{T.name}</h3></div>
        <p className="muted" style={{ lineHeight: 1.9 }}>{T.long}</p>
        <dl><dt>الدورية</dt><dd>{T.period}</dd><dt>المكافأة</dt><dd>{T.reward}</dd><dt>الاعتماد</dt><dd>{T.appr}</dd><dt>المشمولون</dt><dd>{T.scope}</dd></dl></div></Reveal>)}</div></section>

    <section id="flow" className="lsec"><Reveal><h2 className="lt">كيف تعمل المنصة</h2><p className="ls">خمس خطوات من إعداد الترشيح حتى التكريم، ويمكن إعادة الترشيح للاستكمال قبل الاعتماد بسبب موثّق.</p></Reveal>
      <Reveal><div className="card"><div className="steps2">{FLOW.map(([s, ic, d], i) => <div className="stp" key={s} style={{ '--i': i }}><div className="dot"><Icon n={ic} size={20} /></div><b style={{ display: 'block', fontSize: 14 }}>{s}</b><span className="muted" style={{ fontSize: 12.5 }}>{d}</span></div>)}</div></div></Reveal></section>

    <section id="roles" className="lsec"><Reveal><h2 className="lt">من يفعل ماذا</h2><p className="ls">لكل جهة دور محدد في المنصة وصلاحيات تُطبَّق على الخادم.</p></Reveal>
      <div className="grid g4 stg">{ROLES_INFO.map(([k, ic, t, d, c], i) => <Reveal key={k} delay={i * 90}><div className="card lift rc" style={{ '--c': c }}><div className="ri"><Icon n={ic} size={24} /></div><h3>{t}</h3><p>{d}</p></div></Reveal>)}</div></section>

    <section className="lmot"><i className="orb" /><div className="lmot-in"><Reveal><div className="rtag"><Icon n="spark" size={16} />رسالتنا</div>
      <h2>الوزارة قائمة بدورها في تقدير من يصنع الفرق</h2><p>نؤمن أن التميّز يبدأ بالمبادرة، وأن الموظف المتقن لعمله هو أساس جودة الخدمة. ومن هنا جاءت هذه المنصة: لنُنصف المجتهدين، ونكرّم المتميزين، ونحفّز الجميع على الأفضل.</p></Reveal>
      <div className="grid g3 stg" style={{ marginTop: 22 }}>{[['trophy', 'التميّز يُكرَّم', 'كل جهد متقن يستحق التقدير، وكل إنجاز موثّق يجد طريقه إلى التكريم.'], ['spark', 'المبادرة تصنع الأثر', 'من يبادر خارج مهامه المعتادة يضع بصمته في تحسين العمل وخدمة المستفيدين.'], ['bulb', 'الابتكار طريقنا للأفضل', 'الفكرة الجيدة اليوم هي خدمة أسرع وتكلفة أقل غداً، ونحن نحتفي بأصحابها.']].map(([ic, t, d], i) =>
        <Reveal key={t} delay={i * 110}><div className="mcard"><div className="mi"><Icon n={ic} size={26} /></div><h3>{t}</h3><p>{d}</p></div></Reveal>)}</div></div></section>

    <section className="lsec"><Reveal><div className="lcta"><i className="orb" /><div><h2>هل أنت من منسوبي الوزارة؟</h2><p>قدّم طلب انضمام بصفتك، وبعد اعتماده من فريق الإجادة تدخل المنصة برمز يصل إلى بريدك الحكومي.</p></div>
      <div className="lh-cta"><button className="btn c" onClick={() => open('request')}>قدّم طلب انضمام</button><button className="btn o" onClick={() => open('login')}>لدي حساب</button></div></div></Reveal></section>

    <footer className="lfoot"><img src={asset('brand/ejada-logo-white.png')} alt="إجادة" style={{ height: 46 }} /><img src={asset('brand/slogan-2line-white.png')} alt="نتقدّم بثقة، وبالثقة" style={{ height: 54 }} />
      <div className="small" style={{ color: '#afc5d3' }}>وزارة الإسكان والتخطيط العمراني · فريق الإجادة المؤسسية</div></footer>
    {auth && <Login start={auth} key={auth} onClose={() => setAuth(null)} />}
  </div>
}
