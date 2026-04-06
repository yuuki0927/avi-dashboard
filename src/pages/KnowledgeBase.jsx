import React, { useState, useEffect } from 'react'
import api from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const CATEGORIES = ['一般', 'FAQ', '施術・治療', '料金・費用', 'アクセス・営業時間', 'キャンセル・変更', 'アフターケア', 'その他']

const EMPTY_FORM = { category: '一般', title: '', content: '', keywords: '' }

export default function KnowledgeBase() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null) // null = new, object = editing
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('すべて')
  const [search, setSearch] = useState('')

  const clinicId = user?.current_clinic_id || 1

  const load = () => {
    setLoading(true)
    api.get(`${BASE}/api/knowledge?clinic_id=${clinicId}`)
      .then(r => setEntries(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [clinicId])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (entry) => {
    setEditing(entry)
    setForm({
      category: entry.category || '一般',
      title: entry.title || '',
      content: entry.content || '',
      keywords: entry.keywords || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      const payload = { ...form, clinic_id: clinicId }
      if (editing) {
        await api.put(`${BASE}/api/knowledge/${editing.id}`, payload)
      } else {
        await api.post(`${BASE}/api/knowledge`, payload)
      }
      setShowModal(false)
      load()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (entry) => {
    if (!window.confirm(`「${entry.title}」を削除しますか？`)) return
    await api.delete(`${BASE}/api/knowledge/${entry.id}?clinic_id=${clinicId}`)
    load()
  }

  const filtered = entries.filter(e => {
    const matchCat = filterCat === 'すべて' || e.category === filterCat
    const q = search.trim().toLowerCase()
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const categories = ['すべて', ...CATEGORIES]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ナレッジベース</h1>
          <p className="text-sm text-gray-500 mt-1">AIが参照するクリニック固有の知識を管理します</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          知識を追加
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="キーワードで検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filterCat === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex gap-3 text-sm text-blue-700">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>患者からの質問にAIが自動で関連する知識を参照して回答します。タイトル・本文・キーワードに含まれる語句でマッチングが行われます。</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 text-sm">
            {entries.length === 0 ? 'ナレッジがありません。「知識を追加」から登録してください。' : '条件に一致するナレッジがありません。'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => (
            <div key={entry.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full font-medium">
                      {entry.category}
                    </span>
                    {entry.is_active === 0 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">無効</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{entry.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 whitespace-pre-wrap">{entry.content}</p>
                  {entry.keywords && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.keywords.split(/[,、\s]+/).filter(Boolean).map((kw, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEdit(entry)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(entry)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'ナレッジを編集' : '新しいナレッジを追加'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">カテゴリ</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">タイトル <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="例：キャンセルポリシーについて"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">内容 <span className="text-red-500">*</span></label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={6}
                  placeholder="AIが参照する詳細な説明を入力してください..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  キーワード <span className="text-gray-400 font-normal">（検索精度向上のため、カンマ区切りで入力）</span>
                </label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
                  placeholder="例：キャンセル, 取り消し, 予約変更"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.content.trim()}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
