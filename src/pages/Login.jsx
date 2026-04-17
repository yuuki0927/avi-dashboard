import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, error } = useAuth()
  const navigate = useNavigate()

  // パスワードを忘れた
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotDone, setForgotDone] = useState(false)
  const [forgotError, setForgotError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (ok) navigate('/')
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setForgotLoading(true); setForgotError('')
    try {
      await axios.post(`${BASE}/api/auth/forgot-password`, { email: forgotEmail.trim() })
      setForgotDone(true)
    } catch (err) {
      setForgotError(err.response?.data?.error || '送信に失敗しました。しばらくしてお試しください。')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar-dark via-sidebar to-primary-300 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <span className="text-white text-3xl font-black">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AVI Admin</h1>
          <p className="text-primary-200 text-sm mt-1">管理者ポータル</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {!showForgot ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-6">ログイン</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@avi.local"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-60 text-sm"
                >
                  {loading ? 'ログイン中...' : 'ログイン'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => { setShowForgot(true); setForgotEmail(email); setForgotDone(false); setForgotError('') }}
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                >
                  パスワードを忘れた場合
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setShowForgot(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold text-gray-900">パスワードをリセット</h2>
              </div>

              {!forgotDone ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    登録済みのメールアドレスを入力してください。アカウントに紐づく全てのリセットリンクをお送りします。
                  </p>
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        メールアドレス
                      </label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="admin@avi.local"
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    {forgotError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-700 text-sm">{forgotError}</p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-60 text-sm"
                    >
                      {forgotLoading ? '送信中...' : 'リセットメールを送信'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">メールを送信しました</p>
                  <p className="text-xs text-gray-500 mb-6">
                    <strong>{forgotEmail}</strong> 宛にリセットリンクを送りました。<br />
                    メールが届かない場合は迷惑メールフォルダをご確認ください。
                  </p>
                  <button
                    onClick={() => setShowForgot(false)}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    ログインに戻る
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
