<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close">
        <div class="absolute inset-0" style="background:rgba(7,17,31,0.82);backdrop-filter:blur(6px)" />

        <div class="relative w-full max-w-lg rounded-2xl shadow-card" style="background:#0D2240;border:1px solid rgba(255,255,255,0.1)">
          <!-- Header -->
          <div class="flex items-start justify-between p-6 pb-4">
            <div>
              <h2 class="text-lg font-semibold text-white">{{ tituloMes }}</h2>
              <p class="mt-0.5 text-sm text-slate-400">{{ tarjetaNombre }} — {{ banco }}</p>
            </div>
            <button class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white" @click="close">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Loading -->
          <div v-if="store.loadingDetalle" class="flex items-center justify-center py-12">
            <span class="material-symbols-outlined animate-spin text-3xl" style="color:#10B981">progress_activity</span>
          </div>

          <!-- Content -->
          <div v-else-if="store.detalle" class="px-6 pb-6 space-y-5">

            <!-- Compras normales -->
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Compras normales pendientes</p>
              <div v-if="store.detalle.compras_normales.length === 0" class="rounded-xl px-4 py-3 text-sm text-slate-500" style="background:rgba(255,255,255,0.03)">
                Sin compras normales pendientes
              </div>
              <div v-else class="rounded-xl overflow-hidden" style="border:1px solid rgba(255,255,255,0.06)">
                <div
                  v-for="c in store.detalle.compras_normales"
                  :key="c.id"
                  class="flex items-center justify-between px-4 py-2.5 text-sm"
                  style="border-bottom:1px solid rgba(255,255,255,0.05)"
                >
                  <div>
                    <p class="text-slate-200">{{ c.nombre }}</p>
                    <p class="text-xs text-slate-500">{{ formatDate(c.fecha_compra) }}</p>
                  </div>
                  <span class="font-mono font-semibold text-slate-200">{{ formatCurrency(c.monto) }}</span>
                </div>
                <div class="flex items-center justify-between px-4 py-2.5" style="background:rgba(255,255,255,0.03)">
                  <span class="text-xs text-slate-400">Subtotal normales</span>
                  <span class="font-mono text-sm font-semibold text-slate-200">{{ formatCurrency(store.detalle.total_normales) }}</span>
                </div>
              </div>
            </div>

            <!-- Cuotas tasa cero -->
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Cuotas tasa cero del mes</p>
              <div v-if="store.detalle.cuotas.length === 0" class="rounded-xl px-4 py-3 text-sm text-slate-500" style="background:rgba(255,255,255,0.03)">
                Sin cuotas en este mes
              </div>
              <div v-else class="rounded-xl overflow-hidden" style="border:1px solid rgba(255,255,255,0.06)">
                <div
                  v-for="cuota in store.detalle.cuotas"
                  :key="cuota.id"
                  class="flex items-center justify-between px-4 py-2.5 text-sm"
                  style="border-bottom:1px solid rgba(255,255,255,0.05)"
                >
                  <div>
                    <p class="text-slate-200">{{ cuota.compra_tasa_cero.nombre }}</p>
                    <p class="text-xs text-slate-500">Cuota {{ cuota.numero_cuota }}/{{ cuota.compra_tasa_cero.total_cuotas }} · {{ formatDate(cuota.fecha_estimada_pago) }}</p>
                  </div>
                  <span class="font-mono font-semibold text-slate-200">{{ formatCurrency(cuota.monto_cuota) }}</span>
                </div>
                <div class="flex items-center justify-between px-4 py-2.5" style="background:rgba(255,255,255,0.03)">
                  <span class="text-xs text-slate-400">Subtotal cuotas</span>
                  <span class="font-mono text-sm font-semibold text-slate-200">{{ formatCurrency(store.detalle.total_cuotas) }}</span>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="flex items-center justify-between rounded-xl px-5 py-4" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2)">
              <span class="font-semibold text-slate-300">Total a pagar</span>
              <span class="font-mono text-2xl font-bold text-success">{{ formatCurrency(store.detalle.total) }}</span>
            </div>

            <!-- Error -->
            <div v-if="errorMsg" class="rounded-lg px-4 py-3 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger);border:1px solid rgba(220,38,38,0.2)">
              {{ errorMsg }}
            </div>

            <!-- No pendientes warning -->
            <div v-if="store.detalle.total === 0" class="rounded-lg px-4 py-3 text-sm text-slate-400" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">
              No hay importes pendientes para este mes.
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-1">
              <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5" @click="close">
                Cancelar
              </button>
              <button
                type="button"
                :disabled="store.confirming || store.detalle.total === 0"
                class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                style="background:#10B981"
                @click="confirmar"
              >
                {{ store.confirming ? 'Procesando…' : 'Confirmar Pago' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCalendarioStore } from '../stores/calendario'
import { useTarjetasStore } from '../stores/tarjetas'
import { formatCurrency } from '../utils/currency'

const props = defineProps({
  modelValue:     Boolean,
  tarjetaId:      { type: Number, default: null },
  tarjetaNombre:  { type: String, default: '' },
  banco:          { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'confirmed'])

const store         = useCalendarioStore()
const tarjetasStore = useTarjetasStore()
const errorMsg      = ref('')

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const tituloMes = computed(() => `Pago de ${MONTHS[store.month - 1]} ${store.year}`)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function close() {
  errorMsg.value = ''
  emit('update:modelValue', false)
}

async function confirmar() {
  errorMsg.value = ''
  try {
    await store.confirmarPago(props.tarjetaId)
    await Promise.all([store.fetchCalendario(), tarjetasStore.fetchTarjetas()])
    emit('confirmed')
    close()
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e.message || 'Error al confirmar el pago'
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
