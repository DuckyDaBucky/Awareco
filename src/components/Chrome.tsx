import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { speakGuide, speechAvailable, stopSpeaking } from "../lib/speech.ts"
import {
  KIND_LABEL,
  formatMetric,
  getAction,
  getMetric,
  getQuestion,
  getSource,
  handoff,
  primarySourceBlocked,
  type Metric,
  type Question,
} from "../lib/content.ts"
import { useDemo, type Turn } from "../lib/store.ts"

export function Shell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const reduced = useDemo((store) => store.state.reducedMotion)
  const logo = handoff.brand.header.logo_asset
  const { pathname } = useLocation()

  useEffect(() => {
    stopSpeaking()
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("reduced", reduced)
  }, [reduced])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault()
        navigate("/demo")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [navigate])

  const go = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <>
      <a className="sr-only" href="#main">Skip to content</a>
      <header className={scrolled ? "header scrolled" : "header"}>
        <button className="menu-button" type="button" aria-label="Open menu" onClick={() => setOpen(true)}>
          <span />
          <span />
        </button>
        <Link className="logo-link" to="/" aria-label="Make A Mark Live home">
          <img src={logo} alt="Aston Martin Aramco Formula One Team" width={200} />
        </Link>
        <div className="header-ctas">
          <a className="header-cta" href={handoff.brand.header.access_url} target="_blank" rel="noreferrer">ACCESS I / AM →</a>
          <a className="header-cta" href={handoff.brand.header.shop_url} target="_blank" rel="noreferrer">SHOP NOW →</a>
        </div>
      </header>
      {open ? (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <div className="drawer" role="dialog" aria-label="Menu" onClick={(event) => event.stopPropagation()}>
            <button className="btn ghost" type="button" onClick={() => setOpen(false)}>Close</button>
            <p className="group-label">Make A Mark Live</p>
            <nav>
              {handoff.app.menu_items.map((item) => {
                const action = getAction(item.action_id)
                return (
                  <button key={item.action_id} className="linkish" type="button" onClick={() => go(action?.path ?? "/")}>
                    {item.label}
                  </button>
                )
              })}
            </nav>
            <p className="group-label">Aston Martin Aramco</p>
            <nav>
              <a href={handoff.brand.header.access_url} target="_blank" rel="noreferrer">Access I / AM</a>
              <a href={handoff.brand.header.shop_url} target="_blank" rel="noreferrer">Shop now</a>
              <a href="https://www.astonmartinf1.com/en-GB" target="_blank" rel="noreferrer">Official website</a>
            </nav>
          </div>
        </div>
      ) : null}
      <main id="main" className={pathname === '/race' ? 'page race-shell' : 'page'}>{children}</main>
      <footer className="site-foot">
        <Link to="/methodology">How this demonstration works</Link>
      </footer>
    </>
  )
}

export function Kind({ kind }: { kind: string }) {
  return <span className="kind">{KIND_LABEL[kind] ?? kind}</span>
}

export function MetricCard({ id }: { id: string }) {
  const metric = getMetric(id)
  if (!metric) return null
  return (
    <article>
      <Kind kind={metric.kind} />
      <strong>{formatMetric(metric)}</strong>
      <p style={{ margin: 0 }}>{metric.label}</p>
      <p className="muted" style={{ margin: "6px 0 0", fontSize: 13 }}>{metric.period} · {metric.scope}</p>
      {metric.note ? <p className="muted" style={{ fontSize: 13 }}>{metric.note}</p> : null}
    </article>
  )
}

export function Conversation({
  surface,
  questionIds,
  intro,
  guide,
}: {
  surface: string
  questionIds: string[]
  intro?: string
  guide?: { name: string; image: string; credit: string }
}) {
  const threads = useDemo((store) => store.state.threads)
  const skip = useDemo((store) => store.state.skipReveal || store.state.reducedMotion)
  const replace = useDemo((store) => store.replace)
  const turns = useMemo(() => threads[surface] ?? [], [threads, surface])
  const [pending, setPending] = useState<number | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const seenTurns = useRef(turns.length)

  useEffect(() => {
    return () => {
      if (pending) window.clearTimeout(pending)
    }
  }, [pending])

  useEffect(() => {
    const latest = turns[turns.length - 1]
    if (turns.length <= seenTurns.current || latest?.role !== "guide") {
      seenTurns.current = turns.length
      return
    }
    seenTurns.current = turns.length
    const last = logRef.current?.querySelector(".bubble.guide:last-child")
    if (!(last instanceof HTMLElement)) return
    const rect = last.getBoundingClientRect()
    const limit = window.innerHeight - 48
    if (rect.bottom > limit) {
      const top = window.scrollY + rect.bottom - limit
      window.scrollTo({ top, behavior: skip ? "auto" : "smooth" })
    }
  }, [turns, skip])

  const ask = (question: Question) => {
    if (pending) return
    stopSpeaking()
    const userTurn: Turn = { id: `${question.id}:q:${turns.length}`, role: "user", text: question.question, questionId: question.id }
    replace((current) => ({
      ...current,
      threads: { ...current.threads, [surface]: [...(current.threads[surface] ?? []), userTurn].slice(-20) },
      events: current.events.some((event) => event.id === `q:${question.id}:${turns.length}`)
        ? current.events
        : [...current.events, { id: `q:${question.id}:${turns.length}`, type: "question_selected" }],
    }))
    const reveal = () => {
      const answer: Turn = {
        id: `${question.id}:a:${turns.length}`,
        role: "guide",
        text: question.response.paragraphs.join("\n\n"),
        questionId: question.id,
      }
      replace((current) => ({
        ...current,
        threads: {
          ...current.threads,
          [surface]: [...(current.threads[surface] ?? []), answer].slice(-20),
        },
      }))
      setPending(null)
    }
    if (skip) {
      reveal()
      return
    }
    const timer = window.setTimeout(reveal, question.presentation.pending_ms)
    setPending(timer)
  }

  const latestGuide = [...turns].reverse().find((turn) => turn.role === "guide")?.text ?? intro ?? ""
  const asked = new Set(turns.map((turn) => turn.questionId).filter(Boolean))
  const remaining = questionIds.filter((id) => !asked.has(id))
  const reset = () => {
    stopSpeaking()
    replace((current) => ({ ...current, threads: { ...current.threads, [surface]: [] } }))
  }
  return (
    <div className={guide ? "chat" : undefined} data-conversation={surface}>
      {guide ? (
        <div className="chat-head">
          <img className="chat-face" src={guide.image} alt="Fernando Alonso" />
          <div>
            <p className="muted" style={{ margin: 0 }}>Your guide</p>
            <h2 style={{ margin: 0 }}>{guide.name}</h2>
          </div>
          <SpeechControl text={latestGuide} prominent />
        </div>
      ) : null}
      {intro && turns.length === 0 ? <p className="chat-intro">{intro}</p> : null}
      {guide && remaining.length > 0 ? (
        <div className="ask-list" role="group" aria-label={turns.length ? "Ask another question" : "Questions"}>
          {remaining.map((id) => {
            const question = getQuestion(id)
            if (!question) return null
            return (
              <button key={id} className="ask" type="button" onClick={() => ask(question)} disabled={pending !== null}>
                <span>{question.question}</span>
                <span aria-hidden="true">→</span>
              </button>
            )
          })}
        </div>
      ) : null}
      <div className="talk-log" aria-live="polite" ref={logRef}>
        {turns.map((turn) => (
          <div key={turn.id} className={turn.role === "user" ? "bubble user" : "bubble guide"}>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{turn.text}</p>
            {turn.role === "guide" && turn.questionId ? <AnswerExtras questionId={turn.questionId} /> : null}
          </div>
        ))}
        {pending ? <p className="muted">Preparing the stored answer…</p> : null}
      </div>
      {!guide && remaining.length > 0 ? (
        <div className="chips" role="group" aria-label={turns.length ? "Ask another question" : "Questions"}>
          {remaining.map((id) => {
            const question = getQuestion(id)
            if (!question) return null
            return (
              <button key={id} className="chip" type="button" onClick={() => ask(question)} disabled={pending !== null}>
                {question.question}
              </button>
            )
          })}
        </div>
      ) : null}
      {turns.length > 0 ? (
        <button className={guide ? "text-btn" : "btn ghost"} type="button" onClick={reset}>
          Restart conversation
        </button>
      ) : null}
      {guide ? <p className="muted chat-credit">{guide.credit}</p> : null}
    </div>
  )
}

function SpeechControl({ text, prominent = false }: { text: string; prominent?: boolean }) {
  const [playing, setPlaying] = useState(false)
  useEffect(() => () => stopSpeaking(), [])
  if (!speechAvailable()) return null
  const toggle = () => {
    if (!text) return
    if (playing) {
      stopSpeaking()
      setPlaying(false)
      return
    }
    const started = speakGuide(text, () => setPlaying(false))
    setPlaying(started)
  }
  return (
    <button className={prominent ? "voice-btn" : "chip"} type="button" onClick={toggle} aria-pressed={playing} aria-label={playing ? "Stop voice" : "Play voice"}>
      {playing ? "Stop" : "Voice"}
    </button>
  )
}

function AnswerExtras({ questionId }: { questionId: string }) {
  const question = getQuestion(questionId)
  const navigate = useNavigate()
  const replace = useDemo((store) => store.replace)
  const [sourceId, setSourceId] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  if (!question) return null
  const run = (actionId: string) => {
    const action = getAction(actionId)
    if (!action) return
    if (action.type === "open_source" && action.source_id) {
      setSourceId(action.source_id)
      return
    }
    if (action.type === "navigate" && action.path) {
      navigate(action.path)
      return
    }
    if (action.type === "local_confirmation") {
      replace((current) => ({
        ...current,
        interests: current.interests.includes(question.surface) ? current.interests : [...current.interests, question.surface],
      }))
      setNote(`${action.title}. ${action.body}`)
      return
    }
    if (action.type === "share_or_copy") {
      const url = window.location.href
      void navigator.clipboard?.writeText(url)
      setNote("Link copied in this browser. Nothing was posted.")
      return
    }
    if (action.type === "download_report") {
      navigate("/partners/reports")
    }
  }
  return (
    <>
      <div className="grid-2" style={{ marginTop: 10 }}>
        {question.response.metric_ids.map((id) => (
          <MetricCard key={id} id={id} />
        ))}
      </div>
      <div className="source-list">
        {question.response.links.map((link) => (
          <button key={link.source_id} type="button" onClick={() => setSourceId(link.source_id)}>
            {link.label}
          </button>
        ))}
      </div>
      <div className="chips" style={{ marginTop: 10 }}>
        {question.response.action_ids
          .filter((id) => getAction(id)?.type !== "open_source")
          .map((id) => (
            <button key={id} className="chip" type="button" onClick={() => run(id)}>
              {labelFor(id)}
            </button>
          ))}
      </div>
      {note ? <p className="muted">{note}</p> : null}
      {sourceId ? <SourceDrawer sourceId={sourceId} onClose={() => setSourceId(null)} /> : null}
    </>
  )
}

function labelFor(id: string) {
  if (id.startsWith("component_")) return "Open this component"
  if (id.startsWith("person_")) return "Open the story"
  if (id === "save_interest") return "Save interest in this demo"
  if (id === "share_page") return "Copy page link"
  if (id === "export_report") return "Open report"
  if (id === "match") return "Match me"
  if (id === "impact") return "See reported impact"
  if (id === "race") return "Open the race replay"
  if (id === "simulate") return "Open the scenario"
  if (id === "partners") return "Open partners"
  if (id === "engine") return "See how it would work"
  if (id === "business") return "Open the business case"
  return id.replaceAll("_", " ")
}

export function SourceDrawer({ sourceId, onClose }: { sourceId: string; onClose: () => void }) {
  const source = getSource(sourceId)
  const titleId = useId()
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])
  if (!source) return null
  const blocked = primarySourceBlocked(source)
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer-panel" role="dialog" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
        <button className="btn ghost" type="button" onClick={onClose}>Close</button>
        <h2 id={titleId}>{source.title}</h2>
        <p>{source.publisher ?? "Publisher recorded where the source names one."}</p>
        <p className="muted">{source.year ?? "Year in the citation"}{source.page ? ` · page ${source.page}` : ""} · {source.review_status.replaceAll("_", " ")}</p>
        {blocked ? <p>This URL is not used as a primary demonstration link.</p> : null}
        <div className="chips">
          {source.local_href ? <a className="btn" href={source.local_href} target="_blank" rel="noreferrer">Open local document</a> : null}
          {source.url && !source.url.startsWith("/") && !blocked ? (
            <a className="btn ghost" href={source.url} target="_blank" rel="noreferrer">Official link</a>
          ) : null}
        </div>
      </aside>
    </div>
  )
}

export function MetricStrip({ ids }: { ids: string[] }) {
  return (
    <section className="panel metric-strip" aria-label="Reported figures">
      {ids.map((id) => {
        const metric = getMetric(id)
        if (!metric) return null
        return <MetricView key={id} metric={metric} />
      })}
    </section>
  )
}

function MetricView({ metric }: { metric: Metric }) {
  return (
    <article>
      <Kind kind={metric.kind} />
      <strong>{formatMetric(metric)}</strong>
      <p style={{ margin: 0 }}>{metric.label}</p>
      <p className="muted" style={{ marginBottom: 0 }}>{metric.period} · {metric.scope}</p>
    </article>
  )
}

export function NavText({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink to={to} className={({ isActive }) => (isActive ? "active" : undefined)}>
      {children}
    </NavLink>
  )
}
