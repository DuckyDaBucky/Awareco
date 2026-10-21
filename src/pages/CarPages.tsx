import { useEffect, useState } from "react"
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
        <Link className="btn sleek" to="/car/evolution">Explore generations</Link>
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

type EraStop = {
  id: string
  year: number
  title: string
  body: string
  src: string
  credit: string
  sourceUrl: string
  metric_ids: string[]
}

const FIRST = 1959
const LAST = 2026
const GAP = { from: 1961, to: 2020 }

const eraStops: EraStop[] = [
  {
    id: "1959",
    year: 1959,
    title: "DBR4",
    body: "Aston Martin’s first Formula 1 car. Front-engined, with a 2.5-litre straight-six.",
    src: "/assets/eras/1959-dbr4.jpg",
    credit: "David Merrett, CC BY 2.0, via Wikimedia Commons. Goodwood Revival, 2019.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:1959_Aston_Martin_DBR4_(48953615403).jpg",
    metric_ids: [],
  },
  {
    id: "2021",
    year: 2021,
    title: "AMR21",
    body: "The modern team’s return to the championship, with a Mercedes power unit.",
    src: "/assets/eras/2021-amr21.jpg",
    credit: "Lukas Raich, CC BY-SA 4.0, via Wikimedia Commons. Austrian Grand Prix, 2021.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:FIA_F1_Austria_2021_Nr._5_Vettel.jpg",
    metric_ids: [],
  },
  {
    id: "2022",
    year: 2022,
    title: "AMR22",
    body: "The first Aston Martin of the ground-effect regulations, still Mercedes-powered.",
    src: "/assets/eras/2022-amr22.jpg",
    credit: "Timfilbert, CC BY-SA 4.0, via Wikimedia Commons. British Grand Prix, 2022.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:AMR22_at_the_2022_British_Grand_Prix.jpg",
    metric_ids: [],
  },
  {
    id: "2023",
    year: 2023,
    title: "AMR23",
    body: "Mercedes-powered car for the 2023 championship.",
    src: "/assets/eras/2023-amr23.jpg",
    credit: "Lukas Raich, CC BY-SA 4.0, via Wikimedia Commons. Austrian Grand Prix, 2023.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:FIA_F1_Austria_2023_Nr._14_(1).jpg",
    metric_ids: [],
  },
  {
    id: "2024",
    year: 2024,
    title: "AMR24",
    body: "Mercedes-powered car for the 2024 championship.",
    src: "/assets/eras/2024-amr24.jpg",
    credit: "Jen Ross, CC BY 2.0, via Wikimedia Commons. British Grand Prix, 2024.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:2024_British_Grand_Prix,_Stroll_(1).jpg",
    metric_ids: [],
  },
  {
    id: "2025",
    year: 2025,
    title: "AMR25",
    body: handoff.car.timeline.stops[0].body,
    src: "/assets/eras/2025-amr25.jpg",
    credit: "Liauzh, CC BY-SA 4.0, via Wikimedia Commons. Japanese Grand Prix, 2025.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:2025_Japan_GP_-_Aston_Martin_-_Fernando_Alonso_-_FP1.jpg",
    metric_ids: handoff.car.timeline.stops[0].metric_ids,
  },
  {
    id: "2026",
    year: 2026,
    title: "AMR26",
    body: handoff.car.timeline.stops[1].body,
    src: "/assets/eras/2026-amr26.jpg",
    credit: "CC BY 4.0, via Wikimedia Commons. Belgian Grand Prix, 2026.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:F1_2026,_Aston_Martin_F1_Team,_Aston_Martin_AMR26,_Fernando_Alonso,_Spa_Francorchamps_(55425688703).jpg",
    metric_ids: handoff.car.timeline.stops[1].metric_ids,
  },
]

function nearestStop(year: number) {
  return eraStops.reduce((best, stop) =>
    Math.abs(stop.year - year) < Math.abs(best.year - year) ? stop : best,
  )
}

export function EvolutionPage() {
  const replace = useDemo((store) => store.replace)
  const reduced = useDemo((store) => store.state.reducedMotion)
  const generation = useDemo((store) => store.state.generation)
  const stored = eraStops.find((stop) => stop.id === generation) ?? eraStops[eraStops.length - 1]
  const [year, setYear] = useState(stored.year)
  const [shownId, setShownId] = useState(stored.id)
  const [previousId, setPreviousId] = useState(stored.id)
  const shown = eraStops.find((stop) => stop.id === shownId) ?? stored
  const previous = eraStops.find((stop) => stop.id === previousId) ?? shown
  const inGap = year >= GAP.from && year <= GAP.to
  const navigate = useNavigate()

  useEffect(() => {
    const next = nearestStop(year)
    if (next.id === shownId) return
    setPreviousId(shownId)
    setShownId(next.id)
  }, [year, shownId])

  useEffect(() => {
    const index = eraStops.findIndex((stop) => stop.id === shown.id)
    for (const neighbour of [eraStops[index - 1], eraStops[index + 1]]) {
      if (!neighbour) continue
      const image = new Image()
      image.src = neighbour.src
    }
  }, [shown.id])

  const commit = (nextYear: number) => {
    const next = nearestStop(nextYear)
    setYear(next.year)
    replace((current) => ({ ...current, generation: next.id }))
  }

  const gapLeft = ((GAP.from - FIRST) / (LAST - FIRST)) * 100
  const gapWidth = ((GAP.to - GAP.from) / (LAST - FIRST)) * 100

  return (
    <>
      <p className="muted">The car · evolution</p>
      <h1>Scrub through the generations</h1>
      <div className="evo-stage">
        <img className={reduced ? "evo-layer" : "evo-layer evo-under"} src={previous.src} alt="" />
        <img className="evo-layer" src={shown.src} alt={`${shown.year} ${shown.title}`} />
      </div>
      <div className="evo-slider">
        <div className="evo-track" aria-hidden="true">
          <span className="evo-gap" style={{ left: `${gapLeft}%`, width: `${gapWidth}%` }} />
        </div>
        <input
          className="evo-range"
          type="range"
          min={FIRST}
          max={LAST}
          step={1}
          value={year}
          aria-valuetext={`${shown.year} ${shown.title}`}
          aria-label="Car year, from the 1959 DBR4 to the 2026 AMR26"
          onChange={(event) => setYear(Number(event.target.value))}
          onPointerUp={() => commit(year)}
          onKeyUp={(event) => {
            if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) commit(year)
          }}
          onBlur={() => commit(year)}
        />
        <p className="evo-year" aria-live="polite">{shown.year}</p>
      </div>
      <section className="grid-2">
        <article className="panel">
          <h2>{shown.year} {shown.title}</h2>
          <p>{shown.body}</p>
          {inGap ? <p>No Aston Martin Formula 1 car was raced from 1961 to 2020. The photograph is the nearest car with a sourced picture.</p> : null}
          <p className="muted">Photograph: {shown.credit} <a href={shown.sourceUrl} target="_blank" rel="noreferrer">Source</a></p>
        </article>
        {shown.metric_ids.length > 0 ? (
          <article className="panel">
            <p className="lime">{shown.year} record</p>
            {shown.metric_ids.map((id) => <MetricCard key={id} id={id} />)}
          </article>
        ) : null}
      </section>
      <button className="btn sleek" type="button" style={{ marginTop: 16 }} onClick={() => navigate("/car")}>Back to the component explorer</button>
    </>
  )
}
