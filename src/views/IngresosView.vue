<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Ingresos</h1>
        <p class="mt-1 text-sm text-slate-400">Sueldos e inversiones registradas.</p>
      </div>
      <button
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        style="background:#10B981"
        @click="activeTab === 'sueldos' ? openCreateSueldo() : openCreateInversion()"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        <span class="hidden sm:inline">{{ activeTab === 'sueldos' ? 'Nuevo sueldo' : 'Nueva inversión' }}</span>
      </button>
    </div>

    <!-- Tabs -->
    <div class="mt-6 flex gap-1 rounded-xl p-1" style="background:rgba(255,255,255,0.04);width:fit-content">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-all"
        :class="activeTab === tab.key ? 'bg-success text-white shadow' : 'text-slate-400 hover:text-slate-200'"
        @click="activeTab = tab.key"
      >
        <span class="material-symbols-outlined align-middle text-[16px] mr-1">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="mt-10 flex justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-success border-t-transparent" />
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="mt-4 rounded-xl px-5 py-4 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger)">
      {{ store.error }}
    </div>

    <!-- ════════════════════════════════════════ SUELDOS ═══════════════════════════════════════ -->
    <template v-else-if="activeTab === 'sueldos'">
      <!-- Estado vacío -->
      <div v-if="!store.sueldos.length" class="mt-10 fintech-card flex flex-col items-center py-14 text-center">
        <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.3)">payments</span>
        <p class="mt-3 font-semibold text-slate-300">Sin sueldos registrados</p>
        <p class="mt-1 text-sm text-slate-500">Registra tu salario para llevar el control mensual de cobros.</p>
        <button class="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style="background:#10B981" @click="openCreateSueldo">
          Agregar sueldo
        </button>
      </div>

      <!-- Tabla de sueldos -->
      <div v-else class="mt-6 fintech-card overflow-x-auto">
        <table class="min-w-[640px] w-full text-sm">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nombre</th>
              <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Monto</th>
              <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Día cobro</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cuenta</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Último cobro</th>
              <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Estado</th>
              <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in store.sueldos"
              :key="s.id"
              class="transition-colors hover:bg-white/[0.02]"
              style="border-bottom:1px solid rgba(255,255,255,0.04)"
            >
              <td class="px-4 py-3 font-medium text-slate-200">{{ s.nombre }}</td>
              <td class="px-4 py-3 text-right font-mono font-semibold" style="color:#10B981">{{ formatCurrency(s.monto) }}</td>
              <td class="px-4 py-3 text-center text-slate-400">{{ s.dia_cobro }}</td>
              <td class="px-4 py-3 text-slate-400">{{ s.cuenta?.nombre ?? '—' }}</td>
              <td class="px-4 py-3 text-slate-400">{{ ultimoCobro(s) }}</td>
              <td class="px-4 py-3 text-center">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  :style="s.activo ? 'background:rgba(16,185,129,0.15);color:#10B981' : 'background:rgba(100,116,139,0.15);color:#64748B'"
                >
                  {{ s.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    v-if="s.activo"
                    class="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium transition-colors hover:opacity-80"
                    style="background:rgba(16,185,129,0.15);color:#10B981"
                    title="Registrar cobro"
                    @click="openCobrar(s)"
                  >
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    <span class="hidden sm:inline">Cobrar</span>
                  </button>
                  <button
                    class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-200"
                    title="Editar"
                    @click="openEditSueldo(s)"
                  >
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-danger"
                    title="Eliminar"
                    @click="confirmDeleteSueldo(s)"
                  >
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ════════════════════════════════════════ INVERSIONES ══════════════════════════════════════ -->
    <template v-else>
      <!-- Filtro estado -->
      <div class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="f in FILTROS_ESTADO"
          :key="f.value"
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
          :class="filtroEstado === f.value ? 'text-white' : 'text-slate-400 hover:text-slate-200'"
          :style="filtroEstado === f.value ? 'background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3)' : 'background:rgba(255,255,255,0.04);border:1px solid transparent'"
          @click="setFiltroEstado(f.value)"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Estado vacío -->
      <div v-if="!store.inversiones.length" class="mt-8 fintech-card flex flex-col items-center py-14 text-center">
        <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.3)">trending_up</span>
        <p class="mt-3 font-semibold text-slate-300">Sin inversiones registradas</p>
        <p class="mt-1 text-sm text-slate-500">Registra compras para reventa y lleva el control de tu ganancia.</p>
        <button class="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style="background:#10B981" @click="openCreateInversion">
          Nueva inversión
        </button>
      </div>

      <!-- Tabla de inversiones -->
      <div v-else class="mt-4 fintech-card overflow-x-auto">
        <table class="min-w-[700px] w-full text-sm">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nombre</th>
              <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Costo</th>
              <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Venta</th>
              <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Ganancia</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">F. Compra</th>
              <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Estado</th>
              <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="inv in store.inversiones"
              :key="inv.id"
              class="transition-colors hover:bg-white/[0.02]"
              style="border-bottom:1px solid rgba(255,255,255,0.04)"
            >
              <td class="px-4 py-3 font-medium text-slate-200">{{ inv.nombre }}</td>
              <td class="px-4 py-3 text-right font-mono text-slate-400">{{ formatCurrency(inv.costo_total) }}</td>
              <td class="px-4 py-3 text-right font-mono text-slate-400">{{ inv.precio_venta_total != null ? formatCurrency(inv.precio_venta_total) : '—' }}</td>
              <td class="px-4 py-3 text-right font-mono font-semibold">
                <span v-if="inv.ganancia != null" :style="{ color: inv.ganancia >= 0 ? '#10B981' : '#DC2626' }">
                  {{ formatCurrency(inv.ganancia) }}
                </span>
                <span v-else class="text-slate-600">—</span>
              </td>
              <td class="px-4 py-3 text-slate-400">{{ inv.fecha_compra }}</td>
              <td class="px-4 py-3 text-center">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  :style="inv.estado === 'en_curso'
                    ? 'background:rgba(251,191,36,0.15);color:#FBBF24'
                    : 'background:rgba(16,185,129,0.15);color:#10B981'"
                >
                  {{ inv.estado === 'en_curso' ? 'En curso' : 'Vendida' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    v-if="inv.estado === 'en_curso'"
                    class="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium transition-colors hover:opacity-80"
                    style="background:rgba(251,191,36,0.15);color:#FBBF24"
                    title="Registrar venta"
                    @click="openVender(inv)"
                  >
                    <span class="material-symbols-outlined text-[14px]">sell</span>
                    <span class="hidden sm:inline">Vender</span>
                  </button>
                  <button
                    v-if="inv.estado === 'en_curso'"
                    class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-danger"
                    title="Eliminar"
                    @click="confirmDeleteInversion(inv)"
                  >
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                  <span v-if="inv.estado === 'vendida'" class="text-xs text-slate-600">{{ inv.fecha_venta }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ═══ MODALES ═══════════════════════════════════════════════════════════ -->

    <SueldoFormModal
      v-model="showSueldoModal"
      :edit-data="editSueldo"
      @saved="onSueldoSaved"
    />

    <CobrarSueldoModal
      v-model="showCobrarModal"
      :sueldo="cobrarTarget"
      @confirmed="onCobrar"
    />

    <InversionFormModal
      v-model="showInversionModal"
      @saved="onInversionSaved"
    />

    <VenderInversionModal
      v-model="showVenderModal"
      :inversion="venderTarget"
      @saved="onVender"
    />

    <ConfirmDeleteModal
      v-if="deleteTarget"
      :nombre="deleteTarget.nombre"
      :error="deleteErrorMsg"
      :deleting="deleting"
      @confirm="doDelete"
      @cancel="deleteTarget = null; deleteErrorMsg = ''"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useIngresosStore } from '../stores/ingresos'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency } from '../utils/currency'
import SueldoFormModal    from '../components/SueldoFormModal.vue'
import CobrarSueldoModal  from '../components/CobrarSueldoModal.vue'
import InversionFormModal from '../components/InversionFormModal.vue'
import VenderInversionModal from '../components/VenderInversionModal.vue'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue'

const store        = useIngresosStore()
const cuentasStore = useCuentasStore()

const TABS = [
  { key: 'sueldos',    label: 'Sueldos',     icon: 'payments' },
  { key: 'inversiones', label: 'Inversiones', icon: 'trending_up' },
]

const FILTROS_ESTADO = [
  { value: '',         label: 'Todos' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'vendida',  label: 'Vendidas' },
]

const activeTab    = ref('sueldos')
const filtroEstado = ref('')

onMounted(async () => {
  await cuentasStore.fetchCuentas()
  await store.fetchSueldos()
  await store.fetchInversiones()
})

watch(activeTab, (tab) => {
  if (tab === 'sueldos')     store.fetchSueldos()
  if (tab === 'inversiones') store.fetchInversiones({ estado: filtroEstado.value || undefined })
})

function setFiltroEstado(val) {
  filtroEstado.value = val
  store.fetchInversiones({ estado: val || undefined })
}

const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
function ultimoCobro(sueldo) {
  if (!sueldo.cobros?.length) return 'Nunca'
  const cobros = [...sueldo.cobros].sort((a, b) => b.anio - a.anio || b.mes - a.mes)
  const c = cobros[0]
  return `${MESES_CORTOS[c.mes - 1]} ${c.anio}`
}

// ─── SUELDOS ────────────────────────────────────────────────────────────────
const showSueldoModal = ref(false)
const editSueldo      = ref(null)

function openCreateSueldo() { editSueldo.value = null; showSueldoModal.value = true }
function openEditSueldo(s)  { editSueldo.value = s;    showSueldoModal.value = true }

async function onSueldoSaved(payload) {
  try {
    if (payload.id) await store.updateSueldo(payload.id, payload)
    else            await store.createSueldo(payload)
  } catch (e) {
    console.error(e)
  }
}

// ─── COBRAR SUELDO ────────────────────────────────────────────────────────────
const showCobrarModal = ref(false)
const cobrarTarget    = ref(null)

function openCobrar(s) { cobrarTarget.value = s; showCobrarModal.value = true }

async function onCobrar(payload) {
  if (!cobrarTarget.value) return
  try {
    await store.cobrarSueldo(cobrarTarget.value.id, payload)
  } catch (e) {
    console.error(e)
  }
}

// ─── INVERSIONES ─────────────────────────────────────────────────────────────
const showInversionModal = ref(false)

function openCreateInversion() { showInversionModal.value = true }

async function onInversionSaved(payload) {
  try {
    await store.createInversion(payload)
  } catch (e) {
    console.error(e)
  }
}

// ─── VENDER INVERSIÓN ────────────────────────────────────────────────────────
const showVenderModal = ref(false)
const venderTarget    = ref(null)

function openVender(inv) { venderTarget.value = inv; showVenderModal.value = true }

async function onVender(payload) {
  if (!venderTarget.value) return
  try {
    await store.venderInversion(venderTarget.value.id, payload)
  } catch (e) {
    console.error(e)
  }
}

// ─── ELIMINAR ────────────────────────────────────────────────────────────────
const deleteTarget   = ref(null)
const deleteErrorMsg = ref('')
const deleting       = ref(false)
const deleteType     = ref('')

function confirmDeleteSueldo(s)  { deleteTarget.value = s;   deleteType.value = 'sueldo';    deleteErrorMsg.value = '' }
function confirmDeleteInversion(inv) { deleteTarget.value = inv; deleteType.value = 'inversion'; deleteErrorMsg.value = '' }

async function doDelete() {
  deleting.value = true
  try {
    if (deleteType.value === 'sueldo')    await store.deleteSueldo(deleteTarget.value.id)
    if (deleteType.value === 'inversion') await store.deleteInversion(deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally {
    deleting.value = false
  }
}
</script>
