import { useState } from 'react'
import { BRAND_ASSETS } from '../brand/assets'

/**
 * Renders a protected brand asset exactly as supplied.
 * No CSS filters, no transforms beyond uniform scaling, aspect ratio preserved.
 * If the file has not been installed yet, an honest "asset slot" is shown —
 * never a generated or substitute wolf.
 */
export default function BrandImage({ asset, className = '', slotLabel, eager = false, decorative = false }) {
  const a = BRAND_ASSETS[asset]
  const [missing, setMissing] = useState(false)
  if (!a) return null
  if (missing) {
    return (
      <div className={`asset-slot ${className}`} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : `${a.alt} (asset pending)`}>
        <span className="asset-slot__frame" aria-hidden="true" />
        {slotLabel !== false && (
          <span className="asset-slot__label">
            <strong>{slotLabel || 'Official artwork slot'}</strong>
            <code>public{a.src.replace(import.meta.env.BASE_URL, '/')}</code>
          </span>
        )}
      </div>
    )
  }
  return (
    <img
      className={`brand-img ${className}`}
      src={a.src}
      alt={decorative ? '' : a.alt}
      draggable="false"
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      fetchpriority={eager ? 'high' : undefined}
      onError={() => setMissing(true)}
      data-protected-asset={a.id}
    />
  )
}
