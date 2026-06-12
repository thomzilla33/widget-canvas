// All mock data for the prototype: entities, widgets, dashboards, skeletons, chart data.

export const entities = [
  // Companies / Accounts
  { id: 'acme-001', name: 'Acme Corporation', type: 'Account', owner: 'Sales', health: 'active' },
  { id: 'globex-002', name: 'Globex Inc.', type: 'Account', owner: 'Sales', health: 'inactive' },
  { id: 'initech-003', name: 'Initech LLC', type: 'Account', owner: 'Support', health: 'active' },
  // Contacts (UCP)
  { id: 'c-dana', name: 'Dana Lee', type: 'Contact', owner: 'Sales', health: 'active' },
  { id: 'c-sam', name: 'Sam Ortiz', type: 'Contact', owner: 'Support', health: 'active' },
  // Employees (UEP)
  { id: 'e-maria', name: 'María González', type: 'Employee', owner: 'People Ops', health: 'active' },
  { id: 'e-tom', name: 'Tom Becker', type: 'Employee', owner: 'People Ops', health: 'active' },
  // Deals
  { id: 'deal-acme-q3', name: 'Acme Renewal — Q3', type: 'Deal', owner: 'Sales', health: 'active' },
  // Cases
  { id: 'case-4821', name: 'Case #4821 — Outage', type: 'Case', owner: 'Support', health: 'active' },
]

export const widgets = [
  {
    id: 'w-revenue',
    name: 'Total Revenue',
    skeleton: 'KPI',
    governed: true,
    freshness: 'live',
    health: 'active',
    usedIn: 5,
    source: 'Finance Data View',
  },
  {
    id: 'w-pipeline',
    name: 'Pipeline by Stage',
    skeleton: 'Chart',
    governed: true,
    freshness: 'fresh',
    health: 'active',
    usedIn: 3,
    source: 'CRM Data View',
  },
  {
    id: 'w-tickets',
    name: 'Open Tickets',
    skeleton: 'List',
    governed: false,
    freshness: 'aging',
    health: 'inactive',
    usedIn: 1,
    source: 'Computed in Widget Builder',
  },
  {
    id: 'w-nps',
    name: 'NPS Trend',
    skeleton: 'Chart',
    governed: true,
    freshness: 'stale',
    health: 'review',
    usedIn: 0,
    source: 'Survey Data View',
  },
]

export const dashboards = [
  {
    id: 'd-sales-acct',
    template: 't-acct360',
    name: 'Sales — Account 360',
    entity: 'Account',
    audience: 'Sales Agent',
    status: 'published',
    widgets: 8,
    updated: '2 days ago',
    placement: { surface: 'profile', profileType: 'Company', scope: 'all', entityId: null, entityName: null, tab: 'Overview' },
  },
  {
    id: 'd-support-acct',
    template: 't-support',
    name: 'Support — Account Health',
    entity: 'Account',
    audience: 'Support Agent',
    status: 'draft',
    widgets: 5,
    updated: '5 hours ago',
    placement: { surface: 'profile', profileType: 'Company', scope: 'entity', entityId: 'acme-001', entityName: 'Acme Corporation', tab: 'Activity' },
  },
  {
    id: 'd-mgr-overview',
    template: 't-exec',
    name: 'Manager Overview',
    entity: 'Report',
    audience: 'Manager',
    status: 'pending',
    widgets: 12,
    updated: '1 week ago',
    placement: { surface: 'report', collection: 'Executive' },
  },
]

// New-dashboard flow (S80–S82)
export const entityTypes = ['Account', 'Contact', 'Deal', 'Case']
export const audiences = ['Sales Agent', 'Support Agent', 'Manager', 'All audiences']

// ── Dashboard placement (where a new dashboard lives) ──
// surface: 'profile' (nested in an entity profile) | 'report' | 'home'
export const PLACEMENT_SURFACES = [
  { id: 'profile', label: 'Unified profile', desc: 'Nest inside a Company, Contact, or Employee profile.', iconName: 'UserSquare' },
  { id: 'report', label: 'Standalone report', desc: 'Lives in Reports — not tied to a profile.', iconName: 'FileBarChart' },
  { id: 'home', label: 'Workspace home', desc: 'A personal or team landing dashboard.', iconName: 'Home' },
]

// Profile types you can nest a dashboard into, each with its own default tabs.
export const PROFILE_TYPES = [
  { id: 'Company', label: 'Company / Account', entityType: 'Account', tabs: ['Overview', 'Financials', 'Activity', 'Relationships'] },
  { id: 'Contact', label: 'Contact (UCP)', entityType: 'Contact', tabs: ['Overview', 'Activity', 'Opportunities', 'Notes'] },
  { id: 'Employee', label: 'Employee (UEP)', entityType: 'Employee', tabs: ['Overview', 'Performance', 'Org chart', 'Compensation'] },
  { id: 'Deal', label: 'Deal', entityType: 'Deal', tabs: ['Overview', 'Timeline', 'Stakeholders'] },
  { id: 'Case', label: 'Case', entityType: 'Case', tabs: ['Overview', 'Activity', 'Resolution'] },
]

export const REPORT_COLLECTIONS = ['Sales Reports', 'Finance Reports', 'Support Reports', 'Executive']
export const HOME_SCOPES = [
  { id: 'personal', label: 'Just me' },
  { id: 'team', label: 'My team' },
]

// Human-readable destination for a dashboard's placement (used in the list).
export function placementLabel(p) {
  if (!p) return 'Unscoped'
  if (p.surface === 'report') return `Report · ${p.collection || 'Reports'}`
  if (p.surface === 'home') return `Home · ${p.homeScope === 'team' ? 'My team' : p.homeScope === 'personal' ? 'Just me' : 'Workspace'}`
  const pt = PROFILE_TYPES.find((t) => t.id === p.profileType)
  const ptLabel = pt?.label || p.profileType || 'Profile'
  const where = p.scope === 'entity' ? p.entityName || 'a specific profile' : `All ${ptLabel} profiles`
  return `${ptLabel} · ${where} · ${p.tab || 'Overview'}`
}
export const dashboardTemplates = [
  { id: 't-acct360', name: 'Account 360', desc: 'KPIs, pipeline, and recent activity.', entity: 'Account' },
  { id: 't-support', name: 'Support Health', desc: 'Open tickets, SLA, and CSAT.', entity: 'Account' },
  { id: 't-exec', name: 'Exec Overview', desc: 'High-level rollups for leadership.', entity: 'Account' },
]

// Pre-built widget layout per template (zone -> widget ids). Used to seed a
// dashboard canvas created "from an AIMS template".
export const TEMPLATE_SEED = {
  't-acct360': [
    { zone: 'header', widgetId: 'w-revenue' },
    { zone: 'main', widgetId: 'w-pipeline' },
    { zone: 'sidebar', widgetId: 'w-tickets' },
  ],
  't-support': [
    { zone: 'header', widgetId: 'w-tickets' },
    { zone: 'main', widgetId: 'w-nps' },
  ],
  't-exec': [
    { zone: 'header', widgetId: 'w-revenue' },
    { zone: 'main', widgetId: 'w-pipeline' },
    { zone: 'main', widgetId: 'w-nps' },
  ],
}

// Widget Marketplace — browseable pre-built widgets. `id` is the templateId
// used for install dedup; on install a real catalog widget is derived from these.
export const MARKETPLACE_CATEGORIES = ['Sales', 'Support', 'Finance', 'Product', 'CX']
export const MARKETPLACE_WIDGETS = [
  { id: 'mw-arr', name: 'ARR Snapshot', category: 'Finance', maker: 'AIMS', skeleton: 'KPI', governed: true, source: 'Finance Data View', freshness: 'live', description: 'Annual recurring revenue with month-over-month delta, sourced from the governed Finance view.', stats: { installs: 1240, fields: 3 }, featured: true },
  { id: 'mw-pipeline-velocity', name: 'Pipeline Velocity', category: 'Sales', maker: 'AIMS', skeleton: 'Chart', governed: true, source: 'CRM Data View', freshness: 'fresh', description: 'Deal flow speed across stages so reps see where momentum stalls.', stats: { installs: 980, fields: 5 } },
  { id: 'mw-win-rate', name: 'Win Rate by Rep', category: 'Sales', maker: 'AIMS', skeleton: 'Table', governed: true, source: 'CRM Data View', freshness: 'fresh', description: 'Closed-won vs closed-lost ratios broken down by sales rep.', stats: { installs: 760, fields: 6 } },
  { id: 'mw-sla-breach', name: 'SLA Breach Risk', category: 'Support', maker: 'AIMS', skeleton: 'Gauge', governed: true, source: 'Support Data View', freshness: 'live', description: 'Live gauge of tickets approaching their SLA threshold.', stats: { installs: 540, fields: 2 } },
  { id: 'mw-ticket-queue', name: 'Open Ticket Queue', category: 'Support', maker: 'Community', skeleton: 'List', governed: false, source: 'Computed in Widget Builder', freshness: 'aging', description: 'Chronological list of unresolved tickets with priority flags.', stats: { installs: 310, fields: 6 } },
  { id: 'mw-csat-trend', name: 'CSAT Trend', category: 'CX', maker: 'AIMS', skeleton: 'Chart', governed: true, source: 'Survey Data View', freshness: 'fresh', description: 'Customer satisfaction trend with a rolling 30-day average.', stats: { installs: 690, fields: 4 } },
  { id: 'mw-nps-map', name: 'NPS by Region', category: 'CX', maker: 'Community', skeleton: 'Map', governed: false, source: 'Survey Data View', freshness: 'stale', description: 'Geographic distribution of net promoter score across regions.', stats: { installs: 180, fields: 3 } },
  { id: 'mw-feature-adoption', name: 'Feature Adoption', category: 'Product', maker: 'AIMS', skeleton: 'Chart', governed: true, source: 'Product Data View', freshness: 'fresh', description: 'Adoption curve per feature so PMs spot what is landing.', stats: { installs: 820, fields: 5 } },
  { id: 'mw-activation', name: 'Activation Funnel', category: 'Product', maker: 'AIMS', skeleton: 'Timeline', governed: true, source: 'Product Data View', freshness: 'live', description: 'Step-by-step activation funnel from signup to first value.', stats: { installs: 450, fields: 4 } },
  { id: 'mw-burn', name: 'Cash Burn', category: 'Finance', maker: 'Community', skeleton: 'KPI', governed: false, source: 'Computed in Widget Builder', freshness: 'aging', description: 'Monthly net burn with a runway estimate.', stats: { installs: 220, fields: 3 }, featured: true },
  { id: 'mw-ai-exec', name: 'AI Exec Brief', category: 'Finance', maker: 'AIMS', skeleton: 'AI Summary', governed: true, source: 'Finance Data View', freshness: 'live', description: 'Pre-computed narrative summary of the quarter for leadership.', stats: { installs: 410, fields: 2 } },
]

// Widget Playground — expanded widget types (visual gallery)
export const WIDGET_TYPES = [
  { id: 'kpi', label: 'KPI', category: 'Metric', iconName: 'Hash' },
  { id: 'line', label: 'Line Chart', category: 'Trend', iconName: 'LineChart' },
  { id: 'bar', label: 'Bar Chart', category: 'Breakdown', iconName: 'BarChart3' },
  { id: 'pie', label: 'Pie / Donut', category: 'Breakdown', iconName: 'PieChart' },
  { id: 'table', label: 'Table', category: 'Records', iconName: 'Table2' },
  { id: 'heatmap', label: 'Heat Map', category: 'Relationship', iconName: 'Grid3x3' },
  { id: 'scatter', label: 'Correlation', category: 'Relationship', iconName: 'ScatterChart' },
  { id: 'carousel', label: 'Carousel', category: 'Records', iconName: 'GalleryHorizontalEnd' },
  { id: 'gauge', label: 'Gauge', category: 'Metric', iconName: 'Gauge' },
  { id: 'list', label: 'List', category: 'Records', iconName: 'List' },
  { id: 'summary', label: 'AI Summary', category: 'Narrative', iconName: 'Sparkles' },
  { id: 'map', label: 'Map', category: 'Geo', iconName: 'Map' },
]
export const TYPE_LABEL = Object.fromEntries(WIDGET_TYPES.map((t) => [t.id, t.label]))

// External data sources (named connectors) now live in their own module so the
// ~40-source catalog stays readable. Re-exported here for existing imports.
export { EXTERNAL_SOURCES, SOURCE_CATEGORIES, sourceFields } from './sources.js'

// Feedback loop (S22–S27 user · S121–S123 admin)
export const FLAG_REASONS = [
  'Wrong number',
  'Stale / outdated',
  'Wrong records shown',
  'Missing data',
  'Other',
]
export const CANNED_ANSWER =
  'This widget reads from its governed data source and shows the latest synced value. If a figure looks off it may be awaiting the next sync — you can flag it so the data owner reviews it.'
export const feedbackFlags = [
  {
    id: 'fl-1',
    widgetId: 'w-nps',
    entityId: 'initech-003',
    reason: 'Stale / outdated',
    details: "NPS hasn't moved in weeks — looks frozen.",
    reporter: 'Dana Lee (Support Agent)',
    createdAt: '3 hours ago',
    status: 'open',
  },
  {
    id: 'fl-2',
    widgetId: 'w-tickets',
    entityId: 'acme-001',
    reason: 'Wrong records shown',
    details: 'Showing tickets that belong to a different account.',
    reporter: 'Sam Ortiz (Sales Agent)',
    createdAt: '1 day ago',
    status: 'open',
  },
]

// Sharing & access (S105–S108)
export const SHARE_PEOPLE = [
  { id: 'u-1', name: 'Dana Lee', sub: 'Support Agent', initials: 'DL' },
  { id: 'u-2', name: 'Sam Ortiz', sub: 'Sales Agent', initials: 'SO' },
  { id: 'u-3', name: 'Priya Nair', sub: 'Manager', initials: 'PN' },
  { id: 'u-4', name: 'Marco Diaz', sub: 'Sales Agent', initials: 'MD' },
]
export const SHARE_DEPARTMENTS = [
  { id: 'dep-sales', name: 'Sales', sub: '42 people' },
  { id: 'dep-support', name: 'Support', sub: '18 people' },
  { id: 'dep-cs', name: 'Customer Success', sub: '27 people' },
]
export const SHARE_ROLES = ['Viewer', 'Editor']

// Notifications (S115–S120)
export const NOTIFICATION_CATEGORIES = [
  { id: 'threshold', label: 'Freshness threshold alerts', mandatory: true },
  { id: 'dashboard', label: 'Dashboard updates', mandatory: false },
  { id: 'feedback', label: 'Feedback responses', mandatory: false },
]
export const notifications = [
  {
    id: 'n1',
    category: 'threshold',
    icon: '⏱️',
    title: 'Freshness threshold exceeded',
    body: '“NPS Trend” is stale — last synced 3 days ago.',
    when: '10 min ago',
    read: false,
  },
  {
    id: 'n2',
    category: 'dashboard',
    icon: '🗂️',
    title: '3 dashboards you follow were updated',
    body: 'Sales — Account 360, Manager Overview, +1 more.',
    when: '2 hours ago',
    read: false,
  },
  {
    id: 'n3',
    category: 'feedback',
    icon: '🚩',
    title: 'Your flag was resolved',
    body: 'Open Tickets — “Wrong records shown” was marked resolved.',
    when: '1 day ago',
    read: true,
  },
]

// Schema drift (S111–S114) — keyed by widget id. Describes what changed in the
// source schema and which of the widget's bindings need re-mapping.
export const SCHEMA_DRIFT = {
  'w-nps': {
    source: 'Survey Data View',
    changedOn: '2 days ago',
    previous: [
      { name: 'nps_score', status: 'unchanged' },
      { name: 'survey_date', status: 'removed' },
      { name: 'segment', status: 'removed' },
    ],
    current: [
      { name: 'nps_score', status: 'unchanged' },
      { name: 'response_date', status: 'new' },
      { name: 'region', status: 'new' },
    ],
    newFields: ['nps_score', 'response_date', 'region'],
    // bindings the widget used that are now broken
    broken: [
      { binding: 'Time axis', was: 'survey_date', suggest: 'response_date' },
      { binding: 'Breakdown', was: 'segment', suggest: 'region' },
    ],
    ok: [{ binding: 'Value', was: 'nps_score' }],
  },
}

