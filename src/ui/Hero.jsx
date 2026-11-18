import { useState, useCallback, lazy, Suspense, useEffect, useRef } from 'react'
import { navigateTo } from '../state/navigation'
import { joinPack } from './actions'
import { live, useDirector } from '../state/director'
import { domRefs } from './domRefs'
import { Icon } from './Icons'
import BrandImage from './BrandImage'
import ProtocolStrip from './ProtocolStrip'
import { SITE } from '../config/site'
import { layout, isNarrow } from '../three/framing'

/**
 * Measures the free area the 3D composition may use: below the nav bar,
 * above the protocol strip, between the two text columns. The camera is
 * fitted to this box (three/framing.js), so nothing overlaps at any size.
 */
function useSafeArea(stageRef) {
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      const s = stage.getBoundingClientRect()
      if (!s.width || !s.height) return
      const nav = document.querySelector('.nav__bar')?.getBoundingClientRect()
      const strip = document.querySelector('.strip')?.getBoundingClientRect()
      const left = document.querySelector('.hero__left')?.getBoundingClientRect()
      const right = document.querySelector('.hero__right')?.getBoundingClientRect()
      const stacked = getComputedStyle(stage).position !== 'absolute'
      const scrollY = window.scrollY
      // use document-space positions so measuring while scrolled is still correct
      const sTop = s.top + scrollY
      const navBottom = nav ? nav.bottom : 0 // nav is fixed: viewport space, relative to a top-scrolled page
      const top = Math.max(0, navBottom - sTop) + (stacked ? 18 : 26)
      const stripTop = strip ? strip.top + scrollY : Infinity
      const bottom = Math.max(0, sTop + s.height - stripTop) + (stacked ? 14 : 24)
      let halfW = s.width / 2 - 16
      if (!stacked && left && right) {
        const cx = s.left + s.width / 2
        halfW = Math.min(cx - left.right, right.left - cx) - 24
      }
      const narrow = isNarrow(s.width, s.height)
      if (useDirector.getState().stageNarrow !== narrow) useDirector.setState({ stageNarrow: narrow })
      Object.assign(layout, { top, bottom, halfW: Math.max(120, halfW), width: s.width, height: s.height, version: layout.version + 1 })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    ;['.nav__bar', '.strip', '.hero__left', '.hero__right'].forEach((q) => {
      const el = document.querySelector(q)
      if (el) ro.observe(el)
    })
    document.fonts?.ready?.then(measure)
    return () => ro.disconnect()
  }, [stageRef])
}

const Experience = lazy(() => import('../three/Experience'))

function AlphaDisplay() {
  const [active, setActive] = useState(false)
  const ref = useCallback((el) => (domRefs.wolf = el), [])
  const on = () => {
    live.hoverTarget = 1
    setActive(true)
  }
  const off = () => {
    live.hoverTarget = 0
    setActive(false)
  }
  return (
    <div
      ref={ref}
      className={`alpha-display ${active ? 'is-active' : ''}`}
      tabIndex={0}
      role="group"
      aria-label="The Alpha Display — official MALVOT ALPHA artwork"
      onPointerEnter={on}
      onPointerLeave={off}
      onFocus={on}
      onBlur={off}
    >
      <BrandImage asset="officialWolfPrimary" eager slotLabel="Official primary wolf artwork" />
      <span className="alpha-display__label" aria-hidden={!active}>
        <i /> Alpha identity verified
      </span>
    </div>
  )
}

function Stage() {
  const failed = useDirector((s) => s.webglFailed)
  const ref = useRef(null)
  const [visible, setVisible] = useState(true)
  useSafeArea(ref)
  // suspend the render loop when the command deck is off-screen
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <div className={`hero__stage ${failed ? 'is-static' : ''}`} ref={ref}>
      {!failed && (
        <Suspense fallback={null}>
          <Experience active={visible} />
        </Suspense>
      )}
      <AlphaDisplay />
    </div>
  )
}

export default function Hero() {
  const phase = useDirector((s) => s.phase)
  return (
    <section id="hero" className={`hero phase-${phase}`} aria-labelledby="hero-title">
      <Stage />

      <div className="hero__col hero__left">
        <p className="eyebrow">
          <span className="eyebrow__line" aria-hidden="true" />
          {SITE.network} · Community Meme Token
          <span className="eyebrow__line" aria-hidden="true" />
        </p>
        <h1 id="hero-title" className="slogan">
          <span className="slogan__line">
            One Wolf<b>.</b>
          </span>
          <span className="slogan__line slogan__line--cyan">
            One{' '}
            <br />
            Community<b>.</b>
          </span>
          <span className="slogan__line">
            One Vision<b>.</b>
          </span>
        </h1>
        <span className="slogan__rule" aria-hidden="true" />
      </div>

      <div className="hero__col hero__right">
        <h2 className="ident">
          {SITE.project} <span className="ident__dash">—</span> <span className="c-gold">{SITE.ticker}</span>
        </h2>
        <p className="ident__copy">A community-first Solana meme token with a bold cyber-wolf identity.</p>
        <p className="ident__flag">
          <span>The wolf never stops building.</span>
        </p>
        <p className="ident__sub">Community first. Transparency always.</p>
        <div className="ctas">
          <button type="button" className="btn btn--primary" onClick={joinPack}>
            Join the Wolf Pack <Icon.chevron />
          </button>
          <button type="button" className="btn btn--gold" onClick={() => navigateTo('token')}>
            Explore $MALV <Icon.chevron />
          </button>
          <a
            href="#malvot-ai"
            className="link-tech"
            onClick={(e) => {
              e.preventDefault()
              navigateTo('malvot-ai')
            }}
          >
            Discover MALVOT AI <Icon.chevron />
          </a>
        </div>
        <p className="ident__status">
          <i aria-hidden="true" />
          {SITE.contractAddress ? (
            <>
              Contract <span className="ident__ca">{SITE.contractAddress.slice(0, 6)}…{SITE.contractAddress.slice(-4)}</span>
            </>
          ) : (
            'Contract address · awaiting official confirmation'
          )}
        </p>
      </div>

      <ProtocolStrip />
    </section>
  )
}
