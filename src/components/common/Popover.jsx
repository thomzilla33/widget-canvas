// Tier 3 — the one floating-menu primitive. Encapsulates the bits every dropdown
// duplicated (a full-screen click-catcher to close, Escape-to-close, and the
// .surface-pop chrome) so callers only own their trigger + open state + contents.
// The caller renders <PopoverPanel> only while open.
export function PopoverPanel({ onClose, align = 'right', className = '', role = 'menu', children }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} aria-hidden="true" />
      <div
        role={role}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
        className={`surface-pop absolute z-20 mt-1 ${align === 'left' ? 'left-0' : 'right-0'} ${className}`}
      >
        {children}
      </div>
    </>
  )
}
