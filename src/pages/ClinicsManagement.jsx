import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const EMPTY_CLINIC_FORM = { name: '', address: '', phone: '', hours: '', holidays: '' }

// ── クリニック管理者向けビュー（自グループの店舗管理）─────────────────────────

function ClinicAdminView() {
  const { user, switchClinic } = useAuth()
  const navigate = useNavigate()
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_CLINIC_FORM)
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
  const openNew = () => { setEditing(null); setForm(EMPTY_CLINIC_FORM); setError(''); setShowModal(true) }
  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name || '', address: c.address || '', phone: c.phone || '', hours: c.hours || '', holidays: c.holidays || '' })
    setError(''); setShowModal(true)
  }
  const handleSave = async () => {
    if (!form.name.trim()) { setError('店舗名は必須です'); return }
    setSaving(true); setError('')
    try {
      if (editing) {
        await api.put(`${BASE}/api/group/clinics/${editing.id}`, form)
      } else {
        await api.post(`${BASE}/api/group/clinics`, form)
      }
      setShowModal(false); load()
    } catch (e) {
      setError(e.response?.data?.error || '保存に失敗しました')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">読み込み中...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">店舗管理</h1>
          <p className="text-sm text-gray-500 mt-1">{clinics.length}件の店舗</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
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
            <div key={clinic.id} className={`bg-white rounded-xl border shadow-sm p-5 ${isSelected ? 'ring-2 ring-primary-500 border-primary-200' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold">{clinic.name?.[0] || 'C'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{clinic.name}</h3>
                    {isSelected && <span className="text-xs text-primary-600 font-medium">管理中</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${clinic.status === 'active' ? 'bg-green-100 text-green-700' : clinic.status === 'trial' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {clinic.status === 'active' ? '稼働中' : clinic.status === 'trial' ? 'トライアル' : '停止中'}
                  </span>
                  <button onClick={() => openEdit(clinic)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
              <dl className="space-y-1 text-xs text-gray-500 mb-3">
                {clinic.address && <div className="flex gap-2"><dt className="w-14 font-medium text-gray-400">住所</dt><dd>{clinic.address}</dd></div>}
                {clinic.phone && <div className="flex gap-2"><dt className="w-14 font-medium text-gray-400">電話</dt><dd>{clinic.phone}</dd></div>}
                {clinic.hours && <div className="flex gap-2"><dt className="w-14 font-medium text-gray-400">営業時間</dt><dd>{clinic.hours}</dd></div>}
              </dl>
              <button onClick={() => handleManage(clinic.id)} className="w-full py-1.5 text-xs font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-lg transition-colors">
                {isSelected ? '管理中（ダッシュボードへ）' : 'この店舗を管理する'}
              </button>
            </div>
          )
        })}
      </div>
      {clinics.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm mb-4">店舗がありません</p>
          <button onClick={openNew} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            最初の店舗を追加する
          </button>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? '店舗情報を編集' : '店舗を追加'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              {['name', 'address', 'phone', 'hours', 'holidays'].map(field => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {{ name: '店舗名', address: '住所', phone: '電話番号', hours: '営業時間', holidays: '休診日' }[field]}
                    {field === 'name' && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
              {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">キャンセル</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 開発者向けビュー（全顧客・グループ一覧）─────────────────────────────────

function SuperAdminView() {
  const { switchClinic } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({ group_name: '', user_name: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const load = () => {
    api.get(`${BASE}/api/admin/groups`)
      .then(r => setGroups(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const handleManageClinic = async (clinicId) => {
    await switchClinic(clinicId)
    navigate('/')
  }

  const openEdit = (group) => {
    setEditTarget(group)
    setEditForm({
      group_name: group.name || '',
      user_name: group.user_name || '',
      email: group.user_email || '',
    })
    setEditError('')
  }

  const handleSaveEdit = async () => {
    setSaving(true); setEditError('')
    try {
      await api.put(`${BASE}/api/admin/groups/${editTarget.id}`, editForm)
      setEditTarget(null)
      load()
    } catch (e) {
      setEditError(e.response?.data?.error || '保存に失敗しました')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">読み込み中...</div>

  const statusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-700'
    if (status === 'trial') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-500'
  }
  const statusLabel = (status) => ({ active: '稼働中', trial: 'トライアル', suspended: '停止中' }[status] || status)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">顧客一覧</h1>
          <p className="text-sm text-gray-500 mt-1">{groups.length}件の法人・個人事業主</p>
        </div>
        <button
          onClick={() => navigate('/invite')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規招待
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm mb-4">登録されているクライアントがありません</p>
          <button onClick={() => navigate('/invite')} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            招待リンクを発行する
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* グループヘッダー */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold text-sm">{group.name?.[0] || 'G'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{group.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{group.user_email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {group.clinic_count || 0}店舗
                  </span>
                  <button
                    onClick={() => openEdit(group)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="編集"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleExpand(group.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg className={`w-4 h-4 transition-transform ${expanded[group.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 店舗一覧（展開時） */}
              {expanded[group.id] && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {(group.clinics || []).length === 0 ? (
                    <p className="px-5 py-3 text-xs text-gray-400">店舗がまだ登録されていません</p>
                  ) : (
                    (group.clinics || []).map(clinic => (
                      <div key={clinic.id} className="flex items-center gap-3 px-5 py-3 bg-gray-50/50">
                        <div className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-500">{clinic.name?.[0] || 'C'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800">{clinic.name}</p>
                          {clinic.address && <p className="text-xs text-gray-400">{clinic.address}</p>}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColor(clinic.status)}`}>
                          {statusLabel(clinic.status)}
                        </span>
                        <button
                          onClick={() => handleManageClinic(clinic.id)}
                          className="flex-shrink-0 px-3 py-1 text-xs font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          管理する
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 編集モーダル */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">顧客情報を編集</h2>
              <button onClick={() => setEditTarget(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">法人名 / 個人事業主名</label>
                <input type="text" value={editForm.group_name} onChange={e => setEditForm(f => ({ ...f, group_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">担当者名</label>
                <input type="text" value={editForm.user_name} onChange={e => setEditForm(f => ({ ...f, user_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">メールアドレス</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              {editError && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{editError}</div>}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">キャンセル</button>
              <button onClick={handleSaveEdit} disabled={saving} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── エクスポート ───────────────────────────────────────────────────────────────

export default function ClinicsManagement() {
  const { user } = useAuth()
  return user?.role === 'super_admin' ? <SuperAdminView /> : <ClinicAdminView />
}
