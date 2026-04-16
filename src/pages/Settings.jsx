import React, { useState, useEffect } from 'react'
import axios from 'axios'
import api from '../lib/apiClient'
import InfoBanner from '../components/ui/InfoBanner'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const API = `${BASE}/api/settings`

// ── クリニック管理者向け設定 ─────────────────────────────────────────────────

function ClinicField({ label, value, onChange, placeholder, multiline, colSpan2 }) {
  return (
    <div className={colSpan2 ? 'sm:col-span-2' : ''}>
      <label className="label">{label}</label>
      {multiline ? (
        <textarea rows={3} className="input-field resize-y" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className="input-field" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  )
}

function ClinicInfo() {
  const [data, setData] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    axios.get(`${API}/clinic`).then(r => setData(r.data)).catch(console.error)
  }, [])

  const set = (key, val) => setData(d => ({ ...d, [key]: val }))
  const save = async () => {
    setSaving(true)
    try {
      const res = await axios.put(`${API}/clinic`, data)
      setData(res.data); setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ClinicField label="クリニック名" value={data.name || ''} onChange={v => set('name', v)} />
        <ClinicField label="専門・診療科" value={data.specialty || ''} onChange={v => set('specialty', v)} placeholder="美容皮膚科・エイジマネジメント" />
        <ClinicField label="営業時間" value={data.hours || ''} onChange={v => set('hours', v)} placeholder="10:00〜19:00（不定休）" />
        <ClinicField label="定休日" value={data.closed_days || ''} onChange={v => set('closed_days', v)} placeholder="不定休など" />
        <ClinicField label="初診料" value={data.initial_fee || ''} onChange={v => set('initial_fee', v)} placeholder="2,200円" />
        <ClinicField label="再診料" value={data.revisit_fee || ''} onChange={v => set('revisit_fee', v)} placeholder="2,200円（1年以上空いた場合）" />
        <ClinicField label="カウンセリング料" value={data.counseling || ''} onChange={v => set('counseling', v)} placeholder="無料" />
        <ClinicField label="Google マップ URL" value={data.map_url || ''} onChange={v => set('map_url', v)} />
        <ClinicField label="特徴・アピールポイント" value={data.features || ''} onChange={v => set('features', v)} multiline colSpan2 />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
          {saving ? '保存中…' : '変更を保存'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">✓ 保存しました</span>}
      </div>
    </div>
  )
}

function ApiManagement() {
  return (
    <div className="space-y-4">
      <InfoBanner storageKey="settings-api">
        <p>ここでは、このシステムが外部サービスと連携するための「APIキー」を確認・管理します。APIキーとは、サービス同士が安全に通信するための「合言葉」のようなものです。外部に漏れないよう大切に管理してください。</p>
        <p className="font-semibold mt-1">主な連携サービス</p>
        <ul className="space-y-1 list-none">
          <li>・<span className="font-medium">LINE</span>：お客様との会話に使うLINE公式アカウントとの接続に必要です</li>
          <li>・<span className="font-medium">OpenAI</span>：AIボットの頭脳となるサービスです。このキーがないとAIが動きません</li>
          <li>・<span className="font-medium">Stripe</span>：オンライン決済に使用します（実装予定）</li>
        </ul>
        <p>APIキーの実際の変更は、サーバー側の環境変数から行います。管理画面からの変更機能は実装予定です。</p>
      </InfoBanner>
      <p className="text-sm text-gray-500">外部APIの連携設定を管理します（実装予定）</p>
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <p className="text-gray-400 font-medium">API管理（実装予定）</p>
        <p className="text-xs text-gray-400 mt-1">LINE API・OpenAI API・Stripe等のキー管理画面をここに追加します</p>
      </div>
    </div>
  )
}

const PAYMENT_DEFAULTS = [
  { id: 'cash',    label: '現金',                    icon: '💴', enabled: true },
  { id: 'card',    label: 'クレジットカード',         icon: '💳', enabled: true },
  { id: 'ic',      label: '交通系IC（Suica等）',      icon: '🚃', enabled: false },
  { id: 'qr',      label: 'QRコード決済（PayPay等）', icon: '📱', enabled: true },
  { id: 'emoney',  label: '電子マネー（iD等）',       icon: '📲', enabled: false },
  { id: 'medical', label: '医療ローン',               icon: '🏥', enabled: true },
]

function loadPaymentMethods() {
  try {
    const saved = localStorage.getItem('avi_payment_methods')
    if (!saved) return PAYMENT_DEFAULTS
    const ids = JSON.parse(saved)
    return PAYMENT_DEFAULTS.map(m => ({ ...m, enabled: ids.includes(m.id) }))
  } catch { return PAYMENT_DEFAULTS }
}

function PaymentSettings() {
  const [methods, setMethods] = useState(loadPaymentMethods)
  const [saved, setSaved] = useState(false)
  const toggle = (id) => setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))
  const save = () => {
    localStorage.setItem('avi_payment_methods', JSON.stringify(methods.filter(m => m.enabled).map(m => m.id)))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <InfoBanner storageKey="settings-payment">
        <p>ここでは、クリニックで対応している支払い方法を設定します。有効にした支払い方法は、お客様がLINEで「支払いはどんな方法が使えますか？」と聞いたとき、AIが正確に案内します。</p>
        <p>現金・クレジットカード・交通系IC・QRコード決済（PayPay等）など、実際にクリニックで受け付けている方法だけをオンにしてください。対応していない方法が表示されるとトラブルの原因になります。</p>
      </InfoBanner>
      <p className="text-sm text-gray-500">対応する支払い方法を設定してください</p>
      <div className="space-y-3">
        {methods.map(m => (
          <div key={m.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{m.icon}</span>
              <span className="font-medium text-gray-900 text-sm">{m.label}</span>
            </div>
            <button onClick={() => toggle(m.id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${m.enabled ? 'bg-primary-600' : 'bg-gray-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${m.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button onClick={save} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">変更を保存</button>
        {saved && <span className="text-sm text-green-600 font-medium">✓ 保存しました</span>}
      </div>
    </div>
  )
}

function GoogleCalendar() {
  const [connected, setConnected] = useState(false)
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 p-5 border border-gray-200 rounded-xl bg-white">
        <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl flex-shrink-0">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#4285F4"/>
            <text x="12" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">G</text>
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Google カレンダー</p>
          <p className="text-sm text-gray-500">予約をGoogleカレンダーと同期します</p>
          {connected && <p className="text-xs text-green-600 mt-1 font-medium">✓ 接続済み (demo@mediage.jp)</p>}
        </div>
        <Button variant={connected ? 'secondary' : 'primary'} onClick={() => setConnected(!connected)}>
          {connected ? '接続を解除' : 'Googleで連携する'}
        </Button>
      </div>
      {connected && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-medium text-green-800">カレンダー連携が有効です</p>
          <p className="text-xs text-green-600 mt-1">新しい予約が自動的にGoogleカレンダーに追加されます（デモ表示）</p>
        </div>
      )}
      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500">※ これはデモ表示です。実際の連携にはOAuth認証とAPIキーが必要です。</p>
      </div>
    </div>
  )
}

// ── メインコンポーネント ───────────────────────────────────────────────────────

function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p className="text-gray-700 font-semibold text-sm">実装予定です</p>
      <p className="text-xs text-gray-400 mt-1">しばらくお待ちください</p>
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  const clinicTabs = ['支払い設定', 'API管理']
  const [activeClinicTab, setActiveClinicTab] = useState(clinicTabs[0])

  // 会社全体（super_admin）には設定なし → Coming Soon
  if (isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        </div>
        <Card className="p-6">
          <ComingSoon />
        </Card>
      </div>
    )
  }

  const renderClinicContent = () => {
    switch (activeClinicTab) {
      case '支払い設定': return <PaymentSettings />
      case 'API管理': return <ApiManagement />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-sm text-gray-500 mt-1">クリニックの設定を管理します</p>
      </div>

      <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl overflow-x-auto">
        {clinicTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveClinicTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeClinicTab === tab ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {renderClinicContent()}
      </Card>
    </div>
  )
}
