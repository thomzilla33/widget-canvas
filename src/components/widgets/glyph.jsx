// Shared connector-style glyph for widgets (mirrors the integration-card logos).
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
}

export function WidgetGlyph({ skeleton = 'KPI', sm = false }) {
  return (
    <span
      role="img"
      aria-label={`${skeleton} widget`}
      className={`logo-sq ${sm ? '!h-7 !w-7 text-[10px]' : ''}`}
      style={{ background: SKELETON_COLOR[skeleton] || '#2563EB' }}
    >
      {skeleton.slice(0, 2).toUpperCase()}
    </span>
  )
}
