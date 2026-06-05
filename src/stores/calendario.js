import { defineStore } from 'pinia'
import api from '../utils/api'

export const useCalendarioStore = defineStore('calendario', {
  state: () => ({
    year:           new Date().getFullYear(),
    month:          new Date().getMonth() + 1,
    tarjetas:       [],
    events:         [],
    loading:        false,
    error:          null,
    detalle:        null,
    loadingDetalle: false,
    confirming:     false,
  }),

  actions: {
    async fetchCalendario() {
      this.loading = true
      this.error   = null
      try {
        const { data } = await api.get('/calendario', {
          params: { year: this.year, month: this.month },
        })
        this.tarjetas = data.tarjetas
        this.events   = data.events
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchDetalle(tarjeta_id) {
      this.loadingDetalle = true
      this.detalle        = null
      try {
        const { data } = await api.get('/calendario/pago/detalle', {
          params: { tarjeta_id, year: this.year, month: this.month },
        })
        this.detalle = data
      } catch (e) {
        this.error = e.message
      } finally {
        this.loadingDetalle = false
      }
    },

    async confirmarPago(tarjeta_id, cuenta_id) {
      this.confirming = true
      try {
        const { data } = await api.post('/calendario/pago/confirmar', {
          tarjeta_id, year: this.year, month: this.month, cuenta_id,
        })
        return data
      } finally {
        this.confirming = false
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
