import { useState, useMemo } from 'react'
import { sb } from '../supabase'
import { useApp, Sec, TRACKS, ROLE_META } from '../lib'
import Icon, { TRACK_ICON } from '../Icon'

export default function Criteria() {
  const { me, criteria, reload, say, ys } = useApp()
  const tracks = me.role === 'dev' ? ['service'] : me.role === 'admin_fin' ? ['initiator'] : ['service', 'initiator']
  const [track, setTrack] = useState(tracks[0])
  const T = TRACKS[track]; const rows = useMemo(() => criteria.filter((c) => c.track === track), [criteria, track])
  const groups = useMemo(() => { const m = new Map(); rows.forEach((c) => { if (!m.has(c.group_ord)) m.set(c.group_ord, { ord: c.group_ord, title: c.group_title, items: [] }); m.get(c.group_ord).items.push(c) }); return [...m.values()].sort((a, b) => a.ord - b.ord) }, [rows])
  const total = rows.filter((c) => c.active).reduce((s, c) => s + c.max_score, 0)
  const locked = ys?.closed
  const run = async (p, ok) => { const { error } = await p; if (error) say(error.message); else { if (ok) say(ok); await reload() } }
  const upd = (id, patch, ok) => run(sb.from('criteria').update(patch).eq('id', id), ok)
  const setWeight = (c, v) => { const w = Math.round(Number(v)); if (!Number.isFinite(w) || w < 1 || w > 100) return say('الوزن بين 1 و100'); if (w !== c.max_score) upd(c.id, { max_score: w }, 'حُفظ الوزن') }
  const setGroupTitle = (g, v) => { const t = v.trim(); if (t && t !== g.title) run(sb.from('criteria').update({ group_title: t }).eq('track', track).eq('group_ord', g.ord), 'حُفظ عنوان المحور') }
  const move = async (g, c, dir) => { const items = g.items.filter((x) => true); const i = items.findIndex((x) => x.id === c.id); const o = items[i + dir]; if (!o) return
    await sb.from('criteria').update({ ord: o.ord }).eq('id', c.id); await sb.from('criteria').update({ ord: c.ord }).eq('id', o.id); reload() }
  const addItem = (g) => { const mx = Math.max(0, ...rows.map((x) => x.ord)); run(sb.from('criteria').insert({ track, group_title: g.title, group_ord: g.ord, ord: mx + 1, label: 'معيار جديد', max_score: 5, active: true }), 'أُضيف معيار') }
  const addGroup = () => { const mx = Math.max(0, ...rows.map((x) => x.ord)); const go = Math.max(0, ...rows.map((x) => x.group_ord)) + 1; run(sb.from('criteria').insert({ track, group_title: 'محور جديد', group_ord: go, ord: mx + 1, label: 'معيار جديد', max_score: 5, active: true }), 'أُضيف محور') }
  const ok100 = total === 100
  return <>
    <div className="card rolebar" style={{ '--c': T.c }}><Icon n={TRACK_ICON[track]} size={24} /><div><b>معايير تقييم مسار {T.name}</b><div className="muted small">تُدار من {track === 'service' ? 'جهة اعتماد خدمة المستفيدين (المديرية العامة للتطوير والدراسات)' : 'جهة اعتماد المبادر (المديرية العامة للشؤون الإدارية والمالية)'}. تسري التعديلات على الاستمارات الجديدة.</div></div></div>
    {tracks.length > 1 && <div className="tabs" style={{ marginTop: 12 }}>{tracks.map((t) => <button key={t} className={`btn s ${t === track ? '' : 'o'}`} onClick={() => setTrack(t)}>{TRACKS[t].short}</button>)}</div>}
    <div className={`alert ${ok100 ? 'ok' : 'w'}`} style={{ margin: '12px 0' }}><Icon n={ok100 ? 'check' : 'alert'} size={18} />مجموع أوزان المعايير الفعّالة: <b className="num">{total}</b> {ok100 ? '— التقييم من 100.' : '— يُفضّل أن يكون المجموع 100 ليكون التقييم من 100.'}</div>
    {groups.map((g, gi) => { const gsum = g.items.filter((c) => c.active).reduce((s, c) => s + c.max_score, 0)
      return <div className="card fcard" key={g.ord} style={{ '--gc': ['#006452', '#0f446c', '#aa7f67', '#00827a'][gi % 4], marginBottom: 14 }}>
        <div className="fhead"><span className="gi"><Icon n="review" size={20} /></span><input className="gtitle" defaultValue={g.title} key={g.title} disabled={locked} onBlur={(e) => setGroupTitle(g, e.target.value)} /><span className="gs num" dir="ltr">{gsum}</span></div>
        {g.items.map((c, i) => <div className={`crit-row ${c.active ? '' : 'off'}`} key={c.id}>
          <div className="crt-ord"><button className="mv" disabled={locked || i === 0} onClick={() => move(g, c, -1)} aria-label="أعلى">▲</button><button className="mv" disabled={locked || i === g.items.length - 1} onClick={() => move(g, c, 1)} aria-label="أسفل">▼</button></div>
          <input className="crit-lb" defaultValue={c.label} key={c.label} disabled={locked} onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== c.label) upd(c.id, { label: v }, 'حُفظ السؤال') }} />
          <label className="crit-w">الوزن<input type="number" min="1" max="100" defaultValue={c.max_score} key={c.max_score} disabled={locked} onBlur={(e) => setWeight(c, e.target.value)} /></label>
          <button className={`btn s ${c.active ? 'o' : 't'}`} disabled={locked} onClick={() => upd(c.id, { active: !c.active }, c.active ? 'عُطّل المعيار' : 'فُعّل المعيار')}>{c.active ? 'تعطيل' : 'تفعيل'}</button></div>)}
        <div style={{ padding: '10px 18px' }}><button className="btn s o" disabled={locked} onClick={() => addItem(g)}><Icon n="plus" size={14} />إضافة معيار لهذا المحور</button></div></div> })}
    <button className="btn t" disabled={locked} onClick={addGroup}><Icon n="plus" size={16} />إضافة محور جديد</button>
    <div className="muted small" style={{ marginTop: 10 }}>التعطيل يخفي المعيار من الاستمارات الجديدة دون حذف الدرجات المسجلة سابقاً.</div>
  </>
}
