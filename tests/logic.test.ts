import { describe, expect, it } from "vitest"
import { getMetric, handoff, roleForProgramme } from "../src/lib/content.ts"
import { emissionsOutcome, matchPersonas, mentoringOutcome, outreachOutcome, validateHandoff } from "../src/lib/logic.ts"

describe("handoff contract", () => {
  it("matches the expected counts and references", () => {
    expect(validateHandoff()).toEqual([])
    expect(handoff.metrics).toHaveLength(49)
    expect(handoff.sources).toHaveLength(42)
    expect(handoff.conversations.questions).toHaveLength(99)
    expect(handoff.actions).toHaveLength(100)
    expect(handoff.car.components).toHaveLength(11)
    expect(handoff.people).toHaveLength(12)
    expect(handoff.app.routes).toHaveLength(24)
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
