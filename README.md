# MALVOT ALPHA — The Alpha Protocol (Phase 1)

Phase 1 covers the foundation, **01 Cinematic Alpha Awakening** and **02 Alpha Command Deck (Hero)**.
Stack: Vite · React 18 · Three.js · React Three Fiber · drei · postprocessing · zustand.

```bash
npm install
npm run dev      # dev server, includes the inspection panel (press ` to toggle)
npm run build    # production build in /dist (no dev panel)
```

## 1. Install the client's original artwork (required)

The site never redraws or generates the wolf. Put the client's original files here:

| Registry key            | File                            | Used in                        |
|-------------------------|---------------------------------|--------------------------------|
| `officialWolfPrimary`   | `public/brand/wolf-primary.png` | Hero Alpha Display             |
| `officialWolfSecondary` | `public/brand/wolf-secondary.png` | Reserved for About/Community |
| `officialBrandLogo`     | `public/brand/logo.png`         | Nav, intro identity card, footer |

- Use a **transparent PNG/WebP**, at least 2000px tall for the primary wolf. If the client only has a version with a solid background, ask them for a transparent original. Don't cut it out yourself.
- Until a file is present, an empty "asset slot" frame appears in its place. It is never a stand-in wolf.
- The wolf is scaled uniformly and never cropped, filtered or warped. To keep it front-facing it sits on its own layer, which is locked to the 3D platform every frame (`WolfSync` in `src/three/Experience.jsx`). That way the camera never shows a flat edge.
- Framing assumes the wolf's feet sit at the bottom edge of the image, with the image's height mapped to about 4.85 m. If the client's file has extra padding, adjust the `head` anchor in `WolfSync`.

## 2. Confirmed project data

Edit `src/config/site.js`. Every `null` is shown truthfully as pending. Never enter guessed values.
`JOIN THE WOLF PACK` opens the official Telegram or X link once one is set. Until then it goes to the Community section.

## Architecture

```
src/
  brand/assets.js          protected brand-asset registry
  config/destinations.js   scene/destination registry (id, anchor, room, camera, status)
  config/site.js           confirmed project facts + official links only
  state/director.js        phase/intro state + per-frame `live` values
  state/navigation.js      the single navigateTo() used by nav, strip and CTAs
  three/CameraDirector.jsx the ONLY camera controller (intro choreography, transitions, parallax)
  three/Experience.jsx     shared canvas, lights, glow driver, bloom, perf monitor
  three/materials.js       shared material library (reused across rooms)
  three/rooms/             Entrance · Corridor · CommandDeck (real geometry)
  ui/                      Nav, Hero, ProtocolStrip, IntroOverlay, stubs, footer
  dev/                     inspection panel (dev builds only)
```

**Adding a room later:** build `three/rooms/<Room>.jsx`. Add its camera pose to `cameraStates()` and set the room's registry entry to `status: 'built'`. Navigation then switches from a plain anchor jump to a camera transition automatically.

## Behaviour notes
- The intro is about 7.4s. You can skip it with the button, Esc, scrolling or swiping. It plays only on the first visit (stored in localStorage). Reduced-motion users never see it. "Replay intro" is in the footer.
- Hero HTML stays in the DOM, so it's readable by screen readers and SEO. If the 3D takes longer than 5s to load, the hero UI shows anyway. Without WebGL, a static hero is shown.
- Performance: the 3D chunk is lazy-loaded and the canvas is shared. Repeated props use instancing. Lighting is unshadowed and all textures are procedural, so no image downloads. Quality adapts through PerformanceMonitor and drops to low on touch devices. The render loop pauses when the hero is off-screen.
- Unbuilt rooms (About to Community) are honest anchor sections marked "in development", so every nav item works.
