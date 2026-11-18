import { Suspense, useEffect, useRef, lazy } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import CameraDirector from './CameraDirector'
import Entrance from './rooms/Entrance'
import Corridor from './rooms/Corridor'
import CommandDeck, { PLATFORM_Z, PLATFORM_TOP } from './rooms/CommandDeck'
import { MATS, setGlow } from './materials'
import { live, useDirector } from '../state/director'
import { domRefs } from '../ui/domRefs'
import { BRAND_ASSETS } from '../brand/assets'

const WOLF_FRAME = BRAND_ASSETS.officialWolfPrimary.frame

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

function Lights() {
  const deck = useRef()
  const spill = useRef()
  const key = useRef()
  const gold = useRef()
  useFrame(() => {
    const L = live.lightScale
    if (deck.current) deck.current.intensity = live.heroPower * (22 + live.hover * 14) * L
    if (spill.current) spill.current.intensity = live.doors * 30 * L
    if (key.current) key.current.intensity = (0.35 + live.heroPower * 1.6) * L * 60
    if (gold.current) gold.current.intensity = live.heroPower * 14 * L
  })
  return (
    <>
      <ambientLight intensity={0.22} color="#7fb8c8" />
      <hemisphereLight args={['#2a6c7a', '#05090b', 0.35]} />
      {/* exterior wash on the facade */}
      <spotLight position={[0, 12, 10]} angle={0.7} penumbra={0.9} intensity={160} distance={30} color="#9fdcea" target-position={[0, 3, 0]} />
      {/* cyan light spilling through the opening doors */}
      <pointLight ref={spill} position={[0, 3, -3]} color="#00E5F2" distance={14} decay={1.6} intensity={0} />
      {/* command deck */}
      <pointLight ref={deck} position={[0, 1.4, PLATFORM_Z + 1.2]} color="#00E5F2" distance={12} decay={1.6} />
      <pointLight ref={gold} position={[0, 4, PLATFORM_Z - 2.8]} color="#FFB443" distance={9} decay={1.8} />
      <spotLight ref={key} position={[0, 10, PLATFORM_Z + 7]} angle={0.55} penumbra={0.8} distance={30} color="#cfefff" target-position={[0, 1, PLATFORM_Z]} />
      {[-1, 1].map((s) => (
        <pointLight key={s} position={[s * 6, 3, PLATFORM_Z + 2]} color="#00C8D8" intensity={8} distance={9} decay={1.8} />
      ))}
      {/* back-wall wash so the chamber reads as a room, not a void */}
      {[-1, 1].map((s) => (
        <pointLight key={`b${s}`} position={[s * 6, 7, -52]} color="#2bb8c9" intensity={18} distance={14} decay={1.6} />
      ))}
      <pointLight position={[0, 9, -40]} color="#9fd8e6" intensity={10} distance={18} decay={1.5} />
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
    foot.set(0, PLATFORM_TOP - 0.02, PLATFORM_Z + 0.15).project(camera)
    head.set(0, PLATFORM_TOP + 4.85, PLATFORM_Z + 0.15).project(camera)
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
        gl.toneMappingExposure = 1.05
        scene.background = new THREE.Color('#03131B')
        scene.fog = new THREE.Fog('#03131B', 18, 46)
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
            <Bloom mipmapBlur intensity={0.5} luminanceThreshold={1.0} luminanceSmoothing={0.25} radius={0.62} />
            <Vignette offset={0.32} darkness={0.62} />
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
