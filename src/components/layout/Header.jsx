import React from 'react'
import { useAuth } from '../../context/AuthContext'

export default function Header({ onMenuClick }) {
  const { user } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 gap-4 sticky top-0 z-10">
      {/* Hamburger */}
      <button
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        onClick={onMenuClick}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* User */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 bg-sidebar/10 rounded-full flex items-center justify-center">
            <span className="text-sidebar-active text-sm font-bold">
              {user?.name?.[0] || 'A'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700 leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.role === 'super_admin' ? '開発者' : 'クリニック管理者'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
