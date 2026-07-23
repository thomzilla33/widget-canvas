import { useCopilot } from '../state/CopilotContext.jsx'
import { HomeControlCenter } from '../components/home/HomeControlCenter.jsx'

export default function HomePage() {
  const { open, setOpen } = useCopilot()
  return (
    <div className="h-full min-w-0 flex-1 overflow-auto">
      <div className="mx-auto w-full max-w-[1800px] px-6 pt-6 pb-12 lg:px-8 2xl:px-12">
        <HomeControlCenter
          onCopilotOpen={() => setOpen(v => !v)}
          copilotOpen={open}
        />
      </div>
    </div>
  )
}
