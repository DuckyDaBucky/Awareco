import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { CarStage, ComponentPanel, SideProfile } from "../components/CarStage.tsx"
import { MetricCard } from "../components/Chrome.tsx"
import { getComponent, handoff, listComponents } from "../lib/content.ts"
import { useDemo } from "../lib/store.ts"

export function CarPage() {
  const { componentId } = useParams()
  const [params] = useSearchParams()
  const component = componentId ? getComponent(componentId) : undefined
  const components = listComponents()
  if (componentId && !component) {
    return (
      <section className="panel">
        <h1>That component is not in this demonstration</h1>
        <Link to="/car">Back to the car</Link>
      </section>
    )
  }
  return (
    <>
      <p className="muted">The car · component explorer</p>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ marginTop: 0 }}>Tap a part. See its story.</h1>
        <Link className="btn" to="/car/evolution">Explore generations</Link>
      </div>
      <div className={component ? "car-layout" : undefined}>
        <CarStage components={components} activeId={component?.id} focusHotspot={params.get("spot") ?? undefined} />
        {component ? <ComponentPanel component={component} spot={params.get("spot") ?? undefined} /> : (
          <div className="chips" style={{ marginTop: 12 }}>
            {components.map((item) => (
              <Link key={item.id} className="chip" to={`/car/${item.id}`}>{item.label}</Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export function EvolutionPage() {
  const stops = handoff.car.timeline.stops
  const replace = useDemo((store) => store.replace)
  const generation = useDemo((store) => store.state.generation)
  const index = Math.max(0, stops.findIndex((stop) => stop.id === generation))
  const stop = stops[index] ?? stops[0]
  const navigate = useNavigate()
  const select = (id: string) => replace((current) => ({ ...current, generation: id as "2025" | "2026" }))
  return (
    <>
      <p className="muted">The car · evolution</p>
      <h1>Scrub the loaded generations</h1>
      <SideProfile year={stop.id} />
      <div
        className="timeline"
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={stops.length - 1}
        aria-valuenow={index}
        aria-label="Car generation"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") select(stops[Math.min(stops.length - 1, index + 1)].id)
          if (event.key === "ArrowLeft") select(stops[Math.max(0, index - 1)].id)
          if (event.key === "Home") select(stops[0].id)
          if (event.key === "End") select(stops[stops.length - 1].id)
        }}
      >
        {stops.map((item, itemIndex) => (
          <button
            key={item.id}
            className={item.id === stop.id ? "stop active" : "stop"}
            style={{ left: `${(itemIndex / Math.max(1, stops.length - 1)) * 100}%` }}
            type="button"
            onClick={() => select(item.id)}
          >
            <i />
            <small>{item.year}<br />{item.title}</small>
          </button>
        ))}
      </div>
      <section className="grid-2">
        <article className="panel">
          <h2>{stop.title}</h2>
          <p>{stop.body}</p>
          <p className="muted">{handoff.car.timeline.historical_expansion.rule}</p>
        </article>
        <article className="panel">
          <p className="lime">Team-impact milestone</p>
          <h2>{stop.id === "2025" ? "Sustainable aviation fuel certificates" : "2026 technical framework"}</h2>
          {stop.metric_ids.map((id) => <MetricCard key={id} id={id} />)}
        </article>
      </section>
      <button className="btn" type="button" style={{ marginTop: 16 }} onClick={() => navigate("/car")}>Back to the component explorer</button>
    </>
  )
}
