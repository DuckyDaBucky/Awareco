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

export function EvolutionPage() {
  const replace = useDemo((store) => store.replace)
  const reduced = useDemo((store) => store.state.reducedMotion)
  const generation = useDemo((store) => store.state.generation)
  const initial = Math.max(0, eraStops.findIndex((stop) => stop.id === generation))
  const [position, setPosition] = useState(initial === -1 ? eraStops.length - 1 : initial)
  const navigate = useNavigate()
  const max = eraStops.length - 1
  const leftIndex = Math.min(max, Math.max(0, Math.floor(position)))
  const rightIndex = Math.min(max, leftIndex + 1)
  const mix = reduced ? (position - leftIndex < 0.5 ? 0 : 1) : position - leftIndex
  const left = eraStops[leftIndex]
  const right = eraStops[rightIndex]
  const shown = mix < 0.5 ? left : right
  const crossingGap = left.year === 1959 && right.year === 2021 && mix > 0.08 && mix < 0.92

  useEffect(() => {
    for (const stop of eraStops) {
      const image = new Image()
      image.src = stop.src
    }
  }, [])

  const snapTo = (target: number) => {
    const next = eraStops[target]
    if (!next || reduced) {
      setPosition(target)
      if (next) replace((current) => ({ ...current, generation: next.id }))
      return
    }
    const start = position
    const began = performance.now()
    const step = (now: number) => {
      const progress = Math.min(1, (now - began) / 240)
      const eased = 1 - (1 - progress) ** 3
      const value = start + (target - start) * eased
      setPosition(value)
      if (progress < 1) requestAnimationFrame(step)
      else replace((current) => ({ ...current, generation: next.id }))
    }
    requestAnimationFrame(step)
  }

  return (
    <>
      <p className="muted">The car · evolution</p>
      <h1>Scrub through the generations</h1>
      <div className="evo-stage">
        <img className="evo-layer" src={left.src} alt="" style={{ opacity: 1 - mix }} />
        <img className="evo-layer" src={right.src} alt={`${shown.year} ${shown.title}`} style={{ opacity: mix }} />
      </div>
      <div className="evo-slider">
        <div className="evo-track" aria-hidden="true">
          <span className="evo-gap" style={{ left: `${(0.5 / max) * 100}%`, width: `${(1 / max) * 40}%` }} />
        </div>
        <input
          className="evo-range"
          type="range"
          min={0}
          max={max}
          step={0.01}
          value={position}
          aria-valuetext={`${shown.year} ${shown.title}`}
          aria-label="Aston Martin Formula 1 cars, from the 1959 DBR4 to the 2026 AMR26"
          onChange={(event) => setPosition(Number(event.target.value))}
          onPointerUp={() => snapTo(Math.round(position))}
          onKeyDown={(event) => {
            const current = Math.round(position)
            if (event.key === "ArrowRight") {
              event.preventDefault()
              snapTo(Math.min(max, current + 1))
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault()
              snapTo(Math.max(0, current - 1))
            }
            if (event.key === "Home") {
              event.preventDefault()
              snapTo(0)
            }
            if (event.key === "End") {
              event.preventDefault()
              snapTo(max)
            }
          }}
        />
        <div className="evo-ticks" aria-hidden="true">
          {eraStops.map((stop, index) => (
            <span key={stop.id} style={{ left: `${(index / max) * 100}%` }}>{stop.year}</span>
          ))}
        </div>
        <p className="evo-year" aria-live="polite">{shown.year} {shown.title}</p>
      </div>
      <section className="grid-2">
        <article className="panel">
          <h2>{shown.year} {shown.title}</h2>
          <p>{shown.body}</p>
          {crossingGap ? <p>No Aston Martin Formula 1 car was raced from 1961 to 2020.</p> : null}
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
