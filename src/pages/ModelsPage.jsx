import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { Package2, CheckCircle2, ChevronRight, Boxes, Database, BarChart3, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/common/index.jsx'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { useModels } from '../state/ModelsContext.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import StudioWelcome from '../components/common/StudioWelcome.jsx'

function ModelIcon({ name, color, size = 20 }) {
  const Icon = LucideIcons[name] || LucideIcons.Package2
  return <Icon size={size} style={{ color }} strokeWidth={1.75} />
}

function EntityRow({ entity }) {
  const Icon = LucideIcons[entity.iconName] || LucideIcons.Database
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md" style={{ background: entity.color + '22' }}>
        <Icon size={14} style={{ color: entity.color }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-gray-900 dark:text-slate-100">{entity.name}</div>
        <div className="text-[10px] text-gray-500 dark:text-slate-400">{entity.recordCount?.toLocaleString()} records</div>
      </div>
      {entity.hasPII && (
        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">PII</span>
      )}
    </div>
  )
}

function WidgetTemplateRow({ tpl }) {
  const skeletonColor = {
    'Table': 'bg-cyan-500/10 text-cyan-500',
    'Chart': 'bg-violet-500/10 text-violet-400',
    'KPI':   'bg-emerald-500/10 text-emerald-500',
  }[tpl.skeleton] || 'bg-slate-500/10 text-slate-400'

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0 ${skeletonColor}`}>
        {tpl.skeleton}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-gray-900 dark:text-slate-100">{tpl.name}</div>
        <div className="truncate text-[10px] text-gray-500 dark:text-slate-400">{tpl.description}</div>
      </div>
    </div>
  )
}

function ModelCard({ model }) {
  const { isInstalled, installModel, uninstallModel } = useModels()
  const { addWidget } = useWidgets()
  const [expanded, setExpanded] = useState(false)
  const [installing, setInstalling] = useState(false)
  const installed = isInstalled(model.id)

  function handleInstall() {
    setInstalling(true)
    setTimeout(() => {
      installModel(model.id)
      model.widgetTemplates.forEach((tpl) => {
        addWidget({
          id: tpl.id,
          name: tpl.name,
          subtitle: tpl.description,
          skeleton: tpl.skeleton,
          category: tpl.category,
          source: tpl.source,
          governed: true,
          freshness: tpl.freshness || 'fresh',
          health: 'active',
          usedIn: 0,
          dataset: tpl.dataset,
          typeId: tpl.typeId,
          styleVariant: tpl.styleVariant,
          modelId: model.id,
        })
      })
      setInstalling(false)
    }, 600)
  }

  function handleUninstall() {
    uninstallModel(model.id)
  }

  return (
    <div className={`rounded-2xl border transition-all ${
      installed
        ? 'border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05]'
        : 'border-[var(--border)] bg-[var(--surface-pop)]'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-4 p-5">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
          style={{ background: model.color + '18', border: `1px solid ${model.color}30` }}
        >
          <ModelIcon name={model.icon} color={model.color} size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">{model.name}</h3>
            <Tag variant="neutral" size="sm">{model.industry}</Tag>
            {installed && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={11} /> Installed
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{model.tagline}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Database size={11} /> {model.stats.entities} entities
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 size={11} /> {model.stats.widgets} widgets
            </span>
            <span className="flex items-center gap-1">
              <Boxes size={11} /> {model.stats.records.toLocaleString()} mock records
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {installed ? (
            <Button variant="secondary" size="sm" onClick={handleUninstall}>Uninstall</Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleInstall} disabled={installing}>
              {installing ? <><span className="animate-spin inline-block">⟳</span> Installing…</> : <>Install model</>}
            </Button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            {expanded ? 'Hide details' : "See what’s included"}
            <ChevronRight size={11} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[var(--border)] px-5 pb-5 pt-4">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-slate-500">
                Entities ({model.entities.length})
              </div>
              <div className="space-y-1.5">
                {model.entities.map((ent) => <EntityRow key={ent.id} entity={ent} />)}
              </div>
            </div>
            <div>
              <div className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-slate-500">
                Pre-built widgets ({model.widgetTemplates.length})
              </div>
              <div className="space-y-1.5">
                {model.widgetTemplates.map((tpl) => <WidgetTemplateRow key={tpl.id} tpl={tpl} />)}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-aims-blue/20 bg-aims-blue/5 px-4 py-3">
            <div className="flex items-start gap-2.5">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-aims-blue" />
              <div>
                <p className="text-xs font-semibold text-aims-blue">What happens when you install</p>
                <p className="mt-0.5 text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed">
                  Entity sources become available in the Widget Builder data step. Pre-built widgets are added to your Widget Library ready to place on any dashboard. All data is mocked and safe to explore.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Placeholder for upcoming models
function ComingSoonCard({ name, industry, color, icon }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] p-5 opacity-60">
      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{ background: color + '14' }}
        >
          <ModelIcon name={icon} color={color} size={18} />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{name}</div>
          <div className="text-[11px] text-gray-400 dark:text-slate-500">{industry} · Coming soon</div>
        </div>
        <span className="ml-auto rounded-full bg-white/5 border border-white/10 px-3 py-0.5 text-[10px] font-semibold text-gray-400 dark:text-slate-500">
          Coming soon
        </span>
      </div>
    </div>
  )
}

export default function ModelsPage() {
  const { availableModels, installed } = useModels()
  const installedCount = installed.size

  return (
    <div className="h-full overflow-auto">
      <div className="px-6 pt-4">
        <StudioWelcome
          studioId="models"
          built={{ count: installedCount, label: installedCount === 1 ? 'model installed' : 'models installed' }}
        />
      </div>

      <PageHeader
        title="Industry Models"
        description="Pre-configured entity schemas, mock data, and ready-to-use widgets for your industry."
      />

      <div className="px-6 pb-8 space-y-8">
        {/* Available */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">Available models</h2>
            <span className="rounded-full bg-aims-blue/10 px-2 py-0.5 text-[10px] font-bold text-aims-blue">
              {availableModels.length}
            </span>
          </div>
          <div className="space-y-3">
            {availableModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </section>

        {/* Coming soon */}
        <section>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">Coming soon</h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">More industry models in development.</p>
          </div>
          <div className="space-y-3">
            <ComingSoonCard name="Construction Project Management" industry="Construction" color="#D97706" icon="HardHat" />
            <ComingSoonCard name="SaaS / B2B Sales" industry="Software" color="#2563EB" icon="TrendingUp" />
            <ComingSoonCard name="Healthcare Operations" industry="Healthcare" color="#059669" icon="HeartPulse" />
          </div>
        </section>
      </div>
    </div>
  )
}
