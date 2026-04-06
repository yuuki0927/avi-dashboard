import React, { useState } from 'react'
import { useClinic } from '../context/ClinicContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

const EMPTY_FORM = {
  name: '', address: '', mapLink: '', hours: '', closedDays: '', phone: '', email: '',
}

function ClinicForm({ form, setForm, onSave, onCancel, saveLabel }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="space-y-4">
      <div>
        <label className="label">クリニック名 <span className="text-red-400">*</span></label>
        <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="例：メディアージュクリニック大阪梅田院" />
      </div>
      <div>
        <label className="label">住所</label>
        <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} placeholder="例：大阪府大阪市北区梅田1-1-1" />
      </div>
      <div>
        <label className="label">Google マップ URL</label>
        <input className="input-field" value={form.mapLink} onChange={e => set('mapLink', e.target.value)} placeholder="https://maps.google.com/?q=..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">営業時間</label>
          <input className="input-field" value={form.hours} onChange={e => set('hours', e.target.value)} placeholder="10:00〜19:00" />
        </div>
        <div>
          <label className="label">定休日</label>
          <input className="input-field" value={form.closedDays} onChange={e => set('closedDays', e.target.value)} placeholder="不定休" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">電話番号</label>
          <input className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="06-0000-0000" />
        </div>
        <div>
          <label className="label">メールアドレス</label>
          <input className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="clinic@mediage.jp" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel}>キャンセル</Button>
        <Button variant="primary" onClick={onSave} disabled={!form.name.trim()}>{saveLabel}</Button>
      </div>
    </div>
  )
}

export default function ClinicsManagement() {
  const { clinicList, selectedClinic, switchClinic, updateClinic, addClinic, deleteClinic } = useClinic()
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setShowAdd(true)
  }

  const openEdit = (clinic) => {
    setEditTarget(clinic)
    setForm({
      name: clinic.name || '',
      address: clinic.address || '',
      mapLink: clinic.mapLink || '',
      hours: clinic.hours || '',
      closedDays: clinic.closedDays || '',
      phone: clinic.phone || '',
      email: clinic.email || '',
    })
  }

  const handleAdd = () => {
    addClinic(form)
    setShowAdd(false)
  }

  const handleEdit = () => {
    updateClinic({ ...editTarget, ...form })
    setEditTarget(null)
  }

  const handleDelete = () => {
    deleteClinic(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">全クリニック管理</h1>
          <p className="text-sm text-gray-500 mt-1">{clinicList.length}件のクリニック</p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          クリニック追加
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {clinicList.map(clinic => {
          const isSelected = selectedClinic.id === clinic.id
          return (
            <Card key={clinic.id} className={`p-5 ${isSelected ? 'ring-2 ring-primary-500' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{clinic.name}</h3>
                    {isSelected && (
                      <span className="text-xs text-primary-600 font-medium">現在選択中</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!isSelected && (
                    <button
                      onClick={() => switchClinic(clinic.id)}
                      className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-primary-600 border border-gray-200 hover:border-primary-300 rounded-lg transition-colors"
                    >
                      切り替え
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(clinic)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(clinic)}
                    disabled={clinicList.length <= 1}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={clinicList.length <= 1 ? 'クリニックは1件以上必要です' : '削除'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <dl className="space-y-1.5 text-xs text-gray-500">
                {clinic.address && (
                  <div className="flex gap-2">
                    <dt className="flex-shrink-0 font-medium text-gray-400 w-16">住所</dt>
                    <dd className="text-gray-700">{clinic.address}</dd>
                  </div>
                )}
                {clinic.hours && (
                  <div className="flex gap-2">
                    <dt className="flex-shrink-0 font-medium text-gray-400 w-16">営業時間</dt>
                    <dd className="text-gray-700">{clinic.hours}</dd>
                  </div>
                )}
                {clinic.closedDays && (
                  <div className="flex gap-2">
                    <dt className="flex-shrink-0 font-medium text-gray-400 w-16">定休日</dt>
                    <dd className="text-gray-700">{clinic.closedDays}</dd>
                  </div>
                )}
                {clinic.phone && (
                  <div className="flex gap-2">
                    <dt className="flex-shrink-0 font-medium text-gray-400 w-16">電話</dt>
                    <dd className="text-gray-700">{clinic.phone}</dd>
                  </div>
                )}
                {clinic.email && (
                  <div className="flex gap-2">
                    <dt className="flex-shrink-0 font-medium text-gray-400 w-16">メール</dt>
                    <dd className="text-gray-700">{clinic.email}</dd>
                  </div>
                )}
                {clinic.mapLink && (
                  <div className="flex gap-2">
                    <dt className="flex-shrink-0 font-medium text-gray-400 w-16">マップ</dt>
                    <dd>
                      <a href={clinic.mapLink} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                        Google マップを開く
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          )
        })}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="クリニック追加" size="lg">
        <ClinicForm form={form} setForm={setForm} onSave={handleAdd} onCancel={() => setShowAdd(false)} saveLabel="追加" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="クリニック編集" size="lg">
        <ClinicForm form={form} setForm={setForm} onSave={handleEdit} onCancel={() => setEditTarget(null)} saveLabel="保存" />
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="削除の確認" size="sm">
        {deleteTarget && (
          <div>
            <p className="text-sm text-gray-700 mb-2">以下のクリニックを削除しますか？この操作は取り消せません。</p>
            <p className="font-semibold text-gray-900 mb-5">「{deleteTarget.name}」</p>
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
