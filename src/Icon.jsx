// أيقونات خطية هندسية بزوايا مشطوفة، متناسقة مع هوية الوزارة
const P = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10M10 19.5v-5h4v5',
  unit: 'M4 20V8l8-4 8 4v12M4 20h16M9 20v-5h6v5M9 11h.01M15 11h.01',
  form: 'M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7',
  dash: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  review: 'M9 11l2 2 4-4M5 4h14v16H5zM9 17h6',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z',
  coin: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v10M9.5 9.5c0-1 1-1.5 2.5-1.5s2.5.6 2.5 1.6c0 2.2-5 1.1-5 3.3 0 1 1 1.6 2.5 1.6s2.5-.5 2.5-1.5',
  cycle: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h2M14 14h2',
  report: 'M6 3h9l4 4v14H6zM14 3v5h5M9 17v-3M12 17v-6M15 17v-4',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2.2.7a7 7 0 0 0-1.6-.9L14.7 4h-4.4l-.5 2.8a7 7 0 0 0-1.6.9L6 7 4 11l2 1a7 7 0 0 0 0 1.8L4 15l2 4 2.2-.7c.5.4 1 .7 1.6.9l.5 2.8h4.4l.5-2.8c.6-.2 1.1-.5 1.6-.9L18 19l2-4-2-1a7 7 0 0 0 1-2z',
  service: 'M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.3 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18M12 9l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3.5 2',
  send: 'M21 3 3 10.5l7 2.5 2.5 7zM10 13l11-10',
  alert: 'M12 3l10 18H2zM12 10v5M12 18v.01',
  trophy: 'M8 4h8v6a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 14v4M8 21h8M10 18h4',
  out: 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9',
  menu: 'M4 7h16M4 12h16M4 17h16',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14c2.2.6 3.5 2.4 3.5 5',
  upload: 'M12 16V4M7 9l5-5 5 5M4 16v4h16v-4',
  download: 'M12 4v12M7 11l5 5 5-5M4 20h16',
  arrow: 'M19 12H5M11 6l-6 6 6 6',
  plus: 'M12 5v14M5 12h14',
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  shield: 'M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z',
  cert: 'M5 4h14v12H5zM9 20l3-2 3 2v-4M8 8h8M8 11h5',
}
export default function Icon({ n, size = 20, stroke = 1.7, className = '', style }) {
  return <svg className={`ic ${className}`} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n] || P.spark} /></svg>
}
export const TRACK_ICON = { service: 'service', innovator: 'bulb', initiator: 'spark' }
