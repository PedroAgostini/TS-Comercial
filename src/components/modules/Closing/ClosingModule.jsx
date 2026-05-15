import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import {
  HandshakeIcon,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  FileDown,
  Save,
  User,
  ChevronDown,
  Database,
} from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { generateProposal } from '../../../services/geminiService'
import { fetchLeads } from '../../../services/dbService'
import Spinner from '../../ui/Spinner'

// ─── Arrow-list field ─────────────────────────────────────────────────────────
function DocField({ emoji, label, value }) {
  if (!value) return null
  const lines = Array.isArray(value)
    ? value
    : String(value).split('\n\n').filter(Boolean)

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-slate-100 flex items-start gap-2">
        <span className="flex-shrink-0 leading-snug">{emoji}</span>
        <span>{label}:</span>
      </p>
      <div className="pl-6 space-y-1">
        {lines.map((line, i) => (
          <p key={i} className="text-sm text-slate-300 leading-relaxed flex gap-2">
            <span className="text-slate-600 flex-shrink-0">➡️</span>
            <span>{line}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

// ─── Document section block ───────────────────────────────────────────────────
function DocSection({ emoji, title, color, bg, border, children }) {
  const hasContent = React.Children.toArray(children).some(c => c !== null && c !== false && c !== undefined)
  if (!hasContent) return null

  return (
    <div className={`rounded-xl border ${border} overflow-hidden`}>
      <div className={`flex items-center gap-2.5 px-4 py-2.5 ${bg}`}>
        <span className="text-base leading-none">{emoji}</span>
        <h3 className={`text-xs font-bold tracking-wider uppercase ${color}`}>{title}</h3>
      </div>
      <div className="px-4 py-4 space-y-4 divide-y divide-surface-border/40">
        {React.Children.map(children, child =>
          child ? <div className="pt-4 first:pt-0">{child}</div> : null
        )}
      </div>
    </div>
  )
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handle} className="btn-ghost text-xs py-1 px-2">
      {copied
        ? <><Check className="w-3 h-3 text-[#FFA300]" /> Copiado</>
        : <><Copy className="w-3 h-3" /> Copiar</>}
    </button>
  )
}

// ─── PDF view (portal) ────────────────────────────────────────────────────────
function ClosingPDFView({ proposal, leadData }) {
  if (!proposal) return null
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  const renderLines = (value) => {
    if (!value) return null
    const lines = Array.isArray(value) ? value : String(value).split('\n\n').filter(Boolean)
    return lines.map((line, i) => (
      <p key={i} style={{ fontSize: '11px', color: '#1f2937', margin: '2px 0 2px 16px', lineHeight: 1.6 }}>
        ➡️ {line}
      </p>
    ))
  }

  const PDFSection = ({ emoji, title, fields }) => {
    const visible = fields.filter(([,, v]) => v && (Array.isArray(v) ? v.length > 0 : String(v).trim()))
    if (!visible.length) return null
    return (
      <div style={{ marginBottom: '22px', pageBreakInside: 'avoid' }}>
        <h2 style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 10px', padding: '5px 0', borderBottom: '1px solid #e5e7eb' }}>
          {emoji} {title}
        </h2>
        {visible.map(([dotEmoji, label, value]) => (
          <div key={label} style={{ marginBottom: '10px', pageBreakInside: 'avoid' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 3px', color: '#374151' }}>
              {dotEmoji} {label}:
            </p>
            {renderLines(value)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div id="closing-pdf" style={{ display: 'none', padding: '36px', background: 'white', color: '#111827', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ borderBottom: '3px solid #FFA300', paddingBottom: '12px', marginBottom: '24px' }}>
        <p style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 4px', lineHeight: 1.4 }}>
          {(leadData.name || leadData.niche || 'LEAD').toUpperCase()} - Briefing para a Operação
        </p>
        <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>EuSouTS · Trajetória do Sucesso · {today}</p>
      </div>

      <PDFSection emoji="📋" title="VISÃO GERAL" fields={[
        ['🟠', 'Resumo do Negócio', proposal.briefing?.resumoNegocio],
        ['🟠', 'Situação Atual do Digital', proposal.briefing?.situacaoAtual],
      ]} />

      <PDFSection emoji="🎯" title="ESTRATÉGIA & AÇÃO" fields={[
        ['🟢', 'Prioridades Operacionais', proposal.briefing?.prioridades],
        ['🔴', 'Alertas para a Equipe', proposal.briefing?.alertas],
        ['⚫', 'Próximos Passos', proposal.briefing?.proximosPassos],
      ]} />

      <PDFSection emoji="📊" title="METAS" fields={[
        ['🟣', 'Metas - 3 Meses', proposal.metas?.mes3],
        ['🟣', 'Metas - 6 Meses', proposal.metas?.mes6],
      ]} />

      <PDFSection emoji="💡" title="FECHAMENTO" fields={[
        ['🟡', 'Justificativa para o Closer', proposal.justificativa],
        ['🔴', 'Pontos Críticos do Onboarding', proposal.pontosCriticos],
      ]} />

      <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '10px', fontSize: '9px', color: '#9ca3af', textAlign: 'center' }}>
        Gerado por TS Comercial · EuSouTS · Trajetória do Sucesso · {today}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClosingModule() {
  const {
    apiKey, aiModel,
    persona, leadData,
    spinQuestions,
    companyContext,
    customPrompts,
    briefing,
    proposal, setProposal,
    loadingProposal, setLoadingProposal,
    saveLeadToDb, saveStatus,
    dbConnected, dbColumnsOk, currentLeadId, loadLeadFromDb,
    setActiveModule,
  } = useApp()

  const [error, setError] = useState('')
  const [leads, setLeads] = useState([])
  const [loadingLeads, setLoadingLeads] = useState(false)

  useEffect(() => {
    if (!dbConnected) return
    setLoadingLeads(true)
    fetchLeads()
      .then(data => setLeads(data))
      .catch(() => {})
      .finally(() => setLoadingLeads(false))
  }, [dbConnected])

  const handleSelectLead = (id) => {
    const lead = leads.find(l => l.id === id)
    if (lead) loadLeadFromDb(lead)
  }

  const answeredCount = spinQuestions.filter(q => q.answer?.trim()).length
  const hasDossier = persona && spinQuestions.length > 0

  const handleGenerate = async () => {
    if (!apiKey) { setError('Configure a API Key nas Configurações.'); return }
    if (!persona) { setError('Gere primeiro o Dossiê na aba Inteligência de Vendas.'); return }
    setError('')
    setLoadingProposal(true)
    try {
      const result = await generateProposal(apiKey, aiModel, {
        persona, leadData, spinQuestions, companyContext,
      }, customPrompts)
      setProposal(result)
      await saveLeadToDb({
        name: leadData.name || leadData.niche || 'Lead',
        proposal: result,
        briefing,
      })
    } catch (err) {
      setError(`Erro ao gerar proposta: ${err.message}`)
    } finally {
      setLoadingProposal(false)
    }
  }

  return (
    <>
      {ReactDOM.createPortal(<ClosingPDFView proposal={proposal} leadData={leadData} />, document.body)}

      <div className="px-4 py-4 sm:p-6 max-w-3xl mx-auto space-y-4 sm:space-y-5 animate-fade-in print:hidden">

        {/* Client selector */}
        {dbConnected ? (
          <div className="glass-card p-4">
            <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Selecionar Cliente
            </label>
            <div className="relative">
              <select
                value={currentLeadId || ''}
                onChange={e => handleSelectLead(e.target.value)}
                disabled={loadingLeads}
                className="input-field appearance-none pr-9"
              >
                <option value="">
                  {loadingLeads ? 'Carregando clientes...' : leads.length === 0 ? 'Nenhum cliente salvo' : '- Selecione um cliente -'}
                </option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {[l.name, l.niche].filter(Boolean).join(' - ') || 'Lead sem nome'}
                    {l.state ? ` · ${l.state}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            {currentLeadId && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${persona ? 'bg-[#FFA300]' : 'bg-[#FFA300]'}`} />
                <span className={persona ? 'text-[#FFA300]' : 'text-[#FFA300]'}>
                  {persona ? 'Dossiê disponível' : 'Sem dossiê - gere na aba Inteligência de Vendas'}
                </span>
                {leadData.niche && <span className="text-slate-600">· {leadData.niche}</span>}
                {leadData.state && <span className="text-slate-600">· {leadData.state}</span>}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card p-4 flex items-center gap-3">
            <Database className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <p className="text-xs text-slate-500">
              Banco de dados não conectado.{' '}
              <button onClick={() => setActiveModule('settings')} className="text-[#FFA300] hover:text-[#FFA300]">
                Configure o Supabase
              </button>
              {' '}para selecionar clientes salvos.
            </p>
          </div>
        )}

        {/* Columns missing warning */}
        {dbConnected && dbColumnsOk === false && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FFA300]/10 border border-[#FFA300]/25 text-[#FFA300] text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Banco desatualizado:</strong> as colunas <em>proposal</em> e <em>briefing</em> não existem.
              A proposta gerada <strong>não será salva</strong> no histórico até você executar o script
              {' '}<strong>ALTER TABLE</strong> nas <button onClick={() => setActiveModule('settings')} className="underline text-[#FFA300] hover:text-white">Configurações</button>.
            </span>
          </div>
        )}

        {/* No dossier state */}
        {!hasDossier && (
          <div className="glass-card p-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FFA300]/10 border border-[#FFA300]/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-[#FFA300]" />
            </div>
            <p className="text-sm font-semibold text-slate-300 mb-1">
              {currentLeadId ? 'Cliente sem dossiê' : 'Nenhum cliente selecionado'}
            </p>
            <p className="text-xs text-slate-500 max-w-xs mb-5">
              {currentLeadId
                ? 'Este cliente não tem Dossiê gerado. Vá para Inteligência de Vendas para criá-lo.'
                : 'Selecione um cliente acima ou crie um novo na aba Inteligência de Vendas.'}
            </p>
            <button onClick={() => setActiveModule('intelligence')} className="btn-primary">
              <ArrowRight className="w-4 h-4" /> Ir para Inteligência de Vendas
            </button>
          </div>
        )}

        {/* Generate card */}
        {hasDossier && <div className="card-glow p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <HandshakeIcon className="w-5 h-5 text-[#FFA300]" />
            <h2 className="text-sm font-semibold text-slate-100">Gerar Proposta & Briefing para Operação</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            <div className="px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg bg-surface border border-surface-border text-center">
              <p className="text-xs text-slate-500 mb-0.5 sm:mb-1">Lead</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">{leadData.name || leadData.niche || '-'}</p>
            </div>
            <div className="px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg bg-surface border border-surface-border text-center">
              <p className="text-xs text-slate-500 mb-0.5 sm:mb-1">SPIN</p>
              <p className={`text-xs sm:text-sm font-semibold ${answeredCount > 0 ? 'text-[#FFA300]' : 'text-slate-500'}`}>
                {answeredCount}/{spinQuestions.length}
              </p>
            </div>
            <div className="px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg bg-surface border border-surface-border text-center">
              <p className="text-xs text-slate-500 mb-0.5 sm:mb-1">Empresa</p>
              <p className={`text-xs sm:text-sm font-semibold ${companyContext?.services ? 'text-[#FFA300]' : 'text-slate-500'}`}>
                {companyContext?.services ? '✓ Ok' : 'Pendente'}
              </p>
            </div>
          </div>

          {answeredCount === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FFA300]/10 border border-[#FFA300]/20 text-[#FFA300] text-xs mb-3">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Nenhuma resposta do SPIN registrada. A proposta será baseada apenas no perfil do lead.
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-slate-300 text-sm mb-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={loadingProposal} className="btn-primary">
            {loadingProposal
              ? <><Spinner size="sm" /> Analisando e gerando proposta...</>
              : <><Sparkles className="w-4 h-4" /> Gerar Proposta e Briefing</>}
          </button>
        </div>}

        {/* Loading */}
        {loadingProposal && (
          <div className="glass-card p-10 flex flex-col items-center text-center gap-4 animate-fade-in">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-[#FFA300]/10 border border-[#FFA300]/20 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#FFA300] animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border border-[#FFA300]/20 animate-ping" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Analisando contexto e gerando proposta...</p>
              <p className="text-xs text-slate-500 mt-1">A IA está analisando tudo para montar a proposta ideal</p>
            </div>
          </div>
        )}

        {/* Document-style briefing output */}
        {proposal && !loadingProposal && (
          <div className="glass-card overflow-hidden border border-[#FFA300]/20 animate-fade-in">

            {/* Doc header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#FFA300]/5 border-b border-[#FFA300]/15">
              <div>
                <p className="text-sm font-bold text-slate-100">
                  {(leadData.name || leadData.niche || 'LEAD').toUpperCase()} - Briefing para a Operação
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Gerado com base no SPIN + Persona</p>
              </div>
              <CopyButton text={buildBriefingText(proposal, leadData)} />
            </div>

            {/* Sections */}
            <div className="p-5 space-y-4">

              <DocSection emoji="📋" title="VISÃO GERAL" color="text-[#FFA300]" bg="bg-[#FFA300]/10" border="border-[#FFA300]/20">
                <DocField emoji="🟠" label="Resumo do Negócio" value={proposal.briefing?.resumoNegocio} />
                <DocField emoji="🟠" label="Situação Atual do Digital" value={proposal.briefing?.situacaoAtual} />
              </DocSection>

              <DocSection emoji="🎯" title="ESTRATÉGIA & AÇÃO" color="text-[#FFA300]" bg="bg-[#FFA300]/10" border="border-[#FFA300]/20">
                <DocField emoji="🟢" label="Prioridades Operacionais" value={proposal.briefing?.prioridades} />
                <DocField emoji="🔴" label="Alertas para a Equipe" value={proposal.briefing?.alertas} />
                <DocField emoji="⚫" label="Próximos Passos" value={proposal.briefing?.proximosPassos} />
              </DocSection>

              <DocSection emoji="📊" title="METAS" color="text-[#FFA300]" bg="bg-[#FFA300]/10" border="border-[#FFA300]/20">
                <DocField emoji="🟣" label="Metas - 3 Meses" value={proposal.metas?.mes3} />
                <DocField emoji="🟣" label="Metas - 6 Meses" value={proposal.metas?.mes6} />
              </DocSection>

              <DocSection emoji="💡" title="FECHAMENTO" color="text-[#FFA300]" bg="bg-[#FFA300]/10" border="border-[#FFA300]/20">
                <DocField emoji="🟡" label="Justificativa para o Closer usar na call" value={proposal.justificativa} />
                <DocField emoji="🔴" label="Pontos Críticos do Onboarding" value={proposal.pontosCriticos} />
              </DocSection>

            </div>

            {/* Export footer */}
            <div className="flex items-center justify-between gap-2 px-5 py-3.5 bg-black/40 border-t border-surface-border">
              <div className="flex items-center gap-2">
                {dbConnected ? (
                  <>
                    <button
                      onClick={() => saveLeadToDb({ name: leadData.name || leadData.niche || 'Lead', proposal, briefing })}
                      disabled={saveStatus === 'saving'}
                      className="btn-ghost text-xs py-1.5 border border-surface-border disabled:opacity-50"
                    >
                      {saveStatus === 'saving'
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Save className="w-3.5 h-3.5" />}
                      {saveStatus === 'saved' ? 'Salvo no Histórico!' : 'Salvar no Histórico'}
                    </button>
                    {saveStatus === 'error' && <span className="text-xs text-slate-300">Erro ao salvar</span>}
                  </>
                ) : (
                  <span className="text-xs text-slate-600">Configure o banco de dados para salvar</span>
                )}
              </div>
              <button onClick={() => window.print()} className="btn-primary">
                <FileDown className="w-4 h-4" /> Exportar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Plain-text copy format ───────────────────────────────────────────────────
function buildBriefingText(proposal, leadData) {
  const header = `${(leadData.name || leadData.niche || 'LEAD').toUpperCase()} - Briefing para a Operação`
  const today = new Date().toLocaleDateString('pt-BR')

  const field = (emoji, label, value) => {
    if (!value) return ''
    const lines = Array.isArray(value) ? value : String(value).split('\n\n').filter(Boolean)
    return `\n${emoji} ${label}:\n${lines.map(l => `➡️ ${l}`).join('\n')}`
  }

  return `${header}
EuSouTS · ${today}

📋 VISÃO GERAL
${field('🟠', 'Resumo do Negócio', proposal.briefing?.resumoNegocio)}
${field('🟠', 'Situação Atual do Digital', proposal.briefing?.situacaoAtual)}

🎯 ESTRATÉGIA & AÇÃO
${field('🟢', 'Prioridades Operacionais', proposal.briefing?.prioridades)}
${field('🔴', 'Alertas para a Equipe', proposal.briefing?.alertas)}
${field('⚫', 'Próximos Passos', proposal.briefing?.proximosPassos)}

📊 METAS
${field('🟣', 'Metas - 3 Meses', proposal.metas?.mes3)}
${field('🟣', 'Metas - 6 Meses', proposal.metas?.mes6)}

💡 FECHAMENTO
${field('🟡', 'Justificativa para o Closer', proposal.justificativa)}
${field('🔴', 'Pontos Críticos do Onboarding', proposal.pontosCriticos)}
`.trim()
}
