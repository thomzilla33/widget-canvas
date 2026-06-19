// Resolves a dashboard's widget layout for consumption + the canvas.
// A layout is now a single ORDERED ARRAY of placements (no zones) — widgets flow in
// one responsive grid and each carries its own `size` (sm/md/lg → column span).
import { TEMPLATE_SEED } from './mock.js'

// Initial size when seeding from a template (the old zone hints become sizes).
const ZONE_SIZE = { header: 'sm', sidebar: 'md', main: 'lg', bottom: 'md' }
// Reading order for migrating a legacy zoned layout into the flat array.
const ZONE_ORDER = ['header', 'sidebar', 'main', 'bottom']

// Real widget count for a dashboard (from its persisted/seeded layout).
export function widgetCount(dashboard) {
  return dashboardLayout(dashboard).length
}

export function dashboardLayout(dashboard) {
  const l = dashboard?.layout
  if (Array.isArray(l)) return l // new flat model
  // Migrate an old zoned layout, preserving header→sidebar→main→bottom reading order
  // (then any other keys), instead of relying on object insertion order.
  if (l && typeof l === 'object') {
    const known = ZONE_ORDER.flatMap((z) => l[z] || [])
    const extra = Object.keys(l).filter((k) => !ZONE_ORDER.includes(k)).flatMap((k) => l[k] || [])
    return [...known, ...extra]
  }
  const seed = TEMPLATE_SEED[dashboard?.template]
  if (!seed) return [] // template-less → empty state (no misleading content)
  return seed.map((item, i) => ({
    pid: `${dashboard?.id || 'd'}-${i}`,
    widgetId: item.widgetId,
    size: item.size || ZONE_SIZE[item.zone] || 'md',
    fixed: false,
    audiences: [], // [] = visible to all audiences
    quickActions: [],
  }))
}
