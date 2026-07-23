// Pending Outputs — workflow-generated items awaiting human review
// Status: ready | adjusted | requires_approval | advanced (done)

export const AUTHORITY = {
  verified: {
    id: 'verified',
    label: 'Verified Truth',
    description: 'From a system of record — CRM, financial system, or attested data store. Highest confidence.',
    iconName: 'ShieldCheck',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/20',
  },
  authoritative: {
    id: 'authoritative',
    label: 'Authoritative Reference',
    description: 'From a trusted secondary source — official document, policy, or verified external data.',
    iconName: 'BookOpen',
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/20',
  },
  supporting: {
    id: 'supporting',
    label: 'Supporting Context',
    description: 'From AI synthesis, market data, or indirect inference. Use as context, not a single source of truth.',
    iconName: 'Info',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/20',
  },
}

export const SEED_OUTPUTS = [
  {
    id: 'po-1',
    title: 'Q3 Pipeline Forecast — July Revision',
    producingWorkflow: 'Monthly Forecast Roll-up',
    status: 'ready',
    statusLabel: 'Ready for review',
    when: '12m ago',
    authoritySummary: 'verified',
    groundingSuperseded: false,
    preview: {
      summary:
        'The July revision projects $1.84M in closed-won for Q3, representing 115% of the $1.6M quota. Weighted pipeline stands at $3.8M (2.4× coverage). Six deals totaling $420K are flagged at risk.',
      fields: [
        { id: 'pof-1', label: 'Closed-won projection', value: '$1.84M', authority: 'verified', source: 'Salesforce CRM', attestedDate: 'Jul 18, 2026', version: 'v3.1' },
        { id: 'pof-2', label: 'Quota target', value: '$1.60M', authority: 'verified', source: 'Finance DB — Q3 Plan', attestedDate: 'Jul 1, 2026', version: 'v1.0' },
        { id: 'pof-3', label: 'Pipeline coverage', value: '2.4×', authority: 'verified', source: 'Salesforce CRM + Finance DB', attestedDate: 'Jul 18, 2026', version: 'v3.1' },
        { id: 'pof-4', label: 'At-risk deals', value: '6 deals / $420K', authority: 'authoritative', source: 'Deal risk model (activity-based)', attestedDate: 'Jul 18, 2026', version: 'v2.0' },
        { id: 'pof-5', label: 'Market growth assumption', value: '8% YoY', authority: 'supporting', source: 'Analyst synthesis (Gartner + internal)', attestedDate: 'Jun 2026', version: 'v1.0' },
      ],
    },
  },
  {
    id: 'po-2',
    title: 'Acme Corp Renewal Contract Draft v2',
    producingWorkflow: 'Renewals Outreach',
    status: 'adjusted',
    statusLabel: 'Adjusted — pending advance',
    when: '1h ago',
    authoritySummary: 'authoritative',
    groundingSuperseded: false,
    preview: {
      summary:
        'Renewal draft for Acme Corp — 12% uplift on the $85K annual plan with Net-45 payment terms as requested. Incorporates customer-requested changes from the Jul 14 call.',
      fields: [
        { id: 'pof-1', label: 'Contract value', value: '$95,200 / year', authority: 'verified', source: 'Salesforce — Deal #D-3092', attestedDate: 'Jul 14, 2026', version: 'v2.0' },
        { id: 'pof-2', label: 'Uplift applied', value: '12%', authority: 'authoritative', source: 'Renewal pricing policy (SAL-11)', attestedDate: 'Jan 2026', version: 'v3.0' },
        { id: 'pof-3', label: 'Payment terms', value: 'Net-45 (non-standard)', authority: 'authoritative', source: 'Customer request — Jul 14 call notes', attestedDate: 'Jul 14, 2026', version: 'v1.0' },
        { id: 'pof-4', label: 'Competitive benchmark', value: 'Within market band', authority: 'supporting', source: 'Market Intel synthesis', attestedDate: 'Jul 2026', version: 'v1.0' },
      ],
    },
  },
  {
    id: 'po-3',
    title: 'DIAN Intake Package #48',
    producingWorkflow: 'DIAN Compliance Intake',
    status: 'requires_approval',
    statusLabel: 'Requires approval: Sales Manager',
    when: '2h ago',
    authoritySummary: 'verified',
    groundingSuperseded: true,
    groundingUpdateNote:
      'DIAN published Circular 012-2026 on Jul 22. The "Reporting deadline" has been updated from Jul 31 to Aug 15. Review the updated field below.',
    preview: {
      summary:
        'Compliance package for DIAN Resolution 048-2026. Extracts 3 obligations with deadlines. Reporting deadline updated per Circular 012-2026 (Jul 22).',
      fields: [
        { id: 'pof-1', label: 'Resolution reference', value: 'DIAN 048-2026', authority: 'verified', source: 'DIAN Portal (official)', attestedDate: 'Jul 15, 2026', version: 'v1.0' },
        { id: 'pof-2', label: 'Reporting deadline', value: 'Aug 15, 2026', authority: 'verified', source: 'DIAN Circular 012-2026 (updated Jul 22)', attestedDate: 'Jul 22, 2026', version: 'v2.0', superseded: true, previousValue: 'Jul 31, 2026' },
        { id: 'pof-3', label: 'Obligations extracted', value: '3 items', authority: 'authoritative', source: 'Compliance DB — obligation extractor', attestedDate: 'Jul 15, 2026', version: 'v2.1' },
        { id: 'pof-4', label: 'Risk classification', value: 'Medium', authority: 'supporting', source: 'Risk model v2 (internal)', attestedDate: 'Jul 15, 2026', version: 'v1.0' },
      ],
    },
  },
  {
    id: 'po-4',
    title: 'Support Queue Summary — Jul 22',
    producingWorkflow: 'Support Summary PA',
    status: 'advanced',
    statusLabel: 'Advanced',
    when: 'Yesterday',
    authoritySummary: 'verified',
    groundingSuperseded: false,
    preview: {
      summary:
        'Daily summary for Jul 22. 37 tickets opened, 29 closed. Top driver: API rate limit errors (18 tickets). P1 open: 0.',
      fields: [
        { id: 'pof-1', label: 'Tickets opened', value: '37', authority: 'verified', source: 'Zendesk — Jul 22', attestedDate: 'Jul 22, 2026', version: 'v1.0' },
        { id: 'pof-2', label: 'Tickets closed', value: '29', authority: 'verified', source: 'Zendesk — Jul 22', attestedDate: 'Jul 22, 2026', version: 'v1.0' },
        { id: 'pof-3', label: 'Top issue', value: 'API rate limits (18 tickets)', authority: 'authoritative', source: 'JIRA triage — auto-classified', attestedDate: 'Jul 22, 2026', version: 'v1.4' },
      ],
    },
  },
]
