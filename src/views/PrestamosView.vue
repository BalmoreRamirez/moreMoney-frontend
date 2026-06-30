<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Préstamos</h1>
        <p class="mt-1 text-sm text-slate-400">Créditos otorgados a terceros con interés simple.</p>
      </div>
      <button
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        style="background:#10B981"
        @click="showFormModal = true"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        <span class="hidden sm:inline">Nuevo préstamo</span>
      </button>
    </div>

    <!-- Filtros -->
    <div class="mt-6 flex flex-wrap gap-2">
      <button
        v-for="f in FILTROS"
        :key="f.value"
        class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
        :class="filtro === f.value ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'"
        :style="filtro === f.value
          ? 'background:rgba(5,150,105,0.12);border:1px solid rgba(5,150,105,0.3)'
          : 'background:rgba(10,25,47,0.03);border:1px solid transparent'"
        @click="setFiltro(f.value)"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="store.error" class="mt-4 rounded-xl px-5 py-4 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger)">
      {{ store.error }}
    </div>

    <!-- Tabla -->
    <AppDataTable
      v-else
      class="mt-6"
      :data="store.prestamos"
      :loading="store.loading"
      empty-text="Sin préstamos registrados"
      empty-icon="handshake"
    >
      <!-- Deudor -->
      <Column field="deudor_nombre" header="Deudor" sortable style="min-width:180px">
        <template #body="{ data: p }">
          <div
            class="flex items-center gap-3 cursor-pointer"
            @click="goToDetalle(p.id)"
          >
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style="background:rgba(217,119,6,0.1)">
              <span class="material-symbols-outlined text-[16px]" style="color:#D97706">person</span>
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-800 truncate">{{ p.deudor_nombre }}</p>
              <p class="text-[11px] text-slate-500 truncate">{{ p.deudor_contacto || '—' }}</p>
            </div>
          </div>
        </template>
      </Column>

      <!-- Estado -->
      <Column field="estado" header="Estado" sortable style="min-width:100px">
        <template #body="{ data: p }">
          <Tag
            :value="p.estado === 'activo' ? 'Activo' : 'Pagado'"
            :severity="p.estado === 'activo' ? 'warn' : 'success'"
          />
        </template>
      </Column>

      <!-- Capital -->
      <Column field="capital" header="Capital" sortable style="min-width:120px">
        <template #body="{ data: p }">
          <span class="font-mono font-semibold text-slate-600">{{ formatCurrency(p.capital) }}</span>
        </template>
      </Column>

      <!-- Interés -->
      <Column field="interes_generado" header="Interés" sortable style="min-width:130px">
        <template #body="{ data: p }">
          <div>
            <span class="font-mono text-slate-600">{{ formatCurrency(p.interes_generado) }}</span>
            <p class="text-[10px] text-slate-600">{{ pctTasa(p.tasa_interes_mensual) }}%/mes</p>
          </div>
        </template>
      </Column>

      <!-- Total pagado -->
      <Column field="total_pagado" header="Pagado" sortable style="min-width:120px">
        <template #body="{ data: p }">
          <span class="font-mono font-semibold" style="color:#10B981">{{ formatCurrency(p.total_pagado) }}</span>
        </template>
      </Column>

      <!-- Saldo pendiente -->
      <Column field="saldo_pendiente" header="Pendiente" sortable style="min-width:120px">
        <template #body="{ data: p }">
          <span
            class="font-mono font-semibold"
            :style="{ color: p.saldo_pendiente <= 0 ? '#10B981' : '#D97706' }"
          >{{ formatCurrency(Math.max(0, p.saldo_pendiente)) }}</span>
        </template>
      </Column>

      <!-- Progreso -->
      <Column header="Progreso" style="min-width:140px">
        <template #body="{ data: p }">
          <div>
            <div class="flex justify-between text-[10px] text-slate-600 mb-1">
              <span>{{ progresoPct(p) }}%</span>
              <span>{{ formatCurrency(p.total_pagado) }} / {{ formatCurrency(p.total_deuda) }}</span>
            </div>
            <div class="h-1.5 rounded-full overflow-hidden" style="background:#E8EDF5">
              <div
                class="h-full rounded-full transition-all"
                :style="{ width: progresoPct(p) + '%', background: p.saldo_pendiente <= 0 ? '#10B981' : '#FBBF24' }"
              />
            </div>
          </div>
        </template>
      </Column>

      <!-- Acciones -->
      <Column header="" style="min-width:100px;width:100px">
        <template #body="{ data: p }">
          <div class="flex items-center justify-end gap-1">
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title="Ver detalle"
              @click="goToDetalle(p.id)"
            >
              <span class="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
            <template v-if="p.estado === 'activo' && !p.pagos?.length">
              <button
                class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Editar"
                @click="openEdit(p)"
              >
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button
                class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-danger"
                title="Eliminar"
                @click="confirmDelete(p)"
              >
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </template>
          </div>
        </template>
      </Column>
    </AppDataTable>

    <!-- Modales -->
    <PrestamoFormModal v-model="showFormModal" :edit-data="editTarget2" @saved="onSaved" />

    <ConfirmDeleteModal
      v-if="deleteTarget"
      :nombre="deleteTarget.deudor_nombre"
      :error="deleteErrorMsg"
      :deleting="deleting"
      @confirm="doDelete"
      @cancel="deleteTarget = null; deleteErrorMsg = ''"
    />
  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePrestamosStore } from '../stores/prestamos'
import { useCuentasStore }   from '../stores/cuentas'
import { formatCurrency }    from '../utils/currency'
import AppDataTable       from '../components/AppDataTable.vue'
import PrestamoFormModal  from '../components/PrestamoFormModal.vue'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue'

const store        = usePrestamosStore()
const cuentasStore = useCuentasStore()
const router       = useRouter()

const FILTROS = [
  { value: 'activo', label: 'Activos' },
  { value: 'pagado', label: 'Pagados' },
  { value: '',       label: 'Todos'   },
]

const filtro = ref('activo')

onMounted(() => Promise.all([cuentasStore.fetchCuentas(), store.fetchPrestamos({ estado: 'activo' })]))

function setFiltro(val) {
  filtro.value = val
  store.fetchPrestamos(val ? { estado: val } : {})
}

function goToDetalle(id) { router.push(`/prestamos/${id}`) }

function pctTasa(t) { return parseFloat((parseFloat(t) * 100).toFixed(2)) }

function progresoPct(p) {
  if (!p.total_deuda || p.total_deuda <= 0) return 100
  return Math.min(100, Math.round((p.total_pagado / p.total_deuda) * 100))
}

// Crear / Editar
const showFormModal = ref(false)
const editTarget2   = ref(null)

function openEdit(p) {
  editTarget2.value  = p
  showFormModal.value = true
}

watch(showFormModal, (open) => {
  if (!open) editTarget2.value = null
})

async function onSaved(payload) {
  try {
    if (editTarget2.value) await store.updatePrestamo(editTarget2.value.id, payload)
    else                   await store.createPrestamo(payload)
  } catch (e) { console.error(e) }
}

// Eliminar
const deleteTarget   = ref(null)
const deleteErrorMsg = ref('')
const deleting       = ref(false)

function confirmDelete(p) { deleteTarget.value = p; deleteErrorMsg.value = '' }

async function doDelete() {
  deleting.value = true
  try {
    await store.deletePrestamo(deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally {
    deleting.value = false
  }
}
</script>
