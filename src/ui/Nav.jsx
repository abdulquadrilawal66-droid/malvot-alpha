import { useEffect, useState } from 'react'
import { NAV_ITEMS, getDestination } from '../config/destinations'
import { navigateTo } from '../state/navigation'
import { joinPack } from './actions'
import { Icon } from './Icons'
import BrandImage from './BrandImage'
import { useDirector } from '../state/director'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const phase = useDirector((s) => s.phase)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    navigateTo(id)
  }

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${phase === 'hero' ? 'is-live' : ''}`}>
      <nav className="nav__bar" aria-label="Primary">
        <a href="#hero" className="nav__brand" onClick={go('hero')} aria-label="MALVOT ALPHA — back to the Command Deck">
          <span className="nav__logo">
            <BrandImage asset="officialBrandLogo" eager slotLabel={false} decorative />
          </span>
          <span className="nav__name">
            MALVOT <span className="c-cyan">ALPHA</span>
          </span>
        </a>
        <span className="nav__divider" aria-hidden="true" />
        <ul className="nav__links">
          {NAV_ITEMS.map((id) => (
            <li key={id}>
              <a href={`#${id}`} onClick={go(id)}>
                {getDestination(id).label}
              </a>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn--nav" onClick={joinPack}>
          Join the Pack <Icon.chevron />
        </button>
        <button
          type="button"
          className="nav__burger"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Icon.close /> : <Icon.menu />}
        </button>
      </nav>

      <div id="mobile-menu" className={`mmenu ${open ? 'is-open' : ''}`} hidden={!open}>
        <ul>
          {NAV_ITEMS.map((id, i) => (
            <li key={id} style={{ '--i': i }}>
              <a href={`#${id}`} onClick={go(id)}>
                <span className="mmenu__idx">{String(i + 3).padStart(2, '0')}</span>
                {getDestination(id).label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => {
            setOpen(false)
            joinPack()
          }}
        >
          Join the Pack <Icon.chevron />
        </button>
      </div>
    </header>
  )
}
