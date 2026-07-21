import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import { HOME_COPILOTS } from '../../data/home.js'

export function CopilotCard() {
  const navigate = useNavigate()
  const [activePrompt, setActivePrompt] = useState(null)

  function launchPrompt(cp) {
    setActivePrompt({ copilot: cp.name, prompt: cp.quick_prompt })
    setTimeout(() => setActivePrompt(null), 3500)
  }

  return (
    <div className="card flex flex-col" id="home-copilot">
      <CardHeader
        icon={<Sparkles size={14} />}
        title="Copilots"
        action={{ label: 'Manage', onClick: () => navigate('/dashboards') }}
      />
      <div className="grid grid-cols-1 gap-2 p-4 pt-0 sm:grid-cols-2">
        {HOME_COPILOTS.map((cp) => (
          <div
            key={cp.id}
            className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]"
          >
            <div className="flex items-start gap-2.5">
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
            <p className="line-clamp-2 text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">
              {cp.description}
            </p>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 transition-colors hover:border-aims-blue/40 hover:text-aims-blue dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-aims-blue/40 dark:hover:text-blue-400"
              onClick={() => launchPrompt(cp)}
            >
              <Sparkles size={10} aria-hidden="true" />
              <span className="truncate">{cp.quick_prompt}</span>
            </button>
          </div>
        ))}
      </div>

      {activePrompt && (
        <div className="mx-4 mb-4 flex items-start gap-2 rounded-xl border border-blue-500/20 bg-blue-500/[0.07] px-3 py-2.5">
          <Sparkles size={13} className="mt-0.5 shrink-0 text-aims-blue" aria-hidden="true" />
          <div>
            <p className="text-[11px] font-semibold text-aims-blue">{activePrompt.copilot}</p>
            <p className="mt-0.5 text-[11px] text-gray-600 dark:text-slate-400">"{activePrompt.prompt}"</p>
          </div>
        </div>
      )}
    </div>
  )
}
