import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil, ChevronLeft, MapPin, PauseCircle, Sparkles, UserRound } from 'lucide-react'
import { PageHeader, Badge } from '../components/common/index.jsx'
import DashboardZones from '../components/dashboard/DashboardZones.jsx'
import DashboardControls, { DEFAULT_SCOPE, scopeLabel } from '../components/dashboard/DashboardControls.jsx'
import WidgetDrilldownModal from '../components/dashboard/WidgetDrilldownModal.jsx'
import EntityContextHeader, { entityHeaderApplies } from '../components/dashboard/EntityContextHeader.jsx'
import AskDashboardModal from '../components/dashboard/AskDashboardModal.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { useLive } from '../state/LiveContext.jsx'
import { useRole } from '../state/RoleContext.jsx'
import { placementLabel, dashboardKindLabel, dashboardKind, entities } from '../data/mock.js'
import { dashboardLayout } from '../data/layout.js'
import { isStale } from '../data/governance.js'
import { AUDIENCE_OPTIONS, ALL_AUDIENCES, audienceVisibleTo } from '../data/audiences.js'

// Read-only consumption view of a dashboard (vs the /canvas editor).
export default function DashboardViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dashboards, updateDashboard } = useDashboards()
  const { widgets, addWidget } = useWidgets()
  const { tick, paused } = useLive()
  const { isAdmin } = useRole()
  const dashboard = dashboards.find((d) => d.id === id)
  const [scope, setScope] = useState(DEFAULT_SCOPE)
  // Live tick + pause flag ride along the scope into every tile (Phase 7).
  const liveScope = { ...scope, tick, paused }
  const [drill, setDrill] = useState(null) // widget opened in the drill-down
  const [viewAs, setViewAs] = useState(ALL_AUDIENCES) // "view as role" audience preview
  const [askOpen, setAskOpen] = useState(false) // U6 — talk to your dashboard

  // Tier 2 — an entity-scoped Profile dashboard surfaces on one specific record;
  // resolve it so the header links back to that Unified Profile (the consume seam).
  const profileEntity =
    dashboard?.placement?.scope === 'entity' && dashboard.placement.entityId
      ? entities.find((e) => e.id === dashboard.placement.entityId)
      : null
  const placements = dashboard ? Object.values(dashboardLayout(dashboard)).flat() : []
  const hiddenForRole = viewAs !== ALL_AUDIENCES ? placements.filter((p) => !audienceVisibleTo(p, viewAs)).length : 0
  // Stale tiles pause the workflows that depend on them (5.6).
  const stalePaused = placements
    .map((p) => widgets.find((w) => w.id === p.widgetId))
    .filter((w) => w && isStale(w)).length

  // U6.4 — turn an Ask answer into a governed AI-summary widget pinned to this
  // dashboard (admin only). The free text rides on `note` (widgetSample renders it).
  function saveAnswerAsWidget(answer, question) {
    if (!dashboard) return
    // Event handler (not a render-path data fn) → Date.now() is fine + unique, matching
    // the WidgetBuilder id convention; avoids the pid/widget-id collisions a length-based
    // stamp could produce for two same-length answers.
    const stamp = Date.now().toString(36)
    const title = (question || 'Saved answer').replace(/\s+/g, ' ').trim().slice(0, 48) || 'Saved answer'
    const wid = `w-answer-${stamp}`
    addWidget({
      id: wid,
      name: title,
      skeleton: 'AI Summary',
      source: 'AIMS OS — Ask',
      governed: true,
      freshness: 'fresh',
      health: 'active',
      usedIn: 1,
      category: 'Intelligence',
      note: answer,
    })
    const layout = dashboardLayout(dashboard)
    const next = { ...layout, main: [...(layout.main || []), { pid: `p-ans-${stamp}`, widgetId: wid, fixed: false, size: 'md', audiences: [], quickActions: [] }] }
    const count = Object.values(next).reduce((n, arr) => n + arr.length, 0)
    updateDashboard(dashboard.id, { layout: next, widgets: count })
  }

  if (!dashboard) {
    return (
      <div className="h-full grid place-items-center px-6 text-center">
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400">This dashboard doesn’t exist.</p>
          <button className="btn-secondary mt-3" onClick={() => navigate('/dashboards')}>
            <ChevronLeft size={15} /> Back to dashboards
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={dashboard.name}
        description={`${dashboardKindLabel(dashboard)} · ${dashboard.audience} · Owner ${dashboard.owner || '—'}`}
        actions={
          <>
            <Badge variant={dashboard.status} />
            {profileEntity && (
              <button className="btn-secondary" onClick={() => navigate(`/ucp/${profileEntity.id}`)} title={`Open ${profileEntity.name}'s profile`}>
                <UserRound size={15} /> View on profile
              </button>
            )}
            {isAdmin && (
              <button className="btn-primary" onClick={() => navigate(`/dashboard/${dashboard.id}/canvas`)}>
                <Pencil size={15} /> Edit
              </button>
            )}
          </>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1800px] px-6 py-5 lg:px-8 2xl:px-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <MapPin size={12} aria-hidden="true" className="shrink-0" />
              <span>{placementLabel(dashboard.placement)}</span>
            </div>
            <label htmlFor="view-as-select" className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <span className="font-medium">Viewing as</span>
              <select
                id="view-as-select"
                className="input !h-8 !w-auto !py-1 !pl-2 !pr-7 text-xs"
                value={viewAs}
                onChange={(e) => setViewAs(e.target.value)}
              >
                {AUDIENCE_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a === ALL_AUDIENCES ? 'Admin (everything)' : a}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {hiddenForRole > 0 && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-300/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-aims-ungoverned">
              {hiddenForRole} widget{hiddenForRole === 1 ? '' : 's'} hidden for {viewAs}
            </div>
          )}
          {stalePaused > 0 && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-300/40 bg-red-500/10 px-3 py-2 text-xs text-aims-stale">
              <PauseCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">
                  {stalePaused} tile{stalePaused === 1 ? '' : 's'} paused on stale data.
                </span>{' '}
                Workflows that depend on {stalePaused === 1 ? 'it' : 'them'} are paused until the source is remapped.
              </span>
            </div>
          )}
          {entityHeaderApplies(dashboard.placement) && <EntityContextHeader placement={dashboard.placement} entity={profileEntity} />}
          <DashboardControls scope={scope} onChange={setScope} />
          <DashboardZones dashboard={dashboard} scope={liveScope} onDrill={setDrill} viewerRole={viewAs} />
        </div>
      </div>

      {/* U6 — Talk to your dashboard: floating Ask button */}
      <button
        onClick={() => setAskOpen(true)}
        className="fixed bottom-5 right-5 z-20 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
        style={{ background: 'var(--grad)' }}
        title="Ask this dashboard"
      >
        <Sparkles size={16} aria-hidden="true" /> Ask
      </button>

      {drill && <WidgetDrilldownModal widget={drill} scope={liveScope} onClose={() => setDrill(null)} />}
      {askOpen && (
        <AskDashboardModal
          name={dashboard.name}
          kind={dashboardKind(dashboard)}
          widgetNames={placements.map((p) => widgets.find((w) => w.id === p.widgetId)?.name).filter(Boolean)}
          scopeLabel={scopeLabel(scope)}
          onClose={() => setAskOpen(false)}
          onSaveAsWidget={isAdmin ? saveAnswerAsWidget : undefined}
        />
      )}
    </div>
  )
}
