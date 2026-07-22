// ── My Work — events from HTL Packs ─────────────────────────────────────────
export const MY_WORK_EVENTS = [
  // ── Act Now ──────────────────────────────────────────────────────────────
  { id: 'wq-1', tier: 'actnow',
    title: 'Financial Policy PDF — DIAN approval required',
    studio: 'GOV', studioColor: '#7C3AED', type: 'Approval',
    missionCritical: true, blastRadius: 14,
    dueLabel: 'Blocking · 14 workflows', estimatedMinutes: 10,
    sourceWorkflow: 'DIAN Intake Process v2',
    description: 'The DIAN financial policy document requires approval before the intake workflow can proceed. 14 downstream workflows are paused and cannot advance until this approval is granted.',
    auditTrail: [
      { action: 'Routed to Thomas G.', by: 'HTL Pack', at: '9:14 AM' },
      { action: 'Escalated from Ops queue', by: 'System', at: '8:02 AM' },
      { action: 'Document uploaded', by: 'DIAN Connector', at: '7:55 AM' },
    ],
    quickActions: { primary: 'Approve', secondary: ['Review', 'Reject'] },
  },
  { id: 'wq-2', tier: 'actnow',
    title: 'SalesForecastPA about to send external email',
    studio: 'AGNT', studioColor: '#059669', type: 'Review',
    missionCritical: false, blastRadius: 1,
    dueLabel: 'Paused · awaiting review', estimatedMinutes: 5,
    sourceWorkflow: 'Sales Forecast Automation',
    description: 'The SalesForecastPA agent is paused and requires your review before sending an external email to Acme Corp. The draft has been attached for your review.',
    auditTrail: [
      { action: 'Agent paused for human review', by: 'SalesForecastPA', at: '10:31 AM' },
      { action: 'Email draft composed', by: 'SalesForecastPA', at: '10:30 AM' },
    ],
    quickActions: { primary: 'Allow send', secondary: ['Request Changes', 'Block'] },
  },
  // ── Critical ─────────────────────────────────────────────────────────────
  { id: 'wq-3', tier: 'critical',
    title: 'Acme Corp — NPS Trend widget schema drift',
    studio: 'DATA', studioColor: '#0284C7', type: 'Remap',
    missionCritical: false, blastRadius: 3,
    dueLabel: 'Stale · 2 days blocked', estimatedMinutes: 8,
    sourceWorkflow: 'Survey Data View',
    description: 'The NPS Trend widget is using deprecated column "nps_raw". Remapping to "nps_score" restores the widget and the 3 dashboards that depend on it.',
    auditTrail: [
      { action: 'Schema drift detected', by: 'Data Studio', at: 'Jul 20, 3:12 PM' },
    ],
    quickActions: { primary: 'Open remap', secondary: ['Escalate', 'Skip'] },
  },
  { id: 'wq-4', tier: 'critical',
    title: 'Model routing uses deprecated endpoints',
    studio: 'AGNT', studioColor: '#059669', type: 'Review',
    missionCritical: true, blastRadius: 6,
    dueLabel: 'Expires in 3 days', estimatedMinutes: 15,
    sourceWorkflow: 'Model Routing Orchestrator',
    description: 'The model routing pack invokes endpoints that will be deprecated on Aug 1. Review and update the routing logic before the cutover date.',
    auditTrail: [
      { action: 'Deprecation notice received', by: 'Model Registry', at: 'Jul 19, 11:00 AM' },
      { action: 'Routed to Agent Ops', by: 'System', at: 'Jul 19, 11:01 AM' },
    ],
    quickActions: { primary: 'Open Review', secondary: ['Request Changes', 'Escalate'] },
  },
  { id: 'wq-5', tier: 'critical',
    title: 'Temp PII partition access — 2nd approval',
    studio: 'GOV', studioColor: '#7C3AED', type: 'Approval',
    missionCritical: false, blastRadius: 2,
    dueLabel: 'Awaiting 2nd sign-off', estimatedMinutes: 5,
    sourceWorkflow: 'Finance PII Governance',
    description: 'A temporary access grant to the Finance PII partition requires a second approval. The first approver was Ana Restrepo. Your sign-off is required to activate.',
    auditTrail: [
      { action: 'First approval granted', by: 'Ana Restrepo', at: 'Jul 21, 2:15 PM' },
      { action: 'Access request submitted', by: 'Felipe Vargas', at: 'Jul 21, 2:00 PM' },
    ],
    quickActions: { primary: 'Authorize', secondary: ['Reject', 'Escalate'] },
  },
  // ── Action ───────────────────────────────────────────────────────────────
  { id: 'wq-6', tier: 'action',
    title: 'Submit Q3 revenue forecast',
    studio: 'TASK', studioColor: '#D97706', type: 'Task',
    missionCritical: false, blastRadius: 0,
    dueLabel: 'Due today · 12:00 PM', estimatedMinutes: 20,
    sourceWorkflow: null,
    description: 'Complete and submit the Q3 revenue forecast to the RevOps dashboard before 12:00 PM. The forecast template is pre-filled from last quarter.',
    auditTrail: [],
    quickActions: { primary: 'Open task', secondary: ['Assign', 'Skip'] },
  },
  { id: 'wq-7', tier: 'action',
    title: 'Agent training feedback — 3 samples pending',
    studio: 'AGNT', studioColor: '#059669', type: 'Train',
    missionCritical: false, blastRadius: 0,
    dueLabel: 'Due Friday', estimatedMinutes: 12,
    sourceWorkflow: 'CustomerSuccessPA',
    description: 'Review 3 interaction samples flagged by CustomerSuccessPA for training feedback. Your input is used to improve agent behavior on follow-up calls.',
    auditTrail: [],
    quickActions: { primary: 'Review and Edit', secondary: ['Promote', 'Reject'] },
  },
  { id: 'wq-8', tier: 'action',
    title: 'Respond to Legal — data retention policy review',
    studio: 'GOV', studioColor: '#7C3AED', type: 'Respond',
    missionCritical: false, blastRadius: 0,
    dueLabel: 'Due Thursday', estimatedMinutes: 10,
    sourceWorkflow: 'Legal Compliance Flow',
    description: 'Legal requires your response on the proposed 90-day data retention policy update for agent output logs. A summary of the policy changes has been attached.',
    auditTrail: [],
    quickActions: { primary: 'Respond', secondary: ['View Details', 'Escalate'] },
  },
  // ── Heads-up ─────────────────────────────────────────────────────────────
  { id: 'wq-9', tier: 'headsup',
    title: 'Revenue dashboard sync — 4h delay',
    studio: 'DATA', studioColor: '#0284C7', type: 'Acknowledge',
    missionCritical: false, blastRadius: 0,
    dueLabel: 'No deadline · monitoring', estimatedMinutes: 2,
    sourceWorkflow: 'Revenue Sync Pipeline',
    description: 'The revenue dashboard is experiencing a 4-hour data sync delay. Engineering is monitoring. No action required from you at this time.',
    auditTrail: [],
    quickActions: { primary: 'Acknowledge', secondary: ['View'] },
  },
  { id: 'wq-10', tier: 'headsup',
    title: 'ISO 27001 audit prep — 2 weeks out',
    studio: 'GOV', studioColor: '#7C3AED', type: 'Resolve',
    missionCritical: false, blastRadius: 0,
    dueLabel: 'In 2 weeks · low urgency', estimatedMinutes: 30,
    sourceWorkflow: 'Compliance Audit Tracker',
    description: 'The ISO 27001 audit begins in 2 weeks. Review the pre-audit checklist assigned to your governance role.',
    auditTrail: [],
    quickActions: { primary: 'Review Checklist', secondary: ['Resolve', 'Escalate'] },
  },
]

// ── Tier config ──────────────────────────────────────────────────────────────
export const WQ_TIER = {
  actnow:   { label: 'Act Now',  sub: 'blocking',       dot: 'bg-red-600',   text: 'text-red-600 dark:text-red-400',     border: 'border-l-red-600',    badge: 'bg-red-600/10 text-red-600 dark:text-red-400' },
  critical: { label: 'Critical', sub: 'within 7 days',  dot: 'bg-red-400',   text: 'text-red-500 dark:text-red-400',     border: 'border-l-red-400/70', badge: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  action:   { label: 'Action',   sub: 'this week',       dot: 'bg-amber-400', text: 'text-amber-500 dark:text-amber-400', border: 'border-l-amber-400/70',badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  headsup:  { label: 'Heads-up', sub: 'on radar',        dot: 'bg-slate-400', text: 'text-slate-400 dark:text-slate-500', border: 'border-l-slate-300/50 dark:border-l-white/10', badge: 'bg-gray-100 text-gray-500 dark:bg-white/[0.07] dark:text-slate-400' },
}

export const WQ_TIER_ORDER = ['actnow', 'critical', 'action', 'headsup']

// ── My Team roster ───────────────────────────────────────────────────────────
export const TEAM_ROSTER = [
  { id: 'tm-1', name: 'Ana Restrepo',  role: 'Revenue Ops',  initials: 'AR',
    events: { actnow: 2, critical: 3, action: 5, headsup: 1 }, ooo: false },
  { id: 'tm-2', name: 'Carlos Mejía',  role: 'Governance',   initials: 'CM',
    events: { actnow: 0, critical: 1, action: 3, headsup: 4 }, ooo: false },
  { id: 'tm-3', name: 'Diana Torres',  role: 'Agent Ops',    initials: 'DT',
    events: { actnow: 1, critical: 2, action: 1, headsup: 2 }, ooo: true, oooReturn: 'Aug 1' },
  { id: 'tm-4', name: 'Felipe Vargas', role: 'Data Studio',  initials: 'FV',
    events: { actnow: 0, critical: 0, action: 4, headsup: 3 }, ooo: false },
  { id: 'tm-5', name: 'Isabel Niño',   role: 'Revenue Ops',  initials: 'IN',
    events: { actnow: 3, critical: 1, action: 2, headsup: 0 }, ooo: false },
]

// ── Trace steps generator ────────────────────────────────────────────────────
export function traceSteps(sourceWorkflow) {
  if (!sourceWorkflow) return []
  return [
    { id: 1, label: 'Trigger',       detail: sourceWorkflow, status: 'done',    time: '7:55 AM' },
    { id: 2, label: 'Data fetch',    detail: 'External connector call',          status: 'done',    time: '7:56 AM' },
    { id: 3, label: 'Validation',    detail: 'Schema + policy check',            status: 'done',    time: '7:57 AM' },
    { id: 4, label: 'Human review',  detail: 'Routed to work queue',             status: 'current', time: 'Now' },
    { id: 5, label: 'Resume',        detail: 'Downstream steps resume on action',status: 'pending', time: '—' },
    { id: 6, label: 'Audit log',     detail: 'Action recorded to ledger',        status: 'pending', time: '—' },
  ]
}

// ── Team escalation recipients ───────────────────────────────────────────────
export const ESCALATION_RECIPIENTS = [
  { id: 'er-1', name: 'Priya Nair',    role: 'Head of Revenue Operations' },
  { id: 'er-2', name: 'Marco Reyes',   role: 'VP of Governance' },
  { id: 'er-3', name: 'Sarah Kim',     role: 'Engineering Lead' },
  { id: 'er-4', name: 'RevOps Group',  role: 'Group · 8 members' },
  { id: 'er-5', name: 'Compliance Team', role: 'Group · 4 members' },
]
