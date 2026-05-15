import React, { useRef, useState, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import {
  FileDown,
  ArrowLeft,
  MessageSquare,
  StickyNote,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  User,
  Save,
  Loader2,
} from 'lucide-react'
import { useApp } from '../../../../context/AppContext'

const CATEGORIES = [
  { key: 'situacao', letter: 'S', label: 'Situação', color: 'text-[#FFA300]', bg: 'bg-[#FFA300]/8', border: 'border-[#FFA300]/25', badge: 'bg-[#FFA300]/15 text-[#FFA300]' },
  { key: 'problema', letter: 'P', label: 'Problema', color: 'text-[#FFA300]', bg: 'bg-[#FFA300]/8', border: 'border-[#FFA300]/25', badge: 'bg-[#FFA300]/15 text-[#FFA300]' },
  { key: 'implicacao', letter: 'I', label: 'Implicação', color: 'text-[#FFA300]', bg: 'bg-[#FFA300]/8', border: 'border-[#FFA300]/25', badge: 'bg-[#FFA300]/15 text-[#FFA300]' },
  { key: 'necessidade', letter: 'N', label: 'Necessidade de Solução', color: 'text-[#FFA300]', bg: 'bg-[#FFA300]/8', border: 'border-[#FFA300]/25', badge: 'bg-[#FFA300]/15 text-[#FFA300]' },
]

// ─── PDF Print View ───────────────────────────────────────────────────────────
function PDFView({ leadData, persona, spinQuestions, callNotes }) {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const SPIN_LABEL = { situacao: 'S - Situação', problema: 'P - Problema', implicacao: 'I - Implicação', necessidade: 'N - Necessidade' }

  return (
    <div id="pdf-content" style={{ display: 'none', padding: '32px', background: 'white', color: '#111827', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '3px solid #FFA300', paddingBottom: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#FFA300', margin: 0 }}>TS Comercial</h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>EuSouTS - Trajetória do Sucesso</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
            <p style={{ margin: 0 }}>{today}</p>
            <p style={{ margin: '2px 0 0', fontWeight: '600', color: '#374151' }}>Dossiê de Vendas</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', marginTop: '16px', fontSize: '13px' }}>
          {leadData.name && <span><strong>Lead:</strong> {leadData.name}</span>}
          {leadData.niche && <span><strong>Nicho:</strong> {leadData.niche}</span>}
          {leadData.state && <span><strong>Localização:</strong> {leadData.state}</span>}
        </div>
      </div>

      {/* Persona */}
      {persona && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#FFA300', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', marginBottom: '12px' }}>
            Estudo de Persona
          </h2>
          <p style={{ fontSize: '12px', lineHeight: '1.6', marginBottom: '12px', color: '#374151' }}><strong>Perfil:</strong> {persona.perfil}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#FFA300', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Dores</p>
              {persona.dores?.map((d, i) => <p key={i} style={{ fontSize: '12px', color: '#4b5563', margin: '2px 0', paddingLeft: '10px', borderLeft: '2px solid #FFA300' }}>• {d}</p>)}
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#FFA300', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Desejos</p>
              {persona.desejos?.map((d, i) => <p key={i} style={{ fontSize: '12px', color: '#4b5563', margin: '2px 0', paddingLeft: '10px', borderLeft: '2px solid #FFA300' }}>• {d}</p>)}
            </div>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#FFA300', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Objeções esperadas</p>
            {persona.objecoes?.map((o, i) => <p key={i} style={{ fontSize: '12px', color: '#4b5563', margin: '2px 0', fontStyle: 'italic' }}>"{o}"</p>)}
          </div>
        </div>
      )}

      {/* SPIN */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#FFA300', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', marginBottom: '12px' }}>
          SPIN Selling - Perguntas e Respostas
        </h2>
        {CATEGORIES.map(cat => {
          const qs = spinQuestions.filter(q => q.category === cat.key)
          if (!qs.length) return null
          const COLORS = { situacao: '#FFA300', problema: '#FFA300', implicacao: '#FFA300', necessidade: '#FFA300' }
          return (
            <div key={cat.key} style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: COLORS[cat.key], textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                {SPIN_LABEL[cat.key]}
              </p>
              {qs.map((q, i) => (
                <div key={q.id} style={{ marginBottom: '10px', paddingLeft: '10px', borderLeft: `2px solid ${COLORS[cat.key]}`, pageBreakInside: 'avoid' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 4px' }}>{i + 1}. {q.question}</p>
                  {q.answer?.trim() ? (
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 8px', marginBottom: '4px' }}>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px', fontWeight: '600' }}>Resposta do lead:</p>
                      <p style={{ fontSize: '12px', color: '#374151', margin: 0 }}>{q.answer}</p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>Sem resposta registrada</p>
                  )}
                  {q.note?.trim() && (
                    <p style={{ fontSize: '11px', color: '#FFA300', margin: '2px 0 0', fontStyle: 'italic' }}>📝 {q.note}</p>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Call Notes */}
      {callNotes?.trim() && (
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#FFA300', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', marginBottom: '12px' }}>
            Notas Gerais da Call
          </h2>
          <p style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{callNotes}</p>
        </div>
      )}

      <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '12px', fontSize: '10px', color: '#9ca3af', textAlign: 'center' }}>
        Gerado por TS Comercial · EuSouTS · {today}
      </div>
    </div>
  )
}

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({ q, cat, onUpdateAnswer, onUpdateNote }) {
  const [showNote, setShowNote] = useState(!!q.note)
  const answered = !!q.answer?.trim()

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      answered ? 'border-[#FFA300]/30 bg-[#FFA300]/3' : 'border-surface-border bg-surface-card'
    }`}>
      {/* Question */}
      <div className="flex items-start gap-3 px-4 pt-3 pb-2">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
          answered ? 'border-[#FFA300] bg-[#FFA300]' : 'border-surface-border'
        }`}>
          {answered
            ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            : <Circle className="w-3.5 h-3.5 text-slate-700" />
          }
        </div>
        <p className="text-sm text-slate-200 leading-relaxed flex-1">{q.question}</p>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${cat.badge}`}>{cat.letter}</span>
      </div>

      {/* Answer */}
      <div className="px-4 pb-2">
        <textarea
          value={q.answer || ''}
          onChange={e => onUpdateAnswer(q.id, e.target.value)}
          placeholder="Resposta do lead..."
          rows={2}
          className="input-field resize-none text-sm placeholder:italic w-full"
        />
      </div>

      {/* Note toggle */}
      <div className="px-4 pb-3">
        {showNote ? (
          <textarea
            autoFocus={!q.note}
            value={q.note || ''}
            onChange={e => onUpdateNote(q.id, e.target.value)}
            placeholder="Anotação interna (não vai para o lead)..."
            rows={1}
            className="input-field resize-none text-xs text-slate-400 placeholder:text-slate-700 w-full border-dashed"
          />
        ) : (
          <button
            onClick={() => setShowNote(true)}
            className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-400 transition-colors"
          >
            <StickyNote className="w-3 h-3" /> Adicionar anotação
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Category Block ───────────────────────────────────────────────────────────
function CategoryBlock({ cat, questions, updateSpinAnswer, updateSpinNote }) {
  const [open, setOpen] = useState(true)
  const qs = questions.filter(q => q.category === cat.key)
  const answered = qs.filter(q => q.answer?.trim()).length

  return (
    <div className={`glass-card overflow-hidden border ${cat.border}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-5 py-4 ${cat.bg} hover:opacity-90 transition-all`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xl font-black ${cat.color} w-7`}>{cat.letter}</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-100">{cat.label}</p>
            <p className="text-xs text-slate-500">{qs.length} perguntas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
            answered === qs.length && qs.length > 0
              ? 'bg-[#FFA300]/10 border-[#FFA300]/30 text-[#FFA300]'
              : 'bg-surface border-surface-border text-slate-500'
          }`}>
            {answered}/{qs.length}
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-3 animate-fade-in">
          {qs.map(q => (
            <QuestionCard
              key={q.id}
              q={q}
              cat={cat}
              onUpdateAnswer={updateSpinAnswer}
              onUpdateNote={updateSpinNote}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Step4CallControl() {
  const {
    leadData, persona,
    spinQuestions,
    updateSpinAnswer, updateSpinNote,
    callNotes, setCallNotes,
    setIntelligenceStep,
    saveLeadToDb, saveStatus,
  } = useApp()

  const totalQ = spinQuestions.length
  const answered = spinQuestions.filter(q => q.answer?.trim()).length
  const pct = totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0

  // Debounced auto-save on answer/notes changes
  const saveTimer = useRef(null)
  const triggerAutoSave = useCallback(() => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { saveLeadToDb() }, 2500)
  }, [saveLeadToDb])

  const handleAnswer = (id, val) => { updateSpinAnswer(id, val); triggerAutoSave() }
  const handleNote = (id, val) => { updateSpinNote(id, val); triggerAutoSave() }
  const handleCallNotes = (val) => { setCallNotes(val); triggerAutoSave() }

  useEffect(() => () => clearTimeout(saveTimer.current), [])

  const handlePrint = () => window.print()

  const savingNow = saveStatus === 'saving'

  return (
    <>
      {ReactDOM.createPortal(
        <PDFView leadData={leadData} persona={persona} spinQuestions={spinQuestions} callNotes={callNotes} />,
        document.body
      )}

      {/* Screen UI */}
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4 sm:space-y-5 animate-fade-in print:hidden">

        {/* Top bar */}
        <div className="glass-card p-4 sm:px-5 sm:py-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
          {/* Row 1 mobile: client + mobile actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <User className="w-4 h-4 text-[#FFA300] flex-shrink-0" />
              <span className="text-sm font-semibold text-slate-100 truncate">
                {leadData.name || leadData.niche || 'Lead'}
              </span>
              {leadData.state && (
                <span className="text-xs text-slate-500 bg-surface px-1.5 py-0.5 rounded border border-surface-border hidden sm:inline flex-shrink-0">{leadData.state}</span>
              )}
            </div>
            {/* Mobile-only buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0 sm:hidden">
              <button
                onClick={() => saveLeadToDb()}
                disabled={savingNow}
                className="btn-ghost text-xs py-1.5 px-2"
              >
                {savingNow ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              </button>
              <button onClick={handlePrint} className="btn-primary text-xs py-1.5 px-3">
                <FileDown className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="sm:flex-1 sm:min-w-0 sm:max-w-[200px]">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{answered}/{totalQ} respondidas</span>
              <span className={pct === 100 ? 'text-[#FFA300] font-semibold' : ''}>{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Desktop-only buttons */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => saveLeadToDb()}
              disabled={savingNow}
              className="btn-ghost text-xs"
            >
              {savingNow ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saveStatus === 'saved' ? 'Salvo!' : 'Salvar'}
            </button>
            <button onClick={handlePrint} className="btn-primary">
              <FileDown className="w-4 h-4" /> Gerar PDF
            </button>
          </div>
        </div>

        {/* SPIN blocks */}
        {CATEGORIES.map(cat => (
          <CategoryBlock
            key={cat.key}
            cat={cat}
            questions={spinQuestions}
            updateSpinAnswer={handleAnswer}
            updateSpinNote={handleNote}
          />
        ))}

        {/* General notes */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-100">Notas Gerais da Call</h3>
          </div>
          <textarea
            value={callNotes}
            onChange={e => handleCallNotes(e.target.value)}
            placeholder="Qualquer informação relevante que não se encaixou nas perguntas... próximos passos, dúvidas, contexto extra..."
            rows={5}
            className="input-field resize-none text-sm w-full"
          />
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => setIntelligenceStep(3)} className="btn-ghost">
            <ArrowLeft className="w-4 h-4" /> Ver perguntas SPIN
          </button>
          <p className="text-xs text-slate-600">
            Dados disponíveis em <span className="text-[#FFA300] font-medium">Fechamento &amp; Proposta</span> →
          </p>
        </div>
      </div>
    </>
  )
}

