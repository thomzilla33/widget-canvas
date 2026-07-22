// src/data/home.js
// All home control-center mock data. Re-exports existing HOME_INBOX /
// HOME_TASKS / HTL_ITEMS from mock.js so panel components import from
// one place.

export { HOME_INBOX, HOME_TASKS, HTL_ITEMS } from './mock.js'

// ── Governance events ────────────────────────────────────────────────────────
// HITL pauses and policy approvals that block active workflows/agents.
export const GOV_EVENTS = [
  {
    id: 'gov-1',
    title: 'Financial Policy PDF requires approval',
    context: 'DIAN Intake workflow paused — document requires your sign-off before it can be ingested and forwarded.',
    statusLabel: 'Due now',
    blocking: true,
    impact: { workflows: 14, agents: 3 },
    action: 'Approve',
    when: '12m ago',
  },
  {
    id: 'gov-2',
    title: 'SalesForecastPA about to send external email',
    context: 'Agent paused at a Human in the Loop checkpoint. Review the draft message before allowing send.',
    statusLabel: 'Paused',
    blocking: true,
    impact: { workflows: 8, agents: 2 },
    action: 'Allow send',
    when: '23m ago',
  },
  {
    id: 'gov-3',
    title: 'Temp PII partition access request',
    context: 'Break Glass access requested for the Finance PII partition. A second approval is required to proceed.',
    statusLabel: 'Awaiting 2nd approval',
    blocking: false,
    impact: { workflows: 5, agents: 1 },
    action: 'Authorize',
    when: '47m ago',
  },
]

// ── My Day — Work Queue ───────────────────────────────────────────────
// AI-assembled prioritized work list for the current persona.
// tier: 'critical' | 'action' | 'headsup'
export const MY_DAY_MANAGER_MSG = {
  from: 'Priya Nair',
  role: 'Head of Revenue Operations',
  message: 'Focus on the DIAN approval and the Acme escalation first — both are blocking the pipeline review scheduled for 3 PM.',
  time: '7:45 AM',
}

export const MY_DAY_QUEUE = [
  {
    id: 'mdq-1',
    title: 'Financial Policy PDF requires approval',
    studio: 'GOV',
    studioColor: '#7C3AED',
    type: 'Approval',
    tier: 'critical',
    dueLabel: 'Blocking · 14 workflows',
    estimatedMinutes: 10,
    primaryAction: 'Approve',
    source: 'DIAN Intake',
    startHere: true,
  },
  {
    id: 'mdq-2',
    title: 'SalesForecastPA about to send external email',
    studio: 'AGNT',
    studioColor: '#059669',
    type: 'Review',
    tier: 'critical',
    dueLabel: 'Paused · awaiting your review',
    estimatedMinutes: 5,
    primaryAction: 'Allow send',
    source: 'SalesForecastPA',
  },
  {
    id: 'mdq-3',
    title: 'Acme Corp — NPS Trend widget remap',
    studio: 'DATA',
    studioColor: '#0284C7',
    type: 'Remap',
    tier: 'critical',
    dueLabel: 'Stale · 2 days blocked',
    estimatedMinutes: 8,
    primaryAction: 'Remap widget',
    source: 'Survey Data View',
  },
  {
    id: 'mdq-4',
    title: 'Submit Q3 revenue forecast',
    studio: 'TASK',
    studioColor: '#D97706',
    type: 'Task',
    tier: 'action',
    dueLabel: 'Due today · 12:00 PM',
    estimatedMinutes: 20,
    primaryAction: 'Open task',
    source: 'RevOps',
  },
  {
    id: 'mdq-5',
    title: 'Temp PII partition access — 2nd approval',
    studio: 'GOV',
    studioColor: '#7C3AED',
    type: 'Approval',
    tier: 'action',
    dueLabel: 'Awaiting 2nd sign-off',
    estimatedMinutes: 5,
    primaryAction: 'Authorize',
    source: 'Finance PII',
  },
  {
    id: 'mdq-6',
    title: 'Model routing routes using deprecated endpoints',
    studio: 'AGNT',
    studioColor: '#059669',
    type: 'Review',
    tier: 'headsup',
    dueLabel: 'No deadline · low urgency',
    estimatedMinutes: 15,
    primaryAction: 'Open in Agentic',
    source: 'Model Routing',
  },
]

// ── My Day — Calendar (legacy) ────────────────────────────────────────
// Today's schedule items in chronological order.
export const MY_DAY_EVENTS = [
  { id: 'ev1', time: '09:00', duration: 30, title: 'Standup — Sales Team', type: 'meeting', attendees: 6, link: '#' },
  { id: 'ev2', time: '10:30', duration: 60, title: 'Acme Corp QBR Prep', type: 'meeting', attendees: 3, entity: 'Acme Corporation', link: '#' },
  { id: 'ev3', time: '12:00', duration: 0, title: 'Submit Q3 forecast', type: 'deadline', urgency: 'high' },
  { id: 'ev4', time: '14:00', duration: 45, title: 'Demo — Contoso Ltd onboarding', type: 'meeting', attendees: 4, entity: 'Contoso Ltd', link: '#' },
  { id: 'ev5', time: '15:00', duration: 0, title: 'Review NPS dashboard schema drift', type: 'reminder', urgency: 'medium' },
  { id: 'ev6', time: '16:30', duration: 30, title: '1:1 with Priya Nair', type: 'meeting', attendees: 2, link: '#' },
]

// ── Copilots ──────────────────────────────────────────────────────────
// AI copilots available to the user. Each has a quick_prompt for instant launch.
export const HOME_COPILOTS = [
  {
    id: 'cp1',
    name: 'Sales Copilot',
    description: 'Pipeline insights, account summaries, and next-best-action recommendations.',
    category: 'Sales',
    color: '#2563EB',
    initials: 'SC',
    lastUsed: '2 hours ago',
    quick_prompt: 'Summarize my pipeline for this week',
  },
  {
    id: 'cp2',
    name: 'Support Copilot',
    description: 'Ticket triage, CSAT analysis, and escalation recommendations.',
    category: 'Support',
    color: '#7C3AED',
    initials: 'SP',
    lastUsed: 'Yesterday',
    quick_prompt: 'Show me open tickets at risk of SLA breach',
  },
  {
    id: 'cp3',
    name: 'RevOps Analyst',
    description: 'Revenue attribution, forecast accuracy, and funnel analysis.',
    category: 'Revenue Ops',
    color: '#059669',
    initials: 'RA',
    lastUsed: '3 days ago',
    quick_prompt: 'How is Q3 tracking vs forecast?',
  },
  {
    id: 'cp4',
    name: 'Data Steward',
    description: 'Schema drift alerts, data quality scores, and governance reviews.',
    category: 'Governance',
    color: '#D97706',
    initials: 'DS',
    lastUsed: '1 week ago',
    quick_prompt: 'Which datasets have schema issues today?',
  },
]

// ── Workflows ─────────────────────────────────────────────────────────
// Active workflow runs the user has visibility into.
export const HOME_WORKFLOWS = [
  {
    id: 'wf1',
    name: 'Lead Enrichment — Inbound',
    status: 'running',
    progress: 68,
    trigger: 'New form submission',
    lastRun: '4 min ago',
    runsToday: 24,
    source: 'HubSpot',
  },
  {
    id: 'wf2',
    name: 'Nightly ETL — Salesforce',
    status: 'completed',
    progress: 100,
    trigger: 'Scheduled · 02:00',
    lastRun: '6 hours ago',
    runsToday: 1,
    source: 'Salesforce',
  },
  {
    id: 'wf3',
    name: 'Churn Risk Scoring',
    status: 'failed',
    progress: 31,
    trigger: 'Schema drift detected',
    lastRun: '1 hour ago',
    runsToday: 3,
    source: 'Survey Data View',
    error: 'NPS field missing after schema update',
  },
  {
    id: 'wf4',
    name: 'CS Escalation Router',
    status: 'paused',
    progress: 0,
    trigger: 'HTL queue threshold',
    lastRun: '2 days ago',
    runsToday: 0,
    source: 'Zendesk',
  },
  {
    id: 'wf5',
    name: 'Deal Stage Notifications',
    status: 'running',
    progress: 90,
    trigger: 'CRM stage change',
    lastRun: 'Just now',
    runsToday: 17,
    source: 'Salesforce',
  },
]

// ── AI Advisor insights ───────────────────────────────────────────────
// AI-surfaced action items rendered in the AIMS-OS Advisor card.
// type: 'warning' | 'action' | 'success' | 'info'
// icon: lucide-react component name (looked up in AiAdvisorCard)
export const HOME_ADVISOR_INSIGHTS = [
  {
    id: 'adv-1',
    type: 'warning',
    icon: 'AlertTriangle',
    stat: '4×',
    statLabel: 'failures today',
    title: 'Lead ingestion workflow failing',
    description: 'Webhook timeout from HubSpot — 142 leads may be stuck in queue.',
    cta: 'Review workflow',
  },
  {
    id: 'adv-2',
    type: 'action',
    icon: 'TrendingDown',
    stat: '3',
    statLabel: 'stalled deals',
    title: 'Sales Copilot flagged stalled deals',
    description: 'Acme Corp, TechFlow, Vertex — no activity in 5+ days. Recommend follow-up.',
    cta: 'View deals',
  },
  {
    id: 'adv-3',
    type: 'success',
    icon: 'Sparkles',
    stat: '+12%',
    statLabel: 'forecast accuracy',
    title: 'RevOps Analyst completed Q2 pipeline report',
    description: 'Forecast accuracy improved vs last quarter. Report is ready to share.',
    cta: 'Open report',
  },
  {
    id: 'adv-4',
    type: 'info',
    icon: 'Bot',
    stat: '23%',
    statLabel: 'above SLA',
    title: 'Support Copilot response time above SLA',
    description: '14 tickets breached the 4h SLA threshold this week. Consider scaling capacity.',
    cta: 'Review SLA',
  },
  {
    id: 'adv-5',
    type: 'action',
    icon: 'AlertTriangle',
    stat: '7',
    statLabel: 'datasets drifted',
    title: 'Schema drift detected across 7 datasets',
    description: 'NPS Trend, CS Health, and 5 others changed structure since last governance review.',
    cta: 'Review drift',
  },
  {
    id: 'adv-6',
    type: 'success',
    icon: 'Sparkles',
    stat: '94%',
    statLabel: 'CSAT this week',
    title: 'Support CSAT at 94% — 3-month high',
    description: 'Ticket resolution time dropped 18% after last week\'s escalation rule update.',
    cta: 'Open report',
  },
]

// ── Studio Health ─────────────────────────────────────────────────────
// Per-studio partition health scores, deltas, and path-to-100% action plans.
export const STUDIO_HEALTH = [
  {
    id: 'gov',
    label: 'GOV',
    short: 'Gov',
    name: 'Governance Studio',
    color: '#7C3AED',
    partitions: [
      {
        id: 'gov-p1',
        name: 'Finance Controls',
        score: 85,
        status: 'healthy',
        delta: 3,
        summary: 'Policy refresh pending, connector token healthy.',
        gapPts: 15,
        actions: [
          { id: 'ga1', title: 'Extend Return Policy TTL (6d)',             linkedIssue: 'E-2002', lift: 8,  cta: { label: 'Extend now',  icon: 'RefreshCw',    variant: 'primary'   } },
          { id: 'ga2', title: 'Review quarterly compliance report',                                lift: 4,  cta: { label: 'Open in Gov', icon: 'ExternalLink', variant: 'secondary' } },
          { id: 'ga3', title: 'Verify attestation signatures on 3 certs',                          lift: 3,  cta: { label: 'Open in Gov', icon: 'ExternalLink', variant: 'secondary' } },
        ],
      },
      {
        id: 'gov-p2',
        name: 'Legal & Compliance',
        score: 72,
        status: 'watch',
        delta: -1,
        summary: 'Contract review backlog growing. Two KBUs near expiry.',
        gapPts: 28,
        actions: [
          { id: 'gb1', title: 'Approve contract amendment — vendor MSA',   linkedIssue: 'E-3001', lift: 12, cta: { label: 'Open in Gov', icon: 'ExternalLink', variant: 'secondary' } },
          { id: 'gb2', title: 'Refresh KBU: Legal Terms v2.1',                                    lift: 4,  cta: { label: 'Open in Gov', icon: 'ExternalLink', variant: 'secondary' } },
          { id: 'gb3', title: 'Audit data retention policy adherence',                             lift: 12, cta: { label: 'Open in Gov', icon: 'ExternalLink', variant: 'secondary' } },
        ],
      },
    ],
  },
  {
    id: 'data',
    label: 'DATA',
    short: 'Data',
    name: 'Data Studio',
    color: '#0284C7',
    partitions: [
      {
        id: 'dat-p1',
        name: 'CRM Ingestion',
        score: 88,
        status: 'healthy',
        delta: 5,
        summary: 'Salesforce rotation pending but otherwise strong.',
        gapPts: 12,
        actions: [
          { id: 'da1', title: 'Rotate Salesforce OAuth token (4d)',         linkedIssue: 'E-2001', lift: 10, cta: { label: 'Rotate now',  icon: 'RefreshCw',    variant: 'primary'   } },
          { id: 'da2', title: 'Close HubSpot schema drift warning',                                lift: 2,  cta: { label: 'Open in Data', icon: 'ExternalLink', variant: 'secondary' } },
        ],
      },
      {
        id: 'dat-p2',
        name: 'Trading System Feeds',
        score: 95,
        status: 'healthy',
        delta: 1,
        summary: 'All feeds green.',
        gapPts: 5,
        actions: [
          { id: 'db1', title: 'Schedule monthly embedding index refresh',   linkedIssue: 'E-4001', lift: 3,  cta: { label: 'Schedule',     icon: 'Calendar',     variant: 'secondary' } },
          { id: 'db2', title: 'Verify exchange cut-off times for DST',                             lift: 2,  cta: { label: 'Open in Data', icon: 'ExternalLink', variant: 'secondary' } },
        ],
      },
    ],
  },
  {
    id: 'agnt',
    label: 'AGNT',
    short: 'Agentic',
    name: 'Agentic Studio',
    color: '#059669',
    partitions: [
      {
        id: 'agt-p1',
        name: 'Agent Orchestration',
        score: 91,
        status: 'healthy',
        delta: 2,
        summary: 'All orchestration pipelines healthy. One model pin expiring.',
        gapPts: 9,
        actions: [
          { id: 'aa1', title: 'Update workflow spec pin from Truth v3.1',   linkedIssue: 'E-4002', lift: 5,  cta: { label: 'Open in Agentic', icon: 'ExternalLink', variant: 'secondary' } },
          { id: 'aa2', title: 'Review SalesForecastPA confidence thresholds',                      lift: 4,  cta: { label: 'Open in Agentic', icon: 'ExternalLink', variant: 'secondary' } },
        ],
      },
      {
        id: 'agt-p2',
        name: 'Model Routing',
        score: 78,
        status: 'watch',
        delta: 1,
        summary: 'Two routes using deprecated model endpoints.',
        gapPts: 22,
        actions: [
          { id: 'ab1', title: 'Migrate deprecated model routes to current versions',               lift: 12, cta: { label: 'Open in Agentic', icon: 'ExternalLink', variant: 'secondary' } },
          { id: 'ab2', title: 'Validate confidence routing logic post-migration',                  lift: 5,  cta: { label: 'Schedule',         icon: 'Calendar',     variant: 'secondary' } },
          { id: 'ab3', title: 'Update fallback route thresholds',                                  lift: 5,  cta: { label: 'Open in Agentic', icon: 'ExternalLink', variant: 'secondary' } },
        ],
      },
    ],
  },
]

// ── Agents ────────────────────────────────────────────────────────────
// Active agents in this workspace.
export const HOME_AGENTS = [
  {
    id: 'ag1',
    name: 'Inbound Qualifier',
    status: 'active',
    capability: 'Qualification',
    color: '#2563EB',
    initials: 'IQ',
    conversationsToday: 38,
    lastActive: 'Just now',
    handoffs: 2,
  },
  {
    id: 'ag2',
    name: 'Support Triage',
    status: 'active',
    capability: 'Triage',
    color: '#7C3AED',
    initials: 'ST',
    conversationsToday: 91,
    lastActive: '3 min ago',
    handoffs: 7,
  },
  {
    id: 'ag3',
    name: 'Renewal Outreach',
    status: 'idle',
    capability: 'Outreach',
    color: '#059669',
    initials: 'RO',
    conversationsToday: 0,
    lastActive: '4 hours ago',
    handoffs: 0,
  },
  {
    id: 'ag4',
    name: 'Finance Watchdog',
    status: 'active',
    capability: 'Monitoring',
    color: '#D97706',
    initials: 'FW',
    conversationsToday: 5,
    lastActive: '12 min ago',
    handoffs: 0,
  },
  {
    id: 'ag5',
    name: 'Data Quality Monitor',
    status: 'paused',
    capability: 'Governance',
    color: '#DC2626',
    initials: 'DQ',
    conversationsToday: 0,
    lastActive: 'Yesterday',
    handoffs: 0,
  },
]
