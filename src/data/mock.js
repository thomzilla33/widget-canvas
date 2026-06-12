// All mock data for the prototype: entities, widgets, dashboards, skeletons, chart data.

export const entities = [
  { id: 'acme-001', name: 'Acme Corporation', type: 'Account', owner: 'Sales', health: 'active' },
  { id: 'globex-002', name: 'Globex Inc.', type: 'Account', owner: 'Sales', health: 'inactive' },
  { id: 'initech-003', name: 'Initech LLC', type: 'Account', owner: 'Support', health: 'active' },
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
  },
  {
    id: 'd-mgr-overview',
    template: 't-exec',
    name: 'Manager Overview',
    entity: 'Account',
    audience: 'Manager',
    status: 'pending',
    widgets: 12,
    updated: '1 week ago',
  },
]

// New-dashboard flow (S80–S82)
export const entityTypes = ['Account', 'Contact', 'Deal', 'Case']
export const audiences = ['Sales Agent', 'Support Agent', 'Manager', 'All audiences']
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

export const skeletons = [
  { id: 'kpi', name: 'KPI', icon: '📊', maxFields: 3, desc: 'A single headline number with optional delta.' },
  { id: 'chart', name: 'Chart', icon: '📈', maxFields: 5, desc: 'Bar, line or area chart over a dimension.' },
  { id: 'list', name: 'List', icon: '📋', maxFields: 6, desc: 'Ranked or chronological list of records.' },
  { id: 'table', name: 'Table', icon: '🗂️', maxFields: 8, desc: 'Columns and rows of structured data.' },
  { id: 'timeline', name: 'Timeline', icon: '🕒', maxFields: 4, desc: 'Events ordered along a time axis.' },
  { id: 'summary', name: 'AI Summary', icon: '✨', maxFields: 2, desc: 'Pre-computed narrative summary.' },
  { id: 'gauge', name: 'Gauge', icon: '🎯', maxFields: 2, desc: 'Progress toward a target or threshold.' },
  { id: 'map', name: 'Map', icon: '🗺️', maxFields: 3, desc: 'Geographic distribution of records.' },
]

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

// Step 1 — Intent. Each intent maps to the skeletons that can answer it.
export const intents = [
  { id: 'single-metric', label: 'Show a single metric', desc: 'One headline number, e.g. total revenue.', icon: '📊', skeletons: ['kpi', 'gauge'] },
  { id: 'trend', label: 'Show a trend over time', desc: 'How a value changes across a period.', icon: '📈', skeletons: ['chart', 'timeline'] },
  { id: 'breakdown', label: 'Break down by category', desc: 'Compare a value across groups.', icon: '🧩', skeletons: ['chart', 'table'] },
  { id: 'list-records', label: 'List records', desc: 'Show individual rows, ranked or recent.', icon: '📋', skeletons: ['list', 'table'] },
  { id: 'ai-summary', label: 'Summarize with AI', desc: 'A narrative summary of the data.', icon: '✨', skeletons: ['summary'] },
  { id: 'geographic', label: 'Show on a map', desc: 'Where records are located.', icon: '🗺️', skeletons: ['map'] },
]

// Step 2 — Data sources. Governed = approved Data View in Data Studio.
// Ungoverned = metric computed directly in Widget Builder.
export const dataSources = [
  { id: 'src-finance', name: 'Finance Data View', governed: true, owner: 'Finance Team', reviewed: 'Apr 2026', hasPII: false },
  { id: 'src-crm', name: 'CRM Data View', governed: true, owner: 'RevOps', reviewed: 'May 2026', hasPII: true },
  { id: 'src-survey', name: 'Survey Data View', governed: true, owner: 'CX Research', reviewed: 'Feb 2026', hasPII: false },
  { id: 'src-computed', name: 'Compute a metric here', governed: false, owner: 'You (Widget Builder)', reviewed: null, hasPII: false },
]
