import { useState } from 'react'

// Skeleton-type fallback colors (used when no external source is matched).
export const SKELETON_COLOR = {
  KPI: '#2563EB',
  Chart: '#06B6D4',
  List: '#A78BFA',
  Table: '#10B981',
  Timeline: '#F59E0B',
  'AI Summary': '#EC4899',
  Gauge: '#14B8A6',
  Map: '#6366F1',
  'Line Chart': '#06B6D4',
  'Bar Chart': '#2563EB',
  'Pie / Donut': '#A78BFA',
  'Heat Map': '#EF4444',
  Correlation: '#14B8A6',
  Carousel: '#F59E0B',
  Donut: '#A78BFA',
  Funnel: '#F97316',
  Board: '#0EA5E9',
  Feed: '#22C55E',
  Alerts: '#EF4444',
  'Stat Row': '#2563EB',
  'Cost KPI': '#0D9488',
  'Usage Heatmap': '#0EA5A4',
  'Spend Breakdown': '#0891B2',
  'Composite Stat': '#0D9488',
}

// External integrations with Simple Icons CDN support.
// Icon served as white SVG from cdn.simpleicons.org/{slug}/ffffff.
const SOURCE_MAP = {
  'stripe':      { slug: 'stripe',      bg: '#635BFF' },
  'hubspot':     { slug: 'hubspot',     bg: '#FF7A59' },
  'zendesk':     { slug: 'zendesk',     bg: '#03363D' },
  'intercom':    { slug: 'intercom',    bg: '#1F8DED' },
  'greenhouse':  { slug: 'greenhouse',  bg: '#24A47F' },
  'google ads':  { slug: 'googleads',   bg: '#4285F4' },
  'quickbooks':  { slug: 'quickbooks',  bg: '#2CA01C' },
  'snowflake':   { slug: 'snowflake',   bg: '#29B5E8' },
}

// Known external brands without a Simple Icons entry: show source initials
// on the brand color. Keys are lowercase substrings of the source field.
const BRANDED_FALLBACK = {
  'salesforce': { initials: 'SF', bg: '#00A1E0' },
  'workday':    { initials: 'WD', bg: '#CF4500' },
  'netsuite':   { initials: 'NS', bg: '#F3901D' },
}

// Match source against CDN map. Returns { slug, bg } or null.
function resolveSource(source = '') {
  const lower = source.toLowerCase()
  for (const [key, meta] of Object.entries(SOURCE_MAP)) {
    if (lower.includes(key)) return meta
  }
  return null
}

// Match source against branded-fallback map. Returns { initials, bg } or null.
function resolveBranded(source = '') {
  const lower = source.toLowerCase()
  for (const [key, meta] of Object.entries(BRANDED_FALLBACK)) {
    if (lower.includes(key)) return meta
  }
  return null
}

// Four-tier icon resolution:
//   0. Source contains "AIMS" → real AIMS logo mark on dark navy bg
//   1. Source in SOURCE_MAP → real brand SVG from Simple Icons CDN
//   2. Source in BRANDED_FALLBACK → source initials on brand color (no CDN)
//   3. Everything else → skeleton-type abbreviation on skeleton color
export function WidgetGlyph({ skeleton = 'KPI', source = '', sm = false }) {
  const [imgErr, setImgErr] = useState(false)
  const isAims     = source.toLowerCase().includes('aims')
  const srcMeta    = !isAims ? resolveSource(source) : null
  const branded    = !isAims && !srcMeta ? resolveBranded(source) : null
  const sizeClass  = sm ? '!h-7 !w-7 text-[10px]' : ''
  const imgSize    = sm ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]'

  // Tier 0: AIMS OS brand mark — larger size since the SVG has generous whitespace
  if (isAims && !imgErr) {
    const aimsSize = sm ? 'h-6 w-6' : 'h-[30px] w-[30px]'
    return (
      <span
        role="img"
        aria-label="AIMS OS"
        className={`logo-sq ${sizeClass} overflow-hidden`}
        style={{ background: '#0B1120' }}
      >
        <img
          src={`${import.meta.env.BASE_URL}aims-logo.svg`}
          alt=""
          aria-hidden="true"
          className={`${aimsSize} object-contain`}
          onError={() => setImgErr(true)}
        />
      </span>
    )
  }

  // Tier 1: real icon from Simple Icons CDN
  if (srcMeta && !imgErr) {
    return (
      <span
        role="img"
        aria-label={source}
        className={`logo-sq ${sizeClass} overflow-hidden`}
        style={{ background: srcMeta.bg }}
      >
        <img
          src={`https://cdn.simpleicons.org/${srcMeta.slug}/ffffff`}
          alt=""
          aria-hidden="true"
          className={`${imgSize} object-contain`}
          onError={() => setImgErr(true)}
        />
      </span>
    )
  }

  // Tier 2: brand color + source initials (no CDN required)
  if (branded) {
    return (
      <span
        role="img"
        aria-label={source}
        className={`logo-sq ${sizeClass}`}
        style={{ background: branded.bg }}
      >
        {branded.initials}
      </span>
    )
  }

  // Tier 3: skeleton-type abbreviation
  return (
    <span
      role="img"
      aria-label={`${skeleton} widget`}
      className={`logo-sq ${sizeClass}`}
      style={{ background: SKELETON_COLOR[skeleton] || '#2563EB' }}
    >
      {skeleton.slice(0, 2).toUpperCase()}
    </span>
  )
}
