import React, { useState, useEffect, useCallback } from 'react'
import api from '../lib/apiClient'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// ── バッジ定義 ────────────────────────────────────────────────────────────────

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

function Badge({ map, value }) {
  const item = map[value] || { label: value || '—', cls: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${item.cls}`}>
      {item.label}
    </span>
  )
}

// ── 法人登録ウィザード ────────────────────────────────────────────────────────

const EMPTY_ENTITY = {
  corporate_name: '', brand_name: '', tax_id: '', address: '',
  representative: '', phone: '', email: '',
  plan_type: 'trial', payment_status: 'unpaid', subscription_end_date: '', memo: '',
}

const EMPTY_CLINIC = { name: '', address: '', phone: '', hours: '', holidays: '' }

function RegistrationWizard({ onClose, onDone }) {
  const [step, setStep] = useState(1)
  const [entityForm, setEntityForm] = useState(EMPTY_ENTITY)
  const [clinicForm, setClinicForm] = useState(EMPTY_CLINIC)
  const [createdEntityId, setCreatedEntityId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const saveEntity = async () => {
    if (!entityForm.corporate_name.trim()) { setError('法人名は必須です'); return }
    setSaving(true); setError('')
    try {
      const res = await api.post(`${BASE}/api/admin/legal-entities`, entityForm)
      setCreatedEntityId(res.data.id)
      setStep(2)
    } catch (e) {
      setError(e.response?.data?.error || '保存に失敗しました')
    } finally { setSaving(false) }
  }

  const saveClinic = async () => {
    if (!clinicForm.name.trim()) { setError('店舗名は必須です'); return }
    setSaving(true); setError('')
    try {
      await api.post(`${BASE}/api/admin/legal-entities/${createdEntityId}/clinics`, clinicForm)
      onDone()
    } catch (e) {
      setError(e.response?.data?.error || '保存に失敗しました')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
        {/* ステップ表示 */}
        <div className="flex items-center gap-3">
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                s === step ? 'bg-primary-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>{s < step ? '✓' : s}</div>
              {s < 2 && <div className="flex-1 h-0.5 bg-gray-200" />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <>
            <h3 className="font-bold text-gray-900 text-lg">法人情報の登録</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">法人名 <span className="text-red-500">*</span></label>
                <input type="text" value={entityForm.corporate_name}
                  onChange={e => setEntityForm(f => ({ ...f, corporate_name: e.target.value }))}
                  placeholder="例：株式会社〇〇メディカル"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ブランド名</label>
                <input type="text" value={entityForm.brand_name}
                  onChange={e => setEntityForm(f => ({ ...f, brand_name: e.target.value }))}
                  placeholder="例：〇〇クリニック"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">代表者名</label>
                  <input type="text" value={entityForm.representative}
                    onChange={e => setEntityForm(f => ({ ...f, representative: e.target.value }))}
                    placeholder="例：山田 太郎"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">電話番号</label>
                  <input type="text" value={entityForm.phone}
                    onChange={e => setEntityForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="例：03-0000-0000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">メールアドレス</label>
                <input type="email" value={entityForm.email}
                  onChange={e => setEntityForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="例：info@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">本社住所</label>
                <input type="text" value={entityForm.address}
                  onChange={e => setEntityForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="例：東京都渋谷区〇〇 1-2-3"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">契約プラン</label>
                  <select value={entityForm.plan_type}
                    onChange={e => setEntityForm(f => ({ ...f, plan_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {Object.entries(PLAN_MAP).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">支払い状態</label>
                  <select value={entityForm.payment_status}
                    onChange={e => setEntityForm(f => ({ ...f, payment_status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {Object.entries(PAYMENT_MAP).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="font-bold text-gray-900 text-lg">最初の店舗を登録</h3>
            <p className="text-xs text-gray-500">後から追加することもできます。スキップも可能です。</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">店舗名 <span className="text-red-500">*</span></label>
                <input type="text" value={clinicForm.name}
                  onChange={e => setClinicForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="例：〇〇院"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">住所</label>
                <input type="text" value={clinicForm.address}
                  onChange={e => setClinicForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">電話番号</label>
                  <input type="text" value={clinicForm.phone}
                    onChange={e => setClinicForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">営業時間</label>
                  <input type="text" value={clinicForm.hours}
                    onChange={e => setClinicForm(f => ({ ...f, hours: e.target.value }))}
                    placeholder="例：10:00〜19:00"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex justify-between items-center pt-1">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">キャンセル</button>
          <div className="flex gap-2">
            {step === 2 && (
              <button onClick={onDone} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                スキップして完了
              </button>
            )}
            <button
              onClick={step === 1 ? saveEntity : saveClinic}
              disabled={saving}
              className="px-5 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50">
              {saving ? '保存中…' : step === 1 ? '次へ：店舗登録' : '登録して完了'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 法人編集モーダル ──────────────────────────────────────────────────────────

function EntityEditModal({ entity, onClose, onSave }) {
  const [form, setForm] = useState({
    corporate_name: entity.corporate_name || '',
    brand_name: entity.brand_name || '',
    tax_id: entity.tax_id || '',
    address: entity.address || '',
    representative: entity.representative || '',
    phone: entity.phone || '',
    email: entity.email || '',
    plan_type: entity.plan_type || 'trial',
    payment_status: entity.payment_status || 'unpaid',
    subscription_end_date: entity.subscription_end_date || '',
    memo: entity.memo || '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`${BASE}/api/admin/legal-entities/${entity.id}`, form)
      onSave()
    } catch (e) {
      alert(e.response?.data?.error || '保存に失敗しました')
    } finally { setSaving(false) }
  }

  const F = ({ label, field, placeholder, type = 'text' }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={form[field]} placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-gray-900 text-lg">法人情報を編集</h3>
        <div className="space-y-3">
          <F label="法人名" field="corporate_name" placeholder="株式会社〇〇" />
          <F label="ブランド名" field="brand_name" placeholder="〇〇クリニック" />
          <div className="grid grid-cols-2 gap-3">
            <F label="代表者名" field="representative" placeholder="山田 太郎" />
            <F label="電話番号" field="phone" placeholder="03-0000-0000" />
          </div>
          <F label="メールアドレス" field="email" type="email" placeholder="info@example.com" />
          <F label="住所" field="address" placeholder="東京都渋谷区〇〇" />
          <F label="法人番号" field="tax_id" placeholder="0000-00-000000" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">契約プラン</label>
              <select value={form.plan_type} onChange={e => setForm(f => ({ ...f, plan_type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {Object.entries(PLAN_MAP).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">支払い状態</label>
              <select value={form.payment_status} onChange={e => setForm(f => ({ ...f, payment_status: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {Object.entries(PAYMENT_MAP).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">契約終了日</label>
            <input type="date" value={form.subscription_end_date}
              onChange={e => setForm(f => ({ ...f, subscription_end_date: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <F label="メモ（社内用）" field="memo" placeholder="担当者・経緯など" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50">
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 店舗追加モーダル ──────────────────────────────────────────────────────────

function AddClinicModal({ entityId, entityName, onClose, onDone }) {
  const [form, setForm] = useState(EMPTY_CLINIC)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    if (!form.name.trim()) { setError('店舗名は必須です'); return }
    setSaving(true); setError('')
    try {
      await api.post(`${BASE}/api/admin/legal-entities/${entityId}/clinics`, form)
      onDone()
    } catch (e) {
      setError(e.response?.data?.error || '保存に失敗しました')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-bold text-gray-900">店舗を追加 — {entityName}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">店舗名 <span className="text-red-500">*</span></label>
            <input type="text" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="例：〇〇院"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">住所</label>
            <input type="text" value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">電話番号</label>
              <input type="text" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">営業時間</label>
              <input type="text" value={form.hours}
                onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                placeholder="10:00〜19:00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50">
            {saving ? '追加中…' : '追加'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 店舗LINE設定パネル（モーダル）────────────────────────────────────────────

const WEBHOOK_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://avi-bot-clinic.fly.dev'}/webhook`

function ShopLinePanel({ clinic, onClose }) {
  const [masked, setMasked] = useState({ token: '', secret: '' })
  const [form, setForm] = useState({ channel_access_token: '', channel_secret: '' })
  const [showToken, setShowToken] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [destination, setDestination] = useState(clinic.line_destination || '')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get(`${BASE}/api/admin/clinics/${clinic.id}/line-settings`)
      .then(r => {
        setMasked({
          token:  r.data.channel_access_token_masked || '',
          secret: r.data.channel_secret_masked || '',
        })
        setDestination(r.data.line_destination || '')
      })
      .catch(() => {})
  }, [clinic.id])

  const save = async () => {
    setSaving(true)
    try {
      const payload = {}
      if (form.channel_access_token) payload.channel_access_token = form.channel_access_token
      if (form.channel_secret)       payload.channel_secret       = form.channel_secret
      await api.put(`${BASE}/api/admin/clinics/${clinic.id}/line-settings`, payload)
      const r = await api.get(`${BASE}/api/admin/clinics/${clinic.id}/line-settings`)
      setMasked({ token: r.data.channel_access_token_masked || '', secret: r.data.channel_secret_masked || '' })
      setDestination(r.data.line_destination || '')
      setForm({ channel_access_token: '', channel_secret: '' })
      setShowToken(false); setShowSecret(false)
    } catch (e) {
      alert(e.response?.data?.error || '保存に失敗しました')
    } finally { setSaving(false) }
  }

  const test = async () => {
    setTesting(true); setTestResult(null)
    try {
      const res = await api.post(`${BASE}/api/admin/clinics/${clinic.id}/line-settings/test`, { message: 'LINEボット連携テスト ✅' })
      setTestResult({ success: true, message: res.data.message, destination: res.data.line_destination })
      if (res.data.line_destination) setDestination(res.data.line_destination)
    } catch (e) {
      setTestResult({ success: false, message: e.response?.data?.error || e.message })
    } finally { setTesting(false) }
  }

  const copyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">LINE設定 — {clinic.name}</h3>
            {destination
              ? <p className="text-xs text-green-600 mt-0.5">接続済：{destination}</p>
              : <p className="text-xs text-gray-400 mt-0.5">未接続</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Webhook URL */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1">
          <p className="text-xs font-semibold text-green-800">Webhook URL（LINE Developersに設定）</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-gray-700 break-all bg-white border border-green-100 rounded px-2 py-1">{WEBHOOK_URL}</code>
            <button onClick={copyWebhook}
              className={`px-2 py-1 text-xs rounded flex-shrink-0 font-medium transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
              {copied ? 'コピー済み' : 'コピー'}
            </button>
          </div>
        </div>

        {/* チャネル設定 */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">チャネルアクセストークン</label>
            {masked.token && !showToken
              ? <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-mono">{masked.token}</span>
                  <button onClick={() => setShowToken(true)} className="text-xs text-primary-600 hover:underline">変更する</button>
                </div>
              : <input type="password" value={form.channel_access_token}
                  onChange={e => setForm(f => ({ ...f, channel_access_token: e.target.value }))}
                  placeholder="長期アクセストークンを入力"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" />}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">チャネルシークレット</label>
            {masked.secret && !showSecret
              ? <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-mono">{masked.secret}</span>
                  <button onClick={() => setShowSecret(true)} className="text-xs text-primary-600 hover:underline">変更する</button>
                </div>
              : <input type="password" value={form.channel_secret}
                  onChange={e => setForm(f => ({ ...f, channel_secret: e.target.value }))}
                  placeholder="チャネルシークレットを入力"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" />}
          </div>
        </div>

        {/* ボタン */}
        <div className="flex items-center gap-3">
          <button onClick={test} disabled={testing}
            className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg disabled:opacity-50">
            {testing ? 'テスト中…' : '連携テスト'}
          </button>
          <div className="flex-1" />
          <button onClick={save} disabled={saving}
            className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50">
            {saving ? '保存中…' : '保存'}
          </button>
        </div>

        {testResult && (
          <div className={`rounded-lg p-3 text-sm space-y-1 ${testResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            <p>{testResult.success ? '✓ ' : '✗ '}{testResult.message}</p>
            {testResult.destination && (
              <p className="text-xs font-mono">Bot User ID 自動取得・保存済み：{testResult.destination}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── 法人一覧タブ ──────────────────────────────────────────────────────────────

function LegalEntitiesTab() {
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const [editingEntity, setEditingEntity] = useState(null)
  const [addingClinicTo, setAddingClinicTo] = useState(null) // { id, name }
  const [expanded, setExpanded] = useState({})
  const [lineSettingClinic, setLineSettingClinic] = useState(null) // { id, name, line_destination }

  const load = useCallback(() => {
    setLoading(true)
    api.get(`${BASE}/api/admin/legal-entities`)
      .then(r => setEntities(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">読み込み中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{entities.length} 法人 / {entities.reduce((s, e) => s + (e.clinic_count || 0), 0)} 店舗</p>
        <button onClick={() => setShowWizard(true)}
          className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
          + 新規法人を登録
        </button>
      </div>

      {entities.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-16 text-center space-y-3">
          <p className="text-gray-400 text-sm">登録済みの法人がありません</p>
          <button onClick={() => setShowWizard(true)}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg">
            最初の法人を登録する
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {entities.map(entity => (
            <div key={entity.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* 法人ヘッダー */}
              <div className="bg-white px-5 py-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-700 font-bold text-sm">
                    {entity.brand_name?.[0] || entity.corporate_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{entity.brand_name || entity.corporate_name}</h3>
                      <Badge map={PLAN_MAP} value={entity.plan_type} />
                      <Badge map={PAYMENT_MAP} value={entity.payment_status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{entity.corporate_name}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      {entity.representative && <span>代表：{entity.representative}</span>}
                      {entity.phone && <span>{entity.phone}</span>}
                      {entity.subscription_end_date && <span>契約終了：{entity.subscription_end_date}</span>}
                    </div>
                    {entity.memo && <p className="text-xs text-gray-400 mt-0.5 italic">{entity.memo}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setAddingClinicTo({ id: entity.id, name: entity.brand_name || entity.corporate_name })}
                      className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                      + 店舗追加
                    </button>
                    <button onClick={() => setEditingEntity(entity)}
                      className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                      編集
                    </button>
                    <button onClick={() => toggleExpand(entity.id)}
                      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600">
                      店舗 {entity.clinic_count}件 {expanded[entity.id] ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 店舗一覧（展開時） */}
              {expanded[entity.id] && (
                <div className="border-t border-gray-100 bg-gray-50">
                  {(entity.clinics || []).length === 0 ? (
                    <p className="px-5 py-3 text-xs text-gray-400">店舗が登録されていません</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-5 py-2 text-left text-gray-400 font-medium">店舗名</th>
                          <th className="px-4 py-2 text-left text-gray-400 font-medium">ステータス</th>
                          <th className="px-4 py-2 text-left text-gray-400 font-medium">LINE</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {entity.clinics.map(c => (
                          <tr key={c.id} className="border-b border-gray-100 last:border-0">
                            <td className="px-5 py-2.5 font-medium text-gray-700">{c.name}</td>
                            <td className="px-4 py-2.5">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}>{c.status === 'active' ? '稼働中' : c.status}</span>
                            </td>
                            <td className="px-4 py-2.5">
                              {c.line_destination
                                ? <span className="text-green-600">接続済</span>
                                : <span className="text-amber-500">未接続</span>}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                onClick={() => setLineSettingClinic(c)}
                                className="text-xs text-primary-600 hover:underline">
                                LINE設定
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showWizard && (
        <RegistrationWizard
          onClose={() => setShowWizard(false)}
          onDone={() => { setShowWizard(false); load() }}
        />
      )}
      {editingEntity && (
        <EntityEditModal
          entity={editingEntity}
          onClose={() => setEditingEntity(null)}
          onSave={() => { setEditingEntity(null); load() }}
        />
      )}
      {addingClinicTo && (
        <AddClinicModal
          entityId={addingClinicTo.id}
          entityName={addingClinicTo.name}
          onClose={() => setAddingClinicTo(null)}
          onDone={() => { setAddingClinicTo(null); load() }}
        />
      )}
      {lineSettingClinic && (
        <ShopLinePanel
          clinic={lineSettingClinic}
          onClose={() => { setLineSettingClinic(null); load() }}
        />
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
    } finally { setSaving(false) }
  }

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">読み込み中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">全クリニック共通の会話ルール（佐藤ペルソナ・文章ルール・接客スタンスなど）</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {fromDb ? 'DBに保存済みの設定' : 'コードのデフォルト値（保存するとDB管理に切り替わります）'}
          </p>
        </div>
        <button onClick={save} disabled={saving}
          className="px-4 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50">
          {saving ? '保存中…' : saved ? '✓ 保存済み' : '全クリニックに反映'}
        </button>
      </div>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
          SHARED_RULES — {'{clinic_name}'} と {'{map_url}'} はクリニックごとに自動置換
        </div>
        <textarea
          value={rules}
          onChange={e => setRules(e.target.value)}
          rows={30}
          className="w-full px-4 py-3 font-mono text-xs text-gray-800 resize-y focus:outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  )
}

// ── メインページ ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'legal-entities', label: '法人管理' },
  { id: 'shared-rules',   label: 'SHARED_RULES' },
]

export default function PlatformAdmin() {
  const [tab, setTab] = useState('legal-entities')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">プラットフォーム管理</h1>
        <p className="text-sm text-gray-500 mt-0.5">super_admin 専用</p>
      </div>

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

      {tab === 'legal-entities' && <LegalEntitiesTab />}
      {tab === 'shared-rules' && <SharedRulesTab />}
    </div>
  )
}
