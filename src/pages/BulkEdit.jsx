import React from 'react'

export default function BulkEdit() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">一括編集</h1>
        <p className="text-sm text-gray-500 mt-1">複数店舗のキャンペーン・メニューをまとめて管理</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">一括編集機能は近日公開予定です</p>
        <p className="text-sm text-gray-400 mt-1">複数店舗のキャンペーンやメニューを一度に更新できるようになります</p>
      </div>
    </div>
  )
}
