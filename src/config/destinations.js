/**
 * SCENE / DESTINATION REGISTRY
 * One entry per headquarters destination. Navigation, the protocol strip,
 * CTAs and the camera director all resolve through this table.
 *
 * status:
 *   'built'   — room exists in 3D; navigation runs a camera transition.
 *   'planned' — room not built yet; navigation scrolls to its accessible
 *               HTML anchor, which states honestly that the room is in development.
 */
export const DESTINATIONS = [
  {
    id: 'hero',
    label: 'Command Deck',
    anchor: 'hero',
    room: 'commandDeck',
    camera: 'HERO_IDLE',
    enter: { duration: 1.1 },
    exit: { duration: 0.8 },
    status: 'built',
  },
  { id: 'about', label: 'About', anchor: 'about', room: 'archive', camera: 'ABOUT_ARCHIVE', status: 'planned', roomName: 'The Wolf’s Legacy' },
  { id: 'token', label: 'Token', anchor: 'token', room: 'vault', camera: 'TOKEN_VAULT', status: 'planned', roomName: 'The Alpha Vault' },
  { id: 'roadmap', label: 'Roadmap', anchor: 'roadmap', room: 'corridor', camera: 'ROADMAP_CORRIDOR', status: 'planned', roomName: 'The Evolution Corridor' },
  { id: 'malvot-ai', label: 'MALVOT AI', anchor: 'malvot-ai', room: 'aiCore', camera: 'AI_CORE', status: 'planned', roomName: 'The Intelligence Core' },
  { id: 'transparency', label: 'Transparency', anchor: 'transparency', room: 'verification', camera: 'TRANSPARENCY_CHAMBER', status: 'planned', roomName: 'The Verification Chamber' },
  { id: 'community', label: 'Community', anchor: 'community', room: 'assembly', camera: 'COMMUNITY_ASSEMBLY', status: 'planned', roomName: 'The Wolf Pack Assembly' },
]

export const NAV_ITEMS = ['about', 'token', 'roadmap', 'malvot-ai', 'transparency', 'community']

export const getDestination = (id) => DESTINATIONS.find((d) => d.id === id)
