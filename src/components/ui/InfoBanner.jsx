import React, { useState } from 'react'

/**
 * 折りたたみ可能な説明バナー
 * - デフォルト：開いた状態
 * - 状態は localStorage に保存（キーは storageKey で一意化）
 */
export default function InfoBanner({ storageKey, children }) {
  const key = `avi_banner_${storageKey}`
  const [open, setOpen] = useState(() => {
    return localStorage.getItem(key) !== 'closed'
  })

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (!next) {
      localStorage.setItem(key, 'closed')
    } else {
      localStorage.removeItem(key)
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-100/50 transition-colors"
      >
        <span className="text-xs font-medium text-blue-700">使い方ガイド</span>
        <svg
          className={`w-4 h-4 text-blue-400 transition-transform flex-shrink-0 ${open ? '' : '-rotate-90'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 text-xs text-blue-700 leading-relaxed space-y-2">
          {children}
        </div>
      )}
    </div>
  )
}
