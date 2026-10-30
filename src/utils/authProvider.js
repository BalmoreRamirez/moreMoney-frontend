const configuredProvider = import.meta.env.VITE_AUTH_PROVIDER

export const AUTH_PROVIDER = configuredProvider === 'supabase' ? 'supabase' : 'express'
