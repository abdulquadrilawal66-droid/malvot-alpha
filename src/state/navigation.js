import { getDestination } from '../config/destinations'
import { useDirector } from './director'

/**
 * Single entry point for every nav link, strip item and CTA.
 * - Built rooms: camera transition + scroll to the room's anchor.
 * - Planned rooms: direct, accessible jump to the HTML anchor.
 * Reduced-motion users always get the direct jump.
 */
export function navigateTo(id) {
  const dest = getDestination(id)
  if (!dest) return
  const { reducedMotion, phase, completeIntro } = useDirector.getState()
  if (phase === 'intro') completeIntro()

  if (dest.status === 'built' && dest.camera) {
    useDirector.getState().goToCamera(dest.camera)
  }

  const el = document.getElementById(dest.anchor)
  if (el) {
    el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
    // Move focus for keyboard + screen-reader users without a second scroll.
    const heading = el.querySelector('h1, h2') || el
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
    heading.focus({ preventScroll: true })
  }
  if (history.replaceState) history.replaceState(null, '', `#${dest.anchor}`)
}
