import { onMounted, onUnmounted, ref } from 'vue'

const INACTIVITY_MS = 30 * 60 * 1000   // 30 minutos
const WARNING_MS    = 60 * 1000         // aviso 1 minuto antes

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']

export function useInactivityTimeout({ onTimeout, onWarning, onActivity } = {}) {
  let idleTimer    = null
  let warningTimer = null
  const isWarning  = ref(false)

  function resetTimers() {
    clearTimeout(idleTimer)
    clearTimeout(warningTimer)
    isWarning.value = false
    onActivity?.()

    warningTimer = setTimeout(() => {
      isWarning.value = true
      onWarning?.()
    }, INACTIVITY_MS - WARNING_MS)

    idleTimer = setTimeout(() => {
      isWarning.value = false
      onTimeout?.()
    }, INACTIVITY_MS)
  }

  onMounted(() => {
    EVENTS.forEach(e => window.addEventListener(e, resetTimers, { passive: true }))
    resetTimers()
  })

  onUnmounted(() => {
    EVENTS.forEach(e => window.removeEventListener(e, resetTimers))
    clearTimeout(idleTimer)
    clearTimeout(warningTimer)
  })

  return { isWarning }
}
