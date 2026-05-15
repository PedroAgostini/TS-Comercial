import React from 'react'
import { Check, RotateCcw, Save, Loader2, CheckCircle2, AlertCircle, WifiOff } from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import Step1Input from './steps/Step1Input'
import Step2Persona from './steps/Step2Persona'
import Step3Spin from './steps/Step3Spin'
import Step4CallControl from './steps/Step4CallControl'

const STEPS = [
  { n: 1, label: 'Lead & Transcrição', short: 'Input' },
  { n: 2, label: 'Persona', short: 'Persona' },
  { n: 3, label: 'SPIN Selling', short: 'SPIN' },
  { n: 4, label: 'Controle de Call', short: 'Call' },
]

function SaveBadge() {
  const { saveStatus, saveLeadToDb, dbConnected, persona } = useApp()

  if (!dbConnected) return null
  if (!persona) return null

  const cfg = {
    idle:   { icon: Save,          cls: 'text-slate-500 hover:text-slate-300', label: 'Salvar', spin: false },
    saving: { icon: Loader2,       cls: 'text-[#FFA300] cursor-wait',          label: 'Salvando...', spin: true },
    saved:  { icon: CheckCircle2,  cls: 'text-[#FFA300]',                    label: 'Salvo!', spin: false },
    error:  { icon: AlertCircle,   cls: 'text-slate-300',                        label: 'Erro ao salvar', spin: false },
    'no-db':{ icon: WifiOff,       cls: 'text-slate-600',                      label: 'Sem DB', spin: false },
  }[saveStatus] || { icon: Save, cls: 'text-slate-500', label: 'Salvar', spin: false }

  const Icon = cfg.icon
  return (
    <button
      onClick={() => saveLeadToDb()}
      disabled={saveStatus === 'saving'}
      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${cfg.cls}`}
    >
      <Icon className={`w-3.5 h-3.5 ${cfg.spin ? 'animate-spin' : ''}`} />
      {cfg.label}
    </button>
  )
}

function StepBar() {
  const { intelligenceStep, resetIntelligence } = useApp()

  return (
    <div className="border-b border-surface-border bg-surface-card px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Steps */}
        <div className="flex items-center gap-0">
          {STEPS.map((step, idx) => {
            const done = intelligenceStep > step.n
            const active = intelligenceStep === step.n
            return (
              <React.Fragment key={step.n}>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`
                    w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 flex-shrink-0
                    ${done ? 'bg-[#FFA300] border-[#FFA300] text-white'
                      : active ? 'bg-[#FFA300] border-[#FFA300] text-white'
                      : 'bg-transparent border-surface-border text-slate-600'}
                  `}>
                    {done ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : step.n}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block transition-colors duration-200 ${
                    active ? 'text-slate-100' : done ? 'text-[#FFA300]' : 'text-slate-600'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-4 sm:w-10 h-px mx-1 sm:mx-2 transition-all duration-300 ${done ? 'bg-[#FFA300]/50' : 'bg-surface-border'}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-4">
          <SaveBadge />
          {intelligenceStep > 1 && (
            <button
              onClick={resetIntelligence}
              className="btn-ghost text-xs py-1.5 px-3 flex-shrink-0"
              title="Reiniciar do zero"
            >
              <RotateCcw className="w-3 h-3" />
              Novo lead
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SalesIntelligenceModule() {
  const { intelligenceStep } = useApp()

  return (
    <div className="flex flex-col h-full">
      <StepBar />
      <div className="flex-1 overflow-y-auto">
        {intelligenceStep === 1 && <Step1Input />}
        {intelligenceStep === 2 && <Step2Persona />}
        {intelligenceStep === 3 && <Step3Spin />}
        {intelligenceStep === 4 && <Step4CallControl />}
      </div>
    </div>
  )
}

