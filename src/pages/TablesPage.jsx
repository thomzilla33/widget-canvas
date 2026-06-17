import { useState } from 'react'
import { X, FunctionSquare, Table2 } from 'lucide-react'
import { PageHeader, FreshnessBadge } from '../components/common/index.jsx'
import StudioWelcome from '../components/common/StudioWelcome.jsx'
import FilterToolbar from '../components/common/FilterToolbar.jsx'
import { useFocusTrap } from '../hooks/useFocusTrap.js'
import { SERIES } from '../components/playground/WidgetPreview.jsx'
import { TABLE_DEFINITIONS, computeTable, formatCell, tableStats, columnAvg } from '../data/tables.js'

// Phase 6 — governed user-authored tables with formula columns, and the
// "one table → many widgets" display path.
export default function TablesPage() {
  const [open, setOpen] = useState(null) // table def open in the detail modal
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const tables = TABLE_DEFINITIONS.filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => {
    const d = sortBy === 'rows' ? a.rows.length - b.rows.length : a.name.localeCompare(b.name)
    return sortDir === 'asc' ? d : -d
  })

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Tables"
        description="Governed tables you build from normalized data — literal, measure, and formula (ƒ) columns you can chart."
      />
      <FilterToolbar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search tables…"
        sort={{
          value: sortBy,
          onChange: setSortBy,
          options: [{ value: 'name', label: 'Name' }, { value: 'rows', label: 'Row count' }],
          dir: sortDir,
          onToggleDir: () => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')),
        }}
      />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-5 lg:px-8">
          <StudioWelcome studioId="tables" built={{ count: TABLE_DEFINITIONS.length, label: 'tables' }} />
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(300px,100%),1fr))' }}>
            {tables.map((t) => {
              const s = tableStats(t)
              return (
                <button key={t.id} onClick={() => setOpen(t)} className="catalog-card min-h-[150px]">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-300">
                      <Table2 size={16} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{t.name}</div>
                      <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">{t.scope} · Owner {t.owner}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-slate-300">{t.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-slate-400">
                      {s.columns} cols
                      {s.formulas > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-indigo-500 dark:text-indigo-300">
                          <FunctionSquare size={11} /> {s.formulas}
                        </span>
                      )}
                      · {s.rows} rows
                    </span>
                    <FreshnessBadge status={t.freshness} label={t.freshness} />
                  </div>
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-slate-400">
            Formula (ƒ) columns compute live from the other columns. A table displayed as a widget inherits its scope, owner, and freshness.
          </p>
        </div>
      </div>

      {open && <TableDetailModal def={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function cellTone(col, value) {
  if (!col.colorSigned || value == null) return ''
  return value >= 0 ? 'text-aims-governed' : 'text-aims-stale'
}

function TableDetailModal({ def, onClose }) {
  const dialogRef = useFocusTrap()
  const computed = computeTable(def)
  const textCol = def.columns.find((c) => c.type === 'text') || def.columns[0]
  const formulaCol = def.columns.find((c) => c.kind === 'formula') || def.columns.find((c) => c.type === 'number')
  const avg = formulaCol ? columnAvg(computed, formulaCol.key) : 0
  const max = formulaCol ? Math.max(...computed.rows.map((r) => Number(r[formulaCol.key]) || 0)) : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="table-detail-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={dialogRef} tabIndex={-1} className="card relative z-10 flex max-h-[88vh] w-[90vw] max-w-[760px] flex-col overflow-hidden p-0 outline-none">
        <div className="flex items-start gap-3 border-b border-gray-200 p-5 dark:border-white/10">
          <div className="min-w-0 flex-1">
            <h2 id="table-detail-title" className="text-sm font-semibold text-gray-900 dark:text-slate-100">{def.name}</h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500 dark:text-slate-400">
              <span>{def.scope}</span>
              <span aria-hidden="true">·</span>
              <span>Owner {def.owner}</span>
              <span aria-hidden="true">·</span>
              <span>TTL {def.ttl}</span>
              <FreshnessBadge status={def.freshness} label={def.freshness} />
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 dark:text-slate-500 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          {/* The governed, computed table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500 dark:bg-white/5 dark:text-slate-400">
                <tr>
                  {def.columns.map((c) => (
                    <th key={c.key} className="px-3 py-2 font-semibold" title={c.kind === 'formula' ? `ƒ = ${c.formula}` : c.kind}>
                      <span className="inline-flex items-center gap-1">
                        {c.label}
                        {c.kind === 'formula' && <FunctionSquare size={11} className="text-indigo-500 dark:text-indigo-300" aria-label="formula column" />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {computed.rows.map((r, i) => (
                  <tr key={i} className="text-gray-700 dark:text-slate-200">
                    {def.columns.map((c) => (
                      <td key={c.key} className={`px-3 py-2 ${c.type === 'number' ? 'num' : ''} ${cellTone(c, r[c.key])}`}>
                        {formatCell(r[c.key], c.format)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-gray-500 dark:text-slate-400">
            <FunctionSquare size={11} className="mb-0.5 inline text-indigo-500 dark:text-indigo-300" /> formula columns compute live — change the formula once and every bound widget updates.
          </p>

          {/* The same table, displayed as widgets */}
          {formulaCol && (
            <>
              <div className="mt-5 mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                Displayed as widgets — {formulaCol.label} by {textCol.label}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {/* KPI */}
                <div className="card p-3">
                  <div className="text-[11px] text-gray-500 dark:text-slate-400">Avg {formulaCol.label}</div>
                  <div className="num mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">{formatCell(avg, formulaCol.format)}</div>
                  <div className="mt-1 text-[10px] text-gray-400 dark:text-slate-500">KPI · ƒ {formulaCol.label}</div>
                </div>
                {/* Bar (leaderboard) */}
                <div className="card p-3 sm:col-span-2">
                  <div className="mb-1.5 text-[11px] text-gray-500 dark:text-slate-400">{formulaCol.label} by {textCol.label}</div>
                  <ul className="space-y-1.5">
                    {computed.rows.map((r, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11px]">
                        <span className="w-20 shrink-0 truncate text-gray-700 dark:text-slate-200">{r[textCol.key]}</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                          <span className="block h-full rounded-full" style={{ width: `${max > 0 ? (Number(r[formulaCol.key]) / max) * 100 : 0}%`, background: SERIES[i % SERIES.length] }} />
                        </span>
                        <span className="num w-12 shrink-0 text-right font-medium text-gray-900 dark:text-slate-100">{formatCell(r[formulaCol.key], formulaCol.format)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
