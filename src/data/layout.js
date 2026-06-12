// Resolves a dashboard's widget layout for read-only consumption surfaces.
// Derived from the dashboard's template seed (canvas edits aren't persisted in
// this prototype). Sizes vary by zone so a board reads like a real dashboard.
import { TEMPLATE_SEED } from './mock.js'

export const VIEW_ZONES = [
  { key: 'header', label: 'Header', span: 'md:col-span-4' },
  { key: 'sidebar', label: 'Sidebar', span: 'md:col-span-1' },
  { key: 'main', label: 'Main', span: 'md:col-span-3' },
  { key: 'bottom', label: 'Bottom', span: 'md:col-span-4' },
]

const ZONE_SIZE = { header: 'sm', sidebar: 'md', main: 'lg', bottom: 'md' }

export function dashboardLayout(dashboard) {
  // Forward-compatible: use a persisted layout if one ever exists.
  if (dashboard?.layout) return dashboard.layout
  const zones = { header: [], sidebar: [], main: [], bottom: [] }
  const seed = TEMPLATE_SEED[dashboard?.template]
  if (!seed) return zones // template-less → empty state (no misleading content)
  seed.forEach((item, i) => {
    zones[item.zone].push({
      pid: `${dashboard?.id || 'd'}-${i}`,
      widgetId: item.widgetId,
      size: ZONE_SIZE[item.zone] || 'md',
      fixed: item.zone === 'header',
    })
  })
  return zones
}
