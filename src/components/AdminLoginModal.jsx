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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md animate-fade-in rounded-2xl overflow-hidden"
        style={{ background: '#111111', border: '1px solid rgba(255,163,0,0.2)', boxShadow: '0 0 60px rgba(255,163,0,0.08), 0 24px 48px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center relative" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,163,0,0.1)', border: '1px solid rgba(255,163,0,0.3)' }}
          >
            <Shield className="w-8 h-8 text-[#FFA300]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Acesso Admin</h2>
          <p className="text-sm text-slate-500">Insira suas credenciais para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Usuário</label>
            <input
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="Digite o usuário"
              autoComplete="username"
              autoFocus
              className="input-field text-sm py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Senha</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="Digite a senha"
                autoComplete="current-password"
                className="input-field text-sm py-3 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Usuário ou senha incorretos. Tente novamente.
            </div>
          )}

          <button
            type="submit"
            disabled={!user || !pass}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            style={{ background: 'linear-gradient(135deg, #FFA300, #e69200)', color: '#000', boxShadow: '0 0 20px rgba(255,163,0,0.3)' }}
          >
            <Shield className="w-4 h-4" /> Entrar como Admin
          </button>
        </form>
      </div>
    </div>
  )
}
