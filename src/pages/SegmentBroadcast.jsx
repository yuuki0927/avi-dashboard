import React, { useState, useEffect, useCallback } from 'react'
import api from '../lib/apiClient'
import InfoBanner from '../components/ui/InfoBanner'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// ── SVGアイコン ───────────────────────────────────────────────────────────────
function SvgIcon({ d, d2, className = 'w-5 h-5' }) {
  return (
    <svg className={`${className} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
      {d2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d2} />}
    </svg>
  )
}

// ── アイコンパス定数 ───────────────────────────────────────────────────────────
const IC = {
  check:        'M5 13l4 4L19 7',
  checkCircle:  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning:      'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  clock:        'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  send:         'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  sparkle:      'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  campaign:     'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  history:      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  revisit:      'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  treatment:    'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  phone:        'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  settings:     'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  settingsD2:   'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
}

// ── 定数 ─────────────────────────────────────────────────────────────────────
const SEGMENTS = [
  { value: 'all',       label: '全顧客',     style: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'vip',       label: 'VIP',        style: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'new',       label: '新規',       style: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'regular',   label: 'リピーター', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'follow_up', label: '要フォロー', style: 'bg-red-50 text-red-700 border-red-200' },
]

const TRIGGER_TYPES = [
  { value: 'revisit_reminder',   label: '最終来院からX日後',          iconD: IC.revisit },
  { value: 'treatment_reminder', label: '特定施術からX日後',          iconD: IC.treatment },
  { value: 'no_visit_followup',  label: 'LINE登録後・未来院フォロー', iconD: IC.phone },
]

const APPROVAL_MODES = [
  { value: 'sample', label: 'サンプル確認（5件確認して全件承認）',
    desc: 'AIが生成した文章の中からランダム5件を確認できます。問題なければ全件送信。初期運用に推奨。' },
  { value: 'auto',   label: '自動送信（承認不要）',
    desc: 'スケジューラーが毎晩自動で送信します。ルールへの信頼が確立したら切り替えを。' },
  { value: 'manual', label: '全件手動確認',
    desc: 'VIP顧客など特別なケース向け。件数が少ない場合のみ推奨。' },
]

const MESSAGE_MODES = [
  { value: 'ai',       label: 'AIが個別生成', desc: '顧客の名前・来院回数・施術履歴を使って1人ずつ個別メッセージを作成' },
  { value: 'template', label: 'テンプレート', desc: '{name}・{treatment}・{months}などの変数を自動置換' },
  { value: 'fixed',    label: '固定文',       desc: '全員に同じメッセージを送信' },
]

const DAYS_OPTIONS = [
  { value: null, label: '指定なし' },
  { value: 30,   label: '30日（約1ヶ月）以上' },
  { value: 60,   label: '60日（約2ヶ月）以上' },
  { value: 90,   label: '90日（約3ヶ月）以上' },
  { value: 180,  label: '180日（約6ヶ月）以上' },
  { value: 365,  label: '365日（約1年）以上' },
]

// ── 共通UIパーツ ──────────────────────────────────────────────────────────────
function StepBadge({ n, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
        done ? 'bg-emerald-500 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
      }`}>
        {done ? <SvgIcon d={IC.check} className="w-3.5 h-3.5" /> : n}
      </div>
      <span className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
    </div>
  )
}

function Card({ children, className = '' }) {
  return <div className={`bg-white border border-gray-100 rounded-2xl p-5 ${className}`}>{children}</div>
}

function StatusBadge({ status }) {
  const map = {
    pending:            ['bg-gray-100 text-gray-600',     '待機中'],
    generating:         ['bg-blue-50 text-blue-600',      'AI生成中'],
    awaiting_approval:  ['bg-yellow-50 text-yellow-700',  '承認待ち'],
    approved:           ['bg-blue-50 text-blue-700',      '承認済み'],
    sending:            ['bg-purple-50 text-purple-700',  '送信中'],
    done:               ['bg-emerald-50 text-emerald-700', '完了'],
    partial:            ['bg-yellow-50 text-yellow-700',  '一部失敗'],
    failed:             ['bg-red-50 text-red-700',        'エラー'],
  }
  const [cls, lbl] = map[status] || ['bg-gray-100 text-gray-500', status]
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{lbl}</span>
}

// ── 進捗バー ──────────────────────────────────────────────────────────────────
function JobProgressBar({ jobId, onDone }) {
  const [job, setJob] = useState(null)
  useEffect(() => {
    if (!jobId) return
    const poll = setInterval(async () => {
      try {
        const res = await api.get(`${BASE}/api/broadcast/jobs/${jobId}`)
        setJob(res.data)
        if (['done', 'failed', 'partial'].includes(res.data.status)) {
          clearInterval(poll)
          onDone && onDone(res.data)
        }
      } catch { clearInterval(poll) }
    }, 2000)
    return () => clearInterval(poll)
  }, [jobId])

  if (!job) return null
  const pct = job.total_count > 0 ? Math.round(job.sent_count / job.total_count * 100) : 0
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">送信中...</p>
        <StatusBadge status={job.status} />
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className="bg-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-500 text-right">{job.sent_count} / {job.total_count}件 （{pct}%）</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// タブ1: 自動配信ルール
// ═══════════════════════════════════════════════════════════════════════════════
function AutoRulesTab() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [previewCounts, setPreviewCounts] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`${BASE}/api/broadcast/rules`)
      setRules(res.data || [])
    } catch { setRules([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function loadPreview(rule) {
    try {
      const res = await api.get(`${BASE}/api/broadcast/rules/${rule.id}/preview`)
      setPreviewCounts(p => ({ ...p, [rule.id]: res.data.count }))
    } catch {}
  }

  async function toggleActive(rule) {
    await api.put(`${BASE}/api/broadcast/rules/${rule.id}`, { is_active: rule.is_active ? 0 : 1 })
    load()
  }

  async function deleteRule(rule) {
    if (!window.confirm(`「${rule.name}」を削除しますか？`)) return
    await api.delete(`${BASE}/api/broadcast/rules/${rule.id}`)
    load()
  }

  const getTriggerIcon = (triggerType) => {
    const t = TRIGGER_TYPES.find(t => t.value === triggerType)
    return <SvgIcon d={t?.iconD || IC.settings} d2={t ? undefined : IC.settingsD2} className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="space-y-4">
      <InfoBanner storageKey="broadcast-rules">
        <p className="font-semibold">自動配信ルールとは？</p>
        <p>「ヒアルロン酸を受けてから6ヶ月経ったお客様に、自動でリマインドを送る」など、<span className="font-medium">条件を一度設定するだけで、毎日深夜0時にシステムが自動で対象者を抽出して送信</span>してくれる機能です。手動で送る手間が一切なくなります。</p>

        <p className="font-semibold mt-2">① いつ送る？（トリガーの種類）</p>
        <ul className="space-y-1.5 list-none">
          <li>・<span className="font-medium">最終来院からX日後</span>：最後にクリニックに来た日から指定した日数が経過したお客様に送ります。例：90日（3ヶ月）設定なら、3ヶ月以上来院していない方が毎日自動でピックアップされます。「しばらく来ていないな」という方への再来院促しに最適。</li>
          <li>・<span className="font-medium">特定施術からX日後</span>：特定の施術名（例：ヒアルロン酸注入）を受けてから指定日数が経過したお客様に送ります。施術名はメニューと同じ名前で入力してください。他の施術を最近受けていても、指定した施術の経過日数で判定します。例：「ヒアルロン酸 → 180日」なら、6ヶ月前にヒアルロン酸を打ったお客様全員が対象になります。</li>
          <li>・<span className="font-medium">LINE登録後・未来院フォロー</span>：LINEを登録したのに一度も来院していないお客様に送ります。例：登録から30日経っても来院がない方へ「初回カウンセリングのご案内」を自動送信。機会損失を減らせます。</li>
        </ul>

        <p className="font-semibold mt-2">② 施術名について（治療リマインダーの場合）</p>
        <p>「特定施術からX日後」を選んだ場合、<span className="font-medium">施術名を必ず入力してください</span>。この名前は予約データの施術名と完全一致で検索します。スペルミスや表記ゆれ（「ヒアルロン酸」と「ヒアルロン酸注入」は別扱い）に注意してください。同じ施術でも患者によって推奨インターバルが違う場合は、<span className="font-medium">ルールを複数作って日数を変える</span>のがおすすめです（例：初回の方は180日、3回以上の方は365日）。</p>

        <p className="font-semibold mt-2">③ セグメント（対象を絞る）</p>
        <ul className="space-y-1 list-none">
          <li>・<span className="font-medium">全顧客</span>：条件を満たす全員が対象。最も広い範囲。</li>
          <li>・<span className="font-medium">VIP</span>：来院回数や購入金額が高いVIP顧客のみ。特別感のあるメッセージを送りたいときに。</li>
          <li>・<span className="font-medium">新規</span>：初来院〜2回目程度の新しいお客様。</li>
          <li>・<span className="font-medium">リピーター</span>：3回以上来院している常連さん。</li>
          <li>・<span className="font-medium">要フォロー</span>：スタッフがフォロー必要とタグ付けした方。</li>
        </ul>

        <p className="font-semibold mt-2">④ メッセージの作り方</p>
        <ul className="space-y-1 list-none">
          <li>・<span className="font-medium">AIが個別生成</span>：お客様ごとに名前・来院回数・施術履歴を使って1人ひとり違う文章を作ります。最も自然で効果的。初期設定でこちらを推奨。</li>
          <li>・<span className="font-medium">テンプレート</span>：{'{name}'}さん、{'{treatment}'}から{'{months}'}ヶ月が経ちました...のように変数を使って自動置換。AIより安定した文章が送れます。</li>
          <li>・<span className="font-medium">固定文</span>：全員に全く同じ文を送ります。キャンペーンの締め切り告知などに。</li>
        </ul>

        <p className="font-semibold mt-2">⑤ 承認モード（送信前の確認方法）</p>
        <ul className="space-y-1.5 list-none">
          <li>・<span className="font-medium">サンプル確認（推奨）</span>：AIが全員分のメッセージを生成した後、ランダムで5件だけ「承認キュー」タブに届きます。5件を読んで内容に問題なければ「全件承認」ボタンを押すだけで全員に一斉送信。<span className="font-medium">運用初期は必ずこちらで始めてください。</span></li>
          <li>・<span className="font-medium">自動送信</span>：承認不要。深夜0時に条件にマッチしたら翌朝には既に送信完了しています。AIへの信頼が確立したルールだけに使ってください。</li>
          <li>・<span className="font-medium">全件手動確認</span>：1件ずつ中身を確認してから送ります。VIPや特別なケースで使いますが、件数が多いと作業が大変なので注意。</li>
        </ul>

        <p className="font-semibold mt-2">⑥ 再送防止（クールダウン）</p>
        <p>同じお客様に短期間で何度も同じルールのメッセージが届かないよう、N日間は再送しない設定です。例：30日設定なら、一度送ったお客様は30日後まで同じルールでは対象になりません。条件に合い続けても再送されないので安心です。</p>

        <p className="font-semibold mt-2">ルール作成のコツ</p>
        <ul className="space-y-1 list-none">
          <li>・まず「サンプル確認モード」でルールを作り、数回確認して品質を確かめてから「自動送信モード」に切り替えるのがベスト</li>
          <li>・施術リマインダーは施術ごとに別々のルールを作ると精度が上がります</li>
          <li>・再送防止は施術のインターバルと同じ日数にするのが自然です（ヒアルロン酸6ヶ月リマインダーなら cooldown も180日に）</li>
          <li>・対象確認ボタンで「今この瞬間の対象人数」を確認できます。ルール作成後に必ず確認してください</li>
        </ul>
      </InfoBanner>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">自動配信ルール</h2>
          <p className="text-xs text-gray-500 mt-0.5">毎日深夜0時に条件を満たすお客様に自動送信します</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }}
          className="btn-primary px-4 py-2 rounded-lg text-sm">
          + ルールを追加
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-400 text-sm">読み込み中...</div>
      ) : rules.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <div className="flex justify-center mb-2 text-gray-300">
            <SvgIcon d={IC.clock} className="w-8 h-8" />
          </div>
          <p className="text-sm text-gray-500">自動配信ルールがありません</p>
          <p className="text-xs text-gray-400 mt-1">「ルールを追加」からデフォルトテンプレートを元に作成できます</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className={`bg-white border rounded-2xl p-5 transition-all ${
              rule.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'
            }`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-400">{getTriggerIcon(rule.trigger_type)}</span>
                    <p className="font-semibold text-gray-900 text-sm">{rule.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      rule.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {rule.is_active ? '有効' : '無効'}
                    </span>
                    {rule.is_default === 1 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">デフォルト</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{TRIGGER_TYPES.find(t=>t.value===rule.trigger_type)?.label || rule.trigger_type}</p>
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5 mt-1 space-y-0.5">
                    {rule.trigger_type === 'revisit_reminder' && (
                      <p>最終来院から <span className="font-medium text-gray-700">{rule.condition?.days_since_last_visit ?? 90}日</span> 以上経過したお客様</p>
                    )}
                    {rule.trigger_type === 'treatment_reminder' && (
                      <>
                        <p>施術名：<span className="font-medium text-gray-700">{rule.condition?.treatment_name || '（未設定）'}</span></p>
                        <p>その施術から <span className="font-medium text-gray-700">{rule.condition?.days_since_treatment ?? 180}日</span> 以上経過したお客様</p>
                      </>
                    )}
                    {rule.trigger_type === 'no_visit_followup' && (
                      <p>LINE登録から <span className="font-medium text-gray-700">{rule.condition?.days_since_registered ?? 30}日</span> 以上経過・来院0回のお客様</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                    <span>メッセージ：{MESSAGE_MODES.find(m=>m.value===rule.message_mode)?.label || rule.message_mode}</span>
                    <span>承認：{APPROVAL_MODES.find(m=>m.value===rule.approval_mode)?.label.split('（')[0]}</span>
                    <span>再送防止：{rule.cooldown_days}日</span>
                    {previewCounts[rule.id] !== undefined && (
                      <span className="text-primary-600 font-medium">現在の対象：{previewCounts[rule.id]}人</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => loadPreview(rule)}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded-lg">
                    対象確認
                  </button>
                  <button onClick={() => { setEditing(rule); setShowModal(true) }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded-lg">
                    編集
                  </button>
                  <button onClick={() => toggleActive(rule)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                      rule.is_active ? 'bg-primary-600' : 'bg-gray-200'
                    }`}>
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      rule.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <RuleModal
          initial={editing}
          onClose={() => setShowModal(false)}
          onSaved={load}
        />
      )}
    </div>
  )
}

function RuleModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial
  const [form, setForm] = useState({
    name: initial?.name || '',
    trigger_type: initial?.trigger_type || 'revisit_reminder',
    condition: initial?.condition || {},
    target_segment: initial?.target_segment || 'all',
    target_tags: initial?.target_tags || [],
    message_mode: initial?.message_mode || 'ai',
    message_template: initial?.message_template || '',
    approval_mode: initial?.approval_mode || 'sample',
    cooldown_days: initial?.cooldown_days ?? 30,
    is_active: initial?.is_active ?? 1,
  })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const setCondition = (k, v) => setForm(p => ({ ...p, condition: { ...p.condition, [k]: v } }))

  async function save() {
    if (!form.name.trim()) { alert('ルール名を入力してください'); return }
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`${BASE}/api/broadcast/rules/${initial.id}`, form)
      } else {
        await api.post(`${BASE}/api/broadcast/rules`, form)
      }
      onSaved()
      onClose()
    } catch (e) {
      alert(e.response?.data?.error || '保存に失敗しました')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{isEdit ? 'ルールを編集' : '自動配信ルールを追加'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-5">

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">ルール名</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="例：ヒアルロン酸6ヶ月リマインダー"
              className="input-field w-full text-sm" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">① いつ送りますか？</label>
            <div className="space-y-2">
              {TRIGGER_TYPES.map(t => (
                <button key={t.value} onClick={() => set('trigger_type', t.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                    form.trigger_type === t.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <span className="flex items-center gap-2">
                    <SvgIcon d={t.iconD} className="w-4 h-4 flex-shrink-0" />
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">② 条件</label>
            {form.trigger_type === 'revisit_reminder' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">最終来院から</span>
                <input type="number" min="1" value={form.condition.days_since_last_visit || 90}
                  onChange={e => setCondition('days_since_last_visit', Number(e.target.value))}
                  className="input-field w-20 text-sm text-center" />
                <span className="text-sm text-gray-600">日以上経過したお客様</span>
              </div>
            )}
            {form.trigger_type === 'treatment_reminder' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-20 flex-shrink-0">施術名</span>
                  <input value={form.condition.treatment_name || ''}
                    onChange={e => setCondition('treatment_name', e.target.value)}
                    placeholder="例：ヒアルロン酸注入"
                    className="input-field flex-1 text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-20 flex-shrink-0">経過日数</span>
                  <input type="number" min="1" value={form.condition.days_since_treatment || 180}
                    onChange={e => setCondition('days_since_treatment', Number(e.target.value))}
                    className="input-field w-24 text-sm text-center" />
                  <span className="text-sm text-gray-600">日以上経過したお客様</span>
                </div>
                <p className="text-xs text-gray-400">※ 来院回数が多い方は日数を長めに設定してください（例：4回以上の方は365日）</p>
              </div>
            )}
            {form.trigger_type === 'no_visit_followup' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">LINE登録から</span>
                <input type="number" min="1" value={form.condition.days_since_registered || 30}
                  onChange={e => setCondition('days_since_registered', Number(e.target.value))}
                  className="input-field w-20 text-sm text-center" />
                <span className="text-sm text-gray-600">日以上経過・来院0回のお客様</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">③ 対象セグメント</label>
            <div className="flex flex-wrap gap-2">
              {SEGMENTS.map(s => (
                <button key={s.value} onClick={() => set('target_segment', s.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 ${s.style} ${
                    form.target_segment === s.value ? 'ring-2 ring-offset-1 ring-primary-400' : ''
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">④ メッセージの作り方</label>
            <div className="space-y-2">
              {MESSAGE_MODES.map(m => (
                <button key={m.value} onClick={() => set('message_mode', m.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    form.message_mode === m.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <p className="text-sm font-medium text-gray-900">{m.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
            {form.message_mode !== 'ai' && (
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">
                  {form.message_mode === 'template'
                    ? '使える変数: {name} {treatment} {months} {visit_count}'
                    : 'メッセージ（全員に同じ文が送られます）'}
                </label>
                <textarea value={form.message_template}
                  onChange={e => set('message_template', e.target.value)}
                  rows={4} className="input-field w-full text-sm resize-none"
                  placeholder={form.message_mode === 'template'
                    ? '{name}さん、{treatment}から{months}ヶ月が経ちました。そろそろメンテナンスはいかがですか？😊'
                    : 'いつもご来院ありがとうございます。またのご来院をお待ちしております。'} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">⑤ 承認モード</label>
            <div className="space-y-2">
              {APPROVAL_MODES.map(m => (
                <button key={m.value} onClick={() => set('approval_mode', m.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    form.approval_mode === m.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <p className="text-sm font-medium text-gray-900">{m.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">⑥ 再送防止（同じお客様への連続送信を防ぐ）</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">同じ方へは</span>
              <input type="number" min="1" value={form.cooldown_days}
                onChange={e => set('cooldown_days', Number(e.target.value))}
                className="input-field w-20 text-sm text-center" />
              <span className="text-sm text-gray-600">日間は再送しない</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1 py-2 rounded-lg text-sm">キャンセル</button>
            <button onClick={save} disabled={saving}
              className="btn-primary flex-1 py-2 rounded-lg text-sm disabled:opacity-40">
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// タブ2: キャンペーン配信
// ═══════════════════════════════════════════════════════════════════════════════
function CampaignBroadcastTab() {
  const [step, setStep] = useState(1)
  const [campaigns, setCampaigns]               = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [segment, setSegment]                   = useState('all')
  const [tagInput, setTagInput]                 = useState('')
  const [tags, setTags]                         = useState([])
  const [daysSince, setDaysSince]               = useState(null)
  const [title, setTitle]                       = useState('')
  const [message, setMessage]                   = useState('')
  const [generating, setGenerating]             = useState(false)
  const [previewCount, setPreviewCount]         = useState(null)
  const [previewing, setPreviewing]             = useState(false)
  const [sending, setSending]                   = useState(false)
  const [jobId, setJobId]                       = useState(null)
  const [done, setDone]                         = useState(null)

  useEffect(() => {
    api.get(`${BASE}/api/settings/campaigns`)
      .then(r => setCampaigns(r.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (step === 3) fetchPreview()
  }, [step])

  async function fetchPreview() {
    setPreviewing(true)
    try {
      const res = await api.post(`${BASE}/api/broadcast/preview`, { filter: buildFilter() })
      setPreviewCount(res.data.count)
    } catch { setPreviewCount(null) }
    finally { setPreviewing(false) }
  }

  async function generateFromCampaign() {
    if (!selectedCampaign) return
    setGenerating(true)
    try {
      const res = await api.post(`${BASE}/api/broadcast/generate-from-campaign`,
        { campaign_id: selectedCampaign.id })
      setMessage(res.data.draft)
    } catch { alert('AI生成に失敗しました') }
    finally { setGenerating(false) }
  }

  async function handleSend() {
    if (!message.trim()) { alert('メッセージを入力してください'); return }
    const count = previewCount ?? '?'
    if (!window.confirm(`${count}人のお客様にLINEメッセージを送信します。よろしいですか？`)) return
    setSending(true)
    try {
      const res = await api.post(`${BASE}/api/broadcast/send`, {
        type: 'campaign', title, message, filter: buildFilter()
      })
      setJobId(res.data.job_id)
    } catch (e) {
      alert(e.response?.data?.error || '送信に失敗しました')
      setSending(false)
    }
  }

  function buildFilter() {
    const f = { segment }
    if (tags.length > 0) f.tags = tags
    if (daysSince !== null) f.days_since_last_visit = daysSince
    return f
  }

  function reset() {
    setStep(1); setSelectedCampaign(null)
    setSegment('all'); setTags([]); setTagInput(''); setDaysSince(null)
    setTitle(''); setMessage(''); setPreviewCount(null)
    setSending(false); setJobId(null); setDone(null)
  }

  const isLarge = previewCount !== null && previewCount >= 1000

  if (done) {
    return (
      <div className="space-y-4">
        <div className={`rounded-2xl p-6 text-center ${done.status === 'done' ? 'bg-emerald-50' : 'bg-yellow-50'}`}>
          <div className={`flex justify-center mb-3 ${done.status === 'done' ? 'text-emerald-500' : 'text-yellow-500'}`}>
            <SvgIcon d={done.status === 'done' ? IC.checkCircle : IC.warning} className="w-10 h-10" />
          </div>
          <p className="font-semibold text-gray-900 text-lg">
            {done.status === 'done' ? '送信完了！' : '一部エラーが発生しました'}
          </p>
          <p className="text-gray-600 mt-1">{done.sent_count}件のお客様にLINEメッセージを送信しました</p>
        </div>
        <button onClick={reset} className="w-full btn-secondary py-2 rounded-lg text-sm">
          新しい配信を作成
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ステッパー */}
      <div className="flex items-center gap-3 flex-wrap">
        <StepBadge n={1} label="キャンペーンを選択" active={step===1} done={step>1} />
        <div className="h-px w-5 bg-gray-200 hidden sm:block" />
        <StepBadge n={2} label="対象を絞り込む" active={step===2} done={step>2} />
        <div className="h-px w-5 bg-gray-200 hidden sm:block" />
        <StepBadge n={3} label="メッセージ・送信" active={step===3} done={false} />
      </div>

      {/* ── Step 1: キャンペーン選択 ── */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900">送信するキャンペーンを選択</h2>
          <Card className="space-y-3">
            {campaigns.length === 0 ? (
              <p className="text-sm text-gray-400">キャンペーンが登録されていません。先にキャンペーン管理で登録してください。</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {campaigns.map(c => (
                  <button key={c.id} onClick={() => setSelectedCampaign(c)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedCampaign?.id === c.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SvgIcon d={IC.campaign} className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                      </div>
                      {selectedCampaign?.id === c.id && (
                        <span className="flex items-center gap-1 text-xs text-primary-600 font-medium flex-shrink-0">
                          <SvgIcon d={IC.check} className="w-3.5 h-3.5" />
                          選択中
                        </span>
                      )}
                    </div>
                    {(c.content || c.description) && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 pl-6">{c.content || c.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </Card>
          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedCampaign}
              className="btn-primary px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-40">
              次へ：対象を絞り込む →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: セグメント絞り込み ── */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900">誰に送りますか？</h2>

          <Card className="space-y-3">
            <p className="text-sm font-medium text-gray-700">顧客セグメント</p>
            <div className="flex flex-wrap gap-2">
              {SEGMENTS.map(s => (
                <button key={s.value} onClick={() => setSegment(s.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${s.style} ${
                    segment === s.value ? 'ring-2 ring-offset-1 ring-primary-400' : ''
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
            {segment === 'all' && (
              <div className="flex items-start gap-2 text-amber-700 text-xs bg-amber-50 rounded-lg px-3 py-2">
                <SvgIcon d={IC.warning} className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>「全顧客」はLINEに登録している全員が対象です。人数が多い場合は次のステップで送信前に必ず確認してください。</p>
              </div>
            )}
          </Card>

          <Card className="space-y-3">
            <p className="text-sm font-medium text-gray-700">最終来院日でさらに絞り込む（任意）</p>
            <div className="flex flex-wrap gap-2">
              {DAYS_OPTIONS.map(d => (
                <button key={d.value ?? 'none'} onClick={() => setDaysSince(d.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    daysSince === d.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {d.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="space-y-3">
            <p className="text-sm font-medium text-gray-700">タグで絞り込む（任意）</p>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter') { if (tagInput.trim() && !tags.includes(tagInput.trim())) setTags(p=>[...p,tagInput.trim()]); setTagInput('') }}}
                placeholder="例：注入系" className="input-field flex-1 text-sm" />
              <button onClick={() => { if (tagInput.trim() && !tags.includes(tagInput.trim())) setTags(p=>[...p,tagInput.trim()]); setTagInput('') }}
                className="btn-secondary px-3 py-2 rounded-lg text-sm">追加</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                    {t} <button onClick={() => setTags(p=>p.filter(x=>x!==t))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="btn-secondary px-4 py-2 rounded-lg text-sm">← 戻る</button>
            <button onClick={() => setStep(3)} className="btn-primary px-6 py-2 rounded-lg text-sm">
              次へ：メッセージを作成 →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: メッセージ・送信 ── */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-base font-semibold text-gray-900">メッセージを確認して送信する</h2>

          {/* 配信サマリー + 対象人数 */}
          <div className={`rounded-xl border p-4 space-y-3 ${isLarge ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex gap-3">
                  <span className="text-gray-400">キャンペーン</span>
                  <span className="font-medium">{selectedCampaign?.title}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-400">対象</span>
                  <span>{SEGMENTS.find(s=>s.value===segment)?.label}
                    {daysSince ? `・${DAYS_OPTIONS.find(d=>d.value===daysSince)?.label}` : ''}
                    {tags.length > 0 ? `・タグ: ${tags.join('、')}` : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {previewing ? (
                  <span className="text-sm text-gray-400">人数確認中...</span>
                ) : previewCount !== null ? (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {previewCount.toLocaleString()}
                      <span className="text-sm font-normal text-gray-500 ml-1">人</span>
                    </p>
                  </div>
                ) : null}
                <button onClick={fetchPreview} disabled={previewing}
                  className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-300 rounded-lg bg-white">
                  {previewing ? '...' : '再取得'}
                </button>
              </div>
            </div>

            {isLarge && (
              <div className="flex items-start gap-2 text-amber-800 text-xs">
                <SvgIcon d={IC.warning} className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold">{previewCount.toLocaleString()}人への大量送信です。</span>
                  LINEプランの月間送信上限を超えると送信がストップします。スタンダードプラン（¥15,000/月・無制限）かどうかをご確認ください。
                </p>
              </div>
            )}
          </div>

          {/* AI生成 */}
          {selectedCampaign && (
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <SvgIcon d={IC.sparkle} className="w-4 h-4 text-primary-500" />
                    AIでメッセージを下書き生成
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">「{selectedCampaign.title}」の内容をもとにAIが作成します。生成後に自由に編集できます。</p>
                </div>
                <button onClick={generateFromCampaign} disabled={generating}
                  className="btn-secondary px-4 py-2 rounded-lg text-sm flex-shrink-0 flex items-center gap-1.5">
                  {generating
                    ? <><span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />生成中...</>
                    : '生成する'}
                </button>
              </div>
            </Card>
          )}

          {/* タイトル */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">タイトル <span className="text-gray-400 font-normal text-xs">（任意・履歴管理用）</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="例：4月キャンペーン告知" className="input-field w-full text-sm" />
          </div>

          {/* メッセージ */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              メッセージ本文 <span className="text-red-500">*</span>
            </label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              rows={7}
              placeholder="上の「生成する」ボタンでAIに下書きを作ってもらうか、直接入力してください"
              className="input-field w-full text-sm resize-none" />
            <p className="text-xs text-gray-400 text-right">{message.length}文字</p>
          </div>

          {jobId && <JobProgressBar jobId={jobId} onDone={setDone} />}

          <div className="flex justify-between items-center">
            <button onClick={() => setStep(2)} disabled={!!jobId}
              className="btn-secondary px-4 py-2 rounded-lg text-sm disabled:opacity-40">← 戻る</button>
            <button onClick={handleSend}
              disabled={sending || !message.trim() || !!jobId || previewCount === 0}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 flex items-center gap-2 text-white transition-colors ${
                isLarge ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary-600 hover:bg-primary-700'
              }`}>
              <SvgIcon d={IC.send} className="w-4 h-4" />
              {sending
                ? '送信中...'
                : previewCount !== null
                  ? `${previewCount.toLocaleString()}人に送信する`
                  : 'LINEに送信する'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// タブ3: 承認キュー
// ═══════════════════════════════════════════════════════════════════════════════
function ApprovalQueueTab({ onApproved }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [samples, setSamples] = useState([])
  const [samplesLoading, setSamplesLoading] = useState(false)
  const [approving, setApproving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`${BASE}/api/broadcast/jobs?status=awaiting_approval`)
      setJobs(res.data || [])
    } catch { setJobs([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function selectJob(job) {
    setSelectedJob(job)
    setSamplesLoading(true)
    try {
      const res = await api.get(`${BASE}/api/broadcast/jobs/${job.id}/samples`)
      setSamples(res.data.samples || [])
    } catch { setSamples([]) }
    finally { setSamplesLoading(false) }
  }

  async function approve() {
    if (!window.confirm(`${selectedJob.total_count}件のお客様に送信します。よろしいですか？`)) return
    setApproving(true)
    try {
      await api.post(`${BASE}/api/broadcast/jobs/${selectedJob.id}/approve`)
      setSelectedJob(null)
      load()
      onApproved && onApproved()
    } catch (e) {
      alert(e.response?.data?.error || '承認に失敗しました')
    } finally { setApproving(false) }
  }

  async function reject() {
    if (!window.confirm('このジョブを却下しますか？')) return
    await api.post(`${BASE}/api/broadcast/jobs/${selectedJob.id}/reject`)
    setSelectedJob(null)
    load()
  }

  if (selectedJob) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 text-sm">
            ← 一覧に戻る
          </button>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-2">
          <p className="font-semibold text-gray-900">{selectedJob.title || selectedJob.type}</p>
          <p className="text-sm text-gray-500">全{selectedJob.total_count}件 · 自動ルールによる生成</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            AIが生成したメッセージのサンプル（ランダム5件）
          </p>
          <p className="text-xs text-gray-500">内容を確認して問題なければ「全件送信」を押してください。修正が必要な場合はルールのテンプレートを編集して再生成できます。</p>
          {samplesLoading ? (
            <div className="text-center text-gray-400 text-sm py-6">生成中...</div>
          ) : (
            <div className="space-y-3">
              {samples.map((s) => (
                <div key={s.id} className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-400">{s.display_name || 'お客様'}</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{s.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={reject} className="btn-secondary flex-1 py-2.5 rounded-lg text-sm">
            却下する
          </button>
          <button onClick={approve} disabled={approving}
            className="bg-primary-600 hover:bg-primary-700 text-white flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40">
            {approving ? '送信中...' : `全${selectedJob.total_count}件を送信する`}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">承認キュー</h2>
        <button onClick={load} className="text-xs text-gray-500 hover:text-gray-700">更新</button>
      </div>
      {loading ? (
        <div className="text-center text-gray-400 text-sm py-10">読み込み中...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <div className="flex justify-center mb-2 text-gray-300">
            <SvgIcon d={IC.checkCircle} className="w-8 h-8" />
          </div>
          <p className="text-sm text-gray-500">承認待ちのジョブはありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white border border-yellow-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{job.title || job.type}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {job.total_count}件のメッセージが生成されました
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {job.created_at?.slice(0, 16).replace('T', ' ')}
                  </p>
                </div>
                <button onClick={() => selectJob(job)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-xs font-semibold flex-shrink-0">
                  確認・承認する
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// タブ4: 配信履歴
// ═══════════════════════════════════════════════════════════════════════════════
function HistoryTab() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`${BASE}/api/broadcast/history`)
      .then(r => setHistory(r.data || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [])

  const typeLabel = v => ({ campaign: 'キャンペーン配信', notice: 'お知らせ', auto: '自動配信' }[v] || v)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">配信履歴</h2>
      </div>
      {loading ? (
        <div className="p-10 text-center text-gray-400 text-sm">読み込み中...</div>
      ) : history.length === 0 ? (
        <div className="p-10 text-center">
          <div className="flex justify-center mb-2 text-gray-300">
            <SvgIcon d={IC.history} className="w-8 h-8" />
          </div>
          <p className="text-sm text-gray-400">配信履歴はまだありません</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">送信日時</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">タイトル/内容</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">タイプ</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">送信数</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {log.sent_at?.slice(0,16).replace('T',' ')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {log.title || log.message?.slice(0,30) + '…'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{typeLabel(log.type)}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{log.sent_count}件</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={log.status === 'sent' ? 'done' : log.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// メインコンポーネント
// ═══════════════════════════════════════════════════════════════════════════════
export default function SegmentBroadcast() {
  const [tab, setTab] = useState('rules')
  const [approvalBadge, setApprovalBadge] = useState(0)

  useEffect(() => {
    api.get(`${BASE}/api/broadcast/jobs?status=awaiting_approval`)
      .then(r => setApprovalBadge((r.data || []).length))
      .catch(() => {})
  }, [tab])

  const tabs = [
    { id: 'rules',    label: '自動配信ルール', iconD: IC.clock },
    { id: 'campaign', label: 'キャンペーン配信', iconD: IC.campaign },
    { id: 'approval', label: '承認キュー',      iconD: IC.checkCircle, badge: approvalBadge },
    { id: 'history',  label: '配信履歴',        iconD: IC.history },
  ]

  return (
    <div className="p-6 space-y-6">
      <InfoBanner storageKey="broadcast">
        <p>ここでは、特定のお客様グループへのLINEメッセージ配信（セグメント配信）を管理します。AIが顧客の名前・来院履歴・施術情報を使って個別メッセージを生成するため、お客様に「私のために作られたメッセージ」と感じてもらえます。</p>
        <p className="font-semibold mt-1">4つのタブの使い方</p>
        <ul className="space-y-1 list-none">
          <li>・<span className="font-medium">自動配信ルール</span>：「ヒアルロン酸から6ヶ月経ったお客様に毎日自動送信」などの条件を設定します。一度設定すれば毎晩0時に自動で動きます</li>
          <li>・<span className="font-medium">キャンペーン配信</span>：登録済みキャンペーンを選んで今すぐ配信します。AIがキャンペーン内容からメッセージを自動生成します</li>
          <li>・<span className="font-medium">承認キュー</span>：自動配信でAIが生成したメッセージを確認・承認します。サンプル5件を見て問題なければ全件送信できます</li>
          <li>・<span className="font-medium">配信履歴</span>：過去の配信記録を確認できます</li>
        </ul>
        <p className="font-semibold mt-1">承認モードについて</p>
        <p>自動配信ルールには3つの承認モードがあります。最初は「サンプル確認モード」で運用し、AIの文章品質に慣れてきたら「自動送信モード」に切り替えることをおすすめします。</p>
      </InfoBanner>

      <div>
        <h1 className="text-xl font-bold text-gray-900">セグメント配信</h1>
        <p className="text-sm text-gray-500 mt-1">お客様をセグメントで絞り込んでLINEに一斉送信</p>
      </div>

      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors relative ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <SvgIcon d={t.iconD} className="w-4 h-4" />
            {t.label}
            {t.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'rules'    && <AutoRulesTab />}
      {tab === 'campaign' && <CampaignBroadcastTab />}
      {tab === 'approval' && <ApprovalQueueTab onApproved={() => setApprovalBadge(0)} />}
      {tab === 'history'  && <HistoryTab />}
    </div>
  )
}
