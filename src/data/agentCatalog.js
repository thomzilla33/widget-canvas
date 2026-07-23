// Agent catalog mock data — Single Agents (PA-style) and Workflow Agents
// No technical metadata (model, node counts) — plain-language descriptions only

export const AGENT_CATALOG = {
  single: [
    {
      id: 'sa-revenue',
      name: 'Revenue Insight PA',
      description: 'Answers questions about pipeline health, quota attainment, and deal forecasting using your CRM and financial data.',
      grounded: true,
      groundingSource: 'Salesforce CRM · Finance DB · Data Studio',
      groundingDate: 'Attested Jul 18, 2026',
      groundingVersion: 'v3.1',
      status: 'active',
      examplePrompts: [
        "What's our Q3 pipeline coverage vs. quota?",
        'Which deals are at risk of slipping this quarter?',
        'How does current ARR compare to last month?',
      ],
      cannedAnswer: {
        question: "What's our Q3 pipeline coverage vs. quota?",
        answer:
          'Q3 pipeline coverage stands at 2.4× quota ($3.8M pipeline against $1.6M quota). Weighted pipeline is $2.1M, giving 131% coverage. 6 deals totaling $420K are flagged as at-risk based on last activity > 21 days.',
        citations: ['Salesforce – updated 2h ago', 'Finance DB – Q3 targets confirmed Jul 1'],
      },
    },
    {
      id: 'sa-people',
      name: 'People Ops PA',
      description: 'Finds HR policies, answers compliance questions, and helps draft people-related communications for managers.',
      grounded: true,
      groundingSource: 'HR Policy Hub · Employee Handbook v2026',
      groundingDate: 'Attested Jul 10, 2026',
      groundingVersion: 'v2.0',
      status: 'active',
      examplePrompts: [
        "What's the policy on remote work reimbursements?",
        'Draft a performance improvement plan intro for a sales rep.',
        "What's the notice period for contractor termination?",
      ],
      cannedAnswer: {
        question: "What's the policy on remote work reimbursements?",
        answer:
          'Remote employees are eligible for a $75/month internet stipend and a one-time $500 home office setup allowance (approved via Expenses → Remote Setup). Equipment must be purchased within 90 days of hire or a role change to remote. Receipts required; no cash reimbursement.',
        citations: ['Employee Handbook §4.2 – updated Jun 2026', 'Finance: Expense Policy v3 – Jul 1, 2026'],
      },
    },
    {
      id: 'sa-support',
      name: 'Support Summary PA',
      description: 'Summarizes open ticket queues, surfaces escalation risk, and drafts triage notes for support leads.',
      grounded: true,
      groundingSource: 'Zendesk · JIRA Service Desk',
      groundingDate: 'Attested Jul 21, 2026',
      groundingVersion: 'v1.4',
      status: 'active',
      examplePrompts: [
        'What are the top 3 issues driving ticket volume this week?',
        'Which customers have had more than 3 open tickets in 30 days?',
        'Draft a triage note for the Initech data-deletion ticket.',
      ],
      cannedAnswer: {
        question: 'What are the top 3 issues driving ticket volume this week?',
        answer:
          "This week's top drivers: (1) API rate limit errors — 18 tickets, mostly enterprise tier; (2) Billing portal login failures — 11 tickets, likely related to the Jul 19 SSO change; (3) Data export timeouts — 8 tickets, all linked to the Umbrella-segment cohort. Combined these represent 62% of this week's volume.",
        citations: ['Zendesk – last synced 15m ago', 'JIRA Service Desk – last synced 1h ago'],
      },
    },
    {
      id: 'sa-contract',
      name: 'Contract Draft PA',
      description: 'Drafts, reviews, and redlines contracts using your approved legal templates and historical agreement data.',
      grounded: true,
      groundingSource: 'Legal Vault · Template Library v2026',
      groundingDate: 'Attested Jul 5, 2026',
      groundingVersion: 'v2.2',
      status: 'active',
      examplePrompts: [
        'Draft a renewal NDA for Globex Corp.',
        'Redline this MSA against our standard terms.',
        "What payment terms did we use for Hooli's last contract?",
      ],
      cannedAnswer: {
        question: "What payment terms did we use for Hooli's last contract?",
        answer:
          "Hooli's most recent contract (signed Mar 2026) used Net-30 payment terms with a 1.5% monthly late fee. The deal included an annual pre-payment discount of 8% applied at signing. Contract #CTR-2026-0084.",
        citations: ['Legal Vault – Contract #CTR-2026-0084', 'Signed Mar 14, 2026'],
      },
    },
    {
      id: 'sa-market',
      name: 'Market Intel PA',
      description: 'Compiles competitive intelligence from news, public filings, and industry data to support strategic decisions.',
      grounded: false,
      groundingSource: null,
      groundingDate: null,
      groundingVersion: null,
      status: 'unavailable',
      unavailableReason:
        'External data connectors are being configured by your admin team. Expected availability: Aug 2026.',
      examplePrompts: [
        "What did our main competitor announce at their last earnings?",
        'How is our pricing positioned against the market?',
        'Which prospects are expanding headcount in our ICP?',
      ],
    },
  ],
  workflow: [
    {
      id: 'wf-renewals',
      name: 'Renewals Outreach',
      description:
        'Identifies accounts approaching renewal, generates personalized outreach sequences, and tracks response rates — producing a full package for your review before any message is sent.',
      grounded: true,
      groundingSource: 'Salesforce · Email Templates · CRM History',
      groundingDate: 'Attested Jul 20, 2026',
      groundingVersion: 'v4.0',
      status: 'active',
      examplePrompts: [
        'Generate renewal outreach for accounts expiring in the next 60 days.',
        'Run a win-back sequence for churned accounts from Q2.',
        'Produce a renewal risk report for accounts with NPS < 6.',
      ],
      outputKind: 'Outreach package',
    },
    {
      id: 'wf-dian',
      name: 'DIAN Compliance Intake',
      description:
        'Processes incoming regulatory documents, extracts obligations and deadlines, routes approvals, and produces a compliance package for your sign-off.',
      grounded: true,
      groundingSource: 'DIAN Portal · Compliance DB · Governance Rules',
      groundingDate: 'Attested Jul 15, 2026',
      groundingVersion: 'v2.1',
      status: 'active',
      examplePrompts: [
        'Process the new resolution uploaded this morning.',
        'What obligations from last month are still open?',
        'Generate a compliance status report for the audit.',
      ],
      outputKind: 'Compliance package',
    },
    {
      id: 'wf-forecast',
      name: 'Monthly Forecast Roll-up',
      description:
        'Aggregates CRM data, applies confidence bands by deal stage, reconciles with finance targets, and produces the monthly forecast package ready for your review.',
      grounded: true,
      groundingSource: 'Salesforce · Finance DB · Forecast Models',
      groundingDate: 'Attested Jul 18, 2026',
      groundingVersion: 'v3.0',
      status: 'active',
      examplePrompts: [
        'Generate the July forecast roll-up.',
        'Compare this month\'s forecast to the plan.',
        'Run a sensitivity analysis at 80% pipeline conversion.',
      ],
      outputKind: 'Forecast package',
    },
  ],
}
