<template>
  <section>
    <!-- Back -->
    <button class="mb-5 flex items-center gap-1 text-sm transition-colors" style="color:var(--color-text-muted)" @click="router.back()">
      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
      Volver a cuentas
    </button>

    <!-- Loading -->
    <div v-if="cuentasStore.loading" class="flex justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-success border-t-transparent" />
    </div>

    <template v-else-if="cuenta">
      <!-- Cabecera de la cuenta -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl" :style="iconoBg(cuenta.tipo)">
            <span class="material-symbols-outlined text-[28px]" :style="{ color: iconoColor(cuenta.tipo) }">{{ iconoTipo(cuenta.tipo) }}</span>
          </div>
          <div>
            <h1 class="text-2xl font-bold" style="color:var(--color-text-primary)">{{ cuenta.nombre }}</h1>
            <p class="text-sm capitalize" style="color:var(--color-text-muted)">{{ cuenta.tipo }}</p>
          </div>
        </div>

        <button
          class="btn-brand"
          @click="showMovModal = true"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          Registrar movimiento
        </button>
      </div>

      <!-- KPIs -->
      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="fintech-card p-5 text-center">
          <p class="text-xs uppercase tracking-wider" style="color:var(--color-text-muted)">Saldo actual</p>
          <p class="mt-2 font-mono text-2xl font-bold" :style="{ color: cuenta.saldo_actual >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
            {{ formatCurrency(cuenta.saldo_actual) }}
          </p>
        </div>
        <div class="fintech-card p-5 text-center">
          <p class="text-xs uppercase tracking-wider" style="color:var(--color-text-muted)">Total ingresos</p>
          <p class="mt-2 font-mono text-2xl font-bold" style="color:var(--color-success)">{{ formatCurrency(cuenta.total_ingresos) }}</p>
        </div>
        <div class="fintech-card p-5 text-center">
          <p class="text-xs uppercase tracking-wider" style="color:var(--color-text-muted)">Total egresos</p>
          <p class="mt-2 font-mono text-2xl font-bold" style="color:var(--color-danger)">{{ formatCurrency(cuenta.total_egresos) }}</p>
        </div>
      </div>

      <!-- Filtros del libro -->
      <div class="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-sm font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Libro de movimientos</h2>
        <div class="flex flex-wrap items-center gap-2">
          <!-- Filtro tipo -->
          <div class="flex gap-1 rounded-xl p-1" style="background:var(--color-surface-mid);border:1px solid var(--color-border)">
            <button
              v-for="opt in tipoOpts"
              :key="opt.value"
              class="rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
              :style="filtroTipo === opt.value ? 'background:var(--color-brand-light);color:var(--color-brand)' : 'color:var(--color-text-secondary)'"
              @click="setFiltroTipo(opt.value)"
            >{{ opt.label }}</button>
          </div>
          <!-- Fecha desde/hasta -->
          <input v-model="fechaDesde" type="date" class="fintech-input w-36 text-xs" @change="recargar" />
          <input v-model="fechaHasta" type="date" class="fintech-input w-36 text-xs" @change="recargar" />
        </div>
      </div>

      <!-- Loading transacciones -->
      <div v-if="txStore.loading" class="mt-6 flex justify-center py-10">
        <div class="h-7 w-7 animate-spin rounded-full border-2 border-success border-t-transparent" />
      </div>

      <!-- Tabla transacciones -->
      <div v-else-if="txStore.transacciones.length" class="mt-4 fintech-card overflow-x-auto">
        <table class="w-full min-w-[480px] text-sm">
          <thead>
            <tr style="border-bottom:1px solid var(--color-border)">
              <th class="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Fecha</th>
              <th class="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Descripción</th>
              <th class="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Tipo</th>
              <th class="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Monto</th>
              <th class="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in txStore.transacciones"
              :key="tx.id"
              style="border-bottom:1px solid var(--color-border)"
            >
              <td class="px-4 py-3 tabular-nums" style="color:var(--color-text-secondary)">{{ formatDate(tx.fecha) }}</td>
              <td class="px-4 py-3" style="color:var(--color-text-primary)">
                {{ tx.descripcion }}
                <span v-if="tx.referencia_tipo && tx.referencia_tipo !== 'manual'" class="ml-1 text-[10px]" style="color:var(--color-text-muted)">
                  ({{ labelReferencia(tx.referencia_tipo) }})
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="tx.tipo === 'ingreso' ? 'badge-success' : 'badge-danger'">{{ tx.tipo }}</span>
              </td>
              <td class="px-4 py-3 text-right font-mono font-semibold" :style="{ color: tx.tipo === 'ingreso' ? 'var(--color-success)' : 'var(--color-danger)' }">
                {{ tx.tipo === 'ingreso' ? '+' : '-' }}{{ formatCurrency(tx.monto) }}
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  v-if="tx.referencia_tipo === 'manual'"
                  class="icon-btn-danger"
                  title="Eliminar"
                  @click="confirmDeleteTx(tx)"
                >
                  <span class="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vacío -->
      <div v-else class="mt-4 fintech-card flex flex-col items-center py-12 text-center">
        <span class="material-symbols-outlined text-5xl" style="color:var(--color-brand-light)">receipt_long</span>
        <p class="mt-3 text-sm" style="color:var(--color-text-secondary)">Sin movimientos registrados.</p>
      </div>

      <!-- Paginación -->
      <div v-if="txStore.totalPages > 1" class="mt-4 flex items-center justify-center gap-2">
        <button
          class="icon-btn disabled:opacity-30"
          :disabled="txStore.page === 1"
          @click="cambiarPagina(txStore.page - 1)"
        >
          <span class="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <span class="text-xs" style="color:var(--color-text-muted)">{{ txStore.page }} / {{ txStore.totalPages }}</span>
        <button
          class="icon-btn disabled:opacity-30"
          :disabled="txStore.page === txStore.totalPages"
          @click="cambiarPagina(txStore.page + 1)"
        >
          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </template>

    <!-- Modal movimiento manual -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showMovModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0" style="background:rgba(7,17,31,0.4);backdrop-filter:blur(6px)" @click="showMovModal = false" />
          <div class="relative w-full max-w-sm rounded-2xl p-6" style="background:var(--color-surface);border:1px solid var(--color-border)">
            <h3 class="mb-4 font-semibold" style="color:var(--color-text-primary)">Registrar movimiento</h3>
            <form class="space-y-4" @submit.prevent="guardarMovimiento">
              <div>
                <label class="mb-1.5 block text-xs font-medium" style="color:var(--color-text-muted)">Tipo</label>
                <select v-model="movForm.tipo" class="fintech-input" required>
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium" style="color:var(--color-text-muted)">Monto</label>
                <input v-model.number="movForm.monto" type="number" min="0.01" step="0.01" class="fintech-input" placeholder="0.00" required />
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium" style="color:var(--color-text-muted)">Descripción</label>
                <input v-model="movForm.descripcion" class="fintech-input" placeholder="Ej: Depósito, pago de servicio…" required />
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium" style="color:var(--color-text-muted)">Fecha</label>
                <input v-model="movForm.fecha" type="date" class="fintech-input" required />
              </div>
              <p v-if="movError" class="text-xs text-danger">{{ movError }}</p>
              <div class="flex gap-3 pt-1">
                <button type="button" class="btn-ghost flex-1" @click="showMovModal = false">Cancelar</button>
                <button type="submit" class="btn-brand flex-1 disabled:opacity-50" :disabled="savingMov">
                  {{ savingMov ? 'Guardando…' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm delete transacción -->
    <ConfirmDeleteModal
      v-if="deleteTxTarget"
      :nombre="`movimiento de ${formatCurrency(deleteTxTarget.monto)}`"
      :error="deleteTxError"
      :deleting="deletingTx"
      @confirm="doDeleteTx"
      @cancel="deleteTxTarget = null"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCuentasStore }      from '../stores/cuentas'
import { useTransaccionesStore } from '../stores/transacciones'
import { formatCurrency }        from '../utils/currency'
import ConfirmDeleteModal        from '../components/ConfirmDeleteModal.vue'

const route        = useRoute()
const router       = useRouter()
const cuentasStore = useCuentasStore()
const txStore      = useTransaccionesStore()

const cuentaId = computed(() => route.params.id)
const cuenta   = computed(() => cuentasStore.cuentas.find(c => String(c.id) === String(cuentaId.value)))

const filtroTipo  = ref('')
const fechaDesde  = ref('')
const fechaHasta  = ref('')
const tipoOpts    = [{ value: '', label: 'Todos' }, { value: 'ingreso', label: 'Ingresos' }, { value: 'egreso', label: 'Egresos' }]

onMounted(async () => {
  await cuentasStore.fetchCuentas(true)
  recargar()
})

function recargar(pg = 1) {
  const params = { page: pg }
  if (filtroTipo.value) params.tipo = filtroTipo.value
  if (fechaDesde.value) params.fecha_desde = fechaDesde.value
  if (fechaHasta.value) params.fecha_hasta  = fechaHasta.value
  txStore.fetchTransacciones(cuentaId.value, params)
}

function setFiltroTipo(v) { filtroTipo.value = v; recargar() }
function cambiarPagina(p) { recargar(p) }

function formatDate(d) {
  if (!d) return '-'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

const REFERENCIA_LABELS = {
  pago_tarjeta:     'Pago tarjeta',
  sueldo:           'Sueldo',
  prestamo:         'Préstamo',
  pago_prestamo:    'Abono recibido',
  ganancia_prestamo:'Ganancia préstamo',
  inversion:        'Inversión',
  manual:           'Manual',
}
function labelReferencia(tipo) { return REFERENCIA_LABELS[tipo] ?? tipo }

function iconoTipo(tipo)  { return { banco: 'account_balance', efectivo: 'payments', digital: 'phone_iphone' }[tipo] ?? 'wallet' }
function iconoBg(tipo)    { return { banco: 'background:rgba(3,36,107,0.10)', efectivo: 'background:rgba(16,185,129,0.10)', digital: 'background:rgba(99,102,241,0.10)' }[tipo] ?? '' }
function iconoColor(tipo) { return { banco: '#03246B', efectivo: '#10B981', digital: '#6366F1' }[tipo] ?? '#64748B' }

// Modal movimiento manual
const showMovModal = ref(false)
const savingMov   = ref(false)
const movError    = ref('')
const movForm     = ref({ tipo: 'ingreso', monto: null, descripcion: '', fecha: new Date().toISOString().split('T')[0] })

async function guardarMovimiento() {
  savingMov.value = true
  movError.value  = ''
  try {
    await txStore.createManual(cuentaId.value, movForm.value)
    showMovModal.value = false
    movForm.value = { tipo: 'ingreso', monto: null, descripcion: '', fecha: new Date().toISOString().split('T')[0] }
    await cuentasStore.fetchCuentas()
    recargar()
  } catch (e) {
    movError.value = e.response?.data?.error || 'Error al guardar'
  } finally {
    savingMov.value = false
  }
}

// Eliminar transacción manual
const deleteTxTarget = ref(null)
const deleteTxError  = ref('')
const deletingTx     = ref(false)
function confirmDeleteTx(tx) { deleteTxTarget.value = tx; deleteTxError.value = '' }

async function doDeleteTx() {
  deletingTx.value = true
  try {
    await txStore.deleteTransaccion(deleteTxTarget.value.id)
    deleteTxTarget.value = null
    await cuentasStore.fetchCuentas()
    recargar()
  } catch (e) {
    deleteTxError.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally {
    deletingTx.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
