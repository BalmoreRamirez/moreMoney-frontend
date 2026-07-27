import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../utils/api'

export const useComprasStore = defineStore('compras', () => {
  const normales  = ref([])
  const tasaCero  = ref([])
  const loading   = ref(false)
  const error     = ref(null)

  async function fetchNormales(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/compras/normales', { params })
      normales.value = data.data
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar compras normales'
    } finally {
      loading.value = false
    }
  }

  async function createNormal(payload) {
    const { data } = await api.post('/compras/normales', payload)
    return data
  }

  async function updateNormal(id, payload) {
    const { data } = await api.put(`/compras/normales/${id}`, payload)
    return data
  }

  async function deleteNormal(id) {
    await api.delete(`/compras/normales/${id}`)
  }

  async function fetchTasaCero(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/compras/tasa-cero', { params })
      tasaCero.value = data.data
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar compras tasa cero'
    } finally {
      loading.value = false
    }
  }

  async function createTasaCero(payload) {
    const { data } = await api.post('/compras/tasa-cero', payload)
    return data
  }

  async function updateTasaCero(id, payload) {
    const { data } = await api.put(`/compras/tasa-cero/${id}`, payload)
    return data
  }

  async function deleteTasaCero(id) {
    await api.delete(`/compras/tasa-cero/${id}`)
  }

  return {
    normales, tasaCero, loading, error,
    fetchNormales, createNormal, updateNormal, deleteNormal,
    fetchTasaCero, createTasaCero, updateTasaCero, deleteTasaCero,
  }
})
