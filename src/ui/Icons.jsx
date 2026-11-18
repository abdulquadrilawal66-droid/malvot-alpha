const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export const Icon = {
  solana: (p) => (
    <svg {...base} {...p}>
      <path d="M6 6.5h13l-2 2.5H4z" />
      <path d="M4 11h13l2 2.5H6z" />
      <path d="M6 15.5h13l-2 2.5H4z" />
    </svg>
  ),
  pack: (p) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="8" r="2.6" />
      <circle cx="5.5" cy="10" r="2" />
      <circle cx="18.5" cy="10" r="2" />
      <path d="M7.5 18c.6-2.8 2.3-4.3 4.5-4.3s3.9 1.5 4.5 4.3" />
      <path d="M2.5 17.5c.4-1.8 1.5-2.8 3-2.8M21.5 17.5c-.4-1.8-1.5-2.8-3-2.8" />
    </svg>
  ),
  chip: (p) => (
    <svg {...base} {...p}>
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M10 10h4v4h-4z" />
      <path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3" />
    </svg>
  ),
  map: (p) => (
    <svg {...base} {...p}>
      <path d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </svg>
  ),
  layers: (p) => (
    <svg {...base} {...p}>
      <path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5" />
      <path d="m3.5 16 8.5 4.5 8.5-4.5" />
    </svg>
  ),
  group: (p) => (
    <svg {...base} {...p}>
      <circle cx="9" cy="8.5" r="2.8" />
      <circle cx="16.5" cy="9.5" r="2.2" />
      <path d="M3.5 19c.6-3.3 2.6-5 5.5-5s4.9 1.7 5.5 5" />
      <path d="M15 14.2c2.6-.3 4.6 1.2 5.3 4.3" />
    </svg>
  ),
  chevron: (p) => (
    <svg {...base} width={14} height={14} strokeWidth={2.4} {...p}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  ),
  menu: (p) => (
    <svg {...base} {...p}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  ),
  close: (p) => (
    <svg {...base} {...p}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ),
}
