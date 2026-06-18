import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

// Honor the OS "reduce motion" setting — no animation, content renders as-is.
const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Staggered fade + rise for a container's children — the "high-end" page-load reveal.
// Performance: animates only transform (y) + opacity (autoAlpha), so it stays on the
// compositor (no layout/paint). useLayoutEffect sets the from-state before paint (no
// flash); gsap.context reverts cleanly on unmount or when `key` changes (re-reveal).
export function useStaggerReveal(key, { y = 14, stagger = 0.045, duration = 0.5, selector } = {}) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReduced()) return
    const targets = selector ? el.querySelectorAll(selector) : el.children
    if (!targets || targets.length === 0) return
    const ctx = gsap.context(() => {
      // fromTo (not from) with an explicit visible end-state — immune to React 18
      // StrictMode's double-invoked effect, which would make `from` capture the
      // transient hidden value as its target and leave content stuck at opacity 0.
      gsap.fromTo(targets, { y, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration, stagger, ease: 'power2.out' })
    }, el)
    return () => ctx.revert()
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  return ref
}

// Subtle scale + fade entrance for a modal/dialog card. Transform + opacity only.
// Accepts an existing ref (e.g. a focus-trap ref) so it can share one node.
export function useModalEnter(externalRef) {
  const innerRef = useRef(null)
  const ref = externalRef || innerRef
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { autoAlpha: 0, y: 10, scale: 0.985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'power3.out', transformOrigin: 'center' })
    }, el)
    return () => ctx.revert()
  }, [])
  return ref
}
