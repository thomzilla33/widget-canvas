import { Routes, Route, Navigate } from 'react-router-dom'
import { useRole } from './state/RoleContext.jsx'
import AppShell from './components/shell/AppShell.jsx'
import DashboardList from './pages/DashboardList.jsx'
import NewDashboard from './pages/NewDashboard.jsx'
import DashboardCanvas from './pages/DashboardCanvas.jsx'
import DashboardViewPage from './pages/DashboardViewPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import HomePage from './pages/HomePage.jsx'
import WidgetLibrary from './pages/WidgetLibrary.jsx'
import WidgetBuilder from './pages/WidgetBuilder.jsx'
import WidgetMarketplacePage from './pages/WidgetMarketplacePage.jsx'
import ProfilesPage from './pages/ProfilesPage.jsx'
import UCPView from './pages/UCPView.jsx'
import ModelsPage from './pages/ModelsPage.jsx'
import AttentionRoom from './pages/AttentionRoom.jsx'

// U7.2 — builder routes are admin-only; viewers are redirected to the read-only list.
function AdminRoute({ children }) {
  const { isAdmin } = useRole()
  return isAdmin ? children : <Navigate to="/dashboards" replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboards" replace />} />
        <Route path="/dashboards" element={<DashboardList />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard/new" element={<AdminRoute><NewDashboard /></AdminRoute>} />
        <Route path="/dashboard/:id/canvas" element={<DashboardCanvas />} />
        <Route path="/dashboard/:id" element={<DashboardViewPage />} />
        <Route path="/widgets" element={<WidgetLibrary />} />
        <Route path="/widgets/marketplace" element={<AdminRoute><WidgetMarketplacePage /></AdminRoute>} />
        <Route path="/widgets/new" element={<AdminRoute><WidgetBuilder /></AdminRoute>} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="/ucp/:entityId" element={<UCPView />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/home/attention" element={<AttentionRoom />} />
        <Route path="*" element={<Navigate to="/dashboards" replace />} />
      </Route>
    </Routes>
  )
}
