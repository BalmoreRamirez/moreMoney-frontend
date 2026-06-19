import { defineStore } from 'pinia'
import api from '../utils/api'

export const useReportesStore = defineStore('reportes', {
  state: () => ({
    year:        new Date().getFullYear(),
    month:       new Date().getMonth() + 1,
    resumen:     [],
    grand_total: 0,
    loading:     false,
    error:       null,
    flujo: { serie: [], categorias: [], loading: false, error: null },
  }),

  actions: {
    async fetchMensual() {
      this.loading = true
      this.error   = null
      try {
        const { data } = await api.get('/reportes/mensual', {
          params: { year: this.year, month: this.month },
        })
        this.resumen     = data.resumen
        this.grand_total = data.grand_total
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchFlujo(periodo = 'mes') {
      this.flujo.loading = true
      this.flujo.error   = null
      try {
        const { data } = await api.get('/reportes/flujo', { params: { periodo } })
        this.flujo.serie      = data.serie
        this.flujo.categorias = data.categorias
      } catch (e) {
        this.flujo.error = e.message
      } finally {
        this.flujo.loading = false
      }
    },

    prevMonth() {
      if (this.month === 1) { this.month = 12; this.year-- }
      else this.month--
    },

    nextMonth() {
      if (this.month === 12) { this.month = 1; this.year++ }
      else this.month++
    },
  },
})
