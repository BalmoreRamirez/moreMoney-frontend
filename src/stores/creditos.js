import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../utils/api'

const TTL = 30_000

export const useCreditosStore = defineStore('creditos', () => {
  const creditos = ref([])
  const credito  = ref(null)
  const loading  = ref(false)
  const error    = ref(null)

  let _lastFetch  = 0
  let _lastParams = null

  async function fetchCreditos(params = {}, force = false) {
    const paramsKey = JSON.stringify(params)
    const fresh = !force && Date.now() - _lastFetch < TTL && creditos.value.length && _lastParams === paramsKey
    if (fresh) return
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/creditos', { params })
      creditos.value = data.data
      _lastFetch     = Date.now()
      _lastParams    = paramsKey
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
    _lastFetch = 0
    await fetchCreditos({}, true)
    return data
  }

  async function deleteCredito(id) {
    await api.delete(`/creditos/${id}`)
    _lastFetch = 0
    await fetchCreditos({}, true)
  }

  async function pagarCuota(creditoId, cuotaId, payload) {
    const { data } = await api.post(`/creditos/${creditoId}/cuotas/${cuotaId}/pagar`, payload)
    credito.value = data
    _lastFetch    = 0
    return data
  }

  return {
    creditos, credito, loading, error,
    fetchCreditos, fetchCredito, createCredito, deleteCredito, pagarCuota,
  }
})
