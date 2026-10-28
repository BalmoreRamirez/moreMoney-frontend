import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../utils/api'
import { useCuentasStore } from './cuentas'

export const usePrestamosStore = defineStore('prestamos', () => {
  const prestamos = ref([])
  const prestamo  = ref(null)
  const loading   = ref(false)
  const error     = ref(null)

  async function fetchPrestamos(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/prestamos', { params })
      prestamos.value = data.data
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar préstamos'
    } finally {
      loading.value = false
    }
  }

  async function fetchPrestamo(id) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get(`/prestamos/${id}`)
      prestamo.value = data
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al cargar préstamo'
    } finally {
      loading.value = false
    }
  }

  async function createPrestamo(payload) {
    const { data } = await api.post('/prestamos', payload)
    await Promise.all([fetchPrestamos(), useCuentasStore().fetchCuentas()])
    return data
  }

  async function updatePrestamo(id, payload) {
    const { data } = await api.put(`/prestamos/${id}`, payload)
    await Promise.all([fetchPrestamos(), useCuentasStore().fetchCuentas()])
    return data
  }

  async function deletePrestamo(id) {
    await api.delete(`/prestamos/${id}`)
    await Promise.all([fetchPrestamos(), useCuentasStore().fetchCuentas()])
  }

  async function registrarAbono(id, payload) {
    const { data } = await api.post(`/prestamos/${id}/abono`, payload)
    prestamo.value = data
    await useCuentasStore().fetchCuentas()
    return data
  }

  async function updateAbono(prestamoId, abonoId, payload) {
    const { data } = await api.put(`/prestamos/${prestamoId}/abono/${abonoId}`, payload)
    prestamo.value = data
    await useCuentasStore().fetchCuentas()
    return data
  }

  async function deleteAbono(prestamoId, abonoId) {
    const { data } = await api.delete(`/prestamos/${prestamoId}/abono/${abonoId}`)
    prestamo.value = data
    await useCuentasStore().fetchCuentas()
    return data
  }

  async function marcarPagado(id) {
    const { data } = await api.post(`/prestamos/${id}/pagar`)
    prestamo.value = data
    await useCuentasStore().fetchCuentas()
    return data
  }

  return {
    prestamos, prestamo, loading, error,
    fetchPrestamos, fetchPrestamo, createPrestamo, updatePrestamo, deletePrestamo,
    registrarAbono, updateAbono, deleteAbono, marcarPagado,
  }
})
