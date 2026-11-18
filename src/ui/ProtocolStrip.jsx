import { navigateTo } from '../state/navigation'
import { Icon } from './Icons'

/** Lower protocol strip — every item is real section navigation. */
const ITEMS = [
  { label: 'On Solana', to: 'token', icon: Icon.solana },
  { label: 'Community-First', to: 'about', icon: Icon.pack },
  { label: 'MALVOT AI', to: 'malvot-ai', icon: Icon.chip },
  { label: 'Roadmap', to: 'roadmap', icon: Icon.map },
  { label: 'Transparency', to: 'transparency', icon: Icon.layers },
  { label: 'Community', to: 'community', icon: Icon.group },
]

export default function ProtocolStrip() {
  return (
    <nav className="strip" aria-label="Protocol shortcuts">
      <ul className="strip__list">
        {ITEMS.map(({ label, to, icon: I }) => (
          <li key={label}>
            <a
              href={`#${to}`}
              className="strip__item"
              onClick={(e) => {
                e.preventDefault()
                navigateTo(to)
              }}
            >
              <I className="strip__icon" />
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
