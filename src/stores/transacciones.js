import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../utils/api'

export const useTransaccionesStore = defineStore('transacciones', () => {
  const transacciones = ref([])
  const total         = ref(0)
  const page          = ref(1)
  const totalPages    = ref(1)
  const loading       = ref(false)
  const error         = ref(null)

  async function fetchTransacciones(cuentaId, params = {}) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get(`/cuentas/${cuentaId}/transacciones`, { params })
      transacciones.value = data.data
      total.value         = data.total
      page.value          = data.page
      totalPages.value    = data.totalPages
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar transacciones'
    } finally {
      loading.value = false
    }
  }

  async function createManual(cuentaId, payload) {
    const { data } = await api.post(`/cuentas/${cuentaId}/transacciones`, payload)
    return data
  }

  async function deleteTransaccion(id) {
    await api.delete(`/cuentas/transacciones/${id}`)
  }

  return {
    transacciones, total, page, totalPages, loading, error,
    fetchTransacciones, createManual, deleteTransaccion,
  }
})
