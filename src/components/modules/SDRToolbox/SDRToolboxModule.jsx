import React, { useState } from 'react'
import {
  Zap,
  Calculator,
  Shield,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  TrendingUp,
} from 'lucide-react'

// ── Conversion Calculator ─────────────────────────────────────────────────────
function ConversionCalc() {
  const [leads, setLeads] = useState('')
  const [meetings, setMeetings] = useState('')
  const [closes, setCloses] = useState('')

  const leadRate = leads && meetings ? ((meetings / leads) * 100).toFixed(1) : null
  const closeRate = meetings && closes ? ((closes / meetings) * 100).toFixed(1) : null
  const overallRate = leads && closes ? ((closes / leads) * 100).toFixed(1) : null

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <Calculator className="w-4 h-4 text-[#FFA300]" />
        <h3 className="text-sm font-semibold text-slate-100">Calculadora de Taxa de Conversão</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Leads Abordados', value: leads, set: setLeads, placeholder: '100' },
          { label: 'Reuniões Agendadas', value: meetings, set: setMeetings, placeholder: '20' },
          { label: 'Fechamentos', value: closes, set: setCloses, placeholder: '5' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
            <input
              type="number"
              value={f.value}
              onChange={e => f.set(e.target.value)}
              placeholder={f.placeholder}
              className="input-field"
              min="0"
            />
          </div>
        ))}
      </div>
      {(leadRate || closeRate || overallRate) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-surface-border">
          <Stat label="Lead → Reunião" value={leadRate} suffix="%" color="text-[#FFA300]" />
          <Stat label="Reunião → Fechamento" value={closeRate} suffix="%" color="text-[#FFA300]" />
          <Stat label="Taxa Geral" value={overallRate} suffix="%" color="text-[#FFA300]" />
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, suffix, color }) {
  if (!value) return <div />
  return (
    <div className="text-center px-3 py-2.5 rounded-lg bg-surface border border-surface-border">
      <p className={`text-2xl font-bold ${color}`}>{value}{suffix}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

// ── Objection Matrix ──────────────────────────────────────────────────────────
const OBJECTIONS = [
  {
    trigger: '"Tá caro"',
    category: 'Preço',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/5',
    border: 'border-[#FFA300]/20',
    responses: [
      'Entendo. Posso te perguntar: comparando com o quê? Muitos clientes que falam isso estão comparando com fazer nada — e aí sim fica caro, porque os concorrentes ficam crescendo.',
      '"Caro" é quando você paga e não tem retorno. O que eu te proponho é diferente: a gente projeta juntos o que você precisa faturar a mais para o investimento se pagar. Você topa fazer essa conta?',
      'Faz sentido a sua preocupação. Me conta: qual seria o valor ideal pra você? Quero entender o que cabe no seu cenário hoje.',
    ],
  },
  {
    trigger: '"Não tenho tempo agora"',
    category: 'Tempo',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/5',
    border: 'border-[#FFA300]/20',
    responses: [
      'Entendo completamente. A maioria dos donos de negócio que fala isso está sobrecarregado exatamente porque ainda não tem um sistema de marketing funcionando. A gente resolve justamente esse problema.',
      'Faz sentido. Mas me fala uma coisa: se esse problema continuar do jeito que tá mais uns 6 meses, o que acontece com o seu negócio?',
      'Sem problema. Posso marcar 15 minutinhos na próxima semana? Só pra você entender o que seria o próximo passo, sem compromisso.',
    ],
  },
  {
    trigger: '"Deixa eu pensar"',
    category: 'Indecisão',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/5',
    border: 'border-[#FFA300]/20',
    responses: [
      'Claro, faz todo sentido. Me ajuda a entender: o que exatamente você precisa avaliar? Assim eu consigo trazer a informação certa pra você decidir.',
      'Que parte ficou com dúvida? Normalmente quando alguém quer pensar é porque algo ainda não ficou claro, e eu prefiro resolver agora do que deixar no ar.',
      'Tudo bem. Posso te perguntar: existe alguma coisa que me impediria de ter uma resposta até amanhã?',
    ],
  },
  {
    trigger: '"Já tentei e não funcionou"',
    category: 'Experiência negativa',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/5',
    border: 'border-[#FFA300]/20',
    responses: [
      'Que bom que você falou isso — é exatamente o que mais escuto. Me conta: o que foi feito? Quero entender onde quebrou, porque na maioria dos casos não foi o marketing que falhou, foi a estratégia por trás.',
      'Faz total sentido ter essa desconfiança. Posso te mostrar em 5 minutos o que a gente faz diferente? Se não fizer sentido, você desliga sem problema.',
      'Entendo. E o que você acha que faltou naquela experiência? Pergunto porque cada negócio tem um gargalo diferente, e o erro mais comum é aplicar solução errada pro problema.',
    ],
  },
  {
    trigger: '"Vou falar com meu sócio/esposa"',
    category: 'Terceiro',
    color: 'text-[#FFA300]',
    bg: 'bg-[#FFA300]/5',
    border: 'border-[#FFA300]/20',
    responses: [
      'Claro! Posso te mandar um material resumido pra você apresentar? Assim fica mais fácil de explicar o que seria feito e o retorno esperado.',
      'Ótimo. O que você acha que ele/ela vai querer saber antes de decidir? Posso preparar essa resposta agora.',
      'Faz sentido incluir quem decide. Você consegue marcar uma chamada rápida com os dois? Resolvo tudo de uma vez pra não ficar passando informação picada.',
    ],
  },
]

function ObjectionCard({ obj }) {
  const [open, setOpen] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)

  const copy = async (text, i) => {
    await navigator.clipboard.writeText(text)
    setCopiedIdx(i)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <div className={`glass-card overflow-hidden border ${obj.border}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3.5 ${obj.bg} hover:opacity-90 transition-all`}
      >
        <div className="flex items-center gap-3">
          <Shield className={`w-4 h-4 ${obj.color}`} />
          <div className="text-left">
            <p className={`text-sm font-semibold ${obj.color}`}>{obj.trigger}</p>
            <p className="text-xs text-slate-500">{obj.category}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      {open && (
        <div className="p-4 space-y-3 animate-fade-in">
          {obj.responses.map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-surface-border group">
              <span className={`w-5 h-5 rounded-full ${obj.bg} border ${obj.border} flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${obj.color}`}>
                {i + 1}
              </span>
              <p className="text-sm text-slate-300 leading-relaxed flex-1">{r}</p>
              <button
                onClick={() => copy(r, i)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-surface-hover text-slate-600 hover:text-slate-300"
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

// ── Templates ─────────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'cold-email-1',
    type: 'email',
    label: 'Cold Email — Dor + Gancho',
    icon: Mail,
    template: `Assunto: {Nome}, seus concorrentes já estão fazendo isso

Olá {Nome},

Vi que você tem {Tipo de negócio} em {Cidade} — parabéns pelo que construiu.

Fui pesquisar um pouco e percebi que {Observação sobre o digital deles, ex: seu Instagram não está convertendo} — e esse é exatamente o padrão que eu vejo em negócios com potencial de 2x de crescimento mas que ainda não desbloquearam o digital.

Trabalho com {Nicho} aqui na região e nos últimos meses ajudei negócios parecidos com o seu a {Resultado concreto, ex: triplicar os agendamentos online}.

Teria 15 minutos essa semana pra eu te mostrar o que faríamos especificamente pro seu caso?

{Seu nome}
EuSouTS — Assessoria de Marketing`,
  },
  {
    id: 'whatsapp-follow-1',
    type: 'whatsapp',
    label: 'WhatsApp — Follow-up Pós-reunião',
    icon: MessageSquare,
    template: `Olá {Nome}! Tudo bem? 😊

Foi ótima nossa conversa hoje. Fiquei pensando no que você me contou sobre {dor principal que ele mencionou} — isso realmente é o gargalo que trava o crescimento de muitos negócios no seu segmento.

Como prometido, vou te mandar o resumo do que conversamos:

✅ O que seria feito: {resumo do plano}
📈 Resultado esperado em 90 dias: {meta}
💰 Investimento: {valor}

{Nome}, qual seria o melhor momento pra você dar uma resposta? Pergunto porque temos disponibilidade limitada esse mês e quero garantir sua vaga.

Qualquer dúvida, é só falar. 🤝`,
  },
  {
    id: 'whatsapp-noshow',
    type: 'whatsapp',
    label: 'WhatsApp — No-show (sumiu após reunião)',
    icon: MessageSquare,
    template: `Oi {Nome}, tudo bem?

Não tive mais notícias suas desde nossa conversa e fico imaginando se aconteceu alguma coisa ou se surgiu alguma dúvida que não ficou clara.

Sem pressão nenhuma — mas se o projeto ainda fizer sentido pra você, posso reservar mais alguns minutos essa semana.

Se por algum motivo o momento não é esse, pode falar tranquilo também. Prefiro saber do que ficar no escuro. 😊

Como você tá?`,
  },
  {
    id: 'email-proposta',
    type: 'email',
    label: 'E-mail — Envio de Proposta',
    icon: Mail,
    template: `Assunto: Proposta personalizada para {Nome} — {Tipo de negócio}

Olá {Nome},

Conforme combinamos, segue a proposta que preparei especialmente para o cenário do seu negócio.

📌 O QUE FICOU CLARO NA NOSSA CONVERSA:
{resumo das dores e objetivos}

🎯 O QUE PROPOMOS:
{nome do plano + principais entregas}

📈 O QUE ESPERAMOS ALCANÇAR:
• Em 90 dias: {meta}
• Em 6 meses: {meta}

💰 INVESTIMENTO:
{valor} — {forma de pagamento}

⚠️ IMPORTANTE: Essa proposta é válida até {data}, pois nossa agenda de onboardings para esse mês está quase fechada.

Para confirmar, é só responder esse e-mail ou me chamar no WhatsApp.

Qualquer dúvida, estou à disposição.

{Seu nome}
EuSouTS — Assessoria de Marketing
{Telefone}`,
  },
]

function TemplateCard({ tpl }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const Icon = tpl.icon
  const isEmail = tpl.type === 'email'

  const copy = async () => {
    await navigator.clipboard.writeText(tpl.template)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isEmail ? 'bg-[#FFA300]/10 border border-[#FFA300]/20' : 'bg-[#FFA300]/10 border border-[#FFA300]/20'}`}>
            <Icon className={`w-3.5 h-3.5 ${isEmail ? 'text-[#FFA300]' : 'text-[#FFA300]'}`} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-200">{tpl.label}</p>
            <p className="text-xs text-slate-500">{isEmail ? 'E-mail' : 'WhatsApp'}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      {open && (
        <div className="border-t border-surface-border animate-fade-in">
          <div className="px-4 pt-3 pb-2 flex justify-end">
            <button onClick={copy} className="btn-ghost text-xs py-1 px-2">
              {copied ? <><Check className="w-3 h-3 text-[#FFA300]" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar Template</>}
            </button>
          </div>
          <pre className="px-4 pb-4 text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">
            {tpl.template}
          </pre>
        </div>
      )}
    </div>
  )
}

// ── Main Module ───────────────────────────────────────────────────────────────
export default function SDRToolboxModule() {
  const [tab, setTab] = useState('calc')

  const tabs = [
    { id: 'calc', label: 'Calculadora', icon: Calculator },
    { id: 'objections', label: 'Objeções', icon: Shield },
    { id: 'templates', label: 'Templates', icon: Mail },
  ]

  return (
    <div className="px-4 py-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
        <Zap className="w-5 h-5 text-[#FFA300]" />
        <h2 className="text-sm font-semibold text-slate-100">Ferramentas do SDR</h2>
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
                  ? 'bg-[#FFA300] text-white shadow-[0_0_16px_rgba(255,163,0,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'calc' && (
        <div className="space-y-4 animate-fade-in">
          <ConversionCalc />
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#FFA300]" />
              <p className="text-sm font-semibold text-slate-100">Benchmarks de Mercado</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Cold Call → Reunião', ref: '5–15%', good: '15%+' },
                { label: 'Cold Email → Resposta', ref: '3–8%', good: '8%+' },
                { label: 'Reunião → Fechamento', ref: '20–35%', good: '35%+' },
              ].map(b => (
                <div key={b.label} className="p-3 rounded-lg bg-surface border border-surface-border text-center">
                  <p className="text-xs text-slate-500 mb-1">{b.label}</p>
                  <p className="text-sm font-bold text-slate-300">{b.ref}</p>
                  <p className="text-xs text-[#FFA300] mt-0.5">Top: {b.good}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'objections' && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm text-slate-500 mb-4">Scripts testados para as objeções mais comuns. Clique para expandir e copiar.</p>
          {OBJECTIONS.map(obj => <ObjectionCard key={obj.trigger} obj={obj} />)}
        </div>
      )}

      {tab === 'templates' && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm text-slate-500 mb-4">Templates de comunicação. Substitua os campos em <span className="text-[#FFA300]">{'{chaves}'}</span> antes de enviar.</p>
          {TEMPLATES.map(tpl => <TemplateCard key={tpl.id} tpl={tpl} />)}
        </div>
      )}
    </div>
  )
}

