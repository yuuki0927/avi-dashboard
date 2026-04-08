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

const QUICK_ACTIONS = [
  { icon: '👥', label: '顧客一覧', path: '/clinics' },
  { icon: '✉️', label: '招待リンク発行', path: '/invite' },
  { icon: '⚙️', label: '設定', path: '/settings' },
]

export default function GlobalDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'こんにちは！AVI管理アシスタントです。クライアント管理や設定について何でも聞いてください。\n\n例：「招待リンクの発行方法は？」「稼働中のクリニックは何件？」',
    },
  ])
  const chatEndRef = useRef(null)

  useEffect(() => {
    api.get(`${BASE}/api/admin/groups`)
      .then(r => setGroups(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const totalClinics = groups.reduce((sum, g) => sum + (g.clinic_count || 0), 0)
  const activeCount = groups.reduce(
    (sum, g) => sum + (g.clinics || []).filter(c => c.status === 'active').length,
    0
  )
  const trialCount = groups.reduce(
    (sum, g) => sum + (g.clinics || []).filter(c => c.status === 'trial').length,
    0
  )

  // コンテキストに基づいたAI提案を生成
  const suggestions = []
  if (groups.length === 0) {
    suggestions.push({
      id: 'no-clients',
      icon: '✉️',
      title: '最初のクライアントを招待しましょう',
      desc: '招待リンクを発行して、法人・個人事業主をシステムに登録できます。',
      action: '招待リンクを発行',
      path: '/invite',
      color: 'border-blue-200 bg-blue-50',
      iconBg: 'bg-blue-100',
    })
  }
  if (trialCount > 0) {
    suggestions.push({
      id: 'trial',
      icon: '🔔',
      title: `トライアル中のクリニックが${trialCount}件あります`,
      desc: 'トライアル期間中のクリニックを確認し、本稼働への移行をサポートしましょう。',
      action: '顧客一覧を確認',
      path: '/clinics',
      color: 'border-yellow-200 bg-yellow-50',
      iconBg: 'bg-yellow-100',
    })
  }
  if (groups.length > 0 && activeCount > 0) {
    suggestions.push({
      id: 'active',
      icon: '✅',
      title: `${activeCount}件のクリニックが稼働中です`,
      desc: 'AIボットが正常に動作しているか、各クリニックのダッシュボードで定期的に確認しましょう。',
      action: null,
      path: null,
      color: 'border-green-200 bg-green-50',
      iconBg: 'bg-green-100',
    })
  }
  suggestions.push({
    id: 'tip',
    icon: '💡',
    title: 'AIボットの精度を高めるには',
    desc: 'ナレッジベースや対応ルールを充実させると、クライアントのAIがより正確に回答できるようになります。',
    action: null,
    path: null,
    color: 'border-purple-200 bg-purple-50',
    iconBg: 'bg-purple-100',
  })

  const handleChat = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatInput('')

    // シンプルなキーワードベース回答
    let reply = '申し訳ありません、その質問への回答はまだ準備中です。具体的な操作については各メニューをご確認ください。'
    const lower = msg.toLowerCase()
    if (lower.includes('招待') || lower.includes('invite')) {
      reply = '招待リンクの発行は「招待コードを発行」メニューから行えます。メールアドレスと法人名を入力するとURLが生成されます。'
    } else if (lower.includes('クリニック') || lower.includes('顧客') || lower.includes('client')) {
      reply = `現在${groups.length}件のクライアントが登録されています。「顧客一覧」から詳細を確認できます。`
    } else if (lower.includes('稼働') || lower.includes('active')) {
      reply = `現在稼働中のクリニックは${activeCount}件、トライアル中は${trialCount}件です。`
    } else if (lower.includes('設定') || lower.includes('setting')) {
      reply = '設定メニューでは、アカウント情報やシステム設定を管理できます。'
    } else if (lower.includes('ログイン') || lower.includes('パスワード')) {
      reply = 'ログイン情報の変更は「設定 > アカウント設定」から行えます（近日実装予定）。'
    }

    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: msg },
      { role: 'assistant', content: reply },
    ])
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name || '管理者'} さん</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {new Date().toLocaleDateString('ja-JP', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
          })}
        </p>
      </div>

      {/* KPI サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '登録クライアント', value: loading ? '…' : groups.length, sub: '法人・個人事業主', color: 'text-gray-900' },
          { label: '総店舗数', value: loading ? '…' : totalClinics, sub: '全クライアント合計', color: 'text-gray-900' },
          { label: '稼働中', value: loading ? '…' : activeCount, sub: '店舗', color: 'text-green-600' },
          { label: 'トライアル', value: loading ? '…' : trialCount, sub: '店舗', color: 'text-blue-600' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI提案カード */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <h2 className="text-sm font-semibold text-gray-900">AIからの提案</h2>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Beta</span>
          </div>
          <div className="space-y-3">
            {suggestions.map(s => (
              <div key={s.id} className={`rounded-xl border p-4 ${s.color}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                    <span className="text-base">{s.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{s.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{s.desc}</p>
                    {s.action && (
                      <button
                        onClick={() => navigate(s.path)}
                        className="mt-2 text-xs text-primary-600 hover:text-primary-800 font-medium"
                      >
                        {s.action} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AIチャット */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col" style={{ height: 360 }}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <p className="text-sm font-semibold text-gray-900">AIアシスタント</p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs text-xs px-3 py-2 rounded-xl leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChat} className="px-3 pb-3 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="質問を入力..."
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors flex-shrink-0"
            >
              送信
            </button>
          </form>
        </div>
      </div>

      {/* クイックアクション */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">クイックアクション</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center hover:border-primary-200 hover:shadow-md transition-all"
            >
              <span className="text-2xl block mb-1">{a.icon}</span>
              <span className="text-xs font-medium text-gray-700">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
