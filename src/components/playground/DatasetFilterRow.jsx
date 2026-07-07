import { X } from 'lucide-react'
import { COLUMN_TYPES, OPERATORS_BY_TYPE } from '../../data/datasets.js'
import ColumnSelect from './ColumnSelect.jsx'

// A single filter row: [Column ▾] [Operator ▾] [Value input] [×]
// Props:
//   sourceId  – entity id (key into COLUMN_TYPES); pass '' for preset datasets
//   columns   – explicit column list override (used when sourceId is a preset dataset)
//   filter    – { column, operator, value }
//   onChange  – (updatedFilter) => void
//   onRemove  – () => void
export default function DatasetFilterRow({ sourceId, columns: columnsProp, filter, onChange, onRemove }) {
  const colTypes = COLUMN_TYPES[sourceId] || {}
  const columns = columnsProp || Object.keys(colTypes)
  const colType = colTypes[filter.column] || 'string'
  const operators = OPERATORS_BY_TYPE[colType] || OPERATORS_BY_TYPE.string
  const noValue = filter.operator === 'is empty' || filter.operator === 'is not empty'

  return (
    <div className="flex items-center gap-2">
      {/* Column */}
      <ColumnSelect
        value={filter.column}
        onChange={(col) => onChange({ ...filter, column: col, operator: '', value: '' })}
        columns={columns}
        placeholder="Column…"
      />

      {/* Operator */}
      <select
        value={filter.operator}
        onChange={(e) => onChange({ ...filter, operator: e.target.value })}
        disabled={!filter.column}
        className="h-8 w-32 shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-slate-200 disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
      >
        <option value="">Operator…</option>
        {operators.map((op) => (
          <option key={op} value={op}>{op}</option>
        ))}
      </select>

      {/* Value */}
      <input
        type="text"
        value={filter.value}
        onChange={(e) => onChange({ ...filter, value: e.target.value })}
        disabled={!filter.operator || noValue}
        placeholder={noValue ? '—' : 'Value…'}
        className="h-8 w-28 shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-slate-200 placeholder:text-slate-500 disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
      />

      {/* Remove */}
      <button
        onClick={onRemove}
        aria-label="Remove filter"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-white/10 hover:text-slate-200 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  )
}
