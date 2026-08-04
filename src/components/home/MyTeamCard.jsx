import { Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CardHeader } from './CardHeader.jsx'
import { MyTeamTab } from './wq/MyTeamTab.jsx'
import { useRole } from '../../state/RoleContext.jsx'
import { TEAM_ROSTER } from '../../data/workqueue.js'

export function MyTeamCard() {
  const navigate = useNavigate()
  const { isAdmin } = useRole()

  const blockingTotal = isAdmin
    ? TEAM_ROSTER.reduce((s, m) => s + m.events.blocking, 0)
    : 0

  return (
    <div className="card flex h-full flex-col">
      <CardHeader
        icon={<Users size={14} />}
        title="My Team"
        badge={blockingTotal || undefined}
        action={{ label: 'See all', onClick: () => navigate('/profiles') }}
      />
      <MyTeamTab isManager={isAdmin} />
    </div>
  )
}
