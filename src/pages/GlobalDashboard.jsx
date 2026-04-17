import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'おはようございます'
  if (h < 18) return 'こんにちは'
  return 'こんばんは'
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'たった今'
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}日前`
  return new Date(dateStr).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

const ACTION_ICONS = {
  invite_sent:     { icon: '✉️', color: 'bg-blue-100 text-blue-600' },
  signup_complete: { icon: '🎉', color: 'bg-green-100 text-green-600' },
  clinic_created:  { icon: '🏥', color: 'bg-purple-100 text-purple-600' },
  password_reset:  { icon: '🔑', color: 'bg-yellow-100 text-yellow-600' },
  line_connected:  { icon: '💬', color: 'bg-green-100 text-green-700' },
}

export default function GlobalDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  // AIチャット
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'こんにちは！AVI管理アシスタントです。\n現在のシステム状況や操作方法について何でも聞いてください。' },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    Promise.all([
      api.get(`${BASE}/api/admin/stats`),
      api.get(`${BASE}/api/admin/activity?limit=15`),
    ]).then(([sRes, aRes]) => {
      setStats(sRes.data)
      setActivity(aRes.data || [])
    }).catch(console.error)
      .finally(() => setLoadingStats(false))
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleChat = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return
    const msg = chatInput.trim()
    setChatInput('')
    const newMessages = [...chatMessages, { role: 'user', content: msg }]
    setChatMessages(newMessages)
    setChatLoading(true)
    try {
      const res = await api.post(`${BASE}/api/admin/chat`, {
        messages: newMessages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
      })
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '申し訳ありません、接続エラーが発生しました。' }])
    } finally {
      setChatLoading(false)
    }
  }

  const kpiCards = stats ? [
    {
      label: '登録クライアント',
      value: stats.total_groups,
      sub: `今月 +${stats.new_this_month}件`,
      color: 'text-gray-900',
      subColor: stats.new_this_month > 0 ? 'text-green-600' : 'text-gray-400',
      icon: (
        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: '総店舗数',
      value: stats.total_clinics,
      sub: `稼働中 ${stats.active_count}`,
      color: 'text-gray-900',
      subColor: 'text-gray-400',
      icon: (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: 'LINE連携済み',
      value: stats.line_connected,
      sub: `未連携 ${stats.total_clinics - stats.line_connected}店舗`,
      color: 'text-green-600',
      subColor: (stats.total_clinics - stats.line_connected) > 0 ? 'text-orange-500' : 'text-gray-400',
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      label: 'トライアル',
      value: stats.trial_count,
      sub: stats.expiring_soon > 0 ? `⚠ ${stats.expiring_soon}件 期限切れ間近` : 'トライアル中',
      color: 'text-blue-600',
      subColor: stats.expiring_soon > 0 ? 'text-red-500' : 'text-gray-400',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'ナレッジ未登録',
      value: stats.no_knowledge,
      sub: '店舗',
      color: stats.no_knowledge > 0 ? 'text-orange-500' : 'text-gray-400',
      subColor: 'text-gray-400',
      icon: (
        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ] : []

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name || '管理者'} さん</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
          <button
            onClick={() => navigate('/invite')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規招待
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {loadingStats
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-7 bg-gray-100 rounded w-1/2 mb-1" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))
          : kpiCards.map(card => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">{card.label}</p>
                  {card.icon}
                </div>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                <p className={`text-xs mt-0.5 ${card.subColor}`}>{card.sub}</p>
              </div>
            ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* アクティビティフィード */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col" style={{ height: 400 }}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <p className="text-sm font-semibold text-gray-900">最近のアクティビティ</p>
            </div>
            <button onClick={() => navigate('/clinics')} className="text-xs text-primary-600 hover:underline">
              顧客一覧 →
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {activity.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-gray-400">まだアクティビティがありません</p>
              </div>
            ) : activity.map((a, i) => {
              const style = ACTION_ICONS[a.action] || { icon: '📋', color: 'bg-gray-100 text-gray-500' }
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${style.color}`}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 leading-tight">
                      {a.label}
                      {a.target_name && <span className="text-gray-500"> — {a.target_name}</span>}
                    </p>
                    {a.details && <p className="text-xs text-gray-400 mt-0.5 truncate">{a.details}</p>}
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{timeAgo(a.created_at)}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* AIチャット（実OpenAI連携） */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col" style={{ height: 400 }}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            <p className="text-sm font-semibold text-gray-900">AIアシスタント</p>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium ml-auto">GPT-4o</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs text-xs px-3 py-2 rounded-xl leading-relaxed whitespace-pre-line ${
                  m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 text-xs px-3 py-2 rounded-xl">
                  入力中...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChat} className="px-3 pb-3 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="例：トライアル期限が近いクライアントは？"
              disabled={chatLoading}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="px-3 py-2 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              送信
            </button>
          </form>
        </div>
      </div>

      {/* クイックアクション */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">クイックアクション</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '👥', label: '顧客一覧', path: '/clinics', desc: 'クライアント管理' },
            { icon: '✉️', label: '新規招待', path: '/invite', desc: 'リンク発行・メール送信' },
            { icon: '⚙️', label: 'プラットフォーム', path: '/platform', desc: 'システム設定' },
            { icon: '🔧', label: '設定', path: '/settings', desc: 'アカウント設定' },
          ].map(a => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-primary-200 hover:shadow-md transition-all group"
            >
              <span className="text-2xl block mb-2">{a.icon}</span>
              <p className="text-xs font-semibold text-gray-800 group-hover:text-primary-600">{a.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 注意アラート */}
      {stats && (stats.expiring_soon > 0 || stats.no_knowledge > 0 || (stats.total_clinics - stats.line_connected) > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-800 mb-2">要対応</p>
          {stats.expiring_soon > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <span>⚠️</span>
              <span>トライアル期限切れ間近のクライアントが <strong>{stats.expiring_soon}件</strong> あります</span>
              <button onClick={() => navigate('/clinics')} className="ml-auto text-amber-800 underline">確認する</button>
            </div>
          )}
          {stats.no_knowledge > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <span>📚</span>
              <span>ナレッジ未登録の店舗が <strong>{stats.no_knowledge}店舗</strong> あります（AIの回答精度が低い可能性）</span>
            </div>
          )}
          {(stats.total_clinics - stats.line_connected) > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <span>💬</span>
              <span>LINE未連携の店舗が <strong>{stats.total_clinics - stats.line_connected}店舗</strong> あります</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
