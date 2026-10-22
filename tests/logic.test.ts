import { describe, expect, it } from "vitest"
import { getMetric, handoff, roleForProgramme } from "../src/lib/content.ts"
import { emissionsOutcome, matchPersonas, mentoringOutcome, outreachOutcome, validateHandoff } from "../src/lib/logic.ts"
import { getProgrammeRecord, listProgrammeRecords, programmeReadiness } from "../src/lib/programmes.ts"

describe("handoff contract", () => {
  it("matches the expected counts and references", () => {
    expect(validateHandoff()).toEqual([])
    expect(handoff.metrics).toHaveLength(49)
    expect(handoff.sources).toHaveLength(42)
    expect(handoff.conversations.questions).toHaveLength(99)
    expect(handoff.actions).toHaveLength(100)
    expect(handoff.car.components).toHaveLength(11)
    expect(handoff.people).toHaveLength(12)
    expect(handoff.app.routes).toHaveLength(28)
  })

  it("keeps null distinct from zero", () => {
    expect(getMetric("missing_component_carbon")?.value).toBeNull()
  })
})

describe("scenarios", () => {
  it("reproduces the prepared examples", () => {
    expect(emissionsOutcome(20, 20)).toEqual({ low: 310.2644, mid: 760.2028, high: 1210.1412 })
    expect(emissionsOutcome(0, 0)).toEqual({ low: 0, mid: 0, high: 0 })
    expect(outreachOutcome(20)).toEqual({ low: 293, mid: 301, high: 308 })
    expect(mentoringOutcome(16, 24000)).toBe(1500)
  })
})

describe("matching and partner deep link", () => {
  it("follows the supplied match tests", () => {
    for (const test of handoff.matching.tests) {
      expect(matchPersonas(test.answers).primary).toBe(test.expected_first)
    }
  })

  it("opens Aleto in the charity view", () => {
    expect(roleForProgramme("aleto")).toBe("charity")
    expect(getMetric("footprint_2025")?.value).toBe(87162.4)
  })
})

describe("canonical programme evidence", () => {
  it("provides an enriched record for every programme", () => {
    const records = listProgrammeRecords()
    expect(records).toHaveLength(12)
    expect(records.every((record) => record.editorial.sections.length >= 3)).toBe(true)
    expect(records.filter((record) => record.coverage === "narrative").map((record) => record.person.id)).toEqual([
      "racing-pride",
      "techvets",
      "mechanics",
    ])
  })

  it("keeps missing programme outcomes explicit", () => {
    const racingPride = getProgrammeRecord("racing-pride")!
    expect(racingPride.metrics).toEqual([])
    expect(racingPride.coverage).toBe("narrative")
    expect(programmeReadiness(racingPride).score).toBe(50)
  })

  it("retains Aleto evidence context and report readiness", () => {
    const aleto = getProgrammeRecord("aleto")!
    expect(aleto.metrics.map((metric) => metric.id)).toEqual(["aleto_cohort", "aleto_network", "aleto_leadership"])
    expect(aleto.evidenceState).toBe("verified")
    expect(programmeReadiness(aleto).score).toBe(85)
  })
})
