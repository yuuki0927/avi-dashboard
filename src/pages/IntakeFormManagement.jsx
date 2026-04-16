import React, { useState, useEffect, useRef } from 'react'
import api from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import InfoBanner from '../components/ui/InfoBanner'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const FORM_API = `${BASE}/api/clinic/intake-form`

const FIELD_TYPES = [
  { value: 'text',     label: 'テキスト（1行）' },
  { value: 'textarea', label: 'テキスト（複数行）' },
  { value: 'select',   label: 'ドロップダウン選択' },
  { value: 'radio',    label: '単一選択（ラジオ）' },
  { value: 'checkbox', label: '複数選択（チェック）' },
]

const TABS = [
  { id: 'builder',     label: 'フォーム設定' },
  { id: 'submissions', label: '回答一覧' },
]

// ── 質問エディタ ──────────────────────────────────────────────────────────────

function FieldEditor({ field, index, onChange, onDelete, onDragStart, onDragOver, onDrop, onDragEnd, isDragOver }) {
  const needsOptions = ['select', 'radio', 'checkbox'].includes(field.field_type)

  const addOption = () => onChange({ ...field, options: [...(field.options || []), ''] })

  const updateOption = (i, val) => {
    const opts = [...(field.options || [])]
    opts[i] = val
    onChange({ ...field, options: opts })
  }

  const removeOption = (i) => {
    onChange({ ...field, options: (field.options || []).filter((_, idx) => idx !== i) })
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`bg-white border rounded-xl p-4 space-y-3 transition-all cursor-default
        ${isDragOver ? 'border-primary-400 border-dashed bg-primary-50 scale-[1.01]' : 'border-gray-200'}`}
    >
      {/* ヘッダー行 */}
      <div className="flex items-center gap-2">
        {/* ドラッグハンドル */}
        <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0 select-none" title="ドラッグして並び替え">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
          </svg>
        </div>

        {/* 番号 */}
        <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
          {index + 1}
        </span>

        {/* タイプ選択 */}
        <select
          value={field.field_type}
          onChange={e => onChange({ ...field, field_type: e.target.value, options: [] })}
          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
        >
          {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        {/* 削除 */}
        <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500 flex-shrink-0 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 質問文 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          質問文 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={field.label}
          onChange={e => onChange({ ...field, label: e.target.value })}
          placeholder="例：アレルギーはありますか？"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* 選択肢 */}
      {needsOptions && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">選択肢</label>
          <div className="space-y-2">
            {(field.options || []).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-4 flex-shrink-0">{i + 1}.</span>
                <input
                  type="text"
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  placeholder={`選択肢 ${i + 1}`}
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => removeOption(i)}
                  className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors border border-dashed border-primary-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              選択肢を追加
            </button>
          </div>
        </div>
      )}

      {/* 必須トグル */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...field, required: !field.required })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${field.required ? 'bg-primary-600' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${field.required ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </button>
        <span className="text-xs text-gray-500">必須項目にする</span>
      </div>
    </div>
  )
}

// ── フォームビルダー ──────────────────────────────────────────────────────────

function FormBuilder({ clinicId }) {
  const [form, setForm]     = useState({ title: '問診表', description: '', is_active: true, fields: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [copied, setCopied]   = useState(false)
  const [dragIndex, setDragIndex]   = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const frontBase = import.meta.env.VITE_FRONT_URL || window.location.origin
  const [formToken, setFormToken] = useState('')
  const publicUrl = formToken ? `${frontBase}/form/${formToken}` : ''

  useEffect(() => {
    api.get(FORM_API)
      .then(r => {
        setForm(r.data)
        if (r.data.form_token) setFormToken(r.data.form_token)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [clinicId])

  const addField = () => {
    setForm(f => ({
      ...f,
      fields: [...f.fields, { field_type: 'text', label: '', options: [], required: false }]
    }))
  }

  const updateField = (i, updated) => {
    setForm(f => ({ ...f, fields: f.fields.map((field, idx) => idx === i ? updated : field) }))
  }

  const deleteField = (i) => {
    setForm(f => ({ ...f, fields: f.fields.filter((_, idx) => idx !== i) }))
  }

  // ── ドラッグ＆ドロップ並び替え ────────────────────────────────────────────
  const handleDragStart = (i) => setDragIndex(i)

  const handleDragOver = (e, i) => {
    e.preventDefault()
    if (dragOverIndex !== i) setDragOverIndex(i)
  }

  const handleDrop = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return
    setForm(f => {
      const fields = [...f.fields]
      const [moved] = fields.splice(dragIndex, 1)
      fields.splice(targetIndex, 0, moved)
      return { ...f, fields }
    })
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const save = async () => {
    setSaving(true)
    try {
      const r = await api.post(FORM_API, form)
      setForm(r.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="text-center py-12 text-gray-400 text-sm">読み込み中...</div>

  return (
    <div className="space-y-5">
      {/* フォームURL */}
      <div className="border border-primary-200 bg-primary-50 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-primary-800">問診表URL（LINE上でお客様に送付）</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-white border border-primary-200 rounded px-3 py-1.5 text-xs text-gray-700 break-all">{publicUrl}</code>
          <button onClick={copyUrl}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex-shrink-0 ${copied ? 'bg-primary-600 text-white' : 'bg-primary-100 hover:bg-primary-200 text-primary-800'}`}>
            {copied ? 'コピー済み' : 'コピー'}
          </button>
        </div>
        <p className="text-xs text-primary-700">メニュー管理で「問診表必須」をONにすると、LINEボットが自動でこのURLを案内します。</p>
      </div>

      {/* 基本設定 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">基本設定</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">フォームタイトル</label>
            <input type="text" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="問診表" />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <button
              onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-primary-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-gray-600">{form.is_active ? '受付中' : '受付停止中'}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">説明文（任意）</label>
          <textarea value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2} placeholder="問診表の説明や注意事項を入力..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>
      </div>

      {/* 質問リスト */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              質問項目 <span className="text-gray-400 font-normal ml-1">{form.fields.length}件</span>
            </h3>
            {form.fields.length > 1 && (
              <p className="text-xs text-gray-400 mt-0.5">左端の⠿アイコンをドラッグして並び替えできます</p>
            )}
          </div>
          <button onClick={addField}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            質問を追加
          </button>
        </div>

        {form.fields.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl py-12 text-center">
            <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-gray-400">「質問を追加」から項目を作成してください</p>
          </div>
        ) : (
          form.fields.map((field, i) => (
            <FieldEditor
              key={i}
              field={field}
              index={i}
              onChange={updated => updateField(i, updated)}
              onDelete={() => deleteField(i)}
              onDragStart={() => handleDragStart(i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
              isDragOver={dragOverIndex === i && dragIndex !== i}
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && <span className="text-sm text-green-600 font-medium">✓ 保存しました</span>}
        <button onClick={save} disabled={saving}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}

// ── 回答一覧 ─────────────────────────────────────────────────────────────────

function SubmissionsList({ clinicId }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get(`${FORM_API}/submissions`)
      .then(r => setSubmissions(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [clinicId])

  if (loading) return <div className="text-center py-12 text-gray-400 text-sm">読み込み中...</div>

  if (submissions.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-400 text-sm">まだ回答がありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{submissions.length}件の回答</p>
      {submissions.map(sub => (
        <div key={sub.id}
          className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-primary-200 transition-colors"
          onClick={() => setSelected(selected?.id === sub.id ? null : sub)}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{sub.patient_name || '（氏名なし）'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub.submitted_at?.slice(0, 16).replace('T', ' ')}</p>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${selected?.id === sub.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {selected?.id === sub.id && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              {Object.entries(sub.data || {}).map(([key, val]) => (
                <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-gray-500 text-xs font-medium col-span-1">{key}</span>
                  <span className="text-gray-900 col-span-2">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                </div>
              ))}
              {Object.keys(sub.data || {}).length === 0 && (
                <p className="text-xs text-gray-400">回答内容がありません</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── メインページ ──────────────────────────────────────────────────────────────

export default function IntakeFormManagement() {
  const { user } = useAuth()
  const clinicId = user?.current_clinic_id || 1
  const [activeTab, setActiveTab] = useState('builder')

  return (
    <div className="space-y-6">
      <InfoBanner storageKey="intake-form">
        <p>ここでは、患者さんに事前に記入してもらう「問診表」をオリジナルで作成・管理できます。問診表とは、施術前に確認しておきたい健康状態やアレルギー、希望などを患者さんに入力してもらうWebフォームです。</p>
        <p className="font-semibold mt-1">どうやって使われるの？</p>
        <p>メニュー管理で「問診表必須」をオンにした施術をお客様がご希望された場合、AIが自動的に問診表のURLをLINEで送信します。お客様はそのURLをタップしてスマートフォンから回答でき、スタッフは「回答一覧」タブで受け取った内容をいつでも確認できます。</p>
        <p className="font-semibold mt-1">質問の種類</p>
        <ul className="space-y-1 list-none">
          <li>・<span className="font-medium">テキスト（1行）</span>：名前・電話番号など短い入力欄</li>
          <li>・<span className="font-medium">テキスト（複数行）</span>：「気になる症状を教えてください」など長めの回答欄</li>
          <li>・<span className="font-medium">ドロップダウン選択</span>：複数の選択肢からひとつだけ選ぶプルダウンメニュー</li>
          <li>・<span className="font-medium">ラジオボタン</span>：「はい／いいえ」のように、選択肢を画面に並べてひとつ選ぶ形式</li>
          <li>・<span className="font-medium">チェックボックス</span>：「該当するものをすべて選んでください」のように、複数選べる形式</li>
        </ul>
        <p>質問の順番はドラッグ＆ドロップで自由に並び替えられます。</p>
      </InfoBanner>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">問診表管理</h1>
        <p className="text-sm text-gray-500 mt-1">患者向け問診フォームの作成・回答管理ができます</p>
      </div>

      <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'builder'     && <FormBuilder clinicId={clinicId} />}
        {activeTab === 'submissions' && <SubmissionsList clinicId={clinicId} />}
      </div>
    </div>
  )
}
