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

  return (
    <PendingOutputsProvider>
      <div ref={rootRef} className="flex flex-col gap-5">
        <HomeHero onCopilotOpen={onCopilotOpen} copilotOpen={copilotOpen} />

        {/* Primary work surface — My Work (65%) | My Team (35%) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[65fr_35fr]">
          <div className="home-card h-[520px]"><WorkQueuesCard /></div>
          <div className="home-card h-[520px]">
            {isAdmin ? <MyTeamCard /> : <MyAgentsCard />}
          </div>
        </div>

        {/* Secondary panels — below the fold */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="home-card h-[360px]"><WorkflowsCard /></div>
          <div className="home-card h-[360px]"><PendingOutputsCard /></div>
        </div>

        {/* Agent Catalog — Admin only */}
        {isAdmin && (
          <div className="home-card">
            <AgentCatalog />
          </div>
        )}

        {/* My Widgets — V2 */}
        <div className="home-card">
          <HomeCanvas />
        </div>
      </div>
    </PendingOutputsProvider>
  )
}
