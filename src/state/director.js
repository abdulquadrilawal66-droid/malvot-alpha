import { create } from 'zustand'

/**
 * Mutable per-frame values read inside useFrame (no React re-renders).
 * Only the CameraDirector / IntroTimeline write to these.
 */
export const live = {
  seams: 0, // entrance seam power 0..1
  locks: 0, // lock rotation progress 0..1
  doors: 0, // door separation 0..1
  corridor: 0, // corridor lighting 0..1
  heroPower: 0, // command-deck lighting 0..1
  insignia: 0, // insignia edge illumination 0..1
  hover: 0, // eased display hover 0..1
  hoverTarget: 0,
  pointer: { x: 0, y: 0 },
  lightScale: 1, // dev panel light multiplier
}

const INTRO_KEY = 'malvot.intro.seen.v1'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const seenIntro = () => {
  try {
    return localStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}

/** UI-level state (things React needs to re-render for). */
export const useDirector = create((set, get) => ({
  // 'loading' → 'intro' → 'hero'
  phase: 'loading',
  introBeat: 0, // 0..5 for DOM overlay text
  introRun: 0, // increments each replay
  cameraState: 'INTRO_EXTERIOR',
  sceneReady: false,
  webglFailed: false,
  reducedMotion: prefersReducedMotion(),
  quality: 'high', // 'high' | 'low'
  devFreeCam: false,
  devWireframe: false,
  devHidden: {},

  setSceneReady: () => {
    if (get().sceneReady) return
    const skip = seenIntro() || get().reducedMotion || get().phase === 'hero'
    set({ sceneReady: true, phase: skip ? 'hero' : 'intro', cameraState: skip ? 'HERO_IDLE' : 'INTRO_EXTERIOR' })
    if (skip) finishLive()
  },
  /** Loading took too long: reveal the hero UI now, keep streaming the 3D. */
  forceHero: () => {
    if (get().phase !== 'loading') return
    finishLive()
    set({ phase: 'hero', cameraState: 'HERO_IDLE' })
  },
  setWebglFailed: () => set({ webglFailed: true, phase: 'hero', sceneReady: true }),
  setBeat: (b) => get().introBeat !== b && set({ introBeat: b }),
  completeIntro: () => {
    try {
      localStorage.setItem(INTRO_KEY, '1')
    } catch {}
    finishLive()
    set({ phase: 'hero', cameraState: 'HERO_IDLE', introBeat: 5 })
  },
  replayIntro: () => {
    if (get().webglFailed) return
    Object.assign(live, { seams: 0, locks: 0, doors: 0, corridor: 0, heroPower: 0, insignia: 0 })
    window.scrollTo({ top: 0, behavior: 'instant' })
    set((s) => ({ phase: 'intro', introBeat: 0, introRun: s.introRun + 1, cameraState: 'INTRO_EXTERIOR' }))
  },
  goToCamera: (cameraState) => set({ cameraState }),
  setQuality: (quality) => set({ quality }),
  setDev: (patch) => set(patch),
}))

function finishLive() {
  Object.assign(live, { seams: 1, locks: 1, doors: 1, corridor: 1, heroPower: 1, insignia: 1 })
}
