import React, { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/apiClient'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// クリニックモード用ナビ（デフォルト順）
const CLINIC_NAV_DEFAULT = [
  {
    id: 'dashboard',
    path: '/',
    label: 'ダッシュボード',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'campaigns',
    path: '/campaigns',
    label: 'キャンペーン',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    id: 'customers',
    path: '/customers',
    label: '顧客管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'menus',
    path: '/menus',
    label: 'メニュー管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'knowledge',
    path: '/knowledge',
    label: 'ナレッジベース',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'analytics',
    path: '/analytics',
    label: '分析',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'bot-settings',
    path: '/bot-settings',
    label: 'ボット設定',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    path: '/settings',
    label: '設定',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'clinics',
    path: '/clinics',
    label: '店舗管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
]

// 全体モード用ナビ（固定）
const GLOBAL_NAV = [
  {
    path: '/',
    label: '全体ダッシュボード',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: '/clinics',
    label: 'クリニック一覧',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    path: '/invite',
    label: 'クリニック招待',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
]

const STORAGE_KEY = 'avi_sidebar_order'

function loadOrder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function applyOrder(items, order) {
  if (!order || !Array.isArray(order)) return items
  const map = Object.fromEntries(items.map(i => [i.id, i]))
  const sorted = order.map(id => map[id]).filter(Boolean)
  // append any new items not in saved order
  const inOrder = new Set(order)
  items.forEach(i => { if (!inOrder.has(i.id)) sorted.push(i) })
  return sorted
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const [currentClinicName, setCurrentClinicName] = useState('')
  const [navItems, setNavItems] = useState(() =>
    applyOrder(CLINIC_NAV_DEFAULT, loadOrder())
  )
  const [dragging, setDragging] = useState(null)
  const dragOver = useRef(null)

  useEffect(() => {
    if (isSuperAdmin || !user?.current_clinic_id) return
    api.get(`${BASE}/api/group/clinics`)
      .then(r => {
        const clinic = (r.data || []).find(c => c.id === user.current_clinic_id)
        if (clinic) setCurrentClinicName(clinic.name)
      })
      .catch(() => {})
  }, [user?.current_clinic_id, isSuperAdmin])

  const items = isSuperAdmin ? GLOBAL_NAV : navItems

  // Drag handlers (clinic nav only)
  const handleDragStart = (e, index) => {
    setDragging(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnter = (index) => {
    dragOver.current = index
  }

  const handleDragEnd = () => {
    if (dragging === null || dragOver.current === null || dragging === dragOver.current) {
      setDragging(null)
      dragOver.current = null
      return
    }
    const next = [...navItems]
    const [moved] = next.splice(dragging, 1)
    next.splice(dragOver.current, 0, moved)
    setNavItems(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.map(i => i.id)))
    setDragging(null)
    dragOver.current = null
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64 bg-gray-900 flex flex-col transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight">AVI</p>
            <p className="text-gray-400 text-xs truncate">
              {isSuperAdmin ? '開発者ポータル' : (currentClinicName || 'クリニック管理')}
            </p>
          </div>
          <button className="ml-auto text-gray-400 hover:text-white md:hidden" onClick={onClose}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode badge */}
        <div className="px-4 py-2 border-b border-gray-800">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${
            isSuperAdmin
              ? 'bg-gray-800 text-gray-400'
              : 'bg-primary-900 text-primary-300'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {isSuperAdmin ? '開発者' : 'クリニック管理者'}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {!isSuperAdmin && (
            <p className="text-gray-600 text-xs px-3 mb-2 select-none">ドラッグで並び替え可能</p>
          )}
          {items.map((item, index) => (
            <div
              key={item.id || item.path}
              draggable={!isSuperAdmin}
              onDragStart={!isSuperAdmin ? e => handleDragStart(e, index) : undefined}
              onDragEnter={!isSuperAdmin ? () => handleDragEnter(index) : undefined}
              onDragEnd={!isSuperAdmin ? handleDragEnd : undefined}
              onDragOver={e => e.preventDefault()}
              className={`${
                !isSuperAdmin && dragging === index ? 'opacity-40' : ''
              } ${
                !isSuperAdmin && dragOver.current === index && dragging !== null && dragging !== index
                  ? 'border-t-2 border-primary-400'
                  : ''
              }`}
            >
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-white bg-primary-600'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`
                }
              >
                {!isSuperAdmin && (
                  <span className="text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0" title="ドラッグして並び替え">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/>
                      <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                      <circle cx="9" cy="17" r="1.5"/><circle cx="15" cy="17" r="1.5"/>
                    </svg>
                  </span>
                )}
                {item.icon}
                {item.label}
              </NavLink>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-gray-800 space-y-1">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ログアウト
          </button>
        </div>
      </aside>
    </>
  )
}
