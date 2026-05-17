import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '@/components/AdminLayout'
import MobileBlocker from '@/components/MobileBlocker'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import JobsAdminPage from '@/pages/JobsAdminPage'
import ProjectsAdminPage from '@/pages/ProjectsAdminPage'
import DownloadsAdminPage from '@/pages/DownloadsAdminPage'
import CsrAdminPage from '@/pages/CsrAdminPage'
import LeadsAdminPage from '@/pages/LeadsAdminPage'
import BlogsAdminPage from '@/pages/BlogsAdminPage'
import CertificationsAdminPage from '@/pages/CertificationsAdminPage'
import ProductsAdminPage from '@/pages/ProductsAdminPage'
import ClientsAdminPage from '@/pages/ClientsAdminPage'
import GalleryAdminPage from '@/pages/GalleryAdminPage'
import GlobalPresenceAdminPage from '@/pages/GlobalPresenceAdminPage'

function RequireAuth({ children }) {
  const token = localStorage.getItem('sepl_admin_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <MobileBlocker>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="jobs" element={<JobsAdminPage />} />
          <Route path="projects" element={<ProjectsAdminPage />} />
          <Route path="downloads" element={<DownloadsAdminPage />} />
          <Route path="csr" element={<CsrAdminPage />} />
          <Route path="leads" element={<LeadsAdminPage />} />
          <Route path="blogs" element={<BlogsAdminPage />} />
          <Route path="certifications" element={<CertificationsAdminPage />} />
          <Route path="products" element={<ProductsAdminPage />} />
          <Route path="clients" element={<ClientsAdminPage />} />
          <Route path="gallery" element={<GalleryAdminPage />} />
          <Route path="global-presence" element={<GlobalPresenceAdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
    </MobileBlocker>
  )
}
