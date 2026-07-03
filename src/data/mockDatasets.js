// Entity-keyed realistic mock datasets for the Widget Playground live preview.
// Each entity kind exposes row-level records (table/list/board/feed/alerts) and
// breakdown category labels so the preview reflects the actual domain rather than
// generic "Segment A/B/C/D" placeholders.
//
// entityKindFor()  — resolves a normalized kind from source/metric/datasetConfig.
// entityDataset()  — returns the dataset for a kind, or null when unknown.

import { PRESET_DATASETS } from './datasets.js'

// ── Kind resolver ────────────────────────────────────────────────────────────

function normalizeId(id = '') {
  const s = id.toLowerCase()
  if (s.startsWith('contacts'))     return 'contacts'
  if (s.startsWith('accounts') || s.startsWith('customers') || s.startsWith('companies')) return 'accounts'
  if (s.startsWith('deals') || s.startsWith('opportunities')) return 'deals'
  if (s.startsWith('tickets') || s.startsWith('cases') || s.startsWith('issues')) return 'tickets'
  if (s.startsWith('employees') || s.startsWith('staff') || s.startsWith('team_')) return 'employees'
  if (s.startsWith('activities')) return 'activities'
  if (s.startsWith('vehicles')) return 'vehicles'
  if (s.startsWith('conversations')) return 'conversations'
  if (s.startsWith('invoices') || s.startsWith('bills')) return 'invoices'
  if (s.startsWith('orders')) return 'orders'
  return null
}

const ENT_ID_KIND = {
  'ent-customers': 'accounts',
  'ent-contacts':  'contacts',
  'ent-deals':     'deals',
  'ent-tickets':   'tickets',
  'ent-employees': 'employees',
  'ent-conversations': 'conversations',
}

const RS_ENTITY_TYPE_KIND = {
  Customer: 'accounts', Contact: 'contacts', Deal: 'deals', Ticket: 'tickets',
  Employee: 'employees', Conversation: 'conversations', Invoice: 'invoices', Order: 'orders',
}

// Resolve from the three possible context sources (DatasetStep, legacy source+metric, or
// MODEL_ENTITIES). Returns null for unknown ids — caller falls back to name-based heuristics.
export function entityKindFor({ source, metric, datasetConfig } = {}) {
  const dsId = datasetConfig?.sourceId || ''
  if (dsId) {
    const k = normalizeId(dsId) || ENT_ID_KIND[dsId]
    if (k) return k
    // Preset dataset ids (ds-contacts-by-tier, etc.) carry a source field with the kind.
    const preset = PRESET_DATASETS.find((p) => p.id === dsId)
    if (preset?.source) return preset.source
  }
  const srcId = source?.id || ''
  if (srcId) {
    const k = normalizeId(srcId) || ENT_ID_KIND[srcId]
    if (k) return k
  }
  if (metric?.entityType && RS_ENTITY_TYPE_KIND[metric.entityType]) {
    return RS_ENTITY_TYPE_KIND[metric.entityType]
  }
  return null
}

// ── Per-entity datasets ──────────────────────────────────────────────────────
// records[].cells — string array matching recordHeaders (used by TableView).
// breakdownCats   — label set for bar/pie/funnel/list views.
// dimLabel        — first-column header for breakdown-as-table.
// board/feed/alerts — optional overrides for those widget types.

const DATASETS = {
  contacts: {
    recordHeaders: ['Name', 'Email', 'Company', 'Status', 'Last Activity'],
    records: [
      { cells: ['Sarah Chen',      'schen@northwind.io',     'Northwind Traders',  'Active',   '2h ago'] },
      { cells: ['Marcus Webb',     'm.webb@acmecorp.com',    'Acme Corporation',   'MQL',      '1d ago'] },
      { cells: ['Priya Nair',      'priya@globex.com',       'Globex Inc.',        'Customer', '3d ago'] },
      { cells: ['Diego Alvarez',   'dalvarez@initech.io',    'Initech LLC',        'Lead',     '5d ago'] },
      { cells: ['Emma Thompson',   'e.thompson@umbrella.co', 'Umbrella Co.',       'Active',   '1w ago'] },
      { cells: ['Jae-won Oh',      'jaewon@starkind.com',    'Stark Industries',   'SQL',      '2w ago'] },
      { cells: ['Amara Diallo',    'a.diallo@wayneent.com',  'Wayne Enterprises',  'Customer', '3w ago'] },
      { cells: ['Luca Ferrari',    'lf@soylent.io',          'Soylent Corp',       'Churned',  '1mo ago'] },
    ],
    recordTotal: 18420,
    breakdownCats: ['Lead', 'MQL', 'SQL', 'Opportunity', 'Customer'],
    dimLabel: 'Lifecycle Stage',
    board: {
      statuses: ['Lead', 'MQL', 'SQL', 'Customer'],
      items: [
        { name: 'Sarah Chen',    status: 'Active'   },
        { name: 'Marcus Webb',   status: 'MQL'      },
        { name: 'Priya Nair',    status: 'Customer' },
        { name: 'Diego Alvarez', status: 'Lead'     },
        { name: 'Emma Thompson', status: 'Active'   },
        { name: 'Jae-won Oh',    status: 'SQL'      },
      ],
    },
    feed: [
      { when: '12m ago', type: 'Email',  summary: 'Opened "Q3 Business Review" email',     actor: 'Sarah Chen'    },
      { when: '1h ago',  type: 'Form',   summary: 'Submitted pricing inquiry form',        actor: 'Marcus Webb'   },
      { when: '3h ago',  type: 'Call',   summary: '18-min discovery call logged',          actor: 'Priya Nair'    },
      { when: '1d ago',  type: 'Stage',  summary: 'Moved from MQL → SQL',                 actor: 'Diego Alvarez' },
      { when: '2d ago',  type: 'Note',   summary: 'Follow-up note added by Dana Lee',     actor: 'Emma Thompson' },
    ],
    alerts: [
      { severity: 'high', message: '3 high-score leads uncontacted for >7 days',          when: '2h ago' },
      { severity: 'med',  message: 'Lifecycle stage mismatch: 14 contacts flagged',       when: '5h ago' },
      { severity: 'low',  message: '42 contacts missing email address',                   when: '1d ago' },
    ],
  },

  accounts: {
    recordHeaders: ['Company', 'Industry', 'MRR', 'Tier', 'Owner'],
    records: [
      { cells: ['Acme Corporation',  'Manufacturing',      '$4,200', 'Enterprise', 'Dana Lee'   ] },
      { cells: ['Globex Inc.',        'Technology',         '$3,100', 'Enterprise', 'Sam Ortiz'  ] },
      { cells: ['Initech LLC',        'Financial Services', '$2,800', 'Pro',        'Priya Nair' ] },
      { cells: ['Umbrella Co.',       'Healthcare',         '$1,900', 'Pro',        'Marco Diaz' ] },
      { cells: ['Soylent Corp',       'CPG',                '$1,550', 'Pro',        'Dana Lee'   ] },
      { cells: ['Stark Industries',   'Aerospace',          '$6,400', 'Enterprise', 'Sam Ortiz'  ] },
      { cells: ['Wayne Enterprises',  'Conglomerate',       '$8,200', 'Enterprise', 'Dana Lee'   ] },
      { cells: ['Dunder Mifflin',     'Paper & Office',     '$420',   'Starter',    'Marco Diaz' ] },
    ],
    recordTotal: 3842,
    breakdownCats: ['Starter', 'Pro', 'Enterprise', 'Custom'],
    dimLabel: 'Tier',
    board: {
      statuses: ['Healthy', 'At Risk', 'Churned', 'Expansion'],
      items: [
        { name: 'Acme Corporation', status: 'Healthy'   },
        { name: 'Globex Inc.',       status: 'At Risk'   },
        { name: 'Initech LLC',       status: 'Healthy'   },
        { name: 'Umbrella Co.',      status: 'Expansion' },
        { name: 'Soylent Corp',      status: 'Churned'   },
        { name: 'Stark Industries',  status: 'Healthy'   },
      ],
    },
    feed: [
      { when: '30m ago', type: 'Contract', summary: 'Renewal signed — +$1,200 MRR expansion',  actor: 'Stark Industries' },
      { when: '2h ago',  type: 'Alert',    summary: 'NPS score dropped to 4 — follow-up sent', actor: 'Globex Inc.'      },
      { when: '1d ago',  type: 'Upsell',   summary: 'Upgraded from Pro to Enterprise',         actor: 'Umbrella Co.'     },
      { when: '3d ago',  type: 'Churn',    summary: 'Cancellation request submitted',          actor: 'Soylent Corp'     },
      { when: '5d ago',  type: 'QBR',      summary: 'Q3 Business Review completed — 9/10',     actor: 'Acme Corporation' },
    ],
    alerts: [
      { severity: 'high', message: 'Globex Inc. — renewal in 14 days, health score 42',    when: '1h ago' },
      { severity: 'high', message: '2 accounts with 3+ unresolved critical tickets',       when: '3h ago' },
      { severity: 'med',  message: 'Soylent Corp cancellation — no save attempt logged',   when: '5h ago' },
    ],
  },

  deals: {
    recordHeaders: ['Deal Name', 'Stage', 'Amount', 'Owner', 'Close Date'],
    records: [
      { cells: ['Acme — Platform Expansion',  'Negotiation', '$420,000', 'Dana Lee',   'Jul 15'] },
      { cells: ['Globex — Enterprise Renewal','Proposal',    '$310,000', 'Sam Ortiz',  'Jul 22'] },
      { cells: ['Initech — New Logo',          'Qualified',   '$185,000', 'Priya Nair', 'Aug 03'] },
      { cells: ['Umbrella — Upsell',           'Prospecting', '$92,000',  'Marco Diaz', 'Aug 18'] },
      { cells: ['Stark — Multi-year',          'Closed Won',  '$640,000', 'Dana Lee',   'Jun 30'] },
      { cells: ['Wayne — New Logo',            'Discovery',   '$520,000', 'Sam Ortiz',  'Sep 01'] },
      { cells: ['Dunder — Pilot',              'Proposal',    '$28,000',  'Marco Diaz', 'Aug 10'] },
      { cells: ['Oscorp — Expansion',          'Negotiation', '$240,000', 'Priya Nair', 'Jul 28'] },
    ],
    recordTotal: 284,
    breakdownCats: ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'],
    dimLabel: 'Stage',
    board: {
      statuses: ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'],
      items: [
        { name: 'Acme — Expansion',  status: 'Negotiation' },
        { name: 'Globex — Renewal',  status: 'Proposal'    },
        { name: 'Initech — Logo',    status: 'Qualified'   },
        { name: 'Umbrella — Upsell', status: 'Prospecting' },
        { name: 'Stark — Multi-yr',  status: 'Closed Won'  },
        { name: 'Wayne — Logo',      status: 'Qualified'   },
      ],
    },
    feed: [
      { when: '1h ago',  type: 'Stage', summary: 'Moved Proposal → Negotiation',           actor: 'Acme — Expansion'  },
      { when: '3h ago',  type: 'Call',  summary: 'Demo call — champion confirmed budget',   actor: 'Globex — Renewal'  },
      { when: '1d ago',  type: 'Win',   summary: 'Closed Won — $640K multi-year contract', actor: 'Stark — Multi-year'},
      { when: '2d ago',  type: 'Note',  summary: 'Procurement review started',             actor: 'Wayne — New Logo'  },
      { when: '3d ago',  type: 'Risk',  summary: 'Champion left — re-qualification needed',actor: 'Oscorp — Expansion'},
    ],
    alerts: [
      { severity: 'high', message: '2 deals slipping past close date with no activity',   when: '2h ago' },
      { severity: 'high', message: 'Globex renewal at risk — decision maker unresponsive',when: '5h ago' },
      { severity: 'med',  message: 'Pipeline coverage at 2.1× — below 3× target',        when: '1d ago' },
    ],
  },

  tickets: {
    recordHeaders: ['Subject', 'Priority', 'Status', 'Assignee', 'Channel'],
    records: [
      { cells: ['Login fails after SSO update',        'Critical', 'Open',        'Jordan Kim',  'Email'   ] },
      { cells: ['Billing discrepancy — invoice #4821', 'High',     'In Progress', 'Alex Rivera', 'Chat'    ] },
      { cells: ['Feature request: bulk export',         'Low',      'Open',        'Sam Patel',   'Web Form'] },
      { cells: ['API rate limit errors in production',  'High',     'Pending',     'Jordan Kim',  'API'     ] },
      { cells: ['Password reset loop on mobile',        'Medium',   'Resolved',    'Alex Rivera', 'Phone'   ] },
      { cells: ['Dashboard widgets not loading',        'High',     'Open',        'Sam Patel',   'Chat'    ] },
      { cells: ['Scheduled report never arrived',       'Medium',   'In Progress', 'Jordan Kim',  'Email'   ] },
      { cells: ['Data export timeout on large CSVs',    'Medium',   'Open',        'Alex Rivera', 'Web Form'] },
    ],
    recordTotal: 1842,
    breakdownCats: ['Critical', 'High', 'Medium', 'Low'],
    dimLabel: 'Priority',
    board: {
      statuses: ['Open', 'In Progress', 'Pending', 'Resolved'],
      items: [
        { name: 'Login fails after SSO',     status: 'Open'        },
        { name: 'Billing discrepancy #4821', status: 'In Progress' },
        { name: 'API rate limit errors',     status: 'Pending'     },
        { name: 'Password reset loop',       status: 'Resolved'    },
        { name: 'Dashboard widgets down',    status: 'Open'        },
        { name: 'Scheduled report missing',  status: 'In Progress' },
      ],
    },
    feed: [
      { when: '5m ago',  type: 'Escalation', summary: 'SLA breach — escalated to Tier 2',        actor: 'Jordan Kim'  },
      { when: '22m ago', type: 'Reply',       summary: 'Customer replied to billing ticket',      actor: 'Alex Rivera' },
      { when: '1h ago',  type: 'Resolve',     summary: 'Marked Resolved — CSAT survey sent',     actor: 'Jordan Kim'  },
      { when: '3h ago',  type: 'Assign',      summary: 'Re-assigned from backlog to Sam Patel',  actor: 'Jordan Kim'  },
      { when: '5h ago',  type: 'Note',        summary: 'Internal note: root cause identified',   actor: 'Alex Rivera' },
    ],
    alerts: [
      { severity: 'high', message: 'SLA breach risk on 3 tickets — under 30 min remaining', when: '5m ago'  },
      { severity: 'high', message: 'Critical ticket unassigned for >2 hours',               when: '1h ago'  },
      { severity: 'med',  message: 'First-response SLA missed on 8 tickets this week',      when: '3h ago'  },
    ],
  },

  employees: {
    recordHeaders: ['Name', 'Department', 'Role', 'Manager', 'Tenure'],
    records: [
      { cells: ['Dana Lee',    'Sales',     'Account Executive',  'Chris Park', '3y 2mo'] },
      { cells: ['Sam Ortiz',   'Sales',     'Senior AE',          'Chris Park', '5y 8mo'] },
      { cells: ['Jordan Kim',  'Support',   'Support Engineer',   'Riley Chen', '1y 4mo'] },
      { cells: ['Alex Rivera', 'Support',   'Tier 2 Specialist',  'Riley Chen', '2y 11mo'] },
      { cells: ['Priya Nair',  'Sales',     'SDR',                'Chris Park', '8mo']    },
      { cells: ['Marco Diaz',  'Marketing', 'Growth Manager',     'Taylor Wu',  '2y 1mo'] },
      { cells: ['Riley Chen',  'Support',   'Support Lead',       'Jamie Fox',  '4y 5mo'] },
      { cells: ['Taylor Wu',   'Marketing', 'VP Marketing',       'Jamie Fox',  '6y 3mo'] },
    ],
    recordTotal: 148,
    breakdownCats: ['Sales', 'Support', 'Marketing', 'Engineering', 'Ops'],
    dimLabel: 'Department',
    board: {
      statuses: ['Active', 'On Leave', 'Remote', 'Offboarded'],
      items: [
        { name: 'Dana Lee',    status: 'Active'  },
        { name: 'Sam Ortiz',   status: 'Remote'  },
        { name: 'Jordan Kim',  status: 'Active'  },
        { name: 'Alex Rivera', status: 'Active'  },
        { name: 'Priya Nair',  status: 'Remote'  },
        { name: 'Marco Diaz',  status: 'On Leave'},
      ],
    },
    feed: [
      { when: '1d ago',  type: 'Hire',    summary: 'New AE joined — onboarding started',          actor: 'HR'           },
      { when: '3d ago',  type: 'Promote', summary: 'Promoted to Senior AE',                       actor: 'Sam Ortiz'    },
      { when: '5d ago',  type: 'Leave',   summary: 'Parental leave started (8 weeks)',             actor: 'Marco Diaz'   },
      { when: '1w ago',  type: 'Review',  summary: 'Q2 performance review completed — 4.2/5',     actor: 'Dana Lee'     },
      { when: '2w ago',  type: 'Offboard',summary: 'Departure — licenses and data transferred',   actor: 'Former Member'},
    ],
    alerts: [
      { severity: 'med', message: '2 accounts unassigned — owner departed last week', when: '1d ago' },
      { severity: 'low', message: '5 team members with upcoming license renewals',    when: '2d ago' },
    ],
  },

  conversations: {
    recordHeaders: ['ID', 'Channel', 'Agent', 'Outcome', 'Duration'],
    records: [
      { cells: ['#C-8821', 'Chat',  'Jordan Kim',  'Resolved',   '4m 12s' ] },
      { cells: ['#C-8820', 'Voice', 'Alex Rivera', 'Escalated',  '18m 44s'] },
      { cells: ['#C-8819', 'Email', 'AI Agent',    'Resolved',   '—'      ] },
      { cells: ['#C-8818', 'Chat',  'Sam Patel',   'Transferred','6m 01s' ] },
      { cells: ['#C-8817', 'Voice', 'Jordan Kim',  'Resolved',   '9m 58s' ] },
      { cells: ['#C-8816', 'Video', 'Alex Rivera', 'Resolved',   '24m 30s'] },
      { cells: ['#C-8815', 'Email', 'AI Agent',    'Resolved',   '—'      ] },
      { cells: ['#C-8814', 'Chat',  'Sam Patel',   'Abandoned',  '0m 42s' ] },
    ],
    recordTotal: 12480,
    breakdownCats: ['AI Resolved', 'Escalated to Human', 'Transferred', 'Abandoned'],
    dimLabel: 'Outcome',
    board: {
      statuses: ['Open', 'In Progress', 'Resolved', 'Abandoned'],
      items: [
        { name: '#C-8821 · Chat — Jordan Kim',   status: 'Resolved'    },
        { name: '#C-8820 · Voice — Alex Rivera', status: 'In Progress' },
        { name: '#C-8819 · Email — AI Agent',    status: 'Resolved'    },
        { name: '#C-8818 · Chat — Sam Patel',    status: 'In Progress' },
        { name: '#C-8817 · Voice — Jordan Kim',  status: 'Resolved'    },
        { name: '#C-8814 · Chat — abandoned',    status: 'Abandoned'   },
      ],
    },
    feed: [
      { when: '2m ago',  type: 'Escalation', summary: 'AI escalated — low confidence on billing dispute', actor: 'AI Agent'   },
      { when: '14m ago', type: 'Resolve',    summary: 'Chat resolved in 4m — CSAT 5/5',                  actor: 'Jordan Kim' },
      { when: '38m ago', type: 'Handoff',    summary: 'Voice → screen share — issue complex',            actor: 'Alex Rivera'},
      { when: '1h ago',  type: 'Abandon',    summary: 'Customer disconnected after 42s hold',            actor: 'Queue'      },
      { when: '2h ago',  type: 'AI',         summary: '12 consecutive chats resolved without escalation',actor: 'AI Agent'   },
    ],
    alerts: [
      { severity: 'high', message: 'Queue depth at 24 — average wait 8m 30s',             when: '3m ago'  },
      { severity: 'med',  message: 'CSAT dropped to 3.8 this hour (target: 4.5)',          when: '45m ago' },
      { severity: 'low',  message: 'AI resolution rate below 70% today — review prompts', when: '2h ago'  },
    ],
  },

  vehicles: {
    recordHeaders: ['Make / Model', 'Year', 'VIN', 'Customer', 'Status'],
    records: [
      { cells: ['Ford F-150 XLT',       '2023', '1FTFW1E89P…', 'James Tasca',   'Delivered'  ] },
      { cells: ['Lincoln Aviator',       '2024', '5LM5J7XC1R…', 'Maria Santos',  'In Service' ] },
      { cells: ['Chevrolet Silverado',   '2022', '1GC4YNE7XN…', 'Bob Cranston',  'Available'  ] },
      { cells: ['Ford Explorer',         '2024', '1FMSK8DH8R…', 'Amanda Price',  'Pending PDI'] },
      { cells: ['Ram 1500 Laramie',      '2023', '1C6SRFFT5P…', 'Tom Hadley',    'Delivered'  ] },
      { cells: ['Lincoln Nautilus',      '2024', '2LMPJ8LP3R…', 'Carol Welch',   'In Transit' ] },
      { cells: ['Ford Bronco',           '2023', '1FMDE5BH2P…', 'Greg Barton',   'Available'  ] },
      { cells: ['Chevrolet Equinox',     '2024', '2GNALBEKXR…', 'Lisa Monroe',   'In Service' ] },
    ],
    recordTotal: 642,
    breakdownCats: ['Available', 'In Service', 'In Transit', 'Delivered', 'Pending PDI'],
    dimLabel: 'Status',
    board: {
      statuses: ['Available', 'In Service', 'In Transit', 'Delivered'],
      items: [
        { name: 'Ford F-150 XLT (2023)',     status: 'Delivered'  },
        { name: 'Lincoln Aviator (2024)',     status: 'In Service' },
        { name: 'Chevrolet Silverado (2022)', status: 'Available'  },
        { name: 'Ford Explorer (2024)',       status: 'In Transit' },
        { name: 'Ram 1500 Laramie (2023)',    status: 'Delivered'  },
        { name: 'Lincoln Nautilus (2024)',    status: 'In Transit' },
      ],
    },
    alerts: [
      { severity: 'high', message: '4 vehicles overdue for PDI — delivery at risk', when: '1h ago' },
      { severity: 'med',  message: 'Floorplan aging >90 days on 3 units',           when: '3h ago' },
      { severity: 'low',  message: '7 vehicles scheduled for service this week',    when: '6h ago' },
    ],
  },

  activities: {
    recordHeaders: ['Type', 'Subject', 'Contact', 'Date', 'Outcome'],
    records: [
      { cells: ['Call',    'Discovery call — Q4 expansion',  'Sarah Chen',    'Jul 1',  'Meeting booked'  ] },
      { cells: ['Email',   'Follow-up: pricing deck',        'Marcus Webb',   'Jul 1',  'Opened'          ] },
      { cells: ['Meeting', 'QBR — Q2 review',                'Priya Nair',    'Jun 30', 'Renewal confirmed'] },
      { cells: ['SMS',     'Reminder: webinar tomorrow',     'Diego Alvarez', 'Jun 30', 'Replied'         ] },
      { cells: ['Call',    'Onboarding check-in',            'Emma Thompson', 'Jun 29', 'No answer'       ] },
      { cells: ['Email',   'Case study request',             'Jae-won Oh',   'Jun 28', 'Declined'        ] },
      { cells: ['Meeting', 'Technical evaluation',           'Amara Diallo',  'Jun 27', 'POC approved'    ] },
      { cells: ['Call',    'Win/loss interview',             'Luca Ferrari',  'Jun 26', 'Churn confirmed' ] },
    ],
    recordTotal: 5420,
    breakdownCats: ['Email', 'Call', 'Meeting', 'SMS', 'Note'],
    dimLabel: 'Type',
    board: {
      statuses: ['Email', 'Call', 'Meeting', 'SMS'],
      items: [
        { name: 'Discovery call — Q4 expansion',  status: 'Call'    },
        { name: 'Follow-up: pricing deck',        status: 'Email'   },
        { name: 'QBR — Q2 review',                status: 'Meeting' },
        { name: 'Reminder: webinar tomorrow',     status: 'SMS'     },
        { name: 'Technical evaluation',           status: 'Meeting' },
        { name: 'Case study request',             status: 'Email'   },
      ],
    },
    feed: [
      { when: '30m ago', type: 'Call',    summary: 'Discovery call logged — 22 min, next steps set', actor: 'Dana Lee'    },
      { when: '1h ago',  type: 'Email',   summary: 'Pricing deck opened (3rd time)',                  actor: 'Sarah Chen'  },
      { when: '3h ago',  type: 'Meeting', summary: 'QBR completed — renewal confirmed',               actor: 'Sam Ortiz'   },
      { when: '1d ago',  type: 'SMS',     summary: 'Webinar reminder sent — 94% open rate',           actor: 'System'      },
      { when: '2d ago',  type: 'Note',    summary: 'Internal note: champion confirmed budget',        actor: 'Priya Nair'  },
    ],
  },

  invoices: {
    recordHeaders: ['Invoice #', 'Customer', 'Amount', 'Due Date', 'Status'],
    records: [
      { cells: ['INV-2024-0442', 'Stark Industries',  '$12,800', 'Jul 15', 'Overdue'] },
      { cells: ['INV-2024-0441', 'Acme Corporation',  '$4,200',  'Jul 20', 'Sent'   ] },
      { cells: ['INV-2024-0440', 'Wayne Enterprises', '$8,200',  'Jul 22', 'Paid'   ] },
      { cells: ['INV-2024-0439', 'Globex Inc.',        '$3,100',  'Jul 10', 'Overdue'] },
      { cells: ['INV-2024-0438', 'Umbrella Co.',       '$1,900',  'Jul 8',  'Paid'   ] },
      { cells: ['INV-2024-0437', 'Initech LLC',        '$2,800',  'Jul 25', 'Draft'  ] },
      { cells: ['INV-2024-0436', 'Soylent Corp',       '$1,550',  'Jun 30', 'Paid'   ] },
      { cells: ['INV-2024-0435', 'Dunder Mifflin',     '$420',    'Jun 28', 'Paid'   ] },
    ],
    recordTotal: 284,
    breakdownCats: ['Draft', 'Sent', 'Paid', 'Overdue', 'Voided'],
    dimLabel: 'Status',
    board: {
      statuses: ['Draft', 'Sent', 'Paid', 'Overdue'],
      items: [
        { name: 'INV-2024-0442 · Stark Industries',  status: 'Overdue' },
        { name: 'INV-2024-0441 · Acme Corporation',  status: 'Sent'    },
        { name: 'INV-2024-0440 · Wayne Enterprises', status: 'Paid'    },
        { name: 'INV-2024-0439 · Globex Inc.',        status: 'Overdue' },
        { name: 'INV-2024-0437 · Initech LLC',        status: 'Draft'   },
        { name: 'INV-2024-0436 · Soylent Corp',       status: 'Paid'    },
      ],
    },
    alerts: [
      { severity: 'high', message: '2 invoices overdue >14 days — total $15,900',      when: '1h ago' },
      { severity: 'med',  message: '4 invoices due this week — $12,000 outstanding',   when: '3h ago' },
      { severity: 'low',  message: 'Invoice INV-2024-0437 still in Draft — follow up', when: '1d ago' },
    ],
  },

  orders: {
    recordHeaders: ['Order #', 'Customer', 'Total', 'Date', 'Status'],
    records: [
      { cells: ['ORD-8821', 'Acme Corporation',  '$4,850',  'Jul 1',  'Fulfilled' ] },
      { cells: ['ORD-8820', 'Stark Industries',  '$12,200', 'Jul 1',  'Processing'] },
      { cells: ['ORD-8819', 'Globex Inc.',        '$2,400',  'Jun 30', 'Shipped'   ] },
      { cells: ['ORD-8818', 'Wayne Enterprises', '$9,600',  'Jun 29', 'Fulfilled' ] },
      { cells: ['ORD-8817', 'Umbrella Co.',       '$1,200',  'Jun 28', 'Cancelled' ] },
      { cells: ['ORD-8816', 'Initech LLC',        '$3,300',  'Jun 28', 'Processing'] },
      { cells: ['ORD-8815', 'Soylent Corp',       '$800',    'Jun 27', 'Shipped'   ] },
      { cells: ['ORD-8814', 'Dunder Mifflin',     '$320',    'Jun 27', 'Fulfilled' ] },
    ],
    recordTotal: 1284,
    breakdownCats: ['Processing', 'Shipped', 'Fulfilled', 'Cancelled', 'Returned'],
    dimLabel: 'Status',
    board: {
      statuses: ['Processing', 'Shipped', 'Fulfilled', 'Cancelled'],
      items: [
        { name: 'ORD-8821 · Acme Corporation',  status: 'Fulfilled'  },
        { name: 'ORD-8820 · Stark Industries',  status: 'Processing' },
        { name: 'ORD-8819 · Globex Inc.',        status: 'Shipped'    },
        { name: 'ORD-8818 · Wayne Enterprises', status: 'Fulfilled'  },
        { name: 'ORD-8817 · Umbrella Co.',       status: 'Cancelled'  },
        { name: 'ORD-8816 · Initech LLC',        status: 'Processing' },
      ],
    },
    alerts: [
      { severity: 'high', message: '1 order cancelled — $1,200 revenue at risk',          when: '2h ago' },
      { severity: 'med',  message: '3 orders processing >48h — review fulfillment queue', when: '4h ago' },
    ],
  },
}

export function entityDataset(kind) {
  return kind ? DATASETS[kind] || null : null
}
