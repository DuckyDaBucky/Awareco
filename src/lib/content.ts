import handoffJson from "../../content/handoff/make-a-mark-live.json"

export type Metric = {
  id: string
  label: string
  value: number | null
  unit: string
  period: string
  kind: string
  scope: string
  source_ids: string[]
  cadence: string
  note: string
  display_precision: number
}

export type Source = {
  id: string
  title: string
  kind: string
  review_status: string
  publisher?: string
  year?: number
  page?: number
  url?: string
  local_href?: string
  document?: string
}

export type Question = {
  id: string
  surface: string
  question: string
  response: {
    paragraphs: string[]
    source_ids: string[]
    metric_ids: string[]
    action_ids: string[]
    footer_link_source_id: string
    links: { label: string; source_id: string; href: string; local_href: string | null; target: string }[]
  }
  followup_ids: string[]
  presentation: { pending_ms: number; reveal_ms: number; allow_skip: boolean; streaming: boolean }
}

export type Action = {
  id: string
  type: string
  path?: string
  source_id?: string
  title?: string
  body?: string
  confirmation?: string
  message?: string
}

export type Hotspot = { id: string; x: number; y: number; visual_size_px: number; hit_size_px: number }

export type ComponentRecord = {
  id: string
  label: string
  description: string
  sustainability_connection: string
  source_ids: string[]
  question_ids: string[]
  metric_ids: string[]
  hotspots: Hotspot[]
  animation: string
  missing_metric_id: string
  variants: {
    id: string
    model: string
    description: string
    sustainability_connection?: string
    metric_ids: string[]
    source_ids: string[]
    visual_state: string
  }[]
  bridge: { label: string; action_id: string; relationship: string }
  animation_controls: { states?: string[]; reduced_motion_fallback: string }
}

export type Persona = {
  id: string
  name: string
  role: string
  programme_name: string
  partner_name: string
  pillar: string
  is_composite: boolean
  approval_status: string
  intro: string
  question_ids: string[]
  metric_ids: string[]
  source_ids: string[]
  tags: string[]
  article: { title: string; paragraphs: string[]; source_id: string; type: string }
  action_ids: string[]
}

type Handoff = typeof handoffJson

export const handoff = handoffJson as Handoff

const metrics = new Map(handoff.metrics.map((row) => [row.id, row as Metric]))
const sources = new Map(handoff.sources.map((row) => [row.id, row as Source]))
const questions = new Map(handoff.conversations.questions.map((row) => [row.id, row as Question]))
const actions = new Map(handoff.actions.map((row) => [row.id, row as Action]))
const components = new Map(handoff.car.components.map((row) => [row.id, row as unknown as ComponentRecord]))
const personas = new Map(handoff.people.map((row) => [row.id, row as unknown as Persona]))
const scenarios = new Map(handoff.simulations.scenarios.map((row) => [row.id, row]))
const campaigns = new Map(handoff.campaigns.items.map((row) => [row.id, row]))

export function getMetric(id: string) {
  return metrics.get(id)
}

export function getSource(id: string) {
  return sources.get(id)
}

export function getQuestion(id: string) {
  return questions.get(id)
}

export function getAction(id: string) {
  return actions.get(id)
}

export function getComponent(id: string) {
  return components.get(id)
}

export function getPersona(id: string) {
  return personas.get(id)
}

export function getScenario(id: string) {
  return scenarios.get(id)
}

export function getCampaign(id: string) {
  return campaigns.get(id)
}

export function listComponents() {
  return handoff.car.components as unknown as ComponentRecord[]
}

export function listPersonas() {
  return handoff.people as unknown as Persona[]
}

export const KIND_LABEL: Record<string, string> = {
  reported: "Reported",
  derived: "Derived",
  technical_specification: "Technical specification",
  regulatory_limit: "Regulatory limit",
  target: "Target",
  illustrative: "Illustrative scenario",
  simulated: "Simulated",
  unavailable: "Not available",
}

export function formatMetric(metric: Metric): string {
  if (metric.value === null || metric.kind === "unavailable") {
    return handoff.app.errors.unavailable_metric
  }
  if (metric.id === "stem_students") return "600+"
  if (metric.id === "neuro_members") return "About 35"
  const numeric = Number(metric.value)
  const text =
    metric.display_precision === 0
      ? Math.round(numeric).toLocaleString("en-GB")
      : numeric.toLocaleString("en-GB", {
          minimumFractionDigits: metric.display_precision,
          maximumFractionDigits: metric.display_precision,
        })
  if (metric.unit === "percent") return `${text}%`
  if (metric.unit === "GBP") return `£${text}`
  if (metric.unit === "tCO2e") return `${text} tCO2e`
  return `${text} ${metric.unit}`
}

export function roleForProgramme(programmeId: string) {
  const match = handoff.partners.demo_roles.find((role) => role.programme_ids.includes(programmeId))
  return match?.id ?? handoff.partners.default_role
}

export function primarySourceBlocked(source: Source | undefined) {
  return source?.review_status === "unverified_url_do_not_use_in_primary_demo"
}
