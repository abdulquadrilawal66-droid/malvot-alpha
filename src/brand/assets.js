/**
 * PROTECTED BRAND-ASSET REGISTRY
 * ------------------------------------------------------------------
 * These entries point at the client's ORIGINAL artwork files.
 * The site only ever displays them as-is: no redraw, no regeneration,
 * no cropping, no recolouring, no warping, no per-part animation.
 *
 * To install the real artwork, drop the client's original files into
 * /public/brand/ using the filenames below (transparent PNG or WebP,
 * at least 2000px tall for the primary wolf). Nothing else needs to change.
 *
 * If a supplied file has a solid background, ask the client for a
 * transparent original. Do not cut it out destructively.
 */
const base = import.meta.env.BASE_URL

export const BRAND_ASSETS = Object.freeze({
  officialWolfPrimary: Object.freeze({
    id: 'officialWolfPrimary',
    src: `${base}brand/wolf-primary.png`,
    alt: 'MALVOT ALPHA, the official cyber-wolf, standing arms crossed in black and gold armour with a green visor',
    usage: 'Hero / Alpha Command Deck',
    // Transparent margins measured on the supplied file (1122×1402):
    // ear tips at y=12, feet end at y=1358. Used only to seat the feet on the platform.
    frame: Object.freeze({ top: 12 / 1402, bottom: 44 / 1402 }),
  }),
  officialWolfSecondary: Object.freeze({
    id: 'officialWolfSecondary',
    src: `${base}brand/wolf-secondary.png`,
    alt: 'MALVOT ALPHA secondary official cyber-wolf artwork',
    usage: 'Reserved for About / Community rooms. Never combine with the primary wolf.',
  }),
  officialBrandLogo: Object.freeze({
    id: 'officialBrandLogo',
    src: `${base}brand/logo.png`, // head framing of the primary artwork (client-directed), pixels unaltered
    alt: 'MALVOT ALPHA logo — the cyber-wolf head with green visor',
    usage: 'Navigation, intro identity display, footer',
  }),
})
