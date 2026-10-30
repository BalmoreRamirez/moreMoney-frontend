import axios from 'axios'
import { AUTH_PROVIDER } from './authProvider'
import { clearSupabaseSession, restoreSupabaseSession } from './supabaseAuth'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' })
const supabasePublicKey = import.meta.env.VITE_SUPABASE_ANON_KEY

api.interceptors.request.use(async (config) => {
  if (AUTH_PROVIDER === 'supabase') {
    const session = await restoreSupabaseSession()
    if (supabasePublicKey) config.headers.apikey = supabasePublicKey
    if (session?.access_token) config.headers.Authorization = `Bearer ${session.access_token}`
  } else {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    if (error.response?.status === 401 && config) {
      if (AUTH_PROVIDER === 'supabase') {
        if (!config._authRetried) {
          config._authRetried = true
          try {
            const session = await restoreSupabaseSession({ forceRefresh: true })
            if (session?.access_token) {
              config.headers.Authorization = `Bearer ${session.access_token}`
              return api.request(config)
            }
          } catch {
            // La sesión expirada se limpia abajo.
          }
        }
        clearSupabaseSession()
        window.location.assign('/login')
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
