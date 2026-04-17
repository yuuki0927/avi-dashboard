import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// ── 曜日定義 ─────────────────────────────────────────────────────────────────
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日' }

const DEFAULT_HOURS = Object.fromEntries(
  DAYS.map(d => [d, { open: '10:00', close: '19:00', closed: false }])
)
const DEFAULT_CLOSED_DAYS = { note: '' }

const EMPTY_CLINIC_FORM = {
  name: '', address: '', map_url: '', phone: '', contact_email: '',
  hours: DEFAULT_HOURS,
  closed_days: DEFAULT_CLOSED_DAYS,
  password: '', confirm_password: '',
}

// ── JSON ↔ フォーム変換 ────────────────────────────────────────────────────────
function parseHours(raw) {
  if (!raw) return { ...DEFAULT_HOURS }
  try {
    const data = JSON.parse(raw)
    // dict 形式: {"mon": {...}, ...}
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const result = { ...DEFAULT_HOURS }
      DAYS.forEach(d => {
        if (data[d]) result[d] = { open: data[d].open || '10:00', close: data[d].close || '19:00', closed: !!data[d].closed }
      })
      return result
    }
    // list 形式: [{days:[...], open, close, closed}]
    if (Array.isArray(data)) {
      const result = { ...DEFAULT_HOURS }
      data.forEach(g => {
        (g.days || []).forEach(d => {
          result[d] = { open: g.open || '10:00', close: g.close || '19:00', closed: !!g.closed }
        })
      })
      return result
    }
  } catch {}
  return { ...DEFAULT_HOURS }
}

function serializeHours(hoursObj) {
  return JSON.stringify(hoursObj)
}

function parseClosedDays(raw) {
  if (!raw) return { ...DEFAULT_CLOSED_DAYS }
  try {
    const data = JSON.parse(raw)
    return { note: data.note || '' }
  } catch {
    return { note: typeof raw === 'string' ? raw : '' }
  }
}

function serializeClosedDays(cd) {
  return JSON.stringify(cd)
}

function formatHoursSummary(raw) {
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return raw
    // dict形式
    const obj = Array.isArray(data)
      ? Object.fromEntries(data.flatMap(g => (g.days || []).map(d => [d, g])))
      : data
    const open = DAYS.filter(d => obj[d] && !obj[d].closed)
    const closed = DAYS.filter(d => obj[d] && obj[d].closed)
    if (open.length === 0) return '全日休診'
    // 連続グループを作る
    const groups = []
    let cur = null
    open.forEach(d => {
      const slot = `${obj[d].open}〜${obj[d].close}`
      if (cur && cur.slot === slot) { cur.days.push(d) } else { cur = { days: [d], slot }; groups.push(cur) }
    })
    const parts = groups.map(g => `${g.days.map(d => DAY_LABELS[d]).join('・')}：${g.slot}`)
    if (closed.length > 0) parts.push(`${closed.map(d => DAY_LABELS[d]).join('・')}：休診`)
    return parts.join(' / ')
  } catch {
    return raw
  }
}

// ── PasswordChangeModal ────────────────────────────────────────────────────────
function PasswordChangeModal({ clinic, onClose }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (form.new_password.length < 8) { setError('新しいパスワードは8文字以上で設定してください'); return }
    if (form.new_password !== form.confirm_password) { setError('新しいパスワードが一致しません'); return }
    setSaving(true); setError('')
    try {
      await api.put(`${BASE}/api/group/clinics/${clinic.id}/password`, {
        current_password: form.current_password,
        new_password: form.new_password,
      })
      setSuccess(true)
      setTimeout(onClose, 1500)
    } catch (e) {
      setError(e.response?.data?.error || 'パスワード変更に失敗しました')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">パスワード変更</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <p className="text-xs text-gray-500">{clinic.name}</p>
          {[
            { key: 'current_password', label: '現在のパスワード' },
            { key: 'new_password', label: '新しいパスワード（8文字以上）' },
            { key: 'confirm_password', label: '新しいパスワード（確認）' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type="password"
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">パスワードを変更しました</div>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">キャンセル</button>
          <button onClick={handleSave} disabled={saving || success} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
            {saving ? '変更中...' : '変更する'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ClinicFormModal ────────────────────────────────────────────────────────────
function ClinicFormModal({ editing, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    if (editing) {
      return {
        name: editing.name || '',
        address: editing.address || '',
        map_url: editing.map_url || '',
        phone: editing.phone || '',
        contact_email: editing.contact_email || '',
        hours: parseHours(editing.hours),
        closed_days: parseClosedDays(editing.closed_days),
        password: '',
        confirm_password: '',
      }
    }
    return { ...EMPTY_CLINIC_FORM }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setHourDay = (day, field, val) => setForm(f => ({
    ...f, hours: { ...f.hours, [day]: { ...f.hours[day], [field]: val } }
  }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('店舗名は必須です'); return }
    if (!editing) {
      if (form.password.length < 8) { setError('パスワードは8文字以上で設定してください'); return }
      if (form.password !== form.confirm_password) { setError('パスワードが一致しません'); return }
    }
    setSaving(true); setError('')
    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      map_url: form.map_url.trim(),
      phone: form.phone.trim(),
      contact_email: form.contact_email.trim(),
      hours: serializeHours(form.hours),
      closed_days: serializeClosedDays(form.closed_days),
    }
    if (!editing) {
      payload.password = form.password
    }
    try {
      if (editing) {
        await api.put(`${BASE}/api/group/clinics/${editing.id}`, payload)
      } else {
        await api.post(`${BASE}/api/group/clinics`, payload)
      }
      onSaved()
    } catch (e) {
      setError(e.response?.data?.error || '保存に失敗しました')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">{editing ? '店舗情報を編集' : '店舗を追加'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* ボディ */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">

          {/* 基本情報 */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">基本情報</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">店舗名 <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setField('name', e.target.value)}
                  placeholder="例：テストクリニック渋谷院"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">住所</label>
                <input type="text" value={form.address} onChange={e => setField('address', e.target.value)}
                  placeholder="例：東京都渋谷区〇〇1-2-3"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">GoogleマップURL</label>
                <input type="url" value={form.map_url} onChange={e => setField('map_url', e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">電話番号</label>
                <input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)}
                  placeholder="例：03-1234-5678"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  連絡先メールアドレス
                  <span className="ml-1 text-gray-400 font-normal">（パスワードリセット用）</span>
                </label>
                <input type="email" value={form.contact_email} onChange={e => setField('contact_email', e.target.value)}
                  placeholder="例：shibuya@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </section>

          {/* 営業時間 */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">営業時間（曜日別）</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {DAYS.map((day, idx) => (
                <div key={day} className={`flex items-center gap-3 px-4 py-2.5 ${idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                  <span className={`w-6 text-xs font-bold flex-shrink-0 ${day === 'sat' ? 'text-blue-600' : day === 'sun' ? 'text-red-500' : 'text-gray-700'}`}>
                    {DAY_LABELS[day]}
                  </span>
                  <label className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.hours[day].closed}
                      onChange={e => setHourDay(day, 'closed', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-gray-400"
                    />
                    <span className="text-xs text-gray-500">定休日</span>
                  </label>
                  {!form.hours[day].closed ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="time"
                        value={form.hours[day].open}
                        onChange={e => setHourDay(day, 'open', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <span className="text-xs text-gray-400">〜</span>
                      <input
                        type="time"
                        value={form.hours[day].close}
                        onChange={e => setHourDay(day, 'close', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 flex-1">ー</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 特別休業 */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">特別休業・臨時休業</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">備考</label>
              <textarea
                value={form.closed_days.note}
                onChange={e => setForm(f => ({ ...f, closed_days: { note: e.target.value } }))}
                placeholder="例：祝日休診、年末年始（12/29〜1/3）"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </section>

          {/* パスワード（新規のみ） */}
          {!editing && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ログインパスワード</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">パスワード <span className="text-red-500">*</span></label>
                  <input type="password" value={form.password} onChange={e => setField('password', e.target.value)}
                    placeholder="8文字以上"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">パスワード（確認） <span className="text-red-500">*</span></label>
                  <input type="password" value={form.confirm_password} onChange={e => setField('confirm_password', e.target.value)}
                    placeholder="もう一度入力"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </section>
          )}

          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">キャンセル</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ClinicAdminView ────────────────────────────────────────────────────────────
function ClinicAdminView() {
  const { user, switchClinic } = useAuth()
  const navigate = useNavigate()
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [pwdTarget, setPwdTarget] = useState(null)
  const [resetSending, setResetSending] = useState(null) // clinic.id
  const [resetDone, setResetDone] = useState(null)   // clinic.id

  const load = () => {
    setLoading(true)
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
  const openNew = () => { setEditing(null); setShowFormModal(true) }
  const openEdit = (c) => { setEditing(c); setShowFormModal(true) }
  const handleSaved = () => { setShowFormModal(false); load() }

  const handleResetPassword = async (clinic) => {
    setResetSending(clinic.id)
    try {
      await api.post(`${BASE}/api/group/clinics/${clinic.id}/reset-password`)
      setResetDone(clinic.id)
      setTimeout(() => setResetDone(null), 3000)
    } catch (e) {
      alert(e.response?.data?.error || 'メール送信に失敗しました')
    } finally { setResetSending(null) }
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
          const lineConnected = clinic.line_connected
          const hoursSummary = formatHoursSummary(clinic.hours)
          return (
            <div key={clinic.id} className={`bg-white rounded-xl border shadow-sm p-5 ${isSelected ? 'ring-2 ring-primary-500 border-primary-200' : 'border-gray-100'}`}>
              {/* ヘッダー */}
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
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* ステータスバッジ */}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${clinic.status === 'active' ? 'bg-green-100 text-green-700' : clinic.status === 'trial' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {clinic.status === 'active' ? '稼働中' : clinic.status === 'trial' ? 'トライアル' : '停止中'}
                  </span>
                  {/* LINE接続バッジ */}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lineConnected ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                    LINE {lineConnected ? '✓' : '未連携'}
                  </span>
                  {/* 編集ボタン */}
                  <button onClick={() => openEdit(clinic)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="編集">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 詳細情報 */}
              <dl className="space-y-1 text-xs text-gray-500 mb-3">
                {clinic.address && (
                  <div className="flex gap-2">
                    <dt className="w-16 font-medium text-gray-400 flex-shrink-0">住所</dt>
                    <dd className="break-all">{clinic.address}</dd>
                  </div>
                )}
                {clinic.phone && (
                  <div className="flex gap-2">
                    <dt className="w-16 font-medium text-gray-400 flex-shrink-0">電話</dt>
                    <dd>{clinic.phone}</dd>
                  </div>
                )}
                {hoursSummary && (
                  <div className="flex gap-2">
                    <dt className="w-16 font-medium text-gray-400 flex-shrink-0">営業時間</dt>
                    <dd className="leading-relaxed">{hoursSummary}</dd>
                  </div>
                )}
              </dl>

              {/* アクションボタン */}
              <div className="flex gap-2">
                <button onClick={() => handleManage(clinic.id)} className="flex-1 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-lg transition-colors">
                  {isSelected ? '管理中（ダッシュボードへ）' : 'この店舗を管理する'}
                </button>
                <button onClick={() => setPwdTarget(clinic)} className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors" title="パスワード変更">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleResetPassword(clinic)}
                  disabled={resetSending === clinic.id}
                  className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${resetDone === clinic.id ? 'text-green-600 border-green-200 bg-green-50' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                  title="パスワードリセットメールを送信"
                >
                  {resetDone === clinic.id ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : resetSending === clinic.id ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
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

      {showFormModal && (
        <ClinicFormModal editing={editing} onClose={() => setShowFormModal(false)} onSaved={handleSaved} />
      )}
      {pwdTarget && (
        <PasswordChangeModal clinic={pwdTarget} onClose={() => { setPwdTarget(null); load() }} />
      )}
    </div>
  )
}

// ── SuperAdminView ─────────────────────────────────────────────────────────────
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
    setEditForm({ group_name: group.name || '', user_name: group.user_name || '', email: group.user_email || '' })
    setEditError('')
  }

  const handleSaveEdit = async () => {
    setSaving(true); setEditError('')
    try {
      await api.put(`${BASE}/api/admin/groups/${editTarget.id}`, editForm)
      setEditTarget(null); load()
    } catch (e) {
      setEditError(e.response?.data?.error || '保存に失敗しました')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">読み込み中...</div>

  const statusColor = (s) => s === 'active' ? 'bg-green-100 text-green-700' : s === 'trial' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
  const statusLabel = (s) => ({ active: '稼働中', trial: 'トライアル', suspended: '停止中' }[s] || s)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">顧客一覧</h1>
          <p className="text-sm text-gray-500 mt-1">{groups.length}件の法人・個人事業主</p>
        </div>
        <button onClick={() => navigate('/invite')} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
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
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold text-sm">{group.name?.[0] || 'G'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{group.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{group.user_email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{group.clinic_count || 0}店舗</span>
                  <button onClick={() => openEdit(group)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="編集">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => toggleExpand(group.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <svg className={`w-4 h-4 transition-transform ${expanded[group.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

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
                        <button onClick={() => handleManageClinic(clinic.id)} className="flex-shrink-0 px-3 py-1 text-xs font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-lg transition-colors">
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
              {[
                { key: 'group_name', label: '法人名 / 個人事業主名', type: 'text' },
                { key: 'user_name', label: '担当者名', type: 'text' },
                { key: 'email', label: 'メールアドレス', type: 'email' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={type} value={editForm[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              ))}
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
