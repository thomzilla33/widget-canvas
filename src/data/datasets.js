// Dataset catalog — defines sources, column types, operators, aggregation functions,
// and pre-built dataset templates used by the Widget Builder DatasetStep.
//
// "shape" drives which widget types are compatible with a given dataset result:
//   grouped  → bar, line, pie, table  (has Group By → multiple rows per group)
//   single   → kpi, gauge, statrow   (no Group By → one aggregated value)
//   full     → table, list            (Record Set → raw records, no aggregation)

export const DATASET_SHAPE = {
  GROUPED: 'grouped',
  SINGLE:  'single',
  FULL:    'full',
}

export const ENTITY_SOURCES = [
  // Contacts — two integrations
  { id: 'contacts_salesforce', label: 'Contacts', integration: 'Salesforce', columns: ['name','email','phone','city','state','tier','score','lead_source','created_at'] },
  { id: 'contacts_hubspot',    label: 'Contacts', integration: 'HubSpot',    columns: ['name','email','phone','city','lifecycle_stage','score','original_source','created_at'] },
  // Accounts — two integrations
  { id: 'accounts_salesforce', label: 'Accounts', integration: 'Salesforce', columns: ['name','industry','employees','mrr','tier','owner','created_at'] },
  { id: 'accounts_hubspot',    label: 'Accounts', integration: 'HubSpot',    columns: ['name','industry','employees','annual_revenue','owner','created_at'] },
  // Deals — two integrations
  { id: 'deals_salesforce',    label: 'Deals',    integration: 'Salesforce', columns: ['name','stage','amount','close_date','owner','account_id','created_at'] },
  { id: 'deals_hubspot',       label: 'Deals',    integration: 'HubSpot',    columns: ['name','deal_stage','amount','close_date','owner','created_at'] },
  // Activities — internal only
  { id: 'activities_aims',     label: 'Activities', integration: 'AIMS-OS',  columns: ['type','subject','contact_id','account_id','date','duration','outcome'] },
  // Vehicles — internal only
  { id: 'vehicles_aims',       label: 'Vehicles',   integration: 'AIMS-OS',  columns: ['make','model','year','vin','customer_id','status','purchase_date'] },
]

export const COLUMN_TYPES = {
  contacts_salesforce: { name:'string', email:'string', phone:'string', city:'string', state:'string', tier:'string', score:'number', lead_source:'string', created_at:'date' },
  contacts_hubspot:    { name:'string', email:'string', phone:'string', city:'string', lifecycle_stage:'string', score:'number', original_source:'string', created_at:'date' },
  accounts_salesforce: { name:'string', industry:'string', employees:'number', mrr:'number', tier:'string', owner:'string', created_at:'date' },
  accounts_hubspot:    { name:'string', industry:'string', employees:'number', annual_revenue:'number', owner:'string', created_at:'date' },
  deals_salesforce:    { name:'string', stage:'string', amount:'number', close_date:'date', owner:'string', account_id:'string', created_at:'date' },
  deals_hubspot:       { name:'string', deal_stage:'string', amount:'number', close_date:'date', owner:'string', created_at:'date' },
  activities_aims:     { type:'string', subject:'string', contact_id:'string', account_id:'string', date:'date', duration:'number', outcome:'string' },
  vehicles_aims:       { make:'string', model:'string', year:'number', vin:'string', customer_id:'string', status:'string', purchase_date:'date' },
}

export const OPERATORS_BY_TYPE = {
  string: ['equals','not equals','contains','starts with','is empty','is not empty'],
  number: ['=','≠','>','≥','<','≤','is empty','is not empty'],
  date:   ['is','is before','is after','is between','is empty'],
}

export const AGG_FUNCTIONS = [
  { id: 'count', label: 'Count', compatibleTypes: ['string','number','date'] },
  { id: 'sum',   label: 'Sum',   compatibleTypes: ['number'] },
  { id: 'avg',   label: 'Average', compatibleTypes: ['number'] },
  { id: 'min',   label: 'Min',   compatibleTypes: ['number','date'] },
  { id: 'max',   label: 'Max',   compatibleTypes: ['number','date'] },
]

// Pre-built datasets available in the library as starting points
export const PRESET_DATASETS = [
  {
    id: 'ds-contacts-by-tier',
    name: 'Contacts by Tier',
    shape: DATASET_SHAPE.GROUPED,
    source: 'contacts',
    description: 'Count of contacts grouped by tier (Gold, Silver, Bronze)',
    columns: ['tier','count'],
    groupBy: ['tier'],
    aggregation: { fn: 'count', column: 'name' },
    filters: [],
  },
  {
    id: 'ds-deals-pipeline',
    name: 'Deals Pipeline',
    shape: DATASET_SHAPE.GROUPED,
    source: 'deals',
    description: 'Sum of deal value grouped by stage',
    columns: ['stage','total_value'],
    groupBy: ['stage'],
    aggregation: { fn: 'sum', column: 'value' },
    filters: [],
  },
  {
    id: 'ds-total-mrr',
    name: 'Total MRR',
    shape: DATASET_SHAPE.SINGLE,
    source: 'accounts',
    description: 'Sum of MRR across all active accounts',
    columns: ['total_mrr'],
    groupBy: [],
    aggregation: { fn: 'sum', column: 'mrr' },
    filters: [],
  },
  {
    id: 'ds-contacts-full',
    name: 'All Contacts',
    shape: DATASET_SHAPE.FULL,
    source: 'contacts',
    description: 'Full contact record set — name, email, city, tier',
    columns: ['name','email','city','tier'],
    groupBy: [],
    aggregation: null,
    filters: [],
  },
  {
    id: 'ds-activities-this-week',
    name: 'Activities This Week',
    shape: DATASET_SHAPE.GROUPED,
    source: 'activities',
    description: 'Count of activities grouped by type for the current week',
    columns: ['type','count'],
    groupBy: ['type'],
    aggregation: { fn: 'count', column: 'type' },
    filters: [{ column: 'date', operator: 'is', value: 'this_week' }],
  },
  {
    id: 'ds-deals-value-by-owner',
    name: 'Deal Value by Owner',
    shape: DATASET_SHAPE.GROUPED,
    source: 'deals',
    description: 'Total deal value grouped by owner — shows each rep\'s pipeline',
    columns: ['owner','total_value'],
    groupBy: ['owner'],
    aggregation: { fn: 'sum', column: 'value' },
    filters: [],
  },
  {
    id: 'ds-new-accounts-count',
    name: 'New Accounts (30d)',
    shape: DATASET_SHAPE.SINGLE,
    source: 'accounts',
    description: 'Count of accounts created in the last 30 days',
    columns: ['count'],
    groupBy: [],
    aggregation: { fn: 'count', column: 'name' },
    filters: [{ column: 'created_at', operator: 'is after', value: '30_days_ago' }],
  },
]

// Widget skeletons compatible with each dataset result shape
export const COMPATIBLE_SKELETONS = {
  [DATASET_SHAPE.GROUPED]: ['bar','line','pie','table'],
  [DATASET_SHAPE.SINGLE]:  ['kpi','gauge','statrow'],
  [DATASET_SHAPE.FULL]:    ['table','list'],
}
