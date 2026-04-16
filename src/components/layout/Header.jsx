import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/apiClient'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// 会社モード↔店舗モードで共通して存在するパス
const SHARED_PATHS = ['/', '/settings']

export default function Header({ onMenuClick, onViewChange }) {
  const { user, switchClinic } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [clinics, setClinics] = useState([])
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const dropdownRef = useRef(null)

  const isCompany = !user?.current_clinic_id
  const currentClinic = clinics.find(c => c.id === user?.current_clinic_id)

  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      api.get(`${BASE}/api/group/clinics`)
        .then(r => setClinics(r.data || []))
        .catch(() => {})
    }
  }, [user])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const switchTo = async (clinicId) => {
    if (clinicId === user?.current_clinic_id) { setOpen(false); return }
    setSwitching(true)
    setOpen(false)
    await switchClinic(clinicId)
    const path = location.pathname
    const targetIsCompany = clinicId === null
    const pathExistsInTarget = targetIsCompany
      ? SHARED_PATHS.includes(path) || ['/clinics', '/employees', '/bulk-edit', '/analytics', '/settings'].includes(path)
      : SHARED_PATHS.includes(path) || ['/campaigns', '/customers', '/menus', '/bot-settings', '/intake-form', '/settings'].includes(path)
    navigate(pathExistsInTarget ? path : '/')
    setSwitching(false)
    onViewChange?.()
  }

  if (!user || user.role === 'super_admin') {
    return (
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 gap-4 sticky top-0 z-10">
        <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100" onClick={onMenuClick}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1" />
        <UserBadge user={user} />
      </header>
    )
  }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center gap-4 px-4 md:px-6 sticky top-0 z-10">
      <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100" onClick={onMenuClick}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 切り替えプルダウン */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-medium
            ${switching ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
            ${isCompany ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700'}`}
          disabled={switching}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isCompany ? 'bg-primary-500' : 'bg-green-500'}`} />
          <span className="max-w-[140px] truncate">
            {switching ? '切り替え中...' : isCompany ? '会社全体' : (currentClinic?.name || '店舗')}
          </span>
          <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
            {/* 会社全体 */}
            <button
              onClick={() => switchTo(null)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors
                ${isCompany ? 'text-primary-700 font-medium' : 'text-gray-700'}`}
            >
              <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
              <span>会社全体</span>
              {isCompany && <svg className="w-4 h-4 ml-auto text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            </button>

            {clinics.length > 0 && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <p className="px-4 py-1 text-xs text-gray-400 font-medium">店舗</p>
                {clinics.map(c => (
                  <button
                    key={c.id}
                    onClick={() => switchTo(c.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors
                      ${user?.current_clinic_id === c.id ? 'text-primary-700 font-medium' : 'text-gray-700'}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="truncate">{c.name}</span>
                    {user?.current_clinic_id === c.id && <svg className="w-4 h-4 ml-auto text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />
      <UserBadge user={user} />
    </header>
  )
}

function UserBadge({ user }) {
  return (
    <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
      <div className="w-8 h-8 bg-sidebar/10 rounded-full flex items-center justify-center">
        <span className="text-sidebar-active text-sm font-bold">{user?.name?.[0] || 'A'}</span>
      </div>
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-gray-700 leading-tight">{user?.name}</p>
        <p className="text-xs text-gray-400">
          {user?.role === 'super_admin' ? '開発者' : 'グループ管理者'}
        </p>
      </div>
    </div>
  )
}
