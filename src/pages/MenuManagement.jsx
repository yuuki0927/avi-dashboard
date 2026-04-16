import React, { useState, useEffect, useCallback } from 'react'
import InfoBanner from '../components/ui/InfoBanner'
import api from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

const API = 'http://localhost:5000/api/settings'

// ── アイコン ──────────────────────────────────────────────────────────────────

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)
const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)
const IconChevron = ({ open }) => (
  <svg className={`w-4 h-4 transition-transform duration-150 ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

// ── メニュー項目行 ─────────────────────────────────────────────────────────────

function PriceItemRow({ item, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-800">{item.name}</span>
        {item.size_or_part && (
          <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{item.size_or_part}</span>
        )}
        {!!item.requires_form && (
          <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">問診表必須</span>
        )}
      </div>
      {item.price_display && item.price_display !== '0' && (
        <span className="text-sm font-bold text-primary-600 w-36 text-right flex-shrink-0">
          {item.price_display}
        </span>
      )}
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={onEdit} className="p-1.5 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
          <IconEdit />
        </button>
        <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <IconTrash />
        </button>
      </div>
    </div>
  )
}

// ── 中カテゴリセクション ────────────────────────────────────────────────────────

function SubCategorySection({ sub, isOpen, onToggle, onEdit, onDelete, onAddItem, onEditItem, onDeleteItem }) {
  return (
    <div className="border-l-2 border-gray-100 ml-4 pl-4">
      {/* 中カテゴリヘッダー */}
      <div className="flex items-center gap-2 py-2.5">
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 flex-1 text-left min-w-0"
        >
          <span className="text-gray-300 flex-shrink-0">
            <IconChevron open={isOpen} />
          </span>
          <span className="text-sm font-medium text-gray-700 truncate">{sub.name}</span>
          {sub.description && (
            <span className="text-xs text-gray-400 truncate hidden sm:block">{sub.description}</span>
          )}
          <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
            {sub.items.length}件
          </span>
        </button>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onAddItem}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            項目追加
          </button>
          <button onClick={onEdit} className="p-1.5 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <IconEdit />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <IconTrash />
          </button>
        </div>
      </div>

      {/* メニュー項目一覧 */}
      {isOpen && (
        <div className="space-y-1.5 pb-3 pr-1">
          {sub.items.length === 0 ? (
            <button
              onClick={onAddItem}
              className="w-full text-xs text-gray-400 hover:text-primary-600 py-3 border-2 border-dashed border-gray-100 rounded-lg hover:border-primary-200 transition-colors"
            >
              ＋ 項目を追加
            </button>
          ) : (
            sub.items.map(item => (
              <PriceItemRow
                key={item.id}
                item={item}
                onEdit={() => onEditItem(item)}
                onDelete={() => onDeleteItem(item)}
                onToggleForm={() => onToggleForm(item)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── 大カテゴリカード ──────────────────────────────────────────────────────────

function MainCategoryCard({
  main, expandedMain, expandedSub,
  onToggleMain, onToggleSub,
  onEditMain, onDeleteMain,
  onAddSub, onEditSub, onDeleteSub,
  onAddItem, onEditItem, onDeleteItem,
}) {
  const isOpen = expandedMain.has(main.id)
  const itemCount = main.sub_categories.reduce((s, sub) => s + sub.items.length, 0)

  return (
    <div className={`border rounded-xl overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md ${isOpen ? 'border-primary-200' : 'border-gray-200'}`}>
      {/* 大カテゴリヘッダー */}
      <div className={`flex items-center gap-3 px-5 py-4 ${isOpen ? 'bg-primary-50 border-b border-primary-100' : 'bg-white'}`}>
        <button
          onClick={() => onToggleMain(main.id)}
          className="flex items-center gap-2 flex-1 text-left min-w-0"
        >
          <span className={`flex-shrink-0 ${isOpen ? 'text-primary-500' : 'text-gray-400'}`}>
            <IconChevron open={isOpen} />
          </span>
          <span className={`font-semibold ${isOpen ? 'text-primary-800' : 'text-gray-900'}`}>
            {main.name}
          </span>
          <span className="text-xs text-gray-400 font-normal ml-1 flex-shrink-0">
            中カテゴリ {main.sub_categories.length} / メニュー {itemCount}件
          </span>
        </button>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onAddSub(main.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-primary-700 bg-white border border-gray-200 hover:border-primary-300 rounded-lg transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            中カテゴリ追加
          </button>
          <button onClick={() => onEditMain(main)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-white rounded-lg transition-colors">
            <IconEdit />
          </button>
          <button onClick={() => onDeleteMain(main)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <IconTrash />
          </button>
        </div>
      </div>

      {/* 中カテゴリ一覧 */}
      {isOpen && (
        <div className="px-4 py-2 divide-y divide-gray-50">
          {main.sub_categories.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-400 mb-2">中カテゴリがありません</p>
              <button
                onClick={() => onAddSub(main.id)}
                className="text-sm text-primary-600 hover:underline"
              >
                中カテゴリを追加する
              </button>
            </div>
          ) : (
            main.sub_categories.map(sub => (
              <SubCategorySection
                key={sub.id}
                sub={sub}
                isOpen={expandedSub.has(sub.id)}
                onToggle={() => onToggleSub(sub.id)}
                onEdit={() => onEditSub(sub)}
                onDelete={() => onDeleteSub(sub)}
                onAddItem={() => onAddItem(sub.id)}
                onEditItem={onEditItem}
                onDeleteItem={onDeleteItem}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── フォーム ──────────────────────────────────────────────────────────────────

function MainCatForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  return (
    <div className="space-y-4">
      <div>
        <label className="label">大カテゴリ名</label>
        <input
          className="input-field"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="例：レーザー・光治療"
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>キャンセル</Button>
        <Button variant="primary" onClick={() => onSave({ name })} disabled={!name.trim()}>
          {initial ? '保存' : '追加'}
        </Button>
      </div>
    </div>
  )
}

function SubCatForm({ initial, defaultMainId, mainCategories, onSave, onCancel }) {
  const [mainId, setMainId] = useState(
    defaultMainId || initial?.main_category_id || (mainCategories[0]?.id ?? '')
  )
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')

  return (
    <div className="space-y-4">
      <div>
        <label className="label">大カテゴリ</label>
        <select
          className="input-field"
          value={mainId}
          onChange={e => setMainId(Number(e.target.value))}
        >
          {mainCategories.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">中カテゴリ名</label>
        <input
          className="input-field"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="例：ヒアルロン酸注入"
          autoFocus
        />
      </div>
      <div>
        <label className="label">説明（任意）</label>
        <input
          className="input-field"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="施術の簡単な説明"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>キャンセル</Button>
        <Button
          variant="primary"
          onClick={() => onSave({ main_category_id: mainId, name, description })}
          disabled={!name.trim() || !mainId}
        >
          {initial ? '保存' : '追加'}
        </Button>
      </div>
    </div>
  )
}

function PriceItemForm({ initial, defaultSubId, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    size_or_part: initial?.size_or_part || '',
    price: initial?.price ?? '',
    price_display: initial?.price_display || '',
    sub_category_id: defaultSubId || initial?.sub_category_id || '',
    requires_form: initial?.requires_form || false,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePriceChange = (val) => {
    set('price', val)
    const num = parseInt(val, 10)
    if (!isNaN(num) && num >= 0) {
      set('price_display', `¥${num.toLocaleString()}`)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">施術名</label>
        <input
          className="input-field"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="例：ヒアルロン酸注入"
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">部位・サイズ（任意）</label>
          <input
            className="input-field"
            value={form.size_or_part}
            onChange={e => set('size_or_part', e.target.value)}
            placeholder="例：1本 / 全顔 / 眉間"
          />
        </div>
        <div>
          <label className="label">料金（円）</label>
          <input
            type="number"
            className="input-field"
            value={form.price}
            onChange={e => handlePriceChange(e.target.value)}
            placeholder="55000"
          />
        </div>
      </div>
      <div>
        <label className="label">料金表示テキスト</label>
        <input
          className="input-field"
          value={form.price_display}
          onChange={e => set('price_display', e.target.value)}
          placeholder="例：55,000円（税込）"
        />
        <p className="text-xs text-gray-400 mt-1">料金を入力すると自動入力されます。自由に編集可能です。</p>
      </div>
      <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <div>
          <p className="text-sm font-medium text-amber-800">問診表必須</p>
          <p className="text-xs text-amber-600 mt-0.5">ONにするとLINEで問診表URLを自動案内します</p>
        </div>
        <button
          type="button"
          onClick={() => set('requires_form', !form.requires_form)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${form.requires_form ? 'bg-amber-500' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.requires_form ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>キャンセル</Button>
        <Button
          variant="primary"
          onClick={() => onSave({ ...form, sub_category_id: form.sub_category_id })}
          disabled={!form.name.trim() || !form.price_display.trim()}
        >
          {initial ? '保存' : '追加'}
        </Button>
      </div>
    </div>
  )
}

// ── メインページ ──────────────────────────────────────────────────────────────

export default function MenuManagement() {
  const { user } = useAuth()
  const clinicId = user?.current_clinic_id || 1

  const [tree, setTree] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedMain, setExpandedMain] = useState(new Set())
  const [expandedSub, setExpandedSub] = useState(new Set())
  const [modal, setModal] = useState(null)

  const fetchTree = useCallback(async () => {
    try {
      const res = await api.get(`${API}/price-menu?clinic_id=${clinicId}`)
      setTree(res.data)
    } catch (e) {
      console.error(e)
      setTree([])
    } finally {
      setLoading(false)
    }
  }, [clinicId])

  useEffect(() => {
    setLoading(true)
    fetchTree()
  }, [fetchTree])

  const toggleMain = (id) =>
    setExpandedMain(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleSub = (id) =>
    setExpandedSub(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const totalItems = tree.reduce(
    (sum, m) => sum + m.sub_categories.reduce((s, sub) => s + sub.items.length, 0), 0
  )

  // ── ハンドラ ────────────────────────────────────────────────────────────────

  const run = async (apiFn) => {
    try {
      await apiFn()
      await fetchTree()
      setModal(null)
    } catch (e) {
      console.error(e)
      alert('通信エラーが発生しました。サーバーが起動しているか確認してください。')
    }
  }

  const handleAddMain    = (data)     => run(() => api.post(`${API}/main-categories`, { ...data, clinic_id: clinicId }))
  const handleUpdateMain = (id, data) => run(() => api.put(`${API}/main-categories/${id}`, data))
  const handleDeleteMain = (id)       => run(() => api.delete(`${API}/main-categories/${id}`))

  const handleAddSub    = (data)     => run(() => api.post(`${API}/sub-categories`, data))
  const handleUpdateSub = (id, data) => run(() => api.put(`${API}/sub-categories/${id}`, data))
  const handleDeleteSub = (id)       => run(() => api.delete(`${API}/sub-categories/${id}`))

  const handleAddItem    = (data)     => run(() => api.post(`${API}/price-items`, data))
  const handleUpdateItem = (id, data) => run(() => api.put(`${API}/price-items/${id}`, data))
  const handleDeleteItem = (id)       => run(() => api.delete(`${API}/price-items/${id}`))

  // ── レンダリング ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <InfoBanner storageKey="menu">
        <p>ここでは、クリニックで提供している施術メニューの情報を登録・管理できます。登録した内容はAIが正確な情報源として使用します。「ヒアルロン酸はいくらですか？」と聞かれたとき、AIはここに登録された料金をそのままお客様に回答します。</p>
        <p className="font-semibold mt-1">各設定項目の説明</p>
        <ul className="space-y-1 list-none">
          <li>・<span className="font-medium">メニュー名・料金</span>：施術名と価格を入力します。AIはこの情報をもとに料金の質問に答えます</li>
          <li>・<span className="font-medium">カテゴリ</span>：「注入系」「レーザー」「スキンケア」など、施術の種類を分類します。売上管理でカテゴリ別の分析にも使われます</li>
          <li>・<span className="font-medium">ダウンタイム</span>：施術後に腫れや赤みが続く期間のことです。「翌日から仕事に行けますか？」などの質問にAIが正確に答えるために使います</li>
          <li>・<span className="font-medium">問診表必須</span>：これをオンにすると、その施術を希望されたお客様にAIが自動で問診表URLを送ります。アレルギー確認などが必要な施術に活用してください</li>
          <li>・<span className="font-medium">非公開</span>：一時的に提供を停止したいメニューを隠せます。AIに紹介させたくない施術はここでオフにできます</li>
        </ul>
      </InfoBanner>

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">メニュー管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tree.length}大カテゴリ・{totalItems}件のメニュー
          </p>
        </div>
        <Button variant="primary" onClick={() => setModal({ type: 'add-main' })}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          大カテゴリ追加
        </Button>
      </div>

      {/* ツリー本体 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">読み込み中…</div>
      ) : tree.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400 font-medium">メニューがありません</p>
          <button
            onClick={() => setModal({ type: 'add-main' })}
            className="mt-3 text-sm text-primary-600 hover:underline"
          >
            大カテゴリを追加する
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tree.map(main => (
            <MainCategoryCard
              key={main.id}
              main={main}
              expandedMain={expandedMain}
              expandedSub={expandedSub}
              onToggleMain={toggleMain}
              onToggleSub={toggleSub}
              onEditMain={(m) => setModal({ type: 'edit-main', data: m })}
              onDeleteMain={(m) => setModal({ type: 'delete-main', data: m })}
              onAddSub={(mainId) => setModal({ type: 'add-sub', context: { mainId } })}
              onEditSub={(sub) => setModal({ type: 'edit-sub', data: sub })}
              onDeleteSub={(sub) => setModal({ type: 'delete-sub', data: sub })}
              onAddItem={(subId) => setModal({ type: 'add-item', context: { subId } })}
              onEditItem={(item) => setModal({ type: 'edit-item', data: item })}
              onDeleteItem={(item) => setModal({ type: 'delete-item', data: item })}
            />
          ))}
        </div>
      )}

      {/* ── 大カテゴリ 追加/編集 ── */}
      <Modal
        isOpen={modal?.type === 'add-main' || modal?.type === 'edit-main'}
        onClose={() => setModal(null)}
        title={modal?.type === 'add-main' ? '大カテゴリ追加' : '大カテゴリ編集'}
        size="sm"
      >
        <MainCatForm
          initial={modal?.data}
          onSave={data => {
            if (modal?.type === 'add-main') handleAddMain(data)
            else if (modal?.type === 'edit-main') handleUpdateMain(modal.data.id, data)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* ── 大カテゴリ 削除 ── */}
      <Modal isOpen={modal?.type === 'delete-main'} onClose={() => setModal(null)} title="大カテゴリを削除" size="sm">
        {modal?.data && (
          <div>
            <p className="text-sm text-gray-700 mb-2">「{modal.data.name}」を削除しますか？</p>
            <div className="text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-5 text-amber-700">
              この大カテゴリに含まれる
              <strong> {modal.data.sub_categories?.length || 0}件の中カテゴリ</strong>と
              その下のメニュー項目もすべて削除されます。
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(null)}>キャンセル</Button>
              <Button variant="danger" onClick={() => handleDeleteMain(modal?.data?.id)}>削除する</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── 中カテゴリ 追加/編集 ── */}
      <Modal
        isOpen={modal?.type === 'add-sub' || modal?.type === 'edit-sub'}
        onClose={() => setModal(null)}
        title={modal?.type === 'add-sub' ? '中カテゴリ追加' : '中カテゴリ編集'}
      >
        <SubCatForm
          initial={modal?.data}
          defaultMainId={modal?.context?.mainId}
          mainCategories={tree}
          onSave={data => {
            if (modal?.type === 'add-sub') handleAddSub(data)
            else if (modal?.type === 'edit-sub') handleUpdateSub(modal.data.id, data)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* ── 中カテゴリ 削除 ── */}
      <Modal isOpen={modal?.type === 'delete-sub'} onClose={() => setModal(null)} title="中カテゴリを削除" size="sm">
        {modal?.data && (
          <div>
            <p className="text-sm text-gray-700 mb-2">「{modal.data.name}」を削除しますか？</p>
            <div className="text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-5 text-amber-700">
              この中カテゴリに含まれる
              <strong> {modal.data.items?.length || 0}件のメニュー項目</strong>もすべて削除されます。
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(null)}>キャンセル</Button>
              <Button variant="danger" onClick={() => handleDeleteSub(modal?.data?.id)}>削除する</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── メニュー項目 追加/編集 ── */}
      <Modal
        isOpen={modal?.type === 'add-item' || modal?.type === 'edit-item'}
        onClose={() => setModal(null)}
        title={modal?.type === 'add-item' ? 'メニュー項目追加' : 'メニュー項目編集'}
      >
        <PriceItemForm
          initial={modal?.data}
          defaultSubId={modal?.context?.subId}
          onSave={data => {
            if (modal?.type === 'add-item') handleAddItem(data)
            else if (modal?.type === 'edit-item') handleUpdateItem(modal.data.id, data)
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* ── メニュー項目 削除 ── */}
      <Modal isOpen={modal?.type === 'delete-item'} onClose={() => setModal(null)} title="メニュー項目を削除" size="sm">
        {modal?.data && (
          <div>
            <p className="text-sm text-gray-700 mb-5">
              「{modal.data.name}{modal.data.size_or_part ? ` (${modal.data.size_or_part})` : ''}」を削除しますか？
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(null)}>キャンセル</Button>
              <Button variant="danger" onClick={() => handleDeleteItem(modal?.data?.id)}>削除する</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
