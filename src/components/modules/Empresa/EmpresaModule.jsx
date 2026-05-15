import React, { useState } from 'react'
import {
  Building2,
  CheckCircle2,
  Sparkles,
  Users,
  Target,
  Star,
  Zap,
  DollarSign,
  MessageCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  Save,
} from 'lucide-react'
import { useApp } from '../../../context/AppContext'

const SECTIONS = [
  {
    key: 'identity',
    label: 'Identidade da Empresa',
    icon: Building2,
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/8',
    border: 'border-[#FFA300]/20',
    fields: [
      { key: 'name', label: 'Nome da empresa', placeholder: 'Ex: EuSouTS / Trajetória do Sucesso', type: 'input' },
      { key: 'tagline', label: 'Posicionamento / Tagline', placeholder: 'Ex: A assessoria de marketing que acelera PMEs no digital', type: 'input' },
    ],
    tip: 'Isso define como a IA vai se referir à sua empresa nos scripts e propostas.',
  },
  {
    key: 'services',
    label: 'O Que Fazemos',
    icon: Zap,
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/8',
    border: 'border-[#FFA300]/20',
    fields: [
      {
        key: 'services',
        label: 'Serviços e soluções oferecidas',
        placeholder: 'Ex: Gestão de tráfego pago (Meta Ads, Google Ads), produção de conteúdo, gestão de redes sociais, funil de vendas, automação de marketing...',
        type: 'textarea', rows: 4,
      },
      {
        key: 'methodology',
        label: 'Como trabalhamos / metodologia',
        placeholder: 'Ex: Trabalhamos com dedicação exclusiva por nicho, reuniões semanais de acompanhamento, relatórios quinzenais de resultado, squad dedicado por cliente...',
        type: 'textarea', rows: 3,
      },
      {
        key: 'differentials',
        label: 'Diferenciais competitivos',
        placeholder: 'Ex: Somos especializados em PMEs locais, não atendemos mais de X clientes por vez, temos cases comprovados em mais de Y nichos...',
        type: 'textarea', rows: 3,
      },
    ],
    tip: 'Quanto mais detalhado, mais precisa será a persona e as perguntas SPIN geradas.',
  },
  {
    key: 'clients',
    label: 'Clientes e Resultados',
    icon: Users,
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/8',
    border: 'border-[#FFA300]/20',
    fields: [
      {
        key: 'idealClient',
        label: 'Perfil de cliente ideal (ICP)',
        placeholder: 'Ex: Dono de negócio local com faturamento entre R$30k-R$200k/mês, sem equipe de marketing, que já tentou fazer sozinho mas não escalou...',
        type: 'textarea', rows: 3,
      },
      {
        key: 'sectors',
        label: 'Setores/nichos que mais atendemos',
        placeholder: 'Ex: Clínicas de estética, advocacia, pet shops, academia, e-commerce de moda, imobiliárias, restaurantes...',
        type: 'textarea', rows: 2,
      },
      {
        key: 'results',
        label: 'Resultados típicos e cases de sucesso',
        placeholder: 'Ex: Em média nossos clientes triplicam o volume de leads em 90 dias. Case: clínica em SP que saiu de 20 para 120 agendamentos/mês em 4 meses...',
        type: 'textarea', rows: 4,
      },
    ],
    tip: 'A IA usa isso para criar argumentos de valor e metas realistas nas propostas.',
  },
  {
    key: 'commercial',
    label: 'Processo Comercial',
    icon: Target,
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/8',
    border: 'border-[#FFA300]/20',
    fields: [
      {
        key: 'salesProcess',
        label: 'Como funciona nosso processo de vendas',
        placeholder: 'Ex: SDR faz prospecção e agenda reunião → Closer apresenta diagnóstico → Proposta em 24h → Onboarding em até 7 dias após assinatura...',
        type: 'textarea', rows: 3,
      },
      {
        key: 'pricing',
        label: 'Modelo de preços e contratos',
        placeholder: 'Ex: Contratos mensais sem fidelidade, ticket médio entre R$1.500 e R$8.000/mês dependendo do escopo, pagamento via boleto ou cartão...',
        type: 'textarea', rows: 3,
      },
      {
        key: 'commonObjections',
        label: 'Objeções que mais recebemos (e como respondemos)',
        placeholder: 'Ex: "Já tentei agência e não funcionou" → Mostramos nossa metodologia de onboarding e acompanhamento semanal. "Tá caro" → Calculamos o ROI esperado...',
        type: 'textarea', rows: 4,
      },
    ],
    tip: 'A IA vai usar isso para gerar perguntas SPIN que levam o lead a perceber o valor antes de ver o preço.',
  },
  {
    key: 'extra',
    label: 'Contexto Adicional',
    icon: FileText,
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/8',
    border: 'border-[#FFA300]/20',
    fields: [
      {
        key: 'extra',
        label: 'Qualquer outra informação que o SDR/Closer precisa saber',
        placeholder: 'Valores da empresa, tom de comunicação, restrições de nicho, região de atuação, parceiros, tecnologias usadas, informações sobre a equipe...',
        type: 'textarea', rows: 5,
      },
    ],
    tip: 'Campo livre para informações que não se encaixam nas seções acima.',
  },
]

function SectionBlock({ section, values, onChange }) {
  const [open, setOpen] = useState(true)
  const Icon = section.icon
  const filled = section.fields.filter(f => values[f.key]?.trim()).length
  const total = section.fields.length

  return (
    <div className={`glass-card overflow-hidden border ${open ? section.border : 'border-surface-border'} transition-all duration-300`}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-5 py-4 ${open ? section.bg : ''} hover:opacity-90 transition-all`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${section.bg} border ${section.border} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${section.color}`} />
          </div>
          <span className="text-sm font-semibold text-slate-100">{section.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
            filled === total
              ? 'bg-[#FFA300]/10 border-[#FFA300]/30 text-[#FFA300]'
              : filled > 0
              ? `${section.bg} ${section.border} ${section.color}`
              : 'bg-surface border-surface-border text-slate-600'
          }`}>
            {filled}/{total}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 space-y-4 animate-fade-in">
          {section.tip && (
            <div className="flex items-start gap-2 text-xs text-slate-500 bg-surface/50 border border-surface-border rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {section.tip}
            </div>
          )}
          {section.fields.map(field => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{field.label}</label>
              {field.type === 'input' ? (
                <input
                  value={values[field.key] || ''}
                  onChange={e => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="input-field"
                />
              ) : (
                <textarea
                  value={values[field.key] || ''}
                  onChange={e => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.rows || 3}
                  className="input-field resize-none leading-relaxed"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CompletionBanner({ values }) {
  const allFields = SECTIONS.flatMap(s => s.fields)
  const filled = allFields.filter(f => values[f.key]?.trim()).length
  const total = allFields.length
  const pct = Math.round((filled / total) * 100)

  return (
    <div className={`p-4 flex items-center gap-4 ${pct === 100 ? 'card-glow' : 'glass-card'}`}>
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-medium text-slate-300">Contexto preenchido</span>
          <span className={pct === 100 ? 'text-[#FFA300] font-semibold' : ''}>{pct}% ({filled}/{total} campos)</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {pct >= 60 && (
        <div className="flex items-center gap-1.5 text-xs text-[#FFA300] flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Contexto suficiente para a IA</span>
          <span className="sm:hidden">Suficiente</span>
        </div>
      )}
    </div>
  )
}

export default function EmpresaModule() {
  const { companyContext, updateCompanyContext } = useApp()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Data is auto-persisted to localStorage via AppContext effect.
    // This just shows visual feedback.
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="px-4 py-4 sm:p-6 max-w-3xl mx-auto space-y-4 sm:space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#FFA300] flex-shrink-0" />
            Nossa Empresa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Essas informações são injetadas em <strong className="text-slate-400">todos os prompts da IA</strong> — persona, perguntas SPIN e proposta.
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`btn-primary flex-shrink-0 w-full sm:w-auto ${saved ? 'bg-[#FFA300] hover:bg-[#FFA300]' : ''}`}
        >
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar</>}
        </button>
      </div>

      <CompletionBanner values={companyContext} />

      {SECTIONS.map(section => (
        <SectionBlock
          key={section.key}
          section={section}
          values={companyContext}
          onChange={updateCompanyContext}
        />
      ))}

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className={`btn-primary transition-all ${saved ? 'bg-[#FFA300] hover:bg-[#FFA300]' : ''}`}
        >
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar contexto</>}
        </button>
      </div>
    </div>
  )
}

