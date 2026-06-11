import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHeader, HealthBadge, FreshnessBadge } from '../components/common/index.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'

// Logo color per skeleton type (mirrors the integration-card connector glyphs).
const SKELETON_COLOR = {
  KPI: '#2563EB',
  Chart: '#06B6D4',
  List: '#A78BFA',
  Table: '#10B981',
  Timeline: '#F59E0B',
  'AI Summary': '#EC4899',
  Gauge: '#14B8A6',
  Map: '#6366F1',
}

// S37, S38, S40–S47 — catalog + health signals
export default function WidgetLibrary() {
  const navigate = useNavigate()
  const { widgets } = useWidgets()
  const [cat, setCat] = useState('All')

  const cats = ['All', ...Array.from(new Set(widgets.map((w) => w.skeleton)))]
  const shown = cat === 'All' ? widgets : widgets.filter((w) => w.skeleton === cat)
  const governedCount = widgets.filter((w) => w.governed).length

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Widget Library"
        description={`${widgets.length} widgets · ${governedCount} governed`}
        actions={
          <button className="btn-primary" onClick={() => navigate('/widgets/new')}>
            + New widget
          </button>
        }
      />

      {/* Filters (matches .filters / .chip) */}
      <div className="flex items-center gap-2 flex-wrap px-6 py-3 border-b border-gray-200 dark:border-white/10">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input className="input h-9 w-52 pl-8" placeholder="Search widgets…" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`h-7 rounded-full border px-3 text-xs font-semibold transition-colors ${
                cat === c
                  ? 'border-aims-blue/40 bg-aims-blue/10 text-aims-blue'
                  : 'border-gray-300 text-gray-500 hover:text-gray-700 dark:border-white/15 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(264px,1fr))' }}>
          {shown.map((w) => (
            <button
              key={w.id}
              onClick={() => navigate('/widgets/new')}
              className="catalog-card min-h-[164px]"
            >
              <div className="absolute top-3 right-3">
                <HealthBadge health={w.health} />
              </div>

              <div className="flex items-center gap-3">
                <span className="logo-sq" style={{ background: SKELETON_COLOR[w.skeleton] || '#2563EB' }}>
                  {w.skeleton.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 pr-16">
                  <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {w.name}
                  </div>
                  <div className="truncate text-[11px] text-gray-400 dark:text-slate-500">{w.source}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="cap-chip cap-chip-neutral">{w.skeleton}</span>
                <span className={`cap-chip ${w.governed ? 'cap-chip-data' : 'cap-chip-tool'}`}>
                  {w.governed ? 'Governed' : 'Ungoverned'}
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
                <span className="text-[11px] text-gray-500 dark:text-slate-400">
                  Used in {w.usedIn} dashboard{w.usedIn === 1 ? '' : 's'}
                </span>
                <FreshnessBadge status={w.freshness} label={w.freshness} />
              </div>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400 dark:text-slate-500">Screens hosted here: S37, S38, S40–S47</p>
      </div>
    </div>
  )
}
