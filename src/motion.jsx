import { useEffect, useRef, useState } from 'react'
const reduce = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

// عدّاد تصاعدي للأرقام
export function CountUp({ value, ms = 900 }) {
  const raw = String(value ?? '')
  const num = parseFloat(raw.replace(/,/g, ''))
  const ok = Number.isFinite(num)
  const dec = (raw.split('.')[1] || '').length
  const [v, setV] = useState(ok && !reduce() ? 0 : num)
  useEffect(() => {
    if (!ok || reduce()) { setV(num); return }
    let raf, t0
    const step = (t) => { t0 ??= t; const p = Math.min(1, (t - t0) / ms); setV(num * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step) }
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf)
  }, [num, ms, ok])
  if (!ok) return <>{raw}</>
  return <>{v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })}</>
}

// يظهر العنصر عند دخوله الشاشة
export function useInView() {
  const ref = useRef(null); const [on, setOn] = useState(false)
  useEffect(() => {
    if (reduce() || !('IntersectionObserver' in window)) { setOn(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.15 })
    ref.current && io.observe(ref.current); return () => io.disconnect()
  }, [])
  return [ref, on]
}
