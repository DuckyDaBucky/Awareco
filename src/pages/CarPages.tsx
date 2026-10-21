import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { CarStage, ComponentPanel } from "../components/CarStage.tsx"
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

const eraStops = [
  { id: "1959", year: 1959, title: "DBR4", body: "Aston Martin’s first Formula 1 car. Front-engined, with a 2.5-litre straight-six, raced by the works team in 1959.", metric_ids: [] as string[] },
  { id: "1960", year: 1960, title: "DBR5", body: "The works team’s revised front-engined car for a short 1960 programme.", metric_ids: [] as string[] },
  { id: "2021", year: 2021, title: "AMR21", body: "The modern team’s return to the championship, with a Mercedes power unit.", metric_ids: [] as string[] },
  { id: "2022", year: 2022, title: "AMR22", body: "The first Aston Martin of the ground-effect regulations, still Mercedes-powered.", metric_ids: [] as string[] },
  { id: "2023", year: 2023, title: "AMR23", body: "Mercedes-powered car for the 2023 championship.", metric_ids: [] as string[] },
  { id: "2024", year: 2024, title: "AMR24", body: "Mercedes-powered car for the 2024 championship.", metric_ids: [] as string[] },
  ...handoff.car.timeline.stops,
]

export function EvolutionPage() {
  const stops = eraStops
  const replace = useDemo((store) => store.replace)
  const generation = useDemo((store) => store.state.generation)
  const index = Math.max(0, stops.findIndex((stop) => stop.id === generation))
  const stop = stops[index] ?? stops[0]
  const navigate = useNavigate()
  const select = (id: string) => replace((current) => ({ ...current, generation: id }))
  const historic = Number(stop.year) < 2021
  return (
    <>
      <p className="muted">The car · evolution</p>
      <h1>Scrub through the generations</h1>
      {historic ? <FrontEnginedCar title={stop.title} /> : <img className="evo-car" src="/assets/car/car-side.jpg" alt={`${stop.title} side view`} />}
      <label className="year-slider">
        <span className="sr-only">Car generation, from the 1959 DBR4 to the 2026 AMR26</span>
        <input
          className="slider"
          type="range"
          min={0}
          max={stops.length - 1}
          value={index}
          aria-valuetext={`${stop.year} ${stop.title}`}
          onChange={(event) => select(stops[Number(event.target.value)].id)}
          onKeyDown={(event) => {
            if (event.key === "Home") {
              event.preventDefault()
              select(stops[0].id)
            }
            if (event.key === "End") {
              event.preventDefault()
              select(stops[stops.length - 1].id)
            }
          }}
        />
      </label>
      <div className="year-row">
        {stops.map((item) => (
          <button key={item.id} className={item.id === stop.id ? "chip active" : "chip"} type="button" onClick={() => select(item.id)}>
            {item.year}
          </button>
        ))}
      </div>
      <section className="grid-2">
        <article className="panel">
          <h2>{stop.year} {stop.title}</h2>
          <p>{stop.body}</p>
        </article>
        {stop.metric_ids.length > 0 ? (
          <article className="panel">
            <p className="lime">{stop.year} record</p>
            {stop.metric_ids.map((id) => <MetricCard key={id} id={id} />)}
          </article>
        ) : null}
      </section>
      <button className="btn" type="button" style={{ marginTop: 16 }} onClick={() => navigate("/car")}>Back to the component explorer</button>
    </>
  )
}

function FrontEnginedCar({ title }: { title: string }) {
  return (
    <svg className="evo-car" viewBox="0 0 900 260" role="img" aria-label={`${title}, front-engined Formula 1 car`}>
      <rect width="900" height="260" fill="#000" />
      <path d="M120 168 H250 L310 120 H430 L470 168 H700 L760 140 H820 L790 190 H150 Z" fill="#0c2420" stroke="#cedc00" />
      <circle cx="250" cy="188" r="36" fill="#111" stroke="#fff" />
      <circle cx="680" cy="188" r="36" fill="#111" stroke="#fff" />
      <path d="M300 150 H390" stroke="#fff" />
    </svg>
  )
}
