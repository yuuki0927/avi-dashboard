import React from 'react'

const colorMap = {
  VIP: 'bg-yellow-100 text-yellow-800',
  '要フォロー': 'bg-red-100 text-red-700',
  '新規': 'bg-green-100 text-green-700',
  'リピーター': 'bg-blue-100 text-blue-700',
  'active': 'bg-green-100 text-green-700',
  'ended': 'bg-gray-100 text-gray-600',
  '確定': 'bg-blue-100 text-blue-700',
  '完了': 'bg-green-100 text-green-700',
  'キャンセル': 'bg-red-100 text-red-700',
  '注入系': 'bg-purple-100 text-purple-700',
  'レーザー系': 'bg-orange-100 text-orange-700',
  'リフトアップ系': 'bg-pink-100 text-pink-700',
}

export default function Badge({ label, color }) {
  const colorClass = color || colorMap[label] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  )
}
