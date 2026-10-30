import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'
import { AUTH_PROVIDER } from '../utils/authProvider'
import {
  clearSupabaseSession,
  restoreSupabaseSession,
  signInWithPassword,
  signOutSupabase,
} from '../utils/supabaseAuth'

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const expressToken = ref(AUTH_PROVIDER === 'express' ? localStorage.getItem('token') : null)
  const expressUser = ref(AUTH_PROVIDER === 'express'
    ? JSON.parse(localStorage.getItem('usuario') || 'null')
    : null)
  const supabaseUser = computed(() => {
    const user = session.value?.user
    if (!user) return null
    return {
      id: user.id,
      usuario: user.user_metadata?.usuario || user.email?.split('@')[0] || 'Usuario',
      correo: user.email || '',
    }
  })

  const usuario = computed(() => AUTH_PROVIDER === 'supabase' ? supabaseUser.value : expressUser.value)
  const token = computed(() => AUTH_PROVIDER === 'supabase' ? session.value?.access_token || null : expressToken.value)
  const isAuthenticated = computed(() => Boolean(token.value))

  async function login({ identidad, contrasena }) {
    if (AUTH_PROVIDER === 'supabase') {
      session.value = await signInWithPassword(identidad.trim().toLowerCase(), contrasena)
      return usuario.value
    }

    const { data } = await api.post('/auth/login', { usuario: identidad, contrasena })
    expressToken.value = data.token
    expressUser.value = data.usuario
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    return expressUser.value
  }

  async function restoreSession() {
    if (AUTH_PROVIDER === 'express') return Boolean(expressToken.value)
    try {
      session.value = await restoreSupabaseSession()
    } catch {
      clearSupabaseSession()
      session.value = null
    }
    return isAuthenticated.value
  }

  async function logout() {
    if (AUTH_PROVIDER === 'supabase') {
      session.value = null
      await signOutSupabase()
    } else {
      expressToken.value = null
      expressUser.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
  }

  return { token, session, usuario, isAuthenticated, login, restoreSession, logout }
})
