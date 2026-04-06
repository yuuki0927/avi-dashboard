import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function GlobalDashboard() {
  const { user, switchClinic } = useAuth()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`${BASE}/api/group/dashboard`),
      api.get(`${BASE}/api/group/clinics`),
    ])
      .then(([dashRes, clinicRes]) => {
        setDashboard(dashRes.data)
        setClinics(clinicRes.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSelectClinic = async (clinicId) => {
    await switchClinic(clinicId)
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">全体ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">
          {user?.role === 'super_admin' ? '全グループ・全クリニックの集計' : '所属グループの全クリニック集計'}
        </p>
      </div>

      {/* サマリカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">クリニック数</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{dashboard?.clinic_count ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">稼働中</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {clinics.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">トライアル中</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {clinics.filter(c => c.status === 'trial').length}
          </p>
        </div>
      </div>

      {/* クリニック一覧 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">クリニック一覧</h2>
          <button
            onClick={() => navigate('/invite')}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            店舗追加
          </button>
        </div>

        {clinics.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            クリニックがありません。店舗追加ボタンから招待してください。
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {clinics.map(clinic => (
              <div
                key={clinic.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold text-sm">
                    {clinic.name?.[0] || 'C'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{clinic.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {clinic.address || 'クリニックID: ' + clinic.id}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  clinic.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : clinic.status === 'trial'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {clinic.status === 'active' ? '稼働中'
                    : clinic.status === 'trial' ? 'トライアル'
                    : '停止中'}
                </span>
                <button
                  onClick={() => handleSelectClinic(clinic.id)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  管理する
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
