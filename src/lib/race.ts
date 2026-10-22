/** Recorded race channels and deterministic, explicitly illustrative impact models. */
export interface RaceLap {
  number: number; start: number; end: number; time: number | null; position: number | null
  s1: number | null; s2: number | null; s3: number | null; compound: string
  pitIn: number | null; pitOut: number | null
}
export type PositionSample = [number, number, number, string]
export type CarSample = [number, number | null, number | null, number, number | null, number | null, number | null]
export interface RaceDriver {
  number: string; code: string; name: string; finishPosition: number; duration: number
  laps: RaceLap[]; positions: PositionSample[]; car: CarSample[]
  coverage: { positionSamples: number; carSamples: number; positionGaps: number[][]; carGaps: number[][]; positionRange: number[]; carRange: number[] }
}
export interface RaceData {
  event: string; date: string; circuit: string; circuitLengthKm: number; totalLaps: number
  duration: number; winnerDuration: number; retrievedAt: string; raceStartUtc: string; fastf1Version: string
  track: { rotation: number; outline: [number, number][]; corners: { number: number; x: number; y: number }[]; source: string }
  drivers: RaceDriver[]
}
// DESNZ 2025 full set, 100% mineral petrol, per tonne divided by 1000.
// A transparent reference scenario, NOT the composition or footprint of AMF1 fuel.
export const MODEL = {
  fuelBudgetKg: 100, fuelSensitivity: 0.1,
  tailpipeCO2PerKg: 3.135,
  combustionCO2ePerKg: 3.15408213,
  upstreamCO2ePerKg: 0.81593523,
  lifecycleCO2ePerKg: 3.15408213 + 0.81593523,
  batteryCapacityMJ: 4, initialBatteryMJ: 2,
  maxRecoveryPerLapMJ: 2, maxDeploymentPerLapMJ: 4,
} as const

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
export const advanceClock = (time: number, deltaSeconds: number, speed: number, duration: number) => clamp(time + Math.max(0, deltaSeconds) * speed, 0, duration)

/** Index at/before time; binary search makes scrubbing independent of history. */
export function sampleIndex(rows: readonly (readonly unknown[])[], time: number): number {
  let low = 0, high = rows.length - 1
  while (low <= high) {
    const mid = (low + high) >>> 1
    if ((rows[mid][0] as number) <= time) low = mid + 1
    else high = mid - 1
  }
  return Math.max(0, high)
}
export function lapAt(driver: RaceDriver, time: number) {
  return driver.laps.find(lap => time < lap.end) ?? driver.laps.at(-1)
}

export function positionAt(driver: RaceDriver, time: number) {
  const rows = driver.positions
  if (!rows.length) return null
  const i = sampleIndex(rows, time), a = rows[i], b = rows[Math.min(i + 1, rows.length - 1)]
  const gap = b[0] - a[0]
  const available = time >= a[0] && time <= rows.at(-1)![0] && gap <= 3
  const f = available && gap > 0 ? clamp((time - a[0]) / gap, 0, 1) : 0
  // Heading uses nearby distinct coordinates when the car is stationary.
  let heading = b
  if (b[1] === a[1] && b[2] === a[2]) heading = rows[Math.min(i + 3, rows.length - 1)]
  return { x: a[1] + (b[1] - a[1]) * f, y: a[2] + (b[2] - a[2]) * f,
    dx: heading[1] - a[1], dy: heading[2] - a[2], available, status: a[3] }
}

export function telemetryAt(driver: RaceDriver, time: number) {
  if (!driver.car.length) return null
  const i = sampleIndex(driver.car, time), a = driver.car[i], b = driver.car[Math.min(i + 1, driver.car.length - 1)]
  if (time < a[0] || time > driver.car.at(-1)![0] || b[0] - a[0] > 3) return null
  const f = b[0] > a[0] ? clamp((time - a[0]) / (b[0] - a[0]), 0, 1) : 0
  const speed = a[1] === null ? null : a[1] + ((b[1] ?? a[1]) - a[1]) * f
  const throttle = a[2] === null ? null : clamp(a[2], 0, 100)
  return { speed, throttle, brake: Boolean(a[3]), gear: a[4], rpm: a[5], drs: a[6] }
}

export type ImpactSample = [number, number, number, number, number]
export interface ImpactModel { rows: ImpactSample[]; fallbackIntervals: number }
/** Integrate once, query many times. Distance × load proxy normalized to a
 * declared 100 kg scenario. Gaps use mean race distance/time, never fake telemetry.
 * MGU-K illustration: 60 kW braking recovery, 80 kW high-throttle deployment,
 * 4 MJ store with 2 MJ initially, bounded by 2/4 MJ per lap. No MGU-H modeled.
 */
export function buildImpactModel(driver: RaceDriver, circuitLengthKm: number): ImpactModel {
  const times = [...new Set([0, ...driver.car.map(s => s[0]), ...driver.laps.map(l => l.end), driver.duration])].filter(t => t >= 0 && t <= driver.duration).sort((a, b) => a - b)
  const rows: ImpactSample[] = [[0, 0, 0, 0, MODEL.initialBatteryMJ]]
  let weight = 0, recovered = 0, deployed = 0, battery: number = MODEL.initialBatteryMJ
  let currentLap = 0, lapRecovery = 0, lapDeployment = 0, fallbackIntervals = 0
  for (let i = 1; i < times.length; i++) {
    const t = times[i], dt = t - times[i - 1], mid = (t + times[i - 1]) / 2
    const lap = lapAt(driver, mid)
    if (lap?.number !== currentLap) { currentLap = lap?.number ?? 0; lapRecovery = 0; lapDeployment = 0 }
    const car = telemetryAt(driver, mid)
    if (car?.speed !== null && car?.speed !== undefined && car.throttle !== null) {
      weight += (car.speed / 3.6) * dt * (0.35 + 0.65 * car.throttle / 100)
    } else {
      fallbackIntervals++
      weight += (driver.laps.length * circuitLengthKm * 1000 / driver.duration) * dt * 0.7
    }
    if (car?.brake && (car.speed ?? 0) > 30) {
      const mj = Math.max(0, Math.min(0.06 * dt, MODEL.maxRecoveryPerLapMJ - lapRecovery, MODEL.batteryCapacityMJ - battery))
      recovered += mj; lapRecovery += mj; battery += mj
    } else if ((car?.throttle ?? 0) > 90 && (car?.speed ?? 0) > 80) {
      const mj = Math.max(0, Math.min(0.08 * dt, MODEL.maxDeploymentPerLapMJ - lapDeployment, battery))
      deployed += mj; lapDeployment += mj; battery -= mj
    }
    rows.push([t, weight, recovered, deployed, battery])
  }
  for (const row of rows) row[1] = weight > 0 ? row[1] / weight * MODEL.fuelBudgetKg : row[0] / driver.duration * MODEL.fuelBudgetKg
  return { rows, fallbackIntervals }
}

export function impactAt(model: ImpactModel, time: number) {
  const i = sampleIndex(model.rows, time), a = model.rows[i], b = model.rows[Math.min(i + 1, model.rows.length - 1)]
  const f = b[0] > a[0] ? clamp((time - a[0]) / (b[0] - a[0]), 0, 1) : 0
  const get = (n: number) => a[n] + (b[n] - a[n]) * f
  const fuel = clamp(get(1), 0, MODEL.fuelBudgetKg)
  return { fuel, tailpipe: fuel * MODEL.tailpipeCO2PerKg, lifecycle: fuel * MODEL.lifecycleCO2ePerKg,
    upstream: fuel * MODEL.upstreamCO2ePerKg, recovered: Math.max(0, get(2)), deployed: Math.max(0, get(3)), battery: clamp(get(4), 0, MODEL.batteryCapacityMJ) }
}

export function formatClock(time: number) {
  const t = Math.max(0, Math.floor(time))
  return [Math.floor(t / 3600), Math.floor(t / 60) % 60, t % 60].map(n => String(n).padStart(2, '0')).join(':')
}
export function formatLap(time: number | null | undefined) {
  if (time === null || time === undefined || !Number.isFinite(time)) return '—'
  return `${Math.floor(Math.max(0, time) / 60)}:${(Math.max(0, time) % 60).toFixed(3).padStart(6, '0')}`
}

export function insightAt(driver: RaceDriver, time: number) {
  if (time >= driver.duration) return { title: 'The chequered flag is only one boundary.', text: 'This fuel scenario is complete. Team operations, freight and supply-chain emissions need separate evidence; they cannot be inferred from a race replay.' }
  const car = telemetryAt(driver, time)
  if (!car) return { title: 'Transparency is part of the picture.', text: 'Recorded car telemetry is unavailable at this timestamp. Live speed is withheld; the declared fuel scenario uses a distance-based fallback across the gap.' }
  if (car.brake) return { title: 'Every braking zone holds potential.', text: 'The recorded brake signal is active. A hybrid F1 system can recover kinetic energy under braking. The energy flow below is illustrative; actual MGU-K data is not public.' }
  if ((car.throttle ?? 0) > 90) return { title: 'Performance has an energy cost.', text: 'The recorded throttle signal is above 90%. The fuel model weights distance more heavily under load; the hybrid illustration deploys stored energy when available.' }
  if (Math.floor(time / 20) % 2) return { title: 'Look beyond the exhaust.', text: 'Tailpipe CO₂ covers combustion. The illustrative fuel lifecycle reference adds upstream production and distribution. Sustainable fuel still releases CO₂ when burned.' }
  return { title: 'A race car is part of a much bigger system.', text: 'AMF1’s 2024 ESG report covers direct and indirect emissions, including its supply chain. Annual disclosures provide context, not a measurement of this Austin race.' }
}
