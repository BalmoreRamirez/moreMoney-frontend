import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../utils/api'

const TTL = 30_000

export const useCuentasStore = defineStore('cuentas', () => {
  const cuentas      = ref([])
  const saldo_total  = ref(0)
  const stats        = ref(null)
  const flujoCuentas = ref(null)
  const loading      = ref(false)
  const error        = ref(null)

  let _lastFetch = 0

  async function fetchCuentas(force = false) {
    if (!force && Date.now() - _lastFetch < TTL && cuentas.value.length) return
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/cuentas')
      cuentas.value     = data.data
      saldo_total.value = data.saldo_total
      _lastFetch        = Date.now()
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar cuentas'
    } finally {
      loading.value = false
    }
  }

  async function createCuenta(payload) {
    const { data } = await api.post('/cuentas', payload)
    _lastFetch = 0
    await fetchCuentas(true)
    return data
  }

  async function updateCuenta(id, payload) {
    const { data } = await api.put(`/cuentas/${id}`, payload)
    _lastFetch = 0
    await fetchCuentas(true)
    return data
  }

  async function deleteCuenta(id) {
    await api.delete(`/cuentas/${id}`)
    _lastFetch = 0
    await fetchCuentas(true)
  }

  async function fetchStats(year, month) {
    try {
      const { data } = await api.get('/cuentas/stats', { params: { year, month } })
      stats.value = data
    } catch (e) {
      // non-fatal — dashboard degrades gracefully
    }
  }

  async function fetchFlujoCuentas(year, month) {
    try {
      const { data } = await api.get('/cuentas/flujo-mes', { params: { year, month } })
      flujoCuentas.value = data
    } catch (e) {
      // non-fatal
    }
  }

  async function transferir(payload) {
    const { data } = await api.post('/cuentas/transferir', payload)
    _lastFetch = 0
    await fetchCuentas(true)
    return data
  }

  return { cuentas, saldo_total, stats, flujoCuentas, loading, error, fetchCuentas, createCuenta, updateCuenta, deleteCuenta, fetchStats, fetchFlujoCuentas, transferir }
})
