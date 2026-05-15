import React from 'react'
import { useApp } from '../../context/AppContext'
import { Brain, HandshakeIcon, Zap, Target, Settings, Wifi, WifiOff, Database, Building2, ClipboardList, Menu } from 'lucide-react'

const moduleInfo = {
  intelligence: { label: 'Inteligência de Vendas', icon: Brain },
  closing:      { label: 'Fechamento & Proposta',  icon: HandshakeIcon },
  historico:    { label: 'Histórico de Leads',     icon: Database },
  empresa:      { label: 'Nossa Empresa',           icon: Building2 },
  briefing:     { label: 'Briefing de Clientes',   icon: ClipboardList },
  sdr:          { label: 'Ferramentas do SDR',      icon: Zap },
  closer:       { label: 'Ferramentas do Closer',   icon: Target },
  settings:     { label: 'Configurações',           icon: Settings },
}

export default function Header({ onMenuClick }) {
  const { activeModule, apiKey } = useApp()
  const info = moduleInfo[activeModule] || moduleInfo.intelligence
  const Icon = info.icon

  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 flex-shrink-0"
      style={{
        background: 'rgba(8,8,8,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>

      {/* Left — hamburger + title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all -ml-1"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#FFA300]/10 border border-[#FFA300]/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-[#FFA300]" />
          </div>
          <h1 className="text-sm font-semibold text-slate-200 truncate max-w-[140px] sm:max-w-none">{info.label}</h1>
        </div>
      </div>

      {/* Right — status badges */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
          apiKey
            ? 'bg-[#FFA300]/8 border-[#FFA300]/20 text-[#FFA300]'
            : 'bg-white/4 border-white/8 text-slate-500'
        }`}>
          {apiKey ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-[#FFA300] animate-pulse flex-shrink-0" />
            <span className="hidden sm:inline">Gemini</span> conectado</>
          ) : (
            <><WifiOff className="w-3 h-3" /><span className="hidden sm:inline">API</span> ausente</>
          )}
        </div>
      </div>
    </header>
  )
}
