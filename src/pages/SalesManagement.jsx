import React, { useState, useEffect, useRef } from 'react'
import InfoBanner from '../components/ui/InfoBanner'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import api from '../lib/apiClient'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const CHART_COLORS = ['#1B3F80', '#2E66CC', '#5A8BE0', '#91B2EB', '#C8D9F5', '#E2EAF8']

const PERIODS = [
  { label: '今月', value: 'month' },
  { label: '先月', value: 'last_month' },
  { label: '3ヶ月', value: '3months' },
  { label: '12ヶ月', value: '12months' },
]

const CATEGORIES = ['注入系', 'レーザー', 'リフトアップ', 'スキンケア', 'その他']

function KpiCard({ label, value, sub, trend }) {
  const isUp = trend > 0
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      {trend !== undefined && trend !== null && (
        <p className={`text-xs font-medium mt-1 ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
          {isUp ? '▲' : '▼'} 前月比 {Math.abs(trend)}%
        </p>
      )}
    </div>
  )
}

// ── 売上入力フォーム ──────────────────────────────────────────────────────────
function SaleForm({ initial = {}, onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    date: today,
    menu_name: '',
    category: '',
    customer_name: '',
    staff_name: '',
    notes: '',
    ...initial,
    amount: initial.amount != null ? String(initial.amount) : '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.date || !form.amount) return
    setSaving(true)
    try {
      await onSave({ ...form, amount: parseInt(form.amount) || 0 })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">日付 *</label>
          <input type="date" value={form.date} onChange={set('date')} className="input-field w-full" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">金額（円）*</label>
          <input type="number" value={form.amount} onChange={set('amount')} placeholder="50000" className="input-field w-full" required min="0" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">メニュー名</label>
          <input type="text" value={form.menu_name} onChange={set('menu_name')} placeholder="ヒアルロン酸注入" className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">カテゴリ</label>
          <select value={form.category} onChange={set('category')} className="input-field w-full">
            <option value="">選択なし</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">顧客名</label>
          <input type="text" value={form.customer_name} onChange={set('customer_name')} placeholder="山田 花子" className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">スタッフ名</label>
          <input type="text" value={form.staff_name} onChange={set('staff_name')} placeholder="田中 医師" className="input-field w-full" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
        <input type="text" value={form.notes} onChange={set('notes')} placeholder="備考..." className="input-field w-full" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>キャンセル</Button>
        <Button type="submit" disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
      </div>
    </form>
  )
}

// ── CSV インポートボタン ──────────────────────────────────────────────────────
function CsvImportButton({ onImported }) {
  const ref = useRef()
  const [loading, setLoading] = useState(false)

  const handleChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const token = localStorage.getItem('mediage_auth_token')
      const res = await fetch(`${BASE}/api/sales/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      alert(`${data.imported || 0}件インポートしました`)
      onImported()
    } catch (err) {
      alert('インポートに失敗しました')
    } finally {
      setLoading(false)
      ref.current.value = ''
    }
  }

  return (
    <>
      <input ref={ref} type="file" accept=".csv" className="hidden" onChange={handleChange} />
      <Button variant="secondary" onClick={() => ref.current.click()} disabled={loading}>
        <svg className="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {loading ? 'インポート中...' : 'CSVインポート'}
      </Button>
    </>
  )
}

// ── メインコンポーネント ──────────────────────────────────────────────────────
export default function SalesManagement() {
  const [period, setPeriod] = useState('month')
  const [summary, setSummary] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [showRecords, setShowRecords] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sumRes, recRes] = await Promise.all([
        api.get(`${BASE}/api/sales/summary?period=${period}`),
        api.get(`${BASE}/api/sales?period=${period}`),
      ])
      setSummary(sumRes.data)
      setRecords(recRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [period])

  const handleAddSale = async (data) => {
    await api.post(`${BASE}/api/sales`, data)
    fetchData()
  }

  const handleEditSale = async (data) => {
    await api.put(`${BASE}/api/sales/${editTarget.id}`, data)
    setEditTarget(null)
    fetchData()
  }

  const handleDeleteSale = async (id) => {
    if (!confirm('この売上記録を削除してもよいですか？')) return
    await api.delete(`${BASE}/api/sales/${id}`)
    fetchData()
  }

  const isEmpty = !summary || summary.total_count === 0

  return (
    <div className="p-6 space-y-6">
      <InfoBanner storageKey="sales">
        <p>ここでは、クリニック全体の売上状況をグラフや数字で確認できます。売上を1件ずつ手入力するか、CSVでまとめてインポートできます。</p>
        <p className="font-semibold mt-1">CSVインポートの列名</p>
        <p className="text-xs mt-1">日付, 金額, メニュー名, カテゴリ, 顧客名, スタッフ名, メモ</p>
      </InfoBanner>

      {/* ヘッダー */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">売上管理</h1>
          <p className="text-sm text-gray-500 mt-1">店舗全体の売上サマリー</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === p.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <CsvImportButton onImported={fetchData} />
          <Button onClick={() => setShowAdd(true)}>
            <svg className="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            売上を入力
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">読み込み中...</div>
      ) : isEmpty ? (
        /* 空状態 */
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm font-medium text-gray-500">この期間の売上データがまだありません</p>
          <p className="text-xs text-gray-400 mt-1">「売上を入力」ボタンから手入力、またはCSVインポートで過去データを追加できます</p>
          <div className="flex gap-2 justify-center mt-4">
            <CsvImportButton onImported={fetchData} />
            <Button onClick={() => setShowAdd(true)}>売上を入力</Button>
          </div>
        </div>
      ) : (
        <>
          {/* KPI カード */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="売上合計" value={`¥${(summary.total_amount || 0).toLocaleString()}`} />
            <KpiCard label="来院件数" value={`${summary.total_count || 0}件`} />
            <KpiCard label="客単価" value={`¥${(summary.avg_per_visit || 0).toLocaleString()}`} />
            <KpiCard label="トップメニュー" value={summary.top_menu || '—'} sub={summary.top_menu_amount ? `¥${summary.top_menu_amount.toLocaleString()}` : ''} />
          </div>

          {/* 月次推移グラフ */}
          {summary.monthly_trend?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">月次売上推移</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={summary.monthly_trend} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5) + '月'} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `¥${(v / 10000).toFixed(0)}万`} />
                  <Tooltip formatter={v => [`¥${v.toLocaleString()}`, '売上']} />
                  <Bar dataKey="sales" fill="#1B3F80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 日次推移 + カテゴリ円グラフ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {summary.by_date?.length > 0 && (
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">日次売上</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={summary.by_date}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `¥${(v / 10000).toFixed(0)}万`} />
                    <Tooltip formatter={v => [`¥${v.toLocaleString()}`, '売上']} />
                    <Line type="monotone" dataKey="amount" stroke="#1B3F80" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {summary.by_category?.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">カテゴリ別構成</h2>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={summary.by_category} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                      {summary.by_category.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => `¥${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {summary.by_category.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-gray-600">{d.name}</span>
                      </div>
                      <span className="text-gray-900 font-medium">¥{(d.value / 10000).toFixed(0)}万</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* メニュー別売上テーブル */}
          {summary.by_menu?.length > 0 && (
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
                  {summary.by_menu.map((item, i) => {
                    const ratio = summary.total_amount > 0 ? (item.sales / summary.total_amount * 100).toFixed(1) : '0.0'
                    return (
                      <tr key={item.name} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
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
          )}

          {/* 明細一覧 */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">売上明細</h2>
              <button onClick={() => setShowRecords(!showRecords)} className="text-xs text-primary-600 hover:underline">
                {showRecords ? '閉じる' : `${records.length}件を表示`}
              </button>
            </div>
            {showRecords && (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {records.map(r => (
                  <div key={r.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50">
                    <div>
                      <span className="text-sm font-medium text-gray-800">{r.date} — {r.menu_name || '（メニュー未設定）'}</span>
                      <span className="text-xs text-gray-400 ml-2">{r.customer_name} {r.staff_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">¥{r.amount.toLocaleString()}</span>
                      <button onClick={() => setEditTarget(r)} className="text-xs text-gray-400 hover:text-primary-600">編集</button>
                      <button onClick={() => handleDeleteSale(r.id)} className="text-xs text-gray-400 hover:text-red-500">削除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* 売上追加モーダル */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="売上を入力" size="lg">
        <SaleForm onSave={handleAddSale} onClose={() => setShowAdd(false)} />
      </Modal>

      {/* 売上編集モーダル */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="売上を編集" size="lg">
        {editTarget && (
          <SaleForm initial={editTarget} onSave={handleEditSale} onClose={() => setEditTarget(null)} />
        )}
      </Modal>
    </div>
  )
}
