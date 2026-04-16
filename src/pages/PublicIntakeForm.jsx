import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function PublicIntakeForm() {
  const { token } = useParams()
  const [form, setForm]       = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch(`${BASE}/api/public/intake-form/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.form) setForm(d.form)
        else setError('フォームが見つかりません')
      })
      .catch(() => setError('フォームの読み込みに失敗しました'))
      .finally(() => setLoading(false))
  }, [token])

  const handleChange = (label, value) => {
    setAnswers(prev => ({ ...prev, [label]: value }))
  }

  const handleCheckbox = (label, option, checked) => {
    setAnswers(prev => {
      const current = Array.isArray(prev[label]) ? prev[label] : []
      return {
        ...prev,
        [label]: checked ? [...current, option] : current.filter(v => v !== option)
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // 必須チェック
    for (const field of (form.fields || [])) {
      if (field.required) {
        const val = answers[field.label]
        if (!val || (Array.isArray(val) && val.length === 0)) {
          setError(`「${field.label}」は必須項目です`)
          return
        }
      }
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`${BASE}/api/intake-form/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: Number(clinicId), answers })
      })
      const data = await res.json()
      if (data.ok) setSubmitted(true)
      else setError(data.error || '送信に失敗しました')
    } catch {
      setError('送信に失敗しました。もう一度お試しください')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">読み込み中...</p>
    </div>
  )

  if (error && !form) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <p className="text-red-500 text-sm text-center">{error}</p>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">送信が完了しました</h2>
        <p className="text-sm text-gray-500">問診表のご記入ありがとうございます。<br />記入完了後にカウンセリング予約のご案内をいたします。</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h1 className="text-lg font-bold text-gray-800">{form.title || '問診表'}</h1>
          {form.description && (
            <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{form.description}</p>
          )}
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-3">
            {(form.fields || []).map((field, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <FieldInput
                  field={field}
                  value={answers[field.label]}
                  onChange={handleChange}
                  onCheckbox={handleCheckbox}
                />
              </div>
            ))}
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full py-3.5 rounded-xl bg-indigo-600 text-white font-medium text-sm
              hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '送信中...' : '送信する'}
          </button>
        </form>
      </div>
    </div>
  )
}

function FieldInput({ field, value, onChange, onCheckbox }) {
  const { label, field_type, options = [] } = field
  const optList = Array.isArray(options) ? options : []

  if (field_type === 'textarea') {
    return (
      <textarea
        rows={3}
        value={value || ''}
        onChange={e => onChange(label, e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        placeholder="ご記入ください"
      />
    )
  }

  if (field_type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={e => onChange(label, e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
      >
        <option value="">選択してください</option>
        {optList.map((o, i) => <option key={i} value={o}>{o}</option>)}
      </select>
    )
  }

  if (field_type === 'radio') {
    return (
      <div className="space-y-2">
        {optList.map((o, i) => (
          <label key={i} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name={label}
              value={o}
              checked={value === o}
              onChange={() => onChange(label, o)}
              className="accent-indigo-600"
            />
            <span className="text-sm text-gray-700">{o}</span>
          </label>
        ))}
      </div>
    )
  }

  if (field_type === 'checkbox') {
    const checked = Array.isArray(value) ? value : []
    return (
      <div className="space-y-2">
        {optList.map((o, i) => (
          <label key={i} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checked.includes(o)}
              onChange={e => onCheckbox(label, o, e.target.checked)}
              className="accent-indigo-600"
            />
            <span className="text-sm text-gray-700">{o}</span>
          </label>
        ))}
      </div>
    )
  }

  if (field_type === 'date') {
    return (
      <input
        type="date"
        value={value || ''}
        onChange={e => onChange(label, e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
    )
  }

  // text (default)
  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(label, e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      placeholder="ご記入ください"
    />
  )
}
