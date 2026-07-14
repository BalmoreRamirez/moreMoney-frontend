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

  // ─── OTROS INGRESOS (manuales) ───────────────────────────────────────────────

  const otros = ref([])

  async function fetchOtros() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/ingresos/otros')
      otros.value = data
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar ingresos'
    } finally {
      loading.value = false
    }
  }

  async function createOtro(payload) {
    const { data } = await api.post('/ingresos/otros', payload)
    await fetchOtros()
    return data
  }

  async function updateOtro(id, payload) {
    const { data } = await api.put(`/ingresos/otros/${id}`, payload)
    await fetchOtros()
    return data
  }

  async function deleteOtro(id) {
    await api.delete(`/ingresos/otros/${id}`)
    await fetchOtros()
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

  async function updateInversion(id, payload) {
    const { data } = await api.put(`/ingresos/inversiones/${id}`, payload)
    await fetchInversiones()
    return data
  }

  async function resetearInversion(id) {
    const { data } = await api.post(`/ingresos/inversiones/${id}/resetear`)
    await fetchInversiones()
    return data
  }

  async function registrarCobro(id, payload) {
    const { data } = await api.post(`/ingresos/inversiones/${id}/cobrar`, payload)
    await fetchInversiones()
    return data
  }

  async function deleteInversion(id) {
    await api.delete(`/ingresos/inversiones/${id}`)
    await fetchInversiones()
  }

  return {
    sueldos, inversiones, otros, loading, error,
    fetchSueldos, createSueldo, updateSueldo, deleteSueldo, cobrarSueldo,
    fetchInversiones, createInversion, updateInversion, resetearInversion, registrarCobro, deleteInversion,
    fetchOtros, createOtro, updateOtro, deleteOtro,
  }
})
