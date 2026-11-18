import { DESTINATIONS } from '../config/destinations'
import { useDirector } from '../state/director'
import BrandImage from './BrandImage'
import { NAV_ITEMS, getDestination } from '../config/destinations'
import { navigateTo } from '../state/navigation'

/**
 * Accessible anchor targets for rooms that are NOT built yet.
 * They state plainly that the room is in development — no invented content.
 * Each is replaced by its real room when that phase is approved.
 */
export function RoomStubs() {
  const rooms = DESTINATIONS.filter((d) => d.status === 'planned')
  return (
    <div className="stubs">
      {rooms.map((d, i) => (
        <section key={d.id} id={d.anchor} className="stub" aria-labelledby={`${d.id}-title`}>
          <span className="stub__idx" aria-hidden="true">
            {String(i + 3).padStart(2, '0')}
          </span>
          <div>
            <p className="stub__kicker">{d.label}</p>
            <h2 id={`${d.id}-title`}>{d.roomName}</h2>
            <p className="stub__status">
              <i aria-hidden="true" /> Chamber in development — opens in a later build phase.
            </p>
          </div>
        </section>
      ))}
    </div>
  )
}

export function Footer() {
  const replay = useDirector((s) => s.replayIntro)
  const failed = useDirector((s) => s.webglFailed)
  return (
    <footer className="footer">
      <div className="footer__row">
        <div className="footer__brand">
          <span className="nav__logo">
            <BrandImage asset="officialBrandLogo" slotLabel={false} decorative />
          </span>
          <span className="nav__name">
            MALVOT <span className="c-cyan">ALPHA</span>
          </span>
        </div>
        <ul className="footer__links">
          {NAV_ITEMS.map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  navigateTo(id)
                }}
              >
                {getDestination(id).label}
              </a>
            </li>
          ))}
        </ul>
        {!failed && (
          <button type="button" className="link-tech" onClick={replay}>
            Replay intro
          </button>
        )}
      </div>
      <p className="footer__risk">
        $MALV is a community meme token. Crypto assets are volatile and can lose all value. Nothing on this site is financial advice — do your own research.
      </p>
      <p className="footer__copy">© {new Date().getFullYear()} MALVOT ALPHA</p>
    </footer>
  )
}
