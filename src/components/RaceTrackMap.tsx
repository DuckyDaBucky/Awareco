import { useMemo } from 'react'
import { positionAt, type RaceData, type RaceDriver } from '../lib/race.ts'

export function RaceTrackMap({ data, driver, time }: { data: RaceData; driver: RaceDriver; time: number }) {
  const geometry = useMemo(() => {
    // A rigid presentation rotation keeps the real geometry intact and makes
    // COTA's long back straight readable in a wide race-control display.
    const rotation = -20 * Math.PI / 180
    const rotate = (x: number, y: number) => [x * Math.cos(rotation) - y * Math.sin(rotation), x * Math.sin(rotation) + y * Math.cos(rotation)]
    const points = data.track.outline.map(([x, y]) => rotate(x, y))
    const xs = points.map(p => p[0]), ys = points.map(p => p[1])
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
    const scale = Math.min(860 / (maxX - minX), 260 / (maxY - minY))
    const left = (1000 - (maxX - minX) * scale) / 2
    const top = (360 - (maxY - minY) * scale) / 2
    const project = (rawX: number, rawY: number) => {
      const [x, y] = rotate(rawX, rawY)
      return [left + (x - minX) * scale, top + (maxY - y) * scale]
    }
    const path = data.track.outline.map(([x, y], i) => `${i ? 'L' : 'M'}${project(x, y).map(n => n.toFixed(1)).join(',')}`).join(' ') + ' Z'
    const corners = data.track.corners.map(c => ({ ...c, p: project(c.x, c.y) }))
    const finish = project(...data.track.outline[0])
    const after = project(...data.track.outline[1])
    const reference = data.drivers[0]
    const fastest = reference.laps.reduce((best, lap) => (lap.time ?? Infinity) < (best.time ?? Infinity) ? lap : best)
    const sectors = fastest.s1 && fastest.s2 ? [fastest.start + fastest.s1, fastest.start + fastest.s1 + fastest.s2].flatMap((t, i) => {
      const position = positionAt(reference, t)
      return position?.available ? [{ sector: i + 2, p: project(position.x, position.y) }] : []
    }) : []
    return { project, path, corners, finish, sectors, finishAngle: Math.atan2(after[1] - finish[1], after[0] - finish[0]) * 180 / Math.PI }
  }, [data])
  const position = positionAt(driver, time)
  const teammate = data.drivers.find(d => d.number !== driver.number)
  const otherPosition = teammate ? positionAt(teammate, time) : null
  const p = position ? geometry.project(position.x, position.y) : null
  const other = otherPosition ? geometry.project(otherPosition.x, otherPosition.y) : null
  const ahead = position ? geometry.project(position.x + position.dx, position.y + position.dy) : null
  const angle = p && ahead ? Math.atan2(ahead[1] - p[1], ahead[0] - p[0]) * 180 / Math.PI : 0
  const trail = driver.positions.filter(row => row[0] >= time - 5 && row[0] <= time).map(row => geometry.project(row[1], row[2]).join(',')).join(' ')
  return (
    <div className="race-map-wrap">
      <svg className="race-map" viewBox="0 0 1000 360" role="img" aria-label="Circuit of the Americas with replay car positions">
        <defs>
          <pattern id="race-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#7cc4b6" strokeOpacity=".055" /></pattern>
          <pattern id="race-finish" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#e5eee7"/><path d="M0 0h3v3H0zM3 3h3v3H3z" fill="#182720"/></pattern>
          <filter id="race-glow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="5" /></filter>
        </defs>
        <rect width="1000" height="360" fill="url(#race-grid)" />
        <path d={geometry.path} fill="none" stroke="#11756a" strokeWidth="30" opacity=".09" />
        <path d={geometry.path} fill="none" stroke="#09231e" strokeWidth="19" strokeLinejoin="round" />
        <path d={geometry.path} fill="none" stroke="#5a8e80" strokeWidth="11" strokeLinejoin="round" />
        <path d={geometry.path} fill="none" stroke="#183b31" strokeWidth="7" strokeLinejoin="round" />
        <path d={geometry.path} fill="none" stroke="#97bfb0" strokeWidth=".7" strokeDasharray="3 9" opacity=".45" />
        <polyline points={trail} fill="none" stroke="#d5ed3c" strokeWidth="4" strokeLinecap="round" opacity=".85" />
        <g transform={`translate(${geometry.finish}) rotate(${geometry.finishAngle})`}><rect x="-3" y="-10" width="6" height="20" fill="url(#race-finish)"/></g>
        {geometry.corners.map(c => {
          const important = [1, 6, 11, 12, 20].includes(c.number)
          return <g key={c.number}><text x={c.p[0] + (c.number === 12 ? -24 : 12)} y={c.p[1] + (c.number % 2 ? -14 : 21)} className={important ? 'race-turn major' : 'race-turn'}>{c.number === 1 || c.number === 11 || c.number === 12 ? `T${c.number}` : c.number}</text></g>
        })}
        {geometry.sectors.map(s => <g key={s.sector}><circle cx={s.p[0]} cy={s.p[1]} r="6" fill={s.sector === 3 ? '#60d9c0' : '#d5ed3c'} stroke="#061a14" strokeWidth="3"/><text className="race-sector-text" x={s.p[0] + 16} y={s.p[1] + 30}>S{s.sector}</text></g>)}
        <text className="race-sector-text" x={geometry.finish[0] - 36} y={geometry.finish[1] + 39}>S1 / START</text>
        <g className="race-map-title"><text x="75" y="35">CIRCUIT OF THE AMERICAS</text><text className="race-map-sub" x="75" y="56">AUSTIN, TEXAS · 5.513 KM · 20 TURNS</text></g>
        <text className="race-map-watermark" x="455" y="245">COTA</text>
        {other && otherPosition?.available ? <g transform={`translate(${other})`}><circle r="5" fill="#60b8aa" stroke="#08261c" strokeWidth="2"/><text x="10" y="-10" className="race-car-label secondary">{teammate?.code}</text></g> : null}
        {p ? <g data-testid="selected-car" transform={`translate(${p})`} opacity={position?.available ? 1 : .45}>
          <circle r="13" fill="#b6e434" opacity=".55" filter="url(#race-glow)" />
          <g transform={`rotate(${angle})`}>
            <rect x="-8" y="-6" width="4" height="3" rx="1" fill="#050b08"/><rect x="-8" y="3" width="4" height="3" rx="1" fill="#050b08"/>
            <rect x="4" y="-6" width="3" height="3" rx="1" fill="#050b08"/><rect x="4" y="3" width="3" height="3" rx="1" fill="#050b08"/>
            <path d="M-8-3H1L11 0 1 3H-8Z" fill="#48c6a3" stroke="#dbed65" strokeWidth="1.2"/><rect x="-7" y="-6" width="2" height="12" fill="#d5ed3c"/>
          </g>
          <g transform="translate(17,-26)"><rect x="-5" y="-14" width="69" height="24" rx="4" fill="#d5ed3c"/><text className="race-car-label" y="2">{driver.code} <tspan opacity=".6">{driver.number}</tspan></text></g>
        </g> : null}
      </svg>
      <div className="race-map-legend"><span><i className="selected"/>{driver.code} · selected</span><span><i/>{teammate?.code} · teammate</span><span className="race-position-note">{time >= driver.duration ? 'Finished · final recorded coordinate' : position?.available ? 'Recorded coordinates · interpolated motion' : time < (driver.positions[0]?.[0] ?? 0) ? 'Awaiting first recorded sample' : 'Position gap · holding last coordinate'}</span></div>
    </div>
  )
}
