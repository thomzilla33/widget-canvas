import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, Bell, Settings, ShieldCheck, Eye } from 'lucide-react'
import { useTheme } from '../../state/ThemeContext.jsx'
import { useRole } from '../../state/RoleContext.jsx'
import { useNotifications } from '../../state/NotificationsContext.jsx'
import { Topbar } from './Topbar.jsx'
import { Sidebar } from './Sidebar.jsx'
import NotificationsMenu from './NotificationsMenu.jsx'
import CommandPalette from './CommandPalette.jsx'
import './shell.css'

const NAV_ITEMS = [
  { id: 'home',       label: 'Home',       icon: 'Home' },
  { id: 'dashboards', label: 'Dashboards', icon: 'LayoutDashboard' },
  { id: 'reports',    label: 'Reports',    icon: 'FileBarChart' },
  { id: 'widgets',    label: 'Widgets',    icon: 'Boxes' },
  { id: 'profiles',   label: 'Profiles',   icon: 'UserRound' },
  { id: 'models',     label: 'Models',     icon: 'Package2' },
]

const ID_TO_PATH = {
  home:       '/home',
  dashboards: '/dashboards',
  reports:    '/reports',
  widgets:    '/widgets',
  profiles:   '/profiles',
  models:     '/models',
}

const WORKSPACES = [
  { id: 'composable', name: 'Composable Dashboards', tag: 'Active' },
  { id: 'agentic',    name: 'Agentic Studio',        tag: 'Member' },
  { id: 'governance', name: 'Governance',             tag: 'Member' },
]

export default function AppShell() {
  const [notifOpen, setNotifOpen] = useState(false)
  const [cmdOpen,   setCmdOpen]   = useState(false)
  const { theme, setTheme }       = useTheme()
  const { isAdmin, setAdmin }     = useRole()
  const { unreadCount }           = useNotifications()
  const location                  = useLocation()
  const navigate                  = useNavigate()

  const activeId = NAV_ITEMS.find(n => location.pathname.startsWith(ID_TO_PATH[n.id]))?.id

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setCmdOpen(v => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const topbarActions = [
    { icon: <Sparkles size={14} strokeWidth={1.75} />, label: 'AI Assistant', variant: 'primary' },
    {
      icon:    <Bell size={14} strokeWidth={1.75} />,
      label:   'Notifications',
      badge:   unreadCount > 0,
      onClick: () => setNotifOpen(v => !v),
    },
    { icon: <Settings size={14} strokeWidth={1.75} />, label: 'Settings' },
  ]

  const rolePill = (
    <button
      type="button"
      onClick={() => setAdmin(a => !a)}
      aria-pressed={isAdmin}
      title={isAdmin
        ? 'Admin — click to preview as Viewer'
        : 'Viewer (read-only) — click to switch to Admin'}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
        isAdmin
          ? 'border-aims-blue/30 bg-aims-blue/10 text-aims-blue'
          : 'border-[var(--border)] text-[var(--muted-foreground)]'
      }`}
    >
      {isAdmin ? <ShieldCheck size={11} /> : <Eye size={11} />}
      {isAdmin ? 'Admin' : 'Viewer'}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ── Fixed topbar ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, background: 'var(--shell-topbar-bg)', backdropFilter: 'blur(20px) saturate(1.8)', WebkitBackdropFilter: 'blur(20px) saturate(1.8)', borderBottom: '1px solid var(--shell-topbar-border)' }}>
        <Topbar
          workspaceName="Composable Dashboards"
          workspaces={WORKSPACES}
          selectedWorkspaceId="composable"
          searchPlaceholder="Search in this workspace…  ⌘K"
          onSearchFocus={() => setCmdOpen(true)}
          actions={topbarActions}
          companyName="Contoso Ltd"
          userName="Thomas Gonzalez"
          userEmail="thomas.gonzalez@aimsos.ai"
          theme={theme}
          onThemeChange={setTheme}
          beforeDivider={rolePill}
        />
      </div>

      {/* Notifications panel — floats below topbar */}
      {notifOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setNotifOpen(false)} />
          <div style={{ position: 'fixed', top: 44, right: 16, zIndex: 100 }}>
            <NotificationsMenu onClose={() => setNotifOpen(false)} />
          </div>
        </>
      )}

      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}

      {/* ── Body: sidebar + main ── */}
      <div style={{ display: 'flex', flex: 1, paddingTop: 36, overflow: 'hidden' }}>
        <Sidebar
          items={NAV_ITEMS}
          activeId={activeId}
          onItemClick={id => navigate(ID_TO_PATH[id])}
          defaultCollapsed={true}
        />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                      padding: '0 8px 8px 0' }}>
          <main className="main">
            <div className="views">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

    </div>
  )
}
