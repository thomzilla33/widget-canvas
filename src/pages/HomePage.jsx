import { useState } from 'react'
import { HomeControlCenter } from '../components/home/HomeControlCenter.jsx'
import { CopilotPanel }      from '../components/home/CopilotPanel.jsx'

export default function HomePage() {
  const [copilotOpen, setCopilotOpen] = useState(false)

  return (
    <div className="flex h-full overflow-hidden">
      {/* Scrollable main content */}
      <div className="h-full min-w-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1800px] px-6 pt-6 pb-12 lg:px-8 2xl:px-12">
          <HomeControlCenter
            onCopilotOpen={() => setCopilotOpen(v => !v)}
            copilotOpen={copilotOpen}
          />
        </div>
      </div>
      {/* Sidebar copilot panel — h-full sibling, not a floating overlay */}
      <CopilotPanel isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  )
}
