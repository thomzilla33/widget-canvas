import { Users } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import { MyTeamTab } from './wq/MyTeamTab.jsx'
import { useRole } from '../../state/RoleContext.jsx'
import { TEAM_ROSTER } from '../../data/workqueue.js'

export function MyTeamCard() {
  const { isAdmin } = useRole()

  const actnowTotal = isAdmin
    ? TEAM_ROSTER.reduce((s, m) => s + m.events.actnow, 0)
    : 0

  return (
    <div className="card flex h-full flex-col">
      <CardHeader
        icon={<Users size={14} />}
        title="My Team"
        badge={actnowTotal || undefined}
        action={{ label: 'See all', onClick: undefined }}
      />
      <MyTeamTab isManager={isAdmin} />
    </div>
  )
}
