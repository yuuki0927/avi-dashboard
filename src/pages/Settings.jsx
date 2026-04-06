import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const API = 'http://localhost:5000/api/settings'

const TABS = ['支払い設定', 'Googleカレンダー', 'API管理']

// Field はコンポーネント外に定義することで再マウントを防ぐ
function ClinicField({ label, value, onChange, placeholder, multiline, colSpan2 }) {
  return (
    <div className={colSpan2 ? 'sm:col-span-2' : ''}>
      <label className="label">{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          className="input-field resize-y"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="input-field"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
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
      setData(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ClinicField label="クリニック名"       value={data.name || ''}         onChange={v => set('name', v)} />
        <ClinicField label="専門・診療科"        value={data.specialty || ''}    onChange={v => set('specialty', v)}   placeholder="美容皮膚科・エイジマネジメント" />
        <ClinicField label="営業時間"            value={data.hours || ''}        onChange={v => set('hours', v)}       placeholder="10:00〜19:00（不定休）" />
        <ClinicField label="定休日"              value={data.closed_days || ''} onChange={v => set('closed_days', v)} placeholder="不定休など" />
        <ClinicField label="初診料"              value={data.initial_fee || ''} onChange={v => set('initial_fee', v)} placeholder="2,200円" />
        <ClinicField label="再診料"              value={data.revisit_fee || ''} onChange={v => set('revisit_fee', v)} placeholder="2,200円（1年以上空いた場合）" />
        <ClinicField label="カウンセリング料"    value={data.counseling || ''}  onChange={v => set('counseling', v)}  placeholder="無料" />
        <ClinicField label="Google マップ URL"   value={data.map_url || ''}     onChange={v => set('map_url', v)} />
        <ClinicField label="特徴・アピールポイント" value={data.features || ''} onChange={v => set('features', v)}    multiline colSpan2 />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
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

function PaymentSettings() {
  const [methods, setMethods] = useState([
    { id: 'cash',    label: '現金',               icon: '💴', enabled: true },
    { id: 'card',    label: 'クレジットカード',    icon: '💳', enabled: true },
    { id: 'ic',      label: '交通系IC（Suica等）', icon: '🚃', enabled: false },
    { id: 'qr',      label: 'QRコード決済（PayPay等）', icon: '📱', enabled: true },
    { id: 'emoney',  label: '電子マネー（iD等）',  icon: '📲', enabled: false },
    { id: 'medical', label: '医療ローン',           icon: '🏥', enabled: true },
  ])
  const [saved, setSaved] = useState(false)

  const toggle = (id) =>
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))

  const save = () => {
    // 実装時はここでAPIに保存
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">対応する支払い方法を設定してください</p>
      <div className="space-y-3">
        {methods.map(m => (
          <div key={m.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{m.icon}</span>
              <span className="font-medium text-gray-900 text-sm">{m.label}</span>
            </div>
            <button
              onClick={() => toggle(m.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${m.enabled ? 'bg-primary-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${m.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={save}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          変更を保存
        </button>
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
          {connected && (
            <p className="text-xs text-green-600 mt-1 font-medium">✓ 接続済み (demo@mediage.jp)</p>
          )}
        </div>
        <Button
          variant={connected ? 'secondary' : 'primary'}
          onClick={() => setConnected(!connected)}
        >
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
        <p className="text-xs text-gray-500">
          ※ これはデモ表示です。実際の連携にはOAuth認証とAPIキーが必要です。
        </p>
      </div>
    </div>
  )
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('支払い設定')

  const renderContent = () => {
    switch (activeTab) {
      case '支払い設定': return <PaymentSettings />
      case 'Googleカレンダー': return <GoogleCalendar />
      case 'API管理': return <ApiManagement />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-sm text-gray-500 mt-1">支払い・API連携などを管理します。クリニック情報は「全クリニック管理」から変更できます。</p>
      </div>

      <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {renderContent()}
      </Card>
    </div>
  )
}
