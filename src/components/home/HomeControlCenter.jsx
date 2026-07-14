// src/components/home/HomeControlCenter.jsx
// Responsive grid layout:
//   Mobile  (1 col): all cards stack vertically in priority order
//   Tablet+ (2 col): My Work Today spans full width, then 2-col pairs
import { MyWorkTodayCard } from './MyWorkTodayCard.jsx'
import { MyDayCard }        from './MyDayCard.jsx'
import { InboxCard }        from './InboxCard.jsx'
import { CopilotCard }      from './CopilotCard.jsx'
import { WorkflowsCard }    from './WorkflowsCard.jsx'
import { AgentsCard }       from './AgentsCard.jsx'

export function HomeControlCenter() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Row 1: hero — always full width */}
      <div className="md:col-span-2">
        <MyWorkTodayCard />
      </div>

      {/* Row 2: My Day | Inbox */}
      <MyDayCard />
      <InboxCard />

      {/* Row 3: Copilots — full width so the 2×2 copilot grid has room */}
      <div className="md:col-span-2">
        <CopilotCard />
      </div>

      {/* Row 4: Workflows | Agents */}
      <WorkflowsCard />
      <AgentsCard />
    </div>
  )
}
