/**
 * UEP configuration — which entity types support a Unified Profile,
 * and what secondary entity types each parent exposes as tabs.
 *
 * In production this comes from Data Studio settings per tenant.
 * For the prototype, this is static config.
 */

// Entity types that have a UEP (appear in Profiles navigation)
export const UEP_ENABLED_TYPES = ['Account', 'Contact', 'Employee', 'Deal', 'Location']

// Secondary entity types available to add as tabs, keyed by parent entity type
export const SECONDARY_ENTITY_OPTIONS = {
  Account: [
    { type: 'Location', label: 'Locations', icon: 'MapPin' },
    { type: 'Contact',  label: 'Contacts',  icon: 'UserRound' },
    { type: 'Deal',     label: 'Deals',     icon: 'Briefcase' },
  ],
  Contact: [
    { type: 'Deal',    label: 'Deals',   icon: 'Briefcase' },
    { type: 'Account', label: 'Account', icon: 'Building2' },
  ],
  Employee: [
    { type: 'Account', label: 'Department', icon: 'Building2' },
  ],
  Location: [
    { type: 'Contact', label: 'Staff', icon: 'UserRound' },
  ],
  Deal: [
    { type: 'Contact', label: 'Contacts', icon: 'UserRound' },
    { type: 'Account', label: 'Account',  icon: 'Building2' },
  ],
}

// Maps tab label → entity type string.
// Used by UCPView to detect which tabs are secondary entity tabs.
export const ENTITY_TYPE_BY_LABEL = {
  'Locations':   'Location',
  'Contacts':    'Contact',
  'Staff':       'Contact',
  'Deals':       'Deal',
  'Account':     'Account',
  'Department':  'Account',
}
