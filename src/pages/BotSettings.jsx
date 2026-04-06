import React, { useState, useEffect } from 'react'
import api from '../lib/apiClient'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const API = `${BASE}/api/settings`
const CLINIC_API = `${BASE}/api/clinic`

const TABS = [
  { id: 'rules',   label: '対応ルール' },
  { id: 'clinicPrompt', label: 'クリニックプロンプト' },
  { id: 'prompt',  label: 'プロンプト上書き' },
  { id: 'line',    label: 'LINE連携' },
]

// ── 対応ルールタブ ─────────────────────────────────────────────────────────

const RULE_HINTS = [
  '返信の長さ・改行スタイル（例：返信は簡潔に。情報ごとに改行を入れる）',
  '料金回答の方法（例：料金を聞かれたら料金表の金額をそのまま答える）',
  'ダウンタイム回答の方法（例：具体的な日数を答える。「わからない」とは言わない）',
  '予約の催促タイミング（例：お客様が自ら予約に触れたときだけ案内する）',
  '予約ヒアリングの順序（例：施術 → 日時 → 氏名 → 電話番号の順に聞く）',
  '予約確定メッセージの書式（例：日時・施術・マップリンク・リマインド一言を含める）',
  '会話履歴の活用（例：前回の内容を踏まえて継続的な会話を心がける）',
]

function RulesTab() {
  const [rules, setRules] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showHints, setShowHints] = useState(false)

  useEffect(() => {
    api.get(`${API}/rules`).then(r => setRules(r.data)).catch(console.error)
  }, [])

  const updateRule = (idx, key, val) =>
    setRules(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r))

  const addRule = () => {
    const nextNum = rules.length ? Math.max(...rules.map(r => r.rule_number)) + 1 : 1
    setRules(prev => [...prev, { rule_number: nextNum, enabled: 1, content: '' }])
  }

  const removeRule = idx => setRules(prev => prev.filter((_, i) => i !== idx))

  const save = async () => {
    setSaving(true)
    try {
      const res = await api.put(`${API}/rules`, rules)
      setRules(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const enabledCount = rules.filter(r => r.enabled).length

  return (
    <div className="space-y-5">

      {/* 説明セクション */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-800">対応ルールとは</p>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              LINEボット（佐藤さん）がお客様に返答する際の<strong>振る舞いのルール</strong>です。
              有効にしたルールだけがシステムプロンプトに反映されます。
              料金回答・予約ヒアリングの手順・絵文字の使い方など、ボットの対応品質を細かく調整できます。
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowHints(!showHints)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 ml-7"
        >
          {showHints ? '▲ ルール例を隠す' : '▼ どんなルールを書けばいい？（例を見る）'}
        </button>
        {showHints && (
          <ul className="ml-7 space-y-1">
            {RULE_HINTS.map((hint, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-blue-700">
                <span className="font-bold text-blue-400 flex-shrink-0">例{i + 1}.</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-gray-900">ルール一覧</h2>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {enabledCount} / {rules.length} 件有効
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addRule}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            ルール追加
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? '保存中…' : saved ? '✓ 保存済み' : '保存'}
          </button>
        </div>
      </div>

      {/* ルール一覧 */}
      <div className="space-y-2">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className={`flex gap-3 p-4 rounded-xl border transition-colors ${
              rule.enabled
                ? 'bg-white border-gray-200'
                : 'bg-gray-50 border-gray-100 opacity-60'
            }`}
          >
            {/* 左列：番号 + トグル */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0 pt-0.5">
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                {rule.rule_number}
              </span>
              <button
                onClick={() => updateRule(idx, 'enabled', rule.enabled ? 0 : 1)}
                title={rule.enabled ? '無効化' : '有効化'}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
                  rule.enabled ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-xs text-gray-400">{rule.enabled ? '有効' : '無効'}</span>
            </div>

            {/* 右列：テキストエリア */}
            <div className="flex-1">
              <textarea
                rows={2}
                value={rule.content}
                onChange={e => updateRule(idx, 'content', e.target.value)}
                placeholder={`ルール ${rule.rule_number} の内容を入力（例：${RULE_HINTS[(idx) % RULE_HINTS.length]}）`}
                className="w-full input-field resize-y text-sm"
              />
            </div>

            {/* 削除ボタン */}
            <button
              onClick={() => removeRule(idx)}
              className="text-gray-300 hover:text-red-400 flex-shrink-0 pt-1 transition-colors"
              title="削除"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-gray-400">ルールがありません</p>
            <p className="text-xs text-gray-400 mt-1">「ルール追加」ボタンから作成してください</p>
          </div>
        )}
      </div>

      {rules.length > 0 && (
        <p className="text-xs text-gray-400">
          ※ ルール番号は識別用です。優先度の意味はありません。保存ボタンを押すまで変更は反映されません。
        </p>
      )}
    </div>
  )
}

// ── クリニックプロンプトタブ ───────────────────────────────────────────────

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
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">クリニック固有のベースプロンプト</p>
        <p className="text-xs text-blue-700 leading-relaxed">
          このクリニック専用のAI指示文を設定します。空の場合はシステムデフォルトが使われます。<br />
          対応ルールはここに設定したプロンプトの上に重ねて適用されます。
        </p>
      </div>

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
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  const test = async () => {
    setTesting(true); setTestResult(null)
    try {
      const res = await api.post(`${CLINIC_API}/line-settings/test`, { message: 'LINEボット連携テスト ✅' })
      setTestResult({ success: true, message: res.data.message })
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
      {/* Webhook URL */}
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

      {/* Settings form */}
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
          <div className={`rounded-lg p-3 text-sm ${testResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {testResult.success ? '✓ ' : '✗ '}{testResult.message}
          </div>
        )}
      </div>
    </div>
  )
}

// ── プロンプトタブ ─────────────────────────────────────────────────────────

const PROMPT_EXAMPLE = `あなたは「佐藤」という名前の美容クリニックのLINE受付スタッフです。
丁寧で親しみやすい口調で、お客様の質問にお答えください。

【クリニック情報】
クリニック名: メディアージュクリニック大阪梅田院
診療科目: 美容皮膚科・エイジングマネジメント
営業時間: 10:00〜19:00（不定休）
初診料: 2,200円 / 再診料: 無料

【対応ルール】
1. 返信は簡潔に。情報のまとまりごとに改行を入れて読みやすくする。
2. 料金を聞かれたら料金表の金額をそのまま答える。「カウンセリングで」とは言わない。
3. 予約の催促は、お客様が自ら予約に触れたときだけ行う。
4. 予約受付は「施術内容 → 希望日時 → お名前 → 電話番号」の順に1項目ずつ聞く。

【予約確定メッセージの形式】
ご予約を承りました 😊

📅「日時」〇月〇日（曜日）〇時
🩺「施術」〇〇

📍 アクセスはこちら: https://maps.google.com/...

🔔 前日・当日にリマインドいたしますので、よろしくお願いします。`

function PromptTab() {
  const [data, setData] = useState({ prompt: '', use_override: false, current_prompt: '' })
  const [testMsg, setTestMsg] = useState('')
  const [testReply, setTestReply] = useState('')
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showExample, setShowExample] = useState(false)

  useEffect(() => {
    api.get(`${API}/prompt`).then(r => setData(r.data)).catch(console.error)
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`${API}/prompt`, { prompt: data.prompt, use_override: data.use_override })
      const res = await api.get(`${API}/prompt`)
      setData(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const sendTest = async () => {
    if (!testMsg.trim()) return
    setTesting(true)
    setTestReply('')
    try {
      const res = await api.post(`${API}/test-message`, { message: testMsg })
      setTestReply(res.data.reply)
    } catch (e) {
      setTestReply('エラー: ' + (e.response?.data?.error || e.message))
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* 説明ボックス */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">プロンプトオーバーライドとは</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              通常は<strong>対応ルールタブで設定したルール</strong>が自動的にシステムプロンプトに組み込まれます。<br />
              オーバーライドを有効にすると、対応ルールの代わりに<strong>ここに入力したプロンプト全文</strong>がボットに使用されます。<br />
              プロンプトを一から書き直したい場合に使ってください。
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowExample(!showExample)}
          className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 ml-7"
        >
          {showExample ? '▲ 記述例を隠す' : '▼ プロンプトの記述例を見る'}
        </button>
        {showExample && (
          <div className="ml-7 space-y-2">
            <pre className="bg-white border border-amber-200 text-gray-700 text-xs p-3 rounded-lg overflow-auto max-h-52 whitespace-pre-wrap leading-relaxed">
              {PROMPT_EXAMPLE}
            </pre>
            <button
              onClick={() => setData(d => ({ ...d, prompt: PROMPT_EXAMPLE }))}
              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              このサンプルを入力欄に読み込む
            </button>
          </div>
        )}
      </div>

      {/* Override toggle */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">プロンプトオーバーライド</h2>
            <p className="text-xs text-gray-500 mt-0.5">有効にすると、以下のテキストがシステムプロンプト全体として使用されます</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-600">{data.use_override ? 'オーバーライド有効' : '標準プロンプト使用中'}</span>
            <div
              onClick={() => setData(d => ({ ...d, use_override: !d.use_override }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${data.use_override ? 'bg-primary-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${data.use_override ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>
        </div>

        <textarea
          rows={16}
          value={data.prompt}
          onChange={e => setData(d => ({ ...d, prompt: e.target.value }))}
          disabled={!data.use_override}
          placeholder="オーバーライドを有効にして、ここにカスタムプロンプトを入力してください"
          className="w-full input-field font-mono resize-y disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowCurrent(!showCurrent)}
            className="text-xs text-primary-600 hover:text-primary-700 underline"
          >
            {showCurrent ? '現在のプロンプトを隠す' : '現在適用中のプロンプトを確認する'}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? '保存中…' : saved ? '✓ 保存済み' : '保存'}
          </button>
        </div>

        {showCurrent && (
          <div>
            <p className="text-xs text-gray-500 mb-1">現在適用中のプロンプト（読み取り専用）</p>
            <pre className="bg-gray-50 border border-gray-200 text-gray-700 text-xs p-3 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
              {data.current_prompt}
            </pre>
          </div>
        )}
      </div>

      {/* Test message */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-3 bg-white">
        <h3 className="text-base font-semibold text-gray-900">テストメッセージ</h3>
        <p className="text-xs text-gray-500">現在のプロンプト設定でボットをテストします。テスト履歴は __test_user__ として保存されます。</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={testMsg}
            onChange={e => setTestMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendTest()}
            placeholder="例: ハイフのダウンタイムは？"
            className="flex-1 input-field"
          />
          <button
            onClick={sendTest}
            disabled={testing || !testMsg.trim()}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
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

// ── メインページ ──────────────────────────────────────────────────────────

export default function BotSettings() {
  const [activeTab, setActiveTab] = useState('rules')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ボット設定</h1>
        <p className="text-sm text-gray-500 mt-1">LINEボットの対応ルール・プロンプトを管理します</p>
      </div>

      <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'rules'        && <RulesTab />}
        {activeTab === 'clinicPrompt' && <ClinicPromptTab />}
        {activeTab === 'prompt'       && <PromptTab />}
        {activeTab === 'line'         && <LineTab />}
      </div>
    </div>
  )
}
