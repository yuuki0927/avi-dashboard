import React, { useState, useEffect, useCallback } from 'react'
import api from '../lib/apiClient'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const PLAN_MAP = {
  trial:      { label: 'トライアル', cls: 'bg-yellow-100 text-yellow-800' },
  basic:      { label: 'ベーシック', cls: 'bg-blue-100 text-blue-800' },
  premium:    { label: 'プレミアム', cls: 'bg-purple-100 text-purple-800' },
  enterprise: { label: 'エンタープライズ', cls: 'bg-indigo-100 text-indigo-800' },
}

const PAYMENT_MAP = {
  paid:    { label: '支払済', cls: 'bg-green-100 text-green-800' },
  unpaid:  { label: '未払い', cls: 'bg-red-100 text-red-800' },
  overdue: { label: '滞納中', cls: 'bg-red-200 text-red-900' },
}

const STATUS_MAP = {
  active:    { label: '稼働中', cls: 'bg-green-100 text-green-800' },
  trial:     { label: 'トライアル', cls: 'bg-yellow-100 text-yellow-800' },
  suspended: { label: '停止中', cls: 'bg-gray-100 text-gray-600' },
}

function Badge({ map, value }) {
  const item = map[value] || { label: value || '—', cls: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${item.cls}`}>
      {item.label}
    </span>
  )
}

// ── クリニック一覧タブ ────────────────────────────────────────────────────────

function ClinicsTab() {
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // { id, plan_type, payment_status, subscription_end_date, status, memo }
  const [saving, setSaving] = useState(false)
  const [filterPayment, setFilterPayment] = useState('all')

  const load = useCallback(() => {
    setLoading(true)
    api.get(`${BASE}/api/admin/clinics-full`)
      .then(r => setClinics(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openEdit = (c) => setEditing({
    id: c.id,
    name: c.name,
    plan_type: c.plan_type || 'trial',
    payment_status: c.payment_status || 'unpaid',
    subscription_end_date: c.subscription_end_date || '',
    status: c.status || 'trial',
    trial_expires_at: c.trial_expires_at || '',
    memo: c.memo || '',
  })

  const saveEdit = async () => {
    setSaving(true)
    try {
      const { id, name, ...data } = editing
      await api.put(`${BASE}/api/admin/clinics/${id}/subscription`, data)
      setEditing(null)
      load()
    } catch (e) {
      alert(e.response?.data?.error || '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const filtered = filterPayment === 'all'
    ? clinics
    : clinics.filter(c => c.payment_status === filterPayment)

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">読み込み中...</div>

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="flex gap-2 flex-wrap">
        {[['all','すべて'],['paid','支払済'],['unpaid','未払い'],['overdue','滞納中']].map(([v, l]) => (
          <button key={v} onClick={() => setFilterPayment(v)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterPayment === v ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {l}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} 件</span>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">クリニック名</th>
              <th className="px-4 py-3 text-left">ステータス</th>
              <th className="px-4 py-3 text-left">プラン</th>
              <th className="px-4 py-3 text-left">支払い</th>
              <th className="px-4 py-3 text-left">期限</th>
              <th className="px-4 py-3 text-left">LINE</th>
              <th className="px-4 py-3 text-left">メモ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3"><Badge map={STATUS_MAP} value={c.status} /></td>
                <td className="px-4 py-3"><Badge map={PLAN_MAP} value={c.plan_type} /></td>
                <td className="px-4 py-3"><Badge map={PAYMENT_MAP} value={c.payment_status} /></td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {c.subscription_end_date || c.trial_expires_at || '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {c.line_destination ? (
                    <span className="text-green-600">設定済</span>
                  ) : (
                    <span className="text-gray-300">未設定</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 max-w-[120px] truncate">{c.memo || '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(c)}
                    className="text-xs text-primary-600 hover:underline">編集</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">該当するクリニックがありません</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 編集モーダル */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-gray-900">{editing.name} — 契約情報編集</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">プラン</label>
                <select value={editing.plan_type} onChange={e => setEditing(v => ({ ...v, plan_type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {Object.entries(PLAN_MAP).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">支払い状態</label>
                <select value={editing.payment_status} onChange={e => setEditing(v => ({ ...v, payment_status: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {Object.entries(PAYMENT_MAP).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">稼働ステータス</label>
                <select value={editing.status} onChange={e => setEditing(v => ({ ...v, status: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {Object.entries(STATUS_MAP).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">契約終了日</label>
                <input type="date" value={editing.subscription_end_date}
                  onChange={e => setEditing(v => ({ ...v, subscription_end_date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">メモ（社内用）</label>
              <input type="text" value={editing.memo}
                onChange={e => setEditing(v => ({ ...v, memo: e.target.value }))}
                placeholder="担当者・経緯など"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
              <button onClick={saveEdit} disabled={saving}
                className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50">
                {saving ? '保存中…' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SHARED_RULES 編集タブ ─────────────────────────────────────────────────────

function SharedRulesTab() {
  const [rules, setRules] = useState('')
  const [fromDb, setFromDb] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [resetting, setResetting] = useState(false)

  const load = () => {
    setLoading(true)
    api.get(`${BASE}/api/admin/shared-rules`)
      .then(r => { setRules(r.data.shared_rules); setFromDb(r.data.from_db) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true); setSaved(false)
    try {
      await api.put(`${BASE}/api/admin/shared-rules`, { shared_rules: rules })
      setSaved(true); setFromDb(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      alert(e.response?.data?.error || '保存に失敗しました')
    } finally {
      setSaving(false) }
  }

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">読み込み中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            全クリニック共通の会話ルール（佐藤ペルソナ・文章ルール・接客スタンスなど）
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {fromDb ? 'DBに保存済みの設定を表示中' : 'コードのデフォルト値を表示中（保存するとDB管理に切り替わります）'}
          </p>
        </div>
        <div className="flex gap-2">
          {fromDb && (
            <button
              onClick={() => { if (window.confirm('DBの設定を削除してコードのデフォルトに戻しますか？')) {
                api.put(`${BASE}/api/admin/shared-rules`, { shared_rules: '' })
                  .then(load).catch(console.error)
              }}}
              className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              デフォルトに戻す
            </button>
          )}
          <button onClick={save} disabled={saving}
            className="px-4 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50">
            {saving ? '保存中…' : saved ? '✓ 保存済み' : '全クリニックに反映'}
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-b border-gray-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
          SHARED_RULES — {`{clinic_name}`} と {`{map_url}`} はクリニックごとに自動置換されます
        </div>
        <textarea
          value={rules}
          onChange={e => setRules(e.target.value)}
          rows={30}
          className="w-full px-4 py-3 font-mono text-xs text-gray-800 resize-y focus:outline-none"
          spellCheck={false}
        />
      </div>

      <p className="text-xs text-gray-400">
        保存後、次のメッセージ受信から全クリニックに反映されます。既存の会話には影響しません。
      </p>
    </div>
  )
}

// ── メインページ ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'clinics', label: 'クリニック管理' },
  { id: 'shared-rules', label: 'SHARED_RULES' },
]

export default function PlatformAdmin() {
  const [tab, setTab] = useState('clinics')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">プラットフォーム管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">super_admin 専用ダッシュボード</p>
        </div>
      </div>

      {/* タブ */}
      <div className="border-b border-gray-200 flex gap-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'clinics' && <ClinicsTab />}
      {tab === 'shared-rules' && <SharedRulesTab />}
    </div>
  )
}
