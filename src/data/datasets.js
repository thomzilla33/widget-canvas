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
  // Automotive model entities
  { id: 'vehicles_auto',   label: 'Vehicles',       integration: 'Automotive Model', columns: ['make','model','year','vin','price','status','mileage','days_in_lot','lot'],   modelId: 'automotive' },
  { id: 'deals_auto',      label: 'Deals',          integration: 'Automotive Model', columns: ['deal_id','vehicle','contact','stage','value','owner','close_date','source'],  modelId: 'automotive' },
  { id: 'contacts_auto',   label: 'Contacts',       integration: 'Automotive Model', columns: ['name','email','phone','type','source','last_visit','status'],                  modelId: 'automotive' },
  { id: 'service_auto',    label: 'Service Orders', integration: 'Automotive Model', columns: ['order_id','vehicle','type','status','technician','cost','scheduled'],          modelId: 'automotive' },
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
  vehicles_auto:   { make:'string', model:'string', year:'number', vin:'string', price:'number', status:'string', mileage:'number', days_in_lot:'number', lot:'string' },
  deals_auto:      { deal_id:'string', vehicle:'string', contact:'string', stage:'string', value:'number', owner:'string', close_date:'date', source:'string' },
  contacts_auto:   { name:'string', email:'string', phone:'string', type:'string', source:'string', last_visit:'date', status:'string' },
  service_auto:    { order_id:'string', vehicle:'string', type:'string', status:'string', technician:'string', cost:'number', scheduled:'date' },
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

// Column metadata: maps internal_name → display_name, description, type.
// The UI should always show display_name and never rely on the internal_name alone.
export const COLUMN_META = {
  // ── Identity & contact ──────────────────────────────────────────────────────
  name:            { display_name: 'Name',           description: 'Full name of the record',                         type: 'string'  },
  email:           { display_name: 'Email',           description: 'Primary email address',                           type: 'string'  },
  phone:           { display_name: 'Phone',           description: 'Primary phone number',                            type: 'string'  },
  city:            { display_name: 'City',            description: 'City from the billing or main address',           type: 'string'  },
  state:           { display_name: 'State / Region',  description: 'State or region',                                 type: 'string'  },
  // ── Lead & account attributes ────────────────────────────────────────────────
  tier:            { display_name: 'Tier',            description: 'Account or contact tier (Gold, Silver, Bronze)',  type: 'string'  },
  score:           { display_name: 'Score',           description: 'Lead or engagement score (0–100)',                type: 'number'  },
  lead_source:     { display_name: 'Lead Source',     description: 'Channel where the lead originated',              type: 'string'  },
  lifecycle_stage: { display_name: 'Lifecycle Stage', description: 'Current stage in the marketing lifecycle',       type: 'string'  },
  original_source: { display_name: 'Original Source', description: 'First channel that brought the contact in',      type: 'string'  },
  industry:        { display_name: 'Industry',        description: 'Industry vertical of the account',               type: 'string'  },
  employees:       { display_name: 'Employees',       description: 'Headcount of the company',                       type: 'number'  },
  mrr:             { display_name: 'MRR',             description: 'Monthly Recurring Revenue in USD',               type: 'number'  },
  annual_revenue:  { display_name: 'Annual Revenue',  description: 'Reported annual revenue of the account',         type: 'number'  },
  owner:           { display_name: 'Owner',           description: 'Team member responsible for this record',        type: 'string'  },
  // ── Deals ────────────────────────────────────────────────────────────────────
  stage:           { display_name: 'Stage',           description: 'Current pipeline stage',                         type: 'string'  },
  deal_stage:      { display_name: 'Deal Stage',      description: 'HubSpot deal stage label',                       type: 'string'  },
  amount:          { display_name: 'Amount',          description: 'Deal value in USD',                              type: 'number'  },
  close_date:      { display_name: 'Close Date',      description: 'Expected or actual deal close date',             type: 'date'    },
  account_id:      { display_name: 'Account',         description: 'Reference to the associated account',            type: 'string'  },
  deal_id:         { display_name: 'Deal ID',         description: 'Unique identifier for this deal',                type: 'string'  },
  value:           { display_name: 'Value',           description: 'Monetary value of the deal',                     type: 'number'  },
  source:          { display_name: 'Source',          description: 'Channel or origin of this deal',                 type: 'string'  },
  // ── Activities ───────────────────────────────────────────────────────────────
  type:            { display_name: 'Type',            description: 'Classification or category of the record',       type: 'string'  },
  subject:         { display_name: 'Subject',         description: 'Subject line or title of the activity',          type: 'string'  },
  contact_id:      { display_name: 'Contact',         description: 'Reference to the associated contact',            type: 'string'  },
  date:            { display_name: 'Date',            description: 'Date the activity took place',                   type: 'date'    },
  duration:        { display_name: 'Duration (min)',  description: 'Length of the activity in minutes',              type: 'number'  },
  outcome:         { display_name: 'Outcome',         description: 'Result or disposition of the activity',          type: 'string'  },
  created_at:      { display_name: 'Created At',      description: 'Date and time the record was created',           type: 'date'    },
  // ── Vehicles (AIMS-OS & Automotive model) ────────────────────────────────────
  make:            { display_name: 'Make',            description: 'Vehicle manufacturer (e.g. Toyota, Ford)',       type: 'string'  },
  model:           { display_name: 'Model',           description: 'Vehicle model name',                             type: 'string'  },
  year:            { display_name: 'Year',            description: 'Model year of the vehicle',                      type: 'number'  },
  vin:             { display_name: 'VIN',             description: 'Vehicle Identification Number',                  type: 'string'  },
  customer_id:     { display_name: 'Customer',        description: 'Reference to the owning customer',               type: 'string'  },
  status:          { display_name: 'Status',          description: 'Current status of the record',                   type: 'string'  },
  purchase_date:   { display_name: 'Purchase Date',   description: 'Date the vehicle was purchased',                 type: 'date'    },
  price:           { display_name: 'Price',           description: 'Listed or sale price of the vehicle',            type: 'number'  },
  mileage:         { display_name: 'Mileage',         description: 'Current odometer reading in miles',              type: 'number'  },
  days_in_lot:     { display_name: 'Days in Lot',     description: 'Number of days the vehicle has been on the lot', type: 'number'  },
  lot:             { display_name: 'Lot',             description: 'Lot or location code',                           type: 'string'  },
  vehicle:         { display_name: 'Vehicle',         description: 'Reference to the vehicle in this record',        type: 'string'  },
  contact:         { display_name: 'Contact',         description: 'Reference to the customer contact',              type: 'string'  },
  last_visit:      { display_name: 'Last Visit',      description: 'Most recent dealership visit date',              type: 'date'    },
  // ── Service orders ───────────────────────────────────────────────────────────
  order_id:        { display_name: 'Order ID',        description: 'Unique identifier for the service order',        type: 'string'  },
  cost:            { display_name: 'Cost',            description: 'Total cost of the service order in USD',         type: 'number'  },
  scheduled:       { display_name: 'Scheduled',       description: 'Appointment date and time',                      type: 'date'    },
  technician:      { display_name: 'Technician',      description: 'Technician assigned to this service order',      type: 'string'  },
}

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
    calculations: [{ fn: 'count', column: 'name' }],
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
    calculations: [{ fn: 'sum', column: 'value' }],
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
    calculations: [{ fn: 'sum', column: 'mrr' }],
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
    calculations: [],
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
    calculations: [{ fn: 'count', column: 'type' }],
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
    calculations: [{ fn: 'sum', column: 'value' }],
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
    calculations: [{ fn: 'count', column: 'name' }],
    filters: [{ column: 'created_at', operator: 'is after', value: '30_days_ago' }],
  },
]

// Widget skeletons compatible with each dataset result shape
export const COMPATIBLE_SKELETONS = {
  [DATASET_SHAPE.GROUPED]: ['bar','line','pie','table'],
  [DATASET_SHAPE.SINGLE]:  ['kpi','gauge','statrow'],
  [DATASET_SHAPE.FULL]:    ['table','list'],
}
