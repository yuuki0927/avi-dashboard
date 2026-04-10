import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import {
  dailySalesData, monthlySalesData, yearlySalesData,
  treatmentSalesData, doctorSalesData, counselorSalesData,
  repeatRateData, churnRateData, hourlyAppointments,
  ageDistribution, newVsRepeatData, campaignROIData,
  customers,
} from '../data/dummyData'

const COLORS = ['#1B3F80', '#C88A1A', '#10b981', '#F0A820', '#1F4EA8', '#6A97C2']

const TAB_OPTIONS = ['日次', '月次', '年次']

// ── 詳細データ（ダミー）────────────────────────────────────────────────────
const monthlySalesDetail = monthlySalesData.map(d => ({
  ...d,
  prevYear: Math.round(d.sales * (0.78 + Math.random() * 0.15)),
  yoy: null,
})).map(d => ({ ...d, yoy: Math.round(((d.sales - d.prevYear) / d.prevYear) * 100) }))

const newVsRepeatMonthly = monthlySalesData.map((d, i) => ({
  month: d.month,
  new: 20 + Math.round(Math.random() * 15),
  repeat: 45 + Math.round(Math.random() * 20),
}))

const ageDetailData = [
  { age: '10代', count: 8, revenue: 320000, pct: 5 },
  { age: '20代', count: 42, revenue: 2100000, pct: 28 },
  { age: '30代', count: 55, revenue: 3850000, pct: 37 },
  { age: '40代', count: 30, revenue: 2400000, pct: 20 },
  { age: '50代', count: 12, revenue: 960000, pct: 8 },
  { age: '60代以上', count: 3, revenue: 270000, pct: 2 },
]

const repeatRateMonthly = repeatRateData.map(d => ({
  ...d,
  count: 35 + Math.round(Math.random() * 20),
}))

const churnMonthly = churnRateData.map(d => ({
  ...d,
  lost: Math.round(d.rate * 0.6),
}))

const treatmentSalesAll = [
  ...treatmentSalesData,
  { name: 'ケミカルピーリング', sales: 198000 },
  { name: 'ボトックス（額）', sales: 176000 },
  { name: 'ビタミン点滴', sales: 148500 },
  { name: 'プラセンタ注射', sales: 82500 },
  { name: 'ニキビ治療', sales: 66000 },
].sort((a, b) => b.sales - a.sales)

const hourlyDetail = hourlyAppointments.map(d => ({
  ...d,
  new: Math.round(d.count * 0.35),
  repeat: Math.round(d.count * 0.65),
}))

const doctorDetail = doctorSalesData.map(d => ({
  ...d,
  treatments: [
    { name: 'ヒアルロン酸', count: Math.round(d.patients * 0.4), revenue: Math.round(d.sales * 0.45) },
    { name: 'ボトックス', count: Math.round(d.patients * 0.35), revenue: Math.round(d.sales * 0.3) },
    { name: 'ハイフ', count: Math.round(d.patients * 0.25), revenue: Math.round(d.sales * 0.25) },
  ],
}))

const counselorDetail = counselorSalesData.map(d => ({
  ...d,
  treatments: [
    { name: 'カウンセリング', count: Math.round(d.patients * 0.6), revenue: Math.round(d.sales * 0.4) },
    { name: 'スキンケア', count: Math.round(d.patients * 0.4), revenue: Math.round(d.sales * 0.6) },
  ],
}))

const campaignROIDetail = campaignROIData.map(d => ({
  ...d,
  clicks: Math.round(d.revenue / 3000),
  conversions: Math.round(d.revenue / 15000),
  cpa: Math.round(d.investment / Math.max(1, Math.round(d.revenue / 15000))),
}))

// ── ユーティリティ ────────────────────────────────────────────────────────

function DetailButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 hover:underline"
    >
      詳細を見る
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

function SectionTitle({ children, onDetail }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-gray-900">{children}</h2>
      {onDetail && <DetailButton onClick={onDetail} />}
    </div>
  )
}

// ── 詳細モーダルコンテンツ ────────────────────────────────────────────────

function MonthlySalesDetail() {
  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={monthlySalesDetail}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${Math.round(v / 10000)}万`} />
          <Tooltip formatter={v => [`¥${v.toLocaleString()}`]} />
          <Bar dataKey="sales" fill="#1B3F80" radius={[4,4,0,0]} name="今期" />
          <Bar dataKey="prevYear" fill="#91B2EB" radius={[4,4,0,0]} name="前年" />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500 text-xs">
            <th className="text-left py-1.5">月</th>
            <th className="text-right py-1.5">今期</th>
            <th className="text-right py-1.5">前年</th>
            <th className="text-right py-1.5">前年比</th>
          </tr>
        </thead>
        <tbody>
          {monthlySalesDetail.map(d => (
            <tr key={d.month} className="border-b border-gray-50">
              <td className="py-1.5 text-gray-700">{d.month}</td>
              <td className="text-right py-1.5 font-medium">¥{d.sales.toLocaleString()}</td>
              <td className="text-right py-1.5 text-gray-500">¥{d.prevYear.toLocaleString()}</td>
              <td className={`text-right py-1.5 font-semibold ${d.yoy >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {d.yoy >= 0 ? '+' : ''}{d.yoy}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function NewRepeatDetail() {
  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={newVsRepeatMonthly}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="new" fill="#1B3F80" radius={[4,4,0,0]} name="初診" stackId="a" />
          <Bar dataKey="repeat" fill="#10b981" radius={[4,4,0,0]} name="再診" stackId="a" />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500 text-xs">
            <th className="text-left py-1.5">月</th>
            <th className="text-right py-1.5">初診</th>
            <th className="text-right py-1.5">再診</th>
            <th className="text-right py-1.5">再診率</th>
          </tr>
        </thead>
        <tbody>
          {newVsRepeatMonthly.map(d => (
            <tr key={d.month} className="border-b border-gray-50">
              <td className="py-1.5 text-gray-700">{d.month}</td>
              <td className="text-right py-1.5">{d.new}名</td>
              <td className="text-right py-1.5">{d.repeat}名</td>
              <td className="text-right py-1.5 font-semibold text-primary-600">
                {Math.round((d.repeat / (d.new + d.repeat)) * 100)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AgeDetail() {
  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500 text-xs">
            <th className="text-left py-1.5">年代</th>
            <th className="text-right py-1.5">人数</th>
            <th className="text-right py-1.5">割合</th>
            <th className="text-right py-1.5">売上</th>
          </tr>
        </thead>
        <tbody>
          {ageDetailData.map(d => (
            <tr key={d.age} className="border-b border-gray-50">
              <td className="py-2 text-gray-700 font-medium">{d.age}</td>
              <td className="text-right py-2">{d.count}名</td>
              <td className="text-right py-2">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${d.pct}%` }} />
                  </div>
                  <span>{d.pct}%</span>
                </div>
              </td>
              <td className="text-right py-2 font-semibold">¥{d.revenue.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RepeatRateDetail() {
  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500 text-xs">
            <th className="text-left py-1.5">月</th>
            <th className="text-right py-1.5">リピート率</th>
            <th className="text-right py-1.5">リピーター数</th>
          </tr>
        </thead>
        <tbody>
          {repeatRateMonthly.map(d => (
            <tr key={d.month} className="border-b border-gray-50">
              <td className="py-2 text-gray-700">{d.month}</td>
              <td className="text-right py-2">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${d.rate}%` }} />
                  </div>
                  <span className="font-semibold text-green-600">{d.rate}%</span>
                </div>
              </td>
              <td className="text-right py-2">{d.count}名</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ChurnDetail() {
  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500 text-xs">
            <th className="text-left py-1.5">月</th>
            <th className="text-right py-1.5">離脱率</th>
            <th className="text-right py-1.5">離脱者数</th>
          </tr>
        </thead>
        <tbody>
          {churnMonthly.map(d => (
            <tr key={d.month} className="border-b border-gray-50">
              <td className="py-2 text-gray-700">{d.month}</td>
              <td className="text-right py-2">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${(d.rate / 30) * 100}%` }} />
                  </div>
                  <span className="font-semibold text-red-500">{d.rate}%</span>
                </div>
              </td>
              <td className="text-right py-2">{d.lost}名</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TreatmentSalesDetail() {
  const max = treatmentSalesAll[0]?.sales || 1
  return (
    <div className="space-y-2">
      {treatmentSalesAll.map((d, i) => (
        <div key={d.name} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-sm text-gray-700">{d.name}</span>
              <span className="text-sm font-semibold text-gray-900">¥{d.sales.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(d.sales / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function HourlyDetail() {
  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500 text-xs">
            <th className="text-left py-1.5">時間帯</th>
            <th className="text-right py-1.5">合計</th>
            <th className="text-right py-1.5">初診</th>
            <th className="text-right py-1.5">再診</th>
          </tr>
        </thead>
        <tbody>
          {hourlyDetail.map(d => (
            <tr key={d.hour} className="border-b border-gray-50">
              <td className="py-2 text-gray-700">{d.hour}</td>
              <td className="text-right py-2 font-semibold">{d.count}件</td>
              <td className="text-right py-2 text-primary-600">{d.new}件</td>
              <td className="text-right py-2 text-green-600">{d.repeat}件</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DoctorDetail() {
  return (
    <div className="space-y-5">
      {doctorDetail.map(d => (
        <div key={d.name} className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-800">{d.name}</p>
            <div className="text-right">
              <p className="text-xs text-gray-500">{d.patients}名担当</p>
              <p className="font-bold text-primary-600">¥{d.sales.toLocaleString()}</p>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left pb-1">施術</th>
                <th className="text-right pb-1">件数</th>
                <th className="text-right pb-1">売上</th>
              </tr>
            </thead>
            <tbody>
              {d.treatments.map(t => (
                <tr key={t.name} className="border-t border-gray-50">
                  <td className="py-1 text-gray-600">{t.name}</td>
                  <td className="text-right py-1">{t.count}件</td>
                  <td className="text-right py-1 font-medium">¥{t.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function CounselorDetail() {
  return (
    <div className="space-y-5">
      {counselorDetail.map(d => (
        <div key={d.name} className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-800">{d.name}</p>
            <div className="text-right">
              <p className="text-xs text-gray-500">{d.patients}名担当</p>
              <p className="font-bold text-pink-600">¥{d.sales.toLocaleString()}</p>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left pb-1">カテゴリ</th>
                <th className="text-right pb-1">件数</th>
                <th className="text-right pb-1">売上</th>
              </tr>
            </thead>
            <tbody>
              {d.treatments.map(t => (
                <tr key={t.name} className="border-t border-gray-50">
                  <td className="py-1 text-gray-600">{t.name}</td>
                  <td className="text-right py-1">{t.count}件</td>
                  <td className="text-right py-1 font-medium">¥{t.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function CampaignROIDetail() {
  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500 text-xs">
            <th className="text-left py-1.5">キャンペーン</th>
            <th className="text-right py-1.5">投資</th>
            <th className="text-right py-1.5">売上</th>
            <th className="text-right py-1.5">CV数</th>
            <th className="text-right py-1.5">CPA</th>
            <th className="text-right py-1.5">ROI</th>
          </tr>
        </thead>
        <tbody>
          {campaignROIDetail.map(d => (
            <tr key={d.name} className="border-b border-gray-50">
              <td className="py-2 text-gray-700 text-xs">{d.name}</td>
              <td className="text-right py-2 text-gray-500">¥{d.investment.toLocaleString()}</td>
              <td className="text-right py-2 font-medium">¥{d.revenue.toLocaleString()}</td>
              <td className="text-right py-2">{d.conversions}件</td>
              <td className="text-right py-2 text-gray-600">¥{d.cpa.toLocaleString()}</td>
              <td className="text-right py-2 font-bold text-green-600">{d.roi}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── モーダルコンテンツ定義 ─────────────────────────────────────────────────
const DETAIL_CONTENTS = {
  monthlySales: { title: '月次売上 詳細・前年比', content: <MonthlySalesDetail /> },
  newRepeat:    { title: '初再診比率 月次推移',   content: <NewRepeatDetail /> },
  age:          { title: '年代別分布 詳細',       content: <AgeDetail /> },
  repeatRate:   { title: 'リピート率 月次一覧',   content: <RepeatRateDetail /> },
  churn:        { title: 'チャーンレート 月次一覧', content: <ChurnDetail /> },
  treatments:   { title: '施術別売上 全メニュー', content: <TreatmentSalesDetail /> },
  hourly:       { title: '時間帯別予約 詳細',     content: <HourlyDetail /> },
  doctor:       { title: 'ドクター別 施術内訳',   content: <DoctorDetail /> },
  counselor:    { title: 'カウンセラー別 施術内訳', content: <CounselorDetail /> },
  roi:          { title: 'キャンペーンROI 詳細',  content: <CampaignROIDetail /> },
}

// ── メインページ ──────────────────────────────────────────────────────────
export default function Analytics() {
  const [salesTab, setSalesTab] = useState('月次')
  const [ltvPeriod, setLtvPeriod] = useState('全期間')
  const [detailKey, setDetailKey] = useState(null)

  const totalRevenue = monthlySalesData.reduce((s, d) => s + d.sales, 0)
  const avgDailySales = Math.round(dailySalesData.reduce((s, d) => s + d.sales, 0) / dailySalesData.length)
  const avgPerCustomer = Math.round(customers.reduce((s, c) => s + c.totalSpend, 0) / customers.length)
  const newPatients = monthlySalesData.reduce((s, d) => s + d.newPatients, 0)
  const ltv = ltvPeriod === '全期間' ? avgPerCustomer * 3.2 : ltvPeriod === '1年' ? avgPerCustomer * 1.8 : avgPerCustomer

  const salesData = salesTab === '日次' ? dailySalesData : salesTab === '月次' ? monthlySalesData : yearlySalesData
  const salesKey = salesTab === '日次' ? 'date' : salesTab === '月次' ? 'month' : 'year'

  const detail = detailKey ? DETAIL_CONTENTS[detailKey] : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">分析ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">クリニックの収益・患者動向を可視化</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="1日あたり収益（平均）" value={`¥${avgDailySales.toLocaleString()}`} sub="今月の日次平均" icon="📅" color="primary" trend={8} />
        <StatCard title="1人あたり単価（平均）" value={`¥${avgPerCustomer.toLocaleString()}`} sub="全顧客平均" icon="💴" color="blue" trend={5} />
        <StatCard title="新患数（今期）" value={`${newPatients}名`} sub="過去12ヶ月" icon="👤" color="green" trend={14} />
        <StatCard title={`LTV（${ltvPeriod}）`} value={`¥${Math.round(ltv).toLocaleString()}`} sub="顧客生涯価値" icon="⭐" color="yellow" />
      </div>

      {/* LTV Period Selector */}
      <div className="flex gap-2">
        {['6ヶ月', '1年', '全期間'].map(p => (
          <button key={p} onClick={() => setLtvPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${ltvPeriod === p ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
          >{p}</button>
        ))}
        <span className="text-xs text-gray-400 self-center ml-2">LTV期間切り替え</span>
      </div>

      {/* Sales Chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-gray-900">{salesTab}売上</h2>
            <DetailButton onClick={() => setDetailKey('monthlySales')} />
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {TAB_OPTIONS.map(t => (
              <button key={t} onClick={() => setSalesTab(t)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${salesTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >{t}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          {salesTab === '年次' ? (
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={salesKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v / 10000)}万`} />
              <Tooltip formatter={v => [`¥${v.toLocaleString()}`, '売上']} />
              <Line type="monotone" dataKey="sales" stroke="#1B3F80" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          ) : (
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={salesKey} tick={{ fontSize: 11 }} interval={salesTab === '日次' ? 3 : 0} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v / 10000)}万`} />
              <Tooltip formatter={v => [`¥${v.toLocaleString()}`, '売上']} />
              <Bar dataKey="sales" fill="#1B3F80" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Card>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionTitle onDetail={() => setDetailKey('newRepeat')}>初再診比率</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={newVsRepeatData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {newVsRepeatData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={v => [`${v}%`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionTitle onDetail={() => setDetailKey('age')}>年代別分布</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={ageDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {ageDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => [`${v}%`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Repeat + Churn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionTitle onDetail={() => setDetailKey('repeatRate')}>リピート率推移</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={repeatRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis domain={[50, 90]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip formatter={v => [`${v}%`, 'リピート率']} />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionTitle onDetail={() => setDetailKey('churn')}>チャーンレート（離脱率）推移</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={churnRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 30]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip formatter={v => [`${v}%`, 'チャーンレート']} />
              <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Treatment + Hourly */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionTitle onDetail={() => setDetailKey('treatments')}>施術別売上ランキング</SectionTitle>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={treatmentSalesData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${Math.round(v / 10000)}万`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
              <Tooltip formatter={v => [`¥${v.toLocaleString()}`, '売上']} />
              <Bar dataKey="sales" fill="#1B3F80" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionTitle onDetail={() => setDetailKey('hourly')}>時間帯別予約数</SectionTitle>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyAppointments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => [`${v}件`, '予約数']} />
              <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Doctor / Counselor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionTitle onDetail={() => setDetailKey('doctor')}>ドクター別売上</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={doctorSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v / 10000)}万`} />
              <Tooltip formatter={(v, name) => [name === 'sales' ? `¥${v.toLocaleString()}` : `${v}名`, name === 'sales' ? '売上' : '担当患者']} />
              <Bar dataKey="sales" fill="#1B3F80" radius={[4, 4, 0, 0]} name="売上" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {doctorSalesData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{d.name}</span>
                <div className="flex gap-4 text-right">
                  <span className="text-gray-500">{d.patients}名担当</span>
                  <span className="font-semibold text-gray-900">¥{d.sales.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle onDetail={() => setDetailKey('counselor')}>カウンセラー別売上</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={counselorSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v / 10000)}万`} />
              <Tooltip formatter={v => [`¥${v.toLocaleString()}`, '売上']} />
              <Bar dataKey="sales" fill="#ec4899" radius={[4, 4, 0, 0]} name="売上" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {counselorSalesData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{d.name}</span>
                <div className="flex gap-4 text-right">
                  <span className="text-gray-500">{d.patients}名担当</span>
                  <span className="font-semibold text-gray-900">¥{d.sales.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Campaign ROI */}
      <Card className="p-5">
        <SectionTitle onDetail={() => setDetailKey('roi')}>キャンペーンROI（投資対効果）</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={campaignROIData} margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={v => `${Math.round(v / 10000)}万`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} unit="%" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="revenue" fill="#1B3F80" radius={[4, 4, 0, 0]} name="売上" />
            <Bar yAxisId="right" dataKey="roi" fill="#ec4899" radius={[4, 4, 0, 0]} name="ROI(%)" />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">キャンペーン</th>
                <th className="text-right py-2 text-gray-500 font-medium">投資</th>
                <th className="text-right py-2 text-gray-500 font-medium">売上</th>
                <th className="text-right py-2 text-gray-500 font-medium">ROI</th>
              </tr>
            </thead>
            <tbody>
              {campaignROIData.map(d => (
                <tr key={d.name} className="border-b border-gray-50">
                  <td className="py-2 text-gray-700">{d.name}</td>
                  <td className="text-right py-2 text-gray-500">¥{d.investment.toLocaleString()}</td>
                  <td className="text-right py-2 text-gray-700">¥{d.revenue.toLocaleString()}</td>
                  <td className="text-right py-2 font-semibold text-green-600">{d.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailKey}
        onClose={() => setDetailKey(null)}
        title={detail?.title || ''}
        size="lg"
      >
        <div className="max-h-[60vh] overflow-y-auto">
          {detail?.content}
        </div>
      </Modal>
    </div>
  )
}
