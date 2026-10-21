import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ComponentRecord } from "../lib/content.ts"
import { getMetric, formatMetric, handoff } from "../lib/content.ts"
import { useDemo } from "../lib/store.ts"
import { Conversation, Kind, MetricCard } from "./Chrome.tsx"

export function CarStage({
  components,
  activeId,
  focusHotspot,
}: {
  components: ComponentRecord[]
  activeId?: string
  focusHotspot?: string
}) {
  const navigate = useNavigate()
  const spots = components.flatMap((component) =>
    component.hotspots
      .filter((hotspot) => component.id !== "tires" || hotspot.id === "tires_0")
      .map((hotspot) => {
        const placed = calibrated[hotspot.id] ?? { x: hotspot.x, y: hotspot.y }
        return { ...hotspot, ...placed, componentId: component.id, label: component.label }
      }),
  )
  return (
    <div className="car-stage">
      <div
        className="car-frame"
        onDoubleClick={(event) => {
          const target = event.target as HTMLElement
          if (target.closest(".hotspot")) return
          navigate("/car/evolution")
        }}
      >
        <img className="car-photo" src="/assets/car/car-top.jpg" alt="Top view of a Formula One car used as the explorer" />
        {spots.map((spot) => (
          <button
            key={spot.id}
            id={`hotspot-${spot.id}`}
            className={activeId === spot.componentId && (!focusHotspot || focusHotspot === spot.id) ? "hotspot active" : "hotspot"}
            style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
            type="button"
            aria-label={spot.label}
            aria-pressed={activeId === spot.componentId}
            onClick={() => navigate(`/car/${spot.componentId}?spot=${spot.id}`)}
          >
            <i />
            <em>{spot.label}</em>
          </button>
        ))}
      </div>
      <p className="muted car-caption">Select a square to explore a component.</p>
    </div>
  )
}

const calibrated: Record<string, { x: number; y: number }> = {
  active_aero_0: { x: 0.5, y: 0.125 },
  tires_0: { x: 0.342, y: 0.238 },
  tires_1: { x: 0.658, y: 0.238 },
  brakes_0: { x: 0.4, y: 0.25 },
  suspension_0: { x: 0.42, y: 0.3 },
  chassis_0: { x: 0.5, y: 0.402 },
  fuel_system_0: { x: 0.5, y: 0.47 },
  cooling_0: { x: 0.61, y: 0.546 },
  energy_recovery_0: { x: 0.44, y: 0.56 },
  power_unit_0: { x: 0.5, y: 0.64 },
  floor_diffuser_0: { x: 0.5, y: 0.82 },
  suspension_1: { x: 0.6, y: 0.72 },
  gearbox_0: { x: 0.5, y: 0.73 },
  brakes_1: { x: 0.4, y: 0.76 },
  tires_2: { x: 0.341, y: 0.762 },
  tires_3: { x: 0.657, y: 0.762 },
  active_aero_1: { x: 0.5, y: 0.876 },
}

export function ComponentPanel({ component, spot }: { component: ComponentRecord; spot?: string }) {
  const generation = useDemo((store) => store.state.generation)
  const replace = useDemo((store) => store.replace)
  const navigate = useNavigate()
  const season = generation === "2025" ? "2025" : "2026"
  const variant = component.variants.find((item) => item.id === season) ?? component.variants[1]
  const close = () => {
    const focusId = spot ? `hotspot-${spot}` : `hotspot-${component.hotspots[0]?.id ?? ""}`
    navigate("/car")
    window.setTimeout(() => document.getElementById(focusId)?.focus(), 0)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <section className="panel" aria-label={component.label}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ marginTop: 0 }}>{component.label}</h2>
        <button className="btn ghost" type="button" onClick={close}>Close</button>
      </div>
      <div className="chips" style={{ marginBottom: 12 }}>
        {(["2025", "2026"] as const).map((year) => (
          <button key={year} className={season === year ? "chip active" : "chip"} type="button" onClick={() => replace((current) => ({ ...current, generation: year }))}>
            {year} {year === "2025" ? "AMR25" : "AMR26"}
          </button>
        ))}
      </div>
      <div className="grid-2">
        <div>
          <p>{variant?.description}</p>
          {variant?.sustainability_connection ? <p>{variant.sustainability_connection}</p> : null}
        </div>
        <PartVisual id={component.id} animation={component.animation} states={component.animation_controls.states} />
      </div>
      <div className="grid-2" style={{ marginTop: 12 }}>
        {(variant?.metric_ids.length ? variant.metric_ids : component.metric_ids).map((id) => (
          <MetricCard key={id} id={id} />
        ))}
        <article>
          <Kind kind="unavailable" />
          <p>{formatMetric(getMetric(component.missing_metric_id)!)}</p>
        </article>
      </div>
      {component.id === "energy_recovery" ? <PowerCompare /> : null}
      <Conversation surface={`car:${component.id}`} questionIds={component.question_ids} />
      <button className="btn" type="button" style={{ marginTop: 12 }} onClick={() => navigate(`/people/${component.bridge.action_id.replace("person_", "")}`)}>
        {component.bridge.label}
      </button>
    </section>
  )
}

function PowerCompare() {
  const low = getMetric("mgu_k_2025")
  const high = getMetric("mgu_k_2026")
  if (!low || !high || low.value === null || high.value === null) return null
  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <p style={{ marginTop: 0 }}>Permitted MGU-K peak power</p>
      <div className="bars">
        <div className="bar-row"><span>2025</span><span className="track"><i style={{ width: `${(low.value / high.value) * 100}%` }} /></span><span>{formatMetric(low)}</span></div>
        <div className="bar-row"><span>2026</span><span className="track"><i style={{ width: "100%" }} /></span><span>{formatMetric(high)}</span></div>
      </div>
      <p className="muted">{high.note}</p>
    </div>
  )
}

function PartVisual({ id, animation, states }: { id: string; animation: string; states?: string[] }) {
  const reduced = useDemo((store) => store.state.reducedMotion)
  const [playing, setPlaying] = useState(true)
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (!playing || reduced || !states?.length) return
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % states.length), 900)
    return () => window.clearInterval(timer)
  }, [playing, reduced, states])
  const state = states?.[index]
  return (
    <div className="part-visual">
      <img src={`/assets/parts/${id}.jpg`} alt="" />
      {state ? <p className="flare" style={{ marginBottom: 0 }}>{state}</p> : null}
      <p>{caption(animation, state)}</p>
      {states?.length ? (
        <div className="chips">
          <button className="chip" type="button" onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Play"}</button>
          <button className="chip" type="button" onClick={() => { setIndex(0); setPlaying(false) }}>Reset</button>
        </div>
      ) : null}
    </div>
  )
}

function caption(animation: string, state?: string) {
  if (animation === "wing_mode_toggle") return state === "Straight Mode" ? "Straight mode reduces drag." : "Corner mode restores downforce."
  if (animation === "recover_store_deploy") return `${state ?? "Recover"} is a sequence, not a live measurement.`
  if (animation === "fuel_flow") return "Fuel-cell location is shown as an x-ray, not exposed bodywork."
  if (animation === "layer_separation") return "Composite layers are a structural explanation."
  if (animation === "underfloor_airflow") return "Underfloor airflow is a schematic."
  if (animation === "cooling_airflow") return "Cooling air is balanced against drag."
  if (animation === "friction_regen_blend") return "Friction and regenerative braking share the stop."
  if (animation === "wheel_travel") return "Wheel travel shows the mechanical path."
  if (animation === "wheel_rotation") return "Wheel detail for the 18-inch regulation."
  if (animation === "hybrid_energy_flow") return "Combustion and electrical paths share the power unit."
  return handoff.car.interaction.panel_layout
}
