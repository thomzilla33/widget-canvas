import { useState } from 'react'
import { Sparkles, ChevronRight, ChevronDown, Lock, Building2, UserRound, Mail, Phone, MapPin, Briefcase, UserCheck } from 'lucide-react'

// CEO V1 (P1a) — the fixed/locked entity "top line" shown on profile dashboards
// (Company/Account, Contact/UCP, Employee/UEP). It is part of the template, not a
// widget: it can't be removed, and it always renders the profile's basic info.
// On "all profiles" templates it previews a representative persona; on a specific
// entity it uses that entity's name.

const HEADER_PROFILES = ['Company', 'Contact', 'Employee']

export function entityHeaderApplies(placement) {
  return placement?.surface === 'profile' && HEADER_PROFILES.includes(placement.profileType)
}

// Representative personas so the locked header reads like production even on a
// type-wide ("all profiles") template.
const PERSONAS = {
  Contact: {
    kind: 'Contact', icon: UserRound, name: 'Mike Abbott', company: 'Acme Corp', owner: 'David Kim',
    status: 'Appointment Today', email: 'mike.abbott@acme.com', phone: '+1 (415) 555-0192', address: 'San Francisco, CA',
  },
  Company: {
    kind: 'Account', icon: Building2, name: 'Acme Corporation', company: 'Enterprise · SaaS', owner: 'Priya Nair · AE',
    status: 'Renewal in Q3', email: 'billing@acme.com', phone: '+1 (415) 555-0110', address: '500 Market St, San Francisco, CA',
  },
  Employee: {
    kind: 'Employee', icon: UserCheck, name: 'María González', company: 'People Ops · Acme Corp', owner: 'Manager: David Kim',
    status: 'Active', email: 'maria.gonzalez@acme.com', phone: '+1 (415) 555-0144', address: 'Austin, TX',
  },
}

function initialsOf(name) {
  return (name.match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase() || '—'
}

export default function EntityContextHeader({ placement }) {
  const [open, setOpen] = useState(false)
  const base = PERSONAS[placement?.profileType] || PERSONAS.Contact
  const named = placement?.scope === 'entity' && placement?.entityName
  const name = named ? placement.entityName : base.name
  const Icon = base.icon

  return (
    <div className="card mb-3 p-0 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-aims-blue text-sm font-bold text-white">
          {initialsOf(name)}
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-base font-bold text-gray-900 dark:text-slate-100">{name}</span>
          <span className="inline-flex items-center gap-1 text-[13px] text-gray-500 dark:text-slate-400">
            <Icon size={13} aria-hidden="true" /> {base.kind}
          </span>
          <span aria-hidden="true" className="text-gray-300 dark:text-slate-600">·</span>
          <span className="inline-flex items-center gap-1 text-[13px] text-gray-500 dark:text-slate-400">
            <Briefcase size={13} aria-hidden="true" /> {base.company}
          </span>
          <span aria-hidden="true" className="text-gray-300 dark:text-slate-600">·</span>
          <span className="text-[13px] text-gray-500 dark:text-slate-400">{base.owner}</span>
          <span className="ml-1 inline-flex items-center rounded-full border border-aims-blue/30 bg-aims-blue/10 px-2 py-0.5 text-xs font-medium text-aims-blue">
            {base.status}
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-slate-500"
            title="Locked — this header is part of the template and always shown"
          >
            <Lock size={11} aria-hidden="true" /> Locked
          </span>
          <button
            type="button"
            title={`Ask AI about this ${base.kind.toLowerCase()}`}
            aria-label={`Ask AI about this ${base.kind.toLowerCase()}`}
            className="grid h-8 w-8 place-items-center rounded-lg text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg,#06B6D4,#2563EB)' }}
          >
            <Sparkles size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Hide profile details' : 'Show profile details'}
            className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-white/15 dark:text-slate-400 dark:hover:bg-white/5"
          >
            {open ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 border-t border-gray-100 p-4 sm:grid-cols-2 dark:border-white/10">
          <DetailField icon={Mail} label="Email" value={base.email} />
          <DetailField icon={Phone} label="Phone" value={base.phone} />
          <DetailField icon={MapPin} label="Address" value={base.address} />
          <DetailField icon={UserRound} label="Owner" value={base.owner} />
        </div>
      )}
    </div>
  )
}

function DetailField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="mt-0.5 shrink-0 text-gray-400 dark:text-slate-500" aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">{label}</div>
        <div className="truncate text-sm text-gray-700 dark:text-slate-200">{value}</div>
      </div>
    </div>
  )
}
