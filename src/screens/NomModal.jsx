import { useEffect, useState } from 'react'
import { sb } from '../supabase'
import { useApp, Modal, Pill, TRACKS, periodName, fmt, fdate, approverOf, STN } from '../lib'

export default function NomModal({ nom, onClose }) {
  const { me, criteria, divName, rpc, reload, say } = useApp()
  const [ev, setEv] = useState([]); const [files, setFiles] = useState([]); const [note, setNote] = useState(''); const [date, setDate] = useState('')
  useEffect(() => {
    sb.from('nomination_events').select('*').eq('nomination_id', nom.id).order('at').then((r) => setEv(r.data || []))
    sb.from('attachments').select('*').eq('nomination_id', nom.id).then((r) => setFiles(r.data || []))
  }, [nom.id])
  const act = async (a, needNote) => {
    if (needNote && !note.trim()) return say('اكتب السبب أولاً')
    await rpc('transition_nomination', { p_id: nom.id, p_action: a, p_note: note || null, p_date: date || null })
    await reload(); say('تم تنفيذ الإجراء'); onClose()
  }
  const open = async (f) => { const { data } = await sb.storage.from('evidence').createSignedUrl(f.path, 120); if (data) window.open(data.signedUrl) }
  const T = TRACKS[nom.track]; const s = nom.status; const r = me.role; const ap = approverOf(nom.track)
  const btns = []
  if (r === 'ejada' && s === 'sent') btns.push(['receive', 'استلام وبدء المراجعة', 't'])
  if (r === 'ejada' && ['sent', 'review'].includes(s)) btns.push(['recommend', 'توصية', 'g'])
  if ((r === 'ejada' || r === ap) && ['sent', 'review', 'recommended'].includes(s)) btns.push(['needs_info', 'إعادة للاستكمال', 'd', true])
  if (r === ap && s === 'recommended') btns.push(['approve', 'اعتماد', 'g'])
  if (r === 'admin_fin' && s === 'approved') btns.push(['to_pay', 'إحالة للصرف', 't'])
  if (r === 'admin_fin' && s === 'to_pay') btns.push(['pay', 'تسجيل الصرف', 'g'])
  if (r === 'ejada' && s === 'paid') btns.push(['honor', 'تسجيل التكريم', 'g'])
  const needsDate = ['pay', 'honor'].some((x) => btns.some((b) => b[0] === x))
  const group = {}; criteria.filter((c) => c.track === nom.track).forEach((c) => { (group[c.group_title] ||= []).push(c) })
  return <Modal title={`${nom.emp_name} — ${T.short}`} onClose={onClose}
    foot={<>{btns.map(([a, l, c, n]) => <button key={a} className={`btn ${c}`} onClick={() => act(a, n)}>{l}</button>)}<button className="btn o" onClick={onClose}>إغلاق</button></>}>
    <div className="small muted">{divName(nom.division_id)} · {periodName(nom.track, nom.period)} {nom.year} · <Pill s={s} /></div>
    {nom.needs_info_reason && s === 'needs_info' && <div className="alert w" style={{ margin: '8px 0' }}>سبب الإعادة: {nom.needs_info_reason}</div>}
    <dl className="trk" style={{ border: 0 }}><dl>
      <dt>المسمى</dt><dd>{nom.job_title || '—'}</dd>
      {nom.track !== 'innovator' && <><dt>المسؤول المباشر</dt><dd>{nom.direct_manager}</dd><dt>المجموع</dt><dd className="num">{nom.total} / 100</dd></>}
      {nom.track === 'initiator' && <><dt>المبادرة</dt><dd>{nom.initiative_title}</dd><dt>المبلغ المقترح</dt><dd className="num">{fmt(nom.amount)} ر.ع</dd></>}
      {nom.track === 'innovator' && <><dt>المركز</dt><dd>{nom.rank}</dd><dt>الفكرة</dt><dd>{nom.idea_title} ({nom.idea_no})</dd><dt>المبلغ</dt><dd className="num">{fmt(nom.amount)} ر.ع</dd></>}
    </dl></dl>
    {nom.justification && <><b>مسوغات الترشيح</b><p style={{ margin: '4px 0 10px' }}>{nom.justification}</p></>}
    {nom.track !== 'innovator' && Object.entries(group).map(([g, cs]) => <div key={g}><b className="small">{g}</b>
      {cs.map((c) => <div className="cr" key={c.id} style={{ gridTemplateColumns: '1fr 60px' }}><span>{c.label}{nom.evidence_notes?.[c.id] ? <div className="muted small">{nom.evidence_notes[c.id]}</div> : null}</span><b className="num">{nom.scores?.[c.id] ?? '—'}</b></div>)}</div>)}
    {files.length > 0 && <><b>الشواهد</b><div className="flt" style={{ margin: '4px 0 10px' }}>{files.map((f) => <button key={f.id} className="btn o s" onClick={() => open(f)}>{f.file_name}</button>)}</div></>}
    {btns.length > 0 && <div className="f" style={{ marginTop: 8 }}>
      <label>ملاحظة / سبب (إلزامي عند الإعادة)</label><textarea value={note} onChange={(e) => setNote(e.target.value)} />
      {needsDate && <><label>التاريخ</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></>}</div>}
    <b className="small">سجل الإجراءات</b>
    <div className="audit">{ev.map((e) => <div key={e.id}>{fdate(e.at)} — {e.actor_name}: {e.action}{e.from_status ? ` (${STN[e.from_status]} ← ${STN[e.to_status]})` : ''}{e.note ? ` — ${e.note}` : ''}</div>)}</div>
  </Modal>
}
