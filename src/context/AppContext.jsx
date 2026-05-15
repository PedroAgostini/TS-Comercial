import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { initSupabase, saveLead, checkColumns, loadSetting, saveSetting } from '../services/dbService'

const AppContext = createContext(null)

export const DEFAULT_PROMPTS = {
  systemInstruction: `Você é um especialista sênior em vendas consultivas B2B/B2C, marketing digital e estratégia comercial para pequenas e médias empresas brasileiras.

Seu papel é apoiar SDRs e Closers durante ligações e reuniões de vendas ao vivo, usando o contexto da empresa para gerar análises ultra-personalizadas.

Princípios que guiam suas respostas:
- Sempre em Português Brasileiro, linguagem clara e direta
- Foco total em resultado comercial prático, nunca teórico
- Respostas estruturadas para facilitar a leitura rápida durante uma call`,

  personaTask: `Com base no nicho, região e contexto da empresa acima, descreva o tomador de decisão típico desse lead:

- perfil: Quem é essa pessoa (cargo, idade aproximada, mentalidade, como passa o dia a dia)
- dores: Exatamente 5 dores reais relacionadas ao marketing e crescimento do negócio
- desejos: Exatamente 5 desejos e objetivos que ele quer alcançar
- objecoes: Exatamente 5 objeções que ele vai usar durante a venda com nossa empresa especificamente (use o contexto da empresa para tornar as objeções mais realistas)
- decisao: Como ele toma decisões de compra (processo mental, quem influencia, quanto tempo leva)
- valoriza: O que ele mais valoriza ao contratar uma empresa como a nossa

Se houver transcrição, enriqueça cada item com detalhes específicos revelados pelo lead.`,

  spinTask: `Gere EXATAMENTE 5 perguntas por categoria (total: 20 perguntas).

REGRAS ABSOLUTAS:
✓ Linguagem simples, conversacional, sem jargões
✓ Sempre perguntas abertas (nunca respondíveis com sim/não)
✓ Contextualizadas para o nicho {niche} e as dores identificadas na persona
✓ Ordenadas da mais suave para a mais impactante dentro de cada categoria
✓ As perguntas de IMPLICAÇÃO devem levar o lead a sentir o custo de NÃO contratar nossos serviços
✓ As perguntas de NECESSIDADE devem criar desejo pelos benefícios específicos que nossa empresa entrega

CATEGORIAS:
S - SITUAÇÃO: Entender o contexto atual sem parecer interrogatório
P - PROBLEMA: Revelar dores e desafios de forma empática
I - IMPLICAÇÃO: Fazer o lead sentir o custo real de NÃO resolver o problema
N - NECESSIDADE DE SOLUÇÃO: Criar o desejo pela nossa solução especificamente`,

  proposalTask: `Com base em TUDO acima:
1. Identifique o nível de serviço/escopo mais adequado para esse lead (baseado nos serviços da empresa)
2. Escreva uma justificativa poderosa e personalizada (3-4 parágrafos) que o Closer pode usar na call
3. Projete metas reais e factíveis para 3 e 6 meses (baseadas nos resultados típicos da empresa)
4. Gere um briefing inicial claro para a equipe de operações começar o trabalho
5. Liste os pontos críticos do onboarding para esse cliente específico`,
}

const COMPANY_DEFAULT = {
  name: 'EuSouTS',
  tagline: '',
  services: '',
  differentials: '',
  methodology: '',
  idealClient: '',
  sectors: '',
  results: '',
  salesProcess: '',
  commonObjections: '',
  pricing: '',
  extra: '',
}

export function AppProvider({ children }) {
  // ── AI Settings ───────────────────────────────────────────────
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ts_api_key') || '')
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('ts_ai_model') || 'gemini-2.0-flash')

  useEffect(() => { localStorage.setItem('ts_api_key', apiKey) }, [apiKey])
  useEffect(() => { localStorage.setItem('ts_ai_model', aiModel) }, [aiModel])

  // ── Custom Prompts ─────────────────────────────────────────────
  const [customPrompts, setCustomPrompts] = useState(() => {
    try {
      const saved = localStorage.getItem('ts_prompts')
      return saved ? { ...DEFAULT_PROMPTS, ...JSON.parse(saved) } : { ...DEFAULT_PROMPTS }
    } catch { return { ...DEFAULT_PROMPTS } }
  })

  useEffect(() => {
    if (skipPromptsSave.current > 0) { skipPromptsSave.current--; return }
    localStorage.setItem('ts_prompts', JSON.stringify(customPrompts))
    clearTimeout(promptsDbTimer.current)
    promptsDbTimer.current = setTimeout(() => saveSetting('custom_prompts', customPrompts).catch(console.warn), 800)
  }, [customPrompts])

  const updatePrompt = useCallback((key, value) => {
    setCustomPrompts(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetPrompt = useCallback((key) => {
    setCustomPrompts(prev => ({ ...prev, [key]: DEFAULT_PROMPTS[key] }))
  }, [])

  const resetAllPrompts = useCallback(() => {
    setCustomPrompts({ ...DEFAULT_PROMPTS })
  }, [])

  // ── Supabase / DB ─────────────────────────────────────────────
  const DEFAULT_DB_URL = 'https://atohlctkuofpodpyxgbi.supabase.co'
  const DEFAULT_DB_KEY = 'sb_publishable_IbCNAmrm5mPsv1QDeLjPYQ_gxBWRoWN'
  const [supabaseUrl, setSupabaseUrl] = useState(() => DEFAULT_DB_URL)
  const [supabaseKey, setSupabaseKey] = useState(() => DEFAULT_DB_KEY)
  const [dbConnected, setDbConnected] = useState(false)
  const [dbColumnsOk, setDbColumnsOk] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [currentLeadId, setCurrentLeadId] = useState(null)

  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      const client = initSupabase(supabaseUrl, supabaseKey)
      if (client) {
        setDbConnected(true)
        checkColumns().then(setDbColumnsOk).catch(() => setDbColumnsOk(false))
      }
    }
  }, [])

  const applyDbCredentials = useCallback((url, key) => {
    setSupabaseUrl(url)
    setSupabaseKey(key)
    const client = initSupabase(url, key)
    setDbConnected(!!client)
    if (client) {
      checkColumns().then(setDbColumnsOk).catch(() => setDbColumnsOk(false))
    }
  }, [])

  // ── Global Settings Sync (DB → state on connect) ──────────────
  // Timers for debounced DB saves on frequent inputs
  const companyDbTimer = useRef(null)
  const promptsDbTimer = useRef(null)
  // Prevents re-saving to DB when we're loading values FROM DB
  const skipNavSave    = useRef(0)
  const skipTeamSave   = useRef(0)
  const skipCompanySave  = useRef(0)
  const skipPromptsSave  = useRef(0)
  const dbSyncDone = useRef(false)

  const loadGlobalSettings = useCallback(async () => {
    try {
      const [navCfg, teamCfg, companyCfg, promptsCfg] = await Promise.all([
        loadSetting('nav_config'),
        loadSetting('team'),
        loadSetting('company_context'),
        loadSetting('custom_prompts'),
      ])
      if (navCfg) {
        skipNavSave.current++
        setNavConfig(prev => {
          const ids = navCfg.map(i => i.id)
          const missing = prev.filter(d => !ids.includes(d.id))
          return [...navCfg, ...missing]
        })
      }
      if (teamCfg) {
        skipTeamSave.current++
        setTeam(teamCfg)
      }
      if (companyCfg) {
        skipCompanySave.current++
        setCompanyContext(prev => ({ ...prev, ...companyCfg }))
      }
      if (promptsCfg) {
        skipPromptsSave.current++
        setCustomPrompts(prev => ({ ...prev, ...promptsCfg }))
      }
    } catch (err) {
      console.warn('Failed to load global settings from DB:', err)
    }
  }, [])

  useEffect(() => {
    if (dbConnected && !dbSyncDone.current) {
      dbSyncDone.current = true
      loadGlobalSettings()
    }
  }, [dbConnected, loadGlobalSettings])

  // ── Company Context ───────────────────────────────────────────
  const [companyContext, setCompanyContext] = useState(() => {
    try {
      const saved = localStorage.getItem('ts_company')
      return saved ? { ...COMPANY_DEFAULT, ...JSON.parse(saved) } : COMPANY_DEFAULT
    } catch { return COMPANY_DEFAULT }
  })

  useEffect(() => {
    if (skipCompanySave.current > 0) { skipCompanySave.current--; return }
    localStorage.setItem('ts_company', JSON.stringify(companyContext))
    clearTimeout(companyDbTimer.current)
    companyDbTimer.current = setTimeout(() => saveSetting('company_context', companyContext).catch(console.warn), 800)
  }, [companyContext])

  const updateCompanyContext = useCallback((field, value) => {
    setCompanyContext(prev => ({ ...prev, [field]: value }))
  }, [])

  // ── Nav Config (admin controls public menu) ───────────────────
  const DEFAULT_NAV_CONFIG = [
    { id: 'intelligence', visible: true },
    { id: 'closing',      visible: true },
    { id: 'briefing',     visible: true },
    { id: 'historico',    visible: true },
    { id: 'sdr',          visible: true },
    { id: 'closer',       visible: true },
    { id: 'settings',     visible: true },
  ]

  const [navConfig, setNavConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('ts_nav_config')
      if (!saved) return DEFAULT_NAV_CONFIG
      const parsed = JSON.parse(saved)
      // Merge: keep saved order/visibility, add any new items at end
      const ids = parsed.map(i => i.id)
      const missing = DEFAULT_NAV_CONFIG.filter(d => !ids.includes(d.id))
      return [...parsed, ...missing]
    } catch { return DEFAULT_NAV_CONFIG }
  })

  // navConfig: localStorage only — DB save is explicit via "Salvar" button in Settings
  useEffect(() => {
    if (skipNavSave.current > 0) { skipNavSave.current--; return }
    localStorage.setItem('ts_nav_config', JSON.stringify(navConfig))
  }, [navConfig])

  const toggleNavItem = useCallback((id) => {
    setNavConfig(prev => prev.map(item => item.id === id ? { ...item, visible: !item.visible } : item))
  }, [])

  const moveNavItem = useCallback((id, direction) => {
    setNavConfig(prev => {
      const idx = prev.findIndex(i => i.id === id)
      if (idx < 0) return prev
      const next = direction === 'up' ? idx - 1 : idx + 1
      if (next < 0 || next >= prev.length) return prev
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr
    })
  }, [])

  // ── Team (SDRs / Closers) ─────────────────────────────────────
  const [team, setTeam] = useState(() => {
    try {
      const saved = localStorage.getItem('ts_team')
      return saved ? JSON.parse(saved) : { sdrs: [], closers: [] }
    } catch { return { sdrs: [], closers: [] } }
  })

  useEffect(() => {
    if (skipTeamSave.current > 0) { skipTeamSave.current--; return }
    localStorage.setItem('ts_team', JSON.stringify(team))
    saveSetting('team', team).catch(console.warn)
  }, [team])

  const updateTeam = useCallback((type, action, name) => {
    setTeam(prev => {
      const list = prev[type] || []
      if (action === 'add' && name?.trim() && !list.includes(name.trim())) {
        return { ...prev, [type]: [...list, name.trim()] }
      }
      if (action === 'remove') {
        return { ...prev, [type]: list.filter(n => n !== name) }
      }
      return prev
    })
  }, [])

  // ── Lead / Client Data ────────────────────────────────────────
  const [leadData, setLeadData] = useState({ name: '', niche: '', state: '', transcription: '', sdr: '', closer: '', status: '' })

  const updateLeadData = useCallback((field, value) => {
    setLeadData(prev => ({ ...prev, [field]: value }))
  }, [])

  // ── Intelligence Step (1–4 wizard) ────────────────────────────
  const [intelligenceStep, setIntelligenceStep] = useState(1)

  // ── AI Outputs ────────────────────────────────────────────────
  const [persona, setPersona] = useState(null)
  const [spinQuestions, setSpinQuestions] = useState([])
  const [proposal, setProposal] = useState(null)
  const [callNotes, setCallNotes] = useState('')

  // ── Briefing (client onboarding form) ─────────────────────────
  const [briefing, setBriefing] = useState(() => {
    try {
      const raw = localStorage.getItem('ts_briefing')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  useEffect(() => {
    if (briefing !== null) {
      try { localStorage.setItem('ts_briefing', JSON.stringify(briefing)) } catch {}
    }
  }, [briefing])

  // ── Loading States ────────────────────────────────────────────
  const [loadingPersona, setLoadingPersona] = useState(false)
  const [loadingSpin, setLoadingSpin] = useState(false)
  const [loadingProposal, setLoadingProposal] = useState(false)

  // ── SPIN mutations ────────────────────────────────────────────
  const updateSpinAnswer = useCallback((id, answer) => {
    setSpinQuestions(prev => prev.map(q => q.id === id ? { ...q, answer } : q))
  }, [])

  const updateSpinNote = useCallback((id, note) => {
    setSpinQuestions(prev => prev.map(q => q.id === id ? { ...q, note } : q))
  }, [])

  const updateSpinQuestion = useCallback((id, question) => {
    setSpinQuestions(prev => prev.map(q => q.id === id ? { ...q, question } : q))
  }, [])

  const removeSpinQuestion = useCallback((id) => {
    setSpinQuestions(prev => prev.filter(q => q.id !== id))
  }, [])

  const addManualSpinQuestion = useCallback((category) => {
    setSpinQuestions(prev => [...prev, {
      id: crypto.randomUUID(), category, question: '', answer: '', note: '', manual: true,
    }])
  }, [])

  // ── DB Save ───────────────────────────────────────────────────
  const saveLeadToDb = useCallback(async (overrides = {}) => {
    if (!supabaseUrl || !supabaseKey) {
      setSaveStatus('no-db')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return null
    }
    setSaveStatus('saving')
    try {
      const payload = {
        name: leadData.name,
        niche: leadData.niche,
        state: leadData.state,
        transcription: leadData.transcription,
        sdr: leadData.sdr,
        closer: leadData.closer,
        status: leadData.status,
        persona,
        spinQuestions,
        callNotes,
        proposal,
        briefing,
        ...overrides,
      }
      const row = await saveLead(currentLeadId, payload)
      if (!currentLeadId && row?.id) setCurrentLeadId(row.id)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return row
    } catch (err) {
      console.error('DB save error:', err)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 4000)
      return null
    }
  }, [supabaseUrl, supabaseKey, currentLeadId, leadData, persona, spinQuestions, callNotes, proposal, briefing])

  // ── Load Lead from DB ─────────────────────────────────────────
  const loadLeadFromDb = useCallback((row) => {
    setLeadData({
      name: row.name || '',
      niche: row.niche || '',
      state: row.state || '',
      transcription: row.transcription || '',
      sdr: row.sdr || '',
      closer: row.closer || '',
      status: row.status || '',
    })
    if (row.persona) setPersona(row.persona)
    if (row.spin_questions) setSpinQuestions(row.spin_questions)
    if (row.call_notes) setCallNotes(row.call_notes)
    setProposal(row.proposal || null)
    setBriefing(row.briefing ? {
      ...row.briefing,
      clientName: row.briefing.clientName || row.name || '',
    } : null)
    setCurrentLeadId(row.id)
    if (row.spin_questions?.length > 0) setIntelligenceStep(4)
    else if (row.persona) setIntelligenceStep(2)
    else setIntelligenceStep(1)
  }, [])

  // ── Reset wizard ──────────────────────────────────────────────
  const resetIntelligence = useCallback(() => {
    setLeadData({ name: '', niche: '', state: '', transcription: '', sdr: '', closer: '', status: '' })
    setPersona(null)
    setSpinQuestions([])
    setCallNotes('')
    setProposal(null)
    setBriefing(null)
    setCurrentLeadId(null)
    setIntelligenceStep(1)
    setSaveStatus('idle')
  }, [])

  // ── Active Module ─────────────────────────────────────────────
  const [activeModule, setActiveModule] = useState('intelligence')

  // ── Admin Auth ────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('ts_admin') === '1')

  const adminLogin = useCallback((user, pass) => {
    if (user === 'tsagency' && pass === 'T$Sp1N$3lL1n6') {
      sessionStorage.setItem('ts_admin', '1')
      setIsAdmin(true)
      return true
    }
    return false
  }, [])

  const adminLogout = useCallback(() => {
    sessionStorage.removeItem('ts_admin')
    setIsAdmin(false)
  }, [])

  const value = {
    apiKey, setApiKey,
    aiModel, setAiModel,
    customPrompts, updatePrompt, resetPrompt, resetAllPrompts,
    supabaseUrl, supabaseKey, applyDbCredentials,
    dbConnected, setDbConnected,
    saveStatus, currentLeadId, setCurrentLeadId,
    dbColumnsOk, setDbColumnsOk,
    saveLeadToDb, loadLeadFromDb,
    companyContext, updateCompanyContext,
    leadData, updateLeadData,
    intelligenceStep, setIntelligenceStep,
    persona, setPersona,
    spinQuestions, setSpinQuestions,
    updateSpinAnswer, updateSpinNote, updateSpinQuestion, removeSpinQuestion, addManualSpinQuestion,
    callNotes, setCallNotes,
    briefing, setBriefing,
    proposal, setProposal,
    loadingPersona, setLoadingPersona,
    loadingSpin, setLoadingSpin,
    loadingProposal, setLoadingProposal,
    resetIntelligence,
    activeModule, setActiveModule,
    isAdmin, adminLogin, adminLogout,
    team, updateTeam,
    navConfig, toggleNavItem, moveNavItem,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
