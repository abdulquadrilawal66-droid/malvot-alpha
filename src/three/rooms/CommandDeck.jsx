import { useMemo, useEffect, useState } from 'react'
import { Instances, Instance, MeshReflectorMaterial, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { MATS } from '../materials'
import { insigniaOutline, labelTexture, floorPanelTexture, radialGlowTexture } from '../shapes'
import { useDirector } from '../../state/director'
import { PLATFORM_Z, PLATFORM_TOP, INSIGNIA_Z, INSIGNIA_SCALE, INSIGNIA_BASE_Y, platformSX } from '../framing'

export { PLATFORM_Z, PLATFORM_TOP }

/**
 * The Alpha Command Deck chamber (z ≈ -34 … -58).
 * Layers: foreground floor inlays + platform · midground insignia + angled supports ·
 * background recessed wall bay, side-wall bays and layered ceiling.
 */

const BAYS = [-38, -42.5, -47, -51.5]

function ring(a, b) {
  const s = new THREE.Shape(insigniaOutline(1, a))
  s.holes.push(new THREE.Path(insigniaOutline(1, b).reverse()))
  return s
}

/** Rear Alpha insignia — simplified: one steel frame, one gold inlay, one cyan edge. */
function Insignia() {
  const geo = useMemo(
    () => ({
      body: new THREE.ExtrudeGeometry(ring(0, 0.22), { depth: 0.7, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2 }),
      back: new THREE.ExtrudeGeometry(ring(-0.03, 0.27), { depth: 0.25, bevelEnabled: false }),
      gold: new THREE.ExtrudeGeometry(ring(0.13, 0.155), { depth: 0.06, bevelEnabled: false }),
      edge: new THREE.ExtrudeGeometry(ring(-0.026, -0.012), { depth: 0.04, bevelEnabled: false }),
    }),
    [],
  )
  return (
    <group name="insignia" position={[0, INSIGNIA_BASE_Y, INSIGNIA_Z]} scale={INSIGNIA_SCALE}>
      <mesh geometry={geo.back} position-z={-0.4} material={MATS.steelDark} />
      <mesh geometry={geo.body} material={MATS.insigniaMetal} />
      <mesh geometry={geo.gold} position-z={0.78} material={MATS.gold} />
      <mesh geometry={geo.edge} position-z={0.74} material={MATS.insigniaCyan} />
      {/* support pylons tying the emblem to the floor */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.25, 0.25, -0.2]} rotation-z={s * 0.32} material={MATS.steel}>
          <boxGeometry args={[0.32, 1.4, 0.5]} />
        </mesh>
      ))}
    </group>
  )
}

function Plaque() {
  const [tex, setTex] = useState(null)
  useEffect(() => {
    let t
    const make = () => {
      t = labelTexture('THE ALPHA COMMAND DECK', { width: 1400, height: 120, font: '700 58px Rajdhani', letterSpacing: 20 })
      setTex(t)
    }
    document.fonts?.ready ? document.fonts.ready.then(make) : make()
    return () => t?.dispose()
  }, [])
  return (
    <group position={[0, 0.22, 2.0]} rotation-x={-0.2}>
      <mesh material={MATS.steelDark}>
        <boxGeometry args={[4.3, 0.44, 0.14]} />
      </mesh>
      {[0.225, -0.225].map((y) => (
        <mesh key={y} position={[0, y, 0.02]} material={MATS.gold}>
          <boxGeometry args={[4.36, 0.03, 0.16]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 2.17, 0, 0.02]} material={MATS.gold}>
          <boxGeometry args={[0.03, 0.48, 0.16]} />
        </mesh>
      ))}
      {tex && (
        <mesh position={[0, 0.04, 0.075]}>
          <planeGeometry args={[3.95, 0.34]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
      )}
      <mesh position={[0, -0.155, 0.075]} material={MATS.deckCyan}>
        <boxGeometry args={[1.3, 0.025, 0.01]} />
      </mesh>
    </group>
  )
}

function Platform() {
  const oct = (r, h) => <cylinderGeometry args={[r, r * 1.02, h, 8, 1, false, Math.PI / 8]} />
  const rim = (r, h) => <cylinderGeometry args={[r, r, h, 8, 1, true, Math.PI / 8]} />
  const glow = useMemo(() => radialGlowTexture(), [])
  const sx = platformSX(useDirector((s) => s.stageNarrow))
  const k = sx / 1.5 // corner fixtures follow the footprint
  return (
    <group name="platform" position={[0, 0, PLATFORM_Z]}>
      {/* subtle illumination pooling beneath the platform */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.006} scale={[1.6 * k, 1, 1]}>
        <planeGeometry args={[11, 8]} />
        <meshBasicMaterial map={glow} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <group scale={[sx, 1, 0.7]}>
        {/* recessed plinth: a dark shadow gap gives the platform lift */}
        <mesh position-y={0.04} material={MATS.recess}>{oct(2.75, 0.08)}</mesh>
        <mesh position-y={0.07} material={MATS.deckCyan}>{rim(2.78, 0.02)}</mesh>
        {/* tier 1 */}
        <mesh position-y={0.2} material={MATS.steel}>{oct(2.9, 0.24)}</mesh>
        <mesh position-y={0.335} material={MATS.gold}>{rim(2.905, 0.03)}</mesh>
        {/* tier 2 */}
        <mesh position-y={0.445} material={MATS.brushed}>{oct(2.4, 0.25)}</mesh>
        <mesh position-y={0.5} material={MATS.deckCyan}>{rim(2.42, 0.025)}</mesh>
        {/* tier 3 */}
        <mesh position-y={0.66} material={MATS.steelLight}>{oct(1.75, 0.18)}</mesh>
        <mesh position-y={0.74} material={MATS.gold}>{rim(1.755, 0.022)}</mesh>
        {/* holo stage + rings */}
        <mesh position-y={PLATFORM_TOP + 0.004} rotation-x={-Math.PI / 2} material={MATS.holo}>
          <circleGeometry args={[1.25, 48]} />
        </mesh>
        <mesh position-y={PLATFORM_TOP + 0.01} rotation-x={-Math.PI / 2} material={MATS.deckCyan}>
          <ringGeometry args={[1.22, 1.26, 64]} />
        </mesh>
        <mesh position-y={PLATFORM_TOP + 0.01} rotation-x={-Math.PI / 2} material={MATS.deckCyan}>
          <ringGeometry args={[0.72, 0.732, 64]} />
        </mesh>
      </group>

      <Instances material={MATS.deckCyan} limit={8}>
        <boxGeometry args={[0.6, 0.04, 0.02]} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Instance position={[s * 2.87 * k, 0.2, 1.34]} rotation-y={s * 0.56 * k} />
            <Instance position={[s * 4.04 * k, 0.2, 0]} rotation-y={Math.PI / 2} />
          </group>
        ))}
      </Instances>
      <Instances material={MATS.goldGlow} limit={8}>
        <boxGeometry args={[0.45, 0.03, 0.02]} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Instance position={[s * 2.37 * k, 0.46, 1.1]} rotation-y={s * 0.56 * k} />
            <Instance position={[s * 3.34 * k, 0.46, 0]} rotation-y={Math.PI / 2} />
          </group>
        ))}
      </Instances>
      <Plaque />
    </group>
  )
}

/** Side walls with recessed bays, pilasters and angled supports. */
function SideWalls() {
  return (
    <group name="sidewalls">
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 12.6, 6, -46]} rotation-y={(-s * Math.PI) / 2} material={MATS.recess}>
          <planeGeometry args={[24, 12]} />
        </mesh>
      ))}
      <Instances material={MATS.steel} limit={24}>
        <boxGeometry />
        {[-1, 1].map((s) => BAYS.map((z) => <Instance key={`${s}${z}`} position={[s * 11.9, 5, z]} scale={[1.0, 10, 0.7]} />))}
      </Instances>
      <Instances material={MATS.panel} limit={24}>
        <boxGeometry />
        {[-1, 1].map((s) => BAYS.map((z) => <Instance key={`${s}${z}`} position={[s * 12.3, 4.6, z - 2.25]} scale={[0.4, 6.8, 3.4]} />))}
      </Instances>
      <Instances material={MATS.steelLight} limit={16}>
        <boxGeometry />
        {[-1, 1].map((s) =>
          BAYS.map((z) => <Instance key={`${s}${z}`} position={[s * 10.9, 9.9, z]} rotation-z={s * 0.62} scale={[0.5, 3.2, 0.55]} />),
        )}
      </Instances>
      <Instances material={MATS.wallGlow} limit={16}>
        <boxGeometry />
        {[-1, 1].map((s) => BAYS.map((z) => <Instance key={`${s}${z}`} position={[s * 12.08, 1.0, z - 2.25]} scale={[0.04, 0.05, 3.0]} />))}
      </Instances>
      <Instances material={MATS.wallGold} limit={16}>
        <boxGeometry />
        {[-1, 1].map((s) => BAYS.map((z) => <Instance key={`${s}${z}`} position={[s * 11.38, 8.6, z]} scale={[0.04, 0.06, 0.5]} />))}
      </Instances>
    </group>
  )
}

/** Layered ceiling: transverse beams, a spine and an octagonal canopy echoing the platform. */
function Ceiling() {
  return (
    <group name="ceiling">
      <mesh position={[0, 12, -46]} rotation-x={Math.PI / 2} material={MATS.recess}>
        <planeGeometry args={[26, 24]} />
      </mesh>
      <Instances material={MATS.steel} limit={12}>
        <boxGeometry />
        {BAYS.map((z) => (
          <Instance key={z} position={[0, 11.2, z]} scale={[24, 0.6, 0.7]} />
        ))}
        <Instance position={[0, 11.5, -46]} scale={[1.2, 0.4, 22]} />
      </Instances>
      <group position={[0, 10.2, PLATFORM_Z]} scale={[1.5, 1, 0.75]}>
        <mesh material={MATS.steelLight}>
          <cylinderGeometry args={[3.4, 3.1, 0.35, 8, 1, true, Math.PI / 8]} />
        </mesh>
        <mesh position-y={-0.19} rotation-x={Math.PI / 2} material={MATS.wallGlow}>
          <ringGeometry args={[3.05, 3.12, 8, 1, Math.PI / 8]} />
        </mesh>
      </group>
    </group>
  )
}

/** Background: recessed central bay behind the insignia, flanking panels, angled supports. */
function BackWall() {
  return (
    <group name="backwall">
      <mesh position={[0, 6, -56]} material={MATS.panel}>
        <planeGeometry args={[30, 12]} />
      </mesh>
      <mesh position={[0, 5, -57.2]} material={MATS.recess}>
        <planeGeometry args={[9, 10]} />
      </mesh>
      <Instances material={MATS.steel} limit={8}>
        <boxGeometry />
        <Instance position={[-4.7, 5, -56.2]} scale={[0.6, 10, 2.2]} />
        <Instance position={[4.7, 5, -56.2]} scale={[0.6, 10, 2.2]} />
        <Instance position={[0, 10.2, -56.2]} scale={[10, 0.6, 2.2]} />
      </Instances>
      <Instances material={MATS.steelDark} limit={24}>
        <boxGeometry args={[2.1, 3.3, 0.24]} />
        {[-1, 1].map((s) =>
          [0, 1, 2].map((i) => [1.9, 5.4, 8.9].map((y) => <Instance key={`${s}${i}${y}`} position={[s * (6.3 + i * 2.3), y, -55.85]} />)),
        )}
      </Instances>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 9.4, 0, -51.5]} rotation-y={-s * 0.3}>
          <mesh position-y={4.6} material={MATS.steel}>
            <boxGeometry args={[1.3, 9.2, 1.2]} />
          </mesh>
          <mesh position={[s * -0.5, 1.15, 0.45]} rotation-z={s * 0.55} material={MATS.brushed}>
            <boxGeometry args={[0.8, 2.4, 0.5]} />
          </mesh>
          <mesh position={[0, 9.0, 0.62]} material={MATS.gold}>
            <boxGeometry args={[1.3, 0.16, 0.05]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.9, -57.1]} material={MATS.wallGold}>
        <boxGeometry args={[8.8, 0.03, 0.02]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 8, 6, -34]} material={MATS.panel}>
          <planeGeometry args={[10, 12]} />
        </mesh>
      ))}
    </group>
  )
}

/** Metallic floor: reflective panels, a plated ring round the platform, inlaid guide lines, contact shadow. */
function Floor() {
  const quality = useDirector((s) => s.quality)
  const map = useMemo(() => {
    const t = floorPanelTexture()
    t.repeat.set(9, 8)
    return t
  }, [])
  const spokes = useMemo(() => [...Array(8)].map((_, i) => (i / 8) * Math.PI * 2 + Math.PI / 8), [])
  return (
    <group name="floor">
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -46]}>
        <planeGeometry args={[26, 24]} />
        {quality === 'high' ? (
          <MeshReflectorMaterial
            map={map}
            resolution={512}
            blur={[400, 140]}
            mixBlur={1}
            mixStrength={3.2}
            mirror={0.45}
            depthScale={0.5}
            minDepthThreshold={0.3}
            maxDepthThreshold={1.2}
            roughness={0.8}
            metalness={0.55}
            color="#34474f"
          />
        ) : (
          <meshStandardMaterial map={map} color="#34474f" roughness={0.6} metalness={0.65} />
        )}
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, PLATFORM_Z]} scale={[1.5, 0.72, 1]} material={MATS.steelDark}>
        <ringGeometry args={[3.15, 3.9, 8, 1, Math.PI / 8]} />
      </mesh>
      <Instances material={MATS.wallGlow} limit={12}>
        <boxGeometry args={[0.035, 0.012, 1]} />
        {spokes.map((a) => (
          <Instance
            key={a}
            position={[Math.sin(a) * 4.9 * 1.5, 0.008, PLATFORM_Z + Math.cos(a) * 4.9 * 0.72]}
            rotation-y={Math.atan2(Math.sin(a) * 1.5, Math.cos(a) * 0.72)}
            scale={[1, 1, 1.6]}
          />
        ))}
      </Instances>
      <Instances material={MATS.goldGlow} limit={12}>
        <boxGeometry args={[0.5, 0.015, 0.05]} />
        {[-1, 1].map((s) => [0, 1].map((i) => <Instance key={`${s}${i}`} position={[s * (6.4 + i * 0.9), 0.008, -41.2 - i * 2]} rotation-y={s * 0.5} />))}
      </Instances>
      <ContactShadows position={[0, 0.012, PLATFORM_Z]} scale={[14, 9]} frames={1} resolution={256} blur={2.6} far={1.6} opacity={0.65} color="#000000" />
    </group>
  )
}

export default function CommandDeck() {
  return (
    <group name="room:commandDeck">
      <Floor />
      <SideWalls />
      <Ceiling />
      <BackWall />
      <Insignia />
      <Platform />
    </group>
  )
}
