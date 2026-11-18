import { useEffect, useRef } from 'react'
import { useDirector } from '../state/director'
import BrandImage from './BrandImage'

const STATUS = [
  ['ALPHA PROTOCOL', 'Initializing command system'],
  ['MALVOT ALPHA', 'Access authorized'],
  ['ENTRY SEQUENCE', 'Locks released'],
  ['COMMAND DECK', 'Entering facility'],
  ['ALPHA COMMAND DECK', 'Online'],
]

export default function IntroOverlay() {
  const phase = useDirector((s) => s.phase)
  const beat = useDirector((s) => s.introBeat)
  const completeIntro = useDirector((s) => s.completeIntro)
  const skipRef = useRef(null)

  useEffect(() => {
    if (phase !== 'intro') return
    const onKey = (e) => ['Escape', 'Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key) && e.target === document.body && completeIntro()
    const onEsc = (e) => e.key === 'Escape' && completeIntro()
    // scrolling during the intro means "take me to the site" — never trap the visitor
    const onScrollIntent = () => completeIntro()
    window.addEventListener('keydown', onKey)
    window.addEventListener('keydown', onEsc)
    window.addEventListener('wheel', onScrollIntent, { passive: true })
    window.addEventListener('touchmove', onScrollIntent, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keydown', onEsc)
      window.removeEventListener('wheel', onScrollIntent)
      window.removeEventListener('touchmove', onScrollIntent)
    }
  }, [phase, completeIntro])

  if (phase === 'loading') {
    return (
      <div className="boot" role="status" aria-live="polite">
        <span className="boot__ring" aria-hidden="true" />
        <span className="boot__text">ALPHA PROTOCOL · Establishing link</span>
      </div>
    )
  }
  if (phase !== 'intro') return null

  const [title, sub] = STATUS[beat] || STATUS[0]
  return (
    <div className={`intro beat-${beat}`}>
      <div className="intro__status" role="status" aria-live="polite">
        <span className="intro__title">{title}</span>
        <span className="intro__sub">
          <i aria-hidden="true" /> {sub}
        </span>
      </div>

      <div className={`intro__id ${beat === 1 ? 'is-on' : ''}`} aria-hidden={beat !== 1}>
        <div className="intro__id-logo">
          <BrandImage asset="officialBrandLogo" eager slotLabel={false} decorative />
        </div>
        <div className="intro__id-text">
          <strong>MALVOT ALPHA</strong>
          <span>ACCESS AUTHORIZED</span>
        </div>
      </div>

      <button ref={skipRef} type="button" className="intro__skip" onClick={completeIntro}>
        Skip intro <kbd>Esc</kbd>
      </button>
    </div>
  )
}
