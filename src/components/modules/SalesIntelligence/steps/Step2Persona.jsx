import React, { useState, useCallback } from 'react'
import {
  User,
  Heart,
  Target,
  MessageCircle,
  Brain,
  Sparkles,
  Pencil,
  Check,
  X,
  Plus,
  Trash2,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Save,
} from 'lucide-react'
import { useApp } from '../../../../context/AppContext'
import { generatePersona } from '../../../../services/geminiService'
import Spinner from '../../../ui/Spinner'

// ─── Editable text block ──────────────────────────────────────────────────────
function EditableText({ value, onChange, rows = 3, className = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const save = () => { onChange(draft); setEditing(false) }
  const cancel = () => { setDraft(value); setEditing(false) }

  if (editing) {
    return (
      <div className="space-y-2">
        <textarea
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={rows}
          className="input-field resize-none text-sm w-full"
        />
        <div className="flex gap-2">
          <button onClick={save} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFA300]/10 border border-[#FFA300]/30 text-[#FFA300] text-xs font-medium hover:bg-[#FFA300]/20">
            <Check className="w-3 h-3" /> Salvar
          </button>
          <button onClick={cancel} className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-surface-hover text-slate-500 text-xs">
            <X className="w-3 h-3" /> Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative">
      <p className={`text-sm leading-relaxed text-slate-300 ${className}`}>{value}</p>
      <button
        onClick={() => { setDraft(value); setEditing(true) }}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-surface-hover text-slate-600 hover:text-slate-300 transition-all"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  )
}

// ─── Editable list ────────────────────────────────────────────────────────────
function EditableList({ items, onChange, dotColor, placeholder }) {
  const [editingIdx, setEditingIdx] = useState(null)
  const [draft, setDraft] = useState('')

  const startEdit = (i) => { setEditingIdx(i); setDraft(items[i]) }
  const saveEdit = () => {
    const next = [...items]
    next[editingIdx] = draft
    onChange(next)
    setEditingIdx(null)
  }
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const addItem = () => onChange([...items, placeholder || 'Novo item'])

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="group flex items-start gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-2 flex-shrink-0`} />
          {editingIdx === i ? (
            <div className="flex-1 flex gap-2 items-start">
              <input
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingIdx(null) }}
                className="input-field flex-1 text-sm py-1"
              />
              <button onClick={saveEdit} className="p-1.5 rounded-lg bg-[#FFA300]/10 text-[#FFA300] hover:bg-[#FFA300]/20 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditingIdx(null)} className="p-1.5 rounded-lg hover:bg-surface-hover text-slate-500 mt-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-start gap-1">
              <span className="text-sm text-slate-300 leading-relaxed flex-1">{item}</span>
              <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity flex-shrink-0">
                <button onClick={() => startEdit(i)} className="p-1 rounded-md hover:bg-surface-hover text-slate-600 hover:text-slate-300">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => removeItem(i)} className="p-1 rounded-md hover:bg-white/10 text-slate-600 hover:text-slate-300">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
      <li>
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#FFA300] transition-colors pl-3.5"
        >
          <Plus className="w-3 h-3" /> Adicionar item
        </button>
      </li>
    </ul>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function PersonaSection({ icon: Icon, label, color, bg, border, children }) {
  return (
    <div className={`rounded-xl border ${border} overflow-hidden`}>
      <div className={`flex items-center gap-2.5 px-4 py-3 ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{label}</span>
        <ChevronRight className={`w-3.5 h-3.5 ${color} ml-auto opacity-40`} />
      </div>
      <div className="px-4 py-3 bg-surface-card/50">{children}</div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Step2Persona() {
  const {
    apiKey, aiModel,
    leadData, companyContext,
    customPrompts,
    persona, setPersona,
    loadingPersona, setLoadingPersona,
    setIntelligenceStep,
    saveLeadToDb,
  } = useApp()

  const [error, setError] = useState('')

  const update = useCallback((field, value) => {
    setPersona(prev => ({ ...prev, [field]: value }))
  }, [setPersona])

  const handleRegenerate = async () => {
    if (!apiKey) { setError('API Key não configurada.'); return }
    setError('')
    setLoadingPersona(true)
    try {
      const result = await generatePersona(apiKey, aiModel, leadData, companyContext, customPrompts)
      setPersona(result)
    } catch (err) {
      setError(`Erro ao regenerar: ${err.message}`)
    } finally {
      setLoadingPersona(false)
    }
  }

  if (!persona) return null

  return (
    <div className="px-4 py-4 sm:p-6 max-w-3xl mx-auto space-y-4 animate-fade-in">

      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Persona Gerada</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Passe o mouse sobre qualquer campo para editar. Ajuste antes de continuar.
          </p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={loadingPersona}
          className="btn-ghost text-xs py-2"
        >
          {loadingPersona ? <Spinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Regenerar
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-slate-300 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {loadingPersona && (
        <div className="glass-card p-8 flex flex-col items-center gap-3 animate-fade-in">
          <Loader2 className="w-6 h-6 text-[#FFA300] animate-spin" />
          <p className="text-sm text-slate-400">Regenerando persona...</p>
        </div>
      )}

      {!loadingPersona && (
        <>
          {/* Perfil */}
          <PersonaSection
            icon={User} label="Perfil"
            color="text-[#FFA300]" bg="bg-[#FFA300]/8" border="border-[#FFA300]/20"
          >
            <EditableText
              value={persona.perfil}
              onChange={v => update('perfil', v)}
              rows={4}
            />
          </PersonaSection>

          {/* Two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PersonaSection
              icon={Heart} label="Dores"
              color="text-[#FFA300]" bg="bg-[#FFA300]/10" border="border-[#FFA300]/20"
            >
              <EditableList
                items={persona.dores || []}
                onChange={v => update('dores', v)}
                dotColor="bg-[#FFA300]"
                placeholder="Nova dor"
              />
            </PersonaSection>

            <PersonaSection
              icon={Target} label="Desejos"
              color="text-[#FFA300]" bg="bg-[#FFA300]/5" border="border-[#FFA300]/20"
            >
              <EditableList
                items={persona.desejos || []}
                onChange={v => update('desejos', v)}
                dotColor="bg-[#FFA300]"
                placeholder="Novo desejo"
              />
            </PersonaSection>
          </div>

          {/* Objeções */}
          <PersonaSection
            icon={MessageCircle} label="Objeções que ele vai usar"
            color="text-[#FFA300]" bg="bg-[#FFA300]/5" border="border-[#FFA300]/20"
          >
            <div className="space-y-2">
              {(persona.objecoes || []).map((obj, i) => (
                <div key={i} className="group flex items-start gap-2 p-2.5 rounded-lg bg-[#FFA300]/5 border border-[#FFA300]/10">
                  <MessageCircle className="w-3.5 h-3.5 text-[#FFA300] mt-0.5 flex-shrink-0" />
                  <EditableText
                    value={obj}
                    onChange={v => {
                      const next = [...persona.objecoes]
                      next[i] = v
                      update('objecoes', next)
                    }}
                    rows={2}
                    className="italic"
                  />
                </div>
              ))}
            </div>
          </PersonaSection>

          {/* Decisão + Valoriza */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PersonaSection
              icon={Brain} label="Como ele decide"
              color="text-[#FFA300]" bg="bg-[#FFA300]/5" border="border-[#FFA300]/20"
            >
              <EditableText
                value={persona.decisao}
                onChange={v => update('decisao', v)}
                rows={3}
              />
            </PersonaSection>

            <PersonaSection
              icon={Sparkles} label="O que valoriza"
              color="text-[#FFA300]" bg="bg-[#FFA300]/5" border="border-[#FFA300]/20"
            >
              <EditableText
                value={persona.valoriza}
                onChange={v => update('valoriza', v)}
                rows={3}
              />
            </PersonaSection>
          </div>

          {/* Continue */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <p className="text-xs text-slate-600 hidden sm:block">Persona aprovada? Salve e avance para as perguntas.</p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={async () => { await saveLeadToDb({ persona }) }}
                className="btn-ghost text-xs py-2"
              >
                <Save className="w-3.5 h-3.5" /> Salvar
              </button>
              <button
                onClick={async () => {
                  await saveLeadToDb({ persona })
                  setIntelligenceStep(3)
                }}
                className="btn-primary px-5 sm:px-6 py-2.5"
              >
                Gerar SPIN <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

