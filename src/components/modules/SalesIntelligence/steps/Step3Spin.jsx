import React, { useState, useEffect } from 'react'
import {
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Loader2,
  GripVertical,
} from 'lucide-react'
import { useApp } from '../../../../context/AppContext'
import { generateSpinQuestions } from '../../../../services/geminiService'
import Spinner from '../../../ui/Spinner'

const CATEGORIES = [
  {
    key: 'situacao', letter: 'S', label: 'Situação',
    desc: 'Entenda o contexto atual do negócio',
    color: 'text-[#FFA300]', bg: 'bg-[#FFA300]/10', border: 'border-[#FFA300]/30', dot: 'bg-[#FFA300]',
  },
  {
    key: 'problema', letter: 'P', label: 'Problema',
    desc: 'Revele as dores e desafios do lead',
    color: 'text-[#FFA300]', bg: 'bg-[#FFA300]/10', border: 'border-[#FFA300]/30', dot: 'bg-[#FFA300]',
  },
  {
    key: 'implicacao', letter: 'I', label: 'Implicação',
    desc: 'Faça o lead sentir o custo do problema',
    color: 'text-[#FFA300]', bg: 'bg-[#FFA300]/10', border: 'border-[#FFA300]/30', dot: 'bg-[#FFA300]',
  },
  {
    key: 'necessidade', letter: 'N', label: 'Necessidade de Solução',
    desc: 'Crie o desejo pela solução',
    color: 'text-[#FFA300]', bg: 'bg-[#FFA300]/10', border: 'border-[#FFA300]/30', dot: 'bg-[#FFA300]',
  },
]

function QuestionRow({ q, index, cat, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(q.manual && !q.question)
  const [draft, setDraft] = useState(q.question)

  const save = () => {
    onUpdate(q.id, draft)
    setEditing(false)
  }

  return (
    <div className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
      editing ? 'border-[#FFA300]/50 bg-[#FFA300]/5' : 'border-surface-border bg-surface hover:border-surface-border/80'
    }`}>
      {/* Index badge */}
      <div className={`w-6 h-6 rounded-md ${cat.bg} border ${cat.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <span className={`text-xs font-bold ${cat.color}`}>{index + 1}</span>
      </div>

      {/* Question */}
      {editing ? (
        <div className="flex-1 flex gap-2 items-start">
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(q.question); setEditing(false) } }}
            placeholder="Digite a pergunta..."
            className="input-field flex-1 text-sm"
          />
          <button onClick={save} className="p-2 rounded-lg bg-[#FFA300]/10 text-[#FFA300] hover:bg-[#FFA300]/20 mt-0.5">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => { setDraft(q.question); setEditing(false) }} className="p-2 rounded-lg hover:bg-surface-hover text-slate-500 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <p className="flex-1 text-sm text-slate-200 leading-relaxed">{q.question || <span className="text-slate-600 italic">Clique no lápis para escrever...</span>}</p>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={() => { setDraft(q.question); setEditing(true) }} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-surface-hover">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onRemove(q.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/10">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function SpinBlock({ cat, questions, onUpdate, onRemove, onAdd }) {
  const catQs = questions.filter(q => q.category === cat.key)

  return (
    <div className={`glass-card overflow-hidden border ${cat.border}`}>
      {/* Header */}
      <div className={`flex items-center gap-3 px-5 py-3.5 ${cat.bg}`}>
        <div className={`w-9 h-9 rounded-xl ${cat.bg} border ${cat.border} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-lg font-black ${cat.color}`}>{cat.letter}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100">{cat.label}</p>
          <p className="text-xs text-slate-500">{cat.desc}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.bg} border ${cat.border} ${cat.color}`}>
          {catQs.length} perguntas
        </span>
      </div>

      {/* Questions */}
      <div className="p-4 space-y-2">
        {catQs.map((q, i) => (
          <QuestionRow
            key={q.id}
            q={q}
            index={i}
            cat={cat}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
        <button
          onClick={() => onAdd(cat.key)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-surface-border hover:border-[#FFA300]/40 text-xs text-slate-600 hover:text-[#FFA300] transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar pergunta
        </button>
      </div>
    </div>
  )
}

export default function Step3Spin() {
  const {
    apiKey, aiModel,
    leadData, persona, companyContext,
    customPrompts,
    spinQuestions, setSpinQuestions,
    updateSpinQuestion, removeSpinQuestion, addManualSpinQuestion,
    loadingSpin, setLoadingSpin,
    setIntelligenceStep,
    saveLeadToDb,
  } = useApp()

  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(spinQuestions.length > 0)

  // Auto-generate on first enter if no questions yet
  useEffect(() => {
    if (spinQuestions.length === 0 && apiKey && persona) {
      handleGenerate()
    }
  }, [])

  const handleGenerate = async () => {
    if (!apiKey) { setError('API Key não configurada.'); return }
    setError('')
    setLoadingSpin(true)
    try {
      const result = await generateSpinQuestions(apiKey, aiModel, { persona, leadData, companyContext }, customPrompts)
      const questions = []
      Object.entries(result).forEach(([category, qs]) => {
        qs.forEach(q => questions.push({
          id: crypto.randomUUID(),
          category,
          question: q,
          answer: '',
          note: '',
        }))
      })
      setSpinQuestions(questions)
      setGenerated(true)
    } catch (err) {
      setError(`Erro ao gerar perguntas: ${err.message}`)
    } finally {
      setLoadingSpin(false)
    }
  }

  const totalQ = spinQuestions.length

  return (
    <div className="px-4 py-4 sm:p-6 max-w-3xl mx-auto space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Perguntas SPIN Selling</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalQ} perguntas geradas · Edite ou exclua antes de entrar na call
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loadingSpin}
          className="btn-ghost text-xs py-2"
        >
          {loadingSpin ? <Spinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Regenerar tudo
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-slate-300 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Loading */}
      {loadingSpin && (
        <div className="glass-card p-12 flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-[#FFA300]/10 border border-[#FFA300]/20 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#FFA300] animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full border border-[#FFA300]/20 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-200">Gerando 20 perguntas SPIN...</p>
            <p className="text-xs text-slate-500 mt-1">Personalizadas para {leadData.niche}</p>
          </div>
        </div>
      )}

      {/* Blocks */}
      {!loadingSpin && generated && (
        <>
          {CATEGORIES.map(cat => (
            <SpinBlock
              key={cat.key}
              cat={cat}
              questions={spinQuestions}
              onUpdate={updateSpinQuestion}
              onRemove={removeSpinQuestion}
              onAdd={addManualSpinQuestion}
            />
          ))}
        </>
      )}

      {/* Nav */}
      {!loadingSpin && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <button onClick={() => setIntelligenceStep(2)} className="btn-ghost text-xs sm:text-sm">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Voltar para </span>Persona
          </button>
          <button
            onClick={async () => {
              await saveLeadToDb({ spinQuestions })
              setIntelligenceStep(4)
            }}
            disabled={spinQuestions.length === 0}
            className="btn-primary px-4 sm:px-6 py-2.5"
          >
            <span className="hidden sm:inline">Salvar e entrar na </span>Call <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

