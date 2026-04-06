import React from 'react'

export default function Button({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false }) {
  const variants = {
    primary: 'inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50',
    secondary: 'inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50',
    danger: 'inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50',
    ghost: 'inline-flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50',
    accent: 'inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors text-sm font-medium disabled:opacity-50',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
