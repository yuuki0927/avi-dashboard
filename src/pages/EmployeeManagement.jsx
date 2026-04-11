import React, { useState, useEffect } from 'react'
import api from '../lib/apiClient'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const ROLES = [
  { value: 'owner',   label: 'オーナー',     color: 'bg-primary-100 text-primary-700' },
  { value: 'manager', label: 'マネージャー', color: 'bg-accent-100 text-accent-700' },
  { value: 'staff',   label: 'スタッフ',     color: 'bg-gray-100 text-gray-600' },
]

function RoleBadge({ role }) {
  const r = ROLES.find(r => r.value === role) || ROLES[2]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.color}`}>{r.label}</span>
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([])
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff', clinic_access: [] })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    Promise.all([
      api.get(`${BASE}/api/group/employees`),
      api.get(`${BASE}/api/group/clinics`),
    ]).then(([empRes, clinicRes]) => {
      setEmployees(empRes.data || [])
      setClinics(clinicRes.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setForm({ name: '', email: '', password: '', role: 'staff', clinic_access: [] })
    setError('')
    setShowAdd(true)
  }

  const openEdit = (emp) => {
    let access = []
    try { access = JSON.parse(emp.clinic_access || '[]') } catch {}
    setForm({ name: emp.name, email: emp.email, password: '', role: emp.role, clinic_access: access })
    setError('')
    setEditTarget(emp)
  }

  const toggleClinic = (id) => {
    setForm(f => ({
      ...f,
      clinic_access: f.clinic_access.includes(id)
        ? f.clinic_access.filter(c => c !== id)
        : [...f.clinic_access, id],
    }))
  }

  const handleAdd = async () => {
    setSaving(true); setError('')
    try {
      await api.post(`${BASE}/api/group/employees`, form)
      setShowAdd(false); load()
    } catch (e) {
      setError(e.response?.data?.error || '追加に失敗しました')
    } finally { setSaving(false) }
  }

  const handleEdit = async () => {
    setSaving(true); setError('')
    const payload = { name: form.name, role: form.role, clinic_access: form.clinic_access }
    if (form.password) payload.password = form.password
    try {
      await api.put(`${BASE}/api/group/employees/${editTarget.id}`, payload)
      setEditTarget(null); load()
    } catch (e) {
      setError(e.response?.data?.error || '更新に失敗しました')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`${BASE}/api/group/employees/${deleteTarget.id}`)
      setDeleteTarget(null); load()
    } catch {}
  }

  const FormFields = ({ isEdit }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          パスワード{isEdit && <span className="text-gray-400 font-normal ml-1">（変更する場合のみ）</span>}
        </label>
        <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">役職</label>
        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      {form.role !== 'owner' && clinics.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">アクセス可能な店舗</label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {clinics.map(c => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.clinic_access.includes(c.id)}
                  onChange={() => toggleClinic(c.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">{c.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {form.role === 'owner' && (
        <p className="text-xs text-gray-400">オーナーは全店舗へのアクセス権が自動付与されます</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 pt-2">
        <button onClick={isEdit ? handleEdit : handleAdd} disabled={saving}
          className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60">
          {saving ? '保存中...' : (isEdit ? '更新する' : '追加する')}
        </button>
        <button onClick={() => isEdit ? setEditTarget(null) : setShowAdd(false)}
          className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
          キャンセル
        </button>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">従業員管理</h1>
          <p className="text-sm text-gray-500 mt-1">役職とアクセス権を管理します</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          従業員を追加
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">読み込み中...</div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">従業員がまだいません</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">名前</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">メール</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">役職</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">アクセス店舗</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map(emp => {
                let access = []
                try { access = JSON.parse(emp.clinic_access || '[]') } catch {}
                const accessNames = emp.role === 'owner'
                  ? '全店舗'
                  : access.length === 0
                    ? '—'
                    : clinics.filter(c => access.includes(c.id)).map(c => c.name).join('、')
                return (
                  <tr key={emp.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 text-sm font-bold">{emp.name?.[0]}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.email}</td>
                    <td className="px-6 py-4"><RoleBadge role={emp.role} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{accessNames}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(emp)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {emp.role !== 'owner' && (
                          <button onClick={() => setDeleteTarget(emp)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <Modal title="従業員を追加" onClose={() => setShowAdd(false)}>
          <FormFields isEdit={false} />
        </Modal>
      )}

      {editTarget && (
        <Modal title="従業員を編集" onClose={() => setEditTarget(null)}>
          <FormFields isEdit={true} />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="従業員を削除" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-gray-600 mb-6">
            <span className="font-medium">{deleteTarget.name}</span> を削除しますか？この操作は取り消せません。
          </p>
          <div className="flex gap-2">
            <button onClick={handleDelete}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
              削除する
            </button>
            <button onClick={() => setDeleteTarget(null)}
              className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
              キャンセル
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
