import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const EMPTY_FORM = { name: '', address: '', phone: '', hours: '', holidays: '' }

export default function ClinicsManagement() {
  const { user, switchClinic } = useAuth()
  const navigate = useNavigate()
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    api.get(`${BASE}/api/group/clinics`)
      .then(r => setClinics(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleManage = async (clinicId) => {
    await switchClinic(clinicId)
    navigate('/')
  }

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  const openEdit = (clinic) => {
    setEditing(clinic)
    setForm({
      name: clinic.name || '',
      address: clinic.address || '',
      phone: clinic.phone || '',
      hours: clinic.hours || '',
      holidays: clinic.holidays || '',
    })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('店舗名は必須です'); return }
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await api.put(`${BASE}/api/group/clinics/${editing.id}`, form)
      } else {
        await api.post(`${BASE}/api/group/clinics`, form)
      }
      setShowModal(false)
      load()
    } catch (e) {
      setError(e.response?.data?.error || '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">店舗管理</h1>
          <p className="text-sm text-gray-500 mt-1">{clinics.length}件の店舗</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          店舗を追加
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clinics.map(clinic => {
          const isSelected = user?.current_clinic_id === clinic.id
          return (
            <div
              key={clinic.id}
              className={`bg-white rounded-xl border shadow-sm p-5 ${isSelected ? 'ring-2 ring-primary-500 border-primary-200' : 'border-gray-100'}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold">{clinic.name?.[0] || 'C'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{clinic.name}</h3>
                    {isSelected && (
                      <span className="text-xs text-primary-600 font-medium">管理中</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    clinic.status === 'active' ? 'bg-green-100 text-green-700'
                    : clinic.status === 'trial' ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                  }`}>
                    {clinic.status === 'active' ? '稼働中' : clinic.status === 'trial' ? 'トライアル' : '停止中'}
                  </span>
                  <button
                    onClick={() => openEdit(clinic)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="編集"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>

              <dl className="space-y-1 text-xs text-gray-500 mb-3">
                {clinic.address && (
                  <div className="flex gap-2">
                    <dt className="flex-shrink-0 font-medium text-gray-400 w-14">住所</dt>
                    <dd className="text-gray-600">{clinic.address}</dd>
                  </div>
                )}
                {clinic.phone && (
                  <div className="flex gap-2">
                    <dt className="flex-shrink-0 font-medium text-gray-400 w-14">電話</dt>
                    <dd className="text-gray-600">{clinic.phone}</dd>
                  </div>
                )}
                {clinic.hours && (
                  <div className="flex gap-2">
                    <dt className="flex-shrink-0 font-medium text-gray-400 w-14">営業時間</dt>
                    <dd className="text-gray-600">{clinic.hours}</dd>
                  </div>
                )}
                {clinic.holidays && (
                  <div className="flex gap-2">
                    <dt className="flex-shrink-0 font-medium text-gray-400 w-14">休診日</dt>
                    <dd className="text-gray-600">{clinic.holidays}</dd>
                  </div>
                )}
              </dl>

              <button
                onClick={() => handleManage(clinic.id)}
                className="w-full py-1.5 text-xs font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-lg transition-colors"
              >
                {isSelected ? '管理中（ダッシュボードへ）' : 'この店舗を管理する'}
              </button>
            </div>
          )
        })}
      </div>

      {clinics.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-400 text-sm mb-4">店舗がありません</p>
          <button
            onClick={openNew}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            最初の店舗を追加する
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? '店舗情報を編集' : '店舗を追加'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">店舗名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="例：メディアージュクリニック 大阪梅田院"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">住所</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="例：大阪府大阪市北区梅田1-1-1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">電話番号</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="例：06-1234-5678"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">営業時間</label>
                <input
                  type="text"
                  value={form.hours}
                  onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                  placeholder="例：10:00〜19:00（完全予約制）"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">休診日</label>
                <input
                  type="text"
                  value={form.holidays}
                  onChange={e => setForm(f => ({ ...f, holidays: e.target.value }))}
                  placeholder="例：不定休（公式サイトをご確認ください）"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
