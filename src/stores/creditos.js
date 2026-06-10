import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../utils/api'

export const useCreditosStore = defineStore('creditos', () => {
  const creditos = ref([])
  const credito  = ref(null)
  const loading  = ref(false)
  const error    = ref(null)

  async function fetchCreditos(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/creditos', { params })
      creditos.value = data.data
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar créditos'
    } finally {
      loading.value = false
    }
  }

  async function fetchCredito(id) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get(`/creditos/${id}`)
      credito.value = data
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar crédito'
    } finally {
      loading.value = false
    }
  }

  async function createCredito(payload) {
    const { data } = await api.post('/creditos', payload)
    await fetchCreditos()
    return data
  }

  async function deleteCredito(id) {
    await api.delete(`/creditos/${id}`)
    await fetchCreditos()
  }

  async function pagarCuota(creditoId, cuotaId, payload) {
    const { data } = await api.post(`/creditos/${creditoId}/cuotas/${cuotaId}/pagar`, payload)
    credito.value = data
    return data
  }

  return {
    creditos, credito, loading, error,
    fetchCreditos, fetchCredito, createCredito, deleteCredito, pagarCuota,
  }
})
