import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Boxes, UserRound, Sun, Moon, Palette, Settings, LogOut, Home, FileBarChart, Table2, Database, ShieldCheck, Eye } from 'lucide-react'
import { useTheme } from '../../state/ThemeContext.jsx'
import { useRole } from '../../state/RoleContext.jsx'
import { useNotifications } from '../../state/NotificationsContext.jsx'
import NotificationsMenu from './NotificationsMenu.jsx'
import CommandPalette from './CommandPalette.jsx'
import './shell.css'

// Sidebar nav — Composable Dashboards surfaces, in the Agentic shell style.
const adminNav = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/dashboards', label: 'Dashboards', icon: LayoutDashboard },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/widgets', label: 'Widgets', icon: Boxes },
  { to: '/tables', label: 'Tables', icon: Table2 },
  { to: '/data-studio', label: 'Data Studio', icon: Database },
]
const userNav = [{ to: '/profiles', label: 'Profiles', icon: UserRound }]

// App switcher entries (the other AIMS OS prototypes are separate apps).
const ctxApps = [
  { id: 'composable', name: 'Composable Dashboards', desc: 'Widgets & dashboards', initials: 'CD', current: true },
  { id: 'agentic', name: 'Agentic Studio', desc: 'Agents & workflows', initials: 'AS' },
  { id: 'governance', name: 'Governance', desc: 'Policies & knowledge', initials: 'GS' },
]

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      title={label}
      aria-label={label}
      className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
    >
      <span className="sb-item-icon">
        <Icon strokeWidth={1.6} />
      </span>
      <span className="sb-label">{label}</span>
    </NavLink>
  )
}

export default function AppShell() {
  const [expanded, setExpanded] = useState(false)
  const [ctxOpen, setCtxOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { isAdmin, setAdmin } = useRole()
  const { unreadCount } = useNotifications()

  // Global ⌘K / Ctrl+K opens the command palette.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setCmdOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {/* ═══ TOPBAR ═══ */}
      <header className="topbar">
        <div className="tb-left">
          <div className="tb-context-wrap">
            <button
              type="button"
              className={`tb-context ${ctxOpen ? 'cm-open' : ''}`}
              onClick={() => setCtxOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={ctxOpen}
            >
              <div
                className="tb-context-logo"
                style={{ background: 'linear-gradient(135deg,#00C2C2 0%,#155DFC 100%)' }}
              >
                CD
              </div>
              <span className="tb-context-name">Composable Dashboards</span>
              <svg className="tb-context-chev" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 4.5L6 8l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className={`ctx-menu ${ctxOpen ? 'open' : ''}`} role="menu" aria-label="App switcher">
              {ctxApps.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`ctx-item ${a.current ? 'active' : ''}`}
                  onClick={() => setCtxOpen(false)}
                >
                  <span
                    className="ctx-item-logo"
                    style={{ background: 'linear-gradient(135deg,#00C2C2 0%,#155DFC 100%)' }}
                  >
                    {a.initials}
                  </span>
                  <span>
                    <span className="ctx-item-name" style={{ display: 'block' }}>
                      {a.name}
                    </span>
                    <span className="ctx-item-desc">{a.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="button" className="tb-search" aria-label="Open global search" onClick={() => setCmdOpen(true)}>
          <svg className="tb-search-ic" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span className="tb-search-placeholder">Search in this workspace…</span>
          <kbd className="tb-search-kbd" aria-hidden="true">
            ⌘K
          </kbd>
        </button>

        <div className="tb-right">
          {/* U7.2 — role toggle: Admin can build/edit; Viewer is read-only */}
          <button
            type="button"
            onClick={() => setAdmin((a) => !a)}
            aria-pressed={isAdmin}
            title={isAdmin ? 'You are an Admin — click to preview as a Viewer (read-only)' : 'You are a Viewer (read-only) — click to switch to Admin'}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
              isAdmin
                ? 'border-aims-blue/30 bg-aims-blue/10 text-aims-blue'
                : 'border-gray-300 text-gray-500 dark:border-white/15 dark:text-slate-400'
            }`}
          >
            {isAdmin ? <ShieldCheck size={13} /> : <Eye size={13} />}
            {isAdmin ? 'Admin' : 'Viewer'}
          </button>
          <button className="icon-btn" aria-label="AI Assistant">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2.5c.5 0 1 .4 1.1.9l1.1 4.9c.1.3.3.5.6.6l4.9 1.1c.5.1.9.6.9 1.1s-.4 1-.9 1.1l-4.9 1.1c-.3.1-.5.3-.6.6l-1.1 4.9c-.1.5-.6.9-1.1.9s-1-.4-1.1-.9l-1.1-4.9c-.1-.3-.3-.5-.6-.6l-4.9-1.1c-.5-.1-.9-.6-.9-1.1s.4-1 .9-1.1l4.9-1.1c.3-.1.5-.3.6-.6l1.1-4.9c.1-.5.6-.9 1.1-.9z"
                fill="currentColor"
              />
            </svg>
          </button>
          <span className="notif-bell-wrap">
            <button
              className="icon-btn"
              aria-label="Notifications"
              aria-haspopup="dialog"
              aria-expanded={notifOpen}
              onClick={() => {
                setNotifOpen((v) => !v)
                setCtxOpen(false)
                setAvatarOpen(false)
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2a4 4 0 014 4c0 3 1 4 1 4H3s1-1 1-4a4 4 0 014-4zM6.5 12.5a1.5 1.5 0 003 0"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {unreadCount > 0 && <span className="notif-bell-dot">{unreadCount}</span>}
            {notifOpen && <NotificationsMenu onClose={() => setNotifOpen(false)} />}
          </span>
          <button className="icon-btn" aria-label="Settings">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <span className="tb-divider-v" aria-hidden="true" />
          <div className="tb-identity" role="group" aria-label="Workspace and account">
            <button
              className="tb-ws-badge"
              type="button"
              aria-label="Open account menu"
              aria-haspopup="menu"
              aria-expanded={avatarOpen}
              onClick={() => {
                setAvatarOpen((v) => !v)
                setCtxOpen(false)
              }}
            >
              <span className="tb-ws-badge-logo">CL</span>
              <span className="tb-ws-badge-name">Contoso Ltd</span>
            </button>
            <div className="tb-avatar-wrap">
              <button
                className="avatar-sm"
                type="button"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={avatarOpen}
                onClick={() => {
                  setAvatarOpen((v) => !v)
                  setCtxOpen(false)
                }}
              >
                TH
              </button>
              <div className={`avatar-menu ${avatarOpen ? 'open' : ''}`} role="menu" aria-label="Account and workspace">
                <div className="am-head">
                  <span className="am-head-avatar">TH</span>
                  <div>
                    <div className="am-head-name">Thomas Gonzalez</div>
                    <div className="am-head-email">thomas.gonzalez@aimsos.ai</div>
                  </div>
                </div>

                <div className="am-section">
                  <div className="am-section-hd">Workspace</div>
                  <button className="am-ws-card" type="button">
                    <span className="am-ws-ico">CL</span>
                    <span className="am-ws-info">
                      <span className="am-ws-name">Contoso Ltd</span>
                      <span className="am-ws-role">Admin</span>
                    </span>
                  </button>
                </div>

                <div className="am-section">
                  <div className="am-theme-row" role="group" aria-label="Theme">
                    <Palette size={15} />
                    <span className="am-theme-label">Theme</span>
                    <div className="am-theme-seg" role="radiogroup" aria-label="Theme">
                      <button
                        type="button"
                        className={`am-theme-btn ${theme === 'light' ? 'is-active' : ''}`}
                        role="radio"
                        aria-checked={theme === 'light'}
                        onClick={() => setTheme('light')}
                        title="Light"
                      >
                        <Sun size={13} /> Light
                      </button>
                      <button
                        type="button"
                        className={`am-theme-btn ${theme === 'dark' ? 'is-active' : ''}`}
                        role="radio"
                        aria-checked={theme === 'dark'}
                        onClick={() => setTheme('dark')}
                        title="Dark"
                      >
                        <Moon size={13} /> Dark
                      </button>
                    </div>
                  </div>
                </div>

                <div className="am-section">
                  <button className="am-item" type="button">
                    <Settings size={15} /> Account settings
                  </button>
                  <button className="am-item is-danger" type="button">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {(ctxOpen || avatarOpen || notifOpen) && (
        <div
          className="menu-backdrop"
          onClick={() => {
            setCtxOpen(false)
            setAvatarOpen(false)
            setNotifOpen(false)
          }}
        />
      )}

      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}

      {/* ═══ APP (sidebar + main) ═══ */}
      <div className="app">
        <nav className={`sidebar ${expanded ? 'sb-expanded' : ''}`} aria-label="Main navigation">
          <div className="sb-nav">
            <div className="sb-section-label">Admin</div>
            {adminNav.map((n) => (
              <NavItem key={n.to} {...n} />
            ))}
            <div className="sb-divider" />
            <div className="sb-section-label">End user</div>
            {userNav.map((n) => (
              <NavItem key={n.to} {...n} />
            ))}
          </div>
          <div className="sb-bottom">
            <button
              className="sb-toggle"
              type="button"
              onClick={() => setExpanded((v) => !v)}
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
              aria-expanded={expanded}
            >
              <svg
                className="sb-toggle-icon"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4L6 9l5 5" />
                <line x1="3" y1="3" x2="3" y2="15" />
              </svg>
              <span className="sb-toggle-label">Collapse</span>
            </button>
          </div>
        </nav>

        <main className="main">
          <div className="views">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  )
}
