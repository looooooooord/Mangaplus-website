import type { ReactNode, SVGProps } from 'react';

export type IconName =
  | 'search'
  | 'close'
  | 'menu'
  | 'sun'
  | 'moon'
  | 'user'
  | 'logout'
  | 'library'
  | 'heart'
  | 'heartFilled'
  | 'bookmark'
  | 'bookmarkFilled'
  | 'play'
  | 'download'
  | 'arrowRight'
  | 'arrowLeft'
  | 'arrowUp'
  | 'arrowDown'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronUp'
  | 'star'
  | 'starFilled'
  | 'check'
  | 'checkCircle'
  | 'alert'
  | 'info'
  | 'book'
  | 'bookOpen'
  | 'layers'
  | 'settings'
  | 'home'
  | 'compass'
  | 'mail'
  | 'lock'
  | 'eye'
  | 'eyeOff'
  | 'shield'
  | 'sparkles'
  | 'grid'
  | 'filter'
  | 'list'
  | 'expand'
  | 'shrink'
  | 'clock'
  | 'calendar'
  | 'refresh'
  | 'trash'
  | 'external'
  | 'globe'
  | 'device'
  | 'arrowUpRight'
  | 'pen'
  | 'headset';

const shapes: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.6 16.6 21 21" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </>
  ),
  moon: <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5M5 12h11" />
    </>
  ),
  library: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5Z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z" />,
  heartFilled: (
    <path
      d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z"
      fill="currentColor"
      stroke="currentColor"
    />
  ),
  bookmark: <path d="M6 4h12v17l-6-4.2L6 21V4Z" />,
  bookmarkFilled: (
    <path d="M6 4h12v17l-6-4.2L6 21V4Z" fill="currentColor" stroke="currentColor" />
  ),
  play: <path d="M8 5.5 19 12 8 18.5v-13Z" fill="currentColor" stroke="currentColor" />,
  download: (
    <>
      <path d="M12 3v11" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),
  arrowRight: <path d="M4 12h16M13 5l7 7-7 7" />,
  arrowLeft: <path d="M20 12H4M11 19l-7-7 7-7" />,
  arrowUp: <path d="M12 20V4M5 11l7-7 7 7" />,
  arrowDown: <path d="M12 4v16M19 13l-7 7-7-7" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronLeft: <path d="M15 5l-7 7 7 7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  chevronUp: <path d="M6 15l6-6 6 6" />,
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5Z" />,
  starFilled: (
    <path
      d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5Z"
      fill="currentColor"
      stroke="currentColor"
    />
  ),
  check: <path d="M4 12.5l5 5L20 6.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.4l2.7 2.6L16.5 9" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 21.5 20H2.5L12 3.5Z" />
      <path d="M12 9.5v5" />
      <circle cx="12" cy="17.6" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" />
      <circle cx="12" cy="7.6" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.2C10 4.2 7.5 3.5 4 3.5V19c3.5 0 6 .7 8 2.7 2-2 4.5-2.7 8-2.7V3.5c-3.5 0-6 .7-8 2.7Z" />
      <path d="M12 6.2v15.5" />
    </>
  ),
  bookOpen: (
    <>
      <path d="M3 5.5h5a4 4 0 0 1 4 4v10a3.5 3.5 0 0 0-3.5-3.5H3V5.5Z" />
      <path d="M21 5.5h-5a4 4 0 0 0-4 4v10a3.5 3.5 0 0 1 3.5-3.5H21V5.5Z" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 12l9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h7M15 7h5M4 17h4M12 17h8" />
      <circle cx="13" cy="7" r="2.4" />
      <circle cx="9.5" cy="17" r="2.4" />
    </>
  ),
  home: (
    <>
      <path d="M3 11l9-7.5 9 7.5v8.5a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11Z" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13.7 14l-5.2 1.5L10.3 10l5.2-1.5Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7.5 12 13l8.5-5.5" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4 4l16 16" />
      <path d="M9.8 5.9A10.8 10.8 0 0 1 12 5.6c6 0 9.5 6.4 9.5 6.4a17 17 0 0 1-3 3.7M6.2 7.3A17.6 17.6 0 0 0 2.5 12S6 18.4 12 18.4c1.2 0 2.3-.2 3.3-.6" />
      <path d="M9.6 10.2a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />,
  sparkles: (
    <>
      <path d="M12 3l1.7 4.5L18 9.2l-4.3 1.7L12 15.4l-1.7-4.5L6 9.2l4.3-1.7L12 3Z" />
      <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  filter: <path d="M3 5h18M6 12h12M10 19h4" />,
  list: (
    <>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  expand: <path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5" />,
  shrink: <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.4l3.4 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-2.4 6.4" />
      <path d="M20 4.5V11h-6.5" />
    </>
  ),
  trash: <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.9 13h9.2l.9-13" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.8 3.4 2.8 14.6 0 18M12 3c-2.8 3.4-2.8 14.6 0 18" />
    </>
  ),
  device: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 5.5h2" />
    </>
  ),
  arrowUpRight: <path d="M7 17 17 7M9 7h8v8" />,
  pen: <path d="M4 20l4.5-1L20 7.5 16.5 4 5 15.5 4 20Z" />,
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.5" y="13" width="4.5" height="7" rx="2" />
      <rect x="17" y="13" width="4.5" height="7" rx="2" />
      <path d="M20 19.5c0 1.4-1.6 2.5-3.5 2.5" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 22, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {shapes[name]}
    </svg>
  );
}
