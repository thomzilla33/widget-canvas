// ── D4 state vocabulary ───────────────────────────────────────────────────────
// Seven states, shared across all archetypes.
// Actionable count = Open + Claimed + In Progress (Awaiting External excluded).
export const WQ_ACTIONABLE_STATES = new Set(['Open', 'Claimed', 'In Progress'])

// ── My Work — events (type-grouped, sorted by urgencyScore asc within group) ──
// wq-9 (Acknowledge) removed — no state change required, belongs in Notifications.
export const MY_WORK_EVENTS = [

  // ── HTL Continuation ──────────────────────────────────────────────────────
  { id: 'wq-2',
    wqType: 'HTL Continuation', severity: 'Blocking', urgencyScore: 5,
    status: 'Open',
    title: 'SalesForecastPA about to send external email',
    studio: 'AGNT', studioColor: '#059669',
    eventCategory: 'htl-continuation',
    blastRadius: 1,
    dueLabel: 'Paused · awaiting review', estimatedMinutes: 5,
    sourceWorkflow: 'Sales Forecast Automation',
    description: 'The SalesForecastPA agent is paused and requires your review before sending an external email to Acme Corp. The draft has been attached for your review.',
    auditTrail: [
      { action: 'Agent paused for human review', by: 'SalesForecastPA', at: '10:31 AM' },
      { action: 'Email draft composed', by: 'SalesForecastPA', at: '10:30 AM' },
    ],
    quickActions: { primary: 'Allow send', secondary: ['Request Changes', 'Block'] },
  },
  { id: 'wq-11',
    wqType: 'HTL Continuation', severity: 'Standard', urgencyScore: 30,
    status: 'Open',
    title: 'Contoso Ltd — enterprise trial response pending',
    studio: 'AGNT', studioColor: '#059669',
    eventCategory: 'client-continuation',
    customer: true,
    blastRadius: 1,
    dueLabel: 'Paused · awaiting approval', estimatedMinutes: 5,
    sourceWorkflow: 'SupportBot v2 — Enterprise Trial',
    description: 'SupportBot has drafted a proposal email to Marcus Webb at Contoso Ltd regarding their enterprise trial expansion. Review the draft before it is sent.',
    auditTrail: [
      { action: 'Agent paused for human review', by: 'SupportBot v2', at: '11:45 AM' },
      { action: 'Draft response composed', by: 'SupportBot v2', at: '11:44 AM' },
    ],
    quickActions: { primary: 'Approve and send', secondary: ['Edit', 'Block'] },
  },

  // ── Handoff ───────────────────────────────────────────────────────────────
  { id: 'wq-12',
    wqType: 'Handoff', severity: 'Blocking', urgencyScore: 8,
    status: 'Claimed',
    title: 'Contoso Ltd — customer requested human agent',
    studio: 'AGNT', studioColor: '#059669',
    eventCategory: 'client-handoff',
    customer: true,
    blastRadius: 0,
    dueLabel: 'Customer waiting · 8 min', estimatedMinutes: 15,
    sourceWorkflow: 'VCard Webchat — Enterprise Tier',
    description: 'Marcus Webb at Contoso Ltd has requested to speak with a human agent after 3 turns with SupportBot. A conversation summary has been prepared.',
    auditTrail: [
      { action: 'Escalated to human queue', by: 'SupportBot v2', at: '12:02 PM' },
      { action: 'Webchat session started', by: 'Marcus Webb', at: '11:54 AM' },
    ],
    quickActions: { primary: 'Assign to me', secondary: ['Reassign'] },
  },
  { id: 'wq-4',
    wqType: 'Handoff', severity: 'Blocking', urgencyScore: 4320,
    status: 'Awaiting External',
    title: 'Model routing uses deprecated endpoints',
    studio: 'AGNT', studioColor: '#059669',
    eventCategory: 'htl-handoff',
    blastRadius: 6,
    dueLabel: 'Expires in 3 days', estimatedMinutes: 15,
    sourceWorkflow: 'Model Routing Orchestrator',
    description: 'The model routing pack invokes endpoints that will be deprecated on Aug 1. Review and update the routing logic before the cutover date.',
    auditTrail: [
      { action: 'Deprecation notice received', by: 'Model Registry', at: 'Jul 19, 11:00 AM' },
      { action: 'Routed to Agent Ops', by: 'System', at: 'Jul 19, 11:01 AM' },
    ],
    quickActions: { primary: 'Open review', secondary: ['Escalate'] },
  },

  // ── Ask ───────────────────────────────────────────────────────────────────
  { id: 'wq-14',
    wqType: 'Ask', severity: 'Standard', urgencyScore: 45,
    status: 'Open',
    title: 'Ana Restrepo — question about DIAN policy claim',
    studio: 'GOV', studioColor: '#7C3AED',
    eventCategory: 'question',
    blastRadius: 0,
    dueLabel: 'Awaiting reply · 45m', estimatedMinutes: 3,
    sourceWorkflow: null,
    description: 'Ana Restrepo has a question about CLM-003 in the DIAN policy attestation.',
    auditTrail: [
      { action: 'Question submitted by Ana Restrepo', by: 'Governance Portal', at: '45m ago' },
      { action: 'Linked to DIAN attestation (wq-1)', by: 'System', at: '45m ago' },
    ],
    askedByName: 'Ana Restrepo',
    askedByRole: 'Revenue Ops Lead',
    askedAt: '45m ago',
    questionText: 'Can you review CLM-003 on the DIAN policy? The conflict between "Quarterly" and "Monthly" for Form 350 frequency — I believe the quarterly interpretation is correct based on the 2024-0419 resolution, but wanted your sign-off before I submit.',
    whyText: 'This claim is blocking the DIAN attestation which is holding up 14 downstream workflows.',
    linkedEventId: 'wq-1',
    linkedEventTitle: 'Financial Policy PDF — DIAN approval required',
    quickActions: { primary: 'Reply', secondary: ['Decline'] },
  },
  { id: 'wq-13',
    wqType: 'Ask', severity: 'Standard', urgencyScore: 120,
    status: 'Open',
    title: 'SupportBot — unresolved customer question flagged',
    studio: 'AGNT', studioColor: '#059669',
    eventCategory: 'inbound-question',
    customer: true,
    blastRadius: 0,
    dueLabel: 'Awaiting reply · 2h', estimatedMinutes: 5,
    sourceWorkflow: 'SupportBot v2 — Enterprise Tier',
    description: 'SupportBot intercepted a customer question it could not answer with confidence. The message has been routed to you for a human response.',
    auditTrail: [
      { action: 'Question routed to human queue', by: 'SupportBot v2', at: '2h ago' },
      { action: 'Customer message received', by: 'webchat', at: '2h ago' },
    ],
    quickActions: { primary: 'Reply', secondary: ['Decline'] },
  },

  // ── Promotion ─────────────────────────────────────────────────────────────
  { id: 'wq-1',
    wqType: 'Promotion', severity: 'Blocking', urgencyScore: 60,
    status: 'In Progress',
    title: 'Financial Policy PDF — DIAN approval required',
    studio: 'GOV', studioColor: '#7C3AED',
    eventCategory: 'gov-promotion',
    blastRadius: 14,
    dueLabel: 'Blocking · 14 workflows', estimatedMinutes: 10,
    sourceWorkflow: 'DIAN Intake Process v2',
    description: 'The DIAN financial policy document requires approval before the intake workflow can proceed. 14 downstream workflows are paused and cannot advance until this approval is granted.',
    auditTrail: [
      { action: 'Routed to Thomas G.', by: 'HTL Pack', at: '9:14 AM' },
      { action: 'Escalated from Ops queue', by: 'System', at: '8:02 AM' },
      { action: 'Document uploaded', by: 'DIAN Connector', at: '7:55 AM' },
    ],
    quickActions: { primary: 'Approve', secondary: ['Review', 'Reject'] },
    // D3 Package modifier — Promotion is Adjudicate + multi-item package
    package: {
      items: [
        { id: 'pkg-1', label: 'Form 350 — quarterly frequency interpretation', description: 'DIAN resolution 2024-0419 mandates quarterly filing; monthly interpretation would create 3× overpayment exposure.' },
        { id: 'pkg-2', label: 'Schedule C — 2024 depreciation schedule', description: 'Depreciation figures match asset register as of Q2 close; no adjustments required.' },
        { id: 'pkg-3', label: 'Annex B — supporting evidence index', description: 'All 7 cited regulatory references resolve to valid DIAN documents dated 2023–2024.' },
      ],
    },
  },

  // ── Break Glass ───────────────────────────────────────────────────────────
  { id: 'wq-5',
    wqType: 'Break Glass', severity: 'Standard', urgencyScore: 240,
    status: 'Open',
    title: 'Temp PII partition access — 2nd approval',
    studio: 'GOV', studioColor: '#7C3AED',
    eventCategory: 'gov-break-glass',
    blastRadius: 2,
    dueLabel: 'Awaiting 2nd sign-off', estimatedMinutes: 5,
    sourceWorkflow: 'Finance PII Governance',
    description: 'A temporary access grant to the Finance PII partition requires a second approval. The first approver was Ana Restrepo. Your sign-off is required to activate.',
    auditTrail: [
      { action: 'First approval granted', by: 'Ana Restrepo', at: 'Jul 21, 2:15 PM' },
      { action: 'Access request submitted', by: 'Felipe Vargas', at: 'Jul 21, 2:00 PM' },
    ],
    quickActions: { primary: 'Approve', secondary: ['Reject', 'Escalate'] },
    // D3 Quorum modifier — Break Glass requires multi-approver gate
    quorum: {
      required: 2,
      declineRule: 'Any approver may deny',
      deadline: '2026-07-31T18:00:00',
      approvers: [
        { name: 'Ana Restrepo', role: 'Revenue Ops Lead', signed: true,  signedAt: 'Jul 21, 2:15 PM' },
        { name: 'Thomas G.',    role: 'Governance Lead',  signed: false, signedAt: null },
      ],
    },
  },

  // ── Operations ────────────────────────────────────────────────────────────
  { id: 'wq-6',
    wqType: 'Operations', severity: 'Standard', urgencyScore: 180,
    status: 'Open',
    title: 'Submit Q3 revenue forecast',
    studio: 'TASK', studioColor: '#D97706',
    eventCategory: 'task',
    blastRadius: 0,
    dueLabel: 'Due today · 12:00 PM', estimatedMinutes: 20,
    sourceWorkflow: null,
    description: 'Complete and submit the Q3 revenue forecast to the RevOps dashboard before 12:00 PM. The forecast template is pre-filled from last quarter.',
    auditTrail: [
      { action: 'Task created from forecast template', by: 'RevOps System', at: 'Jul 25, 9:00 AM' },
      { action: 'Assigned to Thomas G.', by: 'Ana Restrepo', at: 'Jul 25, 9:02 AM' },
    ],
    quickActions: { primary: 'Open task', secondary: ['Assign'] },
  },
  { id: 'wq-3',
    wqType: 'Operations', severity: 'Standard', urgencyScore: 2880,
    status: 'Awaiting External',
    title: 'Acme Corp — NPS Trend widget schema drift',
    studio: 'DATA', studioColor: '#0284C7',
    eventCategory: 'gov-change-request',
    blastRadius: 3,
    dueLabel: 'Stale · 2 days blocked', estimatedMinutes: 8,
    sourceWorkflow: 'Survey Data View',
    description: 'The NPS Trend widget is using deprecated column "nps_raw". Remapping to "nps_score" restores the widget and the 3 dashboards that depend on it.',
    auditTrail: [
      { action: 'Schema drift detected', by: 'Data Studio', at: 'Jul 20, 3:12 PM' },
    ],
    quickActions: { primary: 'Remap now', secondary: ['Escalate'] },
  },
  { id: 'wq-10',
    wqType: 'Operations', severity: 'Standard', urgencyScore: 20160,
    status: 'Open',
    title: 'ISO 27001 audit prep — 2 weeks out',
    studio: 'GOV', studioColor: '#7C3AED',
    eventCategory: 'resolve',
    blastRadius: 0,
    dueLabel: 'In 2 weeks · low urgency', estimatedMinutes: 30,
    sourceWorkflow: 'Compliance Audit Tracker',
    description: 'The ISO 27001 audit begins in 2 weeks. Review the pre-audit checklist assigned to your governance role.',
    auditTrail: [
      { action: 'Audit prep checklist generated', by: 'Compliance Audit Tracker', at: 'Jul 14, 9:00 AM' },
      { action: 'Governance tasks assigned to Thomas G.', by: 'System', at: 'Jul 14, 9:05 AM' },
      { action: '2-week reminder sent', by: 'System', at: 'Jul 25, 8:00 AM' },
    ],
    quickActions: { primary: 'Review checklist', secondary: ['Escalate'] },
  },

  // ── Review ────────────────────────────────────────────────────────────────
  { id: 'wq-8',
    wqType: 'Review', severity: 'Standard', urgencyScore: 1440,
    status: 'In Progress',
    title: 'Respond to Legal — data retention policy review',
    studio: 'GOV', studioColor: '#7C3AED',
    eventCategory: 'gov-review',
    blastRadius: 0,
    dueLabel: 'Due Thursday', estimatedMinutes: 10,
    sourceWorkflow: 'Legal Compliance Flow',
    description: 'Legal requires your response on the proposed 90-day data retention policy update for agent output logs. A summary of the policy changes has been attached.',
    auditTrail: [
      { action: 'Review request submitted', by: 'Carlos Mejía', at: 'Jul 24, 3:28 PM' },
      { action: 'Linked to DIAN attestation (wq-1)', by: 'System', at: 'Jul 24, 3:31 PM' },
      { action: 'Routed to Thomas G. for sign-off', by: 'Legal Compliance Flow', at: 'Jul 24, 3:35 PM' },
    ],
    quickActions: { primary: 'Respond', secondary: ['View Details', 'Escalate'] },
  },

  // ── Train Me ──────────────────────────────────────────────────────────────
  { id: 'wq-7',
    wqType: 'Train Me', severity: 'Standard', urgencyScore: 2880,
    status: 'Open',
    title: 'Agent training feedback — 3 samples pending',
    studio: 'AGNT', studioColor: '#059669',
    eventCategory: 'train-me',
    blastRadius: 0,
    dueLabel: 'Due Friday', estimatedMinutes: 12,
    sourceWorkflow: 'CustomerSuccessPA',
    description: 'Review 3 interaction samples flagged by CustomerSuccessPA for training feedback. Your input is used to improve agent behavior on follow-up calls.',
    auditTrail: [
      { action: '3 samples flagged below confidence threshold', by: 'CustomerSuccessPA', at: 'Jul 25, 8:44 AM' },
      { action: 'Training request routed to human queue', by: 'CustomerSuccessPA', at: 'Jul 25, 8:45 AM' },
    ],
    quickActions: { primary: 'Review and Edit', secondary: ['Promote', 'Reject'] },
  },
]

// ── Type taxonomy (D2 canonical types, D3 archetypes) ────────────────────────
export const WQ_TYPE = {
  'HTL Continuation': { archetype: 'Respond'    },
  'Handoff':          { archetype: 'Accept'     },
  'Ask':              { archetype: 'Respond'    },
  'Train Me':         { archetype: 'Adjudicate' },
  'Promotion':        { archetype: 'Adjudicate' },
  'Review':           { archetype: 'Adjudicate' },
  'Break Glass':      { archetype: 'Adjudicate' },
  'Operations':       { archetype: 'Execute'    },
}

// ── Severity (D1 derived: Blocking | Standard) ───────────────────────────────
export const WQ_SEVERITY = {
  Blocking: {
    border:   'border-l-red-500',
    rowBg:    'bg-red-500/[0.03] hover:bg-red-500/[0.07] dark:bg-red-400/[0.05] dark:hover:bg-red-400/[0.09]',
    expanded: 'bg-red-500/[0.06] dark:bg-red-400/[0.08]',
    chip:     'bg-red-500/20 text-red-700 dark:bg-red-400/25 dark:text-red-400',
  },
  Standard: {
    border:   'border-l-gray-200 dark:border-l-white/[0.08]',
    rowBg:    'hover:bg-gray-50 dark:hover:bg-white/[0.02]',
    expanded: 'bg-gray-50 dark:bg-white/[0.04]',
    chip:     '',
  },
}

// ── Adjudicate types — show Approve/Reject/Correct in expanded row ───────────
export const WQ_ADJUDICATE = new Set(['Promotion', 'Review', 'Train Me', 'Break Glass'])

// ── My Team roster ───────────────────────────────────────────────────────────
export const TEAM_ROSTER = [
  { id: 'tm-1', name: 'Ana Restrepo',  role: 'Revenue Ops',  initials: 'AR',
    events: { blocking: 2, total: 11 }, ooo: false },
  { id: 'tm-2', name: 'Carlos Mejía',  role: 'Governance',   initials: 'CM',
    events: { blocking: 0, total: 8  }, ooo: false },
  { id: 'tm-3', name: 'Diana Torres',  role: 'Agent Ops',    initials: 'DT',
    events: { blocking: 1, total: 6  }, ooo: true, oooReturn: 'Aug 1' },
  { id: 'tm-4', name: 'Felipe Vargas', role: 'Data Studio',  initials: 'FV',
    events: { blocking: 0, total: 7  }, ooo: false },
  { id: 'tm-5', name: 'Isabel Niño',   role: 'Revenue Ops',  initials: 'IN',
    events: { blocking: 3, total: 6  }, ooo: false },
]

// ── Trace steps generator ────────────────────────────────────────────────────
export function traceSteps(sourceWorkflow) {
  if (!sourceWorkflow) return []
  return [
    { id: 1, label: 'Trigger',      detail: sourceWorkflow,                     status: 'done',    time: '7:55 AM' },
    { id: 2, label: 'Data fetch',   detail: 'External connector call',           status: 'done',    time: '7:56 AM' },
    { id: 3, label: 'Validation',   detail: 'Schema + policy check',             status: 'done',    time: '7:57 AM' },
    { id: 4, label: 'Human review', detail: 'Routed to work queue',              status: 'current', time: 'Now'    },
    { id: 5, label: 'Resume',       detail: 'Downstream steps resume on action', status: 'pending', time: '—'      },
    { id: 6, label: 'Audit log',    detail: 'Action recorded to ledger',         status: 'pending', time: '—'      },
  ]
}

// ── Team escalation recipients ───────────────────────────────────────────────
export const ESCALATION_RECIPIENTS = [
  { id: 'er-1', name: 'Priya Nair',      role: 'Head of Revenue Operations' },
  { id: 'er-2', name: 'Marco Reyes',     role: 'VP of Governance'           },
  { id: 'er-3', name: 'Sarah Kim',       role: 'Engineering Lead'           },
  { id: 'er-4', name: 'RevOps Group',    role: 'Group · 8 members'          },
  { id: 'er-5', name: 'Compliance Team', role: 'Group · 4 members'          },
]
