import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import {
  Plus, Trash2, Pencil, Check, X,
  ChevronDown, ChevronUp,
  FileDown, FileText, RotateCcw, StickyNote,
  CheckCircle2, Loader2, CloudOff, Save, AlertTriangle,
} from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { fetchLeads } from '../../../services/dbService'

// ─── Section templates ────────────────────────────────────────────────────────

const SECTION_TEMPLATES = [
  {
    id: 'geral',
    sectionEmoji: '📋',
    dotEmoji: '🟠',
    title: 'PERGUNTAS GERAIS E ESTRATÉGICAS',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/25',
    fields: [
      { id: 'tipo_programa', q: 'Tipo de programa:' },
      { id: 'responsavel', q: 'Nome completo do responsável pela empresa:' },
      { id: 'data_nasc', q: 'Data de Nascimento:' },
      { id: 'nome_empresa', q: 'Nome da empresa:' },
      { id: 'fundacao', q: 'Data da Fundação da Empresa:' },
      { id: 'telefone', q: 'Telefone:' },
      { id: 'endereco', q: 'Endereço completo onde está localizada sua empresa:' },
      { id: 'experiencia_mkt', q: 'Já teve alguma experiência com Marketing Digital?' },
      { id: 'motivo_fechamento', q: 'O que fez você fechar com a agência?' },
      { id: 'sonhos', q: 'Quais sonhos você pretende realizar com a companhia?' },
      { id: 'horarios', q: 'Quais os horários e dias de funcionamento/atendimento da sua empresa?' },
    ],
  },
  {
    id: 'empresa',
    sectionEmoji: '🏢',
    dotEmoji: '🟠',
    title: 'SOBRE A EMPRESA E A HISTÓRIA',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/25',
    fields: [
      { id: 'historia', q: 'Breve história da sua empresa:' },
      { id: 'nome_origem', q: 'Como surgiu a ideia do nome da empresa?' },
      { id: 'obstaculos', q: 'O que você sente que atrapalha a evolução da sua empresa?' },
      { id: 'promocoes', q: 'Você está aberto a fazer promoções/ofertas em datas comemorativas para alavancar os trabalhos?' },
      { id: 'datas', q: 'Quais as datas comemorativas que podemos trabalhar para a empresa?' },
    ],
  },
  {
    id: 'servicos',
    sectionEmoji: '🛠️',
    dotEmoji: '⚫',
    title: 'SOBRE OS SERVIÇOS',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/25',
    fields: [
      { id: 'servicos_lista', q: 'Quais produtos ou serviços a sua empresa oferece?' },
      { id: 'diferencial', q: 'Por que o cliente deveria contratar sua empresa/serviço ou comprar seu produto? Qual seu maior diferencial?' },
      { id: 'fotos_videos', q: 'Você possui fotos e vídeos dos trabalhos?' },
      { id: 'banco_imagens', q: 'Algum problema com fotos de banco de imagem?' },
    ],
  },
  {
    id: 'publico',
    sectionEmoji: '👥',
    dotEmoji: '🟤',
    title: 'PÚBLICO',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/20',
    border: 'border-[#FFA300]/30',
    fields: [
      { id: 'perfil_cliente', q: 'Qual o perfil do seu cliente?' },
      { id: 'problemas', q: 'Quais os problemas mais frequentes você vê quando vai visitar seus clientes?' },
      { id: 'experiencia_marcante', q: 'Qual foi a sua experiência mais marcante com um cliente durante o tempo que está trabalhando na área?' },
      { id: 'duvidas', q: 'Quais as dúvidas frequentes em relação ao serviço?' },
      { id: 'origem_cliente', q: 'Seu cliente é Brasileiro ou Americano?' },
      { id: 'contato_preferido', q: 'Qual o meio de contato preferido do seu cliente?' },
      { id: 'primeiro_atendimento', q: 'Como é feito o 1° atendimento com o cliente?' },
      { id: 'orcamento_envio', q: 'Como você envia o orçamento para o cliente?' },
      { id: 'uniforme', q: 'Você tem um uniforme somente para as visitas?' },
      { id: 'referencias', q: 'Você tem números de clientes para recomendar a empresa?' },
      { id: 'apresentacao', q: 'Existe uma apresentação do projeto para o cliente? Se sim, como ela é feita? Planta, 3D' },
      { id: 'portfolio', q: 'Você possui um portfólio para mostrar ao cliente e dar dicas para o projeto durante a visita?' },
    ],
  },
  {
    id: 'design',
    sectionEmoji: '🎨',
    dotEmoji: '🔴',
    title: 'DESIGN E BRANDING',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/20',
    fields: [
      { id: 'transmitir', q: 'O que você quer transmitir com sua marca?' },
    ],
  },
  {
    id: 'webdesign',
    sectionEmoji: '🌐',
    dotEmoji: '🟣',
    title: 'WEBDESIGN (SITES)',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/20',
    fields: [
      { id: 'dominio', q: 'Pretende manter o mesmo domínio ou continuar usando o mesmo serviço de hospedagem? (Informar os acessos do provedor de domínio e hospedagem)' },
      { id: 'email_prof', q: 'Já possui algum e-mail profissional? Se sim quais? (informar e-mail, senha e onde está localizado)' },
      { id: 'site_essencial', q: 'O que não pode faltar em um site para você?' },
    ],
  },
  {
    id: 'social',
    sectionEmoji: '📱',
    dotEmoji: '🟢',
    title: 'SOCIAL MEDIA E AUDIOVISUAL',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/20',
    fields: [
      { id: 'comunicacao', q: 'Como é a sua comunicação com os clientes?' },
    ],
  },
  {
    id: 'trafego',
    sectionEmoji: '📊',
    dotEmoji: '⚪',
    title: 'TRÁFEGO PAGO (ADS)',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/25',
    fields: [
      { id: 'regiao', q: 'Região em que a sua empresa atua. Deseja excluir alguma cidade ou zip code?' },
      { id: 'faturamento', q: 'Faturamento atual da companhia e desejo para o futuro?' },
      { id: 'ticket_medio', q: 'Qual é o TICKET MÉDIO dos serviços que você faz?' },
      { id: 'investimento_ads', q: 'Qual o valor disponível para investimento em anúncios por semana/mês dentro do Programa Acelerador?' },
      { id: 'cpl', q: 'CPL Esperado para os anúncios' },
    ],
  },
  {
    id: 'acessos',
    sectionEmoji: '🔑',
    dotEmoji: '🟡',
    title: 'ACESSOS NECESSÁRIOS',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/20',
    fields: [
      { id: 'acesso_facebook', q: 'Acesso do Facebook (usuário e senha do perfil pessoal). Caso não tenha, informar abaixo.' },
      { id: 'acesso_instagram', q: 'Acesso do Instagram (usuário e senha do perfil da empresa). Caso não tenha, informar.' },
      { id: 'acesso_gmail', q: 'Acesso da conta do Gmail (usuário e senha). Caso não tenha, informar abaixo.' },
    ],
  },
]

// ─── State helpers ────────────────────────────────────────────────────────────

function createEmptyBriefing() {
  return {
    clientName: '',
    services: '',
    sections: SECTION_TEMPLATES.map(s => ({
      id: s.id,
      fields: s.fields.map(f => ({ ...f, answer: '', note: '' })),
    })),
  }
}

// ─── TXT Export ──────────────────────────────────────────────────────────────

function buildBriefingTxt(briefing) {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const title = [briefing.clientName?.toUpperCase(), briefing.services?.toUpperCase()].filter(Boolean).join(' - ')
  const line = '═'.repeat(52)
  const thin = '─'.repeat(52)

  let txt = `${title || 'BRIEFING'} - Brief do projeto\n`
  txt += `EuSouTS · Trajetória do Sucesso · ${today}\n`

  for (const template of SECTION_TEMPLATES) {
    const section = briefing.sections.find(s => s.id === template.id)
    if (!section) continue
    const visible = section.fields.filter(f => f.answer?.trim() || f.note?.trim())
    if (!visible.length) continue

    txt += `\n${line}\n${template.sectionEmoji} ${template.title}\n${line}\n\n`

    for (const field of visible) {
      txt += `${template.dotEmoji} ${field.q}\n`
      if (field.answer?.trim()) {
        for (const l of field.answer.trim().split('\n')) {
          if (l.trim()) txt += `   ➡️ ${l}\n`
        }
      }
      if (field.note?.trim()) txt += `   📝 ${field.note}\n`
      txt += '\n'
    }
  }

  txt += `${thin}\nGerado por TS Comercial · EuSouTS · ${today}`
  return txt
}

function downloadTxt(briefing) {
  const txt = buildBriefingTxt(briefing)
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${briefing.clientName || 'briefing'}-brief.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── PDF View ─────────────────────────────────────────────────────────────────

function BriefingPDFView({ briefing }) {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div id="briefing-pdf" style={{ display: 'none', padding: '36px', background: 'white', color: '#111827', fontFamily: 'Arial, sans-serif' }}>
      {/* Title */}
      <div style={{ borderBottom: '3px solid #FFA300', paddingBottom: '12px', marginBottom: '24px' }}>
        <p style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 4px', lineHeight: 1.4, color: '#111827' }}>
          {briefing.clientName?.toUpperCase() || 'CLIENTE'}
          {briefing.services ? ` - ${briefing.services.toUpperCase()}` : ''}
          {' - Brief do projeto'}
        </p>
        <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>EuSouTS · Trajetória do Sucesso · {today}</p>
      </div>

      {SECTION_TEMPLATES.map(template => {
        const section = briefing.sections.find(s => s.id === template.id)
        if (!section) return null
        const visibleFields = section.fields.filter(f => f.answer?.trim() || f.note?.trim())
        if (!visibleFields.length) return null

        return (
          <div key={template.id} style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 10px', padding: '5px 0', borderBottom: '1px solid #e5e7eb' }}>
              {template.sectionEmoji} {template.title}
            </h2>
            {visibleFields.map(field => (
              <div key={field.id} style={{ marginBottom: '12px', pageBreakInside: 'avoid' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 3px', color: '#374151' }}>
                  {template.dotEmoji} {field.q}
                </p>
                {field.answer?.trim() && (
                  <div style={{ paddingLeft: '18px' }}>
                    {field.answer.trim().split('\n').map((line, i) => (
                      line.trim()
                        ? <p key={i} style={{ fontSize: '11px', color: '#1f2937', margin: '2px 0', lineHeight: 1.6 }}>➡️ {line}</p>
                        : <p key={i} style={{ margin: '4px 0' }} />
                    ))}
                  </div>
                )}
                {field.note?.trim() && (
                  <p style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic', margin: '4px 0 0 18px', lineHeight: 1.5 }}>
                    {field.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      })}

      <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '10px', fontSize: '9px', color: '#9ca3af', textAlign: 'center' }}>
        Gerado por TS Comercial · EuSouTS · Trajetória do Sucesso · {today}
      </div>
    </div>
  )
}

// ─── Field Row ────────────────────────────────────────────────────────────────

function FieldRow({ field, dotEmoji, onUpdateAnswer, onUpdateNote, onUpdateQuestion, onRemove }) {
  const [editingQ, setEditingQ] = useState(field.custom && !field.q.trim())
  const [qDraft, setQDraft] = useState(field.q)
  const [showNote, setShowNote] = useState(!!field.note)

  const saveQ = () => { onUpdateQuestion(field.id, qDraft.trim() || field.q); setEditingQ(false) }

  return (
    <div className="group space-y-2">
      {/* Question */}
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex-shrink-0 leading-none">{dotEmoji}</span>
        {editingQ ? (
          <div className="flex-1 flex gap-2 items-start">
            <input
              autoFocus
              value={qDraft}
              onChange={e => setQDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveQ(); if (e.key === 'Escape') { setQDraft(field.q); setEditingQ(false) } }}
              className="input-field flex-1 text-sm py-1"
              placeholder="Digite a pergunta..."
            />
            <button onClick={saveQ} className="p-1.5 rounded-lg bg-[#FFA300]/10 text-[#FFA300] hover:bg-[#FFA300]/20 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setQDraft(field.q); setEditingQ(false) }} className="p-1.5 rounded-lg hover:bg-surface-hover text-slate-500 mt-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-start gap-1.5">
            <p className="text-sm font-medium text-slate-100 flex-1 leading-snug">
              {field.q || <span className="italic text-slate-600">Sem título</span>}
            </p>
            <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity flex-shrink-0">
              <button
                onClick={() => { setQDraft(field.q); setEditingQ(true) }}
                className="p-1 rounded-md hover:bg-surface-hover text-slate-600 hover:text-slate-300"
              >
                <Pencil className="w-3 h-3" />
              </button>
              {field.custom && (
                <button
                  onClick={() => onRemove(field.id)}
                  className="p-1 rounded-md hover:bg-white/10 text-slate-600 hover:text-slate-300"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Answer */}
      <div className="pl-6">
        <textarea
          value={field.answer || ''}
          onChange={e => onUpdateAnswer(field.id, e.target.value)}
          placeholder="➡️ Resposta..."
          rows={4}
          className="input-field resize-y text-sm w-full placeholder:text-slate-700"
        />
      </div>

      {/* Note */}
      <div className="pl-6">
        {showNote ? (
          <textarea
            autoFocus={!field.note}
            value={field.note || ''}
            onChange={e => onUpdateNote(field.id, e.target.value)}
            placeholder="📝 Nota interna da equipe..."
            rows={2}
            className="input-field resize-none text-xs text-slate-400 placeholder:text-slate-600 w-full border-dashed"
          />
        ) : (
          <button
            onClick={() => setShowNote(true)}
            className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-500 transition-colors"
          >
            <StickyNote className="w-3 h-3" /> Nota interna
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Section Block ────────────────────────────────────────────────────────────

function SectionBlock({ section, template, onUpdateField, onAddField, onRemoveField }) {
  const [open, setOpen] = useState(true)
  const filled = section.fields.filter(f => f.answer?.trim()).length

  return (
    <div className={`glass-card overflow-hidden border ${template.border}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-5 py-3.5 ${template.bg} hover:opacity-90 transition-all`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none">{template.sectionEmoji}</span>
          <h3 className={`text-xs font-bold tracking-wider ${template.color}`}>{template.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${template.border} ${template.color}`}>
            {filled}/{section.fields.length}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="p-5 divide-y divide-surface-border/40">
          {section.fields.map(field => (
            <div key={field.id} className="py-4 first:pt-0">
              <FieldRow
                field={field}
                dotEmoji={template.dotEmoji}
                onUpdateAnswer={(id, val) => onUpdateField(section.id, id, 'answer', val)}
                onUpdateNote={(id, val) => onUpdateField(section.id, id, 'note', val)}
                onUpdateQuestion={(id, val) => onUpdateField(section.id, id, 'q', val)}
                onRemove={(id) => onRemoveField(section.id, id)}
              />
            </div>
          ))}
          <div className="pt-3">
            <button
              onClick={() => onAddField(section.id)}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#FFA300] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar pergunta
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BriefingModule() {
  const {
    briefing: rawBriefing, setBriefing,
    currentLeadId, setCurrentLeadId,
    leadData, loadLeadFromDb,
    saveLeadToDb, saveStatus, dbConnected, dbColumnsOk,
    setActiveModule,
  } = useApp()

  const [leads, setLeads] = useState([])

  useEffect(() => {
    if (!dbConnected) return
    fetchLeads().then(setLeads).catch(() => {})
  }, [dbConnected])

  // Auto-save to DB (2s debounce) whenever briefing changes
  const saveRef = useRef(saveLeadToDb)
  useEffect(() => { saveRef.current = saveLeadToDb }, [saveLeadToDb])

  useEffect(() => {
    if (!rawBriefing || !dbConnected) return
    const t = setTimeout(() => saveRef.current({
      name: rawBriefing.clientName || leadData.name || 'Briefing',
    }), 2000)
    return () => clearTimeout(t)
  }, [rawBriefing, dbConnected, leadData.name])

  const briefing = useMemo(() => {
    if (!rawBriefing) return createEmptyBriefing()
    const sections = SECTION_TEMPLATES.map(template => {
      const savedSection = rawBriefing.sections?.find(s => s.id === template.id)
      const baseFields = template.fields.map(tf => {
        const savedField = savedSection?.fields?.find(f => f.id === tf.id)
        return { ...tf, answer: '', note: '', ...(savedField || {}) }
      })
      const customFields = savedSection?.fields?.filter(f => f.custom) || []
      return { id: template.id, fields: [...baseFields, ...customFields] }
    })
    return { clientName: rawBriefing.clientName || leadData.name || '', services: rawBriefing.services || '', sections }
  }, [rawBriefing, leadData.name])

  const updateHeader = (key, val) => setBriefing(prev => ({ ...(prev || createEmptyBriefing()), [key]: val }))

  const updateField = useCallback((sectionId, fieldId, key, val) => {
    setBriefing(prev => {
      const base = prev || createEmptyBriefing()
      return {
        ...base,
        sections: base.sections.map(s =>
          s.id !== sectionId ? s : {
            ...s,
            fields: s.fields.map(f => f.id !== fieldId ? f : { ...f, [key]: val }),
          }
        ),
      }
    })
  }, [setBriefing])

  const addField = useCallback((sectionId) => {
    const newField = { id: crypto.randomUUID(), q: '', answer: '', note: '', custom: true }
    setBriefing(prev => {
      const base = prev || createEmptyBriefing()
      return {
        ...base,
        sections: base.sections.map(s =>
          s.id !== sectionId ? s : { ...s, fields: [...s.fields, newField] }
        ),
      }
    })
  }, [setBriefing])

  const removeField = useCallback((sectionId, fieldId) => {
    setBriefing(prev => {
      const base = prev || createEmptyBriefing()
      return {
        ...base,
        sections: base.sections.map(s =>
          s.id !== sectionId ? s : { ...s, fields: s.fields.filter(f => f.id !== fieldId) }
        ),
      }
    })
  }, [setBriefing])

  const handleReset = () => {
    if (!window.confirm('Apagar este briefing e iniciar um novo? Esta ação não pode ser desfeita.')) return
    setBriefing(createEmptyBriefing())
  }

  const filledFields = briefing.sections.reduce((acc, s) => acc + s.fields.filter(f => f.answer?.trim()).length, 0)
  const totalFields = briefing.sections.reduce((acc, s) => acc + s.fields.length, 0)
  const pct = totalFields ? Math.round((filledFields / totalFields) * 100) : 0

  return (
    <>
      {ReactDOM.createPortal(<BriefingPDFView briefing={briefing} />, document.body)}

      <div className="px-4 py-4 sm:p-6 max-w-3xl mx-auto space-y-4 animate-fade-in print:hidden">

        {/* Header card */}
        <div className="glass-card p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome do cliente / empresa</label>
              {dbConnected && leads.length > 0 ? (
                <select
                  value={currentLeadId || ''}
                  onChange={e => {
                    const lead = leads.find(l => l.id === e.target.value)
                    if (!lead) { setCurrentLeadId(null); updateHeader('clientName', ''); return }
                    if (lead.briefing) { loadLeadFromDb(lead); return }
                    setCurrentLeadId(lead.id)
                    updateHeader('clientName', lead.name || lead.niche || '')
                  }}
                  className="input-field font-semibold"
                >
                  <option value="">- Novo cliente -</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name || l.niche || 'Sem nome'}{l.niche && l.name ? ` (${l.niche})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={briefing.clientName}
                  onChange={e => updateHeader('clientName', e.target.value)}
                  placeholder="Ex: FBO Construction INC"
                  className="input-field font-semibold"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Serviços contratados</label>
              <input
                value={briefing.services}
                onChange={e => updateHeader('services', e.target.value)}
                placeholder="Ex: Google Ads + Meta Ads + Site + Social Media"
                className="input-field"
              />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>{filledFields} de {totalFields} campos preenchidos</span>
              <span className={pct === 100 ? 'text-[#FFA300] font-semibold' : ''}>{pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FFA300] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => window.print()} className="btn-primary">
              <FileDown className="w-4 h-4" /> PDF
            </button>
            <button onClick={() => downloadTxt(briefing)} className="btn-ghost text-xs border border-surface-border">
              <FileText className="w-3.5 h-3.5" /> TXT
            </button>
            {dbConnected && (
              <button
                onClick={() => saveLeadToDb({ name: briefing.clientName || leadData.name || 'Briefing' })}
                disabled={saveStatus === 'saving'}
                className="btn-ghost text-xs border border-surface-border disabled:opacity-40"
              >
                {saveStatus === 'saving'
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Save className="w-3.5 h-3.5" />}
                Salvar
              </button>
            )}
            <button onClick={handleReset} className="btn-ghost text-xs">
              <RotateCcw className="w-3.5 h-3.5" /> Novo
            </button>
            <span className="ml-auto text-xs flex items-center gap-1.5">
              {!dbConnected ? (
                <><CloudOff className="w-3 h-3 text-slate-600" /><span className="text-slate-600">Local</span></>
              ) : !currentLeadId ? (
                <span className="text-slate-600">Sem cliente vinculado</span>
              ) : saveStatus === 'saving' ? (
                <><Loader2 className="w-3 h-3 animate-spin text-[#FFA300]" /><span className="text-[#FFA300]">Salvando...</span></>
              ) : saveStatus === 'saved' ? (
                <><CheckCircle2 className="w-3 h-3 text-[#FFA300]" /><span className="text-[#FFA300]">Salvo</span></>
              ) : saveStatus === 'error' ? (
                <span className="text-slate-300">Erro</span>
              ) : (
                <><CheckCircle2 className="w-3 h-3 text-slate-600" /><span className="text-slate-600">Auto-salvo ativo</span></>
              )}
            </span>
          </div>
        </div>

        {/* Columns missing warning */}
        {dbConnected && dbColumnsOk === false && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FFA300]/10 border border-[#FFA300]/25 text-[#FFA300] text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Banco desatualizado:</strong> a coluna <em>briefing</em> não existe ainda.
              O Briefing de Cliente <strong>não será salvo</strong> no histórico até você executar o script
              {' '}<button onClick={() => setActiveModule('settings')} className="underline text-[#FFA300] hover:text-white">ALTER TABLE nas Configurações</button>.
            </span>
          </div>
        )}

        {/* Title preview */}
        {(briefing.clientName || briefing.services) && (
          <div className="px-4 py-2.5 rounded-lg bg-[#FFA300]/5 border border-[#FFA300]/15">
            <p className="text-xs font-bold text-[#FFA300] leading-snug">
              {[briefing.clientName?.toUpperCase(), briefing.services?.toUpperCase()].filter(Boolean).join(' - ')}
              {' - Brief do projeto'}
            </p>
          </div>
        )}

        {/* Sections */}
        {SECTION_TEMPLATES.map(template => {
          const section = briefing.sections.find(s => s.id === template.id)
          if (!section) return null
          return (
            <SectionBlock
              key={template.id}
              section={section}
              template={template}
              onUpdateField={updateField}
              onAddField={addField}
              onRemoveField={removeField}
            />
          )
        })}

        <div className="flex items-center gap-2 pt-2 pb-4">
          <button onClick={() => downloadTxt(briefing)} className="btn-ghost text-xs border border-surface-border">
            <FileText className="w-3.5 h-3.5" /> TXT
          </button>
          <button onClick={() => window.print()} className="btn-ghost text-xs border border-surface-border">
            <FileDown className="w-3.5 h-3.5" /> PDF
          </button>
          {dbConnected && (
            <button
              onClick={() => saveLeadToDb({ name: briefing.clientName || leadData.name || 'Briefing' })}
              disabled={saveStatus === 'saving'}
              className="btn-primary text-xs disabled:opacity-50"
            >
              {saveStatus === 'saving'
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Save className="w-3.5 h-3.5" />}
              {saveStatus === 'saved' ? 'Salvo!' : 'Salvar Briefing'}
            </button>
          )}
          {saveStatus === 'error' && <span className="text-xs text-slate-300">Erro ao salvar</span>}
        </div>
      </div>
    </>
  )
}

