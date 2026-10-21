import { create } from "zustand"
import { handoff, roleForProgramme } from "./content.ts"
import { stopSpeaking } from "./speech.ts"

export type Turn = {
  id: string
  role: "user" | "guide"
  text: string
  questionId?: string
  pending?: boolean
}

type Reservation = {
  id: string
  experienceId: string
  quantity: number
  code: string
  status: "reserved" | "cancelled"
}

type EngineState = "ready" | "extracting" | "classified" | "review_required" | "approved" | "rejected"

export type DemoState = {
  version: 1
  roleId: string
  programmeId: string
  generation: "2025" | "2026"
  threads: Record<string, Turn[]>
  matchAnswers: Record<string, string | null>
  savedScenarios: { id: string; scenarioId: string; inputs: Record<string, number>; at: string }[]
  reportScenarioId: string | null
  reservations: Reservation[]
  capacity: Record<string, number>
  stamps: string[]
  interests: string[]
  engineState: EngineState
  engineAudit: string[]
  engineLedger: { id: string; value: number; unit: string }[]
  raceIndex: number
  racePlaying: boolean
  events: { id: string; type: string }[]
  campaignId: string | null
  gapStatus: Record<string, string>
  skipReveal: boolean
  reducedMotion: boolean
  reactionTimes: number[]
  reactionBoard: number[]
}

const KEY = handoff.app.storage.key

function initialCapacity() {
  return Object.fromEntries(handoff.experiences.items.map((item) => [item.id, item.capacity]))
}

export function initialState(): DemoState {
  return {
    version: 1,
    roleId: handoff.partners.default_role,
    programmeId: handoff.partners.demo_roles.find((role) => role.id === handoff.partners.default_role)?.programme_ids[0] ?? "make-a-mark-day",
    generation: "2026",
    threads: {},
    matchAnswers: {},
    savedScenarios: [],
    reportScenarioId: null,
    reservations: [],
    capacity: initialCapacity(),
    stamps: [],
    interests: [],
    engineState: "ready",
    engineAudit: [],
    engineLedger: [],
    raceIndex: 0,
    racePlaying: false,
    events: [],
    campaignId: null,
    gapStatus: Object.fromEntries(handoff.partners.data_gaps.map((gap) => [gap.id, gap.status])),
    skipReveal: false,
    reducedMotion: false,
    reactionTimes: [],
    reactionBoard: [],
  }
}

function read(): DemoState {
  if (typeof sessionStorage === "undefined") return initialState()
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as DemoState
    if (parsed.version !== 1) return initialState()
    return { ...initialState(), ...parsed, capacity: { ...initialCapacity(), ...parsed.capacity } }
  } catch {
    return initialState()
  }
}

type Store = {
  state: DemoState
  replace: (next: DemoState | ((current: DemoState) => DemoState)) => void
  reset: () => void
}

export const useDemo = create<Store>((set, get) => ({
  state: read(),
  replace: (next) => {
    const value = typeof next === "function" ? next(get().state) : next
    set({ state: value })
    try {
      sessionStorage.setItem(KEY, JSON.stringify(value))
    } catch {
      /* session storage can be unavailable; the in-memory state still works */
    }
  },
  reset: () => {
    stopSpeaking()
    const fresh = initialState()
    set({ state: fresh })
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  },
}))

export function selectProgramme(programmeId: string) {
  useDemo.getState().replace((current) => ({
    ...current,
    programmeId,
    roleId: roleForProgramme(programmeId),
  }))
}

export function track(type: string, id = `${type}:${crypto.randomUUID()}`) {
  useDemo.getState().replace((current) => {
    if (current.events.some((event) => event.id === id)) return current
    return { ...current, events: [...current.events, { id, type }] }
  })
}
