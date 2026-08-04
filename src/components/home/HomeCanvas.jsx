import { useState, useRef } from 'react'
import { Plus, X, GripVertical, Pencil, Check, LayoutGrid } from 'lucide-react'
import { widgets as allWidgets } from '../../data/mock.js'
import { placementDims, SIZE_PRESETS } from '../../data/layout.js'
import WidgetRender from '../widgets/WidgetRender.jsx'
import WidgetLibraryModal from '../widgets/WidgetLibraryModal.jsx'

const STORAGE_KEY = 'aims-canvas-layouts'
const HOME_ID = 'home-canvas'
const COL_SPAN = { 1: '', 2: 'sm:col-span-2', 3: 'sm:col-span-2 lg:col-span-3' }
const GRID_GAP = 12
const gridCols = () => (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1)
const newPid = (arr) => `hc-${Date.now().toString(36)}-${arr.length}`

function readHomeLayout() {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return all[HOME_ID] ?? null
  } catch { return null }
}

function writeHomeLayout(layout) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    if (layout == null) { delete all[HOME_ID] } else { all[HOME_ID] = layout }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {}
}

export function HomeCanvas() {
  const [placements, setPlacements] = useState(() => readHomeLayout() ?? [])
  const [editing, setEditing] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [dragPid, setDragPid] = useState(null)

  function commit(updater) {
    setPlacements((prev) => {
      const next = updater(prev)
      writeHomeLayout(next)
      return next
    })
  }

  function placeWidget(widget, dims = SIZE_PRESETS.md) {
    const { cols, rows } = dims
    commit((prev) => [...prev, { pid: newPid(prev), widgetId: widget.id, fixed: false, cols, rows, audiences: [], quickActions: [] }])
    setAddOpen(false)
  }

  function removePlacement(pid) {
    commit((prev) => prev.filter((p) => p.pid !== pid))
  }

  function updatePlacement(pid, patch) {
    commit((prev) => prev.map((p) => (p.pid === pid ? { ...p, ...patch } : p)))
  }

  function reorder(fromPid, toPid) {
    if (!fromPid || fromPid === toPid) return
    commit((prev) => {
      const from = prev.findIndex((p) => p.pid === fromPid)
      const to = prev.findIndex((p) => p.pid === toPid)
      if (from < 0 || to < 0) return prev
      const without = prev.filter((_, i) => i !== from)
      const at = to > from ? to - 1 : to
      return [...without.slice(0, at), prev[from], ...without.slice(at)]
    })
  }

  function movePlacement(pid, delta) {
    commit((prev) => {
      const i = prev.findIndex((p) => p.pid === pid)
      const j = i + delta
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const without = prev.filter((_, idx) => idx !== i)
      return [...without.slice(0, j), prev[i], ...without.slice(j)]
    })
  }

  const widgetById = (wid) => allWidgets.find((w) => w.id === wid)
  const hasWidgets = placements.length > 0

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[var(--surface-raised)]">
        {/* Section header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <LayoutGrid size={14} className="text-gray-400 dark:text-slate-400" aria-hidden="true" />
            <h2 className="text-[13px] font-semibold text-gray-700 dark:text-slate-200">My Widgets</h2>
          </div>
          <button
            type="button"
            onClick={() => { setEditing((e) => !e); if (editing) setAddOpen(false) }}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/10"
          >
            {editing
              ? <><Check size={12} aria-hidden="true" /> Done</>
              : <><Pencil size={12} aria-hidden="true" /> Customize</>}
          </button>
        </div>

        {/* Empty state */}
        {!hasWidgets && !editing && (
          <div className="flex flex-col items-center gap-2 py-10">
            <p className="text-[12px] text-gray-400 dark:text-slate-500">No widgets added yet.</p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-[12px] font-medium text-aims-blue hover:underline"
            >
              Customize to add widgets →
            </button>
          </div>
        )}

        {/* Widget grid */}
        {(hasWidgets || editing) && (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {placements.map((p) => (
              <HomeTile
                key={p.pid}
                placement={p}
                widget={widgetById(p.widgetId)}
                editing={editing}
                dragging={dragPid === p.pid}
                onRemove={() => removePlacement(p.pid)}
                onUpdate={updatePlacement}
                onMove={movePlacement}
                onDragStart={() => setDragPid(p.pid)}
                onDragEnd={() => setDragPid(null)}
                onDropOn={() => { reorder(dragPid, p.pid); setDragPid(null) }}
              />
            ))}

            {/* Add widget card — only in edit mode */}
            {editing && (
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-aims-blue hover:text-aims-blue dark:border-white/15 dark:text-slate-500 dark:hover:border-aims-blue dark:hover:text-aims-blue"
              >
                <Plus size={18} aria-hidden="true" />
                <span className="text-[11px] font-medium">Add widget</span>
              </button>
            )}
          </div>
        )}
      </div>

      {addOpen && (
        <WidgetLibraryModal
          onAdd={(w, dims) => placeWidget(w, dims)}
          onClose={() => setAddOpen(false)}
          onCreateNew={() => setAddOpen(false)}
        />
      )}
    </>
  )
}

function HomeTile({ placement: p, widget: w, editing, dragging, onRemove, onUpdate, onMove, onDragStart, onDragEnd, onDropOn }) {
  const { cols, rows } = placementDims(p)
  const span = COL_SPAN[cols] ?? ''
  const tileRef = useRef(null)
  const resizingRef = useRef(false)
  const [resizing, setResizing] = useState(false)
  const size = cols >= 3 ? 'lg' : cols >= 2 ? 'md' : 'sm'

  function startResize(e) {
    e.preventDefault()
    e.stopPropagation()
    resizingRef.current = true
    setResizing(true)
    const tile = tileRef.current
    const grid = tile.parentElement
    const numCols = gridCols()
    const gridWidth = grid.getBoundingClientRect().width
    const colWidth = (gridWidth - GRID_GAP * (numCols - 1)) / numCols
    const left = tile.getBoundingClientRect().left
    let lastCols = cols
    const onPointerMove = (ev) => {
      const desired = ev.clientX - left
      const rawSpan = Math.round((desired + GRID_GAP) / (colWidth + GRID_GAP))
      const targetCols = Math.max(1, Math.min(numCols, rawSpan))
      if (targetCols !== lastCols) { lastCols = targetCols; onUpdate(p.pid, { cols: targetCols, rows }) }
    }
    const onPointerUp = () => {
      resizingRef.current = false
      setResizing(false)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      document.body.style.cursor = ''
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    document.body.style.cursor = 'nwse-resize'
  }

  function stepSize(delta) {
    const maxCols = gridCols()
    const next = Math.max(1, Math.min(maxCols, cols + delta))
    if (next !== cols) onUpdate(p.pid, { cols: next, rows })
  }

  return (
    <div
      ref={tileRef}
      draggable={editing && !resizing}
      onDragStart={(e) => { if (resizingRef.current) { e.preventDefault(); return }; onDragStart() }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => { if (editing) e.preventDefault() }}
      onDrop={(e) => { if (!editing) return; e.preventDefault(); onDropOn() }}
      className={`group relative rounded-lg border bg-white p-2.5 transition-shadow dark:bg-[var(--surface-raised)] ${span} ${
        dragging ? 'opacity-40 ring-2 ring-aims-blue/30' : ''
      } ${
        resizing ? 'border-aims-blue ring-2 ring-aims-blue/40' : 'border-gray-200 dark:border-white/10'
      } ${editing ? 'cursor-grab hover:shadow-md' : ''}`}
    >
      {editing && (
        <>
          {/* Remove button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            aria-label={`Remove ${w?.name ?? 'widget'}`}
            className="absolute -right-2 -top-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-white shadow-sm transition-colors hover:bg-red-500 dark:bg-slate-600 dark:hover:bg-red-500"
          >
            <X size={10} aria-hidden="true" />
          </button>

          {/* Drag grip */}
          <button
            type="button"
            aria-label={`Reorder ${w?.name ?? 'widget'} — use arrow keys`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); onMove(p.pid, -1) }
              else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); onMove(p.pid, 1) }
            }}
            className="absolute left-2 top-2 z-20 cursor-grab rounded p-0.5 text-gray-400 dark:text-slate-500"
          >
            <GripVertical size={13} aria-hidden="true" />
          </button>

          {/* Resize handle */}
          <div
            role="slider"
            tabIndex={0}
            aria-label={`Resize ${w?.name ?? 'widget'}`}
            aria-valuemin={1}
            aria-valuemax={gridCols()}
            aria-valuenow={cols}
            draggable={false}
            onPointerDown={startResize}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); stepSize(1) }
              else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); stepSize(-1) }
            }}
            className="absolute bottom-0 right-0 z-10 grid h-6 w-6 cursor-nwse-resize place-items-center rounded-br-lg text-gray-300 transition-colors hover:text-aims-blue dark:text-slate-600 dark:hover:text-aims-blue"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M10 2 L2 10 M10 6 L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </>
      )}

      <WidgetRender widget={w} size={size} rows={rows} />
    </div>
  )
}
