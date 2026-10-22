import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { advanceClock, buildImpactModel, formatClock, formatLap, impactAt, lapAt, MODEL, positionAt, telemetryAt, type RaceData } from '../src/lib/race.ts'

const data = JSON.parse(readFileSync(new URL('../public/data/2025-austin.json', import.meta.url), 'utf8')) as RaceData
const references = JSON.parse(readFileSync(new URL('../public/data/emissions-reference.json', import.meta.url), 'utf8'))

describe('cached historical race', () => {
  it('preserves the official AMF1 classification and both 56-lap races', () => {
    expect(data.drivers.map(d => [d.number, d.finishPosition, d.duration, d.laps.length])).toEqual([['14', 10, 5710.162, 56], ['18', 12, 5714.939, 56]])
    expect(data.winnerDuration).toBe(5640.161)
    expect(data.track.corners).toHaveLength(20)
    for (const d of data.drivers) {
      expect(d.positions.length).toBeGreaterThan(10000)
      expect(d.car.length).toBeGreaterThan(10000)
      expect(d.laps.at(-1)?.end).toBeCloseTo(d.duration, 2)
      expect(d.laps[53].time).toBe(d.number === '14' ? 98.789 : 99.071)
      for (let i = 1; i < d.positions.length; i++) expect(d.positions[i][0]).toBeGreaterThan(d.positions[i - 1][0])
    }
  })
  it('interpolates coordinates without inventing lap timing or live race order', () => {
    const d = data.drivers[0], a = d.positions[100], b = d.positions[101]
    const p = positionAt(d, (a[0] + b[0]) / 2)!
    expect(p.x).toBeCloseTo((a[1] + b[1]) / 2)
    expect(p.y).toBeCloseTo((a[2] + b[2]) / 2)
    expect(p.available).toBe(true)
    const lap = d.laps[20]
    expect(lapAt(d, lap.start + 1)?.number).toBe(21)
    expect(lapAt(d, lap.end)?.number).toBe(22)
  })
  it('holds position and withholds car channels across missing coverage', () => {
    const d = { ...data.drivers[0], positions: [[0, 10, 20, 'Recorded'], [10, 100, 200, 'Recorded']] as RaceData['drivers'][number]['positions'], car: [[0, 150, 100, 0, 5, 10000, 0], [10, 200, 100, 0, 6, 11000, 0]] as RaceData['drivers'][number]['car'] }
    expect(positionAt(d, 5)).toMatchObject({ x: 10, y: 20, available: false })
    expect(telemetryAt(d, 5)).toBeNull()
    expect(positionAt({ ...d, positions: [] }, 5)).toBeNull()
    expect(telemetryAt({ ...d, car: [] }, 5)).toBeNull()
  })
})

describe('one replay clock', () => {
  it('advances all supported speeds and clamps at the finish', () => {
    for (const speed of [1, 5, 20, 60]) expect(advanceClock(100, .5, speed, data.duration)).toBe(100 + .5 * speed)
    expect(advanceClock(100, 0, 60, data.duration)).toBe(100)
    expect(advanceClock(100, -1, 60, data.duration)).toBe(100)
    expect(advanceClock(5710, 1, 60, data.duration)).toBe(data.duration)
    expect(formatClock(5714.939)).toBe('01:35:14')
    expect(formatLap(null)).toBe('—')
    expect(formatLap(98.789)).toBe('1:38.789')
  })
})

describe('transparent impact model', () => {
  it('uses the published reference factors with the correct tonne-to-kg units', () => {
    expect(MODEL.tailpipeCO2PerKg).toBe(references.fuelsSheetRow99.kgCO2PerTonne / 1000)
    expect(MODEL.combustionCO2ePerKg).toBeCloseTo(references.fuelsSheetRow99.kgCO2ePerTonne / 1000, 10)
    expect(MODEL.upstreamCO2ePerKg).toBeCloseTo(references.wttFuelsSheetRow98.kgCO2ePerTonne / 1000, 10)
    expect(MODEL.lifecycleCO2ePerKg).toBeCloseTo(3.97001736, 8)
  })
  for (const d of data.drivers) {
    it(`${d.code}: conserves energy and respects cumulative fuel and battery limits`, () => {
      const model = buildImpactModel(d, data.circuitLengthKm)
      expect(impactAt(model, 0).fuel).toBe(0)
      expect(impactAt(model, d.duration).fuel).toBeCloseTo(100, 8)
      expect(impactAt(model, -500).fuel).toBe(0)
      expect(impactAt(model, data.duration + 1000).fuel).toBeCloseTo(100, 8)
      for (let i = 1; i < model.rows.length; i++) {
        const r = model.rows[i], prev = model.rows[i - 1]
        expect(r[1]).toBeGreaterThanOrEqual(prev[1])
        expect(r[2]).toBeGreaterThanOrEqual(prev[2])
        expect(r[3]).toBeGreaterThanOrEqual(prev[3])
        expect(r[4]).toBeGreaterThanOrEqual(-1e-9)
        expect(r[4]).toBeLessThanOrEqual(4 + 1e-9)
        expect(r[4]).toBeCloseTo(2 + r[2] - r[3], 8)
      }
      for (const lap of d.laps) {
        const start = impactAt(model, lap.start), end = impactAt(model, lap.end)
        expect(end.recovered - start.recovered).toBeLessThanOrEqual(2 + 1e-8)
        expect(end.deployed - start.deployed).toBeLessThanOrEqual(4 + 1e-8)
      }
    })
    it(`${d.code}: backward seeking and replaying are deterministic`, () => {
      const model = buildImpactModel(d, data.circuitLengthKm)
      const first = impactAt(model, 1500.25)
      expect(impactAt(model, 4500).fuel).toBeGreaterThan(first.fuel)
      expect(impactAt(model, 1500.25)).toEqual(first)
      expect(impactAt(buildImpactModel(d, data.circuitLengthKm), 1500.25)).toEqual(first)
      expect(first.lifecycle).toBeCloseTo(first.fuel * MODEL.lifecycleCO2ePerKg, 8)
      expect(first.lifecycle).toBeGreaterThan(first.tailpipe + first.upstream)
    })
  }
  it('handles a car with no recorded channels using only labeled fuel fallback', () => {
    const d = { ...data.drivers[0], car: [], positions: [] }
    const model = buildImpactModel(d, data.circuitLengthKm)
    expect(impactAt(model, d.duration).fuel).toBeCloseTo(100, 8)
    expect(impactAt(model, d.duration).recovered).toBe(0)
    expect(impactAt(model, d.duration).deployed).toBe(0)
  })
})
