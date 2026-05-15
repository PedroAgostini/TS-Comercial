import React, { useState } from 'react'
import {
  KeyRound,
  Bot,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Database,
  Wifi,
  WifiOff,
  Link,
  Loader2,
  Code2,
  RotateCcw,
  Info,
  Pencil,
  Users,
  UserPlus,
  Trash2,
  UserCheck,
  LayoutList,
  ChevronUp,
  ChevronDown,
  Brain,
  HandshakeIcon,
  ClipboardList,
  Zap,
  Target,
  Settings as SettingsIcon,
  Building2,
  GripVertical,
} from 'lucide-react'
import { useApp, DEFAULT_PROMPTS } from '../../../context/AppContext'
import { testConnection, checkColumns, saveSetting } from '../../../services/dbService'

const MODELS = [
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    desc: 'Modelo mais poderoso - melhor raciocínio e análise profunda',
    badge: 'PRO',
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    desc: 'Rápido e capaz - ótimo equilíbrio custo/desempenho',
    badge: 'NOVO',
  },
  {
    id: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    desc: 'Estável e veloz - recomendado para uso diário intenso',
    badge: null,
  },
  {
    id: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash',
    desc: 'Versão anterior - fallback confiável',
    badge: null,
  },
]


const SQL_SCRIPT = `-- 1. Criar tabela
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  niche TEXT,
  state TEXT,
  transcription TEXT,
  sdr TEXT,
  closer TEXT,
  status TEXT,
  persona JSONB,
  spin_questions JSONB,
  call_notes TEXT,
  proposal JSONB,
  briefing JSONB
);

-- Se a tabela já existe, rode só isto:
ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS briefing JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sdr TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS closer TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT;

-- 2. Tabela de configurações globais (menu, equipe, prompts, empresa)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_access" ON app_settings;
CREATE POLICY "public_access" ON app_settings FOR ALL USING (true);

-- 2. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Permitir acesso público (anon key)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON leads FOR ALL USING (true);`

// ─── Prompts Tab ──────────────────────────────────────────────────────────────

const PROMPT_FIELDS = [
  {
    key: 'systemInstruction',
    label: 'Instrução do Sistema',
    desc: 'Persona e princípios gerais da IA - vale para Persona, SPIN e Proposta.',
    rows: 7,
  },
  {
    key: 'personaTask',
    label: 'Tarefa - Geração de Persona',
    desc: 'O que a IA deve analisar e como estruturar o estudo de persona.',
    rows: 9,
  },
  {
    key: 'spinTask',
    label: 'Tarefa - Perguntas SPIN',
    desc: 'Regras e categorias para gerar as 20 perguntas SPIN. Use {niche} como variável do nicho.',
    rows: 11,
    hint: 'A variável {niche} é substituída automaticamente pelo nicho do lead.',
  },
  {
    key: 'proposalTask',
    label: 'Tarefa - Proposta & Briefing',
    desc: 'Missão da IA ao gerar a proposta comercial e o briefing para a operação.',
    rows: 7,
  },
]

function PromptsTab() {
  const { customPrompts, updatePrompt, resetPrompt, resetAllPrompts } = useApp()
  const [savedKey, setSavedKey] = useState(null)

  const handleReset = (key) => {
    resetPrompt(key)
    setSavedKey(key)
    setTimeout(() => setSavedKey(null), 2000)
  }

  const handleResetAll = () => {
    resetAllPrompts()
    setSavedKey('all')
    setTimeout(() => setSavedKey(null), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
          Personalize como a IA se comporta em cada etapa. Alterações são salvas automaticamente e entram em vigor na próxima geração. O formato JSON de saída é fixo para garantir que o sistema funcione corretamente.
        </p>
        <button
          onClick={handleResetAll}
          className="btn-ghost text-xs py-1.5 flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {savedKey === 'all' ? 'Restaurado!' : 'Restaurar todos'}
        </button>
      </div>

      {PROMPT_FIELDS.map(field => (
        <div key={field.key} className="glass-card overflow-hidden">
          <div className="px-5 py-4 bg-[#FFA300]/5 border-b border-[#FFA300]/15 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100">{field.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{field.desc}</p>
              {field.hint && (
                <p className="text-xs text-[#FFA300]/70 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 flex-shrink-0" /> {field.hint}
                </p>
              )}
            </div>
            <button
              onClick={() => handleReset(field.key)}
              className="btn-ghost text-xs py-1 px-2 flex-shrink-0"
              title="Restaurar padrão"
            >
              <RotateCcw className="w-3 h-3" />
              {savedKey === field.key ? 'Restaurado!' : 'Padrão'}
            </button>
          </div>
          <div className="p-4">
            <textarea
              value={customPrompts[field.key]}
              onChange={e => updatePrompt(field.key, e.target.value)}
              rows={field.rows}
              spellCheck={false}
              className="input-field resize-y font-mono text-xs leading-relaxed w-full"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Team Tab ─────────────────────────────────────────────────────────────────

function MemberList({ title, icon: Icon, color, type, members, onAdd, onRemove }) {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    if (!input.trim()) return
    onAdd(type, 'add', input.trim())
    setInput('')
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className={`flex items-center gap-2 px-5 py-3.5 bg-[#FFA300]/5 border-b border-[#FFA300]/15`}>
        <Icon className="w-4 h-4 text-[#FFA300]" />
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <span className="ml-auto text-xs text-slate-500">{members.length} cadastrado{members.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={`Nome do ${title.toLowerCase().slice(0, -1)}...`}
            className="input-field flex-1"
          />
          <button onClick={handleAdd} className="btn-primary px-4 py-2 flex-shrink-0">
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
        {members.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-3 italic">Nenhum cadastrado ainda</p>
        ) : (
          <div className="space-y-1.5">
            {members.map(name => (
              <div key={name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface border border-surface-border">
                <UserCheck className="w-3.5 h-3.5 text-[#FFA300] flex-shrink-0" />
                <span className="text-sm text-slate-200 flex-1">{name}</span>
                <button
                  onClick={() => onRemove(type, 'remove', name)}
                  className="p-1 rounded text-slate-600 hover:text-slate-300 hover:bg-white/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TeamTab() {
  const { team, updateTeam, dbConnected } = useApp()
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState(null)
  const [saveMsg, setSaveMsg] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setSaveResult(null)
    try {
      await saveSetting('team', team)
      setSaveResult('ok')
      setSaveMsg('Equipe salva! Todos os dispositivos verão os membros ao recarregar.')
    } catch (err) {
      setSaveResult('error')
      setSaveMsg(err.message?.includes('app_settings')
        ? 'Tabela "app_settings" não existe. Execute o script SQL na aba Banco de Dados.'
        : (err.message || 'Erro ao salvar no banco de dados.')
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 leading-relaxed">
        Cadastre os SDRs e Closers da equipe. Eles aparecerão como opções de seleção em cada lead.
      </p>
      <MemberList
        title="SDRs"
        icon={Users}
        type="sdrs"
        members={team.sdrs}
        onAdd={updateTeam}
        onRemove={updateTeam}
      />
      <MemberList
        title="Closers"
        icon={UserCheck}
        type="closers"
        members={team.closers}
        onAdd={updateTeam}
        onRemove={updateTeam}
      />

      {saveResult && (
        <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs animate-fade-in ${
          saveResult === 'ok'
            ? 'bg-[#FFA300]/10 border-[#FFA300]/20 text-[#FFA300]'
            : 'bg-white/10 border-white/20 text-slate-300'
        }`}>
          {saveResult === 'ok'
            ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          }
          {saveMsg}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !dbConnected}
          className="btn-primary"
        >
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
            : <><CheckCircle2 className="w-4 h-4" /> Salvar Equipe para Todos</>
          }
        </button>
        {!dbConnected && (
          <span className="text-xs text-slate-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Banco não conectado
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Menu Tab ─────────────────────────────────────────────────────────────────

const NAV_META = {
  intelligence: { label: 'Inteligência de Vendas', icon: Brain,         desc: 'Persona + SPIN' },
  closing:      { label: 'Fechamento & Proposta',  icon: HandshakeIcon, desc: 'Plano de ação' },
  briefing:     { label: 'Briefing de Clientes',   icon: ClipboardList, desc: 'Onboarding do cliente' },
  historico:    { label: 'Histórico de Leads',     icon: Database,      desc: 'Leads salvos' },
  sdr:          { label: 'Ferramentas SDR',         icon: Zap,           desc: 'Prospecção' },
  closer:       { label: 'Ferramentas Closer',      icon: Target,        desc: 'Fechamento' },
  settings:     { label: 'Configurações',           icon: SettingsIcon,  desc: 'IA + Banco de Dados' },
}

function MenuTab() {
  const { navConfig, toggleNavItem, moveNavItem, dbConnected } = useApp()
  const visibleCount = navConfig.filter(i => i.visible).length
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState(null) // null | 'ok' | 'error'
  const [saveMsg, setSaveMsg] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setSaveResult(null)
    try {
      await saveSetting('nav_config', navConfig)
      setSaveResult('ok')
      setSaveMsg('Configurações salvas! Outros dispositivos verão as mudanças ao recarregar.')
    } catch (err) {
      setSaveResult('error')
      setSaveMsg(err.message?.includes('app_settings')
        ? 'Tabela "app_settings" não existe. Execute o script SQL nas configurações do banco.'
        : (err.message || 'Erro ao salvar no banco de dados.')
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 leading-relaxed">
        Controle quais abas os usuários gerais podem ver e defina a ordem de exibição no menu. A aba "Nossa Empresa" é exclusiva do admin e não aparece aqui.
      </p>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3.5 bg-[#FFA300]/5 border-b border-[#FFA300]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutList className="w-4 h-4 text-[#FFA300]" />
            <p className="text-sm font-semibold text-slate-100">Menu dos Usuários</p>
          </div>
          <span className="text-xs text-slate-500">{visibleCount} de {navConfig.length} visíveis</span>
        </div>

        <div className="divide-y divide-surface-border/50">
          {navConfig.map((item, idx) => {
            const meta = NAV_META[item.id]
            if (!meta) return null
            const Icon = meta.icon
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  item.visible ? 'bg-surface/30' : 'bg-surface/10 opacity-60'
                }`}
              >
                {/* Drag handle / order indicator */}
                <GripVertical className="w-4 h-4 text-slate-700 flex-shrink-0 cursor-grab" />

                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                  item.visible
                    ? 'bg-[#FFA300]/10 border-[#FFA300]/20'
                    : 'bg-surface border-surface-border'
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${item.visible ? 'text-[#FFA300]' : 'text-slate-600'}`} />
                </div>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${item.visible ? 'text-slate-200' : 'text-slate-500'}`}>
                    {meta.label}
                  </p>
                  <p className="text-xs text-slate-600 truncate">{meta.desc}</p>
                </div>

                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => moveNavItem(item.id, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-600 hover:text-slate-300 hover:bg-white/8 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveNavItem(item.id, 'down')}
                    disabled={idx === navConfig.length - 1}
                    className="p-1 rounded text-slate-600 hover:text-slate-300 hover:bg-white/8 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Visibility toggle */}
                <button
                  onClick={() => toggleNavItem(item.id)}
                  className={`relative w-10 h-5.5 rounded-full flex-shrink-0 transition-all duration-200 ${
                    item.visible
                      ? 'bg-[#FFA300]'
                      : 'bg-surface-border'
                  }`}
                  style={{ minWidth: '40px', height: '22px' }}
                  title={item.visible ? 'Ocultar para usuários' : 'Mostrar para usuários'}
                >
                  <span
                    className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all duration-200`}
                    style={{
                      width: '18px',
                      height: '18px',
                      top: '2px',
                      left: item.visible ? 'calc(100% - 20px)' : '2px',
                    }}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Save result feedback */}
      {saveResult && (
        <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs animate-fade-in ${
          saveResult === 'ok'
            ? 'bg-[#FFA300]/10 border-[#FFA300]/20 text-[#FFA300]'
            : 'bg-white/10 border-white/20 text-slate-300'
        }`}>
          {saveResult === 'ok'
            ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          }
          {saveMsg}
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !dbConnected}
          className="btn-primary"
        >
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
            : <><CheckCircle2 className="w-4 h-4" /> Salvar para Todos os Dispositivos</>
          }
        </button>
        {!dbConnected && (
          <span className="text-xs text-slate-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Banco não conectado
          </span>
        )}
      </div>

      <div className="px-3 py-2.5 rounded-lg bg-[#FFA300]/5 border border-[#FFA300]/15 text-xs text-[#FFA300] flex items-start gap-2">
        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span>Clique em "Salvar" para aplicar as mudanças em todos os computadores. Requer a tabela <strong>app_settings</strong> no Supabase (veja aba Banco de Dados).</span>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SettingsModule() {
  const {
    apiKey, setApiKey, aiModel, setAiModel,
    supabaseUrl, supabaseKey, applyDbCredentials, dbConnected, setDbConnected,
    dbColumnsOk, setDbColumnsOk,
    isAdmin,
  } = useApp()

  const [tab, setTab] = useState('ai')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  // DB state
  const [sbUrl, setSbUrl] = useState(supabaseUrl)
  const [sbKey, setSbKey] = useState(supabaseKey)
  const [showSbKey, setShowSbKey] = useState(false)
  const [testingDb, setTestingDb] = useState(false)
  const [dbTestResult, setDbTestResult] = useState(null)
  const [dbTestMsg, setDbTestMsg] = useState('')
  const [editingDb, setEditingDb] = useState(false)

  const handleSaveDb = async () => {
    applyDbCredentials(sbUrl.trim(), sbKey.trim())
    setDbTestResult(null)
  }

  const handleTestDb = async () => {
    applyDbCredentials(sbUrl.trim(), sbKey.trim())
    setTestingDb(true)
    setDbTestResult(null)
    try {
      await testConnection()
      const colsOk = await checkColumns()
      setDbColumnsOk(colsOk)
      setDbConnected(true)
      if (colsOk) {
        setDbTestResult('ok')
        setDbTestMsg('Conexão bem-sucedida! Tabela "leads" e todas as colunas encontradas.')
      } else {
        setDbTestResult('warn')
        setDbTestMsg('Conexão OK, mas as colunas "proposal" e "briefing" não existem. Execute o ALTER TABLE abaixo para habilitar o salvamento de Proposta e Briefing.')
      }
    } catch (err) {
      setDbTestResult('error')
      setDbTestMsg(err.message || 'Erro ao conectar')
      setDbConnected(false)
    } finally {
      setTestingDb(false)
    }
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const TABS = isAdmin
    ? [
        { id: 'ai',      label: 'IA & Modelos',  icon: Bot },
        { id: 'db',      label: 'Banco de Dados', icon: Database },
        { id: 'prompts', label: 'Prompts da IA',  icon: Code2 },
        { id: 'team',    label: 'Equipe',          icon: Users },
        { id: 'menu',    label: 'Menu',            icon: LayoutList },
      ]
    : [
        { id: 'ai', label: 'IA & Modelos', icon: Bot },
      ]

  return (
    <div className="px-4 py-4 sm:p-6 max-w-3xl mx-auto space-y-5 animate-fade-in">

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-surface-card border border-surface-border rounded-xl overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0 whitespace-nowrap ${
                tab === t.id
                  ? 'bg-[#FFA300] text-black shadow-[0_0_16px_rgba(255,163,0,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Prompts tab */}
      {tab === 'prompts' && <PromptsTab />}

      {/* Team tab */}
      {tab === 'team' && <TeamTab />}

      {/* Menu tab */}
      {tab === 'menu' && <MenuTab />}

      {/* AI Config */}
      {tab === 'ai' && <section>
        <div className="flex items-center gap-2.5 mb-1">
          <Bot className="w-5 h-5 text-[#FFA300]" />
          <h2 className="section-title mb-0">Conexão com IA</h2>
        </div>
        <p className="section-desc">Configure sua chave da API Gemini e o modelo que será usado.</p>

        <div className="glass-card p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Google Gemini API Key
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="input-field pl-9 pr-10"
              />
              <button
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1.5">
              Obtenha sua chave em{' '}
              <span className="text-[#FFA300]">aistudio.google.com</span>. A chave fica apenas no seu navegador.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Modelo</label>
            <div className="grid gap-2">
              {MODELS.map(m => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    aiModel === m.id
                      ? 'border-[#FFA300]/50 bg-[#FFA300]/10'
                      : 'border-surface-border hover:border-surface-border/80 hover:bg-surface-hover'
                  }`}
                >
                  <input
                    type="radio"
                    value={m.id}
                    checked={aiModel === m.id}
                    onChange={() => setAiModel(m.id)}
                    className="mt-0.5 accent-[#FFA300]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-200">{m.label}</p>
                      {m.badge && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md border ${
                          m.badge === 'PRO'
                            ? 'bg-[#FFA300]/15 border-[#FFA300]/30 text-[#FFA300]'
                            : 'bg-[#FFA300]/15 border-[#FFA300]/30 text-[#FFA300]'
                        }`}>
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button onClick={handleSave} className="btn-primary">
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Salvo!</> : 'Salvar Configurações'}
            </button>
            {!apiKey && (
              <div className="flex items-center gap-1.5 text-xs text-[#FFA300]">
                <AlertCircle className="w-3.5 h-3.5" />
                API Key necessária para usar a IA
              </div>
            )}
          </div>
        </div>
      </section>}

      {/* Database */}
      {tab === 'db' && <section>
        <div className="flex items-center gap-2.5 mb-1">
          <Database className="w-5 h-5 text-[#FFA300]" />
          <h2 className="section-title mb-0">Banco de Dados</h2>
          <div className={`ml-auto flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${
            dbConnected
              ? 'bg-[#FFA300]/10 border-[#FFA300]/20 text-[#FFA300]'
              : 'bg-surface border-surface-border text-slate-500'
          }`}>
            {dbConnected ? <><Wifi className="w-3 h-3" /> Conectado</> : <><WifiOff className="w-3 h-3" /> Desconectado</>}
          </div>
        </div>
        <p className="section-desc">
          Conecte ao Supabase para salvar e carregar personas e perguntas SPIN de cada lead.
        </p>

        {dbConnected && !editingDb ? (
          /* Conectado - vista resumida */
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#FFA300] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200">Banco de dados conectado</p>
                <p className="text-xs text-slate-500">Compartilhado entre todos os usuários.</p>
              </div>
            </div>
            {dbColumnsOk === false && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs border bg-[#FFA300]/10 border-[#FFA300]/20 text-[#FFA300]">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span><strong>Migração necessária:</strong> veja a seção abaixo.</span>
              </div>
            )}
            <button onClick={() => setEditingDb(true)} className="btn-ghost text-xs w-full">
              <Pencil className="w-3.5 h-3.5" /> Editar credenciais
            </button>
          </div>

        ) : (
          /* Formulário de configuração */
          <div className="glass-card p-4 space-y-4">
            <div className="p-3 rounded-lg bg-[#FFA300]/5 border border-[#FFA300]/20 text-xs text-[#FFA300] space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5"><Link className="w-3 h-3" /> Como configurar</p>
              <p>1. Crie uma conta gratuita em <span className="font-mono">supabase.com</span></p>
              <p>2. Crie um projeto e vá em <strong>SQL Editor</strong></p>
              <p>3. Execute o script abaixo para criar a tabela</p>
              <p>4. Vá em <strong>Project Settings → API</strong> para pegar a URL e a anon key</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1.5">Script SQL</p>
              <pre className="text-xs font-mono text-slate-400 bg-surface border border-surface-border rounded-lg p-2.5 overflow-x-auto leading-relaxed whitespace-pre">{SQL_SCRIPT}</pre>
            </div>

            <div className="h-px bg-surface-border" />

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Project URL</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input value={sbUrl} onChange={e => setSbUrl(e.target.value)} placeholder="https://xxxxxxxxxxx.supabase.co" className="input-field pl-9" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Anon Key (public)</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type={showSbKey ? 'text' : 'password'} value={sbKey} onChange={e => setSbKey(e.target.value)} placeholder="eyJh..." className="input-field pl-9 pr-10" />
                <button onClick={() => setShowSbKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300">
                  {showSbKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {dbTestResult && (
              <div className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs border ${
                dbTestResult === 'ok' || dbTestResult === 'warn'
                  ? 'bg-[#FFA300]/10 border-[#FFA300]/20 text-[#FFA300]'
                  : 'bg-white/10 border-white/20 text-slate-300'
              }`}>
                {dbTestResult === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                {dbTestMsg}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => { handleSaveDb(); setEditingDb(false) }} className="btn-primary">
                <CheckCircle2 className="w-4 h-4" /> Salvar
              </button>
              <button onClick={handleTestDb} disabled={testingDb || !sbUrl || !sbKey} className="btn-ghost">
                {testingDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
                Testar
              </button>
              {editingDb && (
                <button onClick={() => setEditingDb(false)} className="btn-ghost text-xs ml-auto">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}
      </section>}

      {/* Migration - shown when columns are missing */}
      {tab === 'db' && dbConnected && dbColumnsOk === false && (
        <section>
          <div className="flex items-center gap-2.5 mb-1">
            <AlertCircle className="w-5 h-5 text-[#FFA300]" />
            <h2 className="section-title mb-0 text-[#FFA300]">Migração necessária</h2>
          </div>
          <p className="section-desc">
            Sua tabela existe, mas as colunas de Proposta e Briefing não foram criadas ainda.
            Execute este script no <strong>SQL Editor</strong> do Supabase para habilitar o salvamento completo.
          </p>
          <div className="glass-card p-4 border-[#FFA300]/20">
            <pre className="text-xs font-mono text-[#FFA300] bg-[#FFA300]/5 border border-[#FFA300]/15 rounded-lg p-3 overflow-x-auto leading-relaxed whitespace-pre">{`ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal JSONB;\nALTER TABLE leads ADD COLUMN IF NOT EXISTS briefing JSONB;`}</pre>
            <p className="text-xs text-slate-500 mt-2">Após executar, clique em <strong>Testar Conexão</strong> novamente para confirmar.</p>
          </div>
        </section>
      )}

    </div>
  )
}

