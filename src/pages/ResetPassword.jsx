import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [status, setStatus] = useState('loading') // loading | valid | invalid | done
  const [accountName, setAccountName] = useState('')
  const [error, setError] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token) { setStatus('invalid'); setError('リセットリンクが無効です'); return }
    axios.get(`${BASE}/api/auth/reset-password?token=${token}`)
      .then(r => {
        if (r.data.valid) {
          setAccountName(r.data.account_name || '')
          setStatus('valid')
        } else {
          setError(r.data.error || '無効なリンクです')
          setStatus('invalid')
        }
      })
      .catch(err => {
        setError(err.response?.data?.error || 'リンクの確認に失敗しました')
        setStatus('invalid')
      })
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) { setError('パスワードは8文字以上で設定してください'); return }
    if (newPassword !== confirmPassword) { setError('パスワードが一致しません'); return }
    setSaving(true); setError('')
    try {
      await axios.post(`${BASE}/api/auth/reset-password`, { token, new_password: newPassword })
      setStatus('done')
    } catch (err) {
      setError(err.response?.data?.error || 'パスワードの変更に失敗しました')
    } finally { setSaving(false) }
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
          {status === 'loading' && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">確認中...</p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">リンクが無効です</p>
              <p className="text-xs text-gray-500 mb-6">{error}</p>
              <button onClick={() => navigate('/login')} className="text-sm text-primary-600 hover:underline">
                ログインページへ戻る
              </button>
            </div>
          )}

          {status === 'valid' && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">新しいパスワードを設定</h2>
              {accountName && (
                <p className="text-sm text-gray-500 mb-6">アカウント：{accountName}</p>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    新しいパスワード <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="8文字以上"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    新しいパスワード（確認） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="もう一度入力"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-60 text-sm"
                >
                  {saving ? '変更中...' : 'パスワードを変更する'}
                </button>
              </form>
            </>
          )}

          {status === 'done' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">パスワードを変更しました</p>
              <p className="text-xs text-gray-500 mb-6">新しいパスワードでログインしてください。</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
              >
                ログインページへ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
