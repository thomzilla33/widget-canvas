// src/components/home/CardHeader.jsx
// Shared panel header used by every home control-center card.
export function CardHeader({ icon, title, badge, action }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3">
      <div className="flex items-center gap-2.5">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</span>
        {badge != null && badge > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500/15 px-1.5 text-[10px] font-bold text-blue-500 dark:bg-blue-500/20 dark:text-blue-400">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="text-[11px] font-medium text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
