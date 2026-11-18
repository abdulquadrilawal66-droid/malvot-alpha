import { useEffect, useState } from 'react'
import { useDirector, live } from '../state/director'
import { DESTINATIONS } from '../config/destinations'
import { BRAND_ASSETS } from '../brand/assets'
import { navigateTo } from '../state/navigation'
import { devReadout } from './DevTools3D'

/**
 * DEV-ONLY 3D INSPECTION PANEL (toggle with the ` key).
 * Excluded from production builds via import.meta.env.DEV in App.jsx.
 */
const CAMS = ['INTRO_EXTERIOR', 'INTRO_CORRIDOR', 'HERO_REVEAL', 'HERO_IDLE']

export default function DevPanel() {
  const [open, setOpen] = useState(false)
  const [, tick] = useState(0)
  const [assets, setAssets] = useState({})
  const s = useDirector()

  useEffect(() => {
    const k = (e) => e.key === '`' && setOpen((v) => !v)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])
  useEffect(() => {
    if (!open) return
    const id = setInterval(() => tick((n) => n + 1), 250)
    Object.values(BRAND_ASSETS).forEach((a) => {
      const img = new Image()
      img.onload = () => setAssets((m) => ({ ...m, [a.id]: `ok ${img.naturalWidth}×${img.naturalHeight}` }))
      img.onerror = () => setAssets((m) => ({ ...m, [a.id]: 'MISSING' }))
      img.src = a.src
    })
    return () => clearInterval(id)
  }, [open])

  const box = { position: 'fixed', right: 12, top: 90, zIndex: 99, width: 280, maxHeight: '80vh', overflow: 'auto', padding: 12, font: '12px/1.5 "IBM Plex Mono", monospace', color: '#cfe', background: 'rgba(2,12,16,.94)', border: '1px solid #00E5F2' }
  if (!open)
    return (
      <button style={{ ...box, width: 'auto', top: 'auto', bottom: 100, padding: '4px 8px', cursor: 'pointer' }} onClick={() => setOpen(true)}>
        DEV `
      </button>
    )
  const row = { display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }
  return (
    <div style={box} role="dialog" aria-label="Development inspection panel">
      <div style={row}>
        <strong>INSPECTION MODE</strong>
        <button onClick={() => setOpen(false)}>×</button>
      </div>
      <p>
        phase: {s.phase} · beat {s.introBeat} · quality: {s.quality}
      </p>
      <p>cam: [{devReadout.pos.join(', ')}]</p>
      <p>
        draw calls {devReadout.calls} · tris {devReadout.tris}
      </p>
      <hr />
      <label style={row}>
        Free camera <input type="checkbox" checked={s.devFreeCam} onChange={(e) => s.setDev({ devFreeCam: e.target.checked })} />
      </label>
      <label style={row}>
        Wireframe <input type="checkbox" checked={s.devWireframe} onChange={(e) => s.setDev({ devWireframe: e.target.checked })} />
      </label>
      <label style={row}>
        Quality
        <select value={s.quality} onChange={(e) => s.setQuality(e.target.value)}>
          <option>high</option>
          <option>low</option>
        </select>
      </label>
      <label style={row}>
        Light ×{live.lightScale.toFixed(2)}
        <input type="range" min="0" max="2" step="0.05" defaultValue={live.lightScale} onChange={(e) => (live.lightScale = +e.target.value)} />
      </label>
      <hr />
      <strong>Camera states</strong>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {CAMS.map((c) => (
          <button key={c} onClick={() => s.goToCamera(c)} style={{ fontSize: 10 }}>
            {c}
          </button>
        ))}
      </div>
      <strong>Rooms (visibility)</strong>
      {['entrance', 'corridor', 'commandDeck'].map((r) => (
        <label key={r} style={row}>
          {r} <input type="checkbox" checked={!s.devHidden[r]} onChange={(e) => s.setDev({ devHidden: { ...s.devHidden, [r]: !e.target.checked } })} />
        </label>
      ))}
      <strong>Destinations (nav test)</strong>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {DESTINATIONS.map((d) => (
          <button key={d.id} onClick={() => navigateTo(d.id)} style={{ fontSize: 10 }}>
            {d.id} {d.status === 'planned' ? '·' : '✓'}
          </button>
        ))}
      </div>
      <strong>Brand assets</strong>
      {Object.keys(BRAND_ASSETS).map((k) => (
        <div key={k} style={row}>
          <span>{k}</span>
          <span style={{ color: assets[k] === 'MISSING' ? '#ffb443' : '#00E5F2' }}>{assets[k] || '…'}</span>
        </div>
      ))}
      <hr />
      <button onClick={s.replayIntro}>Replay intro</button>{' '}
      <button
        onClick={() => {
          localStorage.removeItem('malvot.intro.seen.v1')
          location.reload()
        }}
      >
        Reset first visit
      </button>
    </div>
  )
}
