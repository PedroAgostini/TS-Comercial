import React, { useState, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import {
  Database, RefreshCw, Trash2, FolderOpen, User, Building2, MapPin,
  Calendar, CheckCircle2, Circle, AlertCircle, WifiOff, Loader2, Search,
  Brain, MessageSquare, HandshakeIcon, ClipboardList,
  ChevronDown, ChevronUp, Heart, Target, Sparkles, X, Eye,
} from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { fetchLeads, deleteLead } from '../../../services/dbService'

// ─── Constants ────────────────────────────────────────────────────────────────

const SPIN_CATEGORIES = {
  situacao:    { label: 'Situação',    letter: 'S', color: 'text-[#FFA300]',    bg: 'bg-[#FFA300]/10',    border: 'border-[#FFA300]/20' },
  problema:    { label: 'Problema',    letter: 'P', color: 'text-[#FFA300]',    bg: 'bg-[#FFA300]/10',    border: 'border-[#FFA300]/20' },
  implicacao:  { label: 'Implicação',  letter: 'I', color: 'text-[#FFA300]',   bg: 'bg-[#FFA300]/10',   border: 'border-[#FFA300]/20' },
  necessidade: { label: 'Necessidade', letter: 'N', color: 'text-[#FFA300]', bg: 'bg-[#FFA300]/10', border: 'border-[#FFA300]/20' },
}

const BRIEFING_SECTIONS = {
  geral:     { emoji: '📋', title: 'Perguntas Gerais', dot: '🟠' },
  empresa:   { emoji: '🏢', title: 'Sobre a Empresa',  dot: '🟠' },
  servicos:  { emoji: '🛠️', title: 'Sobre os Serviços', dot: '⚫' },
  publico:   { emoji: '👥', title: 'Público',           dot: '🟤' },
  design:    { emoji: '🎨', title: 'Design e Branding', dot: '🔴' },
  webdesign: { emoji: '🌐', title: 'Webdesign',         dot: '🟣' },
  social:    { emoji: '📱', title: 'Social Media',      dot: '🟢' },
  trafego:   { emoji: '📊', title: 'Tráfego Pago',      dot: '⚪' },
  acessos:   { emoji: '🔑', title: 'Acessos',           dot: '🟡' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatusDot({ active, label }) {
  return (
    <span className={`flex items-center gap-1 text-xs ${active ? 'text-[#FFA300]' : 'text-slate-600'}`}>
      {active ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
      {label}
    </span>
  )
}

function Block({ icon: Icon, label, color, bg, border, children }) {
  return (
    <div className={`rounded-xl border ${border} overflow-hidden`}>
      <div className={`flex items-center gap-2 px-4 py-2.5 ${bg}`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{label}</span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}

function Empty({ label }) {
  return (
    <div className="py-10 flex flex-col items-center text-center">
      <Circle className="w-8 h-8 text-slate-700 mb-2" />
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  )
}

// ─── Section views ────────────────────────────────────────────────────────────

function PersonaView({ persona }) {
  if (!persona) return <Empty label="Persona não gerada ainda." />
  const list = (items, dot) => (
    <ul className="space-y-1.5">
      {(items || []).map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
          <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${dot}`} />
          {item}
        </li>
      ))}
      {!items?.length && <li className="text-xs text-slate-600 italic">Nenhum item</li>}
    </ul>
  )
  return (
    <div className="space-y-3">
      {persona.perfil && (
        <Block icon={User} label="Perfil" color="text-[#FFA300]" border="border-[#FFA300]/20" bg="bg-[#FFA300]/8">
          <p className="text-sm text-slate-300 leading-relaxed">{persona.perfil}</p>
        </Block>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Block icon={Heart} label="Dores" color="text-[#FFA300]" border="border-[#FFA300]/20" bg="bg-[#FFA300]/5">
          {list(persona.dores, 'bg-[#FFA300]')}
        </Block>
        <Block icon={Target} label="Desejos" color="text-[#FFA300]" border="border-[#FFA300]/20" bg="bg-[#FFA300]/5">
          {list(persona.desejos, 'bg-[#FFA300]')}
        </Block>
      </div>
      {persona.objecoes?.length > 0 && (
        <Block icon={MessageSquare} label="Objeções" color="text-[#FFA300]" border="border-[#FFA300]/20" bg="bg-[#FFA300]/5">
          <div className="space-y-2">
            {persona.objecoes.map((obj, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FFA300]/5 border border-[#FFA300]/10">
                <MessageSquare className="w-3.5 h-3.5 text-[#FFA300] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300 italic">{obj}</p>
              </div>
            ))}
          </div>
        </Block>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {persona.decisao && (
          <Block icon={Brain} label="Como decide" color="text-[#FFA300]" border="border-[#FFA300]/20" bg="bg-[#FFA300]/5">
            <p className="text-sm text-slate-300 leading-relaxed">{persona.decisao}</p>
          </Block>
        )}
        {persona.valoriza && (
          <Block icon={Sparkles} label="O que valoriza" color="text-[#FFA300]" border="border-[#FFA300]/20" bg="bg-[#FFA300]/5">
            <p className="text-sm text-slate-300 leading-relaxed">{persona.valoriza}</p>
          </Block>
        )}
      </div>
    </div>
  )
}

function SpinView({ spinQuestions, callNotes }) {
  if (!spinQuestions?.length) return <Empty label="Perguntas SPIN não geradas ainda." />
  const byCategory = ['situacao', 'problema', 'implicacao', 'necessidade'].map(key => ({
    key, meta: SPIN_CATEGORIES[key],
    questions: spinQuestions.filter(q => q.category === key),
  })).filter(g => g.questions.length > 0)
  return (
    <div className="space-y-3">
      {byCategory.map(({ key, meta, questions }) => (
        <div key={key} className={`rounded-xl border ${meta.border} overflow-hidden`}>
          <div className={`flex items-center justify-between px-4 py-2.5 ${meta.bg}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>{meta.letter} - {meta.label}</span>
            <span className={`text-xs ${meta.color}`}>{questions.filter(q => q.answer?.trim()).length}/{questions.length}</span>
          </div>
          <div className="divide-y divide-surface-border/40">
            {questions.map(q => (
              <div key={q.id} className="px-4 py-3">
                <p className="text-xs font-medium text-slate-300 mb-1.5">{q.question}</p>
                {q.answer?.trim()
                  ? <p className="text-sm text-slate-400 leading-relaxed pl-3 border-l-2 border-surface-border">{q.answer}</p>
                  : <p className="text-xs text-slate-600 italic">Sem resposta</p>}
                {q.note?.trim() && <p className="text-xs text-slate-600 italic mt-1.5 pl-3">📝 {q.note}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
      {callNotes?.trim() && (
        <div className="rounded-xl border border-[#FFA300]/20 overflow-hidden">
          <div className="px-4 py-2.5 bg-[#FFA300]/5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFA300]">Notas da Call</span>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{callNotes}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ProposalView({ proposal }) {
  if (!proposal) return <Empty label="Proposta não gerada ainda." />
  const lines = (v) => !v ? [] : Array.isArray(v) ? v : String(v).split('\n\n').filter(Boolean)
  const Field = ({ emoji, label, value }) => {
    const ls = lines(value)
    if (!ls.length) return null
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"><span>{emoji}</span>{label}</p>
        <div className="space-y-1 pl-5">
          {ls.map((l, i) => (
            <p key={i} className="text-sm text-slate-400 leading-relaxed flex gap-2">
              <span className="text-slate-600 flex-shrink-0">➡️</span>{l}
            </p>
          ))}
        </div>
      </div>
    )
  }
  const Section = ({ emoji, title, color, bg, border, children }) => {
    const has = React.Children.toArray(children).some(Boolean)
    if (!has) return null
    return (
      <div className={`rounded-xl border ${border} overflow-hidden`}>
        <div className={`flex items-center gap-2 px-4 py-2.5 ${bg}`}>
          <span>{emoji}</span>
          <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{title}</span>
        </div>
        <div className="px-4 py-3 space-y-3 divide-y divide-surface-border/40">
          {React.Children.map(children, c => c ? <div className="pt-3 first:pt-0">{c}</div> : null)}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <Section emoji="📋" title="Visão Geral" color="text-[#FFA300]" bg="bg-[#FFA300]/10" border="border-[#FFA300]/20">
        <Field emoji="🟠" label="Resumo do Negócio" value={proposal.briefing?.resumoNegocio} />
        <Field emoji="🟠" label="Situação Atual do Digital" value={proposal.briefing?.situacaoAtual} />
      </Section>
      <Section emoji="🎯" title="Estratégia & Ação" color="text-[#FFA300]" bg="bg-[#FFA300]/10" border="border-[#FFA300]/20">
        <Field emoji="🟢" label="Prioridades Operacionais" value={proposal.briefing?.prioridades} />
        <Field emoji="🔴" label="Alertas para a Equipe" value={proposal.briefing?.alertas} />
        <Field emoji="⚫" label="Próximos Passos" value={proposal.briefing?.proximosPassos} />
      </Section>
      <Section emoji="📊" title="Metas" color="text-[#FFA300]" bg="bg-[#FFA300]/10" border="border-[#FFA300]/20">
        <Field emoji="🟣" label="Metas - 3 Meses" value={proposal.metas?.mes3} />
        <Field emoji="🟣" label="Metas - 6 Meses" value={proposal.metas?.mes6} />
      </Section>
      <Section emoji="💡" title="Fechamento" color="text-[#FFA300]" bg="bg-[#FFA300]/10" border="border-[#FFA300]/20">
        <Field emoji="🟡" label="Justificativa para o Closer" value={proposal.justificativa} />
        <Field emoji="🔴" label="Pontos Críticos do Onboarding" value={proposal.pontosCriticos} />
      </Section>
    </div>
  )
}

function BriefingView({ briefing }) {
  if (!briefing) return <Empty label="Briefing de clientes não preenchido ainda." />
  const sections = briefing.sections || []
  const hasFilled = sections.some(s => s.fields?.some(f => f.answer?.trim()))
  if (!hasFilled) return <Empty label="Briefing sem respostas preenchidas ainda." />
  return (
    <div className="space-y-3">
      {(briefing.clientName || briefing.services) && (
        <div className="px-3 py-2 rounded-lg bg-[#FFA300]/5 border border-[#FFA300]/15">
          <p className="text-xs font-bold text-[#FFA300]">
            {[briefing.clientName?.toUpperCase(), briefing.services?.toUpperCase()].filter(Boolean).join(' - ')}
          </p>
        </div>
      )}
      {sections.map(section => {
        const meta = BRIEFING_SECTIONS[section.id]
        const visible = section.fields?.filter(f => f.answer?.trim()) || []
        if (!visible.length) return null
        return (
          <div key={section.id} className="rounded-xl border border-surface-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-hover">
              <span className="text-sm leading-none">{meta?.emoji || '📌'}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{meta?.title || section.id}</span>
              <span className="ml-auto text-xs text-slate-600">{visible.length} resp.</span>
            </div>
            <div className="divide-y divide-surface-border/40">
              {visible.map(field => (
                <div key={field.id} className="px-4 py-3">
                  <p className="text-xs font-medium text-slate-400 mb-1.5">{meta?.dot || '•'} {field.q}</p>
                  <div className="space-y-0.5 pl-4">
                    {field.answer.trim().split('\n').filter(l => l.trim()).map((l, i) => (
                      <p key={i} className="text-sm text-slate-300 leading-relaxed">➡️ {l}</p>
                    ))}
                  </div>
                  {field.note?.trim() && <p className="text-xs text-slate-600 italic mt-1.5 pl-4">📝 {field.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Full-page view modal ─────────────────────────────────────────────────────

const MODAL_TABS = [
  { id: 'persona',  label: 'Persona',         icon: Brain,         emoji: '🧠', color: 'text-[#FFA300]', check: l => !!l.persona },
  { id: 'spin',     label: 'SPIN',             icon: MessageSquare, emoji: '📊', color: 'text-[#FFA300]',   check: l => l.spin_questions?.length > 0 },
  { id: 'proposta', label: 'Fechamento',       icon: HandshakeIcon, emoji: '🤝', color: 'text-[#FFA300]',check: l => !!l.proposal },
  { id: 'briefing', label: 'Briefing',         icon: ClipboardList, emoji: '📋', color: 'text-[#FFA300]',    check: l => !!l.briefing },
]

function ClientViewModal({ lead, onClose }) {
  const first = MODAL_TABS.find(t => t.check(lead))?.id || 'persona'
  const [activeTab, setActiveTab] = useState(first)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const activeTabMeta = MODAL_TABS.find(t => t.id === activeTab)

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0a0a0a' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-border bg-surface-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFA300]/10 border border-[#FFA300]/20 flex items-center justify-center">
            <User className="w-4 h-4 text-[#FFA300]" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">{lead.name || lead.niche || 'Lead sem nome'}</p>
            <div className="flex items-center gap-3 mt-0.5">
              {lead.niche && <span className="text-xs text-slate-500 flex items-center gap-1"><Building2 className="w-3 h-3" />{lead.niche}</span>}
              {lead.state && <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.state}</span>}
              <span className="text-xs text-slate-600 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(lead.updated_at)}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover text-slate-400 hover:text-slate-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-surface-border bg-surface-card/50 px-4 flex-shrink-0 overflow-x-auto">
        {MODAL_TABS.map(tab => {
          const Icon = tab.icon
          const has = tab.check(lead)
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm font-medium flex-shrink-0 border-b-2 transition-all whitespace-nowrap ${
                active
                  ? `border-[#FFA300] ${tab.color}`
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5 hidden sm:block" />
              <span>{tab.label}</span>
              {has
                ? active
                  ? null
                  : <span className="w-1.5 h-1.5 rounded-full bg-[#FFA300] flex-shrink-0" />
                : <span className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0" />
              }
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
          {activeTab === 'persona'  && (lead.persona
            ? <PersonaView persona={lead.persona} />
            : <Empty label="Persona não gerada ainda." />)}
          {activeTab === 'spin'     && (lead.spin_questions?.length
            ? <SpinView spinQuestions={lead.spin_questions} callNotes={lead.call_notes} />
            : <Empty label="Perguntas SPIN não geradas ainda." />)}
          {activeTab === 'proposta' && (lead.proposal
            ? <ProposalView proposal={lead.proposal} />
            : <Empty label="Proposta não gerada ainda." />)}
          {activeTab === 'briefing' && (lead.briefing
            ? <BriefingView briefing={lead.briefing} />
            : <Empty label="Briefing não preenchido ainda." />)}
        </div>
      </div>
    </div>
  )
}

// ─── Lead Card ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'persona',  label: 'Persona',    icon: Brain,         check: l => !!l.persona },
  { id: 'spin',     label: 'SPIN',       icon: MessageSquare, check: l => l.spin_questions?.length > 0 },
  { id: 'proposta', label: 'Fechamento', icon: HandshakeIcon, check: l => !!l.proposal },
  { id: 'briefing', label: 'Briefing',   icon: ClipboardList, check: l => !!l.briefing },
]

function LeadFolder({ lead }) {
  const first = TABS.find(t => t.check(lead))?.id || 'persona'
  const [activeTab, setActiveTab] = useState(first)
  return (
    <div className="border-t border-surface-border bg-surface/40">
      <div className="flex border-b border-surface-border px-3 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const has = tab.check(lead)
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium flex-shrink-0 border-b-2 transition-all ${
                active ? 'border-[#FFA300] text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${has ? (active ? 'text-[#FFA300]' : 'text-slate-500') : 'text-slate-700'}`} />
              {tab.label}
              {has && !active && <span className="w-1.5 h-1.5 rounded-full bg-[#FFA300] flex-shrink-0" />}
            </button>
          )
        })}
      </div>
      <div className="max-h-80 overflow-y-auto p-4">
        {activeTab === 'persona'  && <PersonaView  persona={lead.persona} />}
        {activeTab === 'spin'     && <SpinView     spinQuestions={lead.spin_questions} callNotes={lead.call_notes} />}
        {activeTab === 'proposta' && <ProposalView proposal={lead.proposal} />}
        {activeTab === 'briefing' && <BriefingView briefing={lead.briefing} />}
      </div>
    </div>
  )
}

function LeadCard({ lead, onLoad, onDelete, onView }) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const hasPersona  = !!lead.persona
  const hasSpin     = Array.isArray(lead.spin_questions) && lead.spin_questions.length > 0
  const hasProposal = !!lead.proposal
  const hasBriefing = !!lead.briefing
  const answered    = hasSpin ? lead.spin_questions.filter(q => q.answer?.trim()).length : 0

  const handleDelete = async () => {
    setDeleting(true)
    try { await deleteLead(lead.id); onDelete(lead.id) }
    catch (err) { console.error(err) }
    finally { setDeleting(false); setConfirmDelete(false) }
  }

  return (
    <div className="glass-card overflow-hidden hover:border-[#FFA300]/30 transition-all duration-200">

      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-4 p-4 text-left hover:bg-surface-hover/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-[#FFA300]/10 border border-[#FFA300]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-5 h-5 text-[#FFA300]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-100 truncate">{lead.name || lead.niche || 'Lead sem nome'}</p>
            <span className="flex items-center gap-1 text-xs text-slate-600 flex-shrink-0">
              <Calendar className="w-3 h-3" />{formatDate(lead.updated_at)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {lead.niche && <span className="flex items-center gap-1 text-xs text-slate-500"><Building2 className="w-3 h-3" />{lead.niche}</span>}
            {lead.state && <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="w-3 h-3" />{lead.state}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <StatusDot active={hasPersona}  label="Persona" />
            <StatusDot active={hasSpin}     label={hasSpin ? `SPIN (${answered}/${lead.spin_questions.length})` : 'SPIN'} />
            <StatusDot active={hasProposal} label="Proposta" />
            <StatusDot active={hasBriefing} label="Briefing" />
          </div>
        </div>
        <div className="flex-shrink-0 mt-1 text-slate-600">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && <LeadFolder lead={lead} />}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-surface-border bg-surface/20">
        <button onClick={() => onView(lead)} className="btn-ghost text-xs py-1.5 border border-surface-border flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> Visualizar
        </button>
        <button onClick={() => onLoad(lead)} className="btn-primary text-xs py-1.5 flex-1 justify-center">
          <FolderOpen className="w-3.5 h-3.5" /> Carregar Lead
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">Confirmar?</span>
            <button onClick={handleDelete} disabled={deleting} className="px-2.5 py-1.5 rounded-lg bg-white/20 border border-white/30 text-slate-300 text-xs font-medium hover:bg-white/30">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Sim'}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1.5 rounded-lg text-slate-500 text-xs hover:bg-surface-hover">Não</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="p-2 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/10 transition-all" title="Excluir">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HistoricoModule() {
  const { dbConnected, loadLeadFromDb, setActiveModule } = useApp()

  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [viewingLead, setViewingLead] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setLeads(await fetchLeads()) }
    catch (err) { setError(err.message || 'Erro ao carregar leads') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (dbConnected) load() }, [dbConnected, load])

  const handleLoad = (row) => { loadLeadFromDb(row); setActiveModule('intelligence') }
  const handleDelete = (id) => setLeads(prev => prev.filter(l => l.id !== id))

  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    return !q || l.name?.toLowerCase().includes(q) || l.niche?.toLowerCase().includes(q) || l.state?.toLowerCase().includes(q)
  })

  if (!dbConnected) {
    return (
      <div className="px-4 py-4 sm:p-6 max-w-3xl mx-auto animate-fade-in">
        <div className="glass-card p-14 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-hover border border-surface-border flex items-center justify-center mb-4">
            <WifiOff className="w-7 h-7 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-300 mb-2">Banco de dados não conectado</h3>
          <p className="text-sm text-slate-500 max-w-xs mb-6">Configure o Supabase nas Configurações para acessar o histórico.</p>
          <button onClick={() => setActiveModule('settings')} className="btn-primary">
            <Database className="w-4 h-4" /> Ir para Configurações
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {viewingLead && ReactDOM.createPortal(
        <ClientViewModal lead={viewingLead} onClose={() => setViewingLead(null)} />,
        document.body
      )}

      <div className="px-4 py-4 sm:p-6 max-w-3xl mx-auto space-y-4 sm:space-y-5 animate-fade-in">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#FFA300]" /> Histórico de Leads
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{leads.length} lead{leads.length !== 1 ? 's' : ''} salvos</p>
          </div>
          <button onClick={load} disabled={loading} className="btn-ghost text-xs py-2">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Atualizar
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, nicho ou localização..." className="input-field pl-9" />
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-slate-300 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {loading && (
          <div className="glass-card p-10 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-[#FFA300] animate-spin" />
            <p className="text-sm text-slate-400">Carregando leads...</p>
          </div>
        )}

        {!loading && (
          filtered.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center text-center">
              <Database className="w-8 h-8 text-slate-700 mb-3" />
              <p className="text-sm font-medium text-slate-400">
                {search ? 'Nenhum lead encontrado' : 'Nenhum lead salvo ainda'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onLoad={handleLoad}
                  onDelete={handleDelete}
                  onView={setViewingLead}
                />
              ))}
            </div>
          )
        )}
      </div>
    </>
  )
}

