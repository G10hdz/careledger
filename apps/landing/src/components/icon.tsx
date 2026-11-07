import type { ReactNode } from 'react'

export type IconName =
  | 'arrow-right'
  | 'bank'
  | 'building'
  | 'bus'
  | 'check'
  | 'clock'
  | 'coins'
  | 'download'
  | 'external'
  | 'heart'
  | 'home'
  | 'lightbulb'
  | 'map-pin'
  | 'moon'
  | 'pen'
  | 'qr'
  | 'route'
  | 'shield'
  | 'spark'
  | 'store'
  | 'user-check'
  | 'users'
  | 'wifi-off'

const paths: Record<IconName, ReactNode> = {
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  bank: <path d="M3 10 12 4l9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18" />,
  building: (
    <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4M8 19h4" />
  ),
  bus: (
    <>
      <path d="M6 3h12a2 2 0 0 1 2 2v11H4V5a2 2 0 0 1 2-2Z" />
      <path d="M4 11h16M8 20v-4M16 20v-4" />
      <circle cx="7.5" cy="17" r="1" />
      <circle cx="16.5" cy="17" r="1" />
    </>
  ),
  check: <path d="m5 12 5 5L20 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  coins: (
    <>
      <circle cx="9" cy="9" r="6" />
      <path d="M15.5 5.5a6 6 0 0 1 0 11" />
    </>
  ),
  download: <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
  external: <path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />,
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
  ),
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.2 2.2h4.8c.1-.8.5-1.6 1.2-2.2A6 6 0 0 0 12 3Z" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  pen: <path d="m12 20 9-9-4-4-9 9-1 5 5-1ZM14 6l4 4" />,
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="3" />
      <circle cx="18" cy="5" r="3" />
      <path d="M9 19h5a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  spark: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3v2.5M12 18.5V21M4.6 7.6l2.2 1.3M17.2 15.1l2.2 1.3M4.6 16.4l2.2-1.3M17.2 8.9l2.2-1.3" />
    </>
  ),
  store: (
    <path d="M4 10h16M5 10V6l1-2h12l1 2v4M5 10v10h14V10M9 20v-5h6v5M3 10a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 3 0" />
  ),
  'user-check': (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m16 11 2 2 4-4" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  'wifi-off': (
    <>
      <path d="M2 2l20 20M8.5 8.5A10 10 0 0 1 22 9M2 9a15 15 0 0 1 4.5-1.7M5 12.5a10 10 0 0 1 5.5-1.2M8.5 16a5 5 0 0 1 7 0" />
      <circle cx="12" cy="20" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
}

export function Icon({
  name,
  className = 'h-5 w-5',
  strokeWidth = 1.75,
}: {
  name: IconName
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}
