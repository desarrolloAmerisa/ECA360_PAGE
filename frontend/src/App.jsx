import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext'
import PublicLayout from './components/layout/PublicLayout'
import HomePage from './pages/HomePage'
import EventPage from './pages/EventPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import RequireAuth from './components/admin/RequireAuth'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminEventsPage from './pages/admin/AdminEventsPage'
import AdminEventEditorPage from './pages/admin/AdminEventEditorPage'
import AdminCommentsPage from './pages/admin/AdminCommentsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'

function AppToaster() {
  const { settings } = useSiteSettings()
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: { borderRadius: 0, fontSize: 13 },
        success: { iconTheme: { primary: settings.color_brand, secondary: '#fff' } },
      }}
    />
  )
}

export default function App() {
  return (
    <SiteSettingsProvider>
      <BrowserRouter>
        <AppToaster />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="evento/:slug" element={<EventPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="eventos" element={<AdminEventsPage />} />
              <Route path="eventos/nuevo" element={<AdminEventEditorPage />} />
              <Route path="eventos/:id" element={<AdminEventEditorPage />} />
              <Route path="comentarios" element={<AdminCommentsPage />} />
              <Route path="configuracion" element={<AdminSettingsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </SiteSettingsProvider>
  )
}
