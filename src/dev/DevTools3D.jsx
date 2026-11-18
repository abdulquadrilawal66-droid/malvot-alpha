import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { useDirector } from '../state/director'
import { setWireframe } from '../three/materials'

/** DEV ONLY — never bundled in production (guarded by import.meta.env.DEV). */
export const devReadout = { pos: [0, 0, 0], calls: 0, tris: 0 }

export default function DevTools3D() {
  const freeCam = useDirector((s) => s.devFreeCam)
  const wire = useDirector((s) => s.devWireframe)
  const hidden = useDirector((s) => s.devHidden)
  const { scene, gl } = useThree()

  useEffect(() => setWireframe(wire), [wire])
  useEffect(() => {
    ;['entrance', 'corridor', 'commandDeck'].forEach((r) => {
      const g = scene.getObjectByName(`room:${r}`)
      if (g) g.visible = !hidden[r]
    })
  }, [hidden, scene])

  useFrame(({ camera }) => {
    devReadout.pos = camera.position.toArray().map((v) => v.toFixed(2))
    devReadout.calls = gl.info.render.calls
    devReadout.tris = gl.info.render.triangles
  })

  return (
    <>
      <Stats className="dev-stats" />
      {freeCam && <OrbitControls makeDefault target={[0, 2.5, -46]} />}
    </>
  )
}
