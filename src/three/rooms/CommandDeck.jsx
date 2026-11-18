import { useMemo, useEffect, useState } from 'react'
import { Instances, Instance, MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { MATS } from '../materials'
import { insigniaOutline, labelTexture, floorPanelTexture } from '../shapes'
import { useDirector } from '../../state/director'

/** The Alpha Command Deck chamber. Platform centred at (0, 0, PLATFORM_Z). */
export const PLATFORM_Z = -46
export const PLATFORM_TOP = 0.75
const INSIGNIA_Z = -48.6
const INSIGNIA_SCALE = 1.0

function ring(a, b) {
  const s = new THREE.Shape(insigniaOutline(1, a))
  s.holes.push(new THREE.Path(insigniaOutline(1, b).reverse()))
  return s
}

function Insignia() {
  const geo = useMemo(() => {
    const bevel = { bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2 }
    return {
      body: new THREE.ExtrudeGeometry(ring(0, 0.26), { depth: 0.55, ...bevel }),
      back: new THREE.ExtrudeGeometry(ring(-0.02, 0.3), { depth: 0.2, bevelEnabled: false }),
      gold: new THREE.ExtrudeGeometry(ring(0.15, 0.185), { depth: 0.08, bevelEnabled: false }),
      edge: new THREE.ExtrudeGeometry(ring(-0.028, -0.012), { depth: 0.04, bevelEnabled: false }),
      inner: new THREE.ExtrudeGeometry(ring(0.255, 0.27), { depth: 0.04, bevelEnabled: false }),
    }
  }, [])
  return (
    <group name="insignia" position={[0, 0.75, INSIGNIA_Z]} scale={INSIGNIA_SCALE}>
      <mesh geometry={geo.back} position-z={-0.25} material={MATS.steelDark} />
      <mesh geometry={geo.body} material={MATS.insigniaMetal} />
      <mesh geometry={geo.gold} position-z={0.62} material={MATS.gold} />
      <mesh geometry={geo.edge} position-z={0.58} material={MATS.insigniaCyan} />
      <mesh geometry={geo.inner} position-z={0.6} material={MATS.insigniaCyan} />
    </group>
  )
}

function Plaque() {
  const [tex, setTex] = useState(null)
  useEffect(() => {
    let t
    const make = () => {
      t = labelTexture('THE ALPHA COMMAND DECK', { width: 1400, height: 120, font: '600 54px Oxanium', letterSpacing: 18 })
      setTex(t)
    }
    document.fonts?.ready ? document.fonts.ready.then(make) : make()
    return () => t?.dispose()
  }, [])
  return (
    <group position={[0, 0.22, 2.02]} rotation-x={-0.18}>
      <mesh material={MATS.steelDark}>
        <boxGeometry args={[4.6, 0.46, 0.14]} />
      </mesh>
      {/* gold frame */}
      <mesh position={[0, 0.235, 0.02]} material={MATS.gold}>
        <boxGeometry args={[4.66, 0.035, 0.16]} />
      </mesh>
      <mesh position={[0, -0.235, 0.02]} material={MATS.gold}>
        <boxGeometry args={[4.66, 0.035, 0.16]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 2.32, 0, 0.02]} material={MATS.gold}>
          <boxGeometry args={[0.035, 0.5, 0.16]} />
        </mesh>
      ))}
      {tex && (
        <mesh position={[0, 0.045, 0.075]}>
          <planeGeometry args={[4.2, 0.36]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
      )}
      <mesh position={[0, -0.16, 0.075]} material={MATS.deckCyan}>
        <boxGeometry args={[1.5, 0.03, 0.01]} />
      </mesh>
    </group>
  )
}

function Platform() {
  const oct = (r, h) => <cylinderGeometry args={[r, r * 1.02, h, 8, 1, false, Math.PI / 8]} />
  const rim = (r, h) => <cylinderGeometry args={[r, r, h, 8, 1, true, Math.PI / 8]} />
  return (
    <group name="platform" position={[0, 0, PLATFORM_Z]}>
      <group scale={[1.55, 1, 0.7]}>
        {/* tier 1 */}
        <mesh position-y={0.16} material={MATS.steel}>{oct(2.9, 0.32)}</mesh>
        <mesh position-y={0.335} material={MATS.gold}>{rim(2.905, 0.03)}</mesh>
        <mesh position-y={0.09} material={MATS.deckCyan}>{rim(2.92, 0.025)}</mesh>
        {/* tier 2 */}
        <mesh position-y={0.445} material={MATS.brushed}>{oct(2.4, 0.25)}</mesh>
        <mesh position-y={0.5} material={MATS.deckCyan}>{rim(2.42, 0.03)}</mesh>
        {/* tier 3 */}
        <mesh position-y={0.66} material={MATS.steel}>{oct(1.75, 0.18)}</mesh>
        <mesh position-y={0.74} material={MATS.gold}>{rim(1.755, 0.025)}</mesh>
        {/* holo stage + rings */}
        <mesh position-y={PLATFORM_TOP + 0.004} rotation-x={-Math.PI / 2} material={MATS.holo}>
          <circleGeometry args={[1.25, 48]} />
        </mesh>
        <mesh position-y={PLATFORM_TOP + 0.01} rotation-x={-Math.PI / 2} material={MATS.deckCyan}>
          <ringGeometry args={[1.22, 1.27, 64]} />
        </mesh>
        <mesh position-y={PLATFORM_TOP + 0.01} rotation-x={-Math.PI / 2} material={MATS.deckCyan}>
          <ringGeometry args={[0.72, 0.735, 64]} />
        </mesh>
      </group>

      {/* recessed light blocks on tier-1 front corners */}
      <Instances material={MATS.deckCyan} limit={8}>
        <boxGeometry args={[0.7, 0.05, 0.02]} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Instance position={[s * 2.96, 0.2, 1.34]} rotation-y={s * 0.56} />
            <Instance position={[s * 4.18, 0.2, 0]} rotation-y={Math.PI / 2} />
          </group>
        ))}
      </Instances>
      <Instances material={MATS.goldGlow} limit={8}>
        <boxGeometry args={[0.5, 0.035, 0.02]} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Instance position={[s * 2.45, 0.46, 1.1]} rotation-y={s * 0.56} />
            <Instance position={[s * 3.46, 0.46, 0]} rotation-y={Math.PI / 2} />
          </group>
        ))}
      </Instances>
      <Plaque />
    </group>
  )
}

function Architecture() {
  return (
    <group name="architecture">
      {/* Side command pillars framing the composition */}
      {[-1, 1].map((s) => (
        <group key={s}>
          {[
            [9.9, -49.5, 0.35, 1.6],
            [12.2, -53.5, 0.2, 1.9],
          ].map(([x, z, ry, w], i) => (
            <group key={i} position={[s * x, 0, z]} rotation-y={-s * ry}>
              <mesh position-y={5} material={MATS.steel}>
                <boxGeometry args={[w, 10, 1.4]} />
              </mesh>
              <mesh position={[s * -(w / 2 - 0.25), 1.2, 0.5]} rotation-z={s * 0.6} material={MATS.brushed}>
                <boxGeometry args={[0.9, 2.6, 0.5]} />
              </mesh>
              <mesh position={[s * -(w / 2) - s * 0.01, 5, 0.3]} material={MATS.deckCyan}>
                <boxGeometry args={[0.04, 6, 0.06]} />
              </mesh>
              {[0.6, 1.8].map((y) => (
                <mesh key={y} position={[0, y, 0.71]} material={MATS.goldGlow}>
                  <boxGeometry args={[w * 0.55, 0.06, 0.02]} />
                </mesh>
              ))}
              <mesh position={[0, 9.4, 0.72]} material={MATS.gold}>
                <boxGeometry args={[w, 0.2, 0.06]} />
              </mesh>
            </group>
          ))}
          {/* side walls */}
          <mesh position={[s * 13, 6, -46]} rotation-y={(-s * Math.PI) / 2} material={MATS.panel}>
            <planeGeometry args={[24, 12]} />
          </mesh>
        </group>
      ))}

      {/* Back wall: panelled, low-key */}
      <mesh position={[0, 6, -56]} material={MATS.panel}>
        <planeGeometry args={[30, 12]} />
      </mesh>
      <Instances material={MATS.steelDark} limit={40}>
        <boxGeometry args={[2.2, 3.4, 0.2]} />
        {[...Array(9)].map((_, i) =>
          [1.9, 5.5, 9.1].map((y) => <Instance key={`${i}-${y}`} position={[(i - 4) * 2.45, y, -55.85]} />),
        )}
      </Instances>
      <Instances material={MATS.deckCyan} limit={12}>
        <boxGeometry args={[0.025, 10, 0.02]} />
        {[-4.5, -2.5, 2.5, 4.5].map((x) => (
          <Instance key={x} position={[x * 2.45 * 0.5 + Math.sign(x) * 1.2, 5.5, -55.7]} />
        ))}
      </Instances>

      {/* Ceiling + front wall so the chamber is enclosed */}
      <mesh position={[0, 12, -46]} rotation-x={Math.PI / 2} material={MATS.panel}>
        <planeGeometry args={[26, 24]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 8, 6, -34]} material={MATS.panel}>
          <planeGeometry args={[10, 12]} />
        </mesh>
      ))}

      {/* floor guide lights */}
      <Instances material={MATS.goldGlow} limit={20}>
        <boxGeometry args={[0.55, 0.02, 0.06]} />
        {[-1, 1].map((s) =>
          [0, 1, 2].map((i) => <Instance key={`${s}${i}`} position={[s * (5.2 + i * 0.8), 0.012, -40.5 - i * 2.2]} rotation-y={s * 0.5} />),
        )}
      </Instances>
      <Instances material={MATS.deckCyan} limit={20}>
        <boxGeometry args={[0.04, 0.02, 1]} />
        {[-1, 1].map((s) =>
          [0, 1, 2, 3].map((i) => <Instance key={`${s}${i}`} position={[s * 1.4, 0.012, -36 - i * 1.4]} />),
        )}
      </Instances>
    </group>
  )
}

function Floor() {
  const quality = useDirector((s) => s.quality)
  const map = useMemo(() => {
    const t = floorPanelTexture()
    t.repeat.set(9, 8)
    return t
  }, [])
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -46]}>
      <planeGeometry args={[26, 24]} />
      {quality === 'high' ? (
        <MeshReflectorMaterial
          map={map}
          resolution={512}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={6}
          mirror={0.6}
          depthScale={0.6}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.2}
          roughness={0.75}
          metalness={0.6}
          color="#2a3b42"
        />
      ) : (
        <meshStandardMaterial map={map} color="#2a3b42" roughness={0.55} metalness={0.7} />
      )}
    </mesh>
  )
}

export default function CommandDeck() {
  return (
    <group name="room:commandDeck">
      <Floor />
      <Architecture />
      <Insignia />
      <Platform />
    </group>
  )
}
