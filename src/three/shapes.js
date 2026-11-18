import * as THREE from 'three'

/**
 * Alpha insignia outline (right half, mirrored). Two ear-peaks, a centre notch,
 * swept side wings, converging to a lower point — matches the approved Hero reference.
 * Units: metres, origin at bottom-centre.
 */
const RIGHT_HALF = [
  [0, 4.75],
  [1.7, 5.6],
  [2.05, 4.0],
  [2.95, 3.15],
  [2.15, 2.45],
  [1.7, 1.0],
  [0, 0.4],
]

function mirrored(pts) {
  const right = pts.map(([x, y]) => new THREE.Vector2(x, y))
  const left = pts
    .slice(1, -1)
    .reverse()
    .map(([x, y]) => new THREE.Vector2(-x, y))
  return [...right, ...left]
}

export function insigniaOutline(scale = 1, inset = 0, center = new THREE.Vector2(0, 3.0)) {
  return mirrored(RIGHT_HALF).map((p) => {
    const v = p.clone().multiplyScalar(scale)
    if (inset) v.lerp(center.clone().multiplyScalar(scale), inset)
    return v
  })
}

/** Frame (outer outline minus scaled inner outline). */
export function insigniaFrameShape(inset = 0.2) {
  const shape = new THREE.Shape(insigniaOutline(1))
  const hole = new THREE.Path(insigniaOutline(1, inset).reverse())
  shape.holes.push(hole)
  return shape
}

/** Draw a crisp label into a canvas texture (uses loaded web fonts). */
export function labelTexture(text, { width = 1024, height = 96, font = '600 46px Oxanium', color = '#F4F6F7', letterSpacing = 14, decor = true } = {}) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const g = c.getContext('2d')
  g.clearRect(0, 0, width, height)
  g.font = font
  g.fillStyle = color
  g.textBaseline = 'middle'
  if ('letterSpacing' in g) g.letterSpacing = `${letterSpacing}px`
  const w = g.measureText(text).width
  g.fillText(text, (width - w) / 2, height / 2 + 2)
  if (decor) {
    g.fillStyle = '#E8AE42'
    const slash = (x) => {
      g.save()
      g.translate(x, height / 2)
      g.transform(1, 0, -0.45, 1, 0, 0)
      g.fillRect(-3, -16, 6, 32)
      g.fillRect(9, -16, 6, 32)
      g.fillRect(21, -16, 6, 32)
      g.restore()
    }
    slash((width - w) / 2 - 70)
    slash((width + w) / 2 + 40)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Subtle metal floor-panel texture (procedural, ~tiny memory). */
export function floorPanelTexture() {
  const s = 512
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')
  g.fillStyle = '#0a1419'
  g.fillRect(0, 0, s, s)
  // brushed noise
  for (let i = 0; i < 2200; i++) {
    const y = Math.random() * s
    g.fillStyle = `rgba(${120 + Math.random() * 60},${150 + Math.random() * 40},${160},${Math.random() * 0.035})`
    g.fillRect(0, y, s, 1)
  }
  g.strokeStyle = 'rgba(0,0,0,0.85)'
  g.lineWidth = 6
  g.strokeRect(0, 0, s, s)
  g.strokeStyle = 'rgba(120,170,185,0.10)'
  g.lineWidth = 2
  g.strokeRect(5, 5, s - 10, s - 10)
  g.beginPath()
  g.moveTo(s / 2, 0)
  g.lineTo(s / 2, s)
  g.strokeStyle = 'rgba(0,0,0,0.6)'
  g.lineWidth = 3
  g.stroke()
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Soft radial glow (for under-platform illumination). */
export function radialGlowTexture(inner = 'rgba(0,229,242,0.55)') {
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(s / 2, s / 2, s * 0.12, s / 2, s / 2, s / 2)
  grd.addColorStop(0, inner)
  grd.addColorStop(0.5, 'rgba(0,229,242,0.14)')
  grd.addColorStop(1, 'rgba(0,229,242,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, s, s)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
