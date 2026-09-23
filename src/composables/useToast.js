import { reactive } from 'vue'

// Singleton — compartido entre todos los componentes
const toasts = reactive([])
let _id = 0

export function useToast() {
  function add(message, type = 'success', duration = 3500) {
    const id = ++_id
    toasts.push({ id, message, type })
    setTimeout(() => remove(id), duration)
  }

  function remove(id) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx !== -1) toasts.splice(idx, 1)
  }

  function errMsg(e) {
    return e?.response?.data?.error || e?.message || 'Ocurrió un error inesperado'
  }

  return {
    toasts,
    remove,
    success: (msg)         => add(msg, 'success', 3500),
    error:   (msg)         => add(msg, 'error',   5000),
    info:    (msg)         => add(msg, 'info',     3500),
    warning: (msg)         => add(msg, 'warning',  4000),
    fromError: (e, fallback) => add(errMsg(e) || fallback, 'error', 5000),
  }
}
