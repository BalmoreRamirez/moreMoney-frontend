import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../utils/api'

const TTL = 30_000

export const useTarjetasStore = defineStore('tarjetas', () => {
  const tarjetas    = ref([])
  const tarjeta     = ref(null)
  const total       = ref(0)
  const page        = ref(1)
  const totalPages  = ref(1)
  const loading     = ref(false)
  const error       = ref(null)

  let _lastFetch = 0
  let _lastPage  = null

  async function fetchTarjetas(p = 1, force = false) {
    const fresh = !force && Date.now() - _lastFetch < TTL && tarjetas.value.length && _lastPage === p
    if (fresh) return
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/tarjetas', { params: { page: p } })
      tarjetas.value   = data.data
      total.value      = data.total
      page.value       = data.page
      totalPages.value = data.totalPages
      _lastFetch       = Date.now()
      _lastPage        = p
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar tarjetas'
    } finally {
      loading.value = false
    }
  }

  async function fetchTarjeta(id) {
    loading.value = true
    error.value   = null
    tarjeta.value = null
    try {
      const { data } = await api.get(`/tarjetas/${id}`)
      tarjeta.value = data
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar tarjeta'
    } finally {
      loading.value = false
    }
  }

  async function createTarjeta(payload) {
    const { data } = await api.post('/tarjetas', payload)
    _lastFetch = 0
    await fetchTarjetas(page.value, true)
    return data
  }

  async function updateTarjeta(id, payload) {
    const { data } = await api.put(`/tarjetas/${id}`, payload)
    _lastFetch = 0
    await fetchTarjetas(page.value, true)
    return data
  }

  async function deleteTarjeta(id) {
    await api.delete(`/tarjetas/${id}`)
    _lastFetch = 0
    await fetchTarjetas(page.value, true)
  }

  return { tarjetas, tarjeta, total, page, totalPages, loading, error,
           fetchTarjetas, fetchTarjeta, createTarjeta, updateTarjeta, deleteTarjeta }
})
