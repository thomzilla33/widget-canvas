import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { MyAttentionCard }  from './MyAttentionCard.jsx'
import { MyDayCard }        from './MyDayCard.jsx'
import { WorkflowsCard }    from './WorkflowsCard.jsx'
import { AgentsCard }       from './AgentsCard.jsx'
import { StudioHealthCard }  from './StudioHealthCard.jsx'
import { HomeHero }         from './HomeHero.jsx'
import { ScopeToggle }      from './ScopeToggle.jsx'

export function HomeControlCenter({ onCopilotOpen, copilotOpen = false }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const cards = Array.from(rootRef.current?.querySelectorAll('.home-grid > div') ?? [])
      if (!cards.length) return
      gsap.fromTo(cards,
        { y: 20 },
        { y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out',
          clearProps: 'transform', delay: 0.1 },
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <>
      <div ref={rootRef} className="flex flex-col gap-6">
        <HomeHero onCopilotOpen={onCopilotOpen} copilotOpen={copilotOpen} />
        <div className={`bento-grid home-grid grid grid-cols-1 gap-4 lg:items-start ${copilotOpen ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
          {/* copilot closed: work=2/3, myday=1/3 | copilot open: work=1/2, myday=1/2 */}
          <div id="home-work"      className={copilotOpen ? '' : 'lg:col-span-2'}><MyAttentionCard /></div>
          <div id="home-myday"><MyDayCard /></div>
          {/* workflows: col-span-2 = 2/3 in 3-col, full-width in 2-col */}
          <div id="home-workflows" className="lg:col-span-2"><WorkflowsCard /></div>
          <AgentsCard />
          <div className={copilotOpen ? 'lg:col-span-2' : 'lg:col-span-3'}><StudioHealthCard /></div>
        </div>
      </div>
      <ScopeToggle />
    </>
  )
}
