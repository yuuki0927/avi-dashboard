import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MockProvider } from './context/MockContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import GlobalDashboard from './pages/GlobalDashboard'
import Campaigns from './pages/Campaigns'
import Customers from './pages/Customers'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import BotSettings from './pages/BotSettings'
import MenuManagement from './pages/MenuManagement'
import ClinicsManagement from './pages/ClinicsManagement'
import InviteClinic from './pages/InviteClinic'
import KnowledgeBase from './pages/KnowledgeBase'
import Signup from './pages/Signup'
import GroupSignup from './pages/GroupSignup'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup/clinic/:token" element={<Signup />} />
      <Route path="/signup/:token" element={<Signup />} />
      <Route path="/signup/group/:token" element={<GroupSignup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={user?.role === 'super_admin' ? <GlobalDashboard /> : <Dashboard />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="customers" element={<Customers />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="menus" element={<MenuManagement />} />
        <Route path="clinics" element={<ClinicsManagement />} />
        <Route path="bot-settings" element={<BotSettings />} />
        <Route path="knowledge" element={<KnowledgeBase />} />
        <Route path="invite" element={<InviteClinic />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <MockProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MockProvider>
    </BrowserRouter>
  )
}
