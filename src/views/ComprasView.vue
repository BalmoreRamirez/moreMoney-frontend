<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Compras</h1>
        <p class="mt-1 text-sm text-slate-500">Gestión de gastos normales y compras a tasa cero.</p>
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
    <div class="mt-6 flex flex-wrap items-center justify-between gap-2 border-b" style="border-color:#E2E8F0">
      <div class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors sm:gap-2 sm:px-4"
          :class="activeTab === tab.key
            ? 'border-b-2 border-success text-success'
            : 'text-slate-500 hover:text-slate-700'"
          @click="activeTab = tab.key"
        >
          <span class="material-symbols-outlined text-[16px]">{{ tab.icon }}</span>
          <span class="hidden sm:inline">{{ tab.label }}</span>
          <span class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
            :style="activeTab === tab.key
              ? 'background:rgba(16,185,129,0.2);color:#10B981'
              : 'background:rgba(10,25,47,0.04);color:#94A3B8'"
          >{{ tab.key === 'normales' ? comprasStore.normales.length : comprasStore.tasaCero.length }}</span>
        </button>
      </div>

      <div class="pb-2">
        <button
          v-if="activeTab === 'normales'"
          class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white hover:opacity-90 sm:gap-2 sm:px-4"
          style="background:#10B981"
          @click="showNormalModal = true"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span class="hidden sm:inline">Nueva compra</span>
        </button>
        <button
          v-else
          class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white hover:opacity-90 sm:gap-2 sm:px-4"
          style="background:#10B981"
          @click="openCreateTasaCero"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span class="hidden sm:inline">Nueva tasa cero</span>
        </button>
      </div>
    </div>

    <!-- Filtro de estado (sólo en pestaña tasa cero) -->
    <div v-if="activeTab === 'tasa_cero'" class="mt-4 flex items-center gap-1 rounded-xl p-1 w-fit" style="background:rgba(10,25,47,0.03);border:1px solid #E2E8F0">
      <button
        v-for="opt in estadoOpts"
        :key="opt.value"
        class="rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors"
        :style="filtroEstado === opt.value
          ? 'background:rgba(16,185,129,0.18);color:#10B981'
          : 'color:#94A3B8'"
        @click="setFiltroEstado(opt.value)"
      >{{ opt.label }}</button>
    </div>

    <!-- Error -->
    <div v-if="comprasStore.error" class="mt-4 rounded-xl px-5 py-4 text-sm"
      style="background:var(--color-danger-bg);color:var(--color-danger)">
      {{ comprasStore.error }}
    </div>

    <template v-else>
      <!-- ── TAB: Compras Normales ── -->
      <div v-if="activeTab === 'normales'" class="mt-4">
        <AppDataTable
          :data="comprasStore.normales"
          :loading="comprasStore.loading"
          empty-text="Sin compras normales"
          empty-icon="receipt_long"
        >
          <!-- Fecha -->
          <Column field="fecha_compra" header="Fecha" sortable style="min-width:110px">
            <template #body="{ data: c }">
              <span class="text-sm text-slate-600">{{ formatDate(c.fecha_compra) }}</span>
            </template>
          </Column>

          <!-- Nombre + tarjeta -->
          <Column field="nombre" header="Compra" sortable style="min-width:200px">
            <template #body="{ data: c }">
              <p class="text-sm font-medium text-slate-700 truncate">{{ c.nombre }}</p>
              <span class="text-[11px] text-slate-500">{{ c.tarjeta?.nombre }} · {{ c.tarjeta?.banco }}</span>
            </template>
          </Column>

          <!-- Estado -->
          <Column field="estado" header="Estado" sortable style="min-width:100px">
            <template #body="{ data: c }">
              <span :class="c.estado === 'pagada' ? 'badge-success' : 'badge-alert'">{{ c.estado }}</span>
            </template>
          </Column>

          <!-- Monto -->
          <Column field="monto" header="Monto" sortable style="min-width:120px">
            <template #body="{ data: c }">
              <span class="font-mono text-sm font-semibold text-slate-700">{{ formatCurrency(c.monto) }}</span>
            </template>
          </Column>

          <!-- Acciones -->
          <Column header="" style="min-width:70px;width:70px">
            <template #body="{ data: c }">
              <div class="flex items-center justify-end">
                <button
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-danger"
                  title="Eliminar"
                  @click="confirmDeleteNormal(c)"
                >
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </template>
          </Column>
        </AppDataTable>
      </div>

      <!-- ── TAB: Tasa Cero ── -->
      <div v-if="activeTab === 'tasa_cero'" class="mt-4 space-y-4">
        <div v-if="!comprasStore.tasaCero.length" class="fintech-card flex flex-col items-center py-14 text-center">
          <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.3)">payments</span>
          <p class="mt-3 font-semibold text-slate-600">Sin compras a tasa cero</p>
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
                <p class="font-semibold text-slate-700">{{ c.nombre }}</p>
                <span :class="c.estado === 'activa' ? 'badge-success' : 'badge-alert'">{{ c.estado }}</span>
              </div>
              <p class="mt-0.5 text-xs text-slate-500">
                {{ c.tarjeta?.nombre }} — {{ c.tarjeta?.banco }} &nbsp;·&nbsp; {{ formatDate(c.fecha_compra) }}
              </p>
            </div>

            <!-- Monto y acciones -->
            <div class="flex items-center gap-2">
              <div class="text-right mr-1">
                <p class="font-mono text-lg font-bold text-slate-900">{{ formatCurrency(c.monto_total) }}</p>
                <p class="text-xs text-slate-500">{{ formatCurrency(cuotaMonto(c)) }}/mes</p>
              </div>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Editar"
                @click="openEditTasaCero(c)"
              >
                <span class="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                :class="tieneCuotasPagadas(c)
                  ? 'cursor-not-allowed text-slate-400'
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
              <span class="text-slate-500">Progreso de cuotas</span>
              <span class="font-mono text-slate-600">
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
      :editData="editTasaCeroTarget"
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
import { ref, computed, watch, onMounted } from 'vue'
import { useComprasStore }  from '../stores/compras'
import { useTarjetasStore } from '../stores/tarjetas'
import { formatCurrency }   from '../utils/currency'
import AppDataTable            from '../components/AppDataTable.vue'
import CompraNormalFormModal   from '../components/CompraNormalFormModal.vue'
import CompraTasaCeroFormModal from '../components/CompraTasaCeroFormModal.vue'
import ConfirmDeleteModal      from '../components/ConfirmDeleteModal.vue'

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

const showNormalModal    = ref(false)
const showTasaCeroModal  = ref(false)
const editTasaCeroTarget = ref(null)

function openCreateTasaCero() { editTasaCeroTarget.value = null; showTasaCeroModal.value = true }
function openEditTasaCero(c)  { editTasaCeroTarget.value = c;    showTasaCeroModal.value = true }

async function onSaveNormal(payload) {
  try {
    await comprasStore.createNormal(payload)
    recargarTodo()
    tarjetasStore.fetchTarjetas()
  } catch (e) {
    console.error(e)
  }
}

async function onSaveTasaCero(payload) {
  try {
    if (editTasaCeroTarget.value) {
      await comprasStore.updateTasaCero(editTasaCeroTarget.value.id, payload)
    } else {
      await comprasStore.createTasaCero(payload)
    }
    recargarTodo()
    tarjetasStore.fetchTarjetas()
  } catch (e) {
    console.error(e)
  }
}

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
    await Promise.all([
      comprasStore.fetchNormales(filtroTarjeta.value ? { tarjeta_id: filtroTarjeta.value } : {}),
      tarjetasStore.fetchTarjetas(),
    ])
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
    await Promise.all([
      comprasStore.fetchTasaCero(filtroTarjeta.value ? { tarjeta_id: filtroTarjeta.value } : {}),
      tarjetasStore.fetchTarjetas(),
    ])
    deleteTasaCeroTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally {
    deleting.value = false
  }
}

function cuotasPagadas(c)     { return c.cuotas?.filter(q => q.estado === 'pagada').length ?? 0 }
function tieneCuotasPagadas(c){ return cuotasPagadas(c) > 0 }
function cuotasPct(c)         { return c.total_cuotas ? Math.round((cuotasPagadas(c) / c.total_cuotas) * 100) : 0 }
function cuotaMonto(c)        { return c.total_cuotas ? parseFloat(c.monto_total) / c.total_cuotas : 0 }

function cuotasBlocks(c) {
  const paid  = cuotasPagadas(c)
  const total = c.total_cuotas ?? 0
  const BLOCKS  = 10
  const filled = Math.round((paid / total) * BLOCKS)
  return '[' + '█'.repeat(filled) + '░'.repeat(BLOCKS - filled) + ']'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
