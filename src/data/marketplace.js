import { SKELETON_ABOUT } from './mock.js'

// Business-function categories for the marketplace — derived from widget source,
// independent of the internal CATALOG_CATEGORIES (AIMS OS / Operational / …).
export const BUSINESS_CATEGORIES = [
  { id: 'all',              label: 'All categories' },
  { id: 'aims-os',          label: 'AIMS OS'          },
  { id: 'sales',            label: 'Sales'            },
  { id: 'finance',          label: 'Finance'          },
  { id: 'customer-service', label: 'Customer Service' },
  { id: 'hr',               label: 'HR'               },
  { id: 'marketing',        label: 'Marketing'        },
  { id: 'operations',       label: 'Operations'       },
]

export const BUSINESS_CATEGORY_COLOR = {
  'aims-os':          '#2B7FFF',
  'sales':            '#22C55E',
  'finance':          '#0EA5E9',
  'customer-service': '#F97316',
  'hr':               '#A78BFA',
  'marketing':        '#EC4899',
  'operations':       '#64748B',
}

// Ordered match table — first match wins.
const SOURCE_TO_BUSINESS = [
  [(s) => s.includes('AIMS'),         'aims-os'],
  [(s) => s === 'Finance Data View',  'finance'],
  [(s) => s === 'Stripe',             'finance'],
  [(s) => s === 'QuickBooks',         'finance'],
  [(s) => s.includes('NetSuite'),     'finance'],
  [(s) => s === 'Salesforce',         'sales'],
  [(s) => s === 'HubSpot',            'sales'],
  [(s) => s === 'Zendesk',            'customer-service'],
  [(s) => s === 'Intercom',           'customer-service'],
  [(s) => s.includes('Workday'),      'hr'],
  [(s) => s === 'Greenhouse',         'hr'],
  [(s) => s === 'Google Ads',         'marketing'],
  [(s) => s === 'Survey Data View',   'marketing'],
  [(s) => s === 'Snowflake',          'operations'],
]

export function businessCategoryFor(source = '') {
  for (const [test, cat] of SOURCE_TO_BUSINESS) {
    if (test(source)) return cat
  }
  return 'operations'
}

export const COMPLEXITY_BY_SKELETON = {
  'KPI':            'Simple',
  'Gauge':          'Simple',
  'Stat Row':       'Simple',
  'Cost KPI':       'Simple',
  'Chart':          'Intermediate',
  'List':           'Intermediate',
  'Donut':          'Intermediate',
  'Funnel':         'Intermediate',
  'Feed':           'Intermediate',
  'Alerts':         'Intermediate',
  'Composite Stat': 'Intermediate',
  'Table':          'Advanced',
  'Board':          'Advanced',
  'Heat Map':       'Advanced',
  'Map':            'Advanced',
  'AI Summary':     'Advanced',
  'Spend Breakdown':'Advanced',
  'Usage Heatmap':  'Advanced',
}

export const COMPLEXITY_VARIANT = {
  Simple:       'success',
  Intermediate: 'neutral',
  Advanced:     'alert',
}

// Deterministic pseudo-hash — seeded from a string, result in [0, range).
// No Math.random so values are stable across renders and server runs.
function pHash(str, range) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h % range
}

export function enrichWidget(w) {
  const businessCategory = businessCategoryFor(w.source)
  const complexity       = COMPLEXITY_BY_SKELETON[w.skeleton] || 'Intermediate'
  const description      = SKELETON_ABOUT[w.skeleton] || 'A dashboard widget.'
  const sourceShort      = w.source.split(' — ')[0].split(' (')[0]
  const tags             = [w.skeleton, businessCategory, sourceShort, w.freshness].filter(Boolean)
  const entityCount      = pHash(w.id + 'e', 8) + 2          // 2–9
  const tenantUsage      = w.usedIn * 124 + 280 + pHash(w.id + 't', 200) // realistic 4-digit

  return {
    ...w,
    businessCategory,
    complexity,
    complexityVariant: COMPLEXITY_VARIANT[complexity] || 'neutral',
    description,
    tags,
    entityCount,
    tenantUsage,
  }
}

// Filter out system widgets (Inbox / My Tasks / HTL) — they are not reusable catalog items.
export function enrichWidgets(list) {
  return list.filter((w) => !w.system).map(enrichWidget)
}
