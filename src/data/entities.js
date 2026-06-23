// Model entities — the semantic layer objects that widgets bind to.
// Each entity represents a domain concept (Customers, Deals, Tickets…) that
// the Data Studio has resolved from one or more raw connectors. Widgets query
// entities, not connectors — the ETL lives in Data Studio.
//
// Shape is intentionally compatible with EXTERNAL_SOURCES so MetricPicker,
// DimensionPicker, WidgetPreview, and slot binding work without changes.

export const ENTITY_CATEGORIES = ['Customer Data', 'Revenue', 'Support', 'Team', 'AIMS Platform']

function E(o) {
  const metrics = o.metrics || []
  const recordSets = (o.recordSets || []).map((r) => ({
    recommendedType: 'table',
    kind: 'records',
    ...r,
  }))
  return {
    governed: true,
    hasPII: false,
    connected: true,
    ...o,
    metrics,
    recordSets,
  }
}

export const MODEL_ENTITIES = [
  // ── Customer Data ──
  E({
    id: 'ent-customers',
    name: 'Customers',
    label: 'Company / Account',
    category: 'Customer Data',
    iconName: 'Building2',
    color: '#155DFC',
    description: 'Company and account records unified from your CRM and billing systems.',
    poweredBy: ['HubSpot', 'Salesforce', 'QuickBooks'],
    recordCount: 3842,
    metrics: [
      { id: 'cust-total', name: 'Total Customers', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'cust-arr', name: 'ARR', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'cust-mrr', name: 'MRR', kind: 'timeseries', recommendedType: 'line' },
      { id: 'cust-churn', name: 'Churn Rate', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'cust-health', name: 'Avg Health Score', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'cust-by-tier', name: 'Customers by Tier', kind: 'breakdown', recommendedType: 'pie' },
      { id: 'cust-by-region', name: 'Customers by Region', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'cust-new', name: 'New Customers', kind: 'timeseries', recommendedType: 'line' },
    ],
    recordSets: [
      { id: 'cust-rs-all', name: 'All Customers', entityType: 'Customer', count: 3842, recommendedType: 'table' },
      { id: 'cust-rs-profile', name: 'Customer Profile', entityType: 'Customer', count: 1, recommendedType: 'record-card' },
    ],
  }),
  E({
    id: 'ent-contacts',
    name: 'Contacts',
    label: 'Unified Customer Profile',
    category: 'Customer Data',
    iconName: 'UserRound',
    color: '#7C3AED',
    hasPII: true,
    description: 'Individual contacts — the UCP entity linking email, calls, deals, and support history.',
    poweredBy: ['HubSpot', 'Salesforce', 'Zendesk'],
    recordCount: 18420,
    metrics: [
      { id: 'cnt-total', name: 'Total Contacts', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'cnt-active', name: 'Active Contacts', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'cnt-by-status', name: 'Contacts by Status', kind: 'breakdown', recommendedType: 'pie' },
      { id: 'cnt-new', name: 'New Contacts', kind: 'timeseries', recommendedType: 'line' },
      { id: 'cnt-engagement', name: 'Avg Engagement Score', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [
      { id: 'cnt-rs-all', name: 'All Contacts', entityType: 'Contact', count: 18420, recommendedType: 'table', hasPII: true },
      { id: 'cnt-rs-recent', name: 'Recently Active', entityType: 'Contact', count: 420, recommendedType: 'list', hasPII: true },
      { id: 'cnt-rs-profile', name: 'Contact Profile', entityType: 'Contact', count: 1, recommendedType: 'record-card', hasPII: true },
    ],
  }),

  // ── Revenue ──
  E({
    id: 'ent-deals',
    name: 'Deals',
    label: 'Pipeline / Opportunities',
    category: 'Revenue',
    iconName: 'TrendingUp',
    color: '#059669',
    description: 'Sales pipeline — deals across all stages from prospecting to closed won.',
    poweredBy: ['HubSpot', 'Salesforce'],
    recordCount: 1247,
    metrics: [
      { id: 'deal-pipeline', name: 'Pipeline Value', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'deal-by-stage', name: 'Deals by Stage', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'deal-win-rate', name: 'Win Rate', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'deal-avg-size', name: 'Avg Deal Size', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'deal-velocity', name: 'Pipeline Velocity', kind: 'timeseries', recommendedType: 'line' },
      { id: 'deal-cycle', name: 'Avg Sales Cycle', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [
      { id: 'deal-rs-open', name: 'Open Deals', entityType: 'Deal', count: 847, recommendedType: 'table' },
      { id: 'deal-rs-closing', name: 'Closing This Month', entityType: 'Deal', count: 63, recommendedType: 'list' },
    ],
  }),

  // ── Support ──
  E({
    id: 'ent-tickets',
    name: 'Tickets',
    label: 'Support Cases',
    category: 'Support',
    iconName: 'LifeBuoy',
    color: '#DC2626',
    description: 'Support tickets and cases — open, in-progress, and resolved across all channels.',
    poweredBy: ['Zendesk', 'Intercom'],
    recordCount: 9234,
    metrics: [
      { id: 'tkt-open', name: 'Open Tickets', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'tkt-sla', name: 'SLA Compliance', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'tkt-csat', name: 'CSAT Score', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'tkt-resolution', name: 'Resolution Rate', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'tkt-by-priority', name: 'Tickets by Priority', kind: 'breakdown', recommendedType: 'pie' },
      { id: 'tkt-volume', name: 'Ticket Volume', kind: 'timeseries', recommendedType: 'line' },
    ],
    recordSets: [
      { id: 'tkt-rs-open', name: 'Open Tickets', entityType: 'Ticket', count: 312, recommendedType: 'table' },
      { id: 'tkt-rs-urgent', name: 'Urgent / Overdue', entityType: 'Ticket', count: 28, recommendedType: 'list' },
    ],
  }),

  // ── Team ──
  E({
    id: 'ent-employees',
    name: 'Employees',
    label: 'Unified Employee Profile',
    category: 'Team',
    iconName: 'Users',
    color: '#D97706',
    hasPII: true,
    description: 'Team members — roles, performance, and HR data unified from your people systems.',
    poweredBy: ['Workday', 'BambooHR'],
    recordCount: 87,
    metrics: [
      { id: 'emp-total', name: 'Total Employees', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'emp-by-dept', name: 'Employees by Dept', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'emp-retention', name: 'Retention Rate', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'emp-nps', name: 'eNPS', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [
      { id: 'emp-rs-all', name: 'All Employees', entityType: 'Employee', count: 87, recommendedType: 'table', hasPII: true },
      { id: 'emp-rs-profile', name: 'Employee Profile', entityType: 'Employee', count: 1, recommendedType: 'record-card', hasPII: true },
    ],
  }),

  // ── AIMS Platform ──
  E({
    id: 'ent-workflows',
    name: 'Agentic Workflows',
    label: 'AIMS OS',
    category: 'AIMS Platform',
    iconName: 'Workflow',
    color: '#155DFC',
    description: 'Workflow runs, automation performance, and Human-in-the-Loop events from Agentic Studio.',
    poweredBy: ['AIMS OS'],
    recordCount: 48,
    metrics: [
      { id: 'wf-runs', name: 'Workflow Runs', kind: 'timeseries', recommendedType: 'line' },
      { id: 'wf-hitl', name: 'Human-in-the-Loops', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'wf-resolution', name: 'Auto-Resolution Rate', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'wf-by-type', name: 'Runs by Workflow Type', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'wf-escalation', name: 'Escalation Rate', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [
      { id: 'wf-rs-active', name: 'Active Workflows', entityType: 'Workflow', count: 48, recommendedType: 'list' },
    ],
  }),
  E({
    id: 'ent-conversations',
    name: 'Conversations',
    label: 'AIMS OS',
    category: 'AIMS Platform',
    iconName: 'MessageSquare',
    color: '#06B6D4',
    hasPII: true,
    description: 'AI and human conversations — response times, handoffs, HITL events, and channel mix.',
    poweredBy: ['AIMS OS'],
    recordCount: 86400,
    metrics: [
      { id: 'conv-count', name: 'Conversations', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'conv-active', name: 'Active Conversations', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'conv-frt', name: 'Avg Response Time', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'conv-hitl', name: 'HITL Events', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'conv-volume', name: 'Volume Over Time', kind: 'timeseries', recommendedType: 'line' },
    ],
    recordSets: [
      { id: 'conv-rs-recent', name: 'Recent Conversations', entityType: 'Conversation', count: 86400, recommendedType: 'list', hasPII: true },
    ],
  }),
]

export function entityById(id) {
  return MODEL_ENTITIES.find((e) => e.id === id) || null
}

// Pre-defined field lists for each entity — used by appearance panels (card/table config).
export const ENTITY_FIELDS = {
  'ent-customers': ['Company Name', 'ARR', 'Health Score', 'Tier', 'Region', 'Owner', 'Contract Renewal', 'Last Activity'],
  'ent-contacts': ['Full Name', 'Email', 'Job Title', 'Company', 'Phone', 'Stage', 'Engagement Score', 'Last Activity'],
  'ent-deals': ['Deal Name', 'Value', 'Stage', 'Owner', 'Close Date', 'Probability', 'Source', 'Product'],
  'ent-tickets': ['Ticket ID', 'Subject', 'Priority', 'Status', 'Assignee', 'Created', 'Channel', 'CSAT'],
  'ent-employees': ['Full Name', 'Email', 'Department', 'Role', 'Manager', 'Tenure', 'Performance', 'Location'],
  'ent-workflows': ['Workflow Name', 'Type', 'Status', 'Runs (MTD)', 'Last Run', 'Auto-Resolution Rate', 'HITL Count'],
  'ent-conversations': ['Conversation ID', 'Channel', 'Status', 'Agent', 'Start Time', 'Duration', 'Outcome', 'CSAT'],
}
