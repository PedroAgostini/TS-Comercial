import React, { useState } from 'react'
import {
  Target,
  Calculator,
  ClipboardCheck,
  Flame,
  ChevronDown,
  ChevronUp,
  Check,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Zap,
  Clock,
  Star,
  Users,
  Lock,
  Copy,
  Globe,
} from 'lucide-react'

// ── CPL presets by niche ──────────────────────────────────────────────────────
const NICHE_CPL = {
  'Clínica de Estética': 45,
  'Clínica Médica / Saúde': 60,
  'Advocacia / Escritório Jurídico': 120,
  'Imobiliária / Construção': 90,
  'Academia / Personal Trainer': 30,
  'Restaurante / Alimentação': 25,
  'Escola / Curso / Educação': 35,
  'Odontologia': 55,
  'Salão de Beleza / Barbearia': 20,
  'Consultoria / Serviços B2B': 150,
  'E-commerce / Loja Online': 15,
  'Concessionária / Automóveis': 80,
  'Contabilidade': 100,
  'Outro / Personalizado': 0,
}

// ── ROI Calculator ────────────────────────────────────────────────────────────
function ROICalc() {
  const [adBudget, setAdBudget] = useState(2000)
  const [ticket, setTicket] = useState('')
  const [convRate, setConvRate] = useState('')
  const [agencyFee, setAgencyFee] = useState('')
  const [currency, setCurrency] = useState('BRL')
  const [niche, setNiche] = useState('Clínica de Estética')
  const [customCpl, setCustomCpl] = useState('')

  const isCustomNiche = niche === 'Outro / Personalizado'
  const cpl = isCustomNiche ? (parseFloat(customCpl) || 0) : NICHE_CPL[niche]

  const avgTicket = parseFloat(ticket) || 0
  const rate = parseFloat(convRate) / 100 || 0
  const fee = parseFloat(agencyFee) || 0

  const estLeads = cpl > 0 ? Math.round(adBudget / cpl) : 0
  const estSales = Math.round(estLeads * rate)
  const estRevenue = estSales * avgTicket
  const totalInvestment = fee + adBudget
  const roi = totalInvestment > 0 && estRevenue > 0
    ? (((estRevenue - totalInvestment) / totalInvestment) * 100).toFixed(0)
    : null
  const payback = estRevenue > 0 ? (totalInvestment / estRevenue).toFixed(1) : null

  const sym = currency === 'BRL' ? 'R$' : 'US$'
  const fmt = (n) => n.toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US')

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <Calculator className="w-4 h-4 text-[#FFA300]" />
        <h3 className="text-sm font-semibold text-slate-100">Calculadora de ROI</h3>
        <span className="text-xs text-slate-600 hidden sm:inline">(projeção de retorno em tráfego pago)</span>
        {/* Currency toggle */}
        <div className="ml-auto flex items-center gap-1 p-0.5 bg-surface border border-surface-border rounded-lg">
          {['BRL', 'USD'].map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                currency === c ? 'bg-[#FFA300] text-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3 h-3" />
              {c === 'BRL' ? 'R$' : 'US$'}
            </button>
          ))}
        </div>
      </div>

      {/* Niche picker */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Nicho do Lead</label>
        <select
          value={niche}
          onChange={e => setNiche(e.target.value)}
          className="input-field"
        >
          {Object.keys(NICHE_CPL).map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        {!isCustomNiche && (
          <p className="text-xs text-slate-600 mt-1">CPL estimado para esse nicho: <strong className="text-[#FFA300]">{sym} {cpl}</strong></p>
        )}
      </div>

      {isCustomNiche && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">CPL Personalizado ({sym})</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
            <input
              type="number"
              value={customCpl}
              onChange={e => setCustomCpl(e.target.value)}
              placeholder="Ex: 80"
              className="input-field pl-8"
              min="0"
            />
          </div>
        </div>
      )}

      {/* Traffic budget slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-400">Verba de Tráfego/mês</label>
          <span className="text-sm font-bold text-[#FFA300]">{sym} {fmt(adBudget)}</span>
        </div>
        <input
          type="range"
          min={500}
          max={50000}
          step={500}
          value={adBudget}
          onChange={e => setAdBudget(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #FFA300 0%, #FFA300 ${((adBudget - 500) / (50000 - 500)) * 100}%, #2a2a2a ${((adBudget - 500) / (50000 - 500)) * 100}%, #2a2a2a 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>{sym} 500</span>
          <span>{sym} 50k</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: `Ticket Médio do Cliente (${sym})`, val: ticket, set: setTicket, placeholder: '800', icon: Star },
          { label: 'Taxa de Conversão (%)', val: convRate, set: setConvRate, placeholder: '5', icon: TrendingUp },
          { label: `Mensalidade da Agência (${sym})`, val: agencyFee, set: setAgencyFee, placeholder: '3500', icon: Users },
        ].map(f => {
          const Icon = f.icon
          return (
            <div key={f.label}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                <input
                  type="number"
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="input-field pl-8"
                  min="0"
                />
              </div>
            </div>
          )
        })}
      </div>

      {roi !== null && (
        <div className="border-t border-surface-border pt-4 animate-fade-in">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Projeção Mensal</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ROIStat label="Leads Estimados" value={estLeads} color="text-[#FFA300]" />
            <ROIStat label="Vendas Estimadas" value={estSales} color="text-[#FFA300]" />
            <ROIStat label="Faturamento Est." value={`${sym} ${fmt(estRevenue)}`} color="text-[#FFA300]" />
            <ROIStat label="ROI" value={`${roi}%`} color={parseInt(roi) >= 0 ? 'text-[#FFA300]' : 'text-red-400'} />
          </div>
          {payback && (
            <p className="text-xs text-slate-500 mt-3">
              Payback estimado: <strong className="text-slate-300">{payback} meses</strong> — para cada {sym} 1 investido, retorno estimado de{' '}
              <strong className="text-[#FFA300]">{sym} {parseInt(roi) > 0 ? (1 + parseInt(roi) / 100).toFixed(2) : '0.00'}</strong>
            </p>
          )}
          <p className="text-xs text-slate-600 mt-2">* Estimativa baseada em CPL médio do nicho. Resultados reais variam por sazonalidade e qualidade das campanhas.</p>
        </div>
      )}
    </div>
  )
}

function ROIStat({ label, value, color, bg = 'bg-surface border-surface-border' }) {
  return (
    <div className={`text-center p-3 rounded-lg bg-surface border border-surface-border`}>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

// ── Closing Checklist ─────────────────────────────────────────────────────────
const CHECKLIST_ITEMS = [
  { id: 'budget', label: 'Verba de investimento definida e aprovada', category: 'financeiro' },
  { id: 'decision', label: 'Tomador de decisão final está presente/ciente', category: 'decisao' },
  { id: 'pain', label: 'Dor principal confirmada e documentada', category: 'vendas' },
  { id: 'plan', label: 'Plano apresentado e compreendido pelo lead', category: 'vendas' },
  { id: 'goals', label: 'Metas e expectativas alinhadas e realistas', category: 'vendas' },
  { id: 'timeline', label: 'Prazo de início combinado', category: 'operacional' },
  { id: 'access', label: 'Acessos necessários listados (Meta, Google, site...)', category: 'operacional' },
  { id: 'contract', label: 'Contrato revisado e pronto para assinar', category: 'juridico' },
  { id: 'payment', label: 'Forma de pagamento definida e link pronto', category: 'financeiro' },
  { id: 'onboarding', label: 'Data do kickoff/onboarding marcada', category: 'operacional' },
]

const CATEGORY_COLORS = {
  financeiro: 'text-[#FFA300]',
  decisao: 'text-[#FFA300]',
  vendas: 'text-[#FFA300]',
  operacional: 'text-[#FFA300]',
  juridico: 'text-[#FFA300]',
}

function ClosingChecklist() {
  const [checked, setChecked] = useState({})
  const total = CHECKLIST_ITEMS.length
  const done = Object.values(checked).filter(Boolean).length
  const pct = Math.round((done / total) * 100)

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <ClipboardCheck className="w-4 h-4 text-[#FFA300]" />
          <h3 className="text-sm font-semibold text-slate-100">Checklist de Fechamento</h3>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
          pct === 100
            ? 'bg-[#FFA300]/10 border-[#FFA300]/30 text-[#FFA300]'
            : pct >= 70
            ? 'bg-[#FFA300]/10 border-[#FFA300]/30 text-[#FFA300]'
            : 'bg-surface-border text-slate-500'
        }`}>
          {done}/{total} - {pct}%
        </div>
      </div>

      <div className="w-full h-1.5 bg-surface rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-[#FFA300]' : 'bg-[#FFA300]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map(item => (
          <label
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
              checked[item.id]
                ? 'bg-[#FFA300]/5 border-[#FFA300]/20'
                : 'bg-surface border-surface-border hover:bg-surface-hover'
            }`}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              checked[item.id]
                ? 'bg-[#FFA300] border-[#FFA300]'
                : 'border-surface-border'
            }`}>
              {checked[item.id] && <Check className="w-3 h-3 text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={!!checked[item.id]} onChange={() => toggle(item.id)} />
            <span className={`text-sm flex-1 ${checked[item.id] ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
              {item.label}
            </span>
            <span className={`text-xs font-medium ${CATEGORY_COLORS[item.category]}`}>
              {item.category}
            </span>
          </label>
        ))}
      </div>

      {pct === 100 && (
        <div className="mt-4 p-3 rounded-lg bg-[#FFA300]/10 border border-[#FFA300]/30 text-center animate-fade-in">
          <p className="text-sm font-semibold text-[#FFA300]">🎉 Tudo alinhado! Manda o link de pagamento.</p>
        </div>
      )}
    </div>
  )
}

// ── Mental Triggers ───────────────────────────────────────────────────────────
const TRIGGERS = [
  {
    name: 'Urgência Ética',
    icon: Clock,
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/20',
    scripts: [
      '"Nossa capacidade de onboarding esse mês está quase fechada - tenho só {X} vagas. Não quero te perder por isso."',
      '"Cada mês que passa sem marketing estruturado é receita que vai pro seu concorrente. Não é pressão, é dado."',
      '"Se você começar hoje, em 90 dias já terá resultados palpáveis. Se esperar mais um mês, esse prazo se desloca."',
    ],
  },
  {
    name: 'Prova Social',
    icon: Users,
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/20',
    scripts: [
      '"Temos um cliente no mesmo nicho que você em {cidade} - em 4 meses ele {resultado concreto}. Posso te mostrar?"',
      '"Essa estratégia que te apresentei funcionou especificamente pra {nicho similar} - e o perfil do negócio é bem parecido."',
      '"Olha, não sou eu dizendo - são os números dos clientes que já fizeram esse movimento."',
    ],
  },
  {
    name: 'Escassez Real',
    icon: Lock,
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/20',
    scripts: [
      '"Trabalho com dedicação exclusiva - por isso não atendo mais de {X} clientes por vez. Hoje tenho {Y} vaga(s)."',
      '"O plano que você precisa não está mais aberto para novos clientes a partir de {data} - estamos reestruturando."',
      '"Esse valor que te passei é o que está em vigor agora. Em {mês} teremos reajuste."',
    ],
  },
  {
    name: 'Autoridade',
    icon: Star,
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/20',
    scripts: [
      '"Analisamos mais de {X} negócios no seu nicho. O padrão que vejo é exatamente o que você me descreveu."',
      '"Somos especializados em {nicho} - não atendemos todo tipo de negócio justamente pra ser referência no seu segmento."',
      '"Te falo como especialista: o que você tá fazendo hoje não vai te levar onde você quer chegar."',
    ],
  },
  {
    name: 'Perda (Loss Aversion)',
    icon: Zap,
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/10',
    border: 'border-[#FFA300]/20',
    scripts: [
      '"Pensa comigo: manter o que tá ruim não é de graça. Você já tá perdendo {estimativa} por mês sem marketing."',
      '"Seu concorrente provavelmente já tá anunciando. Cada dia sem marketing é mais distância pra recuperar depois."',
      '"O custo de não decidir é mais alto que o custo de contratar. Posso te ajudar a ver esse número?"',
    ],
  },
]

function TriggerCard({ trigger }) {
  const [open, setOpen] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const Icon = trigger.icon

  const copy = async (text, i) => {
    const clean = text.replace(/^"|"$/g, '')
    await navigator.clipboard.writeText(clean)
    setCopiedIdx(i)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <div className={`glass-card overflow-hidden border ${trigger.border}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3.5 ${trigger.bg} hover:opacity-90 transition-all`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg ${trigger.bg} border ${trigger.border} flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${trigger.color}`} />
          </div>
          <p className={`text-sm font-semibold ${trigger.color}`}>{trigger.name}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      {open && (
        <div className="p-4 space-y-2 animate-fade-in">
          {trigger.scripts.map((s, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-surface border border-surface-border group">
              <p className="text-sm text-slate-300 leading-relaxed flex-1 italic">{s}</p>
              <button
                onClick={() => copy(s, i)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-surface-hover text-slate-600 transition-all"
              >
                {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-[#FFA300]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Module ───────────────────────────────────────────────────────────────
export default function CloserToolboxModule() {
  const [tab, setTab] = useState('roi')

  const tabs = [
    { id: 'roi', label: 'ROI', icon: Calculator },
    { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
    { id: 'triggers', label: 'Gatilhos', icon: Flame },
  ]

  return (
    <div className="px-4 py-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
        <Target className="w-5 h-5 text-[#FFA300]" />
        <h2 className="text-sm font-semibold text-slate-100">Ferramentas do Closer</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-card border border-surface-border rounded-xl mb-4 sm:mb-6 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0 whitespace-nowrap ${
                tab === t.id
                  ? 'bg-[#FFA300] text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'roi' && (
        <div className="animate-fade-in">
          <ROICalc />
          <div className="glass-card p-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-[#FFA300]" />
              <p className="text-sm font-semibold text-slate-200">Como usar na call</p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Preencha com os dados do lead durante a conversa. Mostre o ROI projetado na tela - ver os números concretos é muito mais persuasivo do que descrever verbalmente. Use como ancoragem: <em className="text-slate-300">"Se o retorno projetado é {`{X}`}, o investimento de {`{Y}`} já se paga em {`{Z}`} meses."</em>
            </p>
          </div>
        </div>
      )}

      {tab === 'checklist' && (
        <div className="animate-fade-in">
          <ClosingChecklist />
        </div>
      )}

      {tab === 'triggers' && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm text-slate-500 mb-4">
            Gatilhos mentais éticos - fundamentados em situações reais. Use com contexto e honestidade. Passe o mouse para copiar o script.
          </p>
          {TRIGGERS.map(t => <TriggerCard key={t.name} trigger={t} />)}
        </div>
      )}
    </div>
  )
}

