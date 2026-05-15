import { GoogleGenerativeAI } from '@google/generative-ai'
import { DEFAULT_PROMPTS } from '../context/AppContext'

function createClient(apiKey, model, systemInstruction) {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model,
    systemInstruction,
    generationConfig: { temperature: 0.85, topK: 40, topP: 0.95 },
  })
}

function extractJSON(text) {
  let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Nenhum JSON encontrado na resposta da IA.')
  return JSON.parse(clean.slice(start, end + 1))
}

// ─── Build Company Context Block ──────────────────────────────────────────────
function buildCompanyBlock(ctx) {
  if (!ctx) return ''
  const lines = []
  if (ctx.name)              lines.push(`Empresa: ${ctx.name}`)
  if (ctx.tagline)           lines.push(`Posicionamento: ${ctx.tagline}`)
  if (ctx.services)          lines.push(`Serviços oferecidos:\n${ctx.services}`)
  if (ctx.methodology)       lines.push(`Metodologia de trabalho:\n${ctx.methodology}`)
  if (ctx.differentials)     lines.push(`Diferenciais competitivos:\n${ctx.differentials}`)
  if (ctx.idealClient)       lines.push(`Perfil de cliente ideal:\n${ctx.idealClient}`)
  if (ctx.sectors)           lines.push(`Setores que mais atendemos:\n${ctx.sectors}`)
  if (ctx.results)           lines.push(`Resultados típicos / cases de sucesso:\n${ctx.results}`)
  if (ctx.salesProcess)      lines.push(`Processo de vendas:\n${ctx.salesProcess}`)
  if (ctx.pricing)           lines.push(`Modelo de preços e contratos:\n${ctx.pricing}`)
  if (ctx.commonObjections)  lines.push(`Objeções que recebemos e como respondemos:\n${ctx.commonObjections}`)
  if (ctx.extra)             lines.push(`Contexto adicional:\n${ctx.extra}`)
  if (!lines.length) return ''

  return `
═══════════════════════════════════════════
CONTEXTO DA NOSSA EMPRESA
═══════════════════════════════════════════
${lines.join('\n\n')}`
}

// ─── 1. Generate Persona ──────────────────────────────────────────────────────
export async function generatePersona(apiKey, model, leadData, companyContext, customPrompts = {}) {
  const prompts = { ...DEFAULT_PROMPTS, ...customPrompts }
  const client = createClient(apiKey, model, prompts.systemInstruction)
  const { name, niche, state, transcription } = leadData
  const companyBlock = buildCompanyBlock(companyContext)

  const transcriptionSection = transcription?.trim()
    ? `\n═══════════════════════════════════════════\nTRANSCRIÇÃO / HISTÓRICO DO LEAD\n═══════════════════════════════════════════\n${transcription.slice(0, 8000)}\n\nUSE este material para personalizar a persona com detalhes reais revelados pelo lead.\n`
    : ''

  const prompt = `
Analise o lead abaixo e gere um estudo de persona detalhado.
${companyBlock}

═══════════════════════════════════════════
DADOS DO LEAD
═══════════════════════════════════════════
Nome/Empresa: ${name || 'Não informado'}
Nicho: ${niche}
Estado: ${state || 'Não informado'}
${transcriptionSection}

═══════════════════════════════════════════
TAREFA - ESTUDO DE PERSONA
═══════════════════════════════════════════
${prompts.personaTask}

═══════════════════════════════════════════
FORMATO DE RESPOSTA
═══════════════════════════════════════════
Retorne APENAS o JSON abaixo, sem texto antes ou depois, sem markdown:

{
  "perfil": "texto descritivo completo do perfil",
  "dores": ["dor 1", "dor 2", "dor 3", "dor 4", "dor 5"],
  "desejos": ["desejo 1", "desejo 2", "desejo 3", "desejo 4", "desejo 5"],
  "objecoes": ["objeção 1 (frase exata que ele diria)", "objeção 2", "objeção 3", "objeção 4", "objeção 5"],
  "decisao": "como ele decide",
  "valoriza": "o que mais valoriza em parceiros"
}
`

  const result = await client.generateContent(prompt)
  return extractJSON(result.response.text())
}

// ─── 2. Generate SPIN Questions ───────────────────────────────────────────────
export async function generateSpinQuestions(apiKey, model, { persona, leadData, companyContext }, customPrompts = {}) {
  const prompts = { ...DEFAULT_PROMPTS, ...customPrompts }
  const client = createClient(apiKey, model, prompts.systemInstruction)
  const { name, niche, state } = leadData
  const companyBlock = buildCompanyBlock(companyContext)

  const spinTask = prompts.spinTask.replace(/\{niche\}/g, niche)

  const prompt = `
Com base na persona, dados do lead e contexto da empresa, gere 20 perguntas SPIN Selling ultra-personalizadas.
${companyBlock}

═══════════════════════════════════════════
DADOS DO LEAD
═══════════════════════════════════════════
Nome/Empresa: ${name || 'Não informado'}
Nicho: ${niche}
Estado: ${state || 'Não informado'}

PERSONA IDENTIFICADA:
${JSON.stringify(persona, null, 2)}

═══════════════════════════════════════════
TAREFA - SPIN SELLING DINÂMICO
═══════════════════════════════════════════
${spinTask}

═══════════════════════════════════════════
FORMATO DE RESPOSTA
═══════════════════════════════════════════
Retorne APENAS o JSON abaixo, sem texto antes ou depois, sem markdown:

{
  "situacao": ["pergunta 1", "pergunta 2", "pergunta 3", "pergunta 4", "pergunta 5"],
  "problema": ["pergunta 1", "pergunta 2", "pergunta 3", "pergunta 4", "pergunta 5"],
  "implicacao": ["pergunta 1", "pergunta 2", "pergunta 3", "pergunta 4", "pergunta 5"],
  "necessidade": ["pergunta 1", "pergunta 2", "pergunta 3", "pergunta 4", "pergunta 5"]
}
`

  const result = await client.generateContent(prompt)
  return extractJSON(result.response.text())
}

// ─── 3. Generate Proposal ─────────────────────────────────────────────────────
export async function generateProposal(apiKey, model, { persona, leadData, spinQuestions, companyContext }, customPrompts = {}) {
  const prompts = { ...DEFAULT_PROMPTS, ...customPrompts }
  const client = createClient(apiKey, model, prompts.systemInstruction)
  const companyBlock = buildCompanyBlock(companyContext)

  const SPIN_LABEL = { situacao: 'S', problema: 'P', implicacao: 'I', necessidade: 'N' }

  const answeredQuestions = spinQuestions
    .filter(q => q.answer?.trim())
    .map(q => `[${SPIN_LABEL[q.category] || q.category.toUpperCase()}] ${q.question}\n→ "${q.answer}"`)
    .join('\n\n')

  const prompt = `
Você recebeu o briefing completo de uma reunião de vendas. Analise tudo e gere a proposta personalizada.
${companyBlock}

═══════════════════════════════════════════
PERFIL DO LEAD
═══════════════════════════════════════════
Nome/Empresa: ${leadData.name || 'Não informado'}
Nicho: ${leadData.niche}
Estado: ${leadData.state || 'Não informado'}

PERSONA:
${JSON.stringify(persona, null, 2)}

═══════════════════════════════════════════
O QUE O LEAD REVELOU (respostas do SPIN)
═══════════════════════════════════════════
${answeredQuestions || '⚠️ Nenhuma resposta registrada. Baseie-se no perfil e nicho.'}

═══════════════════════════════════════════
SUA MISSÃO
═══════════════════════════════════════════
${prompts.proposalTask}

═══════════════════════════════════════════
FORMATO DE RESPOSTA
═══════════════════════════════════════════
Retorne APENAS o JSON abaixo, sem texto antes ou depois, sem markdown:

{
  "servicoRecomendado": "qual escopo/nível de serviço é mais adequado para esse lead",
  "justificativa": "justificativa completa em 3-4 parágrafos, escrita para o Closer falar na call",
  "pontosCriticos": ["ponto crítico do onboarding 1", "ponto 2", "ponto 3"],
  "metas": {
    "mes3": ["meta concreta 1", "meta concreta 2", "meta concreta 3"],
    "mes6": ["meta concreta 1", "meta concreta 2", "meta concreta 3"]
  },
  "briefing": {
    "resumoNegocio": "resumo executivo em 2-3 frases",
    "situacaoAtual": "diagnóstico do estado atual do marketing/digital deste negócio",
    "prioridades": ["prioridade operacional 1", "prioridade 2", "prioridade 3"],
    "alertas": ["alerta para a equipe 1", "alerta 2"],
    "proximosPassos": ["primeiro passo concreto", "segundo passo", "terceiro passo"]
  }
}
`

  const result = await client.generateContent(prompt)
  return extractJSON(result.response.text())
}
