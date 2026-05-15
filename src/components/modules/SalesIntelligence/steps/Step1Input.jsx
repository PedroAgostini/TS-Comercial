import React, { useState, useRef, useCallback } from 'react'
import {
  Upload,
  FileText,
  X,
  User,
  Building2,
  MapPin,
  Sparkles,
  AlertTriangle,
  MessageSquare,
  ClipboardPaste,
  Loader2,
} from 'lucide-react'
import { useApp } from '../../../../context/AppContext'
import { generatePersona } from '../../../../services/geminiService'
import Spinner from '../../../ui/Spinner'


export default function Step1Input() {
  const {
    apiKey, aiModel,
    leadData, updateLeadData,
    companyContext,
    customPrompts,
    setPersona,
    loadingPersona, setLoadingPersona,
    setIntelligenceStep,
  } = useApp()

  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (!file) return
    if (!file.name.endsWith('.txt')) {
      setError('Por favor, envie apenas arquivos .txt')
      return
    }
    if (file.size > 500_000) {
      setError('Arquivo muito grande. Máximo: 500 KB.')
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      updateLeadData('transcription', e.target.result)
      setError('')
    }
    reader.readAsText(file, 'UTF-8')
  }, [updateLeadData])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)

  const clearFile = () => {
    setFileName('')
    updateLeadData('transcription', '')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleGenerate = async () => {
    if (!apiKey) { setError('Configure a API Key do Gemini nas Configurações.'); return }
    if (!leadData.niche.trim()) { setError('Preencha o nicho do lead.'); return }
    setError('')
    setLoadingPersona(true)

    try {
      const result = await generatePersona(apiKey, aiModel, leadData, companyContext, customPrompts)
      setPersona(result)
      setIntelligenceStep(2)
    } catch (err) {
      setError(`Erro ao gerar persona: ${err.message}`)
    } finally {
      setLoadingPersona(false)
    }
  }

  const charCount = leadData.transcription?.length || 0

  return (
    <div className="px-4 py-4 sm:p-6 max-w-3xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">

      {/* Client Info */}
      <section className="glass-card p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <User className="w-4 h-4 text-[#FFA300]" />
          <h2 className="text-sm font-semibold text-slate-100">Informações do Lead</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> Nome / Empresa</span>
            </label>
            <input
              value={leadData.name}
              onChange={e => updateLeadData('name', e.target.value)}
              placeholder="Ex: Clínica Bella Vida"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Nicho *</span>
            </label>
            <input
              value={leadData.niche}
              onChange={e => updateLeadData('niche', e.target.value)}
              placeholder="Ex: Clínica de Estética"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Localização</span>
            </label>
            <input
              value={leadData.state}
              onChange={e => updateLeadData('state', e.target.value)}
              placeholder="Ex: São Paulo, SP"
              className="input-field"
            />
          </div>
        </div>
      </section>

      {/* Transcription Upload */}
      <section className="glass-card p-5">
        <div className="flex items-center gap-2.5 mb-1">
          <MessageSquare className="w-4 h-4 text-[#FFA300]" />
          <h2 className="text-sm font-semibold text-slate-100">Transcrição / Histórico</h2>
          <span className="text-xs text-slate-600 ml-auto">opcional — enriquece a persona</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Suba o TXT do WhatsApp, transcrição da call (Hunter) ou cole o texto direto abaixo.
        </p>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !fileName && fileRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 mb-4
            ${dragOver
              ? 'border-[#FFA300] bg-[#FFA300]/10 cursor-copy'
              : fileName
              ? 'border-[#FFA300]/40 bg-[#FFA300]/5 cursor-default'
              : 'border-surface-border hover:border-[#FFA300]/50 hover:bg-surface-hover cursor-pointer'
            }
          `}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />

          {fileName ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-5 h-5 text-[#FFA300]" />
              <div className="text-left">
                <p className="text-sm font-medium text-[#FFA300]">{fileName}</p>
                <p className="text-xs text-slate-500">{charCount.toLocaleString()} caracteres carregados</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); clearFile() }}
                className="ml-2 p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <Upload className={`w-7 h-7 mx-auto mb-2 transition-colors ${dragOver ? 'text-[#FFA300]' : 'text-slate-600'}`} />
              <p className="text-sm text-slate-400">Arraste o arquivo .txt aqui ou <span className="text-[#FFA300]">clique para selecionar</span></p>
              <p className="text-xs text-slate-600 mt-1">Suporte: WhatsApp export, transcrição Hunter, qualquer .txt</p>
            </div>
          )}
        </div>

        {/* Manual text area */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
            <ClipboardPaste className="w-3 h-3" />
            Ou cole o texto aqui
          </label>
          <textarea
            value={leadData.transcription}
            onChange={e => {
              updateLeadData('transcription', e.target.value)
              if (e.target.value && fileName) setFileName('')
            }}
            placeholder="Cole aqui a conversa do WhatsApp, transcrição da call, anotações do SDR..."
            rows={6}
            className="input-field resize-none font-mono text-xs leading-relaxed"
          />
          {charCount > 0 && (
            <p className="text-xs text-slate-600 mt-1 text-right">{charCount.toLocaleString()} caracteres</p>
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-slate-300 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleGenerate}
          disabled={loadingPersona || !leadData.niche.trim()}
          className="btn-primary text-base px-6 py-3"
        >
          {loadingPersona
            ? <><Spinner size="sm" /> Gerando Persona...</>
            : <><Sparkles className="w-4 h-4" /> Gerar Persona com IA</>
          }
        </button>
        {loadingPersona && (
          <p className="text-xs text-slate-500 animate-pulse">
            Analisando nicho{leadData.transcription ? ', lendo transcrição' : ''}...
          </p>
        )}
      </div>
    </div>
  )
}

