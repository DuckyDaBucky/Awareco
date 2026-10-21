import { Link } from "react-router-dom"
import { Conversation, MetricStrip } from "../components/Chrome.tsx"
import { handoff } from "../lib/content.ts"

export function HomePage() {
  const home = handoff.app.home
  return (
    <>
      <p className="notice">{handoff.app.global_notice}</p>
      <h1 className="flare" style={{ fontSize: "clamp(48px, 7vw, 84px)", margin: "0 0 8px" }}>{home.headline}</h1>
      <p style={{ maxWidth: 640, fontSize: 20 }}>{home.description}</p>
      <div className="home-grid">
        <Link className="panel entry" to="/people">
          <p className="muted">Community and inclusion</p>
          <h2>The People</h2>
          <p>12 composite guides to real programmes.</p>
        </Link>
        <section className="panel">
          <p className="muted">Your guide</p>
          <h2 style={{ marginTop: 0 }}>{handoff.app.guide_name}</h2>
          <p>{home.guide_intro}</p>
          <Conversation surface="guide" questionIds={handoff.conversations.default_guide_question_ids} />
        </section>
        <Link className="panel entry" to="/car">
          <p className="muted">Engineering</p>
          <h2>The Car</h2>
          <p>Take it apart. See how every part is explained.</p>
        </Link>
      </div>
      <MetricStrip ids={home.metric_ids} />
      <div className="chips" style={{ marginTop: 16 }}>
        <Link className="btn" to="/race">Race weekend</Link>
        <Link className="btn ghost" to="/partners">The Partners</Link>
        <Link className="btn ghost" to="/go/ig-car-engine">Car story concept</Link>
      </div>
      <p className="muted">{handoff.app.transition_lines[1]}</p>
    </>
  )
}
