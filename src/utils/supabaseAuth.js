const SESSION_STORAGE_KEY = 'moremoney.supabase.session'
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const SUPABASE_PUBLIC_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let refreshInFlight = null

function authIsConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLIC_KEY)
}

function readStoredSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || 'null')
    return session?.access_token && session?.refresh_token ? session : null
  } catch {
    return null
  }
}

function persistSession(payload) {
  const expiresIn = Number(payload.expires_in) || 3600
  const session = {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_at: Date.now() + expiresIn * 1000,
    user: payload.user,
  }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  return session
}

export function clearSupabaseSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
  // Limpia sesiones del JWT propio de Express que hubiera guardado una versión anterior.
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

async function authRequest(path, body) {
  if (!authIsConfigured()) {
    throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para iniciar sesión.')
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLIC_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('Supabase Auth devolvió una respuesta inválida.')
  }
  if (!response.ok) {
    const error = new Error(result.msg || result.message || result.error_description || 'No se pudo autenticar la cuenta.')
    error.status = response.status
    throw error
  }
  return result
}

export async function signInWithPassword(email, password) {
  const result = await authRequest('token?grant_type=password', { email, password })
  clearSupabaseSession()
  return persistSession(result)
}

export async function restoreSupabaseSession({ forceRefresh = false } = {}) {
  const session = readStoredSession()
  if (!session) return null
  if (!forceRefresh && session.expires_at > Date.now() + 60_000) return session

  if (!authIsConfigured()) return session
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = authRequest('token?grant_type=refresh_token', {
    refresh_token: session.refresh_token,
  })
    .then(persistSession)
    .catch((error) => {
      if (error.status === 400 || error.status === 401) clearSupabaseSession()
      throw error
    })
    .finally(() => { refreshInFlight = null })

  return refreshInFlight
}

export async function signOutSupabase() {
  const session = readStoredSession()
  clearSupabaseSession()
  if (!session?.access_token || !authIsConfigured()) return

  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLIC_KEY,
        Authorization: `Bearer ${session.access_token}`,
      },
    })
  } catch {
    // La sesión local ya está invalidada; el cierre remoto es de mejor esfuerzo.
  }
}
