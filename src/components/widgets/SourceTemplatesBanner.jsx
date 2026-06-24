import { useState } from 'react'
import { Sparkles, X, Download, Check } from 'lucide-react'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { sourcesWithTemplates, templatesForSource } from '../../data/sources.js'
import { Button } from '@/components/ui/Button'

// U4 — per-source templates: connected sources that ship a ready-made widget bundle.
// One-click install adds the not-yet-installed widgets (deduped by templateId).
export default function SourceTemplatesBanner() {
  const { widgets, addWidget } = useWidgets()
  const [dismissed, setDismissed] = useState(false)

  const isInstalled = (templateId) => widgets.some((w) => w.templateId === templateId)
  const remaining = (s) => templatesForSource(s.id).filter((t) => !isInstalled(t.id))
  const active = sourcesWithTemplates().filter((s) => remaining(s).length > 0)

  if (dismissed || active.length === 0) return null

  const install = (s) => {
    remaining(s).forEach((spec, i) => {
      addWidget({
        id: `w-${spec.id}-${Date.now().toString(36)}${i}`,
        templateId: spec.id,
        name: spec.name,
        skeleton: spec.skeleton,
        source: s.name,
        governed: s.governed,
        freshness: 'fresh',
        health: 'unused',
        usedIn: 0,
        category: s.category === 'AIMS OS' ? 'AIMS OS' : 'Operational',
      })
    })
  }

  return (
    <div className="mb-4 rounded-xl border border-aims-blue/20 bg-aims-blue/5 p-3 dark:border-aims-blue/25 dark:bg-aims-blue/[0.08]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-slate-100">
          <Sparkles size={15} className="text-aims-blue" aria-hidden="true" /> Templates from your connected sources
        </span>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss templates"
          className="grid h-6 w-6 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {active.map((s) => {
          const n = remaining(s).length
          return (
            <div key={s.id} className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white p-2.5 dark:border-white/10 dark:bg-[#131a2c]">
              <span className="logo-sq !h-8 !w-8 !text-[10px]" style={{ background: s.logoColor }}>{s.initials}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{s.name}</div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400">{n} widget{n === 1 ? '' : 's'} ready to install</div>
              </div>
              <Button variant="primary" size="sm" onClick={() => install(s)}>
                <Download size={13} aria-hidden="true" /> Install
              </Button>
            </div>
          )
        })}
      </div>
      <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
        <Check size={11} aria-hidden="true" /> Already-installed widgets are skipped — bundles disappear once fully added.
      </p>
    </div>
  )
}
