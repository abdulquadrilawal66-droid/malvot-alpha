import { Suspense, useEffect, useRef, lazy } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import CameraDirector from './CameraDirector'
import Entrance from './rooms/Entrance'
import Corridor from './rooms/Corridor'
import CommandDeck from './rooms/CommandDeck'
import { PLATFORM_Z, PLATFORM_TOP, WOLF_H, WOLF_Z, WOLF_ART } from './framing'
import { MATS, setGlow } from './materials'
import { live, useDirector } from '../state/director'
import { domRefs } from '../ui/domRefs'
const WOLF_FRAME = { top: WOLF_ART.top / WOLF_ART.h, bottom: (WOLF_ART.h - WOLF_ART.bottom) / WOLF_ART.h }

const DevTools3D = import.meta.env.DEV ? lazy(() => import('../dev/DevTools3D')) : null

/** Drives every animated glow channel from the shared `live` values. */
function GlowDriver() {
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const L = live.lightScale
    live.hover += (live.hoverTarget - live.hover) * Math.min(1, dt * 6)
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.6)
    setGlow(MATS.seamCyan, (0.12 + live.seams * 1.35) * L)
    setGlow(MATS.corridorCyan, (0.1 + (live.corridor ?? 1) * 1.7) * L)
    setGlow(MATS.deckCyan, live.heroPower * (1.12 + 0.22 * pulse + live.hover * 0.9) * L)
    const sweep = Math.pow(Math.max(0, Math.sin(t * 0.7)), 10) * 0.9
    setGlow(MATS.insigniaCyan, live.insignia * (1.05 + sweep * 0.6 + live.hover * 0.9) * L)
    setGlow(MATS.goldGlow, live.heroPower * (1.15 + 0.22 * Math.sin(t * 0.9)) * L)
    MATS.gold.emissiveIntensity = 0.35 + live.heroPower * 0.45 + live.hover * 0.35
    MATS.holo.opacity = 0.06 + live.heroPower * (0.08 + live.hover * 0.1)
  })
  return null
}

/** SpotLight whose target is fixed once (target objects outside the scene never update otherwise). */
function Spot({ target, lightRef, ...props }) {
  const local = useRef()
  const ref = lightRef || local
  useEffect(() => {
    if (!ref.current) return
    ref.current.target.position.set(...target)
    ref.current.target.updateMatrixWorld()
  }, [ref, target])
  return <spotLight ref={ref} {...props} />
}

const T_FACADE = [0, 3.5, 0]
const T_DECK = [0, 1, PLATFORM_Z]
const T_GOLD = [0, 0.6, PLATFORM_Z + 0.8]

function Lights() {
  const deck = useRef()
  const spill = useRef()
  const key = useRef()
  const gold = useRef()
  const rim = useRef()
  const warm = useRef()
  useFrame(() => {
    const L = live.lightScale
    const P = live.heroPower
    if (deck.current) deck.current.intensity = P * (14 + live.hover * 10) * L
    if (spill.current) spill.current.intensity = live.doors * 30 * L
    if (key.current) key.current.intensity = (0.3 + P * 1.4) * L * 70
    if (gold.current) gold.current.intensity = P * 9 * L
    if (rim.current) rim.current.intensity = P * 26 * L
    if (warm.current) warm.current.intensity = P * 90 * L
  })
  return (
    <>
      <ambientLight intensity={0.28} color="#86c2d2" />
      <hemisphereLight args={['#3a8fa0', '#071016', 0.45]} />
      {/* exterior wash on the facade */}
      <Spot target={T_FACADE} position={[0, 12, 10]} angle={0.75} penumbra={0.9} intensity={160} distance={32} color="#9fdcea" />
      {/* cyan light spilling through the opening doors */}
      <pointLight ref={spill} position={[0, 3, -3]} color="#00E5F2" distance={14} decay={1.6} intensity={0} />

      {/* COMMAND DECK — cool key from above-front */}
      <Spot lightRef={key} target={T_DECK} position={[-2, 11, PLATFORM_Z + 8]} angle={0.5} penumbra={0.85} distance={32} color="#d6f3ff" />
      {/* warm gold accent raking across the platform from the right */}
      <Spot lightRef={warm} target={T_GOLD} position={[8, 5, PLATFORM_Z + 3]} angle={0.42} penumbra={1} distance={20} color="#ffb24a" />
      {/* cyan rim from behind the insignia: separates layers */}
      <pointLight ref={rim} position={[0, 4.5, PLATFORM_Z - 5]} color="#19d9e8" distance={13} decay={1.7} />
      {/* soft cyan uplight from the platform ring */}
      <pointLight ref={deck} position={[0, 1.3, PLATFORM_Z + 1.4]} color="#00E5F2" distance={8} decay={1.8} />
      <pointLight ref={gold} position={[0, 3.6, PLATFORM_Z - 2.6]} color="#FFB443" distance={7} decay={1.8} />
      {/* background wash so the far wall reads as architecture */}
      {[-1, 1].map((s) => (
        <pointLight key={s} position={[s * 7, 7.5, -53]} color="#2aa9bb" intensity={16} distance={14} decay={1.6} />
      ))}
    </>
  )
}

/** Keeps the front-facing wolf presentation layer locked to the 3D platform. */
function WolfSync() {
  const { camera, size } = useThree()
  const foot = new THREE.Vector3()
  const head = new THREE.Vector3()
  useFrame(() => {
    const el = domRefs.wolf
    if (!el) return
    foot.set(0, PLATFORM_TOP - 0.01, WOLF_Z).project(camera)
    head.set(0, PLATFORM_TOP + WOLF_H, WOLF_Z).project(camera)
    const fx = (foot.x * 0.5 + 0.5) * size.width
    const fy = (-foot.y * 0.5 + 0.5) * size.height
    const hy = (-head.y * 0.5 + 0.5) * size.height
    el.style.setProperty('--wx', `${fx.toFixed(1)}px`)
    // the visible character spans head→foot; extend the box by the file's transparent margins
    const visible = Math.max(0, fy - hy)
    const total = visible / (1 - WOLF_FRAME.top - WOLF_FRAME.bottom)
    el.style.setProperty('--wy', `${(hy - WOLF_FRAME.top * total).toFixed(1)}px`)
    el.style.setProperty('--wh', `${total.toFixed(1)}px`)
    el.style.opacity = THREE.MathUtils.smoothstep(live.heroPower, 0.35, 1).toFixed(3)
  })
  return null
}

function Ready() {
  const setSceneReady = useDirector((s) => s.setSceneReady)
  useEffect(() => {
    let a = requestAnimationFrame(() => (a = requestAnimationFrame(setSceneReady)))
    return () => cancelAnimationFrame(a)
  }, [setSceneReady])
  return null
}

function PointerTracker() {
  useEffect(() => {
    const onMove = (e) => {
      live.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      live.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return null
}

export default function Experience({ active = true }) {
  const quality = useDirector((s) => s.quality)
  const setQuality = useDirector((s) => s.setQuality)
  return (
    <Canvas
      className="hq-canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={quality === 'high' ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 44, near: 0.1, far: 120, position: [0, 2.4, 12.5] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.12
        scene.background = new THREE.Color('#03131B')
        scene.fog = new THREE.Fog('#05202a', 20, 52)
      }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setQuality('low')} flipflops={2} />
      <AdaptiveDpr pixelated={false} />
      <PointerTracker />
      <Suspense fallback={null}>
        <CameraDirector />
        <GlowDriver />
        <Lights />
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={2.2} color="#bfefff" position={[0, 6, -2]} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={1.4} color="#00E5F2" position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#FFB443" position={[6, 2, 0]} rotation-y={-Math.PI / 2} scale={[8, 1, 1]} />
          <Lightformer form="ring" intensity={0.8} color="#00E5F2" position={[0, 2, 6]} scale={3} />
        </Environment>
        <Entrance />
        <Corridor />
        <CommandDeck />
        <WolfSync />
        <Ready />
        {quality === 'high' && (
          <EffectComposer multisampling={0} disableNormalPass>
            <Bloom mipmapBlur intensity={0.32} luminanceThreshold={1.05} luminanceSmoothing={0.3} radius={0.55} />
            <Vignette offset={0.35} darkness={0.5} />
          </EffectComposer>
        )}
        {DevTools3D && (
          <Suspense fallback={null}>
            <DevTools3D />
          </Suspense>
        )}
      </Suspense>
    </Canvas>
  )
}
