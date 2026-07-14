<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Ingresos</h1>
        <p class="mt-1 text-sm text-slate-400">Sueldos e inversiones registradas.</p>
      </div>
      <button
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        style="background:#10B981"
        @click="onTabCreate"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        <span class="hidden sm:inline">{{ tabCreateLabel }}</span>
      </button>
    </div>

    <!-- Tabs -->
    <div class="mt-6 flex gap-1 rounded-xl p-1" style="background:rgba(10,25,47,0.03);width:fit-content">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-all"
        :class="activeTab === tab.key ? 'bg-success text-white shadow' : 'text-slate-600 hover:text-slate-900'"
        @click="activeTab = tab.key"
      >
        <span class="material-symbols-outlined align-middle text-[16px] mr-1">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="store.error" class="mt-4 rounded-xl px-5 py-4 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger)">
      {{ store.error }}
    </div>

    <!-- ════ SUELDOS ════ -->
    <template v-else-if="activeTab === 'sueldos'">
      <AppDataTable
        class="mt-6"
        :data="store.sueldos"
        :loading="store.loading"
        empty-text="Sin sueldos registrados"
        empty-icon="payments"
      >
        <!-- Nombre + estado -->
        <Column field="nombre" header="Nombre" sortable style="min-width:200px">
          <template #body="{ data: s }">
            <div class="flex items-center gap-2">
              <p class="font-semibold text-slate-800">{{ s.nombre }}</p>
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                :style="s.activo ? 'background:rgba(5,150,105,0.12);color:#10B981' : 'background:rgba(100,116,139,0.12);color:#64748B'"
              >{{ s.activo ? 'Activo' : 'Inactivo' }}</span>
            </div>
          </template>
        </Column>

        <!-- Cuenta -->
        <Column field="cuenta.nombre" header="Cuenta" sortable style="min-width:140px">
          <template #body="{ data: s }">
            <span class="text-sm text-slate-600">{{ s.cuenta?.nombre ?? '—' }}</span>
          </template>
        </Column>

        <!-- Día de cobro -->
        <Column field="dia_cobro" header="Día cobro" sortable style="min-width:110px">
          <template #body="{ data: s }">
            <span class="text-sm text-slate-600">Día {{ s.dia_cobro }}</span>
          </template>
        </Column>

        <!-- Último cobro -->
        <Column header="Último cobro" style="min-width:120px">
          <template #body="{ data: s }">
            <span class="text-sm text-slate-600">{{ ultimoCobro(s) }}</span>
          </template>
        </Column>

        <!-- Monto -->
        <Column field="monto" header="Monto/mes" sortable style="min-width:120px">
          <template #body="{ data: s }">
            <span class="font-mono font-semibold" style="color:#10B981">{{ formatCurrency(s.monto) }}</span>
          </template>
        </Column>

        <!-- Acciones -->
        <Column header="" style="min-width:120px;width:120px">
          <template #body="{ data: s }">
            <div class="flex items-center justify-end gap-1">
              <button
                v-if="s.activo"
                class="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium transition-colors hover:opacity-80"
                style="background:rgba(5,150,105,0.12);color:#10B981"
                @click="openCobrar(s)"
              >
                <span class="material-symbols-outlined text-[14px]">check_circle</span>
                Cobrar
              </button>
              <button
                class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
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
          </template>
        </Column>
      </AppDataTable>
    </template>

    <!-- ════ INVERSIONES ════ -->
    <template v-else-if="activeTab === 'inversiones'">
      <!-- Filtro estado -->
      <div class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="f in FILTROS_ESTADO"
          :key="f.value"
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
          :class="filtroEstado === f.value ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'"
          :style="filtroEstado === f.value ? 'background:rgba(5,150,105,0.12);border:1px solid rgba(5,150,105,0.3)' : 'background:rgba(10,25,47,0.03);border:1px solid transparent'"
          @click="setFiltroEstado(f.value)"
        >{{ f.label }}</button>
      </div>

      <AppDataTable
        class="mt-4"
        :data="store.inversiones"
        :loading="store.loading"
        empty-text="Sin inversiones registradas"
        empty-icon="trending_up"
      >
        <!-- Nombre + estado -->
        <Column field="nombre" header="Inversión" sortable style="min-width:200px">
          <template #body="{ data: inv }">
            <div class="min-w-0">
              <p class="font-semibold text-slate-800 truncate">{{ inv.nombre }}</p>
              <div v-if="inv.fecha_compra" class="text-[11px] text-slate-500">{{ formatDate(inv.fecha_compra) }}</div>
            </div>
          </template>
        </Column>

        <!-- Estado -->
        <Column field="estado" header="Estado" sortable style="min-width:100px">
          <template #body="{ data: inv }">
            <span
              class="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              :style="inv.estado === 'en_curso' ? 'background:rgba(217,119,6,0.10);color:#D97706' : 'background:rgba(5,150,105,0.12);color:#10B981'"
            >{{ inv.estado === 'en_curso' ? 'En curso' : 'Vendida' }}</span>
          </template>
        </Column>

        <!-- Costo -->
        <Column field="costo_total" header="Costo" sortable style="min-width:120px">
          <template #body="{ data: inv }">
            <span class="font-mono text-sm font-semibold text-slate-700">{{ formatCurrency(inv.costo_total) }}</span>
          </template>
        </Column>

        <!-- Cobrado / Ganancia -->
        <Column header="Cobrado / Ganancia" style="min-width:150px">
          <template #body="{ data: inv }">
            <div class="text-sm">
              <div v-if="inv.estado === 'en_curso' && inv.total_cobrado > 0">
                <span class="font-mono font-semibold" style="color:#10B981">{{ formatCurrency(inv.total_cobrado) }}</span>
                <span v-if="inv.saldo_por_cobrar > 0" class="ml-1 text-[11px]" style="color:#D97706">falta {{ formatCurrency(inv.saldo_por_cobrar) }}</span>
              </div>
              <span v-if="inv.ganancia != null" class="font-mono font-semibold" :style="{ color: inv.ganancia >= 0 ? '#10B981' : '#DC2626' }">
                +{{ formatCurrency(inv.ganancia) }}
              </span>
              <span v-else-if="inv.ganancia_esperada != null" class="font-mono font-semibold" style="color:#D97706">
                ~{{ formatCurrency(inv.ganancia_esperada) }}
              </span>
              <span v-else class="text-slate-400 text-[11px]">—</span>
            </div>
          </template>
        </Column>

        <!-- Progreso (en_curso con cobros) -->
        <Column header="Progreso" style="min-width:130px">
          <template #body="{ data: inv }">
            <template v-if="inv.estado === 'en_curso' && inv.precio_esperado && inv.total_cobrado > 0">
              <div class="text-[10px] text-slate-500 mb-1">
                {{ Math.min(100, Math.round((inv.total_cobrado / parseFloat(inv.precio_esperado)) * 100)) }}%
              </div>
              <div class="h-1.5 w-full rounded-full overflow-hidden" style="background:#E8EDF5">
                <div
                  class="h-full rounded-full"
                  :style="{ width: Math.min(100, Math.round((inv.total_cobrado / parseFloat(inv.precio_esperado)) * 100)) + '%', background: '#10B981' }"
                />
              </div>
            </template>
            <span v-else class="text-slate-400 text-[11px]">—</span>
          </template>
        </Column>

        <!-- Acciones -->
        <Column header="" style="min-width:140px;width:140px">
          <template #body="{ data: inv }">
            <div class="flex items-center justify-end gap-1">
              <button
                v-if="inv.estado === 'en_curso'"
                class="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium transition-colors hover:opacity-80"
                style="background:rgba(5,150,105,0.12);color:#10B981"
                @click="openCobrarInv(inv)"
              >
                <span class="material-symbols-outlined text-[14px]">payments</span>
                Cobrar
              </button>
              <button
                v-if="inv.estado === 'en_curso'"
                class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Editar"
                @click="openEditInversion(inv)"
              >
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button
                v-if="inv.estado === 'en_curso' && !inv.cobros?.length"
                class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-danger"
                title="Eliminar"
                @click="confirmDeleteInversion(inv)"
              >
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
              <template v-if="inv.estado === 'vendida'">
                <span class="text-xs text-slate-400 mr-1">{{ inv.fecha_venta }}</span>
                <button
                  class="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium transition-colors hover:opacity-80"
                  style="background:rgba(217,119,6,0.10);color:#D97706"
                  title="Resetear a En curso"
                  @click="doResetearInversion(inv)"
                >
                  <span class="material-symbols-outlined text-[14px]">restart_alt</span>
                  Resetear
                </button>
              </template>
            </div>
          </template>
        </Column>
      </AppDataTable>
    </template>

    <!-- ════ OTROS INGRESOS ════ -->
    <template v-else-if="activeTab === 'otros'">
      <AppDataTable
        class="mt-6"
        :data="store.otros"
        :loading="store.loading"
        empty-text="Sin ingresos registrados"
        empty-icon="add_circle"
      >
        <!-- Fecha -->
        <Column field="fecha" header="Fecha" sortable style="min-width:110px">
          <template #body="{ data: item }">
            <span class="text-sm text-slate-600">{{ item.fecha }}</span>
          </template>
        </Column>

        <!-- Descripción -->
        <Column field="descripcion" header="Descripción" sortable style="min-width:200px">
          <template #body="{ data: item }">
            <span class="text-sm text-slate-700">{{ item.descripcion }}</span>
          </template>
        </Column>

        <!-- Cuenta -->
        <Column field="cuenta.nombre" header="Cuenta" sortable style="min-width:140px">
          <template #body="{ data: item }">
            <span class="text-sm text-slate-600">{{ item.cuenta?.nombre ?? '—' }}</span>
          </template>
        </Column>

        <!-- Monto -->
        <Column field="monto" header="Monto" sortable style="min-width:120px">
          <template #body="{ data: item }">
            <span class="font-mono font-semibold" style="color:#10B981">{{ formatCurrency(item.monto) }}</span>
          </template>
        </Column>

        <!-- Acciones -->
        <Column header="" style="min-width:90px;width:90px">
          <template #body="{ data: item }">
            <div class="flex items-center justify-end gap-1">
              <button
                class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Editar"
                @click="openEditOtro(item)"
              >
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button
                class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-danger"
                title="Eliminar"
                @click="confirmDeleteOtro(item)"
              >
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </template>
        </Column>
      </AppDataTable>
    </template>

    <!-- ═══ MODALES ═══ -->
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
      :edit-data="editInversion"
      @saved="onInversionSaved"
    />

    <CobrarInversionModal
      v-model="showCobrarInvModal"
      :inversion="cobrarInvTarget"
      @saved="onCobrarInv"
    />

    <IngresoFormModal
      v-model="showOtroModal"
      :ingreso="editOtro"
      @saved="onOtroSaved"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useIngresosStore } from '../stores/ingresos'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency } from '../utils/currency'
import AppDataTable         from '../components/AppDataTable.vue'
import SueldoFormModal      from '../components/SueldoFormModal.vue'
import CobrarSueldoModal    from '../components/CobrarSueldoModal.vue'
import InversionFormModal   from '../components/InversionFormModal.vue'
import CobrarInversionModal from '../components/CobrarInversionModal.vue'
import IngresoFormModal     from '../components/IngresoFormModal.vue'
import ConfirmDeleteModal   from '../components/ConfirmDeleteModal.vue'

const store        = useIngresosStore()
const cuentasStore = useCuentasStore()

const TABS = [
  { key: 'sueldos',     label: 'Sueldos',     icon: 'payments' },
  { key: 'inversiones', label: 'Inversiones', icon: 'trending_up' },
  { key: 'otros',       label: 'Otros',       icon: 'add_circle' },
]

const FILTROS_ESTADO = [
  { value: '',         label: 'Todos' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'vendida',  label: 'Vendidas' },
]

const activeTab    = ref('sueldos')
const filtroEstado = ref('')

onMounted(() => Promise.all([cuentasStore.fetchCuentas(), store.fetchSueldos(), store.fetchInversiones(), store.fetchOtros()]))

watch(activeTab, (tab) => {
  if (tab === 'sueldos')     store.fetchSueldos()
  if (tab === 'inversiones') store.fetchInversiones({ estado: filtroEstado.value || undefined })
  if (tab === 'otros')       store.fetchOtros()
})

const tabCreateLabel = computed(() => ({
  sueldos:     'Nuevo sueldo',
  inversiones: 'Nueva inversión',
  otros:       'Nuevo ingreso',
}[activeTab.value]))

function onTabCreate() {
  if (activeTab.value === 'sueldos')     openCreateSueldo()
  if (activeTab.value === 'inversiones') openCreateInversion()
  if (activeTab.value === 'otros')       openCreateOtro()
}

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

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
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
const editInversion      = ref(null)

function openCreateInversion()  { editInversion.value = null; showInversionModal.value = true }
function openEditInversion(inv) { editInversion.value = inv;  showInversionModal.value = true }

async function onInversionSaved(payload) {
  try {
    if (editInversion.value) await store.updateInversion(editInversion.value.id, payload)
    else                     await store.createInversion(payload)
  } catch (e) {
    console.error(e)
  }
}

async function doResetearInversion(inv) {
  try {
    await store.resetearInversion(inv.id)
  } catch (e) {
    console.error(e)
  }
}

// ─── COBRAR INVERSIÓN ────────────────────────────────────────────────────────
const showCobrarInvModal = ref(false)
const cobrarInvTarget    = ref(null)

function openCobrarInv(inv) { cobrarInvTarget.value = inv; showCobrarInvModal.value = true }

async function onCobrarInv(payload) {
  if (!cobrarInvTarget.value) return
  try {
    await store.registrarCobro(cobrarInvTarget.value.id, payload)
  } catch (e) {
    console.error(e)
  }
}

// ─── ELIMINAR ────────────────────────────────────────────────────────────────
const deleteTarget   = ref(null)
const deleteErrorMsg = ref('')
const deleting       = ref(false)
const deleteType     = ref('')

function confirmDeleteSueldo(s)      { deleteTarget.value = s;   deleteType.value = 'sueldo';    deleteErrorMsg.value = '' }
function confirmDeleteInversion(inv) { deleteTarget.value = inv; deleteType.value = 'inversion'; deleteErrorMsg.value = '' }
function confirmDeleteOtro(item)     { deleteTarget.value = item; deleteType.value = 'otro';     deleteErrorMsg.value = '' }

async function doDelete() {
  deleting.value = true
  try {
    if (deleteType.value === 'sueldo')    await store.deleteSueldo(deleteTarget.value.id)
    if (deleteType.value === 'inversion') await store.deleteInversion(deleteTarget.value.id)
    if (deleteType.value === 'otro')      await store.deleteOtro(deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally {
    deleting.value = false
  }
}

// ─── OTROS INGRESOS ──────────────────────────────────────────────────────────
const showOtroModal = ref(false)
const editOtro      = ref(null)

function openCreateOtro()   { editOtro.value = null; showOtroModal.value = true }
function openEditOtro(item) { editOtro.value = item; showOtroModal.value = true }

async function onOtroSaved(payload) {
  try {
    if (editOtro.value) await store.updateOtro(editOtro.value.id, payload)
    else                await store.createOtro(payload)
  } catch (e) {
    console.error(e)
  }
}
</script>
