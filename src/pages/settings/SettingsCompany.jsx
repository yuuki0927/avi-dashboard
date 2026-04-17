import React, { useState } from 'react'
import Card from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/apiClient'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function SettingsCompany() {
  const { user, login } = useAuth()

  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChangeEmail = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(false)
    if (!newEmail.trim()) { setError('新しいメールアドレスを入力してください'); return }
    if (!currentPassword) { setError('現在のパスワードを入力してください'); return }
    setSaving(true)
    try {
      await api.put(`${BASE}/api/group/account/email`, {
        new_email: newEmail.trim(),
        current_password: currentPassword,
      })
      setSuccess(true)
      setNewEmail('')
      setCurrentPassword('')
    } catch (e) {
      setError(e.response?.data?.error || 'メールアドレスの変更に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
      </div>

      {/* メールアドレス変更 */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">メールアドレスの変更</h2>
        <p className="text-xs text-gray-500 mb-5">
          現在のメールアドレス：<span className="font-medium text-gray-700">{user?.email}</span>
        </p>

        <form onSubmit={handleChangeEmail} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              新しいメールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              現在のパスワード <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
              メールアドレスを変更しました。次回から新しいアドレスでログインしてください。
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? '変更中...' : '変更する'}
          </button>
        </form>
      </Card>

      {/* 今後の実装予定 */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">サブスクリプション・お支払い</h2>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold text-sm">実装予定です</p>
          <p className="text-xs text-gray-400 mt-1">しばらくお待ちください</p>
        </div>
      </Card>
    </div>
  )
}
