import React, { useState, useMemo } from 'react'
import { customers as initialCustomers } from '../data/dummyData'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

const TODAY = '2026-03-28'

function daysBetween(dateStr, todayStr) {
  const d1 = new Date(dateStr)
  const d2 = new Date(todayStr)
  return Math.floor((d2 - d1) / 86400000)
}

function getSegment(customer) {
  if (customer.visitCount >= 3 && customer.totalSpend >= 100000) return 'VIP'
  const daysSinceVisit = daysBetween(customer.lastVisit, TODAY)
  if (daysSinceVisit >= 90) return '要フォロー'
  if (customer.visitCount === 1) return '新規'
  return 'リピーター'
}

function getAutoTags(customer) {
  const tags = []
  const segment = getSegment(customer)
  if (!customer.tags.includes(segment)) tags.push(segment)
  if (customer.totalSpend >= 300000 && !customer.tags.includes('ハイスペンダー')) tags.push('ハイスペンダー')
  const daysSince = daysBetween(customer.lastVisit, TODAY)
  if (daysSince >= 90 && !customer.tags.includes('再来院促進')) tags.push('再来院促進')
  return tags
}

const SEGMENT_OPTIONS = ['すべて', 'VIP', '要フォロー', '新規', 'リピーター']
const TREATMENT_OPTIONS = ['すべて', 'ヒアルロン酸注入', 'ボトックス', 'フォトフェイシャル', 'ダーマペン4', 'レーザー', 'ウルセラ', 'サーマクール']

export default function Customers() {
  const [customers, setCustomers] = useState(initialCustomers)
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('すべて')
  const [treatmentFilter, setTreatmentFilter] = useState('すべて')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [newTag, setNewTag] = useState('')
  const [showDetail, setShowDetail] = useState(false)

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const segment = getSegment(c)
      const matchSearch = search === '' ||
        c.name.includes(search) ||
        c.lineId.includes(search) ||
        c.treatments.some(t => t.includes(search))
      const matchSegment = segmentFilter === 'すべて' || segment === segmentFilter
      const matchTreatment = treatmentFilter === 'すべて' ||
        c.treatments.some(t => t.includes(treatmentFilter.replace('すべて', '')))
      return matchSearch && matchSegment && matchTreatment
    })
  }, [customers, search, segmentFilter, treatmentFilter])

  const stats = useMemo(() => {
    const vip = customers.filter(c => getSegment(c) === 'VIP').length
    const followUp = customers.filter(c => getSegment(c) === '要フォロー').length
    const newC = customers.filter(c => getSegment(c) === '新規').length
    const repeat = customers.filter(c => getSegment(c) === 'リピーター').length
    return { vip, followUp, newC, repeat }
  }, [customers])

  const addTag = () => {
    if (!newTag.trim() || !selectedCustomer) return
    setCustomers(prev => prev.map(c =>
      c.id === selectedCustomer.id
        ? { ...c, tags: [...c.tags, newTag.trim()] }
        : c
    ))
    setSelectedCustomer(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
    setNewTag('')
  }

  const removeTag = (customerId, tag) => {
    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, tags: c.tags.filter(t => t !== tag) } : c
    ))
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
    }
  }

  const openDetail = (c) => {
    setSelectedCustomer(c)
    setShowDetail(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">顧客管理</h1>
        <p className="text-sm text-gray-500 mt-1">登録顧客 {customers.length}名</p>
      </div>

      {/* Segment Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'VIP', count: stats.vip, color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
          { label: '要フォロー', count: stats.followUp, color: 'bg-red-50 border-red-200 text-red-700' },
          { label: '新規', count: stats.newC, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'リピーター', count: stats.repeat, color: 'bg-blue-50 border-blue-200 text-blue-700' },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setSegmentFilter(segmentFilter === s.label ? 'すべて' : s.label)}
            className={`p-3 rounded-xl border text-left transition-all ${s.color} ${segmentFilter === s.label ? 'ring-2 ring-offset-1 ring-primary-400' : ''}`}
          >
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="名前・LINE ID・施術で検索..."
            className="input-field flex-1 min-w-48"
          />
          <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value)} className="input-field w-auto">
            {SEGMENT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={treatmentFilter} onChange={e => setTreatmentFilter(e.target.value)} className="input-field w-auto">
            {TREATMENT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <Button variant="secondary" onClick={() => { setSearch(''); setSegmentFilter('すべて'); setTreatmentFilter('すべて') }}>
            リセット
          </Button>
        </div>
      </Card>

      {/* Customer List */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500">{filtered.length}名を表示</p>
        {filtered.map(c => {
          const segment = getSegment(c)
          const daysSince = daysBetween(c.lastVisit, TODAY)
          const autoTags = getAutoTags(c)
          return (
            <Card key={c.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" >
              <div className="flex items-center gap-4" onClick={() => openDetail(c)}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                  segment === 'VIP' ? 'bg-yellow-500' :
                  segment === '要フォロー' ? 'bg-red-500' :
                  segment === '新規' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {c.name[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                    <Badge label={segment} />
                    {c.tags.filter(t => !['VIP','新規','リピーター','要フォロー'].includes(t)).map(t => (
                      <Badge key={t} label={t} />
                    ))}
                    {autoTags.map(t => (
                      <Badge key={t} label={t} color="bg-purple-100 text-purple-700" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    <span>LINE: {c.lineId}</span>
                    <span>来院 {c.visitCount}回</span>
                    <span>最終: {c.lastVisit}（{daysSince}日前）</span>
                    <span>消費: ¥{c.totalSpend.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {c.treatments.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">{t}</span>
                    ))}
                    {c.treatments.length > 3 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">+{c.treatments.length - 3}</span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-base font-bold text-gray-900">¥{c.totalSpend.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{c.age}歳 / {c.gender === 'female' ? '女性' : '男性'}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="顧客詳細" size="lg">
        {selectedCustomer && (() => {
          const c = customers.find(x => x.id === selectedCustomer.id) || selectedCustomer
          const segment = getSegment(c)
          const daysSince = daysBetween(c.lastVisit, TODAY)
          const autoTags = getAutoTags(c)
          return (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-xl flex-shrink-0 ${
                  segment === 'VIP' ? 'bg-yellow-500' :
                  segment === '要フォロー' ? 'bg-red-500' :
                  segment === '新規' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {c.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{c.name}</h3>
                  <p className="text-sm text-gray-500">LINE ID: {c.lineId}</p>
                </div>
                <Badge label={segment} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-primary-600">{c.visitCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">来院回数</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">¥{Math.round(c.totalSpend / 10000)}万</p>
                  <p className="text-xs text-gray-500 mt-0.5">総消費額</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{daysSince}</p>
                  <p className="text-xs text-gray-500 mt-0.5">最終来院からの日数</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-700">{c.age}</p>
                  <p className="text-xs text-gray-500 mt-0.5">年齢</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">最終コンタクト日</p>
                <p className="text-sm text-gray-600">{c.lastVisit}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">施術履歴</p>
                <div className="flex flex-wrap gap-2">
                  {c.treatments.map((t, i) => (
                    <span key={i} className="text-sm px-3 py-1 bg-primary-50 text-primary-700 rounded-lg">{t}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">タグ（手動）</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {c.tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {t}
                      <button onClick={() => removeTag(c.id, t)} className="text-gray-400 hover:text-red-500 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="新しいタグを入力"
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                  />
                  <Button variant="secondary" onClick={addTag}>追加</Button>
                </div>
              </div>

              {autoTags.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">自動タグ</p>
                  <div className="flex flex-wrap gap-2">
                    {autoTags.map(t => (
                      <Badge key={t} label={t} color="bg-purple-100 text-purple-700" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">条件に基づいて自動付与されたタグです</p>
                </div>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
