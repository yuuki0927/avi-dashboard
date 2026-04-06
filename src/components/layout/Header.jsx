import React, { useState } from 'react'
import { useClinic } from '../../context/ClinicContext'
import { useAuth } from '../../context/AuthContext'
import { useMock } from '../../context/MockContext'
import { notifications } from '../../data/dummyData'

export default function Header({ onMenuClick }) {
  const { selectedClinic, clinicList, switchClinic } = useClinic()
  const { user } = useAuth()
  const { mockMode, toggleMockMode } = useMock()
  const [showNotifications, setShowNotifications] = useState(false)
  const urgentCount = notifications.filter(n => n.urgent).length

  const typeIcon = {
    inventory: '📦',
    campaign: '📢',
    cancel: '❌',
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 gap-4 sticky top-0 z-10">
      {/* Hamburger */}
      <button
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        onClick={onMenuClick}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Clinic Switcher */}
      <div className="flex-1 max-w-xs">
        <label className="sr-only">クリニック切り替え</label>
        <select
          value={selectedClinic.id}
          onChange={e => switchClinic(Number(e.target.value))}
          className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-700"
        >
          {clinicList.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        {/* Mock mode toggle */}
        <button
          onClick={toggleMockMode}
          title={mockMode ? 'モックモード ON — クリックで解除' : 'モックモード OFF — クリックで有効化'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
            mockMode
              ? 'bg-violet-100 text-violet-700 border-violet-300 hover:bg-violet-200'
              : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span>🪄</span>
          <span className="hidden sm:inline">{mockMode ? 'Mock ON' : 'Mock OFF'}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {urgentCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {urgentCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">通知</p>
              </div>
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3 flex gap-3 ${n.urgent ? 'bg-red-50' : ''}`}>
                    <span className="text-lg flex-shrink-0">{typeIcon[n.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                    {n.urgent && <span className="text-xs text-red-600 font-medium flex-shrink-0">緊急</span>}
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-gray-100">
                <button
                  className="w-full text-xs text-primary-600 hover:text-primary-700 py-1"
                  onClick={() => setShowNotifications(false)}
                >
                  閉じる
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 text-sm font-bold">
              {user?.name?.[0] || 'A'}
            </span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
        </div>
      </div>
    </header>
  )
}
