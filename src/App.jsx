import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'

import Login from './pages/Login'
import Signup from './pages/Signup'
import GroupSignup from './pages/GroupSignup'

// 開発者
import GlobalDashboard from './pages/GlobalDashboard'
import ClinicsManagement from './pages/ClinicsManagement'
import InviteClinic from './pages/InviteClinic'
import PlatformAdmin from './pages/PlatformAdmin'

// 会社全体
import CompanyHome from './pages/CompanyHome'
import EmployeeManagement from './pages/EmployeeManagement'
import BulkEdit from './pages/BulkEdit'

// 店舗
import ClinicHome from './pages/ClinicHome'
import SalesManagement from './pages/SalesManagement'
import Campaigns from './pages/Campaigns'
import Customers from './pages/Customers'
import MenuManagement from './pages/MenuManagement'
import BotSettings from './pages/BotSettings'
import IntakeFormManagement from './pages/IntakeFormManagement'
import SegmentBroadcast from './pages/SegmentBroadcast'

// 共通
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import PublicIntakeForm from './pages/PublicIntakeForm'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function IndexRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return null
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>

  const isSuperAdmin = user?.role === 'super_admin'
  const isCompany = user && !isSuperAdmin && !user.current_clinic_id
  const isClinic = user && !isSuperAdmin && !!user.current_clinic_id

  return (
    <Routes>
      <Route path="/form/:token" element={<PublicIntakeForm />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup/clinic/:token" element={<Signup />} />
      <Route path="/signup/:token" element={<Signup />} />
      <Route path="/signup/group/:token" element={<GroupSignup />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* ホーム：モードで分岐 */}
        <Route index element={
          isSuperAdmin ? <GlobalDashboard /> :
          isCompany    ? <CompanyHome /> :
          isClinic     ? <ClinicHome /> :
          <Navigate to="/login" replace />
        } />

        {/* 開発者専用 */}
        {isSuperAdmin && <>
          <Route path="clinics" element={<ClinicsManagement />} />
          <Route path="invite" element={<InviteClinic />} />
          <Route path="platform" element={<PlatformAdmin />} />
        </>}

        {/* 会社全体専用 */}
        {isCompany && <>
          <Route path="clinics" element={<ClinicsManagement />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="bulk-edit" element={<BulkEdit />} />
          <Route path="analytics" element={<Analytics />} />
        </>}

        {/* 店舗専用 */}
        {isClinic && <>
          <Route path="sales" element={<SalesManagement />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="customers" element={<Customers />} />
          <Route path="menus" element={<MenuManagement />} />
          <Route path="bot-settings" element={<BotSettings />} />
          <Route path="intake-form" element={<IntakeFormManagement />} />
          <Route path="broadcast" element={<SegmentBroadcast />} />
        </>}

        {/* 共通 */}
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
