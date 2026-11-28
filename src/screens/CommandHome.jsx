import { useMemo, useState } from 'react'
import { useApp, Kpi, Sec, TRACKS, APPROVED, ST, STN, periodName, shortName } from '../lib'
import Icon, { TRACK_ICON } from '../Icon'
import { RoleHero, Funnel, Task, Bars, Donut, DCOL, Ring } from '../ui'

// لوحة فريق الإجادة: مؤشرات وإحصاءات ومتابعة أداء المسارات عن بعد
export default function CommandHome({ go }) {
  const { me, year, noms, divisions, cycles, requests } = useApp()
  const [fl, setFl] = useState({ track: '', q: 0, gov: '' })
  const govs = [...new Set(divisions.map((d) => d.governorate).filter(Boolean))]
  const inQ = (n) => !fl.q || (n.track === 'innovator' ? n.period === Math.ceil(fl.q / 2) : n.period === fl.q)
  const yr = useMemo(() => noms.filter((n) => n.year === year && n.status !== 'draft' && (!fl.track || n.track === fl.track) && inQ(n)
    && (!fl.gov || divisions.find((d) => d.id === n.division_id)?.governorate === fl.gov)), [noms, year, fl, divisions])
  const all = useMemo(() => noms.filter((n) => n.year === year && n.status !== 'draft'), [noms, year])
  const c = (f) => yr.filter(f).length
  const pendReq = requests.filter((r) => r.status === 'pending').length
  const toHonor = all.filter((n) => n.status === 'to_pay').length; const back = all.filter((n) => n.status === 'needs_info').length
  const svcDivs = divisions.filter((d) => d.active && d.is_service)
  const stages = [['review', 'بانتظار اعتماد الجهة', '#0f446c'], ['approved', 'معتمد', '#43b987'], ['to_pay', 'أُحيل للصرف', '#aa7f67'], ['honored', 'تم التكريم', '#00253e']].map(([k, l, col]) => ({ k, l, c: col, n: c((n) => n.status === k) }))
  const tasks = [[toHonor, 'محالة للصرف بانتظار تسجيل التكريم', 'trophy', 'reports'], [pendReq, 'طلبات انضمام بانتظار الاعتماد', 'users', 'settings']]
  const open = cycles.filter((x) => x.year === year && x.is_open).length
  const mine = (t) => yr.filter((n) => n.track === t)
  const q4 = [1, 2, 3, 4]
  return <>
    <RoleHero role="ejada" name={me.full_name} stat={[all.length, 'ترشيحاً واردة هذه السنة']} />
    <div className="card flt" style={{ marginTop: 14 }}><Icon n="dash" size={18} style={{ color: 'var(--teal)' }} />
      <select value={fl.track} onChange={(e) => setFl({ ...fl, track: e.target.value })}><option value="">كل المسارات</option>{Object.entries(TRACKS).map(([k, t]) => <option key={k} value={k}>{t.short}</option>)}</select>
      <select value={fl.q} onChange={(e) => setFl({ ...fl, q: +e.target.value })}><option value={0}>السنة كاملة</option>{q4.map((x) => <option key={x} value={x}>{['', 'الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'][x]}</option>)}</select>
      <select value={fl.gov} onChange={(e) => setFl({ ...fl, gov: e.target.value })}><option value="">كل المحافظات</option>{govs.map((g) => <option key={g}>{g}</option>)}</select>
      <span className="muted small">المؤشرات تتبع المرشّحات أعلاه</span></div>
    <div className="grid g4 stg" style={{ marginTop: 14 }}>
      <Kpi i={0} icon="send" c="#0f446c" l="ترشيحات واردة" v={yr.length} />
      <Kpi i={1} icon="clock" c="#aa7f67" l="بانتظار اعتماد الجهات" v={c((n) => n.status === 'review')} />
      <Kpi i={2} icon="check" c="#43b987" l="معتمدة" v={c((n) => APPROVED.includes(n.status))} />
      <Kpi i={3} icon="trophy" c="#00253e" l="مُكرَّمون" v={c((n) => n.status === 'honored')} /></div>
    {(toHonor > 0 || pendReq > 0 || back > 0) && <><Sec t="يحتاج متابعتك" /><div className="tasks stg">{tasks.filter((t) => t[0] > 0).map(([n, l, ic, to]) => <Task key={l} n={n} label={l} icon={ic} onClick={() => go(to)} />)}
      {back > 0 && <Task n={back} label="ترشيحات أعادتها جهات الاعتماد للاستكمال" icon="alert" onClick={() => go('review')} tone="warn" />}</div></>}
    <Sec t="أداء المسارات" />
    <div className="grid g3 stg">{Object.entries(TRACKS).map(([k, T], i) => { const t = mine(k); const ap = t.filter((n) => APPROVED.includes(n.status)).length; const exp = k === 'service' ? svcDivs.length * 4 : k === 'innovator' ? 6 : 0
      return <div className="card trk lift" key={k} style={{ '--c': T.c, '--i': i }}><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><div className="ic-box"><Icon n={TRACK_ICON[k]} size={26} /></div><div><h3 style={{ fontSize: 17 }}>{T.name}</h3><div className="muted small">يعتمده: {T.appr}</div></div></div>
        <div className="tmini"><div><b className="num">{t.length}</b><span>واردة</span></div><div><b className="num">{t.filter((n) => n.status === 'review').length}</b><span>بانتظار الاعتماد</span></div><div><b className="num">{ap}</b><span>معتمدة</span></div><div><b className="num">{t.filter((n) => n.status === 'honored').length}</b><span>مُكرَّمة</span></div></div>
        {exp > 0 && !fl.q && <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}><Ring value={ap} max={exp} color={T.c}>{Math.round((ap / exp) * 100)}%</Ring><div className="muted small">{ap} من {exp} {k === 'service' ? 'جائزة (جهة × ربع)' : 'مراكز'}</div></div>}</div> })}</div>
    <div className="grid g2 stg" style={{ marginTop: 14 }}>
      <div className="card"><h3>مقارنة الأرباع — المعتمدون</h3><Bars labels={['ر1', 'ر2', 'ر3', 'ر4']} series={[{ c: TRACKS.service.c, v: q4.map((p) => all.filter((n) => n.track === 'service' && n.period === p && APPROVED.includes(n.status)).length) }, { c: TRACKS.initiator.c, v: q4.map((p) => all.filter((n) => n.track === 'initiator' && n.period === p && APPROVED.includes(n.status)).length) }]} />
        <div className="legend"><span><i style={{ background: TRACKS.service.c }} />خدمة المستفيدين</span><span><i style={{ background: TRACKS.initiator.c }} />المبادر</span></div></div>
      <div className="card"><h3>توزيع الحالات</h3><div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}><Donut total={yr.length} parts={ST.filter((s) => s[0] !== 'draft').map(([k]) => ({ k, c: DCOL[k] || '#6f92b4', v: c((n) => n.status === k) }))} />
        <div className="flt" style={{ flex: 1 }}>{ST.filter((s) => !['draft', 'sent'].includes(s[0])).map(([k, l]) => <span key={k} className={`pill st-${k}`}>{l}: {c((n) => n.status === k)}</span>)}</div></div></div></div>
    <Sec t="مسار الترشيحات" /><div className="card"><Funnel stages={stages} onPick={() => go('review')} /></div>
    <Sec t="حصر الجهات"><span className="muted small">حالة كل جهة في المسارات · {open} دورة مفتوحة</span></Sec>
    <div className="card tw"><table className="matrix"><thead><tr><th>الجهة</th><th colSpan="4">خدمة المستفيدين (الأرباع)</th><th>المبادر</th><th>المبتكر</th></tr></thead><tbody>
      {divisions.filter((d) => d.active && !d.counted_in_parent && (!fl.gov || d.governorate === fl.gov)).map((d) => { const dn = all.filter((n) => n.division_id === d.id)
        const sv = (q) => { const w = dn.find((n) => n.track === 'service' && n.period === q && APPROVED.includes(n.status)); const p = dn.find((n) => n.track === 'service' && n.period === q && ['review', 'needs_info'].includes(n.status)); return w ? <span className="cell win" title={w.emp_name}><Icon n="trophy" size={13} />{q}</span> : p ? <span className="cell pend">{q}</span> : <span className="cell none">{d.is_service ? '·' : '—'}</span> }
        const ini = dn.filter((n) => n.track === 'initiator'); const inv = dn.filter((n) => n.track === 'innovator')
        return <tr key={d.id}><td>{d.name}</td>{q4.map((q) => <td key={q}>{sv(q)}</td>)}<td>{ini.length ? <span className="cell win">{ini.length} · معتمد {ini.filter((n) => APPROVED.includes(n.status)).length}</span> : <span className="cell none">·</span>}</td><td>{inv.length ? <span className="cell win"><Icon n="bulb" size={13} />{inv.length}</span> : <span className="cell none">·</span>}</td></tr> })}</tbody></table></div>
  </>
}
