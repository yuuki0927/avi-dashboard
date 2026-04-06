import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { setToken } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function GroupSignup() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [invitation, setInvitation] = useState(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    axios.get(`${BASE}/api/groups/signup/${token}`)
      .then(r => {
        setInvitation(r.data)
        setName(r.data.group_name || '')
      })
      .catch(e => setError(e.response?.data?.error || '無効な招待リンクです'))
      .finally(() => setLoading(false))
  }, [token])

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('パスワードが一致しません'); return }
    if (password.length < 8) { setError('パスワードは8文字以上で設定してください'); return }
    setError(''); setSubmitting(true)
    try {
      const res = await axios.post(`${BASE}/api/groups/signup/${token}`, { password, name })
      // 自動ログイン
      setToken(res.data.token)
      setDone(true)
      setTimeout(() => navigate('/'), 1500)
    } catch (e) {
      setError(e.response?.data?.error || '登録に失敗しました')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">確認中...</div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <span className="text-white text-3xl font-black">M</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AVI Admin</h1>
          <p className="text-primary-200 text-sm mt-1">グループ管理者登録</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">登録完了！</h2>
              <p className="text-sm text-gray-600">ダッシュボードに移動します...</p>
            </div>
          ) : error && !invitation ? (
            <div className="text-center space-y-3">
              <p className="text-red-600 font-medium">{error}</p>
              <p className="text-sm text-gray-500">招待リンクが無効または期限切れです。</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">アカウント設定</h2>
              {invitation && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">グループ名</p>
                  <p className="text-sm font-medium text-gray-900">{invitation.group_name}</p>
                  <p className="text-xs text-gray-500 mt-1">メール: {invitation.email}</p>
                </div>
              )}
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    required placeholder="山田 太郎"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（8文字以上）</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    required placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（確認）</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    required placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors disabled:opacity-60">
                  {submitting ? '登録中...' : '登録する'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
