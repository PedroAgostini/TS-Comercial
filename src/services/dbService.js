import { createClient } from '@supabase/supabase-js'

let _client = null

// ─── Init ─────────────────────────────────────────────────────────────────────
export function initSupabase(url, key) {
  if (!url || !key) { _client = null; return null }
  _client = createClient(url, key)
  return _client
}

export function getClient() { return _client }

// ─── Test Connection ──────────────────────────────────────────────────────────
export async function testConnection() {
  if (!_client) throw new Error('Supabase não inicializado')
  const { error } = await _client.from('leads').select('id').limit(1)
  if (error) throw error
  return true
}

// ─── Check if proposal/briefing columns exist ─────────────────────────────────
export async function checkColumns() {
  if (!_client) return false
  const { error } = await _client.from('leads').select('id, proposal, briefing').limit(1)
  return !error
}

const isMissingColumn = (err) =>
  err?.message?.includes('column') &&
  (err.message.includes('proposal') || err.message.includes('briefing'))

// ─── Upsert Lead ─────────────────────────────────────────────────────────────
export async function saveLead(id, payload) {
  if (!_client) throw new Error('Banco de dados não configurado')

  const baseData = {
    name: payload.name || null,
    niche: payload.niche || null,
    state: payload.state || null,
    transcription: payload.transcription || null,
    persona: payload.persona || null,
    spin_questions: payload.spinQuestions || null,
    call_notes: payload.callNotes || null,
    updated_at: new Date().toISOString(),
  }

  const doSave = async (data) => {
    if (id) {
      const { data: row, error } = await _client
        .from('leads').update(data).eq('id', id).select().single()
      if (error) throw error
      return row
    } else {
      const { data: row, error } = await _client
        .from('leads').insert({ ...data, created_at: new Date().toISOString() }).select().single()
      if (error) throw error
      return row
    }
  }

  try {
    return await doSave({
      ...baseData,
      proposal: payload.proposal || null,
      briefing: payload.briefing || null,
    })
  } catch (err) {
    if (isMissingColumn(err)) return await doSave(baseData)
    throw err
  }
}

// ─── Fetch All Leads ──────────────────────────────────────────────────────────
export async function fetchLeads() {
  if (!_client) throw new Error('Banco de dados não configurado')

  const { data, error } = await _client
    .from('leads')
    .select('id, name, niche, state, created_at, updated_at, persona, spin_questions, call_notes, proposal, briefing')
    .order('updated_at', { ascending: false })

  if (error) {
    if (isMissingColumn(error)) {
      const { data: fallback, error: fallbackErr } = await _client
        .from('leads')
        .select('id, name, niche, state, created_at, updated_at, persona, spin_questions, call_notes')
        .order('updated_at', { ascending: false })
      if (fallbackErr) throw fallbackErr
      return fallback
    }
    throw error
  }
  return data
}

// ─── Fetch Single Lead ────────────────────────────────────────────────────────
export async function fetchLead(id) {
  if (!_client) throw new Error('Banco de dados não configurado')
  const { data, error } = await _client
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ─── Delete Lead ──────────────────────────────────────────────────────────────
export async function deleteLead(id) {
  if (!_client) throw new Error('Banco de dados não configurado')
  const { error } = await _client.from('leads').delete().eq('id', id)
  if (error) throw error
}
