import { useEffect } from 'react'

// Tier 3 — the one floating-menu primitive. Encapsulates the bits every dropdown
// duplicated (a full-screen click-catcher to close, Escape-to-close, and the
// .surface-pop chrome) so callers only own their trigger + open state + contents.
// The caller renders <PopoverPanel> only while open.
export function PopoverPanel({ onClose, align = 'right', className = '', role = 'menu', children, ...rest }) {
  // Escape closes regardless of where focus sits (the panel isn't auto-focused),
  // so listen at the window rather than on the panel node.
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} aria-hidden="true" />
      <div
        role={role}
        className={`surface-pop absolute z-20 mt-1 ${align === 'left' ? 'left-0' : 'right-0'} ${className}`}
        {...rest}
      >
        {children}
      </div>
    </>
  )
}
