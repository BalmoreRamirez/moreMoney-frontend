<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Créditos recibidos</h1>
        <p class="mt-1 text-sm text-slate-400">Préstamos que tomaste para cubrir gastos, con interés simple o compuesto.</p>
      </div>
      <button
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        style="background:#3B82F6"
        @click="showFormModal = true"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        <span class="hidden sm:inline">Nuevo crédito</span>
      </button>
    </div>

    <!-- Filtros -->
    <div class="mt-6 flex flex-wrap gap-2">
      <button
        v-for="f in FILTROS"
        :key="f.value"
        class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
        :class="filtro === f.value ? 'text-slate-900' : 'text-slate-600 hover:text-slate-700'"
        :style="filtro === f.value
          ? 'background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.3)'
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
      :data="store.creditos"
      :loading="store.loading"
      empty-text="Sin créditos registrados"
      empty-icon="credit_score"
    >
      <!-- Nombre -->
      <Column field="nombre" header="Crédito" sortable style="min-width:200px">
        <template #body="{ data: c }">
          <div class="flex items-center gap-3 cursor-pointer" @click="goToDetalle(c.id)">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style="background:rgba(59,130,246,0.12)">
              <span class="material-symbols-outlined text-[16px]" style="color:#3B82F6">credit_score</span>
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-800 truncate">{{ c.nombre }}</p>
              <p class="text-[11px] text-slate-500">
                {{ c.tipo_interes === 'simple' ? 'Simple' : 'Compuesto' }} · {{ pctTasa(c.tasa_mensual) }}%/mes
              </p>
            </div>
          </div>
        </template>
      </Column>

      <!-- Estado -->
      <Column field="estado" header="Estado" sortable style="min-width:100px">
        <template #body="{ data: c }">
          <Tag
            :value="c.estado === 'activo' ? 'Activo' : 'Pagado'"
            :severity="c.estado === 'activo' ? 'info' : 'success'"
          />
        </template>
      </Column>

      <!-- Capital -->
      <Column field="capital" header="Capital" sortable style="min-width:120px">
        <template #body="{ data: c }">
          <span class="font-mono font-semibold text-slate-700">{{ formatCurrency(c.capital) }}</span>
        </template>
      </Column>

      <!-- Interés -->
      <Column field="total_interes" header="Interés" sortable style="min-width:120px">
        <template #body="{ data: c }">
          <span class="font-mono font-semibold" style="color:#D97706">{{ formatCurrency(c.total_interes) }}</span>
        </template>
      </Column>

      <!-- Pagado -->
      <Column field="total_pagado" header="Pagado" sortable style="min-width:120px">
        <template #body="{ data: c }">
          <span class="font-mono font-semibold" style="color:#10B981">{{ formatCurrency(c.total_pagado) }}</span>
        </template>
      </Column>

      <!-- Pendiente -->
      <Column field="saldo_pendiente" header="Pendiente" sortable style="min-width:120px">
        <template #body="{ data: c }">
          <span class="font-mono font-semibold" :style="{ color: c.saldo_pendiente <= 0 ? '#10B981' : '#DC2626' }">
            {{ formatCurrency(Math.max(0, c.saldo_pendiente)) }}
          </span>
        </template>
      </Column>

      <!-- Progreso -->
      <Column header="Progreso" style="min-width:140px">
        <template #body="{ data: c }">
          <div>
            <div class="flex justify-between text-[10px] text-slate-600 mb-1">
              <span>{{ progresoPct(c) }}%</span>
              <span>{{ c.cuotas_pagadas }}/{{ c.num_cuotas }}</span>
            </div>
            <div class="h-1.5 rounded-full overflow-hidden" style="background:#E8EDF5">
              <div
                class="h-full rounded-full transition-all"
                :style="{ width: progresoPct(c) + '%', background: c.saldo_pendiente <= 0 ? '#10B981' : '#3B82F6' }"
              />
            </div>
          </div>
        </template>
      </Column>

      <!-- Acciones -->
      <Column header="" style="min-width:90px;width:90px">
        <template #body="{ data: c }">
          <div class="flex items-center justify-end gap-1">
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title="Ver detalle"
              @click="goToDetalle(c.id)"
            >
              <span class="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
            <button
              v-if="c.estado === 'activo' && c.cuotas_pagadas === 0"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-danger"
              title="Eliminar"
              @click.stop="confirmDelete(c)"
            >
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </template>
      </Column>
    </AppDataTable>

    <!-- Modales -->
    <CreditoFormModal v-model="showFormModal" @saved="onCrear" />

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
import { ref, onMounted }   from 'vue'
import { useRouter }        from 'vue-router'
import { useCreditosStore } from '../stores/creditos'
import { useCuentasStore }  from '../stores/cuentas'
import { formatCurrency }   from '../utils/currency'
import AppDataTable         from '../components/AppDataTable.vue'
import CreditoFormModal     from '../components/CreditoFormModal.vue'
import ConfirmDeleteModal   from '../components/ConfirmDeleteModal.vue'

const store        = useCreditosStore()
const cuentasStore = useCuentasStore()
const router       = useRouter()

const FILTROS = [
  { value: '',       label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'pagado', label: 'Pagados' },
]

const filtro = ref('')

onMounted(() => Promise.all([cuentasStore.fetchCuentas(), store.fetchCreditos()]))

function setFiltro(val) {
  filtro.value = val
  store.fetchCreditos(val ? { estado: val } : {})
}

function goToDetalle(id) { router.push(`/creditos/${id}`) }
function pctTasa(t)      { return parseFloat((parseFloat(t) * 100).toFixed(2)) }

function progresoPct(c) {
  if (!c.num_cuotas) return 0
  return Math.min(100, Math.round((c.cuotas_pagadas / c.num_cuotas) * 100))
}

const showFormModal = ref(false)
async function onCrear(payload) {
  try { await store.createCredito(payload) }
  catch (e) { console.error(e) }
}

const deleteTarget   = ref(null)
const deleteErrorMsg = ref('')
const deleting       = ref(false)

function confirmDelete(c) { deleteTarget.value = c; deleteErrorMsg.value = '' }

async function doDelete() {
  deleting.value = true
  try {
    await store.deleteCredito(deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally {
    deleting.value = false
  }
}
</script>
