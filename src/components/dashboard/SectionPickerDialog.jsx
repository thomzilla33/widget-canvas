import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Home, Zap, Database, Users, Shield, Building2,
  ChevronRight, ChevronLeft, Bot, X,
} from 'lucide-react'

// ── Section hierarchy ─────────────────────────────────────────────────────────
// Each top-level item is either a leaf (has `placement`) or a parent (has `children`).
// `children` are always leaves (no deeper nesting).
const SECTIONS = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    children: [
      { id: 'home-personal',   label: 'Personal',  desc: 'Your personal home dashboard.',      placement: { surface: 'home', homeScope: 'personal' } },
      { id: 'home-team',       label: 'My team',   desc: 'Shared home dashboard for your team.', placement: { surface: 'home', homeScope: 'team' } },
    ],
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: Bot,
    desc: 'Dashboard visible inside the Agents section.',
    placement: { surface: 'report', collection: 'Agents' },
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: Zap,
    desc: 'Dashboard visible inside the Automation section.',
    placement: { surface: 'report', collection: 'Operations' },
  },
  {
    id: 'data',
    label: 'Data',
    icon: Database,
    desc: 'Dashboard visible inside the Data section.',
    placement: { surface: 'report', collection: 'Data' },
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: Users,
    children: [
      { id: 'contacts-company',  label: 'Company',   desc: 'Nested in Company / Account profiles.',  placement: { surface: 'profile', profileType: 'Company',  scope: 'all', tab: 'Overview' } },
      { id: 'contacts-contact',  label: 'Contact',   desc: 'Nested in Contact (UCP) profiles.',       placement: { surface: 'profile', profileType: 'Contact',  scope: 'all', tab: 'Overview' } },
      { id: 'contacts-employee', label: 'Employee',  desc: 'Nested in Employee (UEP) profiles.',      placement: { surface: 'profile', profileType: 'Employee', scope: 'all', tab: 'Overview' } },
      { id: 'contacts-deal',     label: 'Deal',      desc: 'Nested in Deal profiles.',                placement: { surface: 'profile', profileType: 'Deal',     scope: 'all', tab: 'Overview' } },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    desc: 'Admin-only dashboard for workspace management.',
    placement: { surface: 'report', collection: 'Admin' },
  },
  {
    id: 'workspace',
    label: 'Workspace',
    icon: Building2,
    children: [
      { id: 'workspace-reports', label: 'Reports',          desc: 'Standalone report in the workspace reports area.', placement: { surface: 'report', collection: 'Executive' } },
      { id: 'workspace-home',   label: 'Workspace home',   desc: 'Workspace-wide landing dashboard.',                placement: { surface: 'home',   homeScope: 'workspace' } },
    ],
  },
]

// ── SectionPickerDialog ───────────────────────────────────────────────────────
// Props:
//   onSelect(placement) — called when user confirms a leaf section
//   onClose             — cancel; no placement chosen
export default function SectionPickerDialog({ onSelect, onClose }) {
  // null = root level, SECTIONS[n] = drilled into that parent
  const [parent, setParent]   = useState(null)
  // The chosen leaf item (tracks across drill levels)
  const [chosen, setChosen]   = useState(null)

  const items = parent ? parent.children : SECTIONS

  function handleItemClick(item) {
    if (item.children) {
      // Drill into sub-level
      setParent(item)
      setChosen(null)
    } else {
      setChosen(item)
    }
  }

  function handleSelect() {
    if (chosen?.placement) onSelect(chosen.placement)
  }

  // Close on Escape
  function onKeyDown(e) {
    if (e.key === 'Escape') onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Select section"
      onKeyDown={onKeyDown}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-[440px] rounded-2xl bg-white shadow-2xl dark:bg-[var(--surface)]"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-1">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
              Select section
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-gray-500 dark:text-slate-400">
              Choose where this dashboard will appear. Available widgets and data
              sources will depend on the selected section.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-3 mt-0.5 flex-shrink-0 grid h-7 w-7 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.07]"
          >
            <X size={15} />
          </button>
        </div>

        {/* Sub-level breadcrumb */}
        {parent && (
          <div className="px-6 pt-3">
            <button
              onClick={() => { setParent(null); setChosen(null) }}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-aims-blue hover:underline"
            >
              <ChevronLeft size={13} />
              {parent.label}
            </button>
          </div>
        )}

        {/* Section list */}
        <div className="mt-3 px-4 pb-2 space-y-0.5">
          {items.map((item) => {
            const Icon     = item.icon ?? null
            const isLeaf   = !item.children
            const selected = chosen?.id === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors
                  ${selected
                    ? 'bg-aims-blue/[0.08] dark:bg-aims-blue/[0.12]'
                    : 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                  }`}
              >
                {Icon && (
                  <span className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg ${
                    selected
                      ? 'bg-aims-blue/15 text-aims-blue dark:bg-aims-blue/20'
                      : 'bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-slate-400'
                  }`}>
                    <Icon size={15} aria-hidden="true" />
                  </span>
                )}
                {/* Sub-level items have no icon — indent to align */}
                {!Icon && <span className="w-8 flex-shrink-0" />}

                <span className="min-w-0 flex-1">
                  <span className={`block text-[13px] font-medium ${
                    selected ? 'text-aims-blue' : 'text-gray-800 dark:text-slate-200'
                  }`}>
                    {item.label}
                  </span>
                  {item.desc && (
                    <span className="block truncate text-[11px] text-gray-400 dark:text-slate-400">
                      {item.desc}
                    </span>
                  )}
                </span>

                {!isLeaf && (
                  <ChevronRight size={14} className="flex-shrink-0 text-gray-300 dark:text-white/20" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4 dark:border-white/[0.07]">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.04]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSelect}
            disabled={!chosen}
            className="h-9 rounded-lg bg-aims-blue px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Select
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
