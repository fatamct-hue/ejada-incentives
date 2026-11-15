import { useEffect, useState } from 'react'
import { sb } from '../supabase'
import * as XLSX from 'xlsx'
import { useApp, Sec, TRACKS, periodName, fdate, fmt, STN } from '../lib'

export default function Reports() {
  const { me, year, noms, divName, criteria, rpc, say } = useApp()
  const [pub, setPub] = useState(null); const [ev, setEv] = useState({})
  const honored = noms.filter((n) => n.year === year && n.status === 'honored')
  const loadPub = () => sb.from('publish_versions').select('*').eq('year', year).order('approved_at', { ascending: false }).limit(1).then((r) => setPub(r.data?.[0] || null))
  useEffect(() => { loadPub(); sb.from('attachments').select('nomination_id,file_name').then((r) => { const m = {}; (r.data || []).forEach((a) => (m[a.nomination_id] ||= []).push(a.file_name)); setEv(m) }) }, [year])
  const download = (rows, name) => { const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Sheet1'); XLSX.writeFile(wb, name) }
  const exportNoms = () => download(noms.filter((n) => n.year === year && n.status !== 'draft').map((n) => ({ 'الرقم الوظيفي': n.emp_no, 'الاسم': n.emp_name, 'التقسيم': divName(n.division_id), 'المسار': TRACKS[n.track].short, 'الدورة': periodName(n.track, n.period), 'الحالة': STN[n.status], 'المجموع': n.total, 'المبلغ': n.amount })), `nominations-${year}.xlsx`)
  const exportScores = () => download(noms.filter((n) => n.year === year && n.track !== 'innovator' && n.status !== 'draft').map((n) => ({ 'الرقم الوظيفي': n.emp_no, 'الاسم': n.emp_name, 'المسار': TRACKS[n.track].short, 'الدورة': periodName(n.track, n.period), ...Object.fromEntries(criteria.filter((c) => c.track === n.track).map((c) => [c.label, n.scores?.[c.id] ?? ''])), 'المجموع': n.total })), `scores-${year}.xlsx`)
  const exportLabour = () => download(honored.map((n) => ({ 'الرقم الوظيفي': n.emp_no, 'الاسم': n.emp_name, 'التقسيم': divName(n.division_id), 'المسار': TRACKS[n.track].short, 'الدورة': periodName(n.track, n.period), 'تاريخ التكريم': n.honored_on, 'الشواهد': (ev[n.id] || []).join('، ') })), `labour-${year}.xlsx`)
  const exportPub = () => download((pub?.rows || []).map((r) => ({ 'الاسم': r.name, 'التقسيم': r.division, 'المسار': TRACKS[r.track].short, 'الدورة/المركز': r.rank ? `المركز ${r.rank}` : periodName(r.track, r.period) })), `official-list-${year}.xlsx`)
  const approve = async () => { if (!window.confirm('اعتماد نسخة النشر من قائمة المكرّمين الحالية؟ راجع الأسماء أولاً.')) return; await rpc('approve_publish', { p_year: year }); loadPub(); say('اعتُمدت نسخة النشر') }
  const certs = () => { const w = window.open('', '_blank'); w.document.write(`<html dir="rtl" lang="ar"><head><title>شهادات</title><style>@page{size:A4 landscape;margin:0}body{margin:0;font-family:Tahoma}.c{width:297mm;height:209mm;box-sizing:border-box;border:12px double #00253e;padding:30mm;text-align:center;page-break-after:always;color:#00253e}.c h1{margin:30px 0;color:#006452;font-size:44px}.c h2{font-size:36px}</style></head><body>${honored.map((n) => `<div class="c"><div>وزارة الإسكان والتخطيط العمراني — سلطنة عُمان</div><h1>شهادة تهنئة</h1><div>تتقدم الوزارة بالتهنئة إلى</div><h2>${n.emp_name}</h2><div>لتكريمه ضمن ${TRACKS[n.track].name} — ${n.track === 'innovator' ? 'المركز ' + n.rank : periodName(n.track, n.period)} ${n.year}</div><div style="margin-top:40px">فريق الإجادة المؤسسية</div></div>`).join('')}</body></html>`); w.document.close(); w.focus(); setTimeout(() => w.print(), 400) }
  const approved = noms.filter((n) => n.year === year && ['approved', 'to_pay', 'paid', 'honored'].includes(n.status))
  return <>
    <div className="card noprint flt"><button className="btn o" onClick={exportNoms}>Excel — الترشيحات</button><button className="btn o" onClick={exportScores}>Excel — التقييمات</button>
      <button className="btn o" onClick={() => window.print()}>تقرير PDF مختصر للقيادة</button>{me.role === 'ejada' && <button className="btn t" onClick={certs} disabled={!honored.length}>شهادات التهنئة</button>}</div>
    <div className="card" style={{ marginTop: 14 }}><h3>تقرير مختصر — {year}</h3><div className="grid g4" style={{ marginTop: 10 }}>
      {Object.entries(TRACKS).map(([k, T]) => <div key={k}><div className="muted small">{T.short}</div><b className="num">{approved.filter((n) => n.track === k).length}</b> معتمد · <b className="num">{honored.filter((n) => n.track === k).length}</b> مُكرَّم</div>)}
      <div><div className="muted small">إجمالي المبالغ المعتمدة</div><b className="num">{fmt(approved.reduce((s, n) => s + Number(n.amount || 0), 0))}</b> ر.ع</div></div></div>
    <Sec t="قائمة التكريم"><span className="muted small noprint">من سُجّل تكريمهم فعلياً فقط</span></Sec>
    <div className="card tw"><table><thead><tr><th>الاسم</th><th>التقسيم</th><th>المسار</th><th>الدورة</th><th>تاريخ التكريم</th></tr></thead><tbody>
      {honored.map((n) => <tr key={n.id}><td>{n.emp_name}</td><td>{divName(n.division_id)}</td><td>{TRACKS[n.track].short}</td><td>{n.rank ? `المركز ${n.rank}` : periodName(n.track, n.period)}</td><td>{fdate(n.honored_on)}</td></tr>)}
      {!honored.length && <tr><td colSpan="5" className="muted">لم يُسجَّل تكريم بعد.</td></tr>}</tbody></table></div>
    <div className="noprint"><Sec t="قائمة النشر الرسمية">{me.role === 'ejada' && <button className="btn g s" onClick={approve}>اعتماد نسخة النشر</button>}</Sec>
      <div className="card tw">{pub ? <><div className="muted small">نسخة معتمدة من {pub.approved_by} — {fdate(pub.approved_at)}</div>
        <table><thead><tr><th>الاسم</th><th>التقسيم</th><th>المسار</th><th>الدورة / المركز</th></tr></thead><tbody>{pub.rows.map((r, i) => <tr key={i}><td>{r.name}</td><td>{r.division}</td><td>{TRACKS[r.track].short}</td><td>{r.rank ? `المركز ${r.rank}` : periodName(r.track, r.period)}</td></tr>)}</tbody></table>
        <button className="btn o s" style={{ marginTop: 8 }} onClick={exportPub}>تصدير Excel</button></> : <span className="muted">لا توجد نسخة نشر معتمدة بعد.</span>}</div>
      {me.role === 'ejada' && <><Sec t="كشف وزارة العمل" /><div className="card"><button className="btn o" onClick={exportLabour} disabled={!honored.length}>تصدير الكشف (Excel)</button></div></>}</div>
  </>
}
