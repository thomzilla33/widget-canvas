// All mock data for the prototype: entities, widgets, dashboards, skeletons, chart data.

export const entities = [
  // Companies / Accounts
  { id: 'acme-001', name: 'Acme Corporation', type: 'Account', owner: 'Priya Nair', health: 'active', email: 'billing@acme.com', phone: '+1 (415) 555-0110', address: '500 Market St, San Francisco, CA', company: 'Enterprise · SaaS', status: 'Renewal in Q3' },
  { id: 'globex-002', name: 'Globex Inc.', type: 'Account', owner: 'Dana Lee', health: 'inactive', email: 'ap@globex.com', phone: '+1 (212) 555-0144', address: '1 Globex Plaza, New York, NY', company: 'Mid-Market · Manufacturing', status: 'At risk' },
  { id: 'initech-003', name: 'Initech LLC', type: 'Account', owner: 'Sam Ortiz', health: 'active', email: 'accounts@initech.com', phone: '+1 (512) 555-0188', address: '88 Office Park, Austin, TX', company: 'SMB · Software', status: 'Active' },
  // Contacts (UCP)
  { id: 'c-dana', name: 'Dana Lee', type: 'Contact', owner: 'David Kim', health: 'active', email: 'dana.lee@acme.com', phone: '+1 (415) 555-0192', address: 'San Francisco, CA', company: 'Acme Corp', title: 'VP Operations', status: 'Appointment Today' },
  { id: 'c-sam', name: 'Sam Ortiz', type: 'Contact', owner: 'David Kim', health: 'active', email: 'sam.ortiz@globex.com', phone: '+1 (212) 555-0177', address: 'New York, NY', company: 'Globex Inc.', title: 'Procurement Lead', status: 'Follow-up due' },
  // Employees (UEP)
  { id: 'e-maria', name: 'María González', type: 'Employee', owner: 'David Kim', health: 'active', email: 'maria.gonzalez@aims.com', phone: '+1 (415) 555-0144', address: 'Austin, TX', company: 'People Ops · AIMS', title: 'Senior CSM', status: 'Active' },
  { id: 'e-tom', name: 'Tom Becker', type: 'Employee', owner: 'Priya Nair', health: 'active', email: 'tom.becker@aims.com', phone: '+1 (206) 555-0123', address: 'Seattle, WA', company: 'Sales · AIMS', title: 'Account Executive', status: 'Active' },
  // Deals
  { id: 'deal-acme-q3', name: 'Acme Renewal — Q3', type: 'Deal', owner: 'Priya Nair', health: 'active', email: 'billing@acme.com', phone: '+1 (415) 555-0110', address: 'San Francisco, CA', company: 'Acme Corp', status: 'Negotiation' },
  // Cases
  { id: 'case-4821', name: 'Case #4821 — Outage', type: 'Case', owner: 'Sam Ortiz', health: 'active', email: 'support@initech.com', phone: '+1 (512) 555-0188', address: 'Austin, TX', company: 'Initech LLC', status: 'Escalated' },
]

// Widget catalog — realistic for an enterprise BI workspace (dozens of widgets
// across sources, with usage counts and varied health/freshness).
const W = (o) => ({ governed: true, freshness: 'fresh', health: 'active', usedIn: 0, category: 'Operational', ...o })
export const CATALOG_CATEGORIES = ['AIMS OS', 'Operational', 'Engagement', 'Intelligence']
export const widgets = [
  // ── AIMS OS — our own platform activity (the V1 differentiator) ──
  W({ id: 'w-aims-hitl', name: 'Human-in-the-Loops', skeleton: 'KPI', category: 'AIMS OS', freshness: 'live', usedIn: 3, source: 'AIMS OS — Agentic Studio' }),
  W({ id: 'w-aims-runs', name: 'Workflow Runs', skeleton: 'Chart', category: 'AIMS OS', freshness: 'live', usedIn: 4, source: 'AIMS OS — Agentic Studio' }),
  W({ id: 'w-aims-conversations', name: 'Conversations Handled', skeleton: 'KPI', category: 'AIMS OS', freshness: 'live', usedIn: 2, source: 'AIMS OS — Agentic Studio' }),
  W({ id: 'w-aims-escalation', name: 'Escalation Rate', skeleton: 'Gauge', category: 'AIMS OS', usedIn: 2, source: 'AIMS OS — Agentic Studio' }),
  W({ id: 'w-aims-messages', name: 'Messages Sent', skeleton: 'Chart', category: 'AIMS OS', freshness: 'live', usedIn: 1, source: 'AIMS OS — Agentic Studio' }),
  W({ id: 'w-aims-actions', name: 'Actions by Type', skeleton: 'Chart', category: 'AIMS OS', usedIn: 2, source: 'AIMS OS — Agentic Studio' }),
  // Governance / Council
  W({ id: 'w-aims-blocked', name: 'Blocked Actions', skeleton: 'KPI', category: 'AIMS OS', freshness: 'live', usedIn: 2, source: 'AIMS OS — Governance' }),
  W({ id: 'w-aims-outcomes', name: 'Council Outcomes', skeleton: 'Donut', category: 'AIMS OS', usedIn: 2, source: 'AIMS OS — Governance' }),
  // Showcase the new tile types
  W({ id: 'w-aims-agentboard', name: 'Agent Status Board', skeleton: 'Board', category: 'AIMS OS', freshness: 'live', usedIn: 1, source: 'AIMS OS — Agents (AMP)' }),
  W({ id: 'w-aims-activity', name: 'Recent Activity', skeleton: 'Feed', category: 'AIMS OS', freshness: 'live', usedIn: 2, source: 'AIMS OS — Platform' }),
  W({ id: 'w-aims-govalerts', name: 'Governance Alerts', skeleton: 'Alerts', category: 'AIMS OS', freshness: 'live', usedIn: 2, source: 'AIMS OS — Governance' }),
  W({ id: 'w-aims-conversionfunnel', name: 'Conversion Funnel', skeleton: 'Funnel', category: 'AIMS OS', usedIn: 1, source: 'AIMS OS — Data Studio' }),
  W({ id: 'w-aims-platformstats', name: 'Platform Snapshot', skeleton: 'Stat Row', category: 'AIMS OS', freshness: 'live', usedIn: 2, source: 'AIMS OS — Platform' }),
  // Truth Plane
  W({ id: 'w-aims-facts', name: 'Active Facts', skeleton: 'KPI', category: 'AIMS OS', usedIn: 3, source: 'AIMS OS — Truth Plane' }),
  W({ id: 'w-aims-facttier', name: 'Facts by Tier', skeleton: 'Chart', category: 'AIMS OS', usedIn: 1, source: 'AIMS OS — Truth Plane' }),
  // Sandbox plane — unverified candidate facts (never blended with Truth)
  W({ id: 'w-aims-candidatefacts', name: 'Candidate Facts (Sandbox)', skeleton: 'KPI', category: 'AIMS OS', dataPlane: 'sandbox', usedIn: 1, source: 'AIMS OS — Truth Plane' }),
  // Human Touch Layer
  W({ id: 'w-aims-queue', name: 'Queue Depth', skeleton: 'KPI', category: 'AIMS OS', freshness: 'live', usedIn: 4, source: 'AIMS OS — Human Touch Layer' }),
  W({ id: 'w-aims-sla', name: 'SLA Compliance Rate', skeleton: 'Gauge', category: 'AIMS OS', freshness: 'live', usedIn: 3, source: 'AIMS OS — Human Touch Layer' }),
  // Credits & Billing
  W({ id: 'w-aims-credits', name: 'Credits Consumed', skeleton: 'KPI', category: 'AIMS OS', freshness: 'live', usedIn: 5, source: 'AIMS OS — Credits & Billing' }),
  W({ id: 'w-aims-balance', name: 'Balance Remaining', skeleton: 'Gauge', category: 'AIMS OS', usedIn: 2, source: 'AIMS OS — Credits & Billing' }),
  // Conversations
  W({ id: 'w-aims-activeconv', name: 'Active Conversations', skeleton: 'KPI', category: 'AIMS OS', freshness: 'live', usedIn: 2, source: 'AIMS OS — Conversations' }),
  W({ id: 'w-aims-split', name: 'Agent vs Human Messages', skeleton: 'Chart', category: 'AIMS OS', usedIn: 1, source: 'AIMS OS — Conversations' }),
  // Agents (AMP)
  W({ id: 'w-aims-agents', name: 'Active Agents', skeleton: 'KPI', category: 'AIMS OS', usedIn: 3, source: 'AIMS OS — Agents (AMP)' }),
  W({ id: 'w-aims-topagents', name: 'Top Agents by Runs', skeleton: 'List', category: 'AIMS OS', usedIn: 1, source: 'AIMS OS — Agents (AMP)' }),
  // Helm (ROI)
  W({ id: 'w-aims-roi', name: 'Net AI Workforce ROI', skeleton: 'KPI', category: 'AIMS OS', usedIn: 4, source: 'AIMS OS — Helm (ROI)' }),
  W({ id: 'w-aims-valuecat', name: 'Value by Category', skeleton: 'Chart', category: 'AIMS OS', usedIn: 2, source: 'AIMS OS — Helm (ROI)' }),
  // Data Studio
  W({ id: 'w-aims-uptime', name: 'Connector Uptime', skeleton: 'Gauge', category: 'AIMS OS', freshness: 'live', usedIn: 2, source: 'AIMS OS — Data Studio' }),
  W({ id: 'w-aims-syncfail', name: 'Sync Failures', skeleton: 'KPI', category: 'AIMS OS', freshness: 'aging', usedIn: 1, source: 'AIMS OS — Data Studio' }),
  // Stale — its source schema changed, so dependent workflows are paused until remapped
  W({ id: 'w-aims-leadfeed', name: 'Lead Enrichment Feed', skeleton: 'Chart', category: 'AIMS OS', freshness: 'stale', health: 'review', usedIn: 2, source: 'AIMS OS — Data Studio' }),
  W({ id: 'w-revenue', name: 'Total Revenue', skeleton: 'KPI', category: 'Intelligence', freshness: 'live', usedIn: 9, source: 'Finance Data View' }),
  W({ id: 'w-mrr', name: 'MRR Trend', skeleton: 'Chart', category: 'Intelligence', freshness: 'live', usedIn: 7, source: 'Stripe' }),
  W({ id: 'w-arr', name: 'ARR Snapshot', skeleton: 'KPI', category: 'Intelligence', usedIn: 12, source: 'Finance Data View' }),
  W({ id: 'w-pipeline', name: 'Pipeline by Stage', skeleton: 'Chart', category: 'Operational', usedIn: 8, source: 'Salesforce' }),
  W({ id: 'w-winrate', name: 'Win Rate', skeleton: 'Gauge', category: 'Operational', usedIn: 5, source: 'Salesforce' }),
  W({ id: 'w-dealsize', name: 'Avg Deal Size', skeleton: 'KPI', category: 'Operational', usedIn: 4, source: 'Salesforce' }),
  W({ id: 'w-leadvel', name: 'Lead Velocity', skeleton: 'Chart', category: 'Operational', freshness: 'aging', health: 'inactive', usedIn: 2, source: 'HubSpot' }),
  W({ id: 'w-churn', name: 'Churn Rate', skeleton: 'Gauge', category: 'Intelligence', usedIn: 6, source: 'Stripe' }),
  W({ id: 'w-nrr', name: 'Net Revenue Retention', skeleton: 'KPI', category: 'Intelligence', usedIn: 5, source: 'Finance Data View' }),
  W({ id: 'w-tickets', name: 'Open Tickets', skeleton: 'List', category: 'Operational', governed: false, freshness: 'aging', health: 'inactive', usedIn: 3, source: 'Zendesk' }),
  W({ id: 'w-csat', name: 'CSAT', skeleton: 'Gauge', category: 'Engagement', usedIn: 6, source: 'Zendesk' }),
  W({ id: 'w-sla', name: 'SLA Breach Risk', skeleton: 'Gauge', category: 'Operational', freshness: 'live', usedIn: 4, source: 'Zendesk' }),
  W({ id: 'w-ticketvol', name: 'Ticket Volume', skeleton: 'Chart', category: 'Operational', usedIn: 5, source: 'Zendesk' }),
  W({ id: 'w-nps', name: 'NPS Trend', skeleton: 'Chart', category: 'Engagement', freshness: 'stale', health: 'review', usedIn: 0, source: 'Survey Data View' }),
  W({ id: 'w-firstresp', name: 'First Response Time', skeleton: 'KPI', category: 'Operational', usedIn: 3, source: 'Intercom' }),
  W({ id: 'w-headcount', name: 'Headcount', skeleton: 'Chart', category: 'Operational', usedIn: 4, source: 'HR Platform (Workday)' }),
  W({ id: 'w-attrition', name: 'Attrition', skeleton: 'Gauge', category: 'Engagement', freshness: 'aging', health: 'review', usedIn: 1, source: 'HR Platform (Workday)' }),
  W({ id: 'w-timetohire', name: 'Time to Hire', skeleton: 'KPI', category: 'Operational', usedIn: 2, source: 'Greenhouse' }),
  W({ id: 'w-adspend', name: 'Ad Spend by Channel', skeleton: 'Chart', category: 'Operational', freshness: 'live', usedIn: 3, source: 'Google Ads' }),
  W({ id: 'w-roas', name: 'ROAS', skeleton: 'Gauge', category: 'Intelligence', freshness: 'live', usedIn: 4, source: 'Google Ads' }),
  W({ id: 'w-emailctr', name: 'Email Click-through Rate', skeleton: 'KPI', category: 'Engagement', health: 'inactive', usedIn: 2, source: 'HubSpot' }),
  W({ id: 'w-cashburn', name: 'Cash Burn', skeleton: 'KPI', category: 'Intelligence', governed: false, freshness: 'aging', health: 'inactive', usedIn: 1, source: 'QuickBooks' }),
  W({ id: 'w-apaging', name: 'AP Aging', skeleton: 'Chart', category: 'Operational', usedIn: 2, source: 'ERP (NetSuite)' }),
  W({ id: 'w-margin', name: 'Margin by Region', skeleton: 'Heat Map', category: 'Intelligence', usedIn: 3, source: 'ERP (NetSuite)' }),
  W({ id: 'w-accbyregion', name: 'Accounts by Region', skeleton: 'Map', category: 'Intelligence', usedIn: 2, source: 'Salesforce' }),
  W({ id: 'w-topaccounts', name: 'Top Accounts', skeleton: 'Table', category: 'Intelligence', usedIn: 5, source: 'Finance Data View' }),
  W({ id: 'w-contacts', name: 'Contacts', skeleton: 'Table', category: 'Engagement', governed: false, health: 'review', usedIn: 0, source: 'Salesforce' }),
  W({ id: 'w-execsummary', name: 'Exec AI Summary', skeleton: 'AI Summary', category: 'Intelligence', usedIn: 6, source: 'Snowflake' }),
]

// Deactivated/offboarded users — dashboards they own need ownership recovery.
export const DEACTIVATED_OWNERS = ['Robert Chen', 'Aisha Khan']

export const dashboards = [
  { id: 'd-aims-ops', template: 't-aims-ops', name: 'AIMS Operations', entity: 'Report', audience: 'Manager', owner: 'Priya Nair', status: 'published', widgets: 7, updated: '1 hour ago', placement: { surface: 'report', collection: 'Operations' } },
  { id: 'd-sales-acct', template: 't-acct360', name: 'Sales — Account 360', entity: 'Company', audience: 'Sales Agent', owner: 'Priya Nair', status: 'published', widgets: 8, updated: '2 days ago', placement: { surface: 'profile', profileType: 'Company', scope: 'all', entityId: null, entityName: null, tab: 'Overview' } },
  { id: 'd-support-acct', template: 't-support', name: 'Support — Account Health', entity: 'Company', audience: 'Support Agent', owner: 'Dana Lee', status: 'draft', widgets: 5, updated: '5 hours ago', placement: { surface: 'profile', profileType: 'Company', scope: 'entity', entityId: 'acme-001', entityName: 'Acme Corporation', tab: 'Activity' } },
  { id: 'd-mgr-overview', template: 't-exec', name: 'Manager Overview', entity: 'Report', audience: 'Manager', owner: 'Priya Nair', status: 'pending', widgets: 12, updated: '1 week ago', placement: { surface: 'report', collection: 'Executive' } },
  { id: 'd-rev-exec', template: 't-exec', name: 'Revenue Exec Report', entity: 'Report', audience: 'Manager', owner: 'Robert Chen', status: 'published', widgets: 10, updated: '3 days ago', placement: { surface: 'report', collection: 'Finance Reports' } },
  { id: 'd-contact-360', template: 't-acct360', name: 'Contact 360', entity: 'Contact', audience: 'Sales Agent', owner: 'Sam Ortiz', status: 'published', widgets: 7, updated: '1 day ago', placement: { surface: 'profile', profileType: 'Contact', scope: 'all', entityId: null, entityName: null, tab: 'Overview' } },
  { id: 'd-employee-perf', template: 't-exec', name: 'Employee Performance', entity: 'Employee', audience: 'Manager', owner: 'Yuki Tanaka', status: 'draft', widgets: 6, updated: '4 hours ago', placement: { surface: 'profile', profileType: 'Employee', scope: 'all', entityId: null, entityName: null, tab: 'Performance' } },
  { id: 'd-cs-health', template: 't-support', name: 'CS Health', entity: 'Company', audience: 'Support Agent', owner: 'Aisha Khan', status: 'published', widgets: 9, updated: '6 days ago', placement: { surface: 'profile', profileType: 'Company', scope: 'all', entityId: null, entityName: null, tab: 'Activity' } },
  { id: 'd-team-home', template: 't-acct360', name: 'Sales Team Home', entity: 'Home', audience: 'Sales Agent', owner: 'Priya Nair', status: 'published', widgets: 5, updated: '2 weeks ago', placement: { surface: 'home', homeScope: 'team' } },
  { id: 'd-deal-room', template: 't-acct360', name: 'Deal Room', entity: 'Deal', audience: 'Sales Agent', owner: 'Liam Murphy', status: 'draft', widgets: 4, updated: '3 hours ago', placement: { surface: 'profile', profileType: 'Deal', scope: 'all', entityId: null, entityName: null, tab: 'Overview' } },
  { id: 'd-marketing', template: 't-exec', name: 'Marketing Performance', entity: 'Report', audience: 'Manager', owner: 'Elena Petrova', status: 'published', widgets: 11, updated: '5 days ago', placement: { surface: 'report', collection: 'Sales Reports' } },
  { id: 'd-support-mgr', template: 't-support', name: 'Support Leadership', entity: 'Report', audience: 'Manager', owner: 'James Okonkwo', status: 'pending', widgets: 8, updated: '1 week ago', placement: { surface: 'report', collection: 'Support Reports' } },
  { id: 'd-finance', template: 't-support', name: 'Finance Close', entity: 'Report', audience: 'Manager', owner: 'Priya Nair', status: 'draft', widgets: 9, updated: '2 days ago', placement: { surface: 'report', collection: 'Finance Reports' } },
  { id: 'd-onboarding', template: 't-acct360', name: 'New Hire Onboarding', entity: 'Employee', audience: 'All audiences', owner: 'Yuki Tanaka', status: 'published', widgets: 5, updated: '1 month ago', placement: { surface: 'profile', profileType: 'Employee', scope: 'all', entityId: null, entityName: null, tab: 'Overview' } },
  { id: 'd-exec-home', template: 't-exec', name: 'Exec Home', entity: 'Home', audience: 'Manager', owner: 'You (admin)', status: 'published', widgets: 7, updated: '3 days ago', placement: { surface: 'home', homeScope: 'personal' } },
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
// Every profile has Overview / Activity / Snapshot as mandatory tabs; the rest are
// default-but-removable, and admins can add custom tabs (Garage is the automotive
// example — present only where it applies).
export const MANDATORY_TABS = ['Overview', 'Activity', 'Snapshot']

export const PROFILE_TYPES = [
  { id: 'Company', label: 'Company / Account', entityType: 'Account', tabs: ['Overview', 'Activity', 'Snapshot', 'Financials', 'Relationships'] },
  { id: 'Contact', label: 'Contact (UCP)', entityType: 'Contact', tabs: ['Overview', 'Activity', 'Snapshot', 'Appointments', 'Repair Orders', 'Tasks'] },
  { id: 'Employee', label: 'Employee (UEP)', entityType: 'Employee', tabs: ['Overview', 'Activity', 'Snapshot', 'Performance', 'Org chart'] },
  { id: 'Deal', label: 'Deal', entityType: 'Deal', tabs: ['Overview', 'Activity', 'Snapshot', 'Timeline', 'Stakeholders'] },
  { id: 'Case', label: 'Case', entityType: 'Case', tabs: ['Overview', 'Activity', 'Snapshot', 'Resolution'] },
]

export const REPORT_COLLECTIONS = ['Sales Reports', 'Finance Reports', 'Support Reports', 'Executive']

// Widget sizing — drives column span on the canvas AND how much detail renders.
export const WIDGET_SIZES = [
  { id: 'sm', label: 'Small', span: 1, width: '1/3 width', detail: 'Compact summary' },
  { id: 'md', label: 'Medium', span: 2, width: '2/3 width', detail: 'Standard view' },
  { id: 'lg', label: 'Large', span: 3, width: 'Full width', detail: 'Detailed view' },
]
export const HOME_SCOPES = [
  { id: 'personal', label: 'Just me' },
  { id: 'team', label: 'My team' },
]

// ── Home pinned widgets: Inbox, Tasks, and the Human Touch Layer (HITL) ──
// Each item carries full origin context for the detail modal:
//   origin: 'contact' | 'agent' | 'workflow' | 'system' | 'escalation'
//   actor:  { name, email?, role?, system? }  (system actors have no inbox/email)
//   at:     absolute generation timestamp; `when` is the relative label for the row
//   body:   full message text shown in the detail modal
//   related:{ widgetId?, dashboardId?, label } drives the in-modal preview / Open action
//   meta:   origin-specific fields (connector, confidence, runId, step, trigger…)
// status: 'error' rows are failed syncs the user can Retry (error-recovery edge case).
export const HOME_INBOX = [
  {
    id: 'm-sync', origin: 'system', subject: 'Sync failed — credentials expired', when: '3m ago',
    at: 'Jun 16, 2026 · 9:51 AM', unread: true, status: 'error',
    actor: { name: 'Salesforce sync', system: true },
    body: 'The scheduled Salesforce sync could not authenticate — the OAuth token expired and needs to be refreshed. 3 widgets sourced from Salesforce are showing stale data until this is resolved.',
    meta: { category: 'Integration', source: 'Salesforce', lastOk: 'Jun 15, 2026 · 11:00 PM' },
    related: { widgetId: 'w-pipeline', dashboardId: 'd-sales-acct', label: 'Sales — Account 360' },
  },
  {
    id: 'm1', origin: 'contact', subject: 'Flagged “NPS Trend” — looks frozen', when: '12m ago',
    at: 'Jun 16, 2026 · 9:42 AM', unread: true,
    actor: { name: 'Dana Lee', email: 'dana.lee@contoso.com', role: 'Support Lead' },
    body: 'Hey — the NPS Trend widget hasn’t moved in two weeks on the CS Health board. Can you check if the Survey Data View is still syncing? Customers are asking why the score looks flat.',
    related: { widgetId: 'w-nps', dashboardId: 'd-cs-health', label: 'CS Health' },
    action: { kind: 'repin', label: 'Remap widget' },
  },
  {
    id: 'm2', origin: 'contact', subject: 'Shared “Employee Performance” with you', when: '1h ago',
    at: 'Jun 16, 2026 · 8:50 AM', unread: true,
    actor: { name: 'María González', email: 'maria.gonzalez@contoso.com', role: 'People Analytics' },
    body: 'I gave you Editor access to the Employee Performance dashboard so you can add the attrition widget we discussed. Let me know if the headcount numbers look right.',
    related: { dashboardId: 'd-employee-perf', label: 'Employee Performance' },
  },
  {
    id: 'm3', origin: 'system', subject: '3 dashboards you follow were updated', when: '3h ago',
    at: 'Jun 16, 2026 · 6:40 AM', unread: true,
    actor: { name: 'RevOps', system: true },
    body: 'Revenue Exec Report, Marketing Performance, and Finance Close were updated in the last 24 hours. Widgets were added or remapped.',
    meta: { category: 'Activity' },
    related: { dashboardId: 'd-rev-exec', label: 'Revenue Exec Report' },
  },
  {
    id: 'm4', origin: 'contact', subject: 'Can you grant access to Finance Close?', when: '4h ago',
    at: 'Jun 16, 2026 · 5:30 AM', unread: true,
    actor: { name: 'James Okonkwo', email: 'james.okonkwo@contoso.com', role: 'Support Director' },
    body: 'Could you add me as a viewer on Finance Close? I need the AP aging numbers for the board deck on Thursday.',
    related: { dashboardId: 'd-finance', label: 'Finance Close' },
    action: { kind: 'share', label: 'Grant access' },
  },
  {
    id: 'm5', origin: 'system', subject: 'Sync completed — 64,000 customers refreshed', when: '5h ago',
    at: 'Jun 16, 2026 · 4:15 AM', unread: false,
    actor: { name: 'Stripe sync', system: true },
    body: 'Nightly Stripe sync finished successfully. 64,000 customer records and 12 metrics refreshed. MRR Trend and Churn Rate are up to date.',
    meta: { category: 'Integration', source: 'Stripe' },
    related: { widgetId: 'w-mrr', label: 'MRR Trend' },
  },
  {
    id: 'm6', origin: 'contact', subject: 'Re: Q3 pipeline forecast', when: '1d ago',
    at: 'Jun 15, 2026 · 3:20 PM', unread: false,
    actor: { name: 'Priya Nair', email: 'priya.nair@contoso.com', role: 'VP Sales' },
    body: 'Thanks for the forecast — the pipeline-by-stage view is exactly what I needed. Can we add win rate by segment before the QBR?',
    related: { widgetId: 'w-pipeline', dashboardId: 'd-sales-acct', label: 'Pipeline by Stage' },
  },
  {
    id: 'm7', origin: 'system', subject: 'Weekly digest — 12 dashboards, 3 need attention', when: '1d ago',
    at: 'Jun 15, 2026 · 8:00 AM', unread: false,
    actor: { name: 'Workspace', system: true },
    body: 'This week: 12 active dashboards, 480 widget views, 3 dashboards need attention (stale data or offboarded owners).',
    meta: { category: 'Digest' },
  },
  {
    id: 'm8', origin: 'contact', subject: 'Comment on “Marketing Performance”', when: '2d ago',
    at: 'Jun 14, 2026 · 2:10 PM', unread: false,
    actor: { name: 'Elena Petrova', email: 'elena.petrova@contoso.com', role: 'Marketing Lead' },
    body: 'Left a comment on the ROAS widget — the attribution window looks off for the paid social channel. Can you confirm the source?',
    related: { dashboardId: 'd-marketing', label: 'Marketing Performance' },
  },
  {
    id: 'm9', origin: 'system', subject: 'New sign-in from a new device approved', when: '2d ago',
    at: 'Jun 14, 2026 · 9:05 AM', unread: false,
    actor: { name: 'Security', system: true },
    body: 'A new sign-in to your account from Chrome on macOS was approved via SSO. If this wasn’t you, review your active sessions.',
    meta: { category: 'Security' },
  },
  {
    id: 'm10', origin: 'contact', subject: 'Re: Deal Room access for Globex', when: '3d ago',
    at: 'Jun 13, 2026 · 4:45 PM', unread: false,
    actor: { name: 'Liam Murphy', email: 'liam.murphy@contoso.com', role: 'Account Exec' },
    body: 'Got it, thanks for setting up the Globex deal room. The churn-risk flag is helpful — keeping an eye on it.',
    related: { dashboardId: 'd-deal-room', label: 'Deal Room' },
  },
  {
    id: 'm11', origin: 'workflow', subject: 'Nightly ETL finished — 0 errors', when: '3d ago',
    at: 'Jun 13, 2026 · 2:00 AM', unread: false,
    actor: { name: 'Nightly ETL', system: true },
    body: 'The nightly ETL pipeline completed in 14 minutes with 0 errors. 28 widgets refreshed across 14 dashboards.',
    meta: { runId: 'etl-20260613-0200', step: 'Completed', trigger: 'Schedule · 2:00 AM daily' },
  },
]

// due: 'Overdue' | 'Today' | 'Tomorrow' | 'This week' (grouped into Overdue/Today/Upcoming).
// Same origin/actor/at/body/related/meta context as inbox items (used by the detail modal).
// status: 'error' is an automated step that failed and offers a Retry (error-recovery edge case).
export const HOME_TASKS = [
  {
    id: 't-err', origin: 'workflow', title: 'Auto-reassign “CS Health” to you', due: 'Overdue', priority: 'high',
    status: 'error', errorMsg: 'Reassignment failed — previous owner still offboarded', at: 'Jun 16, 2026 · 8:00 AM',
    actor: { name: 'Governance Workflow', system: true },
    body: 'The governance workflow tried to auto-reassign the CS Health dashboard because its owner (Aisha Khan) was offboarded, but the reassignment step failed. Retry to take ownership.',
    meta: { runId: 'gov-reassign-4471', step: 'Reassign owner', trigger: 'Owner offboarded' },
    related: { dashboardId: 'd-cs-health', label: 'CS Health' },
    action: { kind: 'reassign', label: 'Reassign to me' },
  },
  {
    id: 't1', origin: 'workflow', title: 'Approve “Marketing Performance” for publish', due: 'Today', priority: 'high',
    at: 'Jun 16, 2026 · 7:30 AM',
    actor: { name: 'Publish Workflow', system: true },
    body: 'Elena Petrova requested publishing the Marketing Performance dashboard. It’s in Pending review and needs your approval to go live to the Sales Reports collection.',
    meta: { step: 'Awaiting approval', trigger: 'Publish request', requestedBy: 'Elena Petrova' },
    related: { dashboardId: 'd-marketing', label: 'Marketing Performance' },
    action: { kind: 'publish', label: 'Review & publish' },
  },
  {
    id: 't2', origin: 'contact', title: 'Respond to Dana Lee’s data flag on NPS', due: 'Today', priority: 'med',
    at: 'Jun 16, 2026 · 9:42 AM',
    actor: { name: 'Dana Lee', email: 'dana.lee@contoso.com', role: 'Support Lead' },
    body: 'Dana flagged the NPS Trend widget as frozen. Respond with whether the Survey Data View is syncing, or remap the widget if the schema changed.',
    related: { widgetId: 'w-nps', dashboardId: 'd-cs-health', label: 'NPS Trend' },
    action: { kind: 'repin', label: 'Remap widget' },
  },
  {
    id: 't3', origin: 'contact', title: 'Review widget access request from James', due: 'Today', priority: 'med',
    at: 'Jun 16, 2026 · 5:30 AM',
    actor: { name: 'James Okonkwo', email: 'james.okonkwo@contoso.com', role: 'Support Director' },
    body: 'James requested viewer access to Finance Close. Review and grant or decline.',
    related: { dashboardId: 'd-finance', label: 'Finance Close' },
    action: { kind: 'share', label: 'Review access request' },
  },
  {
    id: 't4', origin: 'agent', title: 'Review Q3 pipeline forecast', due: 'Tomorrow', priority: 'med',
    at: 'Jun 15, 2026 · 6:00 PM',
    actor: { name: 'Forecast Copilot', system: true },
    body: 'The forecast agent generated a Q3 pipeline projection with 0.78 confidence. Review the assumptions before sharing with the VP.',
    meta: { confidence: '0.78', model: 'forecast-v2', trigger: 'Weekly forecast' },
    related: { widgetId: 'w-pipeline', dashboardId: 'd-sales-acct', label: 'Pipeline by Stage' },
  },
  {
    id: 't5', origin: 'system', title: 'Add widgets to “New Hire Onboarding”', due: 'This week', priority: 'low',
    at: 'Jun 14, 2026 · 10:00 AM',
    actor: { name: 'You', system: false },
    body: 'Self-assigned: the New Hire Onboarding dashboard only has 5 widgets. Add headcount and time-to-hire widgets before the next cohort.',
    related: { dashboardId: 'd-onboarding', label: 'New Hire Onboarding' },
  },
  {
    id: 't6', origin: 'agent', title: 'Audit deactivated owners across 14 dashboards', due: 'This week', priority: 'low',
    at: 'Jun 14, 2026 · 9:00 AM',
    actor: { name: 'Governance Copilot', system: true },
    body: 'The governance agent detected 2 dashboards owned by offboarded users across 14 dashboards. Audit and reassign as needed.',
    meta: { confidence: '0.95', model: 'governance-v1' },
    related: { dashboardId: 'd-cs-health', label: 'CS Health' },
  },
]

// HITL queue — agents, workflows, or escalations waiting on a human decision.
// source: 'Agent' | 'Workflow' | 'System' | 'Escalation'; action label is the primary CTA.
export const HTL_ITEMS = [
  { id: 'h1', source: 'Agent', title: 'Sales Copilot — send renewal email to Acme Corp?', detail: 'Drafted a follow-up. Awaiting your approval before it sends.', action: 'Approve', priority: 'high', when: '8m ago' },
  { id: 'h2', source: 'Workflow', title: 'Invoice approval — $84,200 over threshold', detail: 'NetSuite workflow paused for sign-off above $50k.', action: 'Review', priority: 'high', when: '22m ago' },
  { id: 'h3', source: 'Escalation', title: 'Support ticket #4821 needs a human', detail: 'AI couldn’t resolve; customer escalated to a person.', action: 'Take', priority: 'high', when: '40m ago' },
  { id: 'h4', source: 'System', title: 'Schema drift — “NPS Trend” needs remap', detail: 'Survey Data View changed; 2 fields were removed.', action: 'Review', priority: 'med', when: '1h ago', flow: 'repin', widgetId: 'w-nps' },
  { id: 'h5', source: 'Agent', title: 'Churn-risk agent flagged Globex Inc.', detail: 'Confidence 0.82 — recommends an outreach play.', action: 'Assign', priority: 'med', when: '2h ago' },
  { id: 'h6', source: 'Workflow', title: 'New-hire access — María González', detail: 'Approve dashboard access for onboarding.', action: 'Approve', priority: 'low', when: '1d ago' },
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
// A dashboard is either ENTITY (attached to a profile) or GLOBAL (report / home /
// workspace). Derived from the placement surface — the single source for the distinction.
export function dashboardKind(dashboard) {
  return dashboard?.placement?.surface === 'profile' ? 'entity' : 'global'
}
export function dashboardKindLabel(dashboard) {
  const p = dashboard?.placement
  if (p?.surface === 'profile') return `Profile · ${PROFILE_TYPES.find((t) => t.id === p.profileType)?.id || 'Profile'}`
  if (p?.surface === 'report') return 'Standalone · Report'
  if (p?.surface === 'home') return 'Standalone · Home'
  return 'Standalone'
}

export const dashboardTemplates = [
  { id: 't-acct360', name: 'Account 360', desc: 'KPIs, pipeline, and recent activity.', entity: 'Company' },
  { id: 't-support', name: 'Support Health', desc: 'Open tickets, SLA, and CSAT.', entity: 'Company' },
  { id: 't-exec', name: 'Exec Overview', desc: 'High-level rollups for leadership.', entity: 'Report' },
]

// Pre-built widget layout per template (zone -> widget ids). Used to seed a
// dashboard canvas created "from an AIMS template".
export const TEMPLATE_SEED = {
  't-acct360': [
    { zone: 'header', widgetId: 'w-revenue' },
    { zone: 'header', widgetId: 'w-arr' },
    { zone: 'main', widgetId: 'w-pipeline' },
    { zone: 'main', widgetId: 'w-winrate' },
    { zone: 'sidebar', widgetId: 'w-tickets' },
    { zone: 'bottom', widgetId: 'w-topaccounts' },
  ],
  't-support': [
    { zone: 'header', widgetId: 'w-sla' },
    { zone: 'header', widgetId: 'w-csat' },
    { zone: 'main', widgetId: 'w-ticketvol' },
    { zone: 'sidebar', widgetId: 'w-tickets' },
    { zone: 'bottom', widgetId: 'w-firstresp' },
  ],
  't-exec': [
    { zone: 'header', widgetId: 'w-revenue' },
    { zone: 'header', widgetId: 'w-mrr' },
    { zone: 'main', widgetId: 'w-pipeline' },
    { zone: 'main', widgetId: 'w-margin' },
    { zone: 'sidebar', widgetId: 'w-churn' },
    { zone: 'bottom', widgetId: 'w-execsummary' },
  ],
  // AIMS Operations — showcases the Phase 5 guardrails (Truth/Sandbox, credits, Bridge ID, stale-pause).
  't-aims-ops': [
    { zone: 'header', widgetId: 'w-aims-hitl' },
    { zone: 'header', widgetId: 'w-aims-credits' },
    { zone: 'main', widgetId: 'w-aims-runs' },
    { zone: 'main', widgetId: 'w-aims-outcomes' },
    { zone: 'main', widgetId: 'w-aims-roi' },
    { zone: 'sidebar', widgetId: 'w-aims-candidatefacts' },
    { zone: 'bottom', widgetId: 'w-aims-leadfeed' },
  ],
}

// Widget Marketplace — browseable pre-built widgets. `id` is the templateId
// used for install dedup; on install a real catalog widget is derived from these.
export const MARKETPLACE_CATEGORIES = ['Operational', 'Engagement', 'Intelligence']
export const MARKETPLACE_WIDGETS = [
  { id: 'mw-arr', name: 'ARR Snapshot', category: 'Intelligence', maker: 'AIMS', skeleton: 'KPI', governed: true, source: 'Finance Data View', freshness: 'live', description: 'Annual recurring revenue with month-over-month delta, sourced from the governed Finance view.', bestFor: 'Executive reporting and tracking growth at a glance', stats: { installs: 1240, fields: 3 }, featured: true },
  { id: 'mw-pipeline-velocity', name: 'Pipeline Velocity', category: 'Operational', maker: 'AIMS', skeleton: 'Chart', governed: true, source: 'CRM Data View', freshness: 'fresh', description: 'Deal flow speed across stages so reps see where momentum stalls.', bestFor: 'Spotting stalled deals and managing day-to-day sales operations', stats: { installs: 980, fields: 5 } },
  { id: 'mw-win-rate', name: 'Win Rate by Rep', category: 'Intelligence', maker: 'AIMS', skeleton: 'Table', governed: true, source: 'CRM Data View', freshness: 'fresh', description: 'Closed-won vs closed-lost ratios broken down by sales rep.', bestFor: 'Coaching reps and analyzing team performance', stats: { installs: 760, fields: 6 } },
  { id: 'mw-sla-breach', name: 'SLA Breach Risk', category: 'Operational', maker: 'AIMS', skeleton: 'Gauge', governed: true, source: 'Support Data View', freshness: 'live', description: 'Live gauge of tickets approaching their SLA threshold.', bestFor: 'Real-time monitoring and preventing SLA misses', stats: { installs: 540, fields: 2 } },
  { id: 'mw-ticket-queue', name: 'Recent Activity', category: 'Operational', maker: 'Community', skeleton: 'List', governed: false, source: 'Computed in Widget Builder', freshness: 'aging', description: 'View recent calls, emails, and interactions.', bestFor: 'Tracking recent interactions and events, monitoring team activity in real-time', stats: { installs: 310, fields: 6 } },
  { id: 'mw-csat-trend', name: 'CSAT Trend', category: 'Engagement', maker: 'AIMS', skeleton: 'Chart', governed: true, source: 'Survey Data View', freshness: 'fresh', description: 'Customer satisfaction trend with a rolling 30-day average.', bestFor: 'Tracking customer sentiment over time', stats: { installs: 690, fields: 4 } },
  { id: 'mw-nps-map', name: 'NPS by Region', category: 'Engagement', maker: 'Community', skeleton: 'Map', governed: false, source: 'Survey Data View', freshness: 'stale', description: 'Geographic distribution of net promoter score across regions.', bestFor: 'Comparing loyalty across markets and regions', stats: { installs: 180, fields: 3 } },
  { id: 'mw-feature-adoption', name: 'Feature Adoption', category: 'Engagement', maker: 'AIMS', skeleton: 'Chart', governed: true, source: 'Product Data View', freshness: 'fresh', description: 'Adoption curve per feature so PMs spot what is landing.', bestFor: 'Understanding which features drive engagement', stats: { installs: 820, fields: 5 } },
  { id: 'mw-activation', name: 'Activation Funnel', category: 'Engagement', maker: 'AIMS', skeleton: 'Timeline', governed: true, source: 'Product Data View', freshness: 'live', description: 'Step-by-step activation funnel from signup to first value.', bestFor: 'Finding where new users drop off during onboarding', stats: { installs: 450, fields: 4 } },
  { id: 'mw-burn', name: 'Cash Burn', category: 'Intelligence', maker: 'Community', skeleton: 'KPI', governed: false, source: 'Computed in Widget Builder', freshness: 'aging', description: 'Monthly net burn with a runway estimate.', bestFor: 'Monitoring runway and financial health', stats: { installs: 220, fields: 3 }, featured: true },
  { id: 'mw-ai-exec', name: 'AI Exec Brief', category: 'Finance', maker: 'AIMS', skeleton: 'AI Summary', governed: true, source: 'Finance Data View', freshness: 'live', description: 'Pre-computed narrative summary of the quarter for leadership.', stats: { installs: 410, fields: 2 } },
]

// Widget Playground — expanded widget types (visual gallery)
export const WIDGET_TYPES = [
  { id: 'kpi', label: 'KPI', category: 'Metric', iconName: 'Hash' },
  { id: 'statrow', label: 'Stat Row', category: 'Metric', iconName: 'Rows3' },
  { id: 'gauge', label: 'Gauge', category: 'Metric', iconName: 'Gauge' },
  { id: 'line', label: 'Line Chart', category: 'Trend', iconName: 'LineChart' },
  { id: 'bar', label: 'Bar Chart', category: 'Breakdown', iconName: 'BarChart3' },
  { id: 'pie', label: 'Donut', category: 'Breakdown', iconName: 'PieChart' },
  { id: 'funnel', label: 'Funnel', category: 'Breakdown', iconName: 'Filter' },
  { id: 'table', label: 'Table', category: 'Records', iconName: 'Table2' },
  { id: 'list', label: 'List', category: 'Records', iconName: 'List' },
  { id: 'carousel', label: 'Carousel', category: 'Records', iconName: 'GalleryHorizontalEnd' },
  { id: 'heatmap', label: 'Heat Map', category: 'Relationship', iconName: 'Grid3x3' },
  { id: 'scatter', label: 'Correlation', category: 'Relationship', iconName: 'ScatterChart' },
  { id: 'board', label: 'Board', category: 'Status', iconName: 'Columns3' },
  { id: 'feed', label: 'Feed', category: 'Activity', iconName: 'Rss' },
  { id: 'alerts', label: 'Alerts', category: 'Activity', iconName: 'Bell' },
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

// Sharing & access (S105–S108). status: 'active' | 'deactivated' (offboarded).
// Realistic roster for a ~140-person org; deactivated users drive the recovery flow.
export const SHARE_PEOPLE = [
  { id: 'u-1', name: 'Dana Lee', sub: 'Support Agent · Support', team: 'Support', initials: 'DL', status: 'active' },
  { id: 'u-2', name: 'Sam Ortiz', sub: 'Sales Agent · Sales', team: 'Sales', initials: 'SO', status: 'active' },
  { id: 'u-3', name: 'Priya Nair', sub: 'Manager · Sales', team: 'Sales', initials: 'PN', status: 'active' },
  { id: 'u-4', name: 'Marco Diaz', sub: 'Sales Agent · Sales', team: 'Sales', initials: 'MD', status: 'active' },
  { id: 'u-5', name: 'Elena Petrova', sub: 'Sales Agent · Sales', team: 'Sales', initials: 'EP', status: 'active' },
  { id: 'u-6', name: 'James Okonkwo', sub: 'Support Agent · Support', team: 'Support', initials: 'JO', status: 'active' },
  { id: 'u-7', name: 'Yuki Tanaka', sub: 'CS Manager · Customer Success', team: 'Customer Success', initials: 'YT', status: 'active' },
  { id: 'u-8', name: 'Liam Murphy', sub: 'Account Exec · Sales', team: 'Sales', initials: 'LM', status: 'active' },
  // Offboarded / deactivated — must be recovered before re-granting access.
  { id: 'u-9', name: 'Robert Chen', sub: 'Former Sales Lead · deactivated 12 days ago', team: 'Sales', initials: 'RC', status: 'deactivated' },
  { id: 'u-10', name: 'Aisha Khan', sub: 'Former Support Agent · deactivated 3 days ago', team: 'Support', initials: 'AK', status: 'deactivated' },
]
export const SHARE_DEPARTMENTS = [
  { id: 'dep-sales', name: 'Sales', sub: '42 people' },
  { id: 'dep-support', name: 'Support', sub: '18 people' },
  { id: 'dep-cs', name: 'Customer Success', sub: '27 people' },
  { id: 'dep-ops', name: 'Revenue Operations', sub: '9 people' },
  { id: 'dep-exec', name: 'Leadership', sub: '6 people' },
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
// source schema and which of the widget's bindings need remapping.
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

