import React, { useState, useEffect } from 'react'
import api from '../lib/apiClient'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function InviteClinic() {
  const [form, setForm] = useState({ email: '', clinic_name: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [invitations, setInvitations] = useState([])
  const [copied, setCopied] = useState('')

  const loadInvitations = () => {
    api.get(`${BASE}/api/admin/clinics/invitations`)
      .then(r => setInvitations(r.data || []))
      .catch(console.error)
  }

  useEffect(() => { loadInvitations() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setResult(null); setLoading(true)
    try {
      const res = await api.post(`${BASE}/api/admin/clinics/invite`, form)
      setResult(res.data)
      setForm({ email: '', clinic_name: '' })
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">クリニック招待</h1>
        <p className="text-sm text-gray-500 mt-1">新しい店舗（クリニック）に登録用リンクを発行します</p>
      </div>

      {/* 発行フォーム */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">招待リンク発行</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">クリニック名</label>
            <input
              type="text"
              value={form.clinic_name}
              onChange={e => setForm(f => ({ ...f, clinic_name: e.target.value }))}
              placeholder="例: 〇〇クリニック梅田院"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">管理者メールアドレス</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="clinic@example.com"
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
            <p className="text-sm font-semibold text-green-800">✓ 招待リンクを発行しました</p>
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
              return (
                <div key={inv.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{inv.clinic_name}</p>
                    <p className="text-xs text-gray-500">{inv.email} · 期限: {inv.expires_at?.slice(0, 10)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cls}`}>
                    {label}
                  </span>
                  {inv.status === 'pending' && inv.expires_at >= new Date().toISOString() && (
                    <button
                      onClick={() => copy(
                        `${import.meta.env.VITE_SITE_URL || 'https://avi.tokyo'}/signup/clinic/${inv.token}`,
                        inv.id
                      )}
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
