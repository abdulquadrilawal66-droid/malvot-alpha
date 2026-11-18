import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { MATS } from '../materials'
import { insigniaFrameShape } from '../shapes'
import { live } from '../../state/director'

/**
 * Secured facility entrance at z = 0.
 * Door opening: x ∈ [-2.6, 2.6], y ∈ [0, 7]. Doors slide sideways on live.doors.
 */
const OPEN_W = 2.6
const OPEN_H = 7

export default function Entrance() {
  const leftDoor = useRef()
  const rightDoor = useRef()
  const lockA = useRef()
  const lockB = useRef()
  const boltsL = useRef()
  const boltsR = useRef()
  const lock = useRef()
  const insignia = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(insigniaFrameShape(0.24), { depth: 0.18, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1 })
    g.scale(0.42, 0.42, 1)
    return g
  }, [])

  useFrame(() => {
    const d = THREE.MathUtils.smoothstep(live.doors, 0, 1)
    const slide = d * (OPEN_W + 0.05)
    if (leftDoor.current) leftDoor.current.position.x = -OPEN_W / 2 - slide
    if (rightDoor.current) rightDoor.current.position.x = OPEN_W / 2 + slide
    const l = THREE.MathUtils.smootherstep(live.locks, 0, 1)
    if (lockA.current) lockA.current.rotation.z = l * Math.PI * 0.75
    if (lockB.current) lockB.current.rotation.z = -l * Math.PI * 1.25
    // bolts retract into the doors before they part
    if (boltsL.current) boltsL.current.position.x = -0.18 * l
    if (boltsR.current) boltsR.current.position.x = 0.18 * l
    // lock withdraws into the ceiling housing once the doors begin to part
    if (lock.current) {
      const w = THREE.MathUtils.smoothstep(live.doors, 0, 0.45)
      lock.current.position.y = 3.5 + w * 4.2
      lock.current.scale.setScalar(1 - w * 0.6)
      lock.current.visible = w < 0.999
    }
  })

  return (
    <group name="room:entrance">
      {/* exterior floor apron */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 7]} material={MATS.steelDark}>
        <planeGeometry args={[30, 16]} />
      </mesh>
      {/* guide strips leading to the door */}
      <Instances material={MATS.seamCyan} limit={12}>
        <boxGeometry args={[0.06, 0.02, 1.4]} />
        {[...Array(6)].map((_, i) => (
          <group key={i}>
            <Instance position={[-1.9, 0.011, 2 + i * 2]} />
            <Instance position={[1.9, 0.011, 2 + i * 2]} />
          </group>
        ))}
      </Instances>

      {/* facade: left / right / lintel blocks around the opening */}
      <mesh position={[-(OPEN_W + 5.7), 6, -0.78]} material={MATS.panel}>
        <boxGeometry args={[11.4, 12, 0.85]} />
      </mesh>
      <mesh position={[OPEN_W + 5.7, 6, -0.78]} material={MATS.panel}>
        <boxGeometry args={[11.4, 12, 0.85]} />
      </mesh>
      <mesh position={[0, OPEN_H + 2.5, -0.78]} material={MATS.panel}>
        <boxGeometry args={[OPEN_W * 2 + 0.2, 5, 0.85]} />
      </mesh>

      {/* angular framing pilasters */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (OPEN_W + 0.7), 0, 0.35]}>
          <mesh position={[0, OPEN_H / 2 + 0.6, 0]} material={MATS.steel}>
            <boxGeometry args={[1.2, OPEN_H + 1.2, 0.5]} />
          </mesh>
          <mesh position={[s * -0.62, OPEN_H / 2 + 0.6, 0.26]} material={MATS.seamCyan}>
            <boxGeometry args={[0.05, OPEN_H + 1.0, 0.02]} />
          </mesh>
          {/* gold mechanical joints */}
          {[1.2, 3.6, 6.0].map((y) => (
            <mesh key={y} position={[0, y, 0.28]} material={MATS.gold}>
              <boxGeometry args={[0.9, 0.18, 0.12]} />
            </mesh>
          ))}
          {/* outer tall panels with seams */}
          {[1, 2, 3].map((k) => (
            <group key={k} position={[s * (1.2 + k * 1.9), 0, -0.05]}>
              <mesh position={[0, 5.5, 0]} material={k % 2 ? MATS.steelDark : MATS.steel}>
                <boxGeometry args={[1.75, 11, 0.3]} />
              </mesh>
              <mesh position={[s * 0.9, 5.5, 0.16]} material={MATS.seamCyan}>
                <boxGeometry args={[0.03, 11, 0.02]} />
              </mesh>
              <mesh position={[0, 0.4 + k * 0.6, 0.16]} material={MATS.seamCyan}>
                <boxGeometry args={[1.5, 0.025, 0.02]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* lintel: angled chevron with seam + insignia */}
      <mesh position={[0, OPEN_H + 0.45, 0.4]} material={MATS.steel}>
        <boxGeometry args={[OPEN_W * 2 + 2.6, 0.9, 0.6]} />
      </mesh>
      <mesh position={[0, OPEN_H + 0.02, 0.71]} material={MATS.seamCyan}>
        <boxGeometry args={[OPEN_W * 2 + 2.2, 0.04, 0.02]} />
      </mesh>
      <mesh geometry={insignia} position={[0, OPEN_H + 1.0, 0.25]} material={MATS.gold} />

      {/* sliding doors */}
      {[
        [leftDoor, -1, boltsL],
        [rightDoor, 1, boltsR],
      ].map(([ref, s, bolts]) => (
        <group key={s} ref={ref} position={[(s * OPEN_W) / 2, 0, -0.1]}>
          <mesh position={[0, OPEN_H / 2, 0]} material={MATS.brushed}>
            <boxGeometry args={[OPEN_W, OPEN_H, 0.35]} />
          </mesh>
          {/* layered relief plates */}
          <mesh position={[s * 0.2, OPEN_H / 2 + 0.6, 0.2]} material={MATS.steel}>
            <boxGeometry args={[OPEN_W - 0.8, 4.2, 0.08]} />
          </mesh>
          <mesh position={[s * 0.15, 1.0, 0.2]} material={MATS.steelDark}>
            <boxGeometry args={[OPEN_W - 0.5, 1.2, 0.08]} />
          </mesh>
          {/* door seam light along the meeting edge */}
          <mesh position={[-s * (OPEN_W / 2 - 0.04), OPEN_H / 2, 0.19]} material={MATS.seamCyan}>
            <boxGeometry args={[0.04, OPEN_H - 0.2, 0.02]} />
          </mesh>
          <mesh position={[s * 0.1, 2.15, 0.25]} material={MATS.seamCyan}>
            <boxGeometry args={[OPEN_W - 0.7, 0.03, 0.02]} />
          </mesh>
          {/* gold locking bolts */}
          <group ref={bolts}>
            {[2.6, 3.5, 4.4].map((y) => (
              <mesh key={y} position={[-s * (OPEN_W / 2 - 0.25), y, 0.24]} material={MATS.gold}>
                <boxGeometry args={[0.5, 0.16, 0.1]} />
              </mesh>
            ))}
          </group>
        </group>
      ))}

      {/* central rotating lock (sits on the door seam; fades with doors via scale) */}
      <group ref={lock} position={[0, 3.5, 0.25]}>
        <group ref={lockA}>
          <mesh material={MATS.gold}>
            <torusGeometry args={[0.85, 0.07, 8, 6]} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation-z={(i * Math.PI * 2) / 3} position={[0, 0, 0]} material={MATS.gold}>
              <boxGeometry args={[0.12, 1.5, 0.08]} />
            </mesh>
          ))}
        </group>
        <group ref={lockB} position-z={0.06}>
          <mesh material={MATS.seamCyan}>
            <torusGeometry args={[0.55, 0.025, 6, 32]} />
          </mesh>
          <mesh material={MATS.steel}>
            <cylinderGeometry args={[0.3, 0.3, 0.12, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
