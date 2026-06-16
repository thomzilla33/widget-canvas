import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/shell/AppShell.jsx'
import DashboardList from './pages/DashboardList.jsx'
import NewDashboard from './pages/NewDashboard.jsx'
import DashboardCanvas from './pages/DashboardCanvas.jsx'
import DashboardViewPage from './pages/DashboardViewPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import HomePage from './pages/HomePage.jsx'
import WidgetLibrary from './pages/WidgetLibrary.jsx'
import WidgetBuilder from './pages/WidgetBuilder.jsx'
import TablesPage from './pages/TablesPage.jsx'
import UCPView from './pages/UCPView.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboards" replace />} />
        <Route path="/dashboards" element={<DashboardList />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard/new" element={<NewDashboard />} />
        <Route path="/dashboard/:id/canvas" element={<DashboardCanvas />} />
        <Route path="/dashboard/:id" element={<DashboardViewPage />} />
        <Route path="/widgets" element={<WidgetLibrary />} />
        <Route path="/widgets/new" element={<WidgetBuilder />} />
        <Route path="/tables" element={<TablesPage />} />
        <Route path="/ucp/:entityId" element={<UCPView />} />
        <Route path="*" element={<Navigate to="/dashboards" replace />} />
      </Route>
    </Routes>
  )
}
