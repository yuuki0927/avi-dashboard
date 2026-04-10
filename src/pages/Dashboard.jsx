import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import {
  dailySalesData, appointments, customers, campaigns, notifications,
  newVsRepeatData, monthlySalesData,
} from '../data/dummyData'

const COLORS = ['#1B3F80', '#C88A1A', '#10b981', '#F0A820', '#1F4EA8']

const today = '2026-03-28'

function formatYen(v) {
  if (v >= 10000) return `¥${Math.round(v / 10000)}万`
  return `¥${v.toLocaleString()}`
}

export default function Dashboard() {
  const todayAppointments = appointments.filter(a => a.date === today && a.status !== 'キャンセル')
  const todaySales = todayAppointments.reduce((s, a) => s + a.amount, 0)
  const totalCustomers = customers.length
  const vipCount = customers.filter(c => c.visitCount >= 3 && c.totalSpend >= 100000).length
  const activeCompaigns = campaigns.filter(c => c.status === 'active').length

  const upcomingAppointments = appointments
    .filter(a => a.date >= today && a.status === '確定')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5)

  const alertNotifications = notifications.filter(n => n.urgent)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">2026年3月28日（土）</p>
      </div>

      {/* Alerts */}
      {alertNotifications.length > 0 && (
        <div className="space-y-2">
          {alertNotifications.map(n => (
            <div key={n.id} className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
              <svg className="w-4 h-4 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{n.message}</span>
              <span className="ml-auto text-xs text-red-500">{n.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="本日の売上"
          value={`¥${todaySales.toLocaleString()}`}
          sub={`${todayAppointments.length}件の予約`}
          icon="💰"
          color="primary"
          trend={12}
        />
        <StatCard
          title="顧客総数"
          value={`${totalCustomers}名`}
          sub={`VIP ${vipCount}名`}
          icon="👥"
          color="blue"
          trend={5}
        />
        <StatCard
          title="アクティブキャンペーン"
          value={`${activeCompaigns}件`}
          sub="実施中"
          icon="📢"
          color="accent"
        />
        <StatCard
          title="今月の売上"
          value="¥330万"
          sub="目標達成率 110%"
          icon="📈"
          color="green"
          trend={11}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">今月の日次売上</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailySalesData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={3} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v / 10000}万`} />
                <Tooltip formatter={v => [`¥${v.toLocaleString()}`, '売上']} />
                <Bar dataKey="sales" fill="#1B3F80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Pie Chart */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">初再診比率</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={newVsRepeatData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {newVsRepeatData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={v => [`${v}%`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">月次売上推移（12ヶ月）</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlySalesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${Math.round(v / 10000)}万`} />
            <Tooltip formatter={v => [`¥${v.toLocaleString()}`, '売上']} />
            <Bar dataKey="sales" fill="#1B3F80" radius={[4, 4, 0, 0]} name="売上" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Bottom: Upcoming + Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">直近の予約</h2>
          <div className="space-y-3">
            {upcomingAppointments.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-50 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-primary-700 text-xs font-bold leading-tight">{a.date.slice(5).replace('-', '/')}</span>
                  <span className="text-primary-500 text-xs">{a.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.customerName}</p>
                  <p className="text-xs text-gray-500 truncate">{a.treatment}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">¥{a.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{a.doctor}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Campaigns */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">実施中キャンペーン</h2>
          <div className="space-y-3">
            {campaigns.filter(c => c.status === 'active').map(c => {
              const remaining = c.maxUses - c.usedCount
              const pct = Math.round((c.usedCount / c.maxUses) * 100)
              return (
                <div key={c.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-gray-900 leading-tight">{c.title}</p>
                    <Badge label={c.target} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">残り{remaining}枠</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">終了: {c.endDate}</p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
