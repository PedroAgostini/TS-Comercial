import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import {
  Settings, Brain, HandshakeIcon, Target, Zap,
  ChevronRight, Database, Cloud, Building2, ClipboardList, X,
  Shield, LogOut, Lock,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import AdminLoginModal from '../AdminLoginModal'

// Full catalog of all possible nav items (source of truth for labels/icons)
const NAV_CATALOG = {
  intelligence: { label: 'Inteligência de Vendas', icon: Brain,         desc: 'Persona + SPIN' },
  closing:      { label: 'Fechamento & Proposta',  icon: HandshakeIcon, desc: 'Plano de ação' },
  briefing:     { label: 'Briefing de Clientes',   icon: ClipboardList, desc: 'Onboarding do cliente' },
  historico:    { label: 'Histórico de Leads',     icon: Database,      desc: 'Leads salvos' },
  sdr:          { label: 'Ferramentas SDR',         icon: Zap,           desc: 'Prospecção' },
  closer:       { label: 'Ferramentas Closer',      icon: Target,        desc: 'Fechamento' },
  empresa:      { label: 'Nossa Empresa',           icon: Building2,     desc: 'Contexto para IA' },
  settings:     { label: 'Configurações',           icon: Settings,      desc: 'IA + Banco de Dados', muted: true },
}

const NAV_ADMIN_ORDER = ['intelligence','closing','briefing','historico','sdr','closer','empresa','settings']

function DbBadge() {
  const { dbConnected, saveStatus } = useApp()
  const saving = saveStatus === 'saving'
  const saved  = saveStatus === 'saved'
  const err    = saveStatus === 'error'

  if (!dbConnected) return (
    <p className="text-xs text-slate-700 mt-0.5 flex items-center gap-1.5">
      <Cloud className="w-3 h-3" /> Sem banco de dados
    </p>
  )
  return (
    <p className={`text-xs mt-0.5 flex items-center gap-1.5 transition-colors ${
      err ? 'text-slate-400' : 'text-[#FFA300]'
    }`}>
      <Database className="w-3 h-3" />
      {saving ? 'Salvando...' : saved ? 'Salvo!' : err ? 'Erro ao salvar' : 'DB conectado'}
    </p>
  )
}

export default function Sidebar({ open, onClose }) {
  const { activeModule, setActiveModule, isAdmin, adminLogout, navConfig } = useApp()
  const [showLogin, setShowLogin] = useState(false)

  const nav = isAdmin
    ? NAV_ADMIN_ORDER.map(id => ({ id, ...NAV_CATALOG[id] }))
    : navConfig
        .filter(item => item.visible)
        .map(item => ({ id: item.id, ...NAV_CATALOG[item.id] }))
        .filter(item => item.label) // skip unknown ids

  const handleNav = (id) => {
    setActiveModule(id)
    onClose()
  }

  return (
    <aside className={`
      fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
      w-64 flex-shrink-0 flex flex-col
      border-r border-white/5
      transition-transform duration-300 ease-out
      ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}
    style={{
      background: 'linear-gradient(180deg, #0a0a0a 0%, #080808 100%)',
      height: '100dvh',
    }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
              style={{
                background: 'linear-gradient(135deg, #1a1000 0%, #0f0800 100%)',
                border: '1px solid rgba(255,163,0,0.3)',
                boxShadow: '0 0 20px rgba(255,163,0,0.12)',
              }}>
              <img src="/logo-ts.svg" alt="TS" className="w-7 h-6 object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none tracking-wide">TS</p>
              <p className="text-xs mt-0.5 font-semibold" style={{ color: '#FFA300' }}>Comercial</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const Icon = item.icon
          const active = activeModule === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`nav-item group ${active ? 'nav-item-active' : ''}`}
            >
              {/* Icon container */}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200
                ${active
                  ? 'bg-[#FFA300]/15 border border-[#FFA300]/30'
                  : 'bg-transparent border border-transparent group-hover:bg-white/4 group-hover:border-white/6'
                }
              `}>
                <Icon className={`w-3.5 h-3.5 transition-colors ${
                  active ? 'text-[#FFA300]'
                  : item.muted ? 'text-slate-600 group-hover:text-slate-400'
                  : 'text-slate-600 group-hover:text-slate-400'
                }`} />
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-xs font-semibold leading-none truncate transition-colors ${
                  active ? 'text-white'
                  : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                  {item.label}
                </p>
                <p className={`text-xs mt-0.5 truncate transition-colors ${
                  active ? 'text-[#FFA300]/70'
                  : 'text-slate-700 group-hover:text-slate-600'
                }`}>
                  {item.desc}
                </p>
              </div>

              {active && <ChevronRight className="w-3 h-3 text-[#FFA300]/50 flex-shrink-0" />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5 flex-shrink-0 safe-bottom">
        <DbBadge />
        <p className="text-xs text-slate-500 mt-2">Developed by <span className="text-[#FFA300] font-semibold">Pedro Agostini</span></p>
        <p className="text-xs text-slate-700 font-medium mt-1">EuSouTS © {new Date().getFullYear()}</p>

        <div className="mt-3 pt-3 border-t border-white/5">
          {isAdmin ? (
            <div
              className="flex items-center justify-between px-3 py-2 rounded-xl border"
              style={{ background: 'rgba(255,163,0,0.08)', borderColor: 'rgba(255,163,0,0.25)' }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#FFA300]" />
                <span className="text-xs text-[#FFA300] font-semibold">Admin ativo</span>
              </div>
              <button
                onClick={adminLogout}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3 h-3" /> Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: 'rgba(255,163,0,0.08)',
                border: '1px solid rgba(255,163,0,0.2)',
                color: '#FFA300',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,163,0,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,163,0,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,163,0,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,163,0,0.2)' }}
            >
              <Shield className="w-3.5 h-3.5" />
              Entrar como Admin
            </button>
          )}
        </div>
      </div>

      {showLogin && ReactDOM.createPortal(
        <AdminLoginModal onClose={() => setShowLogin(false)} />,
        document.body
      )}
    </aside>
  )
}
