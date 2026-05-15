import React, { useState } from 'react'
import { Shield, Eye, EyeOff, X, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function AdminLoginModal({ onClose }) {
  const { adminLogin } = useApp()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (adminLogin(user, pass)) {
      onClose()
    } else {
      setError(true)
      setPass('')
      setTimeout(() => setError(false), 3000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card w-full max-w-sm p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,163,0,0.1)', border: '1px solid rgba(255,163,0,0.3)' }}>
              <Shield className="w-4 h-4 text-[#FFA300]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Acesso Admin</p>
              <p className="text-xs text-slate-500 mt-0.5">Área restrita</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Usuário</label>
            <input
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="Usuário"
              autoComplete="username"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="input-field pr-10"
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Usuário ou senha incorretos.
            </div>
          )}

          <button type="submit" disabled={!user || !pass} className="btn-primary w-full mt-1 disabled:opacity-40">
            <Shield className="w-4 h-4" /> Entrar como Admin
          </button>
        </form>
      </div>
    </div>
  )
}
