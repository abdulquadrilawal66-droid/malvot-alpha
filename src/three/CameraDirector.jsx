import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { live, useDirector } from '../state/director'
import { PLATFORM_Z } from './rooms/CommandDeck'

/**
 * ONE camera director for the whole headquarters.
 * Nothing else in the app is allowed to move the camera.
 *
 *  - Intro: time-based choreography (INTRO_EXTERIOR → INTRO_CORRIDOR → HERO_REVEAL)
 *  - Destinations: short eased transitions between registered camera states
 *  - HERO_IDLE: restrained pointer parallax (disabled for reduced motion)
 */

export const INTRO_DURATION = 7.4
const ramp = (t, a, b) => THREE.MathUtils.clamp((t - a) / (b - a), 0, 1)
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const easeOut = (x) => 1 - Math.pow(1 - x, 3)

const V = (x, y, z) => new THREE.Vector3(x, y, z)

/** Hero framing adapts to the canvas aspect so the platform + insignia always fit. */
export function heroPose(aspect, fovDeg) {
  const look = V(0, aspect < 1 ? 3.15 : 2.42, PLATFORM_Z)
  const dir = V(0, 0.062, 1).normalize()
  const requiredH = Math.max(7.1, (aspect < 1 ? 7.6 : 9.6) / aspect)
  const d = requiredH / (2 * Math.tan(THREE.MathUtils.degToRad(fovDeg / 2)))
  return { pos: look.clone().addScaledVector(dir, d), look }
}

/** Registered camera states (planned rooms stay null until built). */
export function cameraStates(aspect, fov) {
  const hero = heroPose(aspect, fov)
  return {
    INTRO_EXTERIOR: { pos: V(0, 3.0, 19), look: V(0, 4.3, 0) },
    INTRO_CORRIDOR: { pos: V(0, 2.1, -14), look: V(0, 2.1, -30) },
    HERO_REVEAL: { pos: hero.pos.clone().add(V(0, 0.25, 1.6)), look: hero.look.clone() },
    HERO_IDLE: hero,
    ABOUT_ARCHIVE: null,
    TOKEN_VAULT: null,
    ROADMAP_CORRIDOR: null,
    AI_CORE: null,
    TRANSPARENCY_CHAMBER: null,
    COMMUNITY_ASSEMBLY: null,
  }
}

export default function CameraDirector() {
  const { camera, size } = useThree()
  const phase = useDirector((s) => s.phase)
  const cameraState = useDirector((s) => s.cameraState)
  const introRun = useDirector((s) => s.introRun)
  const reducedMotion = useDirector((s) => s.reducedMotion)
  const freeCam = useDirector((s) => s.devFreeCam)

  const t = useRef(0)
  const pos = useRef(V(0, 3.0, 19))
  const look = useRef(V(0, 4.3, 0))
  const tween = useRef(null) // { fromPos, fromLook, key, dur, t }
  const parallax = useRef(V(0, 0, 0))
  const travel = useRef(null)

  const aspect = size.width / Math.max(1, size.height)

  // build the intro travel path once per aspect
  if (!travel.current || travel.current.aspect !== aspect) {
    const hero = heroPose(aspect, camera.fov)
    travel.current = {
      aspect,
      pos: new THREE.CatmullRomCurve3([V(0, 2.3, 9.2), V(0, 2.15, 3), V(0, 2.0, -6), V(0, 2.15, -18), V(0, 2.7, -28), hero.pos.clone()], false, 'centripetal'),
      look: new THREE.CatmullRomCurve3([V(0, 3.4, 0), V(0, 2.4, -8), V(0, 2.1, -20), V(0, 2.3, -34), V(0, 2.6, -44), hero.look.clone()], false, 'centripetal'),
    }
  }

  // start / replay intro
  useEffect(() => {
    if (phase !== 'intro') return
    t.current = 0
    tween.current = null
  }, [phase, introRun])

  // destination change or intro completion → short eased transition
  useEffect(() => {
    if (phase !== 'hero') return
    const fromIntro = t.current > 0 && t.current < INTRO_DURATION
    const first = t.current === 0 && !tween.current
    if (first) {
      // direct load (returning visitor / reduced motion): brief settle
      const s = cameraStates(aspect, camera.fov).HERO_REVEAL
      pos.current.copy(s.pos)
      look.current.copy(s.look)
    }
    tween.current = {
      fromPos: pos.current.clone(),
      fromLook: look.current.clone(),
      key: cameraState,
      dur: reducedMotion ? 0.001 : fromIntro ? 1.1 : first ? 1.6 : 1.0,
      t: 0,
    }
    t.current = INTRO_DURATION + 1
  }, [phase, cameraState]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, rawDt) => {
    if (freeCam) return
    const dt = Math.min(rawDt, 1 / 20)
    // intro runs on wall-clock time so it stays ~7s even on slow devices
    const introDt = Math.min(rawDt, 0.25)
    const store = useDirector.getState()

    if (phase === 'intro') {
      t.current += introDt
      const T = t.current
      live.seams = ramp(T, 0.2, 1.4)
      live.locks = ramp(T, 1.5, 2.5)
      live.doors = ramp(T, 2.3, 3.5)
      live.corridor = ramp(T, 3.0, 4.4)
      live.heroPower = ramp(T, 5.4, 6.6)
      live.insignia = ramp(T, 5.9, 7.0)
      store.setBeat(T < 1.4 ? 0 : T < 2.6 ? 1 : T < 3.7 ? 2 : T < 5.6 ? 3 : 4)

      const ext = cameraStates(aspect, camera.fov).INTRO_EXTERIOR
      if (T < 2.7) {
        const k = easeOut(T / 2.7)
        pos.current.lerpVectors(ext.pos, travel.current.pos.getPoint(0), k)
        look.current.lerpVectors(ext.look, travel.current.look.getPoint(0), k)
      } else {
        const u = easeInOut(ramp(T, 2.7, 6.7))
        travel.current.pos.getPoint(u, pos.current)
        travel.current.look.getPoint(u, look.current)
      }
      if (T >= INTRO_DURATION) store.completeIntro()
    } else if (tween.current) {
      const tw = tween.current
      const target = cameraStates(aspect, camera.fov)[tw.key] || cameraStates(aspect, camera.fov).HERO_IDLE
      tw.t = Math.min(1, tw.t + dt / tw.dur)
      const k = easeInOut(tw.t)
      pos.current.lerpVectors(tw.fromPos, target.pos, k)
      look.current.lerpVectors(tw.fromLook, target.look, k)
      if (tw.t >= 1) tween.current = null
    } else {
      // keep idle framing correct after resizes
      const target = cameraStates(aspect, camera.fov)[cameraState] || cameraStates(aspect, camera.fov).HERO_IDLE
      pos.current.lerp(target.pos, 1 - Math.exp(-dt * 6))
      look.current.lerp(target.look, 1 - Math.exp(-dt * 6))
    }

    // restrained parallax in idle only
    const idle = phase === 'hero' && !reducedMotion
    const tx = idle ? live.pointer.x * 0.28 : 0
    const ty = idle ? -live.pointer.y * 0.1 : 0
    parallax.current.x += (tx - parallax.current.x) * (1 - Math.exp(-dt * 3))
    parallax.current.y += (ty - parallax.current.y) * (1 - Math.exp(-dt * 3))

    camera.position.copy(pos.current).add(parallax.current)
    camera.lookAt(look.current)
  })

  return null
}
