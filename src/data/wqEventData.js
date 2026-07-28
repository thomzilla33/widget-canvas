// Rich per-event mock payloads for Work Queue decision surfaces
export const WQ_EVENT_DATA = {

  // ── wq-1 · gov-promotion ────────────────────────────────────────────────────
  'wq-1': {
    sourceRef: 'DIAN-4821',
    destination: 'KCON Legal Queue',
    pipelineSteps: [
      { id: 'ps-1', label: 'Indexing',         status: 'complete' },
      { id: 'ps-2', label: 'Claim Detection',   status: 'complete' },
      { id: 'ps-3', label: 'Conflict Check',    status: 'active'   },
      { id: 'ps-4', label: 'KCON Routing',      status: 'pending'  },
    ],
    claims: [
      { id: 'CLM-001', text: 'The applicable withholding rate for cross-border service providers under DIAN Resolution 2024-0419 is 3.5%.', confidence: 0.94, conflict: false },
      { id: 'CLM-002', text: 'Electronic invoicing is mandatory for all transactions exceeding COP 3,500,000.', confidence: 0.88, conflict: false },
      { id: 'CLM-003', text: 'The reporting frequency for DIAN Form 350 is quarterly.', confidence: 0.79, conflict: true },
      { id: 'CLM-004', text: 'Penalties for late submission range from 0.5% to 5% of the reported income.', confidence: 0.82, conflict: false },
    ],
    conflicts: [
      {
        claimId: 'CLM-003',
        sourceA: { name: 'DIAN Resolution 2024-0419', value: 'Quarterly', lastVerified: '2024-09-01' },
        sourceB: { name: 'Financial Policy Manual v8', value: 'Monthly', lastVerified: '2024-07-15' },
      },
    ],
  },

  // ── wq-2 · htl-continuation ─────────────────────────────────────────────────
  'wq-2': {
    agent: 'SalesForecastPA',
    model: 'GE-Comms-v2.1',
    confidence: 0.71,
    geClass: 'GE-COMM',
    draftEmail: {
      to: 'james.wilson@acmecorp.com',
      subject: 'Q3 Forecast Summary — Acme Corp',
      body: `Dear James,

I'm following up on our Q3 revenue forecast discussion. Based on the latest data:

• Projected Q3 revenue: $2.4M (+12% YoY)
• Pipeline coverage: 2.3x
• At-risk deals: 3 (combined value $340K)

I'd recommend scheduling a 30-minute review call to align on the at-risk deals before quarter close. Would Thursday or Friday work?

Best regards,
Thomas`,
    },
  },

  // ── wq-3 · gov-change-request ───────────────────────────────────────────────
  'wq-3': {
    submitter: 'Ana Restrepo',
    submitterRole: 'Revenue Ops Lead',
    submittedAt: '2026-07-20T14:30:00Z',
    rationale: 'The deprecated "nps_raw" column was renamed to "nps_score" in the Salesforce Spring \'26 update. All dependent widgets must remap the field to restore data continuity.',
    changeType: 'Schema field remap',
    sourceA: { name: 'NPS Widget (current)', value: 'nps_raw', confidence: 0.55, owner: 'Survey Data Pipeline' },
    sourceB: { name: 'Salesforce Spring \'26', value: 'nps_score', confidence: 0.97, owner: 'Salesforce Connector' },
    affectedAgents: ['NPS Tracker Agent', 'Customer Health Bot'],
    canonRecord: 'FIELD-MAP-NPS-001',
  },

  // ── wq-4 · htl-handoff ──────────────────────────────────────────────────────
  'wq-4': {
    entityName: 'Model Routing Pack v4 — production endpoints',
    recordId: 'MR-PACK-4.2.1',
    sourceSystem: 'Model Registry Deprecation Alert',
    handoffReason: 'Automated remediation is blocked: endpoint contracts changed and require manual verification before the routing pack can be updated.',
    keyFacts: [
      '3 of 6 routing endpoints return 410 Gone after Aug 1, 2026',
      'Fallback model (GPT-4o-mini) does not support tool use — cannot be auto-substituted',
      'Current pack processes ~3,200 calls/day across 6 agents',
    ],
    recommendations: [
      'Review the new endpoint contracts in the Model Registry',
      'Update routing logic to use claude-opus-5 for tool-use paths',
      'Re-test agent flows in staging before cutover',
    ],
    crmRecord: 'MODEL-REG-AUG26',
  },

  // ── wq-5 · gov-break-glass ──────────────────────────────────────────────────
  'wq-5': {
    requestor: 'Felipe Vargas',
    requestorRole: 'Data Studio Lead',
    requestTime: '2026-07-21T14:00:00Z',
    targetPartition: 'Finance · PII — Identity Records',
    partitionClassification: 'Restricted — PII',
    accessScope: 'Read-only',
    duration: '4 hours',
    justification: 'Incident FIN-2026-0721: Production reconciliation pipeline is failing due to a missing identity mapping for 3 enterprise accounts. Read access needed to trace and patch the lookup table.',
    incidentRef: 'FIN-2026-0721',
    firstApprover: 'Ana Restrepo',
    firstApprovalTime: '2026-07-21T14:15:00Z',
    approvalRequired: 2,
    approvalReceived: 1,
    lastBreakGlass: {
      date: '2026-05-02',
      requester: 'Carlos Mejía',
      outcome: 'Approved — no incidents, access expired cleanly',
    },
  },

  // ── wq-7 · train-me ─────────────────────────────────────────────────────────
  'wq-7': {
    submitter: 'CustomerSuccessPA',
    submitterRole: 'Agent (automated)',
    note: 'Three follow-up call transcripts scored below confidence threshold. Human feedback needed to improve call-close detection.',
    currentValue: '72%',
    proposedValue: '85%',
    canonRecord: 'CALL-SCORE-MODEL-Q3',
    affectedAgents: ['CustomerSuccessPA v3', 'SalesFollowUpBot'],
    samples: [
      { id: 'S-A', label: 'Sample A', summary: 'Call ended with "let me think about it" — model scored as No Decision (current: 72% conf)' },
      { id: 'S-B', label: 'Sample B', summary: 'Prospect asked for contract — model scored as Interested (current: 88% conf)' },
      { id: 'S-C', label: 'Sample C', summary: 'Hard price objection, call ended — model scored as Lost (current: 65% conf)' },
    ],
  },

  // ── wq-8 · gov-review ───────────────────────────────────────────────────────
  'wq-8': {
    requestedBy: { name: 'Carlos Mejía', role: 'Governance Lead' },
    requestReason: 'The proposed 90-day retention update conflicts with our current 180-day archive policy. I need Legal Ops sign-off before I can attest to either claim.',
    linkedProposal: { id: 'wq-1', title: 'Agent Output Logs — Data Retention Policy Review' },
    claims: [
      { id: 'CLM-R01', text: '90-day retention is sufficient for agent output logs under current regulatory requirements.', confidence: 0.73, conflict: true },
      { id: 'CLM-R02', text: 'Logs older than 90 days may be permanently deleted without audit obligation.', confidence: 0.68, conflict: false },
    ],
    conflicts: [
      {
        claimId: 'CLM-R01',
        sourceA: { name: 'Legal Policy Brief 2026-Q2', value: '90 days', lastVerified: '2026-06-01' },
        sourceB: { name: 'Internal Archive Policy v3', value: '180 days', lastVerified: '2026-01-15' },
      },
    ],
  },

  // ── wq-11 · client-continuation ─────────────────────────────────────────────
  'wq-11': {
    entityName: 'Marcus Webb — Contoso Ltd',
    recordId: 'OPP-88312',
    sourceSystem: 'SupportBot v2 — Enterprise Trial',
    agent: 'SupportBot v2',
    model: 'GE-Comms-v2.1',
    confidence: 0.68,
    geClass: 'GE-COMM',
    keyFacts: [
      'Active trial: 45 days remaining, 12 users onboarded',
      'Primary concern: SSO integration with existing Okta setup',
      'Last touchpoint: Product demo on Jul 15 — positive NPS',
    ],
    draftEmail: {
      to: 'marcus.webb@contoso.com',
      subject: 'Re: Enterprise Platform Trial — Next Steps',
      body: `Hi Marcus,

Thank you for your interest in the Enterprise Platform. Based on your requirements, I've prepared a tailored proposal:

• 200-seat Enterprise license: $180,000/year
• Dedicated onboarding support (3 months included)
• Custom SLA: 99.9% uptime guaranteed

I'd love to schedule a 45-minute call to walk through the details. Would next Tuesday at 2pm ET work for you?

Looking forward to connecting,
Thomas`,
    },
  },

  // ── wq-12 · client-handoff ──────────────────────────────────────────────────
  'wq-12': {
    entityName: 'Marcus Webb — Contoso Ltd',
    recordId: 'OPP-88312',
    sourceSystem: 'VCard Webchat Session',
    handoffReason: 'Customer explicitly requested a human after 3 agent turns. Sentiment shifted from positive to concerned.',
    keyFacts: [
      'Active trial: 45 days remaining, 12 users onboarded',
      'Primary concern: SSO integration with existing Okta setup',
      'Last touchpoint: Product demo on Jul 15 — positive feedback',
    ],
    recommendations: [
      'Open with acknowledgment of the SSO concern — it\'s the blocker',
      'Loop in Solutions Engineering for a technical scoping call',
      'Offer trial extension to reduce time pressure',
    ],
    crmRecord: 'CRM-88312',
  },

  // ── wq-13 · inbound-question ─────────────────────────────────────────────────
  'wq-13': {
    thread: {
      status: 'open',
      initiatorId: 'customer-rachel',
      participants: ['customer-rachel', 'user-thomas'],
      comments: [
        {
          id: 'c-1',
          authorId: 'customer-rachel',
          authorName: 'Rachel Kim',
          authorRole: 'Procurement Manager · Acme Corp',
          timestamp: '2h ago',
          channel: 'webchat',
          body: `Hi, I was reviewing the enterprise trial agreement and I noticed the SLA guarantees 99.9% uptime, but the addendum references 99.5%. Which one is contractually binding? We need this clarified before we can sign off on the expansion — our legal team is specifically asking about the discrepancy.`,
        },
      ],
    },
  },
}
