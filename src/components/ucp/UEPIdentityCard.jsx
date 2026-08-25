import { Building2, UserRound, UserCheck, Briefcase, MapPin, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const TYPE_ICON = {
  Company:        Building2,
  Account:        Building2,    // PERSONAS.Company uses kind: 'Account'
  Contact:        UserRound,
  Employee:       UserCheck,
  Deal:           Briefcase,
  'Client (deal)': Briefcase,  // PERSONAS.Deal uses kind: 'Client (deal)'
  Location:       MapPin,
}

const TYPE_COLOR = {
  Company:        'bg-aims-blue',
  Account:        'bg-aims-blue',
  Contact:        'bg-emerald-500',
  Employee:       'bg-purple-500',
  Deal:           'bg-amber-500',
  'Client (deal)': 'bg-amber-500',
  Location:       'bg-teal-600',
}

/**
 * Lean identity card shown at the top of every UEP.
 * Only basic identity — no metrics, no contact fields, no NBA.
 */
export default function UEPIdentityCard({ persona, primaryAction, onPrimaryAction }) {
  const Icon = TYPE_ICON[persona.kind] || User
  const avatarBg = TYPE_COLOR[persona.kind] || 'bg-slate-500'

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b" style={{ borderColor: 'var(--line)' }}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${avatarBg} flex items-center justify-center`}>
        <Icon size={18} className="text-white" />
      </div>

      {/* Identity */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>
            {persona.name}
          </h2>
          <span
            className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--cb)', color: 'var(--t2)', border: '1px solid var(--line)' }}
          >
            {persona.kind}
          </span>
        </div>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--t3)' }}>
          {persona.company}
        </p>
        {persona.owner && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
            Owner: <span style={{ color: 'var(--t2)' }}>{persona.owner}</span>
          </p>
        )}
      </div>

      {/* Primary CTA */}
      {primaryAction && (
        <Button variant="secondary" size="sm" onClick={onPrimaryAction}>
          {primaryAction}
        </Button>
      )}
    </div>
  )
}
