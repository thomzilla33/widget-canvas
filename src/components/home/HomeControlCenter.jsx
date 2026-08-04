import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { WorkQueuesCard }          from './WorkQueuesCard.jsx'
import { MyTeamCard }              from './MyTeamCard.jsx'
import { MyAgentsCard }            from './MyAgentsCard.jsx'
import { WorkflowsCard }           from './WorkflowsCard.jsx'
import { HomeHero }                from './HomeHero.jsx'
import { AgentCatalog }            from './AgentCatalog.jsx'
import { PendingOutputsCard }      from './PendingOutputsCard.jsx'
import { PendingOutputsProvider }  from '../../state/PendingOutputsContext.jsx'
import { useRole }                 from '../../state/RoleContext.jsx'
import { WorkQueueHomeSection }    from './WorkQueueHomeSection.jsx'
import { HomeCanvas }              from './HomeCanvas.jsx'

export function HomeControlCenter({ onCopilotOpen, copilotOpen = false }) {
  const rootRef = useRef(null)
  const { isAdmin } = useRole()

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const cards = Array.from(rootRef.current?.querySelectorAll('.home-card') ?? [])
      if (!cards.length) return
      gsap.fromTo(cards,
        { y: 20 },
        { y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'transform', delay: 0.1 },
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const leftFlex  = copilotOpen ? 'lg:flex-[3]' : 'lg:flex-[2]'
  const rightFlex = copilotOpen ? 'lg:flex-[2]' : 'lg:flex-1'

  return (
    <PendingOutputsProvider>
      <div ref={rootRef} className="flex flex-col gap-6">
        <HomeHero onCopilotOpen={onCopilotOpen} copilotOpen={copilotOpen} />

        <div className={`flex flex-col gap-4 lg:flex-row`}>
          {/* Left column */}
          <div className={`flex min-w-0 flex-col gap-4 ${leftFlex}`}>
            <div className="home-card h-[480px]"><WorkQueuesCard /></div>
            <div className="home-card h-[360px]"><WorkflowsCard /></div>
          </div>
          {/* Right column */}
          <div className={`flex min-w-0 flex-col gap-4 ${rightFlex}`}>
            <div className="home-card h-[480px]">
              {isAdmin ? <MyTeamCard /> : <MyAgentsCard />}
            </div>
            <div className="home-card h-[360px]"><PendingOutputsCard /></div>
          </div>
        </div>

        {/* Full-width Agent Catalog — Admin only */}
        {isAdmin && (
          <div className="home-card">
            <AgentCatalog />
          </div>
        )}

        {/* Personalized widget canvas — user-configurable, persisted to localStorage */}
        <div className="home-card">
          <HomeCanvas />
        </div>
      </div>
    </PendingOutputsProvider>
  )
}
