// src/data/home.js
// All home control-center mock data. Re-exports existing HOME_INBOX /
// HOME_TASKS / HTL_ITEMS from mock.js so panel components import from
// one place.

export { HOME_INBOX, HOME_TASKS, HTL_ITEMS } from './mock.js'

// ── My Day ────────────────────────────────────────────────────────────
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
