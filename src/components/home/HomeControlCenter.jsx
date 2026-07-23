import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { WorkQueuesCard }   from './WorkQueuesCard.jsx'
import { MyTeamCard }       from './MyTeamCard.jsx'
import { WorkflowsCard }    from './WorkflowsCard.jsx'
import { AgentsCard }       from './AgentsCard.jsx'
import { StudioHealthCard } from './StudioHealthCard.jsx'
import { HomeHero }         from './HomeHero.jsx'
import { ScopeToggle }      from './ScopeToggle.jsx'

export function HomeControlCenter({ onCopilotOpen, copilotOpen = false }) {
  const rootRef = useRef(null)

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

  // Left column is wider in normal mode; slightly narrower in copilot mode
  const leftFlex  = copilotOpen ? 'lg:flex-[3]' : 'lg:flex-[2]'
  const rightFlex = copilotOpen ? 'lg:flex-[2]' : 'lg:flex-1'

  return (
    <>
      <div ref={rootRef} className="flex flex-col gap-6">
        <HomeHero onCopilotOpen={onCopilotOpen} copilotOpen={copilotOpen} />

        {/* Two independent flex columns — no cross-row height coupling */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* Left column: work queue + workflows */}
          <div className={`flex min-w-0 flex-col gap-4 ${leftFlex}`}>
            <div className="home-card"><WorkQueuesCard /></div>
            <div className="home-card"><WorkflowsCard /></div>
          </div>

          {/* Right column: team + agents */}
          <div className={`flex min-w-0 flex-col gap-4 ${rightFlex}`}>
            <div className="home-card"><MyTeamCard /></div>
            <div className="home-card"><AgentsCard /></div>
          </div>
        </div>

        {/* Full-width bottom row */}
        <div className="home-card">
          <StudioHealthCard />
        </div>
      </div>
      <ScopeToggle />
    </>
  )
}
