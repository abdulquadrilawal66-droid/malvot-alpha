/**
 * Project facts. Only CONFIRMED values go here.
 * Every `null` renders as a truthful "awaiting confirmation" state.
 * Never fill these with placeholder or guessed values.
 */
export const SITE = Object.freeze({
  project: 'MALVOT ALPHA',
  ticker: '$MALV',
  network: 'Solana',
  slogan: ['ONE WOLF.', 'ONE COMMUNITY.', 'ONE VISION.'],

  contractAddress: null, // e.g. 'So1ana...'  (confirmed by the client only)
  explorerUrl: null, // e.g. 'https://solscan.io/token/<address>'
  dexChartUrl: null, // only once a real pair exists

  links: Object.freeze({
    x: null, // official X / Twitter URL
    telegram: null, // official Telegram URL
    announcements: null,
  }),
})

export const hasOfficialCommunityLink = () => Boolean(SITE.links.x || SITE.links.telegram)
