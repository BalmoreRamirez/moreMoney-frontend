<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close">
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)" />

        <div class="modal-box relative w-full max-w-lg rounded-2xl shadow-card">
          <!-- Header -->
          <div class="flex items-start justify-between p-6 pb-4">
            <div>
              <h2 class="text-lg font-semibold" style="color:var(--color-text-primary)">{{ tituloMes }}</h2>
              <p class="mt-0.5 text-sm" style="color:var(--color-text-secondary)">{{ tarjetaNombre }} — {{ banco }}</p>
            </div>
            <button class="modal-close-btn" @click="close">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Loading -->
          <div v-if="store.loadingDetalle" class="flex items-center justify-center py-12">
            <span class="material-symbols-outlined animate-spin text-3xl" style="color:var(--color-success)">progress_activity</span>
          </div>

          <!-- Content -->
          <div v-else-if="store.detalle" class="px-6 pb-6 space-y-5">

            <!-- Compras normales -->
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wider" style="color:var(--color-text-secondary)">Compras normales pendientes</p>
              <div v-if="store.detalle.compras_normales.length === 0"
                   class="rounded-xl px-4 py-3 text-sm"
                   style="background:var(--color-surface-mid);color:var(--color-text-secondary)">
                Sin compras normales pendientes
              </div>
              <div v-else class="rounded-xl overflow-hidden" style="border:1px solid var(--color-border)">
                <div
                  v-for="c in store.detalle.compras_normales"
                  :key="c.id"
                  class="flex items-center justify-between px-4 py-2.5 text-sm"
                  style="border-bottom:1px solid var(--color-border)"
                >
                  <div>
                    <p style="color:var(--color-text-primary)">{{ c.nombre }}</p>
                    <p class="text-xs" style="color:var(--color-text-muted)">{{ formatDate(c.fecha_compra) }}</p>
                  </div>
                  <span class="font-mono font-semibold" style="color:var(--color-text-primary)">{{ formatCurrency(c.monto) }}</span>
                </div>
                <div class="flex items-center justify-between px-4 py-2.5" style="background:var(--color-surface-mid)">
                  <span class="text-xs" style="color:var(--color-text-muted)">Subtotal normales</span>
                  <span class="font-mono text-sm font-semibold" style="color:var(--color-text-primary)">{{ formatCurrency(store.detalle.total_normales) }}</span>
                </div>
              </div>
            </div>

            <!-- Cuotas tasa cero -->
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wider" style="color:var(--color-text-secondary)">Cuotas tasa cero del mes</p>
              <div v-if="store.detalle.cuotas.length === 0"
                   class="rounded-xl px-4 py-3 text-sm"
                   style="background:var(--color-surface-mid);color:var(--color-text-secondary)">
                Sin cuotas en este mes
              </div>
              <div v-else class="rounded-xl overflow-hidden" style="border:1px solid var(--color-border)">
                <div
                  v-for="cuota in store.detalle.cuotas"
                  :key="cuota.id"
                  class="flex items-center justify-between px-4 py-2.5 text-sm"
                  style="border-bottom:1px solid var(--color-border)"
                >
                  <div>
                    <p style="color:var(--color-text-primary)">{{ cuota.compra_tasa_cero.nombre }}</p>
                    <p class="text-xs" style="color:var(--color-text-muted)">Cuota {{ cuota.numero_cuota }}/{{ cuota.compra_tasa_cero.total_cuotas }} · {{ formatDate(cuota.fecha_estimada_pago) }}</p>
                  </div>
                  <span class="font-mono font-semibold" style="color:var(--color-text-primary)">{{ formatCurrency(cuota.monto_cuota) }}</span>
                </div>
                <div class="flex items-center justify-between px-4 py-2.5" style="background:var(--color-surface-mid)">
                  <span class="text-xs" style="color:var(--color-text-muted)">Subtotal cuotas</span>
                  <span class="font-mono text-sm font-semibold" style="color:var(--color-text-primary)">{{ formatCurrency(store.detalle.total_cuotas) }}</span>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="flex items-center justify-between rounded-xl px-5 py-4" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2)">
              <span class="font-semibold" style="color:var(--color-text-primary)">Total a pagar</span>
              <span class="font-mono text-2xl font-bold" style="color:var(--color-success)">{{ formatCurrency(store.detalle.total) }}</span>
            </div>

            <!-- Selector de cuenta -->
            <div v-if="store.detalle.total > 0">
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style="color:var(--color-text-secondary)">
                ¿Desde qué cuenta pagas?
              </label>
              <select
                v-model.number="cuentaId"
                class="fintech-input w-full"
                :class="!cuentaId && intentoConfirmar ? 'border-danger' : ''"
              >
                <option :value="null" disabled>Selecciona una cuenta</option>
                <option v-for="c in cuentas" :key="c.id" :value="c.id">
                  {{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }} ({{ c.tipo }})
                </option>
              </select>
              <p v-if="!cuentaId && intentoConfirmar" class="mt-1 text-xs" style="color:var(--color-danger)">
                Debes seleccionar una cuenta para confirmar el pago.
              </p>
              <div v-if="cuentaId" class="mt-2 flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                   :style="saldoResultante < 0
                     ? 'background:var(--color-danger-bg);border:1px solid rgba(220,38,38,0.2)'
                     : 'background:var(--color-surface-mid);border:1px solid var(--color-border)'">
                <span :style="saldoResultante < 0 ? 'color:var(--color-danger);font-weight:500' : 'color:var(--color-text-secondary)'">
                  Saldo resultante
                </span>
                <span class="font-mono font-semibold" :style="saldoResultante < 0 ? 'color:var(--color-danger)' : 'color:var(--color-text-primary)'">
                  {{ formatCurrency(saldoResultante) }}
                  <span v-if="saldoResultante < 0"> — Saldo insuficiente</span>
                </span>
              </div>
            </div>

            <!-- Error -->
            <div v-if="errorMsg" class="rounded-lg px-4 py-3 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger);border:1px solid rgba(220,38,38,0.2)">
              {{ errorMsg }}
            </div>

            <!-- No pendientes -->
            <div v-if="store.detalle.total === 0" class="rounded-lg px-4 py-3 text-sm"
                 style="background:var(--color-surface-mid);color:var(--color-text-secondary);border:1px solid var(--color-border)">
              No hay importes pendientes para este mes.
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-1">
              <button type="button" class="cancel-btn flex-1 rounded-xl py-2.5 text-sm font-medium" @click="close">
                Cancelar
              </button>
              <button
                type="button"
                :disabled="store.confirming || store.detalle.total === 0"
                class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                style="background:var(--color-success)"
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
import { ref, computed, watch } from 'vue'
import { useCalendarioStore } from '../stores/calendario'
import { useTarjetasStore }   from '../stores/tarjetas'
import { useCuentasStore }    from '../stores/cuentas'
import { formatCurrency }     from '../utils/currency'

const props = defineProps({
  modelValue:      Boolean,
  tarjetaId:       { type: Number, default: null },
  tarjetaNombre:   { type: String, default: '' },
  banco:           { type: String, default: '' },
  cuentaPagoId:    { type: Number, default: null },
})
const emit = defineEmits(['update:modelValue', 'confirmed'])

const store         = useCalendarioStore()
const tarjetasStore = useTarjetasStore()
const cuentasStore  = useCuentasStore()

const cuentas         = computed(() => cuentasStore.cuentas)
const cuentaId        = ref(null)
const errorMsg        = ref('')
const intentoConfirmar = ref(false)

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const tituloMes         = computed(() => `Pago de ${MONTHS[store.month - 1]} ${store.year}`)
const cuentaSeleccionada = computed(() => cuentas.value.find(c => c.id === cuentaId.value) ?? null)
const saldoResultante    = computed(() =>
  cuentaSeleccionada.value
    ? parseFloat(cuentaSeleccionada.value.saldo_actual) - (store.detalle?.total ?? 0)
    : 0
)

watch(() => props.modelValue, async (open) => {
  if (open) {
    errorMsg.value        = ''
    intentoConfirmar.value = false
    if (!cuentasStore.cuentas.length) await cuentasStore.fetchCuentas()
    cuentaId.value = props.cuentaPagoId ?? null
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function close() {
  errorMsg.value        = ''
  intentoConfirmar.value = false
  emit('update:modelValue', false)
}

async function confirmar() {
  intentoConfirmar.value = true
  if (store.detalle?.total > 0 && !cuentaId.value) return

  errorMsg.value = ''
  try {
    await store.confirmarPago(props.tarjetaId, cuentaId.value)
    await Promise.all([store.fetchCalendario(), tarjetasStore.fetchTarjetas()])
    emit('confirmed')
    close()
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e.message || 'Error al confirmar el pago'
  }
}
</script>

<style scoped>
.modal-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 2rem;
  border-radius: 0.5rem;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.modal-close-btn:hover {
  background: var(--color-surface-high);
  color: var(--color-text-primary);
}

.cancel-btn {
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
.cancel-btn:hover {
  background: var(--color-surface-high);
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
