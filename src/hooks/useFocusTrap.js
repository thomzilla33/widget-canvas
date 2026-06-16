import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Traps Tab focus inside a dialog: focuses the first focusable on mount, cycles
// Tab/Shift+Tab at the boundaries, and restores focus to the trigger on unmount.
// Attach the returned ref to the dialog panel (give it tabIndex={-1} as a fallback).
export function useFocusTrap(active = true) {
  const ref = useRef(null)
  useEffect(() => {
    if (!active) return undefined
    const node = ref.current
    if (!node) return undefined
    const prev = document.activeElement
    const focusables = () => [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)
    const f = focusables()
    ;(f[0] || node).focus?.()
    const onKey = (e) => {
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    node.addEventListener('keydown', onKey)
    return () => {
      node.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [active])
  return ref
}
