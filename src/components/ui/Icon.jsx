/**
 * Inline SVG icon set.
 *
 * A small, hand-rolled set keeps the bundle free of an icon dependency.
 * All icons are 24×24, stroked, and inherit `currentColor`.
 * @module components/ui/Icon
 */

import PropTypes from 'prop-types'

/** @type {Record<string, string>} */
const PATHS = {
  // Navigation
  dashboard: 'M3.5 3.5h7v7h-7zM13.5 3.5h7v4.5h-7zM13.5 11h7v9.5h-7zM3.5 13.5h7v7h-7z',
  inbox: 'M3.5 13.5h4l1.5 3h6l1.5-3h4M3.5 13.5 6 5.5h12l2.5 8v6a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z',
  clipboard: 'M9 4.5H7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-14a1 1 0 0 0-1-1h-2M9 4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9zM9 11h6M9 15h4',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 12h17M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18z',
  layers: 'm12 3 8.5 4.5L12 12 3.5 7.5zM3.5 12 12 16.5 20.5 12M3.5 16.5 12 21l8.5-4.5',
  users: 'M16 20v-1.5a4 4 0 0 0-4-4H6.5a4 4 0 0 0-4 4V20M9.25 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21.5 20v-1.5a4 4 0 0 0-3-3.87M15.5 3.63a4 4 0 0 1 0 7.75',
  user: 'M19 20v-1.5a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5V20M12 10.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.75 9.5a2.25 2.25 0 1 1 3.4 1.92c-.65.4-1.15.95-1.15 1.83v.25M12 17h.01',

  // Status & workflow
  check: 'm5 12.5 4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6 6 18',
  checkCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 12.25l2.5 2.5 4.5-5',
  xCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9l6 6M15 9l-6 6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2',
  eye: 'M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  package: 'M12 3.5 20 8v8l-8 4.5L4 16V8zM4 8l8 4.5L20 8M12 12.5V21',
  zap: 'M13 3 5 13.5h6L11 21l8-10.5h-6z',
  bell: 'M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5M13.75 19a2 2 0 0 1-3.5 0',
  rotate: 'M3.5 12a8.5 8.5 0 1 0 2.6-6.1M3.5 4.5V10h5.5',
  upload: 'M12 16V4.5M8 8l4-3.5L16 8M4.5 16v2.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V16',

  // Documents & data
  file: 'M13.5 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8zM13.5 3.5V8H18M8.5 12.5h7M8.5 16h5',
  paperclip: 'M20 11.5 12 19.5a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 1 1 5 5L10 17.5a2 2 0 0 1-3-3l7.5-7.5',
  download: 'M12 4.5V16M8 12.5l4 3.5 4-3.5M4.5 19.5h15',
  message: 'M20 15a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20.5 20.5 16 16',
  filter: 'M3.5 5.5h17l-6.5 7.5v6l-4 2v-8z',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',

  // People
  userCheck: 'M15.5 20v-1.5a4 4 0 0 0-4-4h-3a4 4 0 0 0-4 4V20M10 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5zM16 11l2 2 4-4',
  userPlus: 'M15 20v-1.5a4 4 0 0 0-4-4h-3a4 4 0 0 0-4 4V20M9.5 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5zM18.5 7v6M21.5 10h-6',

  // Interface
  menu: 'M4 7h16M4 12h16M4 17h16',
  chevronDown: 'm6 9.5 6 6 6-6',
  chevronRight: 'm9.5 6 6 6-6 6',
  chevronLeft: 'm14.5 6-6 6 6 6',
  chevronUp: 'm6 14.5 6-6 6 6',
  close: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4.5 6.5h15M9.5 6.5V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5M6.5 6.5 7.5 20a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1l1-13.5M10 10.5v6M14 10.5v6',
  edit: 'M4.5 19.5h4L19 9a2.12 2.12 0 0 0-3-3L5.5 16.5zM14.5 7.5l2 2',
  external: 'M13.5 4.5H19.5V10.5M19.5 4.5 11 13M17 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5',
  copy: 'M9 9.5a1 1 0 0 0-1 1V19a1 1 0 0 0 1 1h9.5a1 1 0 0 0 1-1v-8.5a1 1 0 0 0-1-1zM5.5 15.5A1.5 1.5 0 0 1 4 14V4.5a1 1 0 0 1 1-1H15a1 1 0 0 1 1.5 1.5',
  share: 'M17 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM7 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM17 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM9.2 10.8l5.6-2.8M9.2 13.2l5.6 2.8',
  quote: 'M9 6.5C6.5 8 5 10.2 5 13v4.5h5V12H7.5c0-1.8.6-3.2 2-4zM19 6.5C16.5 8 15 10.2 15 13v4.5h5V12h-2.5c0-1.8.6-3.2 2-4z',
  book: 'M4 4.5A1 1 0 0 1 5 3.5h5.5v17H5a1 1 0 0 1-1-1zM19.5 4.5a1 1 0 0 0-1-1H13v17h5.5a1 1 0 0 0 1-1z',
  lock: 'M6.5 10.5V8a5.5 5.5 0 0 1 11 0v2.5M5.5 10.5h13a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-8.5a1 1 0 0 1 1-1z',
  logout: 'M15 16.5v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v2M10 12h10M17 8.5l3.5 3.5-3.5 3.5',
  warning: 'M12 8.5v4.5M12 16.5h.01M10.3 4l-7 12.2A2 2 0 0 0 5 19.5h14a2 2 0 0 0 1.7-3.3L13.7 4a2 2 0 0 0-3.4 0z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 7.75h.01',
  refresh: 'M20.5 11a8.5 8.5 0 0 0-14.6-5M3.5 13a8.5 8.5 0 0 0 14.6 5M3.5 5v5h5M20.5 19v-5h-5',
  calendar: 'M7 3.5v3M17 3.5v3M4 9.5h16M5.5 5.5h13a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z',
  send: 'M20.5 3.5 10.5 13.5M20.5 3.5l-6.5 17-3.5-7-7-3.5z',
  grip: 'M9 6.5h.01M9 12h.01M9 17.5h.01M15 6.5h.01M15 12h.01M15 17.5h.01',
}

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.7, ...rest }) {
  const d = PATHS[name]
  if (!d) return null
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={d} />
    </svg>
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  className: PropTypes.string,
  strokeWidth: PropTypes.number,
}
