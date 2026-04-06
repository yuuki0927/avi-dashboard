import React, { useState } from 'react'
import { campaigns as initialCampaigns } from '../data/dummyData'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'

const TARGET_OPTIONS = ['全員', '初診限定', 'リピーター限定', 'VIPタグ', 'タグ指定']

// ── A/Bテスト 視覚的比較コンポーネント ────────────────────────────────────
function ABTestBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-10 text-right">{value}%</span>
    </div>
  )
}

function ABTestResults({ patterns }) {
  const maxCtr = Math.max(...patterns.map(p => p.ctr), 0.1)
  const maxCvr = Math.max(...patterns.map(p => p.cvr), 0.1)
  const winner = patterns.reduce((a, b) => a.cvr >= b.cvr ? a : b)

  return (
    <div className="border-t border-gray-100 pt-3">
      <p className="text-xs font-semibold text-gray-600 mb-3">A/Bテスト結果</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {patterns.map((ab, i) => (
          <div
            key={i}
            className={`p-2.5 rounded-xl text-xs border ${ab.label === winner.label ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-100'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-700">{ab.label}</span>
              {ab.label === winner.label && (
                <span className="text-primary-600 font-bold text-xs">★ 優位</span>
              )}
            </div>
            {ab.title && <p className="text-gray-500 truncate mb-2">{ab.title}</p>}
            <div className="space-y-1.5">
              <ABTestBar label="CTR" value={ab.ctr} max={maxCtr} color="bg-blue-400" />
              <ABTestBar label="CVR" value={ab.cvr} max={maxCvr} color="bg-green-400" />
            </div>
          </div>
        ))}
      </div>
      {/* 並列数値比較 */}
      <div className="flex gap-3 text-xs bg-gray-50 rounded-lg px-3 py-2">
        {patterns.map((ab, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="font-semibold text-gray-600">{ab.label}</p>
            <p className="text-blue-600">CTR <span className="font-bold">{ab.ctr}%</span></p>
            <p className="text-green-600">CVR <span className="font-bold">{ab.cvr}%</span></p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── フォーム ───────────────────────────────────────────────────────────────
function CampaignForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', price: '',
    startDate: '', endDate: '', endDateUndecided: false,
    target: '全員',
    maxUses: 100, maxUsesUnlimited: false,
    usedCount: 0, status: 'active',
    abPatterns: [
      { label: 'パターンA', title: '', ctr: 0, cvr: 0 },
      { label: 'パターンB', title: '', ctr: 0, cvr: 0 },
    ],
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setAB = (i, k, v) => setForm(f => {
    const ab = [...f.abPatterns]
    ab[i] = { ...ab[i], [k]: v }
    return { ...f, abPatterns: ab }
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">タイトル</label>
          <input className="input-field" value={form.title} onChange={e => set('title', e.target.value)} placeholder="キャンペーンタイトル" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">内容</label>
          <textarea className="input-field" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="キャンペーン詳細" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">料金表示</label>
          <input className="input-field" value={form.price} onChange={e => set('price', e.target.value)} placeholder="例：17,600円（税込）" />
        </div>
        <div>
          <label className="label">開始日</label>
          <input type="date" className="input-field" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
        </div>
        <div>
          <label className="label">終了日</label>
          <div className="flex items-center gap-2 mb-1.5">
            <input
              type="checkbox"
              id="endUndecided"
              checked={!!form.endDateUndecided}
              onChange={e => set('endDateUndecided', e.target.checked)}
              className="w-4 h-4 accent-primary-600"
            />
            <label htmlFor="endUndecided" className="text-xs text-gray-600 cursor-pointer">未定</label>
          </div>
          <input
            type="date"
            className="input-field"
            value={form.endDate}
            onChange={e => set('endDate', e.target.value)}
            disabled={form.endDateUndecided}
          />
        </div>
        <div>
          <label className="label">対象者</label>
          <select className="input-field" value={form.target} onChange={e => set('target', e.target.value)}>
            {TARGET_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="label">最大使用回数（枠数）</label>
          <div className="flex items-center gap-2 mb-1.5">
            <input
              type="checkbox"
              id="unlimitedUses"
              checked={!!form.maxUsesUnlimited}
              onChange={e => set('maxUsesUnlimited', e.target.checked)}
              className="w-4 h-4 accent-primary-600"
            />
            <label htmlFor="unlimitedUses" className="text-xs text-gray-600 cursor-pointer">無制限</label>
          </div>
          <input
            type="number"
            className="input-field"
            value={form.maxUses}
            onChange={e => set('maxUses', Number(e.target.value))}
            disabled={form.maxUsesUnlimited}
          />
        </div>
      </div>

      {/* A/B Test */}
      <div className="border border-dashed border-gray-300 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">A/Bテスト設定</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {form.abPatterns.map((ab, i) => (
            <div key={i} className="space-y-2">
              <p className="text-xs font-semibold text-primary-600">{ab.label}</p>
              <input className="input-field" value={ab.title} onChange={e => setAB(i, 'title', e.target.value)} placeholder={`${ab.label}のタイトル`} />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">CTR(%)</label>
                  <input type="number" step="0.1" className="input-field" value={ab.ctr} onChange={e => setAB(i, 'ctr', Number(e.target.value))} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">CVR(%)</label>
                  <input type="number" step="0.1" className="input-field" value={ab.cvr} onChange={e => setAB(i, 'cvr', Number(e.target.value))} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel}>キャンセル</Button>
        <Button variant="primary" onClick={() => onSave(form)}>保存</Button>
      </div>
    </div>
  )
}

// ── メイン ─────────────────────────────────────────────────────────────────
export default function Campaigns() {
  const [list, setList] = useState(initialCampaigns)
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleAdd = (form) => {
    setList(prev => [...prev, { ...form, id: Date.now() }])
    setShowAdd(false)
  }

  const handleEdit = (form) => {
    setList(prev => prev.map(c => c.id === form.id ? form : c))
    setEditTarget(null)
  }

  const handleDelete = () => {
    setList(prev => prev.filter(c => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const statusLabel = { active: '実施中', ended: '終了' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">キャンペーン管理</h1>
          <p className="text-sm text-gray-500 mt-1">{list.length}件のキャンペーン</p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規追加
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {list.map(c => {
          const isUnlimited = c.maxUsesUnlimited
          const remaining = isUnlimited ? '∞' : c.maxUses - c.usedCount
          const pct = isUnlimited ? 0 : Math.round((c.usedCount / c.maxUses) * 100)
          const endLabel = c.endDateUndecided ? '未定' : c.endDate
          const daysLeft = c.endDateUndecided ? null : Math.ceil((new Date(c.endDate) - new Date('2026-03-28')) / 86400000)
          const isEndingSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3

          return (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge label={statusLabel[c.status] || c.status} color={c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} />
                  <Badge label={c.target} />
                  {isEndingSoon && c.status === 'active' && (
                    <Badge label={`終了まで${daysLeft}日`} color="bg-red-100 text-red-700" />
                  )}
                  {c.endDateUndecided && (
                    <Badge label="終了日未定" color="bg-yellow-100 text-yellow-700" />
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditTarget(c)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteTarget(c)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <h3 className="text-base font-semibold text-gray-900 mb-1">{c.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{c.description}</p>
              <p className="text-sm font-medium text-primary-600 mb-3">{c.price}</p>

              <div className="text-xs text-gray-500 mb-3">
                <span>{c.startDate}</span> 〜 <span className={c.endDateUndecided ? 'text-yellow-600 font-medium' : ''}>{endLabel}</span>
              </div>

              {/* Usage Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>使用回数: {c.usedCount}{isUnlimited ? '' : `/${c.maxUses}`}</span>
                  <span className="font-medium text-gray-700">
                    {isUnlimited ? '無制限' : `残り${remaining}枠`}
                  </span>
                </div>
                {!isUnlimited && (
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-red-500' : 'bg-primary-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>

              <ABTestResults patterns={c.abPatterns} />
            </Card>
          )
        })}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="キャンペーン追加" size="lg">
        <CampaignForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="キャンペーン編集" size="lg">
        {editTarget && <CampaignForm initial={editTarget} onSave={handleEdit} onCancel={() => setEditTarget(null)} />}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="削除の確認" size="sm">
        {deleteTarget && (
          <div>
            <p className="text-sm text-gray-700 mb-2">以下のキャンペーンを削除しますか？この操作は取り消せません。</p>
            <p className="font-semibold text-gray-900 mb-5">「{deleteTarget.title}」</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>キャンセル</Button>
              <Button variant="danger" onClick={handleDelete}>削除する</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
