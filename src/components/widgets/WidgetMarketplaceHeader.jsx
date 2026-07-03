import { PencilRuler, Sparkles, ChevronRight, Store } from 'lucide-react'

// Three pinned cards at the top of the Widget Library:
//   1. Start from scratch → onScratch()
//   2. Browse marketplace → onBrowse()
//   3. AI Assistant       → disabled, "Coming soon"
export default function WidgetMarketplaceHeader({ onScratch, onBrowse }) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
        Create new
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        {/* Start from scratch */}
        <button
          onClick={onScratch}
          className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 text-left transition-all hover:border-gray-300 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/[0.08]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-slate-300">
            <PencilRuler size={17} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-gray-900 dark:text-slate-100">Start from scratch</span>
            <span className="block truncate text-[11px] text-gray-500 dark:text-slate-400">Configure a dataset and widget manually</span>
          </span>
          <ChevronRight size={14} aria-hidden="true" className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500 dark:text-slate-600" />
        </button>

        {/* Browse marketplace */}
        <button
          onClick={onBrowse}
          className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 text-left transition-all hover:border-gray-300 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/[0.08]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-aims-blue/10 text-aims-blue">
            <Store size={17} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-gray-900 dark:text-slate-100">Browse marketplace</span>
            <span className="block truncate text-[11px] text-gray-500 dark:text-slate-400">Find an existing widget to reuse</span>
          </span>
          <ChevronRight size={14} aria-hidden="true" className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500 dark:text-slate-600" />
        </button>

        {/* AI Assistant — disabled V1 */}
        <div
          className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 opacity-50 dark:border-white/10 dark:bg-white/5"
          aria-disabled="true"
          title="AI Assistant is coming soon"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            <Sparkles size={17} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="block text-xs font-semibold text-gray-900 dark:text-slate-100">AI Assistant</span>
              <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-500 dark:bg-white/10 dark:text-slate-400">
                Coming soon
              </span>
            </span>
            <span className="block truncate text-[11px] text-gray-500 dark:text-slate-400">Describe what you need — AI builds it</span>
          </span>
        </div>

      </div>

      <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
        Widget library
      </p>
    </div>
  )
}
