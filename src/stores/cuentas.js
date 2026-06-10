import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../utils/api'

export const useCuentasStore = defineStore('cuentas', () => {
  const cuentas     = ref([])
  const saldo_total = ref(0)
  const stats       = ref(null)
  const loading     = ref(false)
  const error       = ref(null)

  async function fetchCuentas() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/cuentas')
      cuentas.value     = data.data
      saldo_total.value = data.saldo_total
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar cuentas'
    } finally {
      loading.value = false
    }
  }

  async function createCuenta(payload) {
    const { data } = await api.post('/cuentas', payload)
    await fetchCuentas()
    return data
  }

  async function updateCuenta(id, payload) {
    const { data } = await api.put(`/cuentas/${id}`, payload)
    await fetchCuentas()
    return data
  }

  async function deleteCuenta(id) {
    await api.delete(`/cuentas/${id}`)
    await fetchCuentas()
  }

  async function fetchStats(year, month) {
    try {
      const { data } = await api.get('/cuentas/stats', { params: { year, month } })
      stats.value = data
    } catch (e) {
      // non-fatal — dashboard degrades gracefully
    }
  }

  async function transferir(payload) {
    const { data } = await api.post('/cuentas/transferir', payload)
    await fetchCuentas()
    return data
  }

  return { cuentas, saldo_total, stats, loading, error, fetchCuentas, createCuenta, updateCuenta, deleteCuenta, fetchStats, transferir }
})
