// External data sources for the Widget Playground + Data Sources Marketplace.
// Mirrors the AIMS-OS "Integrations" model: each connector has a provider
// (official/partner/private), a connection status, capabilities, and exposes
// both aggregate `metrics` and row-level `recordSets` (Contacts/Accounts/…).
//
// Kept in its own module (not mock.js) so the ~40-source catalog stays readable.

export const SOURCE_CATEGORIES = [
  'AIMS OS',
  'CRM',
  'Marketing',
  'Support',
  'Finance',
  'People',
  'Data Warehouse',
  'Storage',
  'Communication',
  'Productivity',
  'Automotive',
  'Custom',
]

// Connection statuses → drive the ConnectionBadge. `connected` sources surface
// inline in the builder; everything else lives in the marketplace catalog.
// status: 'connected' | 'syncing' | 'error' | 'available'

// Builds a source with sensible defaults and derives capability chips so each
// entry below stays a one-liner-ish literal instead of repeating boilerplate.
// NOTE: derivations below read the RAW input `o` (before the `...o` spread /
// defaults), so guard for undefined fields explicitly.
function S(o) {
  const metrics = o.metrics || []
  const recordSets = (o.recordSets || []).map((r) => ({
    recommendedType: 'table',
    kind: 'records',
    ...r,
  }))
  return {
    provider: 'official',
    status: 'available',
    governed: true,
    hasPII: false,
    featured: false,
    realtime: false,
    owner: '—',
    reviewed: null,
    description: '',
    ...o,
    connected: o.status != null && o.status !== 'available',
    metrics,
    recordSets,
    capabilities: [
      ...(metrics.length ? ['metrics'] : []),
      ...(recordSets.length ? ['records'] : []),
      ...(o.realtime ? ['realtime'] : []),
    ],
  }
}

export const EXTERNAL_SOURCES = [
  // ── AIMS OS (our own platform — the V1 differentiator) ──
  // What you've done WITH your data: agentic workflows, conversations, and
  // human-in-the-loops. Powered from the Agentic Studio + Data Studio.
  S({
    id: 'src-aims-agentic', name: 'AIMS OS — Agentic Studio', category: 'AIMS OS', logoColor: '#155DFC', initials: 'AI',
    status: 'connected', featured: true, realtime: true, governed: true, owner: 'AIMS OS', reviewed: 'Jun 2026',
    description: 'Your own platform activity — agentic workflow performance, conversations, messages, and human-in-the-loops.',
    metrics: [
      { id: 'aims-runs', name: 'Workflow Runs', kind: 'timeseries', recommendedType: 'line' },
      { id: 'aims-conversations', name: 'Conversations Handled', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'aims-messages', name: 'Messages Sent', kind: 'timeseries', recommendedType: 'line' },
      { id: 'aims-hitl', name: 'Human-in-the-Loops', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'aims-escalation', name: 'Escalation Rate', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'aims-resolution', name: 'Auto-Resolution Rate', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'aims-actions', name: 'Actions by Type', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'aims-outreach', name: 'Outreach Attempts', kind: 'timeseries', recommendedType: 'line' },
      { id: 'aims-pushed', name: 'Tickets Pushed to CRM', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [
      { id: 'aims-rs-workflows', name: 'Agentic Workflows', entityType: 'Workflow', count: 48, recommendedType: 'list' },
      { id: 'aims-rs-hitl', name: 'Human-in-the-Loop Queue', entityType: 'Case', count: 1240, recommendedType: 'list' },
      { id: 'aims-rs-conversations', name: 'Conversations', entityType: 'Conversation', count: 86400, recommendedType: 'list' },
    ],
  }),
  S({
    id: 'src-aims-platform', name: 'AIMS OS — Platform', category: 'AIMS OS', logoColor: '#00C2C2', initials: 'OS',
    status: 'connected', featured: true, governed: true, owner: 'AIMS OS', reviewed: 'Jun 2026',
    description: 'Cross-platform usage and activity across the AIMS OS workspace.',
    metrics: [
      { id: 'aimsp-active', name: 'Active Agents', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'aimsp-usage', name: 'Platform Usage Over Time', kind: 'timeseries', recommendedType: 'line' },
      { id: 'aimsp-hitl-team', name: 'Human-in-the-Loops by Team', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'aimsp-handle', name: 'Avg Handle Time', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'aimsp-interactions', name: 'Customer Interactions', kind: 'timeseries', recommendedType: 'line' },
      { id: 'aimsp-region', name: 'Activity by Region', kind: 'geo', recommendedType: 'map' },
    ],
    recordSets: [
      { id: 'aimsp-rs-runs', name: 'Agent Runs', entityType: 'Event', count: 312000 },
      { id: 'aimsp-rs-feedback', name: 'Feedback & Flags', entityType: 'Case', count: 980, recommendedType: 'list' },
    ],
  }),

  S({
    id: 'src-aims-governance', name: 'AIMS OS — Governance', category: 'AIMS OS', logoColor: '#7C3AED', initials: 'GV',
    status: 'connected', governed: true, owner: 'AIMS OS', reviewed: 'Jun 2026',
    description: 'Council & action-gate decisions — what was allowed, blocked, degraded, or escalated.',
    metrics: [
      { id: 'gov-decisions', name: 'Action Gate Decisions', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'gov-outcomes', name: 'Council Outcomes', kind: 'breakdown', recommendedType: 'pie' },
      { id: 'gov-block', name: 'Blocked Actions', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'gov-policy', name: 'Policy Violations Flagged', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'gov-grounding', name: 'Grounding-Fail Flags', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'gov-killswitch', name: 'Kill-Switch Events', kind: 'timeseries', recommendedType: 'line' },
    ],
    recordSets: [{ id: 'gov-rs-decisions', name: 'Gate Decisions', entityType: 'Case', count: 18200, recommendedType: 'list' }],
  }),
  S({
    id: 'src-aims-truth', name: 'AIMS OS — Truth Plane', category: 'AIMS OS', logoColor: '#0EA5E9', initials: 'TP',
    status: 'connected', governed: true, owner: 'AIMS OS', reviewed: 'Jun 2026',
    description: 'Governance Studio knowledge — active facts, truth writes, and freshness.',
    metrics: [
      { id: 'tp-active', name: 'Active Facts', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'tp-writes', name: 'Truth Writes (TP)', kind: 'timeseries', recommendedType: 'line' },
      { id: 'tp-ttl', name: 'Facts Approaching TTL', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'tp-attest', name: 'Attestation Events', kind: 'timeseries', recommendedType: 'line' },
      { id: 'tp-corrections', name: 'Train Me Corrections', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'tp-tier', name: 'Facts by Tier', kind: 'breakdown', recommendedType: 'bar' },
    ],
    recordSets: [
      { id: 'tp-rs-facts', name: 'Facts', entityType: 'Event', count: 42800 },
      { id: 'tp-rs-candidates', name: 'Candidate Facts', entityType: 'Case', count: 1340, recommendedType: 'list' },
    ],
  }),
  S({
    id: 'src-aims-htl', name: 'AIMS OS — Human Touch Layer', category: 'AIMS OS', logoColor: '#F59E0B', initials: 'HT',
    status: 'connected', realtime: true, governed: true, owner: 'AIMS OS', reviewed: 'Jun 2026',
    description: 'Telemetry the human-touch widget generates — sessions, AI-vs-human resolution, handoffs, queue, SLA, CSAT, and channel mix.',
    metrics: [
      { id: 'htl-sessions', name: 'HTL Sessions', kind: 'timeseries', recommendedType: 'line' },
      { id: 'htl-resolution', name: 'AI Resolved vs Handoff', kind: 'breakdown', recommendedType: 'pie' },
      { id: 'htl-handoff-reason', name: 'Handoffs by Reason', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'htl-csat', name: 'Post-Chat CSAT', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'htl-resrate', name: 'Resolution Rate', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'htl-channels', name: 'Channel Mix', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'htl-queue', name: 'Queue Depth', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'htl-sla', name: 'SLA Compliance Rate', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'htl-mttr', name: 'Mean Time to Resolution', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'htl-frt', name: 'Time to First Response', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'htl-tickets', name: 'Tickets Over Time', kind: 'timeseries', recommendedType: 'line' },
      { id: 'htl-breach', name: 'Breaches by Reason', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'htl-handoff', name: 'Handoffs by Destination', kind: 'breakdown', recommendedType: 'pie' },
    ],
    recordSets: [
      { id: 'htl-rs-queue', name: 'HITL Queue', entityType: 'Case', count: 1240, recommendedType: 'list' },
      { id: 'htl-rs-emp', name: 'Employees', entityType: 'Employee', count: 86 },
    ],
  }),
  S({
    id: 'src-aims-credits', name: 'AIMS OS — Credits & Billing', category: 'AIMS OS', logoColor: '#16A34A', initials: 'CR',
    status: 'connected', governed: true, owner: 'AIMS OS', reviewed: 'Jun 2026',
    description: 'Unified credit consumption + token and cost breakdowns — governed actions (GE) and truth writes (TP).',
    metrics: [
      { id: 'cr-consumed', name: 'Credits Consumed', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'cr-balance', name: 'Balance Remaining', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'cr-overtime', name: 'Credits Over Time', kind: 'timeseries', recommendedType: 'line' },
      { id: 'cr-tier', name: 'Burn by Action Tier', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'cr-getp', name: 'GE vs TP', kind: 'breakdown', recommendedType: 'pie' },
      { id: 'cr-projected', name: 'Projected Burn', kind: 'kpi', recommendedType: 'kpi' },
      // Token + cost views of the same consumption.
      { id: 'cr-tokens', name: 'Tokens Consumed', kind: 'kpi', recommendedType: 'costkpi' },
      { id: 'cr-usd', name: 'Cost (USD)', kind: 'kpi', recommendedType: 'costkpi' },
      { id: 'cr-tokens-over', name: 'Tokens Over Time', kind: 'timeseries', recommendedType: 'usageheatmap' },
      { id: 'cr-tokens-model', name: 'Tokens by Model', kind: 'breakdown', recommendedType: 'spendbreakdown' },
      { id: 'cr-cost-agent', name: 'Cost by Agent', kind: 'breakdown', recommendedType: 'spendbreakdown' },
    ],
    recordSets: [{ id: 'cr-rs-charges', name: 'Charge Records', entityType: 'Order', count: 124000 }],
  }),
  S({
    id: 'src-aims-conversations', name: 'AIMS OS — Conversations', category: 'AIMS OS', logoColor: '#06B6D4', initials: 'CV',
    status: 'connected', realtime: true, hasPII: true, governed: true, owner: 'AIMS OS', reviewed: 'Jun 2026',
    description: 'Conversations and messages across channels — agent vs human, response times, HITL events.',
    metrics: [
      { id: 'cv-count', name: 'Conversations', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'cv-active', name: 'Active Conversations', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'cv-msgs', name: 'Messages Over Time', kind: 'timeseries', recommendedType: 'line' },
      { id: 'cv-split', name: 'Agent vs Human Messages', kind: 'breakdown', recommendedType: 'pie' },
      { id: 'cv-frt', name: 'Avg Response Time', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'cv-hitl', name: 'HITL Events', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [{ id: 'cv-rs-conv', name: 'Conversations', entityType: 'Conversation', count: 86400, hasPII: true, recommendedType: 'list' }],
  }),
  S({
    id: 'src-aims-agents', name: 'AIMS OS — Agents (AMP)', category: 'AIMS OS', logoColor: '#A855F7', initials: 'AG',
    status: 'connected', governed: true, owner: 'AIMS OS', reviewed: 'Jun 2026',
    description: 'Agent Mesh Platform — registered agents, runs, escalations, and Next Best Action.',
    metrics: [
      { id: 'ag-active', name: 'Active Agents', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'ag-class', name: 'Agents by Class', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'ag-runs', name: 'Agent Runs', kind: 'timeseries', recommendedType: 'line' },
      { id: 'ag-escalations', name: 'Escalations to Council', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'ag-nba', name: 'NBA Actions Triggered', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'ag-top', name: 'Top Agents by Runs', kind: 'breakdown', recommendedType: 'list' },
    ],
    recordSets: [{ id: 'ag-rs-agents', name: 'Agents', entityType: 'Agent', count: 320, recommendedType: 'list' }],
  }),
  S({
    id: 'src-aims-helm', name: 'AIMS OS — Helm (ROI)', category: 'AIMS OS', logoColor: '#155DFC', initials: 'HM',
    status: 'connected', featured: true, governed: true, owner: 'AIMS OS', reviewed: 'Jun 2026',
    description: 'Value Ledger — Net AI Workforce ROI, attributed value, incidents avoided (Bridge ID-cited).',
    metrics: [
      { id: 'hm-roi', name: 'Net AI Workforce ROI', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'hm-value-tier', name: 'Attributed Value by Tier', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'hm-cost', name: 'Platform Cost', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'hm-incidents', name: 'Incidents Avoided', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'hm-value-cat', name: 'Value by Category', kind: 'breakdown', recommendedType: 'pie' },
      { id: 'hm-exposures', name: 'Top Exposures', kind: 'breakdown', recommendedType: 'list' },
    ],
    recordSets: [{ id: 'hm-rs-value', name: 'Value Entries', entityType: 'Event', count: 9400 }],
  }),
  S({
    id: 'src-aims-datastudio', name: 'AIMS OS — Data Studio', category: 'AIMS OS', logoColor: '#0891B2', initials: 'DS',
    status: 'connected', governed: true, owner: 'AIMS OS', reviewed: 'Jun 2026',
    description: 'Connector & DIAN pipeline health — ingestion, entity resolution, sync reliability.',
    metrics: [
      { id: 'ds-ingested', name: 'Records Ingested', kind: 'timeseries', recommendedType: 'line' },
      { id: 'ds-resolved', name: 'Entities Resolved', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'ds-uptime', name: 'Connector Uptime', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'ds-failures', name: 'Sync Failures', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'ds-byconnector', name: 'Records by Connector', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'ds-region', name: 'Activity by Region', kind: 'geo', recommendedType: 'map' },
    ],
    recordSets: [{ id: 'ds-rs-connectors', name: 'Connectors', entityType: 'Event', count: 45, recommendedType: 'list' }],
  }),

  // ── CRM ──
  S({
    id: 'src-salesforce', name: 'Salesforce', category: 'CRM', logoColor: '#00A1E0', initials: 'SF',
    status: 'connected', hasPII: true, featured: true, owner: 'RevOps', reviewed: 'May 2026',
    description: 'The system of record for accounts, contacts, and your sales pipeline.',
    metrics: [
      { id: 'sf-opps', name: 'Opportunities by Stage', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'sf-winrate', name: 'Win Rate', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'sf-pipeline', name: 'Pipeline $', kind: 'timeseries', recommendedType: 'line' },
      { id: 'sf-dealsize', name: 'Deal Size vs Close Time', kind: 'twoVar', recommendedType: 'scatter' },
      { id: 'sf-byregion', name: 'Accounts by Region', kind: 'geo', recommendedType: 'map' },
    ],
    recordSets: [
      { id: 'sf-rs-contacts', name: 'Contacts', entityType: 'Contact', count: 18420, hasPII: true },
      { id: 'sf-rs-accounts', name: 'Accounts', entityType: 'Account', count: 3210 },
      { id: 'sf-rs-deals', name: 'Open Deals', entityType: 'Deal', count: 742, recommendedType: 'list' },
    ],
  }),
  S({
    id: 'src-hubspot', name: 'HubSpot', category: 'CRM', logoColor: '#FF7A59', initials: 'HS',
    status: 'connected', hasPII: true, owner: 'Marketing Ops', reviewed: 'Apr 2026',
    description: 'Inbound CRM with marketing, contacts, and lifecycle data.',
    metrics: [
      { id: 'hs-funnel', name: 'MQL → SQL Funnel', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'hs-ctr', name: 'Email Click-through Rate', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'hs-trend', name: 'Pipeline Trend', kind: 'timeseries', recommendedType: 'line' },
    ],
    recordSets: [
      { id: 'hs-rs-contacts', name: 'Contacts', entityType: 'Contact', count: 52100, hasPII: true },
      { id: 'hs-rs-companies', name: 'Companies', entityType: 'Account', count: 9800 },
    ],
  }),
  S({
    id: 'src-dynamics', name: 'Microsoft Dynamics 365', category: 'CRM', logoColor: '#002050', initials: 'D3',
    hasPII: true, description: 'Microsoft’s enterprise CRM and customer engagement suite.',
    metrics: [
      { id: 'dyn-rev', name: 'Revenue by Business Unit', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'dyn-cycle', name: 'Sales Cycle Length', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [
      { id: 'dyn-rs-accounts', name: 'Accounts', entityType: 'Account', count: 4100 },
      { id: 'dyn-rs-leads', name: 'Leads', entityType: 'Lead', count: 2300, hasPII: true },
    ],
  }),
  S({
    id: 'src-zoho', name: 'Zoho CRM', category: 'CRM', logoColor: '#E42527', initials: 'ZC',
    provider: 'partner', hasPII: true, description: 'Lightweight CRM popular with SMB sales teams.',
    metrics: [{ id: 'zoho-deals', name: 'Deals by Stage', kind: 'breakdown', recommendedType: 'bar' }],
    recordSets: [{ id: 'zoho-rs-contacts', name: 'Contacts', entityType: 'Contact', count: 7600, hasPII: true }],
  }),
  S({
    id: 'src-pipedrive', name: 'Pipedrive', category: 'CRM', logoColor: '#017737', initials: 'PD',
    provider: 'partner', hasPII: true, description: 'Pipeline-first CRM built around deal stages.',
    metrics: [{ id: 'pd-velocity', name: 'Pipeline Velocity', kind: 'timeseries', recommendedType: 'line' }],
    recordSets: [{ id: 'pd-rs-deals', name: 'Deals', entityType: 'Deal', count: 1290, recommendedType: 'list' }],
  }),

  // ── Marketing ──
  S({
    id: 'src-marketo', name: 'Marketo', category: 'Marketing', logoColor: '#5C4C9F', initials: 'MK',
    hasPII: true, description: 'Marketing automation for campaigns and lead nurturing.',
    metrics: [
      { id: 'mkt-roi', name: 'Campaign ROI', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'mkt-engage', name: 'Engagement Over Time', kind: 'timeseries', recommendedType: 'line' },
    ],
    recordSets: [{ id: 'mkt-rs-leads', name: 'Leads', entityType: 'Lead', count: 33400, hasPII: true }],
  }),
  S({
    id: 'src-googleads', name: 'Google Ads', category: 'Marketing', logoColor: '#4285F4', initials: 'GA',
    status: 'connected', realtime: true, owner: 'Growth', reviewed: 'Jun 2026',
    description: 'Search and display ad spend, clicks, and conversions.',
    metrics: [
      { id: 'gads-spend', name: 'Spend by Campaign', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'gads-cpc', name: 'CPC Trend', kind: 'timeseries', recommendedType: 'line' },
      { id: 'gads-roas', name: 'ROAS', kind: 'kpi', recommendedType: 'gauge' },
    ],
  }),
  S({
    id: 'src-metaads', name: 'Meta Ads', category: 'Marketing', logoColor: '#0668E1', initials: 'MA',
    description: 'Facebook and Instagram ad performance.',
    metrics: [
      { id: 'meta-spend', name: 'Spend Over Time', kind: 'timeseries', recommendedType: 'line' },
      { id: 'meta-ctr', name: 'Click-through Rate', kind: 'kpi', recommendedType: 'kpi' },
    ],
  }),
  S({
    id: 'src-mailchimp', name: 'Mailchimp', category: 'Marketing', logoColor: '#241C15', initials: 'MC',
    provider: 'partner', hasPII: true, description: 'Email marketing lists, sends, and engagement.',
    metrics: [
      { id: 'mc-open', name: 'Open Rate', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'mc-sends', name: 'Sends Over Time', kind: 'timeseries', recommendedType: 'line' },
    ],
    recordSets: [{ id: 'mc-rs-subs', name: 'Subscribers', entityType: 'Contact', count: 128000, hasPII: true }],
  }),
  S({
    id: 'src-klaviyo', name: 'Klaviyo', category: 'Marketing', logoColor: '#232426', initials: 'KL',
    provider: 'partner', hasPII: true, description: 'E-commerce email and SMS with profile-level data.',
    metrics: [{ id: 'kl-flow', name: 'Flow Revenue', kind: 'breakdown', recommendedType: 'bar' }],
    recordSets: [{ id: 'kl-rs-profiles', name: 'Profiles', entityType: 'Contact', count: 90400, hasPII: true }],
  }),

  // ── Support ──
  S({
    id: 'src-zendesk', name: 'Zendesk', category: 'Support', logoColor: '#03363D', initials: 'ZD',
    status: 'connected', hasPII: true, realtime: true, owner: 'Support Ops', reviewed: 'May 2026',
    description: 'Ticketing and customer support across channels.',
    metrics: [
      { id: 'zd-volume', name: 'Ticket Volume', kind: 'timeseries', recommendedType: 'line' },
      { id: 'zd-csat', name: 'CSAT', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'zd-channel', name: 'Tickets by Channel', kind: 'breakdown', recommendedType: 'pie' },
    ],
    recordSets: [
      { id: 'zd-rs-tickets', name: 'Tickets', entityType: 'Ticket', count: 12800 },
      { id: 'zd-rs-customers', name: 'Customers', entityType: 'Contact', count: 40200, hasPII: true },
    ],
  }),
  S({
    id: 'src-intercom', name: 'Intercom', category: 'Support', logoColor: '#1F8DED', initials: 'IC',
    hasPII: true, description: 'Conversational support and customer messaging.',
    metrics: [
      { id: 'ic-frt', name: 'First Response Time', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'ic-conv', name: 'Conversations Over Time', kind: 'timeseries', recommendedType: 'line' },
    ],
    recordSets: [{ id: 'ic-rs-conv', name: 'Conversations', entityType: 'Case', count: 8800, recommendedType: 'list' }],
  }),
  S({
    id: 'src-freshdesk', name: 'Freshdesk', category: 'Support', logoColor: '#25C16F', initials: 'FD',
    provider: 'partner', description: 'Cloud help desk and ticketing.',
    metrics: [{ id: 'fd-sla', name: 'SLA Breach Risk', kind: 'kpi', recommendedType: 'gauge' }],
    recordSets: [{ id: 'fd-rs-tickets', name: 'Tickets', entityType: 'Ticket', count: 5400 }],
  }),
  S({
    id: 'src-servicenow', name: 'ServiceNow', category: 'Support', logoColor: '#62D84E', initials: 'SV',
    description: 'Enterprise IT service management and incidents.',
    metrics: [
      { id: 'snow-priority', name: 'Incidents by Priority', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'snow-mttr', name: 'Mean Time to Resolve', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [{ id: 'snow-rs-inc', name: 'Incidents', entityType: 'Case', count: 3300 }],
  }),
  S({
    id: 'src-jira', name: 'Jira Service Management', category: 'Support', logoColor: '#2684FF', initials: 'JS',
    description: 'Atlassian service desk and issue tracking.',
    metrics: [{ id: 'jira-backlog', name: 'Backlog Trend', kind: 'timeseries', recommendedType: 'line' }],
    recordSets: [{ id: 'jira-rs-issues', name: 'Issues', entityType: 'Case', count: 6700, recommendedType: 'list' }],
  }),

  // ── Finance ──
  S({
    id: 'src-netsuite', name: 'ERP (NetSuite)', category: 'Finance', logoColor: '#1F6FEB', initials: 'NS',
    status: 'connected', owner: 'Finance', reviewed: 'Mar 2026',
    description: 'ERP for revenue, AP/AR, and the general ledger.',
    metrics: [
      { id: 'erp-rev', name: 'Revenue', kind: 'timeseries', recommendedType: 'line' },
      { id: 'erp-ap', name: 'AP Aging', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'erp-margin', name: 'Margin by Region', kind: 'matrix', recommendedType: 'heatmap' },
      { id: 'erp-cash', name: 'Cash Position', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [
      { id: 'erp-rs-invoices', name: 'Invoices', entityType: 'Invoice', count: 21000 },
      { id: 'erp-rs-vendors', name: 'Vendors', entityType: 'Account', count: 1400 },
    ],
  }),
  S({
    id: 'src-sap', name: 'SAP', category: 'Finance', logoColor: '#0A6ED1', initials: 'SP',
    description: 'Enterprise resource planning at scale.',
    metrics: [
      { id: 'sap-cogs', name: 'COGS Trend', kind: 'timeseries', recommendedType: 'line' },
      { id: 'sap-turn', name: 'Inventory Turnover', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [{ id: 'sap-rs-po', name: 'Purchase Orders', entityType: 'Order', count: 9200 }],
  }),
  S({
    id: 'src-quickbooks', name: 'QuickBooks', category: 'Finance', logoColor: '#2CA01C', initials: 'QB',
    provider: 'partner', status: 'connected', owner: 'Finance', reviewed: 'May 2026',
    description: 'SMB accounting — invoices, expenses, and cash flow.',
    metrics: [
      { id: 'qb-burn', name: 'Cash Burn', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'qb-expenses', name: 'Expenses by Category', kind: 'breakdown', recommendedType: 'pie' },
      { id: 'qb-rev', name: 'Revenue Trend', kind: 'timeseries', recommendedType: 'line' },
    ],
    recordSets: [{ id: 'qb-rs-invoices', name: 'Invoices', entityType: 'Invoice', count: 3800 }],
  }),
  S({
    id: 'src-stripe', name: 'Stripe', category: 'Finance', logoColor: '#635BFF', initials: 'ST',
    status: 'connected', hasPII: true, featured: true, realtime: true, owner: 'RevOps', reviewed: 'Jun 2026',
    description: 'Payments, subscriptions, and revenue with customer-level detail.',
    metrics: [
      { id: 'stripe-mrr', name: 'MRR', kind: 'timeseries', recommendedType: 'line' },
      { id: 'stripe-churn', name: 'Churn Rate', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'stripe-plan', name: 'Revenue by Plan', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'stripe-failed', name: 'Failed Payments', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [
      { id: 'stripe-rs-customers', name: 'Customers', entityType: 'Contact', count: 64000, hasPII: true },
      { id: 'stripe-rs-charges', name: 'Charges', entityType: 'Order', count: 210000 },
    ],
  }),
  S({
    id: 'src-xero', name: 'Xero', category: 'Finance', logoColor: '#13B5EA', initials: 'XO',
    provider: 'partner', description: 'Cloud accounting for small businesses.',
    metrics: [{ id: 'xero-pl', name: 'P&L Trend', kind: 'timeseries', recommendedType: 'line' }],
    recordSets: [{ id: 'xero-rs-invoices', name: 'Invoices', entityType: 'Invoice', count: 2100 }],
  }),

  // ── People ──
  S({
    id: 'src-workday', name: 'HR Platform (Workday)', category: 'People', logoColor: '#F38B00', initials: 'WD',
    status: 'connected', hasPII: true, owner: 'People Ops', reviewed: 'Feb 2026',
    description: 'HCM for headcount, compensation, and org data.',
    metrics: [
      { id: 'hr-headcount', name: 'Headcount', kind: 'timeseries', recommendedType: 'line' },
      { id: 'hr-attrition', name: 'Attrition', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'hr-bydept', name: 'Headcount by Dept', kind: 'breakdown', recommendedType: 'pie' },
    ],
    recordSets: [{ id: 'hr-rs-emp', name: 'Employees', entityType: 'Employee', count: 2400, hasPII: true }],
  }),
  S({
    id: 'src-bamboo', name: 'BambooHR', category: 'People', logoColor: '#84BD00', initials: 'BH',
    provider: 'partner', hasPII: true, description: 'HR for small and mid-size companies.',
    metrics: [{ id: 'bh-tth', name: 'Time to Hire', kind: 'kpi', recommendedType: 'kpi' }],
    recordSets: [{ id: 'bh-rs-emp', name: 'Employees', entityType: 'Employee', count: 540, hasPII: true }],
  }),
  S({
    id: 'src-gusto', name: 'Gusto', category: 'People', logoColor: '#F45D48', initials: 'GU',
    provider: 'partner', hasPII: true, description: 'Payroll, benefits, and HR for SMBs.',
    metrics: [{ id: 'gu-payroll', name: 'Payroll Cost', kind: 'timeseries', recommendedType: 'line' }],
    recordSets: [{ id: 'gu-rs-emp', name: 'Employees', entityType: 'Employee', count: 310, hasPII: true }],
  }),
  S({
    id: 'src-greenhouse', name: 'Greenhouse', category: 'People', logoColor: '#23A047', initials: 'GH',
    provider: 'partner', hasPII: true, description: 'Recruiting and applicant tracking.',
    metrics: [
      { id: 'gh-stage', name: 'Pipeline by Stage', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'gh-offer', name: 'Offer Acceptance', kind: 'kpi', recommendedType: 'gauge' },
    ],
    recordSets: [{ id: 'gh-rs-cand', name: 'Candidates', entityType: 'Lead', count: 4200, hasPII: true }],
  }),
  S({
    id: 'src-adp', name: 'ADP', category: 'People', logoColor: '#D0271D', initials: 'AD',
    hasPII: true, description: 'Payroll and workforce management at enterprise scale.',
    metrics: [{ id: 'adp-labor', name: 'Labor Cost', kind: 'timeseries', recommendedType: 'line' }],
    recordSets: [{ id: 'adp-rs-emp', name: 'Employees', entityType: 'Employee', count: 8900, hasPII: true }],
  }),

  // ── Data Warehouse ──
  S({
    id: 'src-snowflake', name: 'Snowflake', category: 'Data Warehouse', logoColor: '#29B5E8', initials: 'SN',
    status: 'connected', featured: true, realtime: true, owner: 'Data Eng', reviewed: 'Jun 2026',
    description: 'Cloud warehouse — query any modeled table or event stream.',
    metrics: [
      { id: 'snow-cost', name: 'Query Cost', kind: 'timeseries', recommendedType: 'line' },
      { id: 'snow-rows', name: 'Rows Scanned', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [
      { id: 'snow-rs-events', name: 'Events', entityType: 'Event', count: 4200000 },
      { id: 'snow-rs-orders', name: 'Orders', entityType: 'Order', count: 880000 },
    ],
  }),
  S({
    id: 'src-bigquery', name: 'BigQuery', category: 'Data Warehouse', logoColor: '#4285F4', initials: 'BQ',
    description: 'Google’s serverless data warehouse.',
    metrics: [{ id: 'bq-slot', name: 'Slot Usage', kind: 'timeseries', recommendedType: 'line' }],
    recordSets: [{ id: 'bq-rs-events', name: 'Events', entityType: 'Event', count: 2100000 }],
  }),
  S({
    id: 'src-databricks', name: 'Databricks', category: 'Data Warehouse', logoColor: '#FF3621', initials: 'DB',
    description: 'Lakehouse for analytics and ML feature tables.',
    metrics: [{ id: 'dbx-runtime', name: 'Job Runtime', kind: 'timeseries', recommendedType: 'line' }],
    recordSets: [{ id: 'dbx-rs-feat', name: 'Feature Tables', entityType: 'Event', count: 560000 }],
  }),
  S({
    id: 'src-redshift', name: 'Amazon Redshift', category: 'Data Warehouse', logoColor: '#8C4FFF', initials: 'RS',
    description: 'AWS columnar data warehouse.',
    metrics: [{ id: 'rs-disk', name: 'Disk Usage', kind: 'kpi', recommendedType: 'gauge' }],
    recordSets: [{ id: 'rs-rs-sales', name: 'Sales Fact', entityType: 'Order', count: 1200000 }],
  }),
  S({
    id: 'src-postgres', name: 'PostgreSQL', category: 'Data Warehouse', logoColor: '#336791', initials: 'PG',
    provider: 'private', status: 'connected', governed: false, hasPII: true, owner: 'You (Data Eng)',
    description: 'A direct database connection — ungoverned until mapped in Data Studio.',
    metrics: [{ id: 'pg-conn', name: 'Active Connections', kind: 'kpi', recommendedType: 'kpi' }],
    recordSets: [
      { id: 'pg-rs-users', name: 'Users', entityType: 'Contact', count: 15600, hasPII: true },
      { id: 'pg-rs-orders', name: 'Orders', entityType: 'Order', count: 98000 },
    ],
  }),

  // ── Storage ──
  S({
    id: 'src-gdrive', name: 'Google Drive', category: 'Storage', logoColor: '#1FA463', initials: 'GD',
    description: 'Files and folders across the workspace.',
    recordSets: [{ id: 'gd-rs-files', name: 'Files', entityType: 'Event', count: 34000 }],
  }),
  S({
    id: 'src-s3', name: 'Amazon S3', category: 'Storage', logoColor: '#569A31', initials: 'S3',
    description: 'Object storage buckets.',
    recordSets: [{ id: 's3-rs-objects', name: 'Objects', entityType: 'Event', count: 1900000 }],
  }),
  S({
    id: 'src-dropbox', name: 'Dropbox', category: 'Storage', logoColor: '#0061FF', initials: 'DX',
    provider: 'partner', description: 'Cloud file storage and sharing.',
    recordSets: [{ id: 'dx-rs-files', name: 'Files', entityType: 'Event', count: 12000 }],
  }),
  S({
    id: 'src-sharepoint', name: 'SharePoint', category: 'Storage', logoColor: '#038387', initials: 'SH',
    hasPII: true, description: 'Microsoft document libraries and sites.',
    recordSets: [{ id: 'sp-rs-docs', name: 'Documents', entityType: 'Event', count: 76000 }],
  }),

  // ── Communication ──
  S({
    id: 'src-slack', name: 'Slack', category: 'Communication', logoColor: '#4A154B', initials: 'SL',
    status: 'connected', realtime: true, owner: 'IT', reviewed: 'Jun 2026',
    description: 'Team messaging activity and channels.',
    metrics: [
      { id: 'slack-msgs', name: 'Messages per Day', kind: 'timeseries', recommendedType: 'line' },
      { id: 'slack-active', name: 'Active Users', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [{ id: 'slack-rs-ch', name: 'Channels', entityType: 'Event', count: 420, recommendedType: 'list' }],
  }),
  S({
    id: 'src-gmail', name: 'Gmail', category: 'Communication', logoColor: '#EA4335', initials: 'GM',
    hasPII: true, description: 'Email threads and volume.',
    metrics: [{ id: 'gm-volume', name: 'Email Volume', kind: 'timeseries', recommendedType: 'line' }],
    recordSets: [{ id: 'gm-rs-threads', name: 'Threads', entityType: 'Case', count: 88000, hasPII: true, recommendedType: 'list' }],
  }),
  S({
    id: 'src-twilio', name: 'Twilio', category: 'Communication', logoColor: '#F22F46', initials: 'TW',
    hasPII: true, realtime: true, description: 'Programmable SMS and voice messaging.',
    metrics: [
      { id: 'tw-delivery', name: 'SMS Delivery Rate', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'tw-msgs', name: 'Messages Over Time', kind: 'timeseries', recommendedType: 'line' },
    ],
    recordSets: [{ id: 'tw-rs-msgs', name: 'Messages', entityType: 'Event', count: 540000, hasPII: true }],
  }),

  // ── Productivity ──
  S({
    id: 'src-notion', name: 'Notion', category: 'Productivity', logoColor: '#2F2F2F', initials: 'NO',
    provider: 'partner', description: 'Docs, wikis, and databases.',
    recordSets: [{ id: 'no-rs-pages', name: 'Pages', entityType: 'Event', count: 3400, recommendedType: 'list' }],
  }),
  S({
    id: 'src-airtable', name: 'Airtable', category: 'Productivity', logoColor: '#18BFFF', initials: 'AT',
    provider: 'partner', status: 'connected', hasPII: true, owner: 'Ops', reviewed: 'Apr 2026',
    description: 'Spreadsheet-database hybrid for custom records.',
    metrics: [{ id: 'at-bytable', name: 'Records by Table', kind: 'breakdown', recommendedType: 'bar' }],
    recordSets: [{ id: 'at-rs-rows', name: 'Rows', entityType: 'Event', count: 28000, hasPII: true }],
  }),
  S({
    id: 'src-sheets', name: 'Google Sheets', category: 'Productivity', logoColor: '#0F9D58', initials: 'GS',
    provider: 'partner', description: 'Spreadsheets as a lightweight data source.',
    recordSets: [{ id: 'gs-rs-rows', name: 'Rows', entityType: 'Event', count: 5600 }],
  }),

  // ── Automotive ──
  // The "Live Financial Watchdog" source: mapped & normalized general-journal
  // ledger across the dealership group's rooftops, monitored live by an agentic
  // worker. Replaces legacy static-grid reporting (Accessa) with instant anomaly
  // detection + human-in-the-loop routing.
  S({
    id: 'src-tasca-gl', name: 'AIMS OS — Dealership GL', category: 'Automotive', logoColor: '#C8102E', initials: 'GL',
    status: 'connected', featured: true, realtime: true, governed: true, owner: 'AIMS OS', reviewed: 'Jun 2026',
    description: 'Mapped & normalized general-journal ledger across 46 rooftops, watched live by an agentic worker — instant anomaly detection + human-in-the-loop routing.',
    metrics: [
      { id: 'gl-anomalies', name: 'Live GL Anomalies', kind: 'kpi', recommendedType: 'alerts' },
      { id: 'gl-ttd', name: 'Time to Detection', kind: 'kpi', recommendedType: 'statrow' },
      { id: 'gl-caught', name: 'Anomalies Caught (MTD)', kind: 'kpi', recommendedType: 'kpi' },
      { id: 'gl-bystore', name: 'Anomalies by Store', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'gl-policy', name: 'Policy Budget Used', kind: 'kpi', recommendedType: 'gauge' },
      { id: 'gl-ledger', name: 'General Ledger — Detail', kind: 'records', recommendedType: 'table' },
      { id: 'gl-posted', name: 'GL Entries Posted', kind: 'timeseries', recommendedType: 'line' },
    ],
    recordSets: [
      { id: 'gl-rs-entries', name: 'Journal Entries', entityType: 'Event', count: 184200, recommendedType: 'table' },
      { id: 'gl-rs-ros', name: 'Repair Orders', entityType: 'Order', count: 9600, recommendedType: 'list' },
    ],
  }),
  S({
    id: 'src-dms', name: 'Dealer Management System', category: 'Automotive', logoColor: '#C8102E', initials: 'DM',
    status: 'connected', owner: 'Ops', reviewed: 'Apr 2026',
    description: 'Dealership sales, service, and inventory operations.',
    metrics: [
      { id: 'dms-units', name: 'Units Sold', kind: 'timeseries', recommendedType: 'line' },
      { id: 'dms-ros', name: 'Service ROs', kind: 'breakdown', recommendedType: 'bar' },
      { id: 'dms-gpu', name: 'Gross per Unit', kind: 'kpi', recommendedType: 'kpi' },
    ],
    recordSets: [
      { id: 'dms-rs-deals', name: 'Deals', entityType: 'Deal', count: 4200 },
      { id: 'dms-rs-vehicles', name: 'Vehicles', entityType: 'Order', count: 1800 },
    ],
  }),
  S({
    id: 'src-cdk', name: 'CDK Global', category: 'Automotive', logoColor: '#0033A0', initials: 'CK',
    provider: 'partner', description: 'Automotive retail platform for dealers.',
    metrics: [{ id: 'cdk-fixed', name: 'Fixed Ops Revenue', kind: 'timeseries', recommendedType: 'line' }],
    recordSets: [{ id: 'cdk-rs-ro', name: 'Repair Orders', entityType: 'Order', count: 9600 }],
  }),

  // ── Custom ──
  S({
    id: 'src-rest', name: 'Custom REST API', category: 'Custom', logoColor: '#6366F1', initials: 'API',
    provider: 'private', governed: false, owner: 'You',
    description: 'Map any REST endpoint by URL — ungoverned until reviewed.',
    metrics: [{ id: 'rest-metric', name: 'Custom Metric', kind: 'kpi', recommendedType: 'kpi' }],
    recordSets: [{ id: 'rest-rs-records', name: 'Records', entityType: 'Event', count: 0 }],
  }),
  S({
    id: 'src-webhook', name: 'Webhook Source', category: 'Custom', logoColor: '#14B8A6', initials: 'WH',
    provider: 'private', governed: false, realtime: true, owner: 'You',
    description: 'Receive real-time events pushed to a webhook URL.',
    metrics: [{ id: 'wh-rate', name: 'Events per Minute', kind: 'timeseries', recommendedType: 'line' }],
  }),
  S({
    id: 'src-computed', name: 'Compute a metric here', category: 'Custom', logoColor: '#6B7280', initials: 'CM',
    provider: 'private', governed: false, owner: 'You (Widget Builder)',
    description: 'Define a one-off metric inline without connecting a source.',
    metrics: [{ id: 'cm-custom', name: 'Custom Metric', kind: 'kpi', recommendedType: 'kpi' }],
  }),
]

// All selectable fields of a source — metrics + record sets — for the picker.
export function sourceFields(source) {
  if (!source) return []
  return [...source.metrics, ...source.recordSets]
}

// U4 — per-source dashboard/widget templates. Connecting a source surfaces a
// ready-made bundle to install in one click (deduped by templateId). Mock.
export const SOURCE_TEMPLATES = {
  'src-salesforce': [
    { id: 'tpl-sf-pipeline', name: 'Pipeline by Stage', skeleton: 'Chart' },
    { id: 'tpl-sf-winrate', name: 'Win Rate', skeleton: 'Gauge' },
    { id: 'tpl-sf-dealsize', name: 'Avg Deal Size', skeleton: 'KPI' },
    { id: 'tpl-sf-reps', name: 'Top Reps by Bookings', skeleton: 'List' },
  ],
  'src-zendesk': [
    { id: 'tpl-zd-sla', name: 'SLA Breach Risk', skeleton: 'Gauge' },
    { id: 'tpl-zd-csat', name: 'CSAT', skeleton: 'Gauge' },
    { id: 'tpl-zd-volume', name: 'Ticket Volume', skeleton: 'Chart' },
    { id: 'tpl-zd-queue', name: 'Open Tickets', skeleton: 'List' },
  ],
  'src-stripe': [
    { id: 'tpl-st-mrr', name: 'MRR Trend', skeleton: 'Chart' },
    { id: 'tpl-st-churn', name: 'Churn Rate', skeleton: 'Gauge' },
    { id: 'tpl-st-failed', name: 'Failed Payments', skeleton: 'KPI' },
  ],
  'src-hubspot': [
    { id: 'tpl-hs-leadvel', name: 'Lead Velocity', skeleton: 'Chart' },
    { id: 'tpl-hs-mql', name: 'MQLs This Month', skeleton: 'KPI' },
    { id: 'tpl-hs-funnel', name: 'Lifecycle Funnel', skeleton: 'Funnel' },
  ],
  'src-aims-agentic': [
    { id: 'tpl-aims-runs', name: 'Workflow Runs', skeleton: 'Chart' },
    { id: 'tpl-aims-hitl', name: 'Human-in-the-Loops', skeleton: 'KPI' },
    { id: 'tpl-aims-actions', name: 'Actions by Type', skeleton: 'Chart' },
  ],
}

export function templatesForSource(sourceId) {
  return SOURCE_TEMPLATES[sourceId] || []
}

// Connected sources that ship a template bundle (drives the "Templates" surface).
export function sourcesWithTemplates() {
  return EXTERNAL_SOURCES.filter((s) => s.connected && (SOURCE_TEMPLATES[s.id] || []).length)
}
