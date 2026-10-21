import { handoff } from "./content.ts"

export function emissionsOutcome(supplierCoverage: number, hqCoverage: number) {
  const scenario = handoff.simulations.scenarios.find((row) => row.id === "emissions")
  if (!scenario || !("parameters" in scenario)) return { low: 0, mid: 0, high: 0 }
  const parameters = scenario.parameters as {
    supplier_baseline: number
    hq_baseline: number
    supplier_effectiveness: number[]
    hq_effectiveness: number[]
  }
  const supplier = clamp(supplierCoverage, 0, 100) / 100
  const hq = clamp(hqCoverage, 0, 100) / 100
  const values = parameters.supplier_effectiveness.map((factor, index) =>
    round4(
      parameters.supplier_baseline * supplier * factor +
        parameters.hq_baseline * hq * parameters.hq_effectiveness[index],
    ),
  )
  return { low: values[0], mid: values[1], high: values[2] }
}

export function outreachOutcome(fundingChangePercent: number) {
  const scenario = handoff.simulations.scenarios.find((row) => row.id === "stem")
  const parameters = scenario && "parameters" in scenario
    ? (scenario.parameters as { baseline_students: number; response_factors: number[] })
    : { baseline_students: 257, response_factors: [0.7, 0.85, 1] }
  const change = clamp(fundingChangePercent, 0, 100) / 100
  const values = parameters.response_factors.map((factor) =>
    Math.round(parameters.baseline_students * (1 + change * factor)),
  )
  return { low: values[0], mid: values[1], high: values[2] }
}

export function mentoringOutcome(cohortSize: number, budgetGbp: number) {
  const cohort = clamp(cohortSize, 8, 40)
  const budget = clamp(budgetGbp, 10000, 100000)
  if (cohort === 0) return 0
  return budget / cohort
}

export function matchPersonas(answers: Record<string, string | null>) {
  const weights = handoff.matching.weights as Record<string, number>
  const tags = handoff.matching.persona_tags as Record<string, string[]>
  const tie = handoff.matching.tie_order as string[]
  const ranked = tie
    .map((id) => {
      const matched: string[] = []
      let score = 0
      for (const [key, weight] of Object.entries(weights)) {
        const answer = answers[key]
        if (!answer) continue
        if ((tags[id] ?? []).includes(answer)) {
          score += weight
          matched.push(answer)
        }
      }
      return { id, score, matched }
    })
    .sort((a, b) => b.score - a.score || tie.indexOf(a.id) - tie.indexOf(b.id))
  const chosen = ranked.filter((row) => row.score > 0)
  const list = (chosen.length > 0 ? chosen : ranked.filter((row) => row.id === handoff.matching.fallback_id)).slice(
    0,
    handoff.matching.result_count,
  )
  while (list.length < handoff.matching.result_count) {
    const next = ranked.find((row) => !list.some((item) => item.id === row.id))
    if (!next) break
    list.push(next)
  }
  const primary = list[0]
  const reason = handoff.matching.reason_template.replace(
    "{matched_tags}",
    primary?.matched.join(", ") || "the programmes in this demonstration",
  )
  return { primary: primary?.id ?? handoff.matching.fallback_id, alternatives: list.slice(1).map((row) => row.id), reason }
}

export function validateHandoff() {
  const errors: string[] = []
  const expect = {
    metrics: 49,
    sources: 42,
    questions: 99,
    components: 11,
    people: 12,
    actions: 100,
    routes: 24,
  }
  if (handoff.metrics.length !== expect.metrics) errors.push(`metrics ${handoff.metrics.length}`)
  if (handoff.sources.length !== expect.sources) errors.push(`sources ${handoff.sources.length}`)
  if (handoff.conversations.questions.length !== expect.questions) errors.push(`questions ${handoff.conversations.questions.length}`)
  if (handoff.car.components.length !== expect.components) errors.push(`components ${handoff.car.components.length}`)
  if (handoff.people.length !== expect.people) errors.push(`people ${handoff.people.length}`)
  if (handoff.actions.length !== expect.actions) errors.push(`actions ${handoff.actions.length}`)
  if (handoff.app.routes.length !== expect.routes) errors.push(`routes ${handoff.app.routes.length}`)

  const groups: [string, { id: string }[]][] = [
    ["metric", handoff.metrics],
    ["source", handoff.sources],
    ["question", handoff.conversations.questions],
    ["component", handoff.car.components],
    ["persona", handoff.people],
    ["action", handoff.actions],
  ]
  const sets = new Map<string, Set<string>>()
  for (const [name, rows] of groups) {
    const ids = new Set<string>()
    for (const row of rows) {
      if (ids.has(row.id)) errors.push(`duplicate ${name} ${row.id}`)
      ids.add(row.id)
    }
    sets.set(name, ids)
  }
  const has = (group: string, id: string, where: string) => {
    if (!sets.get(group)?.has(id)) errors.push(`${where} missing ${group} ${id}`)
  }
  for (const question of handoff.conversations.questions) {
    for (const id of question.response.source_ids) has("source", id, question.id)
    for (const id of question.response.metric_ids) has("metric", id, question.id)
    for (const id of question.response.action_ids) has("action", id, question.id)
    has("source", question.response.footer_link_source_id, question.id)
  }
  for (const component of handoff.car.components) {
    for (const id of component.question_ids) has("question", id, component.id)
    for (const id of component.metric_ids) has("metric", id, component.id)
    for (const id of component.source_ids) has("source", id, component.id)
    has("metric", component.missing_metric_id, component.id)
    has("action", component.open_action_id, component.id)
    has("action", component.bridge.action_id, component.id)
  }
  for (const persona of handoff.people) {
    for (const id of persona.question_ids) has("question", id, persona.id)
    for (const id of persona.metric_ids) has("metric", id, persona.id)
    for (const id of persona.source_ids) has("source", id, persona.id)
    for (const id of persona.action_ids) has("action", id, persona.id)
    has("source", persona.article.source_id, persona.id)
  }
  for (const action of handoff.actions) {
    if (action.type === "open_source" && action.source_id) has("source", action.source_id, action.id)
  }
  for (const campaign of handoff.campaigns.items) {
    if (!campaign.target.startsWith("/")) errors.push(`campaign target ${campaign.id}`)
  }
  for (const id of Object.keys(handoff.matching.persona_tags)) has("persona", id, "matching")
  for (const step of handoff.demo_script.steps) {
    if (step.question_id) has("question", step.question_id, step.id)
  }
  return errors
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function round4(value: number) {
  return Math.round(value * 10000) / 10000
}
