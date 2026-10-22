import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { handoff } from "../lib/content.ts"
import { useDemo } from "../lib/store.ts"

export function EnginePage() {
  const state = useDemo((store) => store.state)
  const replace = useDemo((store) => store.replace)
  const timers = useRef<number[]>([])
  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }
  useEffect(() => clear, [])
  const run = () => {
    clear()
    const sequence = ["extracting", "classified", "review_required"] as const
    replace((current) => ({ ...current, engineState: "extracting", engineAudit: [...current.engineAudit, "fixture_started"] }))
    sequence.forEach((next, index) => {
      const timer = window.setTimeout(() => {
        replace((current) => ({
          ...current,
          engineState: next,
          engineAudit: [...current.engineAudit, next === "review_required" ? "review_requested" : "fields_extracted"],
        }))
      }, handoff.engine.fixture.durations_ms[index] ?? 350)
      timers.current.push(timer)
    })
  }
  const approve = () => {
    const record = handoff.engine.fixture.approved_record
    replace((current) => ({
      ...current,
      engineState: "approved",
      engineAudit: [...current.engineAudit, "fixture_approved"],
      engineLedger: current.engineLedger.some((item) => item.id === record.id) ? current.engineLedger : [...current.engineLedger, { id: record.id, value: record.value, unit: record.unit }],
    }))
  }
  const reject = () => replace((current) => ({ ...current, engineState: "rejected", engineAudit: [...current.engineAudit, "fixture_rejected"], engineLedger: [] }))
  const footprint = handoff.metrics.find((metric) => metric.id === "footprint_2025")
  return (
    <>
      <p className="lime">{handoff.engine.label}</p>
      <h1>{handoff.engine.title}</h1>
      <p>{handoff.engine.production_description}</p>
      <ol>{handoff.engine.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <article className="panel">
        <h2>{handoff.engine.fixture.name}</h2>
        <p>{handoff.engine.fixture.raw_text}</p>
        <p>Electricity {handoff.engine.fixture.parsed_fields.electricity_kwh} kWh · solar {handoff.engine.fixture.parsed_fields.solar_kwh} kWh</p>
        <p>Pillar {handoff.engine.fixture.pillar}</p>
        <p>{handoff.engine.fixture.flags[0].message}</p>
        <p>State: {state.engineState}</p>
        <div className="chips">
          <button className="btn" type="button" onClick={run}>Run example</button>
          <button className="btn" type="button" onClick={approve} disabled={state.engineState !== "review_required" && state.engineState !== "approved"}>Approve</button>
          <button className="btn ghost" type="button" onClick={reject}>Reject</button>
        </div>
      </article>
      <h2>Demo ledger</h2>
      {state.engineLedger.length === 0 ? <p>No demonstration record published.</p> : state.engineLedger.map((row) => <p key={row.id}>{row.value} {row.unit} · simulated</p>)}
      <p>Published footprint remains {footprint?.value} {footprint?.unit}.</p>
      <ul>{state.engineAudit.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
    </>
  )
}

export function ExperiencesPage() {
  const capacity = useDemo((store) => store.state.capacity)
  const reservations = useDemo((store) => store.state.reservations)
  const replace = useDemo((store) => store.replace)
  const [qty, setQty] = useState<Record<string, number>>({ booth_pass: 1, meet_engineer: 1 })
  const [message, setMessage] = useState("")
  const reserve = (id: string) => {
    const quantity = qty[id] ?? 1
    if (quantity < 1 || quantity > handoff.experiences.reservation.max_quantity) return
    if ((capacity[id] ?? 0) < quantity) {
      setMessage("Not enough fictional capacity.")
      return
    }
    const code = `${handoff.experiences.reservation.code_prefix}${1000 + reservations.length}`
    replace((current) => ({
      ...current,
      capacity: { ...current.capacity, [id]: current.capacity[id] - quantity },
      reservations: [...current.reservations, { id: `res-${current.reservations.length}`, experienceId: id, quantity, code, status: "reserved" }],
    }))
    setMessage(`Demo reservation created. No payment taken. Reference ${code}.`)
  }
  const cancel = (id: string) => {
    replace((current) => {
      const found = current.reservations.find((row) => row.id === id)
      if (!found || found.status === "cancelled") return current
      return {
        ...current,
        reservations: current.reservations.map((row) => row.id === id ? { ...row, status: "cancelled" } : row),
        capacity: { ...current.capacity, [found.experienceId]: current.capacity[found.experienceId] + found.quantity },
      }
    })
  }
  return (
    <>
      <h1>Experiences</h1>
      <p>Demo reservation created. No payment taken.</p>
      {handoff.experiences.items.map((item) => (
        <article key={item.id} className="panel" style={{ marginBottom: 12 }}>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <p>{item.price_cents === null ? "Price not set in this demo." : `$${(item.price_cents / 100).toFixed(0)} illustrative`}</p>
          <p>Fictional places left: {capacity[item.id]}</p>
          <label>Quantity
            <input type="number" min={1} max={4} value={qty[item.id]} onChange={(event) => setQty((current) => ({ ...current, [item.id]: Number(event.target.value) }))} />
          </label>
          <button className="btn" type="button" onClick={() => reserve(item.id)}>Confirm demo reservation</button>
        </article>
      ))}
      {message ? <p>{message}</p> : null}
      <ul>
        {reservations.map((row) => (
          <li key={row.id}>
            {row.code} · {row.status} · qty {row.quantity}
            {row.status === "reserved" ? <button type="button" onClick={() => cancel(row.id)}>Cancel</button> : null}
            {row.status === "reserved" ? <a href={`/stamp/${row.code}`}>Ticket</a> : null}
          </li>
        ))}
      </ul>
    </>
  )
}

export function StampPage() {
  const { code } = useParams()
  const reservation = useDemo((store) => store.state.reservations.find((row) => row.code === code && row.status === "reserved"))
  const stamps = useDemo((store) => store.state.stamps)
  const replace = useDemo((store) => store.replace)
  if (!reservation && code !== handoff.experiences.stamp.id) {
    return <section className="panel"><h1>That reference is not in this session.</h1><Link to="/experiences">Experiences</Link></section>
  }
  const claim = () => {
    if (stamps.includes(code ?? "")) return
    replace((current) => ({ ...current, stamps: [...current.stamps, code ?? ""] }))
  }
  return (
    <article className="print-sheet">
      <h1>Prototype ticket. Not valid for admission.</h1>
      <p>{handoff.experiences.reservation.ticket_notice}</p>
      <p>Reference {code}</p>
      <p>{handoff.experiences.stamp.meaning}</p>
      <button className="btn no-print" type="button" onClick={claim} disabled={stamps.includes(code ?? "")}>{stamps.includes(code ?? "") ? "Stamp kept in this session" : "Keep the demo stamp"}</button>
      <button className="btn ghost no-print" type="button" onClick={() => window.print()}>Print ticket</button>
    </article>
  )
}

export function BoothPage() {
  const booth = handoff.experiences.booth
  const replace = useDemo((store) => store.replace)
  const board = useDemo((store) => store.state.reactionBoard)
  const [phase, setPhase] = useState<"idle" | "wait" | "go" | "done">("idle")
  const [message, setMessage] = useState("Tap start. Wait for green.")
  const [attempt, setAttempt] = useState(0)
  const [times, setTimes] = useState<number[]>([])
  const started = useRef(0)
  const timer = useRef<number | null>(null)
  const idle = useRef<number | null>(null)
  const navigate = useNavigate()
  const [code, setCode] = useState("")
  const scheduleIdle = useRef<() => void>(() => {})
  useEffect(() => {
    const schedule = () => {
      if (idle.current) window.clearTimeout(idle.current)
      idle.current = window.setTimeout(() => {
        useDemo.getState().reset()
        setPhase("idle")
        setTimes([])
        setAttempt(0)
        setMessage("Tap start. Wait for green.")
        navigate("/booth")
      }, booth.idle_reset_seconds * 1000)
    }
    scheduleIdle.current = schedule
    schedule()
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
      if (idle.current) window.clearTimeout(idle.current)
    }
  }, [booth.idle_reset_seconds, navigate])
  const bump = () => scheduleIdle.current()
  const start = () => {
    bump()
    setTimes([])
    setAttempt(0)
    arm(0)
  }
  const arm = (index: number) => {
    setPhase("wait")
    setMessage("Wait for green")
    setAttempt(index)
    const delay = booth.green_delays_ms[index] ?? 1600
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      started.current = performance.now()
      setPhase("go")
      setMessage("Green")
    }, delay)
  }
  const tap = () => {
    bump()
    if (phase === "wait") {
      if (timer.current) window.clearTimeout(timer.current)
      setMessage(booth.false_start_copy)
      setPhase("idle")
      return
    }
    if (phase !== "go") return
    const elapsed = performance.now() - started.current
    const next = [...times, elapsed]
    setTimes(next)
    if (next.length >= booth.attempts) {
      const sorted = [...next].sort((a, b) => a - b)
      const median = sorted[Math.floor(sorted.length / 2)]
      replace((current) => ({ ...current, reactionBoard: [...current.reactionBoard, median].sort((a, b) => a - b).slice(0, 5) }))
      setPhase("done")
      setMessage(`Median ${Math.round(median)} ms. Not a pit crew comparison.`)
      return
    }
    arm(attempt + 1)
  }
  return (
    <section onPointerDown={bump}>
      <h1>Fan zone</h1>
      <div className="chips">
        <Link className="btn" to="/car">Car explorer</Link>
        <Link className="btn ghost" to="/">Guide</Link>
        <button className="btn ghost" type="button" onClick={() => document.documentElement.requestFullscreen?.()}>Fullscreen</button>
        <button className="btn ghost" type="button" onClick={() => useDemo.getState().reset()}>Reset session</button>
      </div>
      <button className={phase === "go" ? "reaction go" : "reaction wait"} type="button" onClick={tap}>{message}</button>
      <button className="btn" type="button" onClick={start}>Start three attempts</button>
      <label style={{ display: "block", marginTop: 16 }}>Demo ticket code
        <input value={code} onChange={(event) => setCode(event.target.value)} />
      </label>
      <Link to={code ? `/stamp/${code}` : "/experiences"}>Open ticket</Link>
      <ol>{board.map((score) => <li key={score}>{Math.round(score)} ms</li>)}</ol>
    </section>
  )
}

export function CampaignPage() {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  const campaign = handoff.campaigns.items.find((item) => item.id === campaignId)
  const replace = useDemo((store) => store.replace)
  useEffect(() => {
    if (!campaign) {
      navigate("/")
      return
    }
    replace((current) => ({ ...current, campaignId: campaign.id }))
  }, [campaign, navigate, replace])
  if (!campaign) return null
  return (
    <article className="panel">
      <p className="lime">{handoff.campaigns.label}</p>
      <p className="muted">{campaign.channel}</p>
      <img src={campaign.image_reference} alt="" />
      <h1>{campaign.headline}</h1>
      <p>This preview was not published by the team.</p>
      <Link className="btn" to={campaign.target}>{campaign.cta}</Link>
    </article>
  )
}

export function DemoPage() {
  const navigate = useNavigate()
  const reset = useDemo((store) => store.reset)
  const replace = useDemo((store) => store.replace)
  const fonts = handoff.brand.font_assets.every((font) => Boolean(font.local_href))
  return (
    <>
      <h1>Presenter controls</h1>
      <p>Hidden from the fan menu. Alt Shift D opens this page.</p>
      <ol>
        {handoff.demo_script.steps.map((step) => (
          <li key={step.id}>
            <button className="chip" type="button" onClick={() => navigate(step.path)}>{step.id}</button>
            <p>{step.say}</p>
            <p className="muted">{step.do}</p>
          </li>
        ))}
      </ol>
      <div className="chips">
        <button className="btn" type="button" onClick={() => { reset(); navigate(handoff.demo_script.steps[0].path) }}>Start walkthrough</button>
        <button className="btn ghost" type="button" onClick={() => { reset(); navigate("/") }}>Reset demo</button>
        <button className="chip" type="button" onClick={() => replace((current) => ({ ...current, racePlaying: false }))}>Pause race</button>
        <button className="chip" type="button" onClick={() => replace((current) => ({ ...current, skipReveal: !current.skipReveal }))}>Skip response animation</button>
        <button className="chip" type="button" onClick={() => replace((current) => ({ ...current, reducedMotion: !current.reducedMotion }))}>Toggle reduced motion</button>
        <Link className="chip" to="/methodology">Sources and assumptions</Link>
      </div>
      <p>Fonts referenced: {fonts ? "yes" : "missing"}. Header SVG: {handoff.brand.header.logo_asset}.</p>
    </>
  )
}

export function MethodologyPage() {
  return (
    <>
      <h1>Sources and assumptions</h1>
      <p>Prepared answers are stored with this demonstration. Simulated weekends, illustrative guides, and scenario estimates are labelled on the screens where they appear.</p>
      <ul>
        {handoff.sources.map((source) => (
          <li key={source.id}>
            <strong>{source.title}</strong> · {source.review_status.replaceAll("_", " ")}
            {source.page ? ` · page ${source.page}` : ""}
            {source.local_href ? <a href={source.local_href}> Local</a> : null}
          </li>
        ))}
      </ul>
      <h2>Scenario assumptions</h2>
      {handoff.simulations.scenarios.map((scenario) => (
        <section key={scenario.id}>
          <h3>{scenario.title}</h3>
          <ul>{scenario.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ))}
    </>
  )
}

export function MissingPage() {
  return (
    <section className="panel">
      <h1>{handoff.app.errors.unknown_route}</h1>
      <Link to="/">Return home</Link>
    </section>
  )
}
