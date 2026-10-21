import { Link } from "react-router-dom"
import { Conversation, MetricStrip } from "../components/Chrome.tsx"
import { handoff } from "../lib/content.ts"

export function HomePage() {
  const home = handoff.app.home
  return (
    <>
      <h1 className="flare" style={{ fontSize: "clamp(48px, 7vw, 84px)", margin: "0 0 8px" }}>{home.headline}</h1>
      <p style={{ maxWidth: 640, fontSize: 20 }}>{home.description}</p>
      <div className="home-grid">
        <Link className="panel entry people-entry" to="/people">
          <p className="muted">Community and inclusion</p>
          <h2>The People</h2>
          <p>Twelve stories from the programmes behind the team.</p>
        </Link>
        <section className="panel chat-panel">
          <Conversation
            surface="guide"
            questionIds={["guide_people", "guide_match", "guide_car"]}
            intro={home.guide_intro}
            guide={{
              name: handoff.app.guide_name,
              image: "/assets/brand/ailonso.jpg",
              credit: "Portrait: Off The Track Media, CC BY 2.0, via Wikimedia Commons.",
            }}
          />
        </section>
        <Link className="panel entry car-entry" to="/car">
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
