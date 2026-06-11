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
}

export function WidgetGlyph({ skeleton = 'KPI', sm = false }) {
  return (
    <span
      className={`logo-sq ${sm ? '!h-7 !w-7 text-[10px]' : ''}`}
      style={{ background: SKELETON_COLOR[skeleton] || '#2563EB' }}
    >
      {skeleton.slice(0, 2).toUpperCase()}
    </span>
  )
}
