// Single source of truth for audiences (used by the canvas config, the publish
// preview, and the consumption "view as role" control). A widget placement may
// be restricted to one or more audiences; an empty/absent list means everyone.
export const ALL_AUDIENCES = 'All audiences'

// The roles an admin can restrict a widget to. Add audiences here once — every
// surface (canvas chips, publish preview, "view as") picks them up.
export const AUDIENCE_ROLES = ['Sales Agent', 'Support Agent', 'Manager', 'Executive', 'Revenue Operations']

// Options for a single-choice control (e.g. the dashboard-level audience or the
// "view as" picker): "All audiences" + each role.
export const AUDIENCE_OPTIONS = [ALL_AUDIENCES, ...AUDIENCE_ROLES]

// ── Dashboard audience targeting model (who a dashboard is FOR) ──
// A structured target: { type, label }. Types are ordered broad → narrow, so the
// picker reads as a real org scope. "global" needs no label (everyone).
export const AUDIENCE_TYPES = [
  { id: 'global', label: 'Global', hint: 'Everyone in the workspace' },
  { id: 'workspace', label: 'Workspace', hint: 'A whole tenant / workspace' },
  { id: 'department', label: 'Department', hint: 'An org unit' },
  { id: 'group', label: 'Group', hint: 'A team or distribution group' },
  { id: 'role', label: 'Role', hint: 'A job function' },
  { id: 'user', label: 'User', hint: 'One specific person' },
]
export const AUDIENCE_TARGETS = {
  workspace: ['Contoso HQ', 'Contoso EU', 'Contoso APAC'],
  department: ['Sales', 'Customer Success', 'Support', 'Finance', 'Operations', 'People Ops'],
  group: ['Revenue Team', 'CS Leadership', 'Field Ops', 'Deal Desk', 'Exec Staff'],
  role: AUDIENCE_ROLES,
  user: ['Priya Nair', 'Dana Lee', 'Sam Ortiz', 'Yuki Tanaka', 'Liam Murphy', 'María González'],
}
const AUD_TYPE_LABEL = Object.fromEntries(AUDIENCE_TYPES.map((t) => [t.id, t.label]))

// Coerce a legacy string audience ('Sales Agent', 'All audiences') to the structured form.
export function normalizeAudience(a) {
  if (a && typeof a === 'object') return a
  if (!a || a === ALL_AUDIENCES) return { type: 'global' }
  return { type: 'role', label: a } // legacy single role
}
// Human label for any audience value (string OR structured), e.g. "Sales · Department".
export function audienceLabel(a) {
  const n = normalizeAudience(a)
  if (n.type === 'global') return 'Everyone (global)'
  return `${n.label} · ${AUD_TYPE_LABEL[n.type] || n.type}`
}
// Stable key for conflict/equality checks + placeKey signatures.
export function audienceKey(a) {
  const n = normalizeAudience(a)
  return n.type === 'global' ? 'global' : `${n.type}:${n.label}`
}
// Does a dashboard-level audience target a given role (UCP "view as" tab filter)?
// Only role-type audiences are role-scoped; broader scopes show in the role preview.
export function dashAudienceVisibleTo(a, role) {
  if (!role || role === ALL_AUDIENCES) return true
  const n = normalizeAudience(a)
  return n.type === 'role' ? n.label === role : true
}

// Normalize a placement's allowed audiences to an array of role labels.
// [] means "all audiences". Back-compatible with the old single `audience` string.
export function placementAudiences(p) {
  if (Array.isArray(p?.audiences)) return p.audiences
  if (p?.audience && p.audience !== ALL_AUDIENCES) return [p.audience]
  return []
}

// Is a placement visible to a given viewer role? An empty restriction = visible
// to all; the "All audiences" viewer (admin/preview-all) sees everything.
export function audienceVisibleTo(p, role) {
  if (!role || role === ALL_AUDIENCES) return true
  const allowed = placementAudiences(p)
  return allowed.length === 0 || allowed.includes(role)
}

// Short human label of a placement's audience restriction (for card footers).
export function audienceSummary(p) {
  const a = placementAudiences(p)
  if (a.length === 0) return ALL_AUDIENCES
  if (a.length <= 2) return a.join(', ')
  return `${a.length} audiences`
}

// ── PBAC for entity-header actions (U2.5) ──
// Which roles may perform each header action. Customer-facing roles can reach out
// (email/sms) and copy contact data; observers (e.g. Executive) cannot. AI chat is
// read-only assist, available to everyone. ALL_AUDIENCES (admin / preview-all) = all.
const ACTION_ROLES = {
  email: ['Sales Agent', 'Support Agent', 'Manager', 'Revenue Operations'],
  sms: ['Sales Agent', 'Support Agent', 'Manager'],
  contact: ['Sales Agent', 'Support Agent', 'Manager', 'Revenue Operations'], // copy email/phone (PII egress)
  chat: AUDIENCE_ROLES, // AI assist for all roles
}
export function actionAllowedFor(action, role) {
  if (!role || role === ALL_AUDIENCES) return true
  const allowed = ACTION_ROLES[action]
  return !allowed || allowed.includes(role)
}
