import * as THREE from 'three'

/**
 * Shared material library — every room reuses these instances
 * (fewer shader programs, fewer state switches).
 * Glow materials are unlit + toneMapped:false so values > 1 feed the bloom pass.
 */
export const PALETTE = {
  bg: new THREE.Color('#03131B'),
  cyan: new THREE.Color('#00E5F2'),
  gold: new THREE.Color('#E8AE42'),
}

const glow = (hex) => {
  const m = new THREE.MeshBasicMaterial({ color: hex, toneMapped: false })
  m.userData.base = new THREE.Color(hex)
  return m
}

export const MATS = {
  steel: new THREE.MeshStandardMaterial({ color: '#16262d', metalness: 0.9, roughness: 0.36 }),
  steelDark: new THREE.MeshStandardMaterial({ color: '#0a161c', metalness: 0.8, roughness: 0.5 }),
  panel: new THREE.MeshStandardMaterial({ color: '#0c2029', metalness: 0.55, roughness: 0.6 }),
  brushed: new THREE.MeshStandardMaterial({ color: '#2a3a41', metalness: 0.95, roughness: 0.28 }),
  gold: new THREE.MeshStandardMaterial({ color: '#e0a23a', metalness: 0.85, roughness: 0.32, emissive: '#8a520e', emissiveIntensity: 0.6 }),
  insigniaMetal: new THREE.MeshStandardMaterial({ color: '#8a9aa0', metalness: 1, roughness: 0.3 }),

  // animated glow channels
  seamCyan: glow('#00E5F2'), // entrance seams
  deckCyan: glow('#00E5F2'), // command-deck strips + platform rings
  insigniaCyan: glow('#00E5F2'), // insignia edges
  goldGlow: glow('#FFB443'), // gold light strips
  corridorCyan: glow('#00E5F2'),
  // static, sub-bloom accents for architecture (never blooms across text)
  wallGlow: new THREE.MeshBasicMaterial({ color: '#1aa7b4', toneMapped: false }),
  wallGold: new THREE.MeshBasicMaterial({ color: '#b98a3a', toneMapped: false }),
  steelLight: new THREE.MeshStandardMaterial({ color: '#2b3f47', metalness: 0.85, roughness: 0.42 }),
  recess: new THREE.MeshStandardMaterial({ color: '#081820', metalness: 0.5, roughness: 0.7 }),
  holo: new THREE.MeshBasicMaterial({ color: '#00E5F2', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
}

/** Set a glow material's intensity (≥0; >1 blooms). */
export function setGlow(mat, level) {
  mat.color.copy(mat.userData.base).multiplyScalar(Math.max(0, level))
}

export function setWireframe(on) {
  Object.values(MATS).forEach((m) => (m.wireframe = on))
}
