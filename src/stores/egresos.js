import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../utils/api'

export const useEgresosStore = defineStore('egresos', () => {
  const egresos = ref([])
  const loading = ref(false)
  const error   = ref(null)

  async function fetchEgresos() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/egresos')
      egresos.value = data
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar egresos'
    } finally {
      loading.value = false
    }
  }

  async function createEgreso(payload) {
    const { data } = await api.post('/egresos', payload)
    await fetchEgresos()
    return data
  }

  async function updateEgreso(id, payload) {
    const { data } = await api.put(`/egresos/${id}`, payload)
    await fetchEgresos()
    return data
  }

  async function deleteEgreso(id) {
    await api.delete(`/egresos/${id}`)
    await fetchEgresos()
  }

  return { egresos, loading, error, fetchEgresos, createEgreso, updateEgreso, deleteEgreso }
})
