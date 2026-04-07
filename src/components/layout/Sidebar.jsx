import React, { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/apiClient'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const CLINIC_NAV_DEFAULT = [
  { id: 'dashboard',   path: '/',            label: 'ダッシュボード',   icon: '📊' },
  { id: 'campaigns',   path: '/campaigns',   label: 'キャンペーン',      icon: '🎯' },
  { id: 'customers',   path: '/customers',   label: '顧客管理',          icon: '👥' },
  { id: 'menus',       path: '/menus',       label: 'メニュー管理',      icon: '📋' },
  { id: 'knowledge',   path: '/knowledge',   label: 'ナレッジベース',    icon: '📚' },
  { id: 'analytics',   path: '/analytics',   label: '分析',              icon: '📈' },
  { id: 'bot-settings',path: '/bot-settings',label: 'ボット設定',        icon: '🤖' },
  { id: 'settings',    path: '/settings',    label: '設定',              icon: '⚙️' },
  { id: 'clinics',     path: '/clinics',     label: '店舗管理',          icon: '🏥' },
]

const GLOBAL_NAV = [
  { path: '/',          label: '全体ダッシュボード',   icon: '📊' },
  { path: '/clinics',   label: 'クリニック一覧',       icon: '🏥' },
  { path: '/platform',  label: 'プラットフォーム管理', icon: '⚙️' },
  { path: '/invite',    label: 'グループ招待',          icon: '✉️' },
]

const STORAGE_KEY = 'avi_nav_order'

function loadSavedOrder() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
}

function applySavedOrder(defaults) {
  const order = loadSavedOrder()
  if (!order) return defaults
  const map = Object.fromEntries(defaults.map(i => [i.id, i]))
  const sorted = order.map(id => map[id]).filter(Boolean)
  defaults.forEach(i => { if (!order.includes(i.id)) sorted.push(i) })
  return sorted
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const [clinicName, setClinicName] = useState('')
  const [navItems, setNavItems] = useState(() => applySavedOrder(CLINIC_NAV_DEFAULT))

  const dragIdx = useRef(null)
  const overIdx = useRef(null)

  // 現在のクリニック名を取得
  useEffect(() => {
    if (isSuperAdmin || !user?.current_clinic_id) return
    api.get(`${BASE}/api/group/clinics`)
      .then(r => {
        const c = (r.data || []).find(c => c.id === user.current_clinic_id)
        if (c) setClinicName(c.name)
      })
      .catch(() => {})
  }, [user?.current_clinic_id, isSuperAdmin])

  const items = isSuperAdmin ? GLOBAL_NAV : navItems

  // ドラッグ＆ドロップ（クリニックモードのみ）
  const onDragStart = (i) => { dragIdx.current = i }
  const onDragEnter = (i) => { overIdx.current = i }
  const onDragEnd = () => {
    if (dragIdx.current === null || overIdx.current === null || dragIdx.current === overIdx.current) {
      dragIdx.current = overIdx.current = null
      return
    }
    const next = [...navItems]
    const [moved] = next.splice(dragIdx.current, 1)
    next.splice(overIdx.current, 0, moved)
    setNavItems(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.map(i => i.id)))
    dragIdx.current = overIdx.current = null
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-30 w-64 bg-gray-950 flex flex-col transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto
      `}>
        {/* ロゴ */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-sm leading-tight">AVI</p>
            <p className="text-gray-400 text-xs truncate">
              {isSuperAdmin ? '開発者ポータル' : (clinicName || 'クリニック管理')}
            </p>
          </div>
          <button className="ml-auto text-gray-500 hover:text-white md:hidden transition-colors" onClick={onClose}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* モードバッジ */}
        <div className="px-4 py-2.5 border-b border-gray-800">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
            isSuperAdmin ? 'bg-gray-800 text-gray-400' : 'bg-primary-900/60 text-primary-300'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {isSuperAdmin ? '開発者' : 'クリニック管理者'}
          </span>
        </div>

        {/* ナビ */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
          {items.map((item, idx) => (
            <div
              key={item.id || item.path}
              draggable={!isSuperAdmin}
              onDragStart={!isSuperAdmin ? () => onDragStart(idx) : undefined}
              onDragEnter={!isSuperAdmin ? () => onDragEnter(idx) : undefined}
              onDragEnd={!isSuperAdmin ? onDragEnd : undefined}
              onDragOver={e => e.preventDefault()}
            >
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                   ${isActive
                     ? 'bg-primary-600 text-white'
                     : 'text-gray-400 hover:text-white hover:bg-gray-800'
                   } ${!isSuperAdmin ? 'cursor-move' : ''}`
                }
              >
                <span className="text-base flex-shrink-0 select-none">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            </div>
          ))}
        </nav>

        {/* ログアウト */}
        <div className="px-2 py-3 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <span className="text-base">🚪</span>
            ログアウト
          </button>
        </div>
      </aside>
    </>
  )
}
