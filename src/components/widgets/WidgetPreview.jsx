// Placeholder widget preview — replaced per skeleton type in later phases.
export default function WidgetPreview({ widget }) {
  return (
    <div className="card p-4">
      <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{widget?.name || 'Widget preview'}</div>
      <div className="mt-3 h-24 rounded-lg bg-gray-100 dark:bg-white/10 grid place-items-center text-xs text-gray-400 dark:text-slate-500">
        Preview placeholder
      </div>
    </div>
  )
}
