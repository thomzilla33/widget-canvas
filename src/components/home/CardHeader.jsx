// Shared header for the Home pinned cards (Inbox, Tasks, Human Touch Layer).
// `right` is an optional slot for a header-level action (e.g. "Mark all read").
export default function CardHeader({ icon: Icon, title, count, sub, tone = 'blue', right }) {
  const bg = tone === 'amber' ? 'bg-amber-500/10 text-aims-ungoverned' : 'bg-aims-blue/10 text-aims-blue'
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${bg}`}>
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</span>
            {count > 0 && (
              <span className={`rounded-full px-1.5 text-[10px] font-bold leading-[16px] ${tone === 'amber' ? 'bg-aims-ungoverned/20 text-aims-ungoverned dark:text-amber-300' : 'bg-aims-blue text-white'}`}>{count}</span>
            )}
          </div>
          {sub && <div className="text-[11px] text-gray-400 dark:text-slate-500">{sub}</div>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}
