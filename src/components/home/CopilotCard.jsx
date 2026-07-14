// src/components/home/CopilotCard.jsx
import { Sparkles } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import { HOME_COPILOTS } from '../../data/home.js'

export function CopilotCard() {
  return (
    <div className="card flex flex-col">
      <CardHeader
        icon={<Sparkles size={14} />}
        title="Copilots"
        action={{ label: 'Manage', onClick: () => {} }}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 pt-0">
        {HOME_COPILOTS.map((cp) => (
          <div
            key={cp.id}
            className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="logo-sq text-[10px]"
                  style={{ background: cp.color }}
                  aria-hidden="true"
                >
                  {cp.initials}
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-100">{cp.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">Used {cp.lastUsed}</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-slate-400 line-clamp-2">
              {cp.description}
            </p>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 hover:border-aims-blue/40 hover:text-aims-blue dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-aims-blue/40 dark:hover:text-blue-400 transition-colors"
              onClick={() => {}}
            >
              <Sparkles size={10} aria-hidden="true" />
              {cp.quick_prompt}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
