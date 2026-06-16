import { useState, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, ChevronRight, ChevronDown, Lock, Building2, UserRound, UserCheck, Mail, Phone, MapPin,
  Briefcase, MessageSquare, MoreHorizontal, X, Send, Bot, Copy, ExternalLink,
} from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

// CEO V1 (P1a/P1b) — the fixed/locked entity "top line" on profile surfaces
// (Company/Account, Contact/UCP, Employee/UEP). Part of the template, not a widget.
// Renders on the canvas (building), the read-only view, and the UCP profile. Hosts
// the executable action row (Email / SMS / Chat with agent / More) — all mock here.

const HEADER_PROFILES = ['Company', 'Contact', 'Employee']
const ENTITY_TO_PROFILE = { Account: 'Company', Contact: 'Contact', Employee: 'Employee', Deal: 'Deal', Case: 'Case' }

// Placement-based surfaces (canvas, read-only view).
export function entityHeaderApplies(placement) {
  return placement?.surface === 'profile' && HEADER_PROFILES.includes(placement.profileType)
}
// Entity-based surface (UCP) — does this profile type get a header?
export function profileSupportsHeader(profileType) {
  return HEADER_PROFILES.includes(profileType)
}

// Representative personas so the header reads like production even on a type-wide template.
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

export default function EntityContextHeader({ placement, entity }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState(null) // 'email' | 'sms' | 'chat'
  const [menuOpen, setMenuOpen] = useState(false)

  const profileType = entity ? ENTITY_TO_PROFILE[entity.type] || 'Contact' : placement?.profileType
  const base = PERSONAS[profileType] || PERSONAS.Contact
  const name = entity?.name || (placement?.scope === 'entity' && placement?.entityName) || base.name
  const Icon = base.icon
  const lower = base.kind.toLowerCase()

  return (
    <div className="card mb-3 p-0">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-aims-blue text-sm font-bold text-white">
          {initialsOf(name)}
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-base font-bold text-gray-900 dark:text-slate-100">{name}</span>
          <span className="inline-flex items-center gap-1 text-[13px] text-gray-500 dark:text-slate-400">
            <Icon size={13} aria-hidden="true" /> {base.kind}
          </span>
          <span aria-hidden="true" className="text-gray-300 dark:text-slate-600">·</span>
          <span className="inline-flex items-center gap-1 text-[13px] text-gray-500 dark:text-slate-400">
            <Briefcase size={13} aria-hidden="true" /> {base.company}
          </span>
          <span aria-hidden="true" className="hidden text-gray-300 sm:inline dark:text-slate-600">·</span>
          <span className="hidden text-[13px] text-gray-500 sm:inline dark:text-slate-400">{base.owner}</span>
          <span className="ml-1 inline-flex items-center rounded-full border border-aims-blue/30 bg-aims-blue/10 px-2 py-0.5 text-xs font-medium text-aims-blue">
            {base.status}
          </span>
        </div>

        {/* Action row + AI + expand */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <span className="hidden items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-gray-400 sm:inline-flex dark:text-slate-500" title="Locked — part of the template, always shown">
            <Lock size={11} aria-hidden="true" /> Locked
          </span>
          <button
            type="button"
            onClick={() => setPanel('email')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-aims-blue px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-aims-blue/90"
            title={`Email this ${lower}`}
            aria-label={`Email this ${lower}`}
          >
            <Mail size={14} aria-hidden="true" /> <span className="hidden md:inline">Email</span>
          </button>
          <IconBtn label={`Text this ${lower}`} onClick={() => setPanel('sms')}><MessageSquare size={15} /></IconBtn>
          <button
            type="button"
            onClick={() => setPanel('chat')}
            title={`Chat with an agent about this ${lower}`}
            aria-label={`Chat with an agent about this ${lower}`}
            className="grid h-8 w-8 place-items-center rounded-lg text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg,#06B6D4,#2563EB)' }}
          >
            <Sparkles size={15} aria-hidden="true" />
          </button>
          <div className="relative">
            <IconBtn label="More" onClick={() => setMenuOpen((m) => !m)} expanded={menuOpen}><MoreHorizontal size={15} /></IconBtn>
            {menuOpen && (
              <MoreMenu base={base} entityId={entity?.id} navigate={navigate} onClose={() => setMenuOpen(false)} />
            )}
          </div>
          <IconBtn label={open ? 'Hide details' : 'Show details'} onClick={() => setOpen((o) => !o)} expanded={open}>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </IconBtn>
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

      {(panel === 'email' || panel === 'sms') && (
        <ActionComposer kind={panel} name={name} base={base} onClose={() => setPanel(null)} />
      )}
      {panel === 'chat' && <AgentChatPanel name={name} kindLabel={base.kind} onClose={() => setPanel(null)} />}
    </div>
  )
}

function IconBtn({ label, onClick, expanded, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-white/15 dark:text-slate-400 dark:hover:bg-white/5"
    >
      {children}
    </button>
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

// "More" dropdown — copy details / open the full profile.
function MoreMenu({ base, entityId, navigate, onClose }) {
  const copy = (text) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    onClose()
  }
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} aria-hidden="true" />
      <div role="menu" className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#131a2c]">
        {entityId && (
          <MenuItem icon={ExternalLink} onClick={() => { onClose(); navigate(`/ucp/${entityId}`) }}>View full profile</MenuItem>
        )}
        <MenuItem icon={Copy} onClick={() => copy(base.email)}>Copy email</MenuItem>
        <MenuItem icon={Copy} onClick={() => copy(base.phone)}>Copy phone</MenuItem>
      </div>
    </>
  )
}
function MenuItem({ icon: Icon, onClick, children }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-white/5"
    >
      <Icon size={14} className="text-gray-400 dark:text-slate-500" aria-hidden="true" /> {children}
    </button>
  )
}

// Email / SMS composer — prefilled, mock send (nothing leaves the prototype).
function ActionComposer({ kind, name, base, onClose }) {
  const ref = useFocusTrap()
  const titleId = useId()
  const [sent, setSent] = useState(false)
  const [body, setBody] = useState('')
  const [subject, setSubject] = useState('')
  const isEmail = kind === 'email'
  const to = isEmail ? base.email : base.phone

  return (
    <Overlay onClose={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="card relative z-10 w-[90vw] max-w-[460px] p-0 outline-none" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <h2 id={titleId} className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
            {isEmail ? <Mail size={15} /> : <MessageSquare size={15} />} {isEmail ? 'Email' : 'Text'} {name}
          </h2>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} />
          </button>
        </div>
        {sent ? (
          <div className="p-5 text-center">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-green-200 bg-green-50 text-aims-governed dark:border-green-500/25 dark:bg-green-500/10">
              <Send size={18} />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-900 dark:text-slate-100">{isEmail ? 'Email' : 'Message'} queued to {name}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Prototype — nothing is actually sent.</p>
            <button onClick={onClose} className="btn-secondary mt-4">Done</button>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            <Labeled label="To"><div className="input flex items-center text-gray-500 dark:text-slate-400">{to}</div></Labeled>
            {isEmail && (
              <Labeled label="Subject">
                <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
              </Labeled>
            )}
            <Labeled label="Message">
              <textarea rows={isEmail ? 5 : 3} className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder={`Write your ${isEmail ? 'email' : 'message'}…`} />
            </Labeled>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button onClick={() => setSent(true)} disabled={!body.trim()} className="btn-primary">
                <Send size={14} /> Send
              </button>
            </div>
          </div>
        )}
      </div>
    </Overlay>
  )
}

// Entity-scoped agent chat — a canned assistant reply (mock).
function AgentChatPanel({ name, kindLabel, onClose }) {
  const ref = useFocusTrap()
  const titleId = useId()
  const [msgs, setMsgs] = useState([
    { from: 'agent', text: `Hi — I'm your AI assistant for this ${kindLabel.toLowerCase()}. Ask me anything about ${name}.` },
  ])
  const [draft, setDraft] = useState('')
  const send = () => {
    if (!draft.trim()) return
    const q = draft.trim()
    setMsgs((m) => [
      ...m,
      { from: 'user', text: q },
      { from: 'agent', text: `Here's what I found about ${name} for “${q}”: activity is healthy, with no open escalations. (Prototype — this is a canned response.)` },
    ])
    setDraft('')
  }
  return (
    <Overlay onClose={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="card relative z-10 flex max-h-[80vh] w-[90vw] max-w-[440px] flex-col p-0 outline-none" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <h2 id={titleId} className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
            <Bot size={15} className="text-aims-blue" /> Ask AI · {name}
          </h2>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 space-y-2 overflow-auto p-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <span className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.from === 'user' ? 'bg-aims-blue text-white' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-slate-200'}`}>
                {m.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-gray-200 p-3 dark:border-white/10">
          <input
            className="input flex-1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about this profile…"
            aria-label="Message the assistant"
          />
          <button onClick={send} disabled={!draft.trim()} className="btn-primary !px-2.5" aria-label="Send">
            <Send size={15} />
          </button>
        </div>
      </div>
    </Overlay>
  )
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      {children}
    </div>
  )
}

function Labeled({ label, children }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-gray-700 dark:text-slate-200">{label}</div>
      {children}
    </div>
  )
}
