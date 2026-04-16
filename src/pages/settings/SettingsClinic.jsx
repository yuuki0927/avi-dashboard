import React, { useState } from 'react'
import InfoBanner from '../../components/ui/InfoBanner'
import Card from '../../components/ui/Card'

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
        <button onClick={save} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
          変更を保存
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

const TABS = ['支払い設定', 'API管理']

export default function SettingsClinic() {
  const [activeTab, setActiveTab] = useState(TABS[0])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-sm text-gray-500 mt-1">クリニックの設定を管理します</p>
      </div>

      <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === tab ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {activeTab === '支払い設定' && <PaymentSettings />}
        {activeTab === 'API管理'   && <ApiManagement />}
      </Card>
    </div>
  )
}
