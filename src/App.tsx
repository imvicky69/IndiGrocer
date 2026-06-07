import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { SchoolsPage } from './pages/SchoolsPage'
import { AllocationsPage } from './pages/AllocationsPage'
import { BillsPage } from './pages/BillsPage'
import { ItemsPage } from './pages/ItemsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/schools" element={<SchoolsPage />} />
          <Route path="/allocations" element={<AllocationsPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}
