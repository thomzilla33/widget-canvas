import { useState, useRef, useEffect } from "react"
import { ChevronDown, Search, Menu, Settings, LogOut, HelpCircle, Sun, Moon, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Topbar — ported from AIMS OS Design System (topbar.tsx)
 * Source: Figma v6rmYKA2zmyXWOahlxLOeI · COMPONENT_SET 8603:52598
 *
 * Additions over DS original (prototype-specific):
 *  - `theme` + `onThemeChange` → theme toggle in RightMenu
 *  - `beforeDivider` render prop → custom content in right zone (e.g. role pill)
 */

function useClickOutside(ref, onClose) {
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [ref, onClose])
}

function TopbarAvatar({ name = "", src, size = 16 }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?"
  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-full overflow-hidden"
      style={{
        width: size, height: size,
        background:  src ? undefined : "var(--primary)",
        color:       "#ffffff",
        fontSize:    size * 0.44, fontWeight: 700, lineHeight: 1,
        boxShadow:   "0 0 0 1px var(--topbar-avatar-ring)",
      }}
    >
      {src
        ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : initials
      }
    </div>
  )
}

function LeftMenu({ workspaces, selectedId, onSelect }) {
  return (
    <div
      className="absolute left-0 top-[calc(100%+4px)] w-[320px] rounded-[10px] overflow-hidden z-50"
      style={{
        background: "var(--topbar-menu-bg)",
        border:     "1px solid var(--topbar-menu-border)",
        boxShadow:  "0 8px 24px rgba(0,0,0,0.28)",
      }}
    >
      <div className="px-[12px] pt-[12px] pb-[6px]">
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: "var(--topbar-menu-text-dim)" }}>
          Workspaces
        </span>
      </div>
      <div className="px-[6px] pb-[6px]">
        {workspaces.map(ws => {
          const isSelected = ws.id === selectedId
          return (
            <button
              key={ws.id}
              onClick={() => onSelect?.(ws.id)}
              className="w-full flex items-center gap-[8px] px-[8px] py-[6px] rounded-[6px] text-left transition-colors cursor-pointer"
              style={{ background: isSelected ? "var(--topbar-menu-item-sel)" : "transparent" }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--topbar-menu-item-hover)" }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent" }}
            >
              <TopbarAvatar name={ws.name} src={ws.avatarSrc} size={24} />
              <span className="flex-1 text-[12px] font-medium truncate"
                style={{ color: "var(--topbar-menu-text)" }}>
                {ws.name}
              </span>
              {ws.tag && (
                <span className="text-[10px] font-medium px-[6px] py-[2px] rounded-[4px] shrink-0"
                  style={{
                    background: ws.tag === "Active" ? "var(--topbar-menu-tag-act-bg)" : "var(--topbar-menu-tag-bg)",
                    color:      ws.tag === "Active" ? "var(--topbar-menu-tag-act-fg)" : "var(--topbar-menu-tag-fg)",
                  }}>
                  {ws.tag}
                </span>
              )}
              {isSelected && (
                <span className="w-[6px] h-[6px] rounded-full shrink-0"
                  style={{ background: "var(--primary)" }} />
              )}
            </button>
          )
        })}
      </div>
      <div className="px-[12px] py-[10px] border-t" style={{ borderColor: "var(--topbar-menu-border)" }}>
        <button className="text-[12px] font-medium cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: "var(--primary)" }}>
          + Create workspace
        </button>
      </div>
    </div>
  )
}

function RightMenu({ userName, userEmail, userAvatarSrc, theme, onThemeChange }) {
  const menuItems = [
    { icon: <Settings size={14} strokeWidth={1.75} />,   label: "Settings"       },
    { icon: <HelpCircle size={14} strokeWidth={1.75} />, label: "Help & Support" },
  ]

  return (
    <div
      className="absolute right-0 top-[calc(100%+4px)] w-[220px] rounded-[10px] overflow-hidden z-50"
      style={{
        background: "var(--topbar-menu-bg)",
        border:     "1px solid var(--topbar-menu-border)",
        boxShadow:  "0 8px 24px rgba(0,0,0,0.28)",
      }}
    >
      {/* User info */}
      <div className="flex items-center gap-[10px] px-[12px] py-[12px]">
        <TopbarAvatar name={userName || ""} src={userAvatarSrc} size={32} />
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold truncate" style={{ color: "var(--topbar-menu-text)" }}>
            {userName || "User"}
          </div>
          {userEmail && (
            <div className="text-[11px] truncate mt-[1px]" style={{ color: "var(--topbar-menu-text-dim)" }}>
              {userEmail}
            </div>
          )}
        </div>
      </div>

      <div className="mx-[8px] h-[1px]" style={{ background: "var(--topbar-menu-border)" }} />

      {/* Menu items */}
      <div className="px-[6px] py-[6px]">
        {menuItems.map(item => (
          <button key={item.label}
            className="w-full flex items-center gap-[8px] px-[8px] py-[7px] rounded-[6px] text-left transition-colors cursor-pointer"
            style={{ color: "var(--topbar-menu-text)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--topbar-menu-item-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ color: "var(--topbar-menu-text-dim)" }}>{item.icon}</span>
            <span className="text-[12px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Theme toggle */}
      {onThemeChange && (
        <>
          <div className="mx-[8px] h-[1px]" style={{ background: "var(--topbar-menu-border)" }} />
          <div className="px-[8px] py-[8px] flex items-center gap-[8px]">
            <Palette size={14} strokeWidth={1.75} style={{ color: "var(--topbar-menu-text-dim)", flexShrink: 0 }} />
            <span className="text-[12px] font-medium flex-1" style={{ color: "var(--topbar-menu-text)" }}>Theme</span>
            <div className="flex rounded-[6px] overflow-hidden"
              style={{ border: "1px solid var(--topbar-menu-border)" }}>
              {["light", "dark"].map(t => (
                <button key={t}
                  onClick={() => onThemeChange(t)}
                  className="flex items-center gap-[4px] px-[8px] py-[4px] text-[11px] font-semibold transition-colors cursor-pointer"
                  style={{
                    background: theme === t ? "var(--topbar-menu-item-sel)" : "transparent",
                    color:      theme === t ? "var(--primary)" : "var(--topbar-menu-text-dim)",
                  }}
                >
                  {t === "light" ? <Sun size={11} /> : <Moon size={11} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mx-[8px] h-[1px]" style={{ background: "var(--topbar-menu-border)" }} />

      {/* Sign out */}
      <div className="px-[6px] py-[6px]">
        <button
          className="w-full flex items-center gap-[8px] px-[8px] py-[7px] rounded-[6px] text-left transition-colors cursor-pointer"
          style={{ color: "var(--topbar-menu-text)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--topbar-menu-item-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ color: "var(--topbar-menu-text-dim)" }}><LogOut size={14} strokeWidth={1.75} /></span>
          <span className="text-[12px] font-medium">Sign out</span>
        </button>
      </div>
    </div>
  )
}

export function TopbarButton({ icon, label, badge = false, variant = "default", onClick }) {
  if (variant === "primary") {
    return (
      <button
        aria-label={label}
        onClick={onClick}
        className="relative w-[24px] h-[24px] flex items-center justify-center shrink-0 cursor-pointer transition-opacity hover:opacity-85 focus-visible:outline-none"
        style={{
          background:   "radial-gradient(circle at 61% 68%, rgba(33,115,255,1) 29%, rgba(9,226,171,1) 61%)",
          borderRadius: 8,
          boxShadow:    "4px 8px 12px 8px rgba(9,226,171,0.16)",
        }}
      >
        <span style={{ color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </span>
        {badge && (
          <span className="absolute top-0 right-0 w-[8px] h-[8px] rounded-full"
            style={{ background: "var(--topbar-badge-bg)" }} />
        )}
      </button>
    )
  }

  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative w-[24px] h-[24px] flex items-center justify-center rounded-[4px] shrink-0",
        "text-[var(--topbar-icon)]",
        "hover:bg-[var(--topbar-btn-hover-bg)]",
        "focus-visible:bg-[var(--topbar-btn-focus-bg)] outline-none",
        "transition-colors cursor-pointer",
      )}
    >
      {icon}
      {badge && (
        <span className="absolute top-0 right-0 w-[8px] h-[8px] rounded-full"
          style={{ background: "var(--topbar-badge-bg)" }} />
      )}
    </button>
  )
}

export function Topbar({
  workspaceName        = "Product Name",
  workspaceAvatarSrc,
  workspaces           = [],
  selectedWorkspaceId,
  onWorkspaceSelect,
  onWorkspaceClick,
  searchPlaceholder    = "Search…",
  onSearchFocus,
  actions              = [],
  companyName          = "Company",
  companyAvatarSrc,
  onCompanyClick,
  userName             = "User",
  userEmail,
  userAvatarSrc,
  onProfileClick,
  variant              = "default",
  onMenuClick,
  className,
  theme,
  onThemeChange,
  beforeDivider,
}) {
  const isTablet  = variant === "tablet"
  const height    = isTablet ? 34 : 36
  const leftWidth = isTablet ? 172 : 140

  const [leftMenuOpen,  setLeftMenuOpen]  = useState(false)
  const [rightMenuOpen, setRightMenuOpen] = useState(false)
  const leftRef  = useRef(null)
  const rightRef = useRef(null)

  useClickOutside(leftRef,  () => setLeftMenuOpen(false))
  useClickOutside(rightRef, () => setRightMenuOpen(false))

  const zoneBase         = "flex items-center rounded-[8px] transition-all duration-150"
  const zoneBorderIdle   = "border border-[var(--topbar-workspace-border)]"
  const zoneBorderActive = "border border-[var(--topbar-zone-hover-bd)] bg-[var(--topbar-zone-hover-bg)]"
  const zoneHover        = "hover:border-[var(--topbar-zone-hover-bd)] hover:bg-[var(--topbar-zone-hover-bg)]"

  return (
    <header className={cn("w-full flex flex-col", className)} style={{ height }}>

      <div className="flex items-center justify-between h-[28px] mt-[4px] px-[8px]">

        {/* LEFT ZONE — workspace selector */}
        <div ref={leftRef} className="relative shrink-0">
          <div
            className={cn(
              zoneBase, zoneBorderIdle, zoneHover,
              leftMenuOpen && zoneBorderActive,
              "gap-[8px] cursor-pointer",
            )}
            style={{ width: leftWidth, height: 28, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 }}
          >
            {isTablet && (
              <button
                aria-label="Open navigation"
                onClick={onMenuClick}
                className={cn(
                  "w-[24px] h-[24px] flex items-center justify-center rounded-[4px] shrink-0",
                  "text-[var(--topbar-icon)] hover:bg-[var(--topbar-btn-hover-bg)]",
                  "focus-visible:bg-[var(--topbar-btn-focus-bg)] outline-none transition-colors cursor-pointer",
                )}
              >
                <Menu size={14} strokeWidth={1.75} />
              </button>
            )}
            <TopbarAvatar name={workspaceName} src={workspaceAvatarSrc} />
            <button
              className="flex items-center gap-[6px] flex-1 min-w-0 cursor-pointer"
              onClick={() => {
                if (workspaces.length > 0) {
                  setLeftMenuOpen(v => !v)
                  setRightMenuOpen(false)
                } else {
                  onWorkspaceClick?.()
                }
              }}
              aria-label="Switch workspace"
            >
              <span className="text-[10px] font-semibold truncate flex-1 text-left"
                style={{ color: "var(--topbar-text)" }}>
                {workspaceName}
              </span>
              <ChevronDown
                size={12} strokeWidth={2}
                className={cn("shrink-0 transition-transform duration-150", leftMenuOpen && "rotate-180")}
                style={{ color: "var(--topbar-icon)" }}
              />
            </button>
          </div>

          {leftMenuOpen && workspaces.length > 0 && (
            <LeftMenu
              workspaces={workspaces}
              selectedId={selectedWorkspaceId}
              onSelect={id => { onWorkspaceSelect?.(id); setLeftMenuOpen(false) }}
            />
          )}
        </div>

        {/* CENTER ZONE — search trigger */}
        <div className="w-[250px] h-[24px] shrink-0">
          <div
            role="button"
            aria-label={searchPlaceholder}
            className="w-full h-full flex items-center gap-[6px] px-[8px] cursor-text transition-opacity hover:opacity-80"
            style={{ background: "var(--topbar-search-bg)", border: "1px solid var(--topbar-search-border)", borderRadius: 6 }}
            onClick={onSearchFocus}
          >
            <Search size={12} strokeWidth={1.75} className="shrink-0"
              style={{ color: "var(--topbar-text-secondary)" }} />
            <span className="text-[11px] flex-1 truncate select-none"
              style={{ color: "var(--topbar-text-secondary)" }}>
              {searchPlaceholder}
            </span>
          </div>
        </div>

        {/* RIGHT ZONE */}
        <div className="flex items-center gap-[8px] shrink-0" style={{ height: 28 }}>

          {/* 3 action buttons */}
          <div className="flex items-center gap-[4px]" style={{ height: 24 }}>
            {actions.slice(0, 3).map((a, i) => (
              <TopbarButton key={i} icon={a.icon} label={a.label} badge={a.badge}
                variant={a.variant} onClick={a.onClick} />
            ))}
          </div>

          {/* Custom slot before divider (role pill, etc.) */}
          {beforeDivider}

          {/* Vertical divider */}
          <div className="shrink-0" style={{ width: 1, height: 28, background: "var(--topbar-divider)" }} />

          {/* Sub-group B: company + profile */}
          <div ref={rightRef} className="relative shrink-0">
            <div
              className={cn(
                zoneBase, zoneBorderIdle, zoneHover,
                rightMenuOpen && zoneBorderActive,
                "gap-[8px] cursor-pointer",
              )}
              style={{ width: 136, height: 28, paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 }}
            >
              <button
                className="flex items-center gap-[4px] flex-1 min-w-0 cursor-pointer"
                onClick={onCompanyClick}
                aria-label="Switch company"
              >
                <TopbarAvatar name={companyName} src={companyAvatarSrc} />
                <span className="text-[10px] truncate flex-1 text-left"
                  style={{ color: "var(--topbar-text-secondary)" }}>
                  {companyName}
                </span>
              </button>
              <button
                className="shrink-0 cursor-pointer rounded-full transition-all hover:ring-1 hover:ring-[var(--topbar-avatar-ring)]"
                onClick={() => { setRightMenuOpen(v => !v); setLeftMenuOpen(false); onProfileClick?.() }}
                aria-label="Profile menu"
              >
                <TopbarAvatar name={userName} src={userAvatarSrc} />
              </button>
            </div>

            {rightMenuOpen && (
              <RightMenu
                userName={userName}
                userEmail={userEmail}
                userAvatarSrc={userAvatarSrc}
                theme={theme}
                onThemeChange={v => { onThemeChange?.(v); setRightMenuOpen(false) }}
              />
            )}
          </div>

        </div>
      </div>

      {/* Bottom divider */}
      <div className="flex-1 border-b" style={{ borderColor: "var(--topbar-divider)" }} />

    </header>
  )
}
