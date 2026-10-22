import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RaceTrackMap } from '../components/RaceTrackMap.tsx'
import { RaceDataAttribution, SOURCES } from '../components/RaceDataAttribution.tsx'
import { advanceClock, buildImpactModel, clamp, formatClock, formatLap, impactAt, insightAt, lapAt, MODEL, telemetryAt, type RaceData, type ImpactModel } from '../lib/race.ts'
import './race-weekend.css'

function useRaceClock(duration: number) {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(20)
  const clock = useRef(0)
  useEffect(() => {
    if (!playing) return
    let frame = 0, previous = performance.now()
    const tick = (now: number) => {
      clock.current = advanceClock(clock.current, (now - previous) / 1000, speed, duration)
      previous = now
      setTime(clock.current)
      if (clock.current >= duration) { setPlaying(false); return }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, speed, duration])
  const seek = (value: number) => { clock.current = clamp(value, 0, duration); setTime(clock.current) }
  const restart = () => { setPlaying(false); seek(0) }
  const toggle = () => { if (clock.current >= duration) seek(0); setPlaying(v => !v) }
  return { time, playing, speed, setSpeed, seek, restart, toggle }
}

export function RaceWeekendPage() {
  const [data, setData] = useState<RaceData | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const abort = new AbortController()
    setError('')
    fetch('/data/2025-austin.json', { signal: abort.signal }).then(response => {
      if (!response.ok) throw new Error('The local race dataset could not be loaded.')
      return response.json()
    }).then((value: RaceData) => {
      if (!value.drivers?.length || !value.track?.outline?.length || !value.duration) throw new Error('The cached dataset is incomplete.')
      setData(value)
    }).catch((e: Error) => { if (e.name !== 'AbortError') setError(e.message) })
    return () => abort.abort()
  }, [attempt])
  if (!data) return <section className="race-page race-loading"><p className="race-eyebrow">MAKE A MARK LIVE / RACE CONTROL</p><h1>United States Grand Prix</h1><p role="status">{error || 'Loading the locally cached historical replay…'}</p>{error ? <button className="btn" onClick={() => setAttempt(n => n + 1)}>Retry loading race data</button> : null}<Link to="/">Back to home</Link></section>
  return <RaceDashboard data={data} />
}

function RaceDashboard({ data }: { data: RaceData }) {
  const replay = useRaceClock(data.duration)
  const [driverIndex, setDriverIndex] = useState(0)
  const driver = data.drivers[driverIndex]
  const models = useMemo(() => data.drivers.map(d => buildImpactModel(d, data.circuitLengthKm)), [data])
  const model = models[driverIndex]
  const impact = impactAt(model, replay.time)
  const car = telemetryAt(driver, replay.time)
  const lap = lapAt(driver, replay.time)
  const finished = replay.time >= driver.duration
  const previousLap = driver.laps.filter(l => l.end <= replay.time).at(-1)
  const currentLapSeconds = lap ? clamp(replay.time - Math.max(0, lap.start), 0, lap.end - Math.max(0, lap.start)) : 0
  const sector = lap?.s1 ? currentLapSeconds < lap.s1 ? 1 : lap.s2 && currentLapSeconds < lap.s1 + lap.s2 ? 2 : 3 : null
  const progress = replay.time / data.duration * 100
  const insight = insightAt(driver, replay.time)
  const state = finished ? 'FINISHED' : !car ? 'SIGNAL GAP' : car.brake ? 'BRAKING' : (car.throttle ?? 0) > 90 ? 'HIGH THROTTLE' : 'PART THROTTLE'
  const recoveryActive = Boolean(car?.brake && (car.speed ?? 0) > 30 && !finished)
  const deployActive = Boolean(!car?.brake && (car?.throttle ?? 0) > 90 && impact.battery > .01 && !finished)
  return <div className="race-page" data-playing={replay.playing} data-testid="race-dashboard" data-time={replay.time.toFixed(3)}>
    <div className="race-topline"><Link to="/">← &nbsp; MAKE A MARK LIVE</Link><span>COGNIZANT <b>×</b> ASTON MARTIN ARAMCO</span><span className="race-offline"><i/> CACHED DATA / OFFLINE READY</span></div>
    <header className="race-heading"><div><p className="race-eyebrow">2025 UNITED STATES GRAND PRIX — HISTORICAL REPLAY</p><h1>Performance. <em>With perspective.</em></h1><p className="race-subtitle">Circuit of the Americas <span> / </span> Austin, Texas <span> / </span> 19 October 2025</p></div><div className="race-session-state"><i className={replay.playing ? 'on' : ''}/>{replay.time >= data.duration ? 'REPLAY COMPLETE' : replay.playing ? 'REPLAY RUNNING' : 'REPLAY PAUSED'}<small>HISTORICAL DATA · MODELED IMPACT</small></div></header>
    <div className="race-timing-strip">
      <div className="race-driver-select" role="group" aria-label="Select Aston Martin driver">{data.drivers.map((d, i) => <button key={d.code} aria-pressed={i === driverIndex} onClick={() => setDriverIndex(i)}><span className="race-driver-number">{d.number}</span><span><b>{d.name.split(' ').at(-1)?.toUpperCase()}</b><small>{i === driverIndex ? 'SELECTED DRIVER' : 'SWITCH DRIVER'}</small></span></button>)}</div>
      <div className="race-timing-item"><span>LAP</span><strong data-testid="lap-counter">{String(lap?.number ?? 1).padStart(2, '0')} <small>/ {data.totalLaps}</small></strong></div>
      <div className="race-timing-item"><span>ELAPSED RACE TIME</span><strong data-testid="race-time">{formatClock(replay.time)}</strong></div>
      <div className="race-timing-item"><span>RECORDED SPEED</span><strong>{finished ? '—' : car?.speed === null || !car ? '—' : Math.round(car.speed)} <small>KM/H</small></strong></div>
      <div className="race-timing-item race-position-timing"><span>LAP-END POSITION</span><strong>{previousLap?.position ? `P${previousLap.position}` : '—'} <small>{finished ? 'FINAL' : 'LAST CROSSING'}</small></strong></div>
    </div>
    <div className="race-main-grid">
      <section className="race-track-panel race-panel"><div className="race-panel-heading"><div><span className="race-section-number">01</span><h2>On the circuit</h2></div><span className="race-badge historical">HISTORICAL TELEMETRY</span></div>
        <RaceTrackMap data={data} driver={driver} time={Math.min(replay.time, driver.duration)} />
        <div className="race-track-telemetry"><div><span>CURRENT LAP TIMER</span><strong>{formatLap(currentLapSeconds)}</strong></div><div><span>PREVIOUS LAP</span><strong>{formatLap(previousLap?.time)}</strong></div><div><span>SECTOR <small>FROM TIMING</small></span><strong>{finished ? 'FINISHED' : sector ? `0${sector} / 03` : '—'}</strong></div><div><span>TYRE COMPOUND</span><strong><i className={`race-tyre ${lap?.compound.toLowerCase()}`}/>{lap?.compound ?? '—'}</strong></div></div>
      </section>
      <aside className="race-impact-panel race-panel"><div className="race-panel-heading"><div><span className="race-section-number">02</span><h2>The impact lens</h2></div><span className="race-badge modeled">ESTIMATED</span></div>
        <div className="race-fuel-metric"><span className="race-metric-label">ESTIMATED FUEL CONSUMED</span><div className="race-big-value"><strong data-testid="fuel-value">{impact.fuel.toFixed(1)}</strong><span>kg</span><svg width="42" height="42" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M12 6h13v28H9V10a4 4 0 014-4zm0 5h9v9h-9m13-5h4l4 6v8a3 3 0 006 0V16l-6-6M6 34h22" stroke="currentColor" strokeWidth="1.5"/></svg></div><div className="race-budget-bar"><span style={{ width: `${impact.fuel}%` }}/></div><p>{impact.fuel.toFixed(1)} / {MODEL.fuelBudgetKg} kg <span>declared race scenario</span></p></div>
        <div className="race-carbon-metric"><span className="race-metric-label">ESTIMATED FUEL LIFECYCLE CO₂e</span><div className="race-big-value"><strong data-testid="carbon-value">{impact.lifecycle.toFixed(1)}</strong><span>kg CO₂e</span><span className="race-metric-icon">↗</span></div><p className="race-reference-note">Illustrative mineral-petrol reference · not AMF1 fuel data</p><div className="race-emission-parts"><div><i/><span>Tailpipe CO₂</span><b>{impact.tailpipe.toFixed(1)} <small>kg</small></b></div><div><i/><span>Upstream CO₂e</span><b>{impact.upstream.toFixed(1)} <small>kg</small></b></div><div><i/><span>Other combustion GHG</span><b>{(impact.fuel * (MODEL.combustionCO2ePerKg - MODEL.tailpipeCO2PerKg)).toFixed(1)} <small>kg CO₂e</small></b></div></div><ImpactChart model={model} time={replay.time} duration={data.duration}/><p className="race-uncertainty">Fuel-budget sensitivity ±10% · {Math.max(0, impact.lifecycle * .9).toFixed(0)}–{(impact.lifecycle * 1.1).toFixed(0)} kg CO₂e<br/>Scenario range, not a confidence interval.</p></div>
      </aside>
    </div>
    <section className="race-controls race-panel" aria-label="Race replay controls">
      <div className="race-timeline-label"><span>RACE TIMELINE <b>{progress.toFixed(1)}%</b></span><span>{formatClock(replay.time)} <i>/</i> {formatClock(data.duration)}</span></div>
      <input className="race-scrubber" type="range" min="0" max={data.duration} step="0.1" value={replay.time} onChange={e => replay.seek(Number(e.target.value))} aria-label="Race timeline" aria-valuetext={`${formatClock(replay.time)}, lap ${lap?.number}`} style={{ '--race-progress': `${progress}%` } as React.CSSProperties}/>
      <div className="race-timeline-ticks"><span>START</span><span>25%</span><span>50%</span><span>75%</span><span>CHEQUERED FLAG</span></div>
      <div className="race-control-row"><button className="race-play" onClick={replay.toggle} aria-label={replay.playing ? 'Pause replay' : 'Play replay'}><span aria-hidden="true">{replay.playing ? 'Ⅱ' : '▶'}</span>{replay.playing ? 'Pause replay' : replay.time >= data.duration ? 'Play again' : 'Play replay'}</button><button className="race-restart" onClick={replay.restart}><span aria-hidden="true">↺</span> Restart</button><div className="race-speed-control" role="group" aria-label="Playback speed"><span>PLAYBACK</span>{[1, 5, 20, 60].map(speed => <button key={speed} aria-pressed={replay.speed === speed} onClick={() => replay.setSpeed(speed)}>{speed}×</button>)}</div><p>One clock. Every signal in sync. <span>Drag the timeline to explore.</span></p></div>
    </section>
    <div className="race-bottom-grid">
      <section className="race-hybrid race-panel"><div className="race-panel-heading"><div><span className="race-section-number">03</span><h2>Hybrid energy system</h2></div><span className="race-badge illustrative">ILLUSTRATIVE</span></div><div className="race-hybrid-state"><span className={car?.brake ? 'braking' : ''}><i/>{state}</span><span>THROTTLE <b>{car?.throttle ?? '—'}{car?.throttle === null || !car ? '' : '%'}</b> &nbsp; GEAR <b>{car?.gear ?? '—'}</b></span></div>
        <svg className="race-energy-flow" viewBox="0 0 500 90" role="img" aria-label="Illustrative braking recovery, battery store and electrical deployment"><path d="M94 45H204M296 45H406" stroke="#29483e" strokeWidth="2"/><path d="M94 45H204" stroke={recoveryActive ? '#69dac0' : '#29483e'} strokeWidth="3" strokeDasharray="5 10" strokeDashoffset={recoveryActive ? -replay.time * 35 : 0}/><path d="M296 45H406" stroke={deployActive ? '#d5ed3c' : '#29483e'} strokeWidth="3" strokeDasharray="5 10" strokeDashoffset={deployActive ? -replay.time * 35 : 0}/><circle cx="65" cy="45" r="23" stroke="#69dac0" fill="#102f28"/><text x="65" y="52" textAnchor="middle" fill="#69dac0" fontSize="24">↳</text><rect x="211" y="19" width="78" height="52" rx="8" fill="#102820" stroke="#6b8c70"/><rect x="218" y="26" width={64 * impact.battery / MODEL.batteryCapacityMJ} height="38" rx="3" fill="#d5ed3c" opacity=".6"/><text x="250" y="51" textAnchor="middle" fill="#f1f8dc" fontSize="16">{impact.battery.toFixed(2)} MJ</text><circle cx="435" cy="45" r="23" stroke="#d5ed3c" fill="#243019"/><text x="435" y="53" textAnchor="middle" fill="#d5ed3c" fontSize="24">ϟ</text></svg>
        <div className="race-energy-values"><div><strong>{impact.recovered.toFixed(2)} <small>MJ</small></strong><span>EST. RECOVERED</span></div><div><strong>{Math.round(impact.battery / 4 * 100)}<small>%</small></strong><span>ILLUSTRATIVE STORE</span></div><div><strong>{impact.deployed.toFixed(2)} <small>MJ</small></strong><span>EST. DEPLOYED</span></div></div><p className="race-small-note">Inferred from brake & throttle signals. Actual MGU-K energy and battery state are unavailable.</p>
      </section>
      <section className="race-insight race-panel"><div className="race-panel-heading"><div><span className="race-insight-symbol">✧</span><h2>AI Impact Insight</h2></div><span className="race-badge">RULE-BASED</span></div><p className="race-insight-kicker">UNDERSTAND WHAT YOU’RE SEEING</p><h3>{insight.title}</h3><p data-testid="impact-insight">{insight.text}</p><div className="race-insight-source"><i/> Grounded in recorded signals & documented sources</div></section>
      <section className="race-footprint race-panel"><div className="race-panel-heading"><div><span className="race-section-number">04</span><h2>The wider footprint</h2></div></div><div className="race-breakdown"><div><span><i/>Selected car · fuel lifecycle</span><b>{impact.lifecycle.toFixed(1)} kg <small>est.</small></b></div>{['Race-weekend operations', 'Logistics & freight', 'Wider team & supply chain'].map(label => <div key={label}><span><i/>{label}</span><small>Data not available</small></div>)}</div><p className="race-small-note">These categories need separate race-specific evidence.</p><a href={SOURCES.esg} target="_blank" rel="noreferrer" className="race-esg-link">2024 ESG DISCLOSURE <span>↗</span><small>Annual team context: Scope 1, 2 & 3. No allocation to this race.</small></a></section>
    </div>
    <div className="race-trust-legend"><span><i/> Historical telemetry</span><span><i/> Estimated fuel & carbon</span><span><i/> Illustrative hybrid energy</span><p>Independent ideathon prototype · Environmental estimates are not official AMF1 race disclosures.</p></div>
    <RaceDataAttribution data={data} models={models}/>
  </div>
}

function ImpactChart({ model, time, duration }: { model: ImpactModel; time: number; duration: number }) {
  const path = useMemo(() => {
    const step = Math.max(1, Math.floor(model.rows.length / 100))
    return model.rows.filter((_, i) => i % step === 0 || i === model.rows.length - 1).map((r, i) => `${i ? 'L' : 'M'}${(r[0] / duration * 320).toFixed(1)},${(57 - r[1] / 100 * 50).toFixed(1)}`).join(' ')
  }, [model, duration])
  const x = clamp(time / duration, 0, 1) * 320
  return <svg className="race-impact-chart" viewBox="0 0 320 65" role="img" aria-label="Cumulative modeled emissions over the race"><defs><clipPath id="race-chart-clip"><rect width={x} height="65"/></clipPath><linearGradient id="race-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#bdd546" stopOpacity=".24"/><stop offset="1" stopColor="#bdd546" stopOpacity="0"/></linearGradient></defs><path d="M0 57H320M0 30H320M0 5H320" stroke="#a5bd9b" strokeOpacity=".09"/><path d={path} stroke="#354b38" fill="none" strokeWidth="1.5"/><g clipPath="url(#race-chart-clip)"><path d={`${path} L320,65 L0,65Z`} fill="url(#race-chart-fill)"/><path d={path} stroke="#d5ed3c" fill="none" strokeWidth="2"/></g><path d={`M${x} 0V65`} stroke="#d5ed3c" opacity=".55" strokeDasharray="2 3"/></svg>
}
