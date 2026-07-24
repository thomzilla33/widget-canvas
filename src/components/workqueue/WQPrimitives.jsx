// Shared primitives for Work Queue decision surfaces

export function WQConfirmBar({ message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, disabled = false, onCancel, onConfirm, children }) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/[0.07] dark:bg-white/[0.03]">
      {message && <p className="text-xs leading-relaxed text-gray-600 dark:text-slate-300">{message}</p>}
      {children}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.07]"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            danger ? 'bg-red-500 text-white hover:bg-red-600' : 'btn-primary'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  )
}

export function WQSecondaryLinks({ onDecline, declineLabel = 'Skip for now' }) {
  return (
    <div className="mt-2 flex items-center justify-center gap-3 text-xs text-gray-400 dark:text-slate-600">
      {onDecline && (
        <button
          type="button"
          onClick={onDecline}
          className="hover:text-gray-600 hover:underline transition-colors dark:hover:text-slate-400"
        >
          {declineLabel}
        </button>
      )}
    </div>
  )
}

export function SectionLabel({ children, accent }) {
  return (
    <p className={`mb-3 text-[9px] font-semibold uppercase tracking-[0.1em] ${
      accent === 'amber'
        ? 'text-amber-600 dark:text-amber-500/80'
        : 'text-gray-400 dark:text-slate-600'
    }`}>
      {children}
    </p>
  )
}

export function Divider() {
  return <div className="border-t border-gray-100 dark:border-white/[0.05]" />
}
