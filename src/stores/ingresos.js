import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../utils/api'

export const useIngresosStore = defineStore('ingresos', () => {
  const sueldos    = ref([])
  const inversiones = ref([])
  const loading    = ref(false)
  const error      = ref(null)

  // ─── SUELDOS ────────────────────────────────────────────────────────────────

  async function fetchSueldos() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/ingresos/sueldos')
      sueldos.value = data.data
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar sueldos'
    } finally {
      loading.value = false
    }
  }

  async function createSueldo(payload) {
    const { data } = await api.post('/ingresos/sueldos', payload)
    await fetchSueldos()
    return data
  }

  async function updateSueldo(id, payload) {
    const { data } = await api.put(`/ingresos/sueldos/${id}`, payload)
    await fetchSueldos()
    return data
  }

  async function deleteSueldo(id) {
    await api.delete(`/ingresos/sueldos/${id}`)
    await fetchSueldos()
  }

  async function cobrarSueldo(id, payload) {
    const { data } = await api.post(`/ingresos/sueldos/${id}/cobrar`, payload)
    await fetchSueldos()
    return data
  }

  // ─── INVERSIONES ─────────────────────────────────────────────────────────────

  async function fetchInversiones(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/ingresos/inversiones', { params })
      inversiones.value = data.data
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar inversiones'
    } finally {
      loading.value = false
    }
  }

  async function createInversion(payload) {
    const { data } = await api.post('/ingresos/inversiones', payload)
    await fetchInversiones()
    return data
  }

  async function venderInversion(id, payload) {
    const { data } = await api.post(`/ingresos/inversiones/${id}/vender`, payload)
    await fetchInversiones()
    return data
  }

  async function deleteInversion(id) {
    await api.delete(`/ingresos/inversiones/${id}`)
    await fetchInversiones()
  }

  return {
    sueldos, inversiones, loading, error,
    fetchSueldos, createSueldo, updateSueldo, deleteSueldo, cobrarSueldo,
    fetchInversiones, createInversion, venderInversion, deleteInversion,
  }
})
