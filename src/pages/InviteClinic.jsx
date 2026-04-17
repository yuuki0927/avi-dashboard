import React, { useState, useEffect } from 'react'
import api from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://avi.tokyo'

export default function InviteClinic() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  const [form, setForm] = useState({ email: '', name: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [invitations, setInvitations] = useState([])
  const [copied, setCopied] = useState('')

  const loadInvitations = () => {
    const url = isSuperAdmin
      ? `${BASE}/api/admin/groups/invitations`
      : `${BASE}/api/admin/clinics/invitations`
    api.get(url)
      .then(r => setInvitations(r.data || []))
      .catch(console.error)
  }
  useEffect(() => { loadInvitations() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setResult(null); setLoading(true)
    try {
      let res
      if (isSuperAdmin) {
        res = await api.post(`${BASE}/api/admin/groups/invite`, {
          email: form.email,
          group_name: form.name,
        })
      } else {
        res = await api.post(`${BASE}/api/admin/clinics/invite`, {
          email: form.email,
          clinic_name: form.name,
        })
      }
      setResult(res.data)
      setForm({ email: '', name: '' })
      loadInvitations()
    } catch (e) {
      setError(e.response?.data?.error || '招待リンクの発行に失敗しました')
    } finally { setLoading(false) }
  }

  const copy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const statusLabel = (inv) => {
    if (inv.status === 'used') return { label: '使用済み', cls: 'bg-gray-100 text-gray-500' }
    if (inv.expires_at < new Date().toISOString()) return { label: '期限切れ', cls: 'bg-red-100 text-red-600' }
    return { label: '有効', cls: 'bg-green-100 text-green-700' }
  }

  const nameLabel = isSuperAdmin ? '法人名 / 個人事業主名' : 'クリニック名'
  const namePlaceholder = isSuperAdmin ? '例: 〇〇株式会社 / 〇〇エステサロン' : '例: 〇〇クリニック梅田院'

  const getSignupPath = (inv) => {
    if (isSuperAdmin) return `${SITE_URL}/signup/group/${inv.token}`
    return `${SITE_URL}/signup/clinic/${inv.token}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">招待コードを発行</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isSuperAdmin
            ? '新しい法人・個人事業主に登録用リンクを発行します'
            : '新しい店舗（クリニック）に登録用リンクを発行します'}
        </p>
      </div>

      {/* メール送信について（開発者向けのみ） */}
      {isSuperAdmin && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div className="text-xs text-green-800 leading-relaxed">
            <p className="font-medium mb-0.5">招待メールが自動送信されます</p>
            <p>発行すると登録用URLを記載したメールが自動的にクライアントへ送信されます。念のためURLのコピーも可能です。</p>
          </div>
        </div>
      )}

      {/* 発行フォーム */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">招待リンク発行</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{nameLabel}</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={namePlaceholder}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="example@company.com"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? '発行中…' : '招待リンクを発行'}
          </button>
        </form>

        {result && (
          <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
            <p className="text-sm font-semibold text-green-800">✓ 招待リンクを発行し、メールを送信しました</p>
            <div>
              <p className="text-xs text-gray-500 mb-1">招待URL（有効期限: {result.expires_at}まで）</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-green-200 rounded px-3 py-1.5 text-xs text-gray-700 break-all">{result.invite_url}</code>
                <button
                  onClick={() => copy(result.invite_url, 'new')}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium flex-shrink-0 transition-colors ${copied === 'new' ? 'bg-green-600 text-white' : 'bg-green-100 hover:bg-green-200 text-green-800'}`}
                >
                  {copied === 'new' ? 'コピー済み' : 'コピー'}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">招待メールを送信しました。URLは念のためバックアップとしてコピーできます。</p>
          </div>
        )}
      </div>

      {/* 発行済みリスト */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">発行済み招待一覧</h2>
          <div className="space-y-2">
            {invitations.map(inv => {
              const { label, cls } = statusLabel(inv)
              const displayName = inv.group_name || inv.clinic_name || '—'
              return (
                <div key={inv.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{inv.email} · 期限: {inv.expires_at?.slice(0, 10)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cls}`}>
                    {label}
                  </span>
                  {inv.status === 'pending' && inv.expires_at >= new Date().toISOString() && (
                    <button
                      onClick={() => copy(getSignupPath(inv), inv.id)}
                      className={`text-xs px-2 py-1 rounded flex-shrink-0 transition-colors ${copied === inv.id ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-600'}`}
                    >
                      {copied === inv.id ? '✓' : 'URL'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
