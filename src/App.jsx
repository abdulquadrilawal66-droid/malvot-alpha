import { useEffect, lazy, Suspense } from 'react'
import Nav from './ui/Nav'
import Hero from './ui/Hero'
import IntroOverlay from './ui/IntroOverlay'
import { RoomStubs, Footer } from './ui/RoomStubs'
import { useDirector } from './state/director'

const DevPanel = import.meta.env.DEV ? lazy(() => import('./dev/DevPanel')) : null

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function App() {
  const phase = useDirector((s) => s.phase)

  useEffect(() => {
    const st = useDirector.getState()
    if (!hasWebGL()) st.setWebglFailed()
    // Never trap visitors behind loading: reveal the hero UI after 5s regardless.
    const t = setTimeout(() => useDirector.getState().forceHero(), 5000)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => useDirector.setState({ reducedMotion: mq.matches })
    mq.addEventListener?.('change', onMq)
    // lighter defaults on small touch devices
    if (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 900) st.setQuality('low')
    return () => {
      clearTimeout(t)
      mq.removeEventListener?.('change', onMq)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('is-intro', phase === 'intro' || phase === 'loading')
  }, [phase])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <RoomStubs />
      </main>
      <Footer />
      <IntroOverlay />
      {DevPanel && (
        <Suspense fallback={null}>
          <DevPanel />
        </Suspense>
      )}
    </>
  )
}
