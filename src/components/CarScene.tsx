import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { gsap } from "gsap"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import { useDemo } from "../lib/store.ts"

type Shot = { position: [number, number, number]; target: [number, number, number]; fov?: number; minDistance?: number }

// Positions are in metres after the source model is scaled to 6.3 m long.
// The source GLB is grouped by material, so component focus uses composition and light.
const shots: Record<string, Shot> = {
  overview: { position: [2.3, 4.6, 8.6], target: [0, 0.65, 0.4], fov: 31, minDistance: 12 },
  active_aero: { position: [3.7, 2.5, 5.2], target: [0, 0.35, 2.65], fov: 36 },
  tires: { position: [3.25, 1.65, 3.75], target: [1.05, 0.55, 1.95], fov: 35 },
  brakes: { position: [3.0, 1.8, 3.65], target: [1.05, 0.55, 1.95], fov: 34 },
  suspension: { position: [3.5, 2.15, 3.85], target: [0.7, 0.55, 1.8], fov: 36 },
  chassis: { position: [3.45, 2.85, 2.5], target: [0, 0.8, 0.55], fov: 37 },
  fuel_system: { position: [3.7, 3.0, 1.2], target: [0, 0.8, -0.2], fov: 35 },
  cooling: { position: [3.3, 2.15, -0.3], target: [0.65, 0.75, -0.55], fov: 35 },
  energy_recovery: { position: [3.5, 2.7, -1.0], target: [0, 0.8, -0.9], fov: 36 },
  power_unit: { position: [3.8, 2.75, -1.45], target: [0, 0.85, -1.3], fov: 37 },
  gearbox: { position: [3.15, 2.25, -3.5], target: [0, 0.55, -2.2], fov: 36 },
  // Keep the diffuser as the focal point while leaving enough room to read the
  // car's full silhouette in the narrow stage beside the information panel.
  floor_diffuser: { position: [1.1, 0.65, -7.5], target: [0, 0.2, -2.75], fov: 36, minDistance: 8.8 },
}

type FocusPoint = [number, number, number]
type Controller = { setView: (id: string, immediate: boolean, point?: FocusPoint) => void }
type Move = {
  progress: number
  from: THREE.Vector3
  to: THREE.Vector3
  fromTarget: THREE.Vector3
  toTarget: THREE.Vector3
  fromOffset: THREE.Vector3
  toOffset: THREE.Vector3
  fromFov: number
  toFov: number
}

const vector = (values: [number, number, number]) => new THREE.Vector3(...values)

const partMarkers: { key: string; id: string; label: string; point: FocusPoint }[] = [
  { key: "active-aero", id: "active_aero", label: "Active aero", point: [0, 0.24, 2.95] },
  { key: "tires", id: "tires", label: "Tires / wheels", point: [1.16, 0.55, 1.88] },
  { key: "brakes", id: "brakes", label: "Brakes", point: [-0.92, 0.52, -1.88] },
  { key: "suspension", id: "suspension", label: "Suspension", point: [0.82, 0.88, 1.22] },
  { key: "chassis", id: "chassis", label: "Chassis", point: [0, 0.72, 0.55] },
  { key: "fuel-system", id: "fuel_system", label: "Fuel system", point: [0, 1.05, -0.28] },
  { key: "cooling", id: "cooling", label: "Cooling / sidepods", point: [0.98, 0.7, -0.62] },
  { key: "energy-recovery", id: "energy_recovery", label: "Energy recovery", point: [0, 0.72, -1.02] },
  { key: "power-unit", id: "power_unit", label: "Power unit", point: [0, 0.9, -1.48] },
  { key: "gearbox", id: "gearbox", label: "Gearbox", point: [0, 0.52, -2.18] },
  { key: "floor-diffuser", id: "floor_diffuser", label: "Floor & diffuser", point: [0, 0.15, -2.82] },
]
const markerVectors = new Map(partMarkers.map((marker) => [marker.key, vector(marker.point)]))

export function CarScene({ activeId, focusPoint, onPick }: {
  activeId?: string
  focusPoint?: FocusPoint
  onPick: (id: string, point: FocusPoint) => void
}) {
  const mount = useRef<HTMLDivElement>(null)
  const markerRefs = useRef(new Map<string, HTMLButtonElement>())
  const onPickRef = useRef(onPick)
  const controller = useRef<Controller | null>(null)
  const active = useRef(activeId)
  const reduced = useDemo((store) => store.state.reducedMotion)
  const [status, setStatus] = useState("Loading AMR23 model…")
  const [failed, setFailed] = useState(false)

  useEffect(() => { onPickRef.current = onPick }, [onPick])

  useEffect(() => {
    const host = mount.current
    if (!host) return
    const scene = new THREE.Scene()
    // Let the site artwork show through the WebGL canvas around the car.
    scene.background = null
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80)
    const look = vector(shots.overview.target)
    camera.position.copy(vector(shots.overview.position))
    camera.lookAt(look)
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
    } catch {
      requestAnimationFrame(() => setFailed(true))
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))
    renderer.setClearColor(0x000000, 0)
    renderer.setClearAlpha(0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(renderer.domElement)

    const environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = environment
    scene.add(new THREE.HemisphereLight("#d4f7e8", "#102321", 1.5))
    const key = new THREE.DirectionalLight("#f0fff8", 2.8)
    key.position.set(4, 9, 6)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.left = -6
    key.shadow.camera.right = 6
    key.shadow.camera.top = 6
    key.shadow.camera.bottom = -6
    scene.add(key)
    const rim = new THREE.DirectionalLight("#74c7b7", 1.5)
    rim.position.set(-5, 5, -5)
    scene.add(rim)
    const focus = new THREE.PointLight("#c9ebd8", 0, 7, 2)
    scene.add(focus)

    let move: Move | null = null
    let cameraTween: gsap.core.Tween | null = null
    let focusTimeline: gsap.core.Timeline | null = null
    let disposed = false
    let frame = 0
    const setView = (id: string, immediate: boolean, point?: FocusPoint) => {
      const shot = shots[id] ?? shots.overview
      const target = point ? vector(point) : vector(shot.target)
      const origin = vector(shot.target)
      const direction = vector(shot.position).sub(origin).normalize()
      const minDistance = shot.minDistance ?? 8.5
      const distance = point ? minDistance : Math.max(minDistance, vector(shot.position).distanceTo(origin))
      const destination = target.clone().addScaledVector(direction, distance)
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize()
      // Bias the whole car toward the left-side viewing lane so it stays clear
      // of the detail panel in the split-screen explorer.
      const frameBias = id === "overview" ? 0.2 : id === "floor_diffuser" ? 0.15 : id === "active_aero" ? 2.4 : 1.4
      const frameOffset = right.multiplyScalar(frameBias)
      target.add(frameOffset)
      destination.add(frameOffset)
      cameraTween?.kill()
      focusTimeline?.kill()
      if (immediate) {
        cameraTween = null
        move = null
        camera.position.copy(destination)
        look.copy(target)
        camera.fov = shot.fov ?? 38
        camera.updateProjectionMatrix()
        focus.position.set(target.x - frameOffset.x, target.y - frameOffset.y + 1.2, target.z - frameOffset.z)
        focus.intensity = id === "overview" ? 0 : 1.7
      } else {
        move = {
          progress: 0,
          from: camera.position.clone(),
          to: destination,
          fromTarget: look.clone(),
          toTarget: target,
          fromOffset: camera.position.clone().sub(look),
          toOffset: destination.clone().sub(target),
          fromFov: camera.fov,
          toFov: shot.fov ?? 38,
        }
        const transition = move
        cameraTween = gsap.to(transition, {
          progress: 1,
          duration: 1.8,
          ease: "sine.inOut",
          onComplete: () => {
            if (move === transition) move = null
            cameraTween = null
          },
        })
      }
      if (!immediate) {
        focusTimeline = gsap.timeline({ defaults: { ease: "power2.inOut" } })
        focusTimeline
          .to(focus.position, { x: target.x - frameOffset.x, y: target.y - frameOffset.y + 1.2, z: target.z - frameOffset.z, duration: 1.2 }, 0)
          .to(focus, { intensity: id === "overview" ? 0 : 1.7, duration: 0.9, ease: "sine.inOut" }, 0)
      }
    }
    controller.current = { setView }
    setView(active.current ?? "overview", true)

    const resize = () => {
      const width = Math.max(1, host.clientWidth)
      const height = Math.max(1, host.clientHeight)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    const render = () => {
      if (disposed) return
      if (move) {
        const t = move.progress
        // Keep the camera's orbit relative to the moving focus point, not world origin.
        const fromAngle = Math.atan2(move.fromOffset.z, move.fromOffset.x)
        const toAngle = Math.atan2(move.toOffset.z, move.toOffset.x)
        let turn = toAngle - fromAngle
        if (turn > Math.PI) turn -= Math.PI * 2
        if (turn < -Math.PI) turn += Math.PI * 2
        const angle = fromAngle + turn * t
        const fromRadius = Math.hypot(move.fromOffset.x, move.fromOffset.z)
        const toRadius = Math.hypot(move.toOffset.x, move.toOffset.z)
        const radius = THREE.MathUtils.lerp(fromRadius, toRadius, t)
        look.lerpVectors(move.fromTarget, move.toTarget, t)
        camera.position.set(
          look.x + Math.cos(angle) * radius,
          look.y + THREE.MathUtils.lerp(move.fromOffset.y, move.toOffset.y, t) + Math.sin(Math.PI * t) * 0.12,
          look.z + Math.sin(angle) * radius,
        )
        camera.fov = THREE.MathUtils.lerp(move.fromFov, move.toFov, t)
        camera.updateProjectionMatrix()
      }
      camera.lookAt(look)
      // DOM hotspots use the same camera matrices as the WebGL draw below.
      // Refresh them here so their screen positions don't trail the car by a frame.
      camera.updateMatrixWorld(true)
      for (const marker of partMarkers) {
        const element = markerRefs.current.get(marker.key)
        if (!element) continue
        const projected = markerVectors.get(marker.key)!.set(...marker.point).project(camera)
        const x = (projected.x * 0.5 + 0.5) * host.clientWidth
        const y = (-projected.y * 0.5 + 0.5) * host.clientHeight
        const hidden = projected.z < -1 || projected.z > 1 || x < -20 || x > host.clientWidth + 20 || y < -20 || y > host.clientHeight + 20
        if (element.hidden !== hidden) element.hidden = hidden
        element.style.setProperty("--marker-position", `translate3d(${x}px, ${y}px, 0)`)
      }
      renderer.render(scene, camera)
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)

    let car: THREE.Group | null = null
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const pickPart = (event: PointerEvent) => {
      if (!car) return null
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      return raycaster.intersectObject(car, true)[0] ?? null
    }
    const componentAt = (point: THREE.Vector3) => {
      const side = Math.abs(point.x)
      if (point.y < 0.38 && point.z < -1.4) return "floor_diffuser"
      if (side > 0.85 && Math.abs(point.z) > 1.3) return "tires"
      if (point.z > 2.4) return "active_aero"
      if (point.z > 1.3) return "suspension"
      if (point.z < -2.55) return point.y < 0.75 ? "floor_diffuser" : "gearbox"
      if (point.z < -0.85) return point.y < 0.55 ? "energy_recovery" : "power_unit"
      if (side > 0.7) return "cooling"
      if (point.y < 0.52) return "chassis"
      if (point.y > 1.25) return "fuel_system"
      return "chassis"
    }
    const handlePick = (event: PointerEvent) => {
      const hit = pickPart(event)
      if (!hit) return
      const point = hit.point
      onPickRef.current(componentAt(point), [point.x, point.y, point.z])
    }
    const handlePointerMove = (event: PointerEvent) => {
      renderer.domElement.style.cursor = pickPart(event) ? "pointer" : "default"
    }
    renderer.domElement.addEventListener("click", handlePick)
    renderer.domElement.addEventListener("pointermove", handlePointerMove)

    const loader = new GLTFLoader()
    loader.load(
      "/assets/car/amr23.glb",
      (gltf) => {
        if (disposed) return
        car = gltf.scene
        const bounds = new THREE.Box3().setFromObject(car)
        const size = bounds.getSize(new THREE.Vector3())
        const center = bounds.getCenter(new THREE.Vector3())
        const scale = 6.3 / Math.max(size.x, size.z)
        car.scale.setScalar(scale)
        car.position.set(-center.x * scale, -bounds.min.y * scale + 0.04, -center.z * scale)
        car.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true
            object.receiveShadow = true
          }
        })
        scene.add(car)
        setStatus("")
      },
      (event) => {
        if (disposed || !event.total) return
        setStatus(`Loading AMR23 model · ${Math.min(100, Math.round(event.loaded / event.total * 100))}%`)
      },
      () => { if (!disposed) setFailed(true) },
    )

    return () => {
      disposed = true
      controller.current = null
      cameraTween?.kill()
      focusTimeline?.kill()
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.domElement.removeEventListener("click", handlePick)
      renderer.domElement.removeEventListener("pointermove", handlePointerMove)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose()
      })
      environment.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  useEffect(() => {
    active.current = activeId
    controller.current?.setView(activeId ?? "overview", reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches, focusPoint)
  }, [activeId, reduced, focusPoint])

  return (
    <div className="car-scene-shell">
      <div className="car-scene" ref={mount} role="application" aria-label={`Interactive three-dimensional AMR23 car. Click a part to explore it${activeId ? `, currently focused on ${activeId.replaceAll("_", " ")}` : ""}.`}>
        {partMarkers.map((marker) => (
          <button
            key={marker.key}
            ref={(element) => {
              if (element) markerRefs.current.set(marker.key, element)
              else markerRefs.current.delete(marker.key)
            }}
            className={activeId === marker.id ? "car-part-marker active" : "car-part-marker"}
            type="button"
            aria-label={`Focus ${marker.label}`}
            title={marker.label}
            onClick={() => onPick(marker.id, marker.point)}
          ><span>{marker.label}</span></button>
        ))}
      </div>
      {status && !failed ? <p className="car-scene-status" role="status">{status}</p> : null}
      {failed ? <div className="car-scene-fallback"><img src="/assets/car/car-top.jpg" alt="Top view of the car" /><p>3D model unavailable</p></div> : null}
      <p className="car-model-credit">AMR23 visual reference · <a href="https://sketchfab.com/3d-models/aston-martin-f1-amr23-2023-f6ba825a43b146a9b669934a4e1fd529" target="_blank" rel="noreferrer">3D model by Redgrund, CC BY 4.0</a></p>
    </div>
  )
}
