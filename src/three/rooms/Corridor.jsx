import { Instances, Instance } from '@react-three/drei'
import { MATS } from '../materials'

/** Interior corridor joining the entrance (z=0) to the command chamber (z=-34). */
const Z0 = -1.2
const Z1 = -34
const LEN = Z0 - Z1
const MID = (Z0 + Z1) / 2
const HALF_W = 3
const H = 6.5
const RIBS = [...Array(10)].map((_, i) => Z0 - 2 - i * 3.2)

export default function Corridor() {
  return (
    <group name="room:corridor">
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, MID]} material={MATS.steelDark}>
        <planeGeometry args={[HALF_W * 2, LEN]} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, H, MID]} material={MATS.panel}>
        <planeGeometry args={[HALF_W * 2, LEN]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} rotation-y={(-s * Math.PI) / 2} position={[s * HALF_W, H / 2, MID]} material={MATS.panel}>
          <planeGeometry args={[LEN, H]} />
        </mesh>
      ))}

      {/* structural ribs — instanced */}
      <Instances material={MATS.steel} limit={60}>
        <boxGeometry />
        {RIBS.map((z) => (
          <group key={z}>
            <Instance position={[-HALF_W + 0.2, H / 2, z]} scale={[0.4, H, 0.5]} />
            <Instance position={[HALF_W - 0.2, H / 2, z]} scale={[0.4, H, 0.5]} />
            <Instance position={[0, H - 0.2, z]} scale={[HALF_W * 2, 0.4, 0.5]} />
            <Instance position={[-HALF_W + 0.55, H - 0.55, z]} rotation-z={Math.PI / 4} scale={[1.1, 0.3, 0.45]} />
            <Instance position={[HALF_W - 0.55, H - 0.55, z]} rotation-z={-Math.PI / 4} scale={[1.1, 0.3, 0.45]} />
          </group>
        ))}
      </Instances>

      {/* gold joints on ribs */}
      <Instances material={MATS.gold} limit={40}>
        <boxGeometry args={[0.46, 0.16, 0.56]} />
        {RIBS.map((z) => (
          <group key={z}>
            <Instance position={[-HALF_W + 0.2, 1.6, z]} />
            <Instance position={[HALF_W - 0.2, 1.6, z]} />
          </group>
        ))}
      </Instances>

      {/* cyan light: floor path + wall strips */}
      <Instances material={MATS.corridorCyan} limit={80}>
        <boxGeometry />
        {RIBS.map((z) => (
          <group key={z}>
            <Instance position={[0, 0.012, z - 1.6]} scale={[0.08, 0.02, 2.2]} />
            <Instance position={[-HALF_W + 0.02, 0.5, z - 1.6]} scale={[0.02, 0.04, 2.6]} />
            <Instance position={[HALF_W - 0.02, 0.5, z - 1.6]} scale={[0.02, 0.04, 2.6]} />
            <Instance position={[-HALF_W + 0.41, H / 2, z]} scale={[0.02, H - 1.4, 0.05]} />
            <Instance position={[HALF_W - 0.41, H / 2, z]} scale={[0.02, H - 1.4, 0.05]} />
          </group>
        ))}
      </Instances>
    </group>
  )
}
