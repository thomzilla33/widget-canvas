import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Circle } from 'lucide-react'
import StudioWelcome from '../components/common/StudioWelcome.jsx'
import DataSourceMarketplace from '../components/datasources/DataSourceMarketplace.jsx'
import { EXTERNAL_SOURCES } from '../data/sources.js'
import { useRole } from '../state/RoleContext.jsx'

// U5 / CEO V1 — Data Studio landing: the rich welcome walkthrough + a preview of
// the connector catalog ("Data Sync candidates") you can activate. Mirrors the
// production "Welcome to Data Studio" screen.
export default function DataStudio() {
  const navigate = useNavigate()
  const { isAdmin } = useRole()
  const [browsing, setBrowsing] = useState(false)

  // Not-yet-connected connectors — the catalog the wizard pulls from.
  const candidates = EXTERNAL_SOURCES.filter((s) => !s.connected).slice(0, 12)

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-6 lg:px-8">
          <StudioWelcome
            studioId="datastudio"
            dismissible={false}
            ctaLabel={isAdmin ? 'Connect your first source' : undefined}
            onCta={isAdmin ? () => setBrowsing(true) : undefined}
            secondaryLabel="Skip for now"
            onSecondary={() => navigate('/dashboards')}
            links={[
              { label: 'Email setup instructions', onClick: () => {} },
              { label: 'Explore Agent Studio first', onClick: () => navigate('/home') },
            ]}
          />

          {/* Browse what's available */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Browse what is available</span>
            <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
          </div>

          <div className="mb-1 flex items-baseline gap-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Available connectors</h3>
            <span className="text-xs text-gray-400 dark:text-slate-500">{candidates.length}</span>
          </div>
          <p className="mb-3 text-xs text-gray-500 dark:text-slate-400">A preview of the catalog. The wizard will pull from this list at step 2.</p>

          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(320px,100%),1fr))' }}>
            {candidates.map((s) => (
              <button
                key={s.id}
                onClick={() => isAdmin && setBrowsing(true)}
                className="card p-4 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="logo-sq !h-9 !w-9 !text-[11px]" style={{ background: s.logoColor }}>{s.initials}</span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{s.name}</div>
                      <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">{s.category}</div>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-400 dark:border-white/10 dark:text-slate-500">
                    <Circle size={7} aria-hidden="true" /> Not activated
                  </span>
                </div>
                {s.description && <p className="mt-2.5 line-clamp-2 text-xs text-gray-600 dark:text-slate-300">{s.description}</p>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {browsing && (
        <DataSourceMarketplace currentSourceId={null} onSelect={() => setBrowsing(false)} onClose={() => setBrowsing(false)} />
      )}
    </div>
  )
}
