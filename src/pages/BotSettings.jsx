import React, { useState, useEffect } from 'react'
import api from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import InfoBanner from '../components/ui/InfoBanner'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const CLINIC_API = `${BASE}/api/clinic`

const TABS = [
  { id: 'clinicPrompt', label: 'ベースプロンプト' },
  { id: 'knowledge',    label: 'ナレッジベース' },
  { id: 'line',         label: 'LINE連携' },
]

// ── ベースプロンプトタブ ───────────────────────────────────────────────────

function ClinicPromptTab() {
  const [data, setData] = useState({ prompt_text: '', current_prompt: '' })
  const [testMsg, setTestMsg] = useState('')
  const [testReply, setTestReply] = useState('')
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)

  useEffect(() => {
    api.get(`${CLINIC_API}/prompt`).then(r => setData(r.data)).catch(console.error)
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`${CLINIC_API}/prompt`, { prompt_text: data.prompt_text })
      const r = await api.get(`${CLINIC_API}/prompt`)
      setData(r.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  const reset = async () => {
    if (!confirm('プロンプトをリセットしますか？（デフォルトのシステムプロンプトに戻ります）')) return
    await api.put(`${CLINIC_API}/prompt`, { prompt_text: '' })
    const r = await api.get(`${CLINIC_API}/prompt`)
    setData(r.data)
  }

  const sendTest = async () => {
    if (!testMsg.trim()) return
    setTesting(true); setTestReply('')
    try {
      const res = await api.post(`${CLINIC_API}/prompt/test`, { message: testMsg })
      setTestReply(res.data.reply)
    } catch (e) {
      setTestReply('エラー: ' + (e.response?.data?.error || e.message))
    } finally { setTesting(false) }
  }

  return (
    <div className="space-y-5">
      <InfoBanner storageKey="bot-prompt">
        <p>ここでは、AIボットの「話し方・キャラクター・ルール」をカスタマイズできます。「プロンプト」とは、AIへの指示書のようなものです。</p>
        <p className="font-semibold mt-1">入力しない場合（推奨）</p>
        <p>空欄のままにすると、システムが用意したデフォルトのキャラクター設定が適用されます。丁寧で自然な接客口調が標準で設定されているため、特に変更の必要がなければ空欄で問題ありません。</p>
        <p className="font-semibold mt-1">入力する場合</p>
        <p>クリニック独自のトーン（例：「フレンドリーでカジュアルな話し方にしたい」「高級感のある丁寧な言葉遣いにしたい」など）がある場合に使用します。入力した内容がデフォルト設定の代わりに使用されます。料金・営業時間などのクリニック情報は、どちらの場合も自動で追記されます。</p>
      </InfoBanner>

      <div className="border border-gray-200 rounded-xl p-5 space-y-4 bg-white">
        <textarea
          rows={18}
          value={data.prompt_text}
          onChange={e => setData(d => ({ ...d, prompt_text: e.target.value }))}
          placeholder="あなたは〇〇クリニックの受付スタッフです..."
          className="w-full input-field font-mono resize-y text-sm"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={reset} className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors">
            デフォルトに戻す
          </button>
          <button onClick={() => setShowCurrent(!showCurrent)} className="text-xs text-primary-600 hover:underline">
            {showCurrent ? '現在のプロンプトを隠す' : '現在適用中のプロンプトを確認'}
          </button>
          <div className="flex-1" />
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {saving ? '保存中…' : saved ? '✓ 保存済み' : '保存'}
          </button>
        </div>
        {showCurrent && (
          <pre className="bg-gray-50 border border-gray-200 text-gray-700 text-xs p-3 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
            {data.current_prompt}
          </pre>
        )}
      </div>

      <div className="border border-gray-200 rounded-xl p-5 space-y-3 bg-white">
        <h3 className="text-base font-semibold text-gray-900">テストメッセージ</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={testMsg}
            onChange={e => setTestMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendTest()}
            placeholder="例: こんにちは"
            className="flex-1 input-field"
          />
          <button onClick={sendTest} disabled={testing || !testMsg.trim()} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {testing ? '送信中…' : '送信'}
          </button>
        </div>
        {testReply && (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">ボットの返答：</p>
            <p className="text-gray-800 text-sm whitespace-pre-wrap">{testReply}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── ナレッジベースタブ ─────────────────────────────────────────────────────

const KNOWLEDGE_CATEGORIES = ['一般', 'FAQ', '施術・治療', '料金・費用', 'アクセス・営業時間', 'キャンセル・変更', 'アフターケア', 'その他']
const EMPTY_KNOWLEDGE_FORM = { category: '一般', title: '', content: '', keywords: '' }

function KnowledgeTab({ clinicId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_KNOWLEDGE_FORM)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('すべて')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    api.get(`${BASE}/api/knowledge?clinic_id=${clinicId}`)
      .then(r => setEntries(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [clinicId])

  const openNew = () => { setEditing(null); setForm(EMPTY_KNOWLEDGE_FORM); setShowModal(true) }
  const openEdit = (entry) => {
    setEditing(entry)
    setForm({ category: entry.category || '一般', title: entry.title || '', content: entry.content || '', keywords: entry.keywords || '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      const payload = { ...form, clinic_id: clinicId }
      if (editing) {
        await api.put(`${BASE}/api/knowledge/${editing.id}`, payload)
      } else {
        await api.post(`${BASE}/api/knowledge`, payload)
      }
      setShowModal(false)
      load()
    } catch (e) {
      console.error(e)
    } finally { setSaving(false) }
  }

  const handleDelete = async (entry) => {
    if (!window.confirm(`「${entry.title}」を削除しますか？`)) return
    await api.delete(`${BASE}/api/knowledge/${entry.id}?clinic_id=${clinicId}`)
    load()
  }

  const allCats = ['すべて', ...KNOWLEDGE_CATEGORIES]
  const filtered = entries.filter(e => {
    const matchCat = filterCat === 'すべて' || e.category === filterCat
    const q = search.trim().toLowerCase()
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-5">
      <InfoBanner storageKey="bot-knowledge">
        <p>ここでは、AIに覚えさせたい追加情報を登録・管理します。料金表・営業時間はシステムが自動で読み込むため登録不要です。それ以外の情報（よくある質問、施術説明、アクセス情報、注意事項など）をここで管理します。</p>
        <p>登録した知識はカテゴリやキーワードで整理でき、AIがお客様の質問に対して適切な情報を選んで回答します。詳しくはメインメニューの「ナレッジベース」ページから管理できます。</p>
      </InfoBanner>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="キーワードで検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          知識を追加
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {allCats.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filterCat === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <InfoBanner storageKey="bot-knowledge-list">
        <p>ここに登録した情報は、お客様からの質問に対してAIが自動で参照して回答します。タイトル・本文・キーワードのいずれかに含まれる言葉が質問とマッチしたとき、その知識が使われます。</p>
      </InfoBanner>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 text-sm">
            {entries.length === 0 ? 'ナレッジがありません。「知識を追加」から登録してください。' : '条件に一致するナレッジがありません。'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => (
            <div key={entry.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full font-medium">{entry.category}</span>
                    {entry.is_active === 0 && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">無効</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{entry.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 whitespace-pre-wrap">{entry.content}</p>
                  {entry.keywords && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.keywords.split(/[,、\s]+/).filter(Boolean).map((kw, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">#{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(entry)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(entry)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'ナレッジを編集' : '新しいナレッジを追加'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">カテゴリ</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {KNOWLEDGE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">タイトル <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="例：キャンセルポリシーについて"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">内容 <span className="text-red-500">*</span></label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={6} placeholder="AIが参照する詳細な説明を入力してください..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  キーワード <span className="text-gray-400 font-normal">（カンマ区切り）</span>
                </label>
                <input type="text" value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
                  placeholder="例：キャンセル, 取り消し, 予約変更"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                キャンセル
              </button>
              <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.content.trim()}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── LINE連携タブ ──────────────────────────────────────────────────────────

const WEBHOOK_URL = 'https://avi-bot-clinic.fly.dev/callback'

function LineTab() {
  const [form, setForm] = useState({ channel_name: '', channel_access_token: '', channel_secret: '' })
  const [masked, setMasked] = useState({ channel_access_token_masked: '', channel_secret_masked: '' })
  const [showToken, setShowToken] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get(`${CLINIC_API}/line-settings`).then(r => {
      const d = r.data
      setMasked({ channel_access_token_masked: d.channel_access_token_masked || '', channel_secret_masked: d.channel_secret_masked || '' })
      setForm({ channel_name: d.channel_name || '', channel_access_token: '', channel_secret: '' })
    }).catch(console.error)
  }, [])

  const save = async () => {
    const payload = { channel_name: form.channel_name }
    if (form.channel_access_token) payload.channel_access_token = form.channel_access_token
    if (form.channel_secret) payload.channel_secret = form.channel_secret
    setSaving(true)
    try {
      await api.put(`${CLINIC_API}/line-settings`, payload)
      const r = await api.get(`${CLINIC_API}/line-settings`)
      setMasked({ channel_access_token_masked: r.data.channel_access_token_masked || '', channel_secret_masked: r.data.channel_secret_masked || '' })
      setForm(f => ({ ...f, channel_access_token: '', channel_secret: '' }))
      setShowToken(false)
      setShowSecret(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  const test = async () => {
    setTesting(true); setTestResult(null)
    try {
      const res = await api.post(`${CLINIC_API}/line-settings/test`, { message: 'LINEボット連携テスト ✅' })
      setTestResult({ success: true, message: res.data.message, destination: res.data.line_destination })
    } catch (e) {
      setTestResult({ success: false, message: e.response?.data?.error || e.message })
    } finally { setTesting(false) }
  }

  const copyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <InfoBanner storageKey="bot-line">
        <p>ここでは、LINEの公式アカウントとこのAIボットを接続するための設定を行います。一度設定すれば、お客様からLINEにメッセージが届いた瞬間からAIが自動で返信します。</p>
        <p className="font-semibold mt-1">設定の流れ（初回のみ）</p>
        <ul className="space-y-1 list-none">
          <li>1. <span className="font-medium">LINE Developers</span>（LINE公式の開発者ページ）でLINE公式アカウントの設定を開きます</li>
          <li>2. 「Webhook URL」という欄に、ここに表示されているURLをコピー＆ペーストします</li>
          <li>3. 「チャネルアクセストークン」と「チャネルシークレット」をLINE Developersからコピーして、それぞれここに貼り付けます</li>
        </ul>
        <p>設定がわからない場合はサポートにお問い合わせください。</p>
      </InfoBanner>

      <div className="border border-green-200 bg-green-50 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-green-800">Webhook URL（LINE Developers に設定）</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-white border border-green-200 rounded px-3 py-1.5 text-xs text-gray-700 break-all">{WEBHOOK_URL}</code>
          <button onClick={copyWebhook} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex-shrink-0 ${copied ? 'bg-green-600 text-white' : 'bg-green-100 hover:bg-green-200 text-green-800'}`}>
            {copied ? 'コピー済み' : 'コピー'}
          </button>
        </div>
        <p className="text-xs text-green-700">LINE Developers → Messaging API → Webhook settings にこのURLを設定してください。</p>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 space-y-4 bg-white">
        <h3 className="text-base font-semibold text-gray-900">チャネル設定</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">チャネル名（メモ用）</label>
          <input type="text" value={form.channel_name} onChange={e => setForm(f => ({ ...f, channel_name: e.target.value }))}
            placeholder="例: メディアージュクリニック" className="w-full input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">チャネルアクセストークン</label>
          {masked.channel_access_token_masked && !showToken && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 font-mono">{masked.channel_access_token_masked}</span>
              <button onClick={() => setShowToken(true)} className="text-xs text-primary-600 hover:underline">変更する</button>
            </div>
          )}
          {(!masked.channel_access_token_masked || showToken) && (
            <input type="password" value={form.channel_access_token} onChange={e => setForm(f => ({ ...f, channel_access_token: e.target.value }))}
              placeholder="長期アクセストークンを入力" className="w-full input-field font-mono" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">チャネルシークレット</label>
          {masked.channel_secret_masked && !showSecret && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 font-mono">{masked.channel_secret_masked}</span>
              <button onClick={() => setShowSecret(true)} className="text-xs text-primary-600 hover:underline">変更する</button>
            </div>
          )}
          {(!masked.channel_secret_masked || showSecret) && (
            <input type="password" value={form.channel_secret} onChange={e => setForm(f => ({ ...f, channel_secret: e.target.value }))}
              placeholder="チャネルシークレットを入力" className="w-full input-field font-mono" />
          )}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button onClick={test} disabled={testing} className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors disabled:opacity-50">
            {testing ? '送信中…' : '連携テスト'}
          </button>
          <div className="flex-1" />
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {saving ? '保存中…' : saved ? '✓ 保存済み' : '保存'}
          </button>
        </div>

        {testResult && (
          <div className={`rounded-lg p-3 text-sm space-y-1 ${testResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            <p>{testResult.success ? '✓ ' : '✗ '}{testResult.message}</p>
            {testResult.destination && (
              <p className="text-xs font-mono text-green-700">Bot User ID を自動取得・保存しました：{testResult.destination}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── メインページ ──────────────────────────────────────────────────────────

export default function BotSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('clinicPrompt')
  const clinicId = user?.current_clinic_id || 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ボット設定</h1>
        <p className="text-sm text-gray-500 mt-1">LINEボットのプロンプト・ナレッジ・LINE連携を管理します</p>
      </div>

      <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'clinicPrompt' && <ClinicPromptTab />}
        {activeTab === 'knowledge'    && <KnowledgeTab clinicId={clinicId} />}
        {activeTab === 'line'         && <LineTab />}
      </div>
    </div>
  )
}
