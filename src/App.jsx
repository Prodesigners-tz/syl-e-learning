import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import Login from './pages/Login'
import Signup from './pages/Signup'
import PendingApproval from './pages/PendingApproval'
import PastorApprove from './pages/PastorApprove'
import Dashboard from './pages/Dashboard'
import ModuleView from './pages/ModuleView'
import Quiz from './pages/Quiz'
import Certificate from './pages/Certificate'
import AdminChurches from './pages/admin/AdminChurches'
import AdminApprovals from './pages/admin/AdminApprovals'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <Navbar />
          <div className="app-main">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="/pastor-approve" element={<PastorApprove />} />

              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/module/:moduleId" element={
                <ProtectedRoute><ModuleView /></ProtectedRoute>
              } />
              <Route path="/quiz/:moduleId" element={
                <ProtectedRoute><Quiz /></ProtectedRoute>
              } />
              <Route path="/certificate" element={
                <ProtectedRoute><Certificate /></ProtectedRoute>
              } />

              <Route path="/admin/churches" element={
                <ProtectedRoute requireAdmin><AdminChurches /></ProtectedRoute>
              } />
              <Route path="/admin/approvals" element={
                <ProtectedRoute requireAdmin><AdminApprovals /></ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
