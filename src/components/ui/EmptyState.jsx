import React from 'react'

export default function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-hover border border-surface-border flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-600" />
      </div>
      <h3 className="text-sm font-semibold text-slate-400 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 max-w-xs mb-5">{desc}</p>
      {action}
    </div>
  )
}
