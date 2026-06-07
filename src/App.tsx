import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './providers/AuthProvider'
import { ToastProvider } from './providers/ToastProvider'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicRoute } from './routes/PublicRoute'
import { RoleGuard } from './routes/RoleGuard'

// Layout
import { AppLayout } from './components/AppLayout'

// Pages
import { LoginPage } from './pages/auth/LoginPage'
import { OtpVerificationPage } from './pages/auth/OtpVerificationPage'
import { UnauthorizedPage } from './pages/errors/UnauthorizedPage'
import { DashboardPage } from './pages/DashboardPage'
import { SchoolsPage } from './pages/SchoolsPage'
import { AllocationsPage } from './pages/AllocationsPage'
import { BillsPage } from './pages/BillsPage'
import { ItemsPage } from './pages/ItemsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Authentication Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/verify" element={<OtpVerificationPage />} />
              </Route>

              {/* Unauthorized page - public but handles authenticated states too */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  {/* Dashboard page - accessible to all logged-in roles */}
                  <Route path="/" element={<DashboardPage />} />
                  
                  {/* Schools management - super_admin and billing_staff only */}
                  <Route element={<RoleGuard allowedRoles={['super_admin', 'billing_staff']} />}>
                    <Route path="/schools" element={<SchoolsPage />} />
                  </Route>

                  {/* Allocations - all roles */}
                  <Route path="/allocations" element={<AllocationsPage />} />

                  {/* Bills - all roles */}
                  <Route path="/bills" element={<BillsPage />} />

                  {/* Items - super_admin and billing_staff only */}
                  <Route element={<RoleGuard allowedRoles={['super_admin', 'billing_staff']} />}>
                    <Route path="/items" element={<ItemsPage />} />
                  </Route>

                  {/* Reports - all roles */}
                  <Route path="/reports" element={<ReportsPage />} />

                  {/* Settings - super_admin only */}
                  <Route element={<RoleGuard allowedRoles={['super_admin']} />}>
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
