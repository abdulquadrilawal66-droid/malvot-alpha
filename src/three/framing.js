import * as THREE from 'three'

/**
 * HERO FRAMING — single source of truth for how the protected wolf artwork,
 * the rear insignia and the platform are composed on screen.
 *
 * The camera is FIT to the free screen area left between the HTML UI
 * (nav bar above, protocol strip below, slogan / info columns either side),
 * so the wolf is never hidden under the nav and the platform never runs into the strip,
 * whatever the viewport.
 */
export const PLATFORM_Z = -46
export const PLATFORM_TOP = 0.75
export const WOLF_Z = PLATFORM_Z + 0.15

// Protected artwork geometry (measured from the supplied 1122×1402 file).
export const WOLF_ART = { w: 1122, h: 1402, top: 12, bottom: 1358, left: 51, right: 1042 }
/** Visible character height in world metres (ear tips → paws). */
export const WOLF_H = 4.3
const WOLF_VIS_H = WOLF_ART.bottom - WOLF_ART.top
/** Half width of the visible character in metres (aspect ratio preserved). */
export const WOLF_HALF_W = (((WOLF_ART.right - WOLF_ART.left) / WOLF_VIS_H) * WOLF_H) / 2

export const INSIGNIA_Z = -48.8
export const INSIGNIA_SCALE = 0.96
export const INSIGNIA_BASE_Y = 0.75

/**
 * Live layout measured from the DOM by the Hero (pixels, relative to the 3D stage).
 * top/bottom: reserved bands; halfW: half-width of the free centre column.
 */
export const layout = { top: 96, bottom: 100, halfW: 300, width: 1440, height: 900, version: 0 }

/** Narrow stages (stacked mobile/tablet layout) get a slimmer platform footprint. */
export const isNarrow = (w, h) => w / Math.max(1, h) < 1.2
export const platformSX = (narrow) => (narrow ? 1.12 : 1.5)

// Camera looks along this direction (from target toward camera): a gentle
// downward tilt and a slight three-quarter offset to reveal room depth.
// The wolf is a front-facing presentation layer, so it never shows an edge.
const DIR = new THREE.Vector3(0.06, 0.085, 1).normalize()
const tmpCam = new THREE.PerspectiveCamera()
const v = new THREE.Vector3()

const TOP_POINTS = [
  new THREE.Vector3(0, PLATFORM_TOP + WOLF_H, WOLF_Z),
  new THREE.Vector3(0, INSIGNIA_BASE_Y + 5.6 * INSIGNIA_SCALE, INSIGNIA_Z + 0.6),
]
const BOTTOM_POINTS = [
  new THREE.Vector3(-2.3, -0.02, PLATFORM_Z + 2.2), // plaque front bottom corners
  new THREE.Vector3(2.3, -0.02, PLATFORM_Z + 2.2),
]
const WOLF_SIDE = [
  new THREE.Vector3(-WOLF_HALF_W, PLATFORM_TOP + WOLF_H * 0.55, WOLF_Z),
  new THREE.Vector3(WOLF_HALF_W, PLATFORM_TOP + WOLF_H * 0.55, WOLF_Z),
]
const PLATFORM_SIDE = [new THREE.Vector3(), new THREE.Vector3()]

const cache = { key: '', pose: null }

/** Fit the hero camera to the measured safe area. Returns { pos, look }. */
export function fitHero(fovDeg) {
  const { top, bottom, halfW, width, height, version } = layout
  const key = `${version}|${width}|${height}|${fovDeg}`
  if (cache.key === key) return cache.pose

  const aspect = width / Math.max(1, height)
  tmpCam.fov = fovDeg
  tmpCam.aspect = aspect
  tmpCam.near = 0.1
  tmpCam.far = 200
  tmpCam.updateProjectionMatrix()

  const yTopWanted = 1 - (2 * top) / height
  const yBotWanted = -1 + (2 * bottom) / height
  const xWolfWanted = Math.min(0.98, (2 * halfW) / width)
  const narrow = isNarrow(width, height)
  const halfPlat = 2.95 * platformSX(narrow)
  PLATFORM_SIDE[0].set(-halfPlat, 0.2, PLATFORM_Z)
  PLATFORM_SIDE[1].set(halfPlat, 0.2, PLATFORM_Z)

  const look = new THREE.Vector3(0, 2.6, PLATFORM_Z)
  let d = 12
  const pos = new THREE.Vector3()
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(fovDeg / 2))

  for (let i = 0; i < 10; i++) {
    pos.copy(look).addScaledVector(DIR, d)
    tmpCam.position.copy(pos)
    tmpCam.lookAt(look)
    tmpCam.updateMatrixWorld()
    const ndc = (p) => v.copy(p).project(tmpCam)
    const yTop = Math.max(...TOP_POINTS.map((p) => ndc(p).y))
    const yBot = Math.min(...BOTTOM_POINTS.map((p) => ndc(p).y))
    const xWolf = Math.max(...WOLF_SIDE.map((p) => Math.abs(ndc(p).x)))
    const xPlat = narrow ? Math.max(...PLATFORM_SIDE.map((p) => Math.abs(ndc(p).x))) : 0

    const s = Math.max((yTop - yBot) / (yTopWanted - yBotWanted), xWolf / xWolfWanted, xPlat / 0.97)
    d *= s
    // centre the content block inside the free band
    const off = (yTop + yBot) / 2 - (yTopWanted + yBotWanted) / 2
    look.y += off * d * tanHalf * 0.9
  }
  pos.copy(look).addScaledVector(DIR, d)
  cache.key = key
  cache.pose = { pos: pos.clone(), look: look.clone() }
  return cache.pose
}
