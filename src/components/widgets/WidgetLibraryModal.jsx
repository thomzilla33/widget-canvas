import { useState } from 'react'
import { LayoutGrid, X, Search, ChevronLeft, Info, Plus, Check } from 'lucide-react'
import { WidgetGlyph } from './glyph.jsx'
import WidgetRender from './WidgetRender.jsx'
import { EmptyState, FreshnessBadge, GovernedBadge } from '../common/index.jsx'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { CardContainer } from '@/components/ui/CardContainer'
import { widgets, CATALOG_CATEGORIES, WIDGET_SIZES, SKELETON_ABOUT, SKELETON_BESTFOR } from '../../data/mock.js'
import { SIZE_PRESETS, colsToDetail } from '../../data/layout.js'

const PREVIEW_WIDTH = { sm: 'max-w-[240px]', md: 'max-w-md', lg: 'max-w-2xl' }

// Marketplace-style browser over the widget library — used on the canvas to add
// a real widget to a zone (with a size preview), instead of a thin list.
export default function WidgetLibraryModal({ zoneLabel, onAdd, onClose }) {
  const [search, setSearch] = useState('')
  const [activeCats, setActiveCats] = useState(new Set())
  const [selected, setSelected] = useState(null)
  const [checkedIds, setCheckedIds] = useState(new Set())

  const toggleCat = (c) =>
    setActiveCats((prev) => {
      const n = new Set(prev)
      n.has(c) ? n.delete(c) : n.add(c)
      return n
    })
  const clearAll = () => {
    setActiveCats(new Set())
    setSearch('')
  }

  function toggleCheck(id) {
    setCheckedIds((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function handleAddSelected() {
    widgets
      .filter((w) => checkedIds.has(w.id))
      .forEach((w) => onAdd(w, SIZE_PRESETS.md))
    setCheckedIds(new Set())
  }

  const counts = Object.fromEntries(CATALOG_CATEGORIES.map((c) => [c, widgets.filter((w) => w.category === c).length]))
  const q = search.trim().toLowerCase()
  const list = widgets.filter((w) => {
    if (activeCats.size && !activeCats.has(w.category)) return false
    if (q && !(w.name.toLowerCase().includes(q) || w.source.toLowerCase().includes(q))) return false
    return true
  })

  const anyChecked = checkedIds.size > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative z-10 flex h-full w-full max-w-[1400px] flex-col overflow-hidden p-0 sm:h-[calc(100vh-40px)] sm:w-[calc(100vw-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: 'linear-gradient(135deg,rgba(43,127,255,.2),rgba(167,139,250,.2))', border: '1px solid rgba(43,127,255,.3)' }}>
              <LayoutGrid size={18} className="text-aims-blue" />
            </span>
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-slate-100">Add a widget</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">From your widget library{zoneLabel ? ` · into ${zoneLabel}` : ''}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {selected ? (
            <Detail
              widget={selected}
              onBack={() => setSelected(null)}
              onAdd={(dims) => onAdd(selected, dims)}
            />
          ) : (
            <>
              {/* Rail */}
              <div className="max-h-[34vh] w-full shrink-0 overflow-auto border-b border-gray-200 p-4 dark:border-white/10 md:max-h-none md:w-[220px] md:border-b-0 md:border-r">
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">Categories</div>
                <div className="space-y-0.5">
                  {CATALOG_CATEGORIES.map((c) => {
                    const on = activeCats.has(c)
                    return (
                      <label key={c} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5">
                        <input type="checkbox" checked={on} onChange={() => toggleCat(c)} />
                        <span className={`flex-1 text-xs ${on ? 'font-semibold text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-300'}`}>{c}</span>
                        <Tag variant="neutral" size="sm">{counts[c]}</Tag>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="border-b border-gray-200 px-6 py-3 dark:border-white/10">
                  <div className="relative max-w-md">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400" />
                    <input className="input h-9 pl-8" placeholder="Search your widgets…" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  {list.length === 0 ? (
                    <EmptyState icon="🔍" title="No widgets match" description="Try a different search or clear filters." action={<Button variant="secondary" size="default" onClick={clearAll}>Clear filters</Button>} />
                  ) : (
                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))' }}>
                      {list.map((w) => (
                        <Card
                          key={w.id}
                          widget={w}
                          onOpen={() => { if (!anyChecked) setSelected(w) }}
                          onAdd={() => onAdd(w, SIZE_PRESETS.md)}
                          isChecked={checkedIds.has(w.id)}
                          onToggle={() => toggleCheck(w.id)}
                          anyChecked={anyChecked}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 dark:border-white/10">
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {anyChecked
              ? `${checkedIds.size} selected`
              : `${widgets.length} widgets in your library`
            }
          </span>
          <div className="flex items-center gap-2">
            {anyChecked && (
              <Button variant="primary" size="default" onClick={handleAddSelected}>
                <Plus size={14} /> Add ({checkedIds.size})
              </Button>
            )}
            <Button variant="secondary" size="default" onClick={onClose}>Done</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Card({ widget, onOpen, onAdd, isChecked, onToggle, anyChecked }) {
  return (
    <CardContainer
      variant="default"
      onClick={() => anyChecked ? onToggle() : onOpen()}
      className={`relative min-h-[210px] cursor-pointer transition-shadow ${isChecked ? 'ring-2 ring-aims-blue ring-offset-0' : ''}`}
    >
      {/* Checkbox */}
      <button
        type="button"
        aria-label={isChecked ? 'Deselect widget' : 'Select widget'}
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        className={`absolute right-2.5 top-2.5 z-10 grid h-5 w-5 place-items-center rounded border-2 transition-all ${
          isChecked
            ? 'border-aims-blue bg-aims-blue'
            : 'border-gray-300 bg-white opacity-0 group-hover:opacity-100 dark:border-white/25 dark:bg-transparent'
        }`}
        style={{ opacity: isChecked || anyChecked ? 1 : undefined }}
      >
        {isChecked && <Check size={11} className="text-white" strokeWidth={3} />}
      </button>

      <div className="flex items-start gap-3">
        <WidgetGlyph skeleton={widget.skeleton} source={widget.source} />
        <div className="min-w-0 flex-1 pr-7">
          <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{widget.name}</div>
          <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">{widget.source}</div>
        </div>
      </div>
      <div className="surface-sunken pointer-events-none rounded-md p-2">
        <WidgetRender widget={widget} size="md" />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag variant="neutral" size="sm">{widget.category}</Tag>
        <Tag variant={widget.governed ? 'success' : 'alert'} size="sm">{widget.governed ? 'Governed' : 'Ungoverned'}</Tag>
      </div>
      {widget.usedIn > 0 && (
        <div className="text-[11px] text-gray-400 dark:text-slate-500">
          Used on {widget.usedIn} dashboard{widget.usedIn !== 1 ? 's' : ''}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
        <FreshnessBadge status={widget.freshness} label={widget.freshness} />
        <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onAdd() }}>
          <Plus size={14} /> Add
        </Button>
      </div>
    </CardContainer>
  )
}

function Detail({ widget, onBack, onAdd }) {
  const [dims, setDims] = useState(SIZE_PRESETS.lg)
  return (
    <div className="flex-1 overflow-auto">
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-2.5 dark:border-white/10">
        <button onClick={onBack} className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-white/10" aria-label="Back">
          <ChevronLeft size={16} />
        </button>
        <WidgetGlyph skeleton={widget.skeleton} source={widget.source} sm />
        <span className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{widget.name}</span>
        <span className="truncate text-[11px] text-gray-500 dark:text-slate-400">{widget.source}</span>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 p-6">
        <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">About this Widget</div>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">{SKELETON_ABOUT[widget.skeleton] || 'A dashboard widget.'}</p>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-aims-blue/10">
            <LayoutGrid size={18} className="text-aims-blue" />
          </span>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-aims-blue/30 bg-aims-blue/5 p-4 dark:bg-aims-blue/10">
          <Info size={16} className="mt-0.5 shrink-0 text-aims-blue" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">Best for</div>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-slate-300">{SKELETON_BESTFOR[widget.skeleton] || 'General dashboards.'}</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">Preview</span>
            <div className="flex gap-1">
              {Object.entries(SIZE_PRESETS).map(([key, preset]) => {
                const active = dims.cols === preset.cols && dims.rows === preset.rows
                return (
                  <button key={key} onClick={() => setDims(preset)} className={`rounded-lg border px-3 py-1 text-sm font-medium transition-colors ${active ? 'border-aims-blue bg-aims-blue text-white' : 'border-gray-300 text-gray-600 hover:border-aims-blue/40 dark:border-white/15 dark:text-slate-300'}`}>
                    {key === 'sm' ? 'S' : key === 'md' ? 'M' : 'L'}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-6 dark:border-white/10 dark:bg-white/[0.02]">
            <div className={`pointer-events-none mx-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all dark:border-white/10 dark:bg-[var(--surface-raised)] ${PREVIEW_WIDTH[colsToDetail(dims.cols)]}`}>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">{widget.name}</div>
              <WidgetRender widget={widget} size={colsToDetail(dims.cols)} rows={dims.rows} />
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-slate-400">{dims.cols} col{dims.cols !== 1 ? 's' : ''} × {dims.rows} row{dims.rows !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Tag variant="neutral" size="sm">{widget.category}</Tag>
          <GovernedBadge governed={!!widget.governed} />
          <FreshnessBadge status={widget.freshness} label={widget.freshness} />
        </div>
        <div className="flex justify-end border-t border-gray-100 pt-4 dark:border-white/10">
          <Button variant="primary" size="default" onClick={() => onAdd(dims)}>
            <Plus size={16} /> Add to dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
