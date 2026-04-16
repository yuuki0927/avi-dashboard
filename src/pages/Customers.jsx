import React, { useState, useMemo, useEffect, useRef } from 'react'
import InfoBanner from '../components/ui/InfoBanner'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import api from '../lib/apiClient'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// ── セグメント計算 ────────────────────────────────────────────────────────────
function getSegment(c) {
  const today = new Date()
  if (c.visit_count >= 3 && c.total_spend >= 100000) return 'VIP'
  if (c.last_visit_date) {
    const days = Math.floor((today - new Date(c.last_visit_date)) / 86400000)
    if (days >= 90) return '要フォロー'
  }
  if (c.visit_count === 1) return '新規'
  if (c.visit_count > 1) return 'リピーター'
  return '新規'
}

const SEGMENT_COLORS = {
  VIP: { bg: 'bg-yellow-500', card: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  '要フォロー': { bg: 'bg-red-500', card: 'bg-red-50 border-red-200 text-red-700' },
  '新規': { bg: 'bg-green-500', card: 'bg-green-50 border-green-200 text-green-700' },
  'リピーター': { bg: 'bg-blue-500', card: 'bg-blue-50 border-blue-200 text-blue-700' },
}

const SEGMENT_OPTIONS = ['すべて', 'VIP', '要フォロー', '新規', 'リピーター']
const SOURCE_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'line', label: 'LINE' },
  { value: 'manual', label: '手入力' },
  { value: 'csv', label: 'CSV' },
]
const GENDER_OPTIONS = ['', '女性', '男性', 'その他']

// ── 顧客追加・編集フォーム ────────────────────────────────────────────────────
function CustomerForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    display_name: '',
    phone: '',
    email: '',
    gender: '',
    birthday: '',
    address: '',
    notes: '',
    visit_count: '',
    total_spend: '',
    last_visit_date: '',
    ...initial,
    treatments: Array.isArray(initial.treatments) ? initial.treatments.join('、') : (initial.treatments || ''),
  })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.display_name.trim()) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        visit_count: parseInt(form.visit_count) || 0,
        total_spend: parseInt(form.total_spend) || 0,
        treatments: form.treatments ? form.treatments.split(/[、,，]/).map(t => t.trim()).filter(Boolean) : [],
      }
      await onSave(payload)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { key: 'display_name', label: '名前 *', type: 'text', placeholder: '山田 花子' },
    { key: 'phone', label: '電話番号', type: 'tel', placeholder: '090-0000-0000' },
    { key: 'email', label: 'メール', type: 'email', placeholder: 'example@mail.com' },
    { key: 'birthday', label: '生年月日', type: 'date' },
    { key: 'address', label: '住所', type: 'text', placeholder: '大阪府大阪市...' },
    { key: 'last_visit_date', label: '最終来院日', type: 'date' },
    { key: 'visit_count', label: '来院回数', type: 'number', placeholder: '0' },
    { key: 'total_spend', label: '総消費額（円）', type: 'number', placeholder: '0' },
    { key: 'treatments', label: '施術履歴（読点区切り）', type: 'text', placeholder: 'ヒアルロン酸、ボトックス' },
    { key: 'notes', label: 'メモ', type: 'textarea', placeholder: '特記事項...' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.filter(f => f.type !== 'textarea').map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={set(f.key)}
              placeholder={f.placeholder}
              className="input-field w-full"
              required={f.key === 'display_name'}
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">性別</label>
          <select value={form.gender} onChange={set('gender')} className="input-field w-full">
            {GENDER_OPTIONS.map(o => <option key={o} value={o}>{o || '選択なし'}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
        <textarea
          value={form.notes}
          onChange={set('notes')}
          rows={3}
          placeholder="特記事項、アレルギー情報など..."
          className="input-field w-full resize-none"
        />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>キャンセル</Button>
        <Button type="submit" disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
      </div>
    </form>
  )
}

// ── CSV インポートボタン ──────────────────────────────────────────────────────
function CsvImportButton({ onImported, endpoint }) {
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
      const res = await fetch(`${BASE}${endpoint}`, {
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
export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('すべて')
  const [sourceFilter, setSourceFilter] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [savingTag, setSavingTag] = useState(false)

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (sourceFilter) params.set('source', sourceFilter)
      const res = await api.get(`${BASE}/api/customers?${params}`)
      setCustomers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [search, sourceFilter])

  const filtered = useMemo(() => {
    if (segmentFilter === 'すべて') return customers
    return customers.filter(c => getSegment(c) === segmentFilter)
  }, [customers, segmentFilter])

  const stats = useMemo(() => {
    const counts = { VIP: 0, '要フォロー': 0, '新規': 0, 'リピーター': 0 }
    customers.forEach(c => {
      const s = getSegment(c)
      if (counts[s] !== undefined) counts[s]++
    })
    return counts
  }, [customers])

  const handleAddCustomer = async (data) => {
    await api.post(`${BASE}/api/customers`, data)
    fetchCustomers()
  }

  const handleEditCustomer = async (data) => {
    await api.put(`${BASE}/api/customers/${selectedCustomer.user_id}`, data)
    fetchCustomers()
    setShowDetail(false)
  }

  const handleDeleteCustomer = async (userId) => {
    if (!confirm('この顧客を削除してもよいですか？')) return
    await api.delete(`${BASE}/api/customers/${userId}`)
    setShowDetail(false)
    fetchCustomers()
  }

  const addTag = async () => {
    if (!newTag.trim() || !selectedCustomer) return
    setSavingTag(true)
    const newTags = [...(selectedCustomer.tags || []), newTag.trim()]
    try {
      await api.put(`${BASE}/api/customers/${selectedCustomer.user_id}`, { tags: newTags })
      setSelectedCustomer(c => ({ ...c, tags: newTags }))
      setCustomers(prev => prev.map(c =>
        c.user_id === selectedCustomer.user_id ? { ...c, tags: newTags } : c
      ))
      setNewTag('')
    } finally {
      setSavingTag(false)
    }
  }

  const removeTag = async (tag) => {
    const newTags = (selectedCustomer.tags || []).filter(t => t !== tag)
    await api.put(`${BASE}/api/customers/${selectedCustomer.user_id}`, { tags: newTags })
    setSelectedCustomer(c => ({ ...c, tags: newTags }))
    setCustomers(prev => prev.map(c =>
      c.user_id === selectedCustomer.user_id ? { ...c, tags: newTags } : c
    ))
  }

  const openDetail = (c) => {
    setSelectedCustomer(c)
    setShowDetail(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <InfoBanner storageKey="customers">
        <p>ここでは、顧客情報を一覧で確認・管理できます。LINEからの自動登録のほか、手入力やCSVインポートで既存顧客を追加できます。セグメントやタグを活用してセグメント配信に連携できます。</p>
        <p className="font-semibold mt-1">CSVインポートの列名</p>
        <p className="text-xs mt-1">名前, 電話番号, メール, 性別, 生年月日, 住所, 最終来院日, 来院回数, 総消費額, メモ</p>
      </InfoBanner>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">顧客管理</h1>
          <p className="text-sm text-gray-500 mt-1">登録顧客 {customers.length}名</p>
        </div>
        <div className="flex gap-2">
          <CsvImportButton onImported={fetchCustomers} endpoint="/api/customers/import" />
          <Button onClick={() => setShowAdd(true)}>
            <svg className="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            顧客を追加
          </Button>
        </div>
      </div>

      {/* セグメント統計 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'VIP', count: stats.VIP },
          { label: '要フォロー', count: stats['要フォロー'] },
          { label: '新規', count: stats['新規'] },
          { label: 'リピーター', count: stats['リピーター'] },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setSegmentFilter(segmentFilter === s.label ? 'すべて' : s.label)}
            className={`p-3 rounded-xl border text-left transition-all ${SEGMENT_COLORS[s.label].card} ${segmentFilter === s.label ? 'ring-2 ring-offset-1 ring-primary-400' : ''}`}
          >
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* フィルター */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="名前・電話番号・メール・施術で検索..."
            className="input-field flex-1 min-w-48"
          />
          <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value)} className="input-field w-auto">
            {SEGMENT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="input-field w-auto">
            {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Button variant="secondary" onClick={() => { setSearch(''); setSegmentFilter('すべて'); setSourceFilter('') }}>
            リセット
          </Button>
        </div>
      </Card>

      {/* 顧客一覧 */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm font-medium text-gray-500">顧客データがまだありません</p>
          <p className="text-xs text-gray-400 mt-1">「顧客を追加」ボタンから手入力、またはCSVインポートで追加できます</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{filtered.length}名を表示</p>
          {filtered.map(c => {
            const segment = getSegment(c)
            const today = new Date()
            const daysSince = c.last_visit_date
              ? Math.floor((today - new Date(c.last_visit_date)) / 86400000)
              : null
            const tags = Array.isArray(c.tags) ? c.tags : []
            const treatments = Array.isArray(c.treatments) ? c.treatments : []
            return (
              <Card key={c.user_id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4" onClick={() => openDetail(c)}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${SEGMENT_COLORS[segment]?.bg || 'bg-gray-400'}`}>
                    {(c.display_name || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{c.display_name}</span>
                      <Badge label={segment} />
                      {tags.map(t => <Badge key={t} label={t} />)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                      {c.phone && <span>{c.phone}</span>}
                      <span>来院 {c.visit_count || 0}回</span>
                      {c.last_visit_date && <span>最終: {c.last_visit_date}（{daysSince}日前）</span>}
                      {c.total_spend > 0 && <span>消費: ¥{c.total_spend.toLocaleString()}</span>}
                      <span className={`px-1.5 py-0.5 rounded text-xs ${c.source === 'line' ? 'bg-green-100 text-green-600' : c.source === 'csv' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        {c.source === 'line' ? 'LINE' : c.source === 'csv' ? 'CSV' : '手入力'}
                      </span>
                    </div>
                    {treatments.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {treatments.slice(0, 3).map((t, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">{t}</span>
                        ))}
                        {treatments.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">+{treatments.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    {c.total_spend > 0 && <p className="text-base font-bold text-gray-900">¥{c.total_spend.toLocaleString()}</p>}
                    {c.gender && <p className="text-xs text-gray-400">{c.gender}</p>}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* 顧客追加モーダル */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="顧客を追加" size="lg">
        <CustomerForm onSave={handleAddCustomer} onClose={() => setShowAdd(false)} />
      </Modal>

      {/* 顧客編集モーダル */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="顧客を編集" size="lg">
        {selectedCustomer && (
          <CustomerForm
            initial={selectedCustomer}
            onSave={handleEditCustomer}
            onClose={() => { setShowEdit(false); setShowDetail(true) }}
          />
        )}
      </Modal>

      {/* 詳細モーダル */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="顧客詳細" size="lg">
        {selectedCustomer && (() => {
          const c = customers.find(x => x.user_id === selectedCustomer.user_id) || selectedCustomer
          const segment = getSegment(c)
          const today = new Date()
          const daysSince = c.last_visit_date ? Math.floor((today - new Date(c.last_visit_date)) / 86400000) : null
          const tags = Array.isArray(c.tags) ? c.tags : []
          const treatments = Array.isArray(c.treatments) ? c.treatments : []
          return (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-xl flex-shrink-0 ${SEGMENT_COLORS[segment]?.bg || 'bg-gray-400'}`}>
                    {(c.display_name || '?')[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{c.display_name}</h3>
                    {c.phone && <p className="text-sm text-gray-500">{c.phone}</p>}
                    {c.email && <p className="text-sm text-gray-500">{c.email}</p>}
                  </div>
                  <Badge label={segment} />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => { setShowDetail(false); setShowEdit(true) }}>編集</Button>
                  <button
                    onClick={() => handleDeleteCustomer(c.user_id)}
                    className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-primary-600">{c.visit_count || 0}</p>
                  <p className="text-xs text-gray-500 mt-0.5">来院回数</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">¥{((c.total_spend || 0) / 10000).toFixed(1)}万</p>
                  <p className="text-xs text-gray-500 mt-0.5">総消費額</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{daysSince ?? '—'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">最終来院からの日数</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-700">{c.gender || '—'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">性別</p>
                </div>
              </div>

              {c.birthday && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">生年月日</p>
                  <p className="text-sm text-gray-600">{c.birthday}</p>
                </div>
              )}
              {c.address && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">住所</p>
                  <p className="text-sm text-gray-600">{c.address}</p>
                </div>
              )}

              {treatments.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">施術履歴</p>
                  <div className="flex flex-wrap gap-2">
                    {treatments.map((t, i) => (
                      <span key={i} className="text-sm px-3 py-1 bg-primary-50 text-primary-700 rounded-lg">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {c.notes && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">メモ</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{c.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">タグ</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {t}
                      <button onClick={() => removeTag(t)} className="text-gray-400 hover:text-red-500 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="新しいタグを入力"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button variant="secondary" onClick={addTag} disabled={savingTag}>追加</Button>
                </div>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
