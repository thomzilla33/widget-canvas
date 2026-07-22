import { CopilotProvider, useCopilot } from '../state/CopilotContext.jsx'
import { HomeControlCenter } from '../components/home/HomeControlCenter.jsx'
import { CopilotPanel }      from '../components/home/CopilotPanel.jsx'

function HomeInner() {
  const { open, setOpen } = useCopilot()
  return (
    <div className="flex h-full overflow-hidden">
      <div className="h-full min-w-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1800px] px-6 pt-6 pb-12 lg:px-8 2xl:px-12">
          <HomeControlCenter
            onCopilotOpen={() => setOpen(v => !v)}
            copilotOpen={open}
          />
        </div>
      </div>
      <CopilotPanel isOpen={open} onClose={() => setOpen(false)} />
    </div>
  )
}

export default function HomePage() {
  return (
    <CopilotProvider>
      <HomeInner />
    </CopilotProvider>
  )
}
