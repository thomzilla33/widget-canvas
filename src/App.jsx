import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/shell/AppShell.jsx'
import DashboardList from './pages/DashboardList.jsx'
import NewDashboard from './pages/NewDashboard.jsx'
import DashboardCanvas from './pages/DashboardCanvas.jsx'
import WidgetLibrary from './pages/WidgetLibrary.jsx'
import WidgetBuilder from './pages/WidgetBuilder.jsx'
import UCPView from './pages/UCPView.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboards" replace />} />
        <Route path="/dashboards" element={<DashboardList />} />
        <Route path="/dashboard/new" element={<NewDashboard />} />
        <Route path="/dashboard/:id/canvas" element={<DashboardCanvas />} />
        <Route path="/widgets" element={<WidgetLibrary />} />
        <Route path="/widgets/new" element={<WidgetBuilder />} />
        <Route path="/ucp/:entityId" element={<UCPView />} />
        <Route path="*" element={<Navigate to="/dashboards" replace />} />
      </Route>
    </Routes>
  )
}
