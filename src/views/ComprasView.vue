<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Compras</h1>
        <p class="mt-1 text-sm text-slate-400">Gestión de gastos normales y compras a tasa cero.</p>
      </div>

      <!-- Filtro por tarjeta -->
      <div class="flex items-center gap-3">
        <select
          v-model="filtroTarjeta"
          class="fintech-input w-56 text-sm"
          @change="recargarTodo"
        >
          <option value="">Todas las tarjetas</option>
          <option v-for="t in tarjetasStore.tarjetas" :key="t.id" :value="t.id">
            {{ t.nombre }} — {{ t.banco }}
          </option>
        </select>
      </div>
    </div>

    <!-- Pestañas + botón de acción -->
    <div class="mt-6 flex items-center justify-between border-b" style="border-color:rgba(255,255,255,0.08)">
      <div class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors"
          :class="activeTab === tab.key
            ? 'border-b-2 border-success text-success'
            : 'text-slate-500 hover:text-slate-300'"
          @click="activeTab = tab.key"
        >
          <span class="material-symbols-outlined text-[16px]">{{ tab.icon }}</span>
          {{ tab.label }}
          <span class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
            :style="activeTab === tab.key
              ? 'background:rgba(16,185,129,0.2);color:#10B981'
              : 'background:rgba(255,255,255,0.06);color:#64748B'"
          >{{ tab.key === 'normales' ? comprasStore.normales.length : comprasStore.tasaCero.length }}</span>
        </button>
      </div>

      <div class="pb-2">
        <button
          v-if="activeTab === 'normales'"
          class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          style="background:#10B981"
          @click="showNormalModal = true"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          Nueva compra
        </button>
        <button
          v-else
          class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          style="background:#10B981"
          @click="showTasaCeroModal = true"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          Nueva tasa cero
        </button>
      </div>
    </div>

    <!-- Filtro de estado (sólo en pestaña tasa cero) -->
    <div v-if="activeTab === 'tasa_cero'" class="mt-4 flex items-center gap-1 rounded-xl p-1 w-fit" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07)">
      <button
        v-for="opt in estadoOpts"
        :key="opt.value"
        class="rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors"
        :style="filtroEstado === opt.value
          ? 'background:rgba(16,185,129,0.18);color:#10B981'
          : 'color:#64748B'"
        @click="setFiltroEstado(opt.value)"
      >{{ opt.label }}</button>
    </div>

    <!-- Cargando -->
    <div v-if="comprasStore.loading" class="mt-10 flex justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-success border-t-transparent" />
    </div>

    <!-- Error -->
    <div v-else-if="comprasStore.error" class="mt-4 rounded-xl px-5 py-4 text-sm"
      style="background:var(--color-danger-bg);color:var(--color-danger)">
      {{ comprasStore.error }}
    </div>

    <template v-else>
      <!-- ── TAB: Compras Normales ── -->
      <div v-if="activeTab === 'normales'" class="mt-4">
        <div v-if="!comprasStore.normales.length" class="fintech-card flex flex-col items-center py-14 text-center">
          <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.3)">receipt_long</span>
          <p class="mt-3 font-semibold text-slate-300">Sin compras normales</p>
          <p class="mt-1 text-sm text-slate-500">Registra tu primera compra para ver el movimiento aquí.</p>
        </div>

        <div v-else class="fintech-card overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
                <th class="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Descripción</th>
                <th class="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tarjeta</th>
                <th class="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                <th class="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">Monto</th>
                <th class="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                <th class="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="c in comprasStore.normales"
                :key="c.id"
                style="border-bottom:1px solid rgba(255,255,255,0.04)"
              >
                <td class="px-4 py-3 font-medium text-slate-200">{{ c.nombre }}</td>
                <td class="px-4 py-3 text-slate-400">
                  <span class="text-xs">{{ c.tarjeta?.nombre }}</span>
                  <span class="ml-1 text-[10px] text-slate-600">{{ c.tarjeta?.banco }}</span>
                </td>
                <td class="px-4 py-3 text-slate-400">{{ formatDate(c.fecha_compra) }}</td>
                <td class="px-4 py-3 text-right font-mono font-semibold text-slate-200">{{ formatCurrency(c.monto) }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="c.estado === 'pagada' ? 'badge-success' : 'badge-alert'">{{ c.estado }}</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-danger"
                    @click="confirmDeleteNormal(c)"
                    title="Eliminar"
                  >
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── TAB: Tasa Cero ── -->
      <div v-if="activeTab === 'tasa_cero'" class="mt-4 space-y-4">
        <div v-if="!comprasStore.tasaCero.length" class="fintech-card flex flex-col items-center py-14 text-center">
          <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.3)">payments</span>
          <p class="mt-3 font-semibold text-slate-300">Sin compras a tasa cero</p>
          <p class="mt-1 text-sm text-slate-500">Registra una compra con cuotas para verla aquí.</p>
        </div>

        <div
          v-for="c in comprasStore.tasaCero"
          :key="c.id"
          class="fintech-card p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <!-- Info principal -->
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <p class="font-semibold text-slate-200">{{ c.nombre }}</p>
                <span :class="c.estado === 'activa' ? 'badge-success' : 'badge-alert'">{{ c.estado }}</span>
              </div>
              <p class="mt-0.5 text-xs text-slate-500">
                {{ c.tarjeta?.nombre }} — {{ c.tarjeta?.banco }} &nbsp;·&nbsp; {{ formatDate(c.fecha_compra) }}
              </p>
            </div>

            <!-- Monto y acciones -->
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="font-mono text-lg font-bold text-white">{{ formatCurrency(c.monto_total) }}</p>
                <p class="text-xs text-slate-500">{{ formatCurrency(cuotaMonto(c)) }}/mes</p>
              </div>
              <!-- Botón eliminar — deshabilitado si tiene cuotas pagadas -->
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                :class="tieneCuotasPagadas(c)
                  ? 'cursor-not-allowed text-slate-700'
                  : 'text-slate-500 hover:bg-red-500/10 hover:text-danger'"
                :title="tieneCuotasPagadas(c) ? 'No se puede eliminar: ya tiene cuotas pagadas' : 'Eliminar'"
                :disabled="tieneCuotasPagadas(c)"
                @click="!tieneCuotasPagadas(c) && confirmDeleteTasaCero(c)"
              >
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>

          <!-- Barra de progreso de cuotas -->
          <div class="mt-4">
            <div class="mb-1.5 flex items-center justify-between text-xs">
              <span class="text-slate-400">Progreso de cuotas</span>
              <span class="font-mono text-slate-300">
                {{ cuotasBlocks(c) }}
                <span class="ml-1 text-slate-500">{{ cuotasPagadas(c) }}/{{ c.total_cuotas }}</span>
              </span>
            </div>
            <div class="progress-bar-track">
              <div
                class="progress-bar-fill transition-all duration-700"
                :class="cuotasPct(c) >= 90 ? 'progress-bar-fill--danger' : ''"
                :style="{ width: cuotasPct(c) + '%' }"
              />
            </div>
            <p v-if="tieneCuotasPagadas(c)" class="mt-1.5 flex items-center gap-1 text-[10px]" style="color:#F59E0B">
              <span class="material-symbols-outlined text-[12px]">lock</span>
              No eliminable — {{ cuotasPagadas(c) }} cuota{{ cuotasPagadas(c) > 1 ? 's' : '' }} pagada{{ cuotasPagadas(c) > 1 ? 's' : '' }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Modales de creación -->
    <CompraNormalFormModal
      v-model="showNormalModal"
      :tarjetas="tarjetasStore.tarjetas"
      @saved="onSaveNormal"
    />
    <CompraTasaCeroFormModal
      v-model="showTasaCeroModal"
      :tarjetas="tarjetasStore.tarjetas"
      @saved="onSaveTasaCero"
    />

    <!-- Confirm delete normal -->
    <ConfirmDeleteModal
      v-if="deleteNormalTarget"
      :nombre="deleteNormalTarget.nombre"
      :error="deleteErrorMsg"
      :deleting="deleting"
      @confirm="doDeleteNormal"
      @cancel="deleteNormalTarget = null; deleteErrorMsg = ''"
    />

    <!-- Confirm delete tasa cero -->
    <ConfirmDeleteModal
      v-if="deleteTasaCeroTarget"
      :nombre="deleteTasaCeroTarget.nombre"
      :error="deleteErrorMsg"
      :deleting="deleting"
      @confirm="doDeleteTasaCero"
      @cancel="deleteTasaCeroTarget = null; deleteErrorMsg = ''"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, defineComponent } from 'vue'
import { useComprasStore }  from '../stores/compras'
import { useTarjetasStore } from '../stores/tarjetas'
import { formatCurrency }   from '../utils/currency'
import CompraNormalFormModal   from '../components/CompraNormalFormModal.vue'
import CompraTasaCeroFormModal from '../components/CompraTasaCeroFormModal.vue'

// ── Inline confirm-delete mini-component ─────────────────────────
const ConfirmDeleteModal = defineComponent({
  props: { nombre: String, error: String, deleting: Boolean },
  emits: ['confirm', 'cancel'],
  template: `
    <Teleport to="body">
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0" style="background:rgba(7,17,31,0.8);backdrop-filter:blur(6px)" @click="$emit('cancel')" />
        <div class="relative w-full max-w-sm rounded-2xl p-6 shadow-card" style="background:#0D2240;border:1px solid rgba(255,255,255,0.1)">
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style="background:var(--color-danger-bg)">
              <span class="material-symbols-outlined text-danger">warning</span>
            </div>
            <div>
              <h3 class="font-semibold text-white">Eliminar registro</h3>
              <p class="mt-1 text-sm text-slate-400">¿Eliminar <strong class="text-white">{{ nombre }}</strong>? Esta acción no se puede deshacer.</p>
              <p v-if="error" class="mt-2 text-xs text-danger">{{ error }}</p>
            </div>
          </div>
          <div class="mt-5 flex gap-3">
            <button class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5" @click="$emit('cancel')">Cancelar</button>
            <button class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50" style="background:#DC2626" :disabled="deleting" @click="$emit('confirm')">
              {{ deleting ? 'Eliminando…' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  `,
})

// ── Stores ────────────────────────────────────────────────────────
const comprasStore  = useComprasStore()
const tarjetasStore = useTarjetasStore()

const activeTab     = ref('normales')
const filtroTarjeta = ref('')
const filtroEstado  = ref('activa')

const tabs = [
  { key: 'normales',  icon: 'receipt_long', label: 'Compras normales' },
  { key: 'tasa_cero', icon: 'payments',     label: 'Tasa cero' },
]

const estadoOpts = [
  { value: 'activa',     label: 'Activas' },
  { value: '',           label: 'Todas' },
  { value: 'finalizada', label: 'Finalizadas' },
]

onMounted(async () => {
  await tarjetasStore.fetchTarjetas()
  recargarTodo()
})

function recargarTodo() {
  const baseParams = filtroTarjeta.value ? { tarjeta_id: filtroTarjeta.value } : {}
  comprasStore.fetchNormales(baseParams)
  const tcParams = { ...baseParams }
  if (filtroEstado.value) tcParams.estado = filtroEstado.value
  comprasStore.fetchTasaCero(tcParams)
}

function setFiltroEstado(val) {
  filtroEstado.value = val
  const baseParams = filtroTarjeta.value ? { tarjeta_id: filtroTarjeta.value } : {}
  const tcParams = { ...baseParams }
  if (val) tcParams.estado = val
  comprasStore.fetchTasaCero(tcParams)
}

// ── Modales creación ──────────────────────────────────────────────
const showNormalModal   = ref(false)
const showTasaCeroModal = ref(false)

async function onSaveNormal(payload) {
  try {
    await comprasStore.createNormal(payload)
    await recargarTodo()
    await tarjetasStore.fetchTarjetas()       // refresca saldos disponibles
  } catch (e) {
    console.error(e)
  }
}

async function onSaveTasaCero(payload) {
  try {
    await comprasStore.createTasaCero(payload)
    await recargarTodo()
    await tarjetasStore.fetchTarjetas()
  } catch (e) {
    console.error(e)
  }
}

// ── Eliminación ───────────────────────────────────────────────────
const deleteNormalTarget   = ref(null)
const deleteTasaCeroTarget = ref(null)
const deleteErrorMsg       = ref('')
const deleting             = ref(false)

function confirmDeleteNormal(c)   { deleteNormalTarget.value = c;   deleteErrorMsg.value = '' }
function confirmDeleteTasaCero(c) { deleteTasaCeroTarget.value = c; deleteErrorMsg.value = '' }

async function doDeleteNormal() {
  deleting.value = true
  try {
    await comprasStore.deleteNormal(deleteNormalTarget.value.id)
    await comprasStore.fetchNormales(filtroTarjeta.value ? { tarjeta_id: filtroTarjeta.value } : {})
    await tarjetasStore.fetchTarjetas()
    deleteNormalTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally {
    deleting.value = false
  }
}

async function doDeleteTasaCero() {
  deleting.value = true
  try {
    await comprasStore.deleteTasaCero(deleteTasaCeroTarget.value.id)
    await comprasStore.fetchTasaCero(filtroTarjeta.value ? { tarjeta_id: filtroTarjeta.value } : {})
    await tarjetasStore.fetchTarjetas()
    deleteTasaCeroTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally {
    deleting.value = false
  }
}

// ── Helpers tasa cero ─────────────────────────────────────────────
function cuotasPagadas(c)     { return c.cuotas?.filter(q => q.estado === 'pagada').length ?? 0 }
function tieneCuotasPagadas(c){ return cuotasPagadas(c) > 0 }
function cuotasPct(c)         { return c.total_cuotas ? Math.round((cuotasPagadas(c) / c.total_cuotas) * 100) : 0 }
function cuotaMonto(c)        { return c.total_cuotas ? parseFloat(c.monto_total) / c.total_cuotas : 0 }

function cuotasBlocks(c) {
  const paid = cuotasPagadas(c)
  const total = c.total_cuotas ?? 0
  const BLOCKS = 10
  const filled = Math.round((paid / total) * BLOCKS)
  return '[' + '█'.repeat(filled) + '░'.repeat(BLOCKS - filled) + ']'
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
