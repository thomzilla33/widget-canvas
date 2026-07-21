export function CardHeader({ icon, title, badge, action }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3.5">
      <div className="flex items-center gap-2.5">
        <span className="text-gray-300 dark:text-slate-600">{icon}</span>
        <span className="text-[13px] font-semibold tracking-[-0.01em] text-gray-800 dark:text-slate-200">{title}</span>
        {badge != null && badge > 0 && (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-aims-blue/10 px-1.5 text-[10px] font-bold tabular-nums text-aims-blue dark:bg-aims-blue/20 dark:text-blue-400">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="text-[11px] font-medium text-gray-300 transition-colors hover:text-gray-600 dark:text-slate-600 dark:hover:text-slate-400"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
