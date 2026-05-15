import React, { useState, useCallback } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import SettingsModule from './components/modules/Settings/SettingsModule'
import SalesIntelligenceModule from './components/modules/SalesIntelligence/SalesIntelligenceModule'
import ClosingModule from './components/modules/Closing/ClosingModule'
import SDRToolboxModule from './components/modules/SDRToolbox/SDRToolboxModule'
import CloserToolboxModule from './components/modules/CloserToolbox/CloserToolboxModule'
import HistoricoModule from './components/modules/Historico/HistoricoModule'
import EmpresaModule from './components/modules/Empresa/EmpresaModule'
import BriefingModule from './components/modules/Briefing/BriefingModule'

function MainContent() {
  const { activeModule } = useApp()
  const modules = {
    intelligence: SalesIntelligenceModule,
    closing: ClosingModule,
    historico: HistoricoModule,
    empresa: EmpresaModule,
    briefing: BriefingModule,
    sdr: SDRToolboxModule,
    closer: CloserToolboxModule,
    settings: SettingsModule,
  }
  const Module = modules[activeModule] || SalesIntelligenceModule
  return (
    <div className="flex-1 overflow-y-auto">
      <Module />
    </div>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <AppProvider>
      <div className="flex h-screen bg-[#080808] overflow-hidden">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={closeSidebar}
          />
        )}

        <Sidebar open={sidebarOpen} onClose={closeSidebar} />

        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setSidebarOpen(v => !v)} />
          <MainContent />
        </div>
      </div>
    </AppProvider>
  )
}
