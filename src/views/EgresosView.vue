<template>
  <section>
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Egresos</h1>
        <p class="mt-1 text-sm" style="color:#64748B">Gastos manuales registrados en tus cuentas.</p>
      </div>
      <button
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style="background:#DC2626"
        @click="showForm = true"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        Nuevo egreso
      </button>
    </div>

    <!-- Filtros -->
    <div class="mt-6 flex flex-wrap gap-3">
      <select v-model="filtroCuenta" class="fintech-input w-auto min-w-[160px]">
        <option value="">Todas las cuentas</option>
        <option v-for="c in cuentasStore.cuentas" :key="c.id" :value="c.id">{{ c.nombre }}</option>
      </select>
      <input v-model="filtroMes" type="month" class="fintech-input w-auto" />
    </div>

    <!-- Totalizador -->
    <div v-if="egresosFiltrados.length" class="mt-4 flex items-center justify-between rounded-xl px-5 py-3" style="background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.15)">
      <span class="text-sm text-slate-600">Total del período</span>
      <span class="font-mono text-lg font-bold" style="color:#DC2626">{{ formatCurrency(totalPeriodo) }}</span>
    </div>

    <!-- Tabla -->
    <AppDataTable
      class="mt-6"
      :data="egresosFiltrados"
      :loading="store.loading"
      empty-text="No hay egresos registrados"
      empty-icon="money_off"
    >
      <!-- Fecha -->
      <Column field="fecha" header="Fecha" sortable style="min-width:110px">
        <template #body="{ data: e }">
          <span class="text-sm text-slate-600">{{ formatDate(e.fecha?.split('T')[0] ?? '') }}</span>
        </template>
      </Column>

      <!-- Descripción -->
      <Column field="descripcion" header="Descripción" sortable style="min-width:200px">
        <template #body="{ data: e }">
          <p class="text-sm text-slate-700 truncate">{{ e.descripcion }}</p>
          <span class="mt-0.5 inline-block rounded-md px-2 py-0.5 text-xs" style="background:rgba(10,25,47,0.04);color:#64748B">
            {{ e.cuenta?.nombre || '—' }}
          </span>
        </template>
      </Column>

      <!-- Monto -->
      <Column field="monto" header="Monto" sortable style="min-width:120px">
        <template #body="{ data: e }">
          <span class="font-mono font-semibold" style="color:#DC2626">{{ formatCurrency(e.monto) }}</span>
        </template>
      </Column>

      <!-- Acciones -->
      <Column header="" style="min-width:90px;width:90px">
        <template #body="{ data: e }">
          <div class="flex items-center justify-end gap-1">
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              title="Editar"
              @click="editarEgreso(e)"
            >
              <span class="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400"
              title="Eliminar"
              @click="confirmarEliminar(e)"
            >
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </template>
      </Column>
    </AppDataTable>

    <!-- Modal form -->
    <EgresoFormModal
      v-model="showForm"
      :egreso="egresoEditar"
      @saved="egresoEditar = null"
    />

    <!-- Confirm delete -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="egresoEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="egresoEliminar = null">
          <div class="absolute inset-0" style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)" />
          <div class="relative w-full max-w-sm rounded-2xl p-6 shadow-card" style="background:#FFFFFF;border:1px solid rgba(220,38,38,0.25)">
            <p class="text-base font-semibold text-slate-900">¿Eliminar egreso?</p>
            <p class="mt-1 text-sm text-slate-600">{{ egresoEliminar?.descripcion }} — {{ formatCurrency(egresoEliminar?.monto) }}</p>
            <div class="mt-5 flex gap-3">
              <button class="flex-1 rounded-xl py-2.5 text-sm text-slate-400 hover:bg-slate-50" @click="egresoEliminar = null">Cancelar</button>
              <button
                class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
                style="background:#DC2626"
                :disabled="deleting"
                @click="eliminar"
              >{{ deleting ? 'Eliminando…' : 'Eliminar' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useEgresosStore } from '../stores/egresos'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency }  from '../utils/currency'
import AppDataTable        from '../components/AppDataTable.vue'
import EgresoFormModal     from '../components/EgresoFormModal.vue'

const store        = useEgresosStore()
const cuentasStore = useCuentasStore()

const showForm       = ref(false)
const egresoEditar   = ref(null)
const egresoEliminar = ref(null)
const deleting       = ref(false)
const filtroCuenta   = ref('')

const now = new Date()
const filtroMes = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

onMounted(async () => {
  await Promise.all([store.fetchEgresos(), cuentasStore.fetchCuentas()])
})

const egresosFiltrados = computed(() => {
  return store.egresos.filter(e => {
    const cuentaOk = !filtroCuenta.value || e.cuenta_id === filtroCuenta.value
    const mesOk    = !filtroMes.value   || e.fecha?.startsWith(filtroMes.value)
    return cuentaOk && mesOk
  })
})

const totalPeriodo = computed(() =>
  egresosFiltrados.value.reduce((s, e) => s + parseFloat(e.monto), 0)
)

function formatDate(d) {
  if (!d) return ''
  const [y, m, dd] = d.split('-')
  return `${dd}/${m}/${y}`
}

function editarEgreso(e) {
  egresoEditar.value = e
  showForm.value     = true
}

function confirmarEliminar(e) {
  egresoEliminar.value = e
}

async function eliminar() {
  deleting.value = true
  try {
    await store.deleteEgreso(egresoEliminar.value.id)
    egresoEliminar.value = null
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
