import React, { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// ── ダミーデータ（後でAPI連携に置き換え） ─────────────────────────────────────
const MONTHLY_DATA = [
  { month: '2025-05', sales: 1820000, visits: 142 },
  { month: '2025-06', sales: 2100000, visits: 168 },
  { month: '2025-07', sales: 1950000, visits: 155 },
  { month: '2025-08', sales: 2380000, visits: 191 },
  { month: '2025-09', sales: 2210000, visits: 177 },
  { month: '2025-10', sales: 2560000, visits: 205 },
  { month: '2025-11', sales: 2740000, visits: 219 },
  { month: '2025-12', sales: 3120000, visits: 248 },
  { month: '2026-01', sales: 2890000, visits: 231 },
  { month: '2026-02', sales: 2650000, visits: 212 },
  { month: '2026-03', sales: 3050000, visits: 244 },
  { month: '2026-04', sales: 1480000, visits: 118 },
]

const DAILY_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}日`,
  sales: Math.floor(Math.random() * 200000 + 50000),
}))

const MENU_DATA = [
  { name: 'ヒアルロン酸注入', sales: 980000, count: 18, color: '#1B3F80' },
  { name: 'ボトックス', sales: 760000, count: 23, color: '#2E66CC' },
  { name: 'フォトフェイシャル', sales: 440000, count: 20, color: '#5A8BE0' },
  { name: 'ウルセラ', sales: 396000, count: 2, color: '#91B2EB' },
  { name: 'ダーマペン4', sales: 275000, count: 10, color: '#C8D9F5' },
  { name: 'その他', sales: 629000, count: 45, color: '#E2EAF8' },
]

const CATEGORY_DATA = [
  { name: '注入系', value: 1740000 },
  { name: 'レーザー', value: 660000 },
  { name: 'リフトアップ', value: 528000 },
  { name: 'スキンケア', value: 412000 },
  { name: 'その他', value: 140000 },
]
const CATEGORY_COLORS = ['#1B3F80', '#2E66CC', '#5A8BE0', '#91B2EB', '#C8D9F5']

const PERIODS = [
  { label: '今月', value: 'month' },
  { label: '先月', value: 'last_month' },
  { label: '3ヶ月', value: '3months' },
  { label: '12ヶ月', value: '12months' },
]

function KpiCard({ label, value, sub, trend }) {
  const isUp = trend > 0
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      {trend !== undefined && (
        <p className={`text-xs font-medium mt-1 ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
          {isUp ? '▲' : '▼'} 前月比 {Math.abs(trend)}%
        </p>
      )}
    </div>
  )
}

export default function SalesManagement() {
  const [period, setPeriod] = useState('month')

  const totalSales = 3480000
  const totalVisits = 118
  const avgPerVisit = Math.round(totalSales / totalVisits)
  const topMenu = MENU_DATA[0]

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">売上管理</h1>
          <p className="text-sm text-gray-500 mt-1">店舗全体の売上サマリー</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${period === p.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="今月の売上" value={`¥${totalSales.toLocaleString()}`} trend={14} />
        <KpiCard label="来院件数" value={`${totalVisits}件`} trend={8} />
        <KpiCard label="客単価" value={`¥${avgPerVisit.toLocaleString()}`} trend={5} />
        <KpiCard label="トップメニュー" value={topMenu.name} sub={`¥${topMenu.sales.toLocaleString()}`} />
      </div>

      {/* 月次推移グラフ */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">月次売上推移（12ヶ月）</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MONTHLY_DATA} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5) + '月'} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `¥${(v / 10000).toFixed(0)}万`} />
            <Tooltip formatter={v => [`¥${v.toLocaleString()}`, '売上']} />
            <Bar dataKey="sales" fill="#1B3F80" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 日次推移 + カテゴリ円グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">今月の日次売上</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={DAILY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `¥${(v / 10000).toFixed(0)}万`} />
              <Tooltip formatter={v => [`¥${v.toLocaleString()}`, '売上']} />
              <Line type="monotone" dataKey="sales" stroke="#1B3F80" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">カテゴリ別構成</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" paddingAngle={2}>
                {CATEGORY_DATA.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={v => `¥${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {CATEGORY_DATA.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i] }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="text-gray-900 font-medium">¥{(d.value / 10000).toFixed(0)}万</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* メニュー別売上テーブル */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">施術メニュー別売上</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">メニュー名</th>
              <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">件数</th>
              <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">売上</th>
              <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">構成比</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MENU_DATA.map(item => {
              const ratio = (item.sales / totalSales * 100).toFixed(1)
              return (
                <tr key={item.name} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 text-right">{item.count}件</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">¥{item.sales.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${ratio}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">{ratio}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
