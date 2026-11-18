import { SITE } from '../config/site'
import { navigateTo } from '../state/navigation'

/**
 * JOIN THE WOLF PACK: opens the confirmed official community link when one
 * is configured; otherwise routes to the Community destination. Never a guessed URL.
 */
export function joinPack() {
  const url = SITE.links.telegram || SITE.links.x
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
  else navigateTo('community')
}
