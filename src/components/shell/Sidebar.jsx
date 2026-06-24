import { useState, useRef, useEffect } from "react"
import * as LucideIcons from "lucide-react"

/**
 * Sidebar — ported from AIMS OS Design System (sidebar.tsx)
 * Source: Figma v6rmYKA2zmyXWOahlxLOeI
 *
 * Collapsed: 56px wide · Expanded: 250px wide.
 * Sidebar is always dark (var(--sb-bg) ≈ near-black in both themes).
 */

const ACTIVE_GRADIENT  = "radial-gradient(circle at 61% 68%, rgba(33,115,255,1) 29%, rgba(9,226,171,1) 61%)"
const ACTIVE_SHADOW    = "8px 8px 20px 0px rgba(82,163,255,0.38)"
const HOVER_SHADOW     = "0px 0px 20px 0px rgba(33,115,255,0.50)"
const CONTAINER_SHADOW = "8px 8px 16px 0px rgba(0,0,0,0.08)"

function NavIcon({ name, size = 16, color }) {
  const Icon = LucideIcons[name]
  if (!Icon) return null
  return <Icon size={size} strokeWidth={1.75} color={color} />
}

function SidebarTooltip({ label, visible }) {
  if (!visible) return null
  return (
    <div
      role="tooltip"
      className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none"
      style={{
        background: "rgba(22,22,22,1)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 6,
        padding: "4px 10px",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.90)" }}>
        {label}
      </span>
    </div>
  )
}

function IconBtn({ iconName, label, isActive = false, showTooltip = false, onClick }) {
  const [hovered, setHovered] = useState(false)
  const iconColor = isActive || hovered ? "var(--sb-icon-active)" : "var(--sb-icon-default)"
  let bg     = "transparent"
  let shadow = "none"
  if (isActive)      { bg = ACTIVE_GRADIENT; shadow = ACTIVE_SHADOW }
  else if (hovered)  { bg = "var(--sb-icon-hover-bg)"; shadow = HOVER_SHADOW }

  return (
    <div className="relative" style={{ width: 24, height: 24 }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={label}
        className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px] transition-all duration-150 focus-visible:outline-none"
        style={{ background: bg, boxShadow: shadow, padding: 4 }}
      >
        <NavIcon name={iconName} size={16} color={iconColor} />
      </button>
      {showTooltip && <SidebarTooltip label={label} visible={hovered} />}
    </div>
  )
}

function ExpandedNavItem({ item, isActive, isFirst, onItemClick, onToggleCollapse }) {
  const [rowHovered, setRowHovered] = useState(false)
  const iconBg     = isActive ? ACTIVE_GRADIENT : rowHovered ? "var(--sb-icon-hover-bg)" : "transparent"
  const iconShadow = isActive ? ACTIVE_SHADOW    : rowHovered ? HOVER_SHADOW              : "none"
  const iconColor  = isActive || rowHovered ? "var(--sb-icon-active)" : "var(--sb-icon-default)"
  const rowBg      = !isActive && rowHovered ? "var(--sb-row-hover)" : "transparent"

  return (
    <button
      onClick={() => onItemClick?.(item.id)}
      onMouseEnter={() => setRowHovered(true)}
      onMouseLeave={() => setRowHovered(false)}
      aria-label={item.label}
      className="flex items-center w-full h-[24px] rounded-[8px] transition-all duration-150 focus-visible:outline-none"
      style={{ background: rowBg, paddingRight: 4, paddingLeft: 0, gap: 8, justifyContent: "space-between" }}
    >
      <div className="flex items-center gap-[8px]">
        <div
          className="w-[24px] h-[24px] flex items-center justify-center rounded-[8px] shrink-0 transition-all duration-150"
          style={{ background: iconBg, boxShadow: iconShadow, padding: 4 }}
        >
          <NavIcon name={item.icon} size={16} color={iconColor} />
        </div>
        <span className="text-[12px] font-semibold leading-none whitespace-nowrap"
          style={{ color: "var(--sb-text)" }}>
          {item.label}
        </span>
      </div>

      {isFirst ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Collapse sidebar"
          onClick={e => { e.stopPropagation(); onToggleCollapse() }}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onToggleCollapse() } }}
          onMouseEnter={e => e.stopPropagation()}
          className="w-[16px] h-[16px] flex items-center justify-center shrink-0 transition-opacity hover:opacity-70 focus-visible:outline-none"
        >
          <NavIcon name="PanelLeftClose" size={16} color="var(--sb-icon-default)" />
        </div>
      ) : item.hasChildren ? (
        <div className="w-[16px] h-[16px] flex items-center justify-center shrink-0">
          <NavIcon name="ChevronRight" size={16}
            color={isActive ? "var(--sb-chevron-active)" : "var(--sb-icon-default)"} />
        </div>
      ) : null}
    </button>
  )
}

export function Sidebar({
  items = [],
  activeId,
  onItemClick,
  defaultCollapsed = true,
  onCollapseChange,
  className = "",
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const prevDefault = useRef(defaultCollapsed)
  useEffect(() => {
    if (prevDefault.current !== defaultCollapsed) {
      setCollapsed(defaultCollapsed)
      prevDefault.current = defaultCollapsed
    }
  }, [defaultCollapsed])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    onCollapseChange?.(next)
  }

  if (collapsed) {
    return (
      <div className={`flex flex-col shrink-0 h-full ${className}`} style={{ width: 56, padding: 8 }}>
        <div
          className="flex flex-col items-center gap-[16px]"
          style={{ background: "var(--sb-bg)", borderRadius: 8, padding: 8,
                   boxShadow: CONTAINER_SHADOW, height: "100%" }}
        >
          <IconBtn iconName="PanelLeftOpen" label="Expand sidebar" showTooltip onClick={toggle} />
          {items.map(item => (
            <IconBtn
              key={item.id}
              iconName={item.icon}
              label={item.label}
              isActive={item.id === activeId}
              showTooltip
              onClick={() => onItemClick?.(item.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col shrink-0 h-full ${className}`} style={{ width: 250, padding: 8 }}>
      <div
        className="flex flex-col gap-[16px]"
        style={{ background: "var(--sb-bg)", borderRadius: 16, padding: 8,
                 boxShadow: CONTAINER_SHADOW, height: "100%" }}
      >
        {items.map((item, index) => (
          <ExpandedNavItem
            key={item.id}
            item={item}
            isActive={item.id === activeId}
            isFirst={index === 0}
            onItemClick={onItemClick}
            onToggleCollapse={toggle}
          />
        ))}
      </div>
    </div>
  )
}
