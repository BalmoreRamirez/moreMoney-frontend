<template>
  <section>
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Egresos</h1>
        <p class="mt-1 text-sm" style="color:#94A3B8">Gastos manuales registrados en tus cuentas.</p>
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
    <div v-if="egresosFiltrados.length" class="mt-4 flex items-center justify-between rounded-xl px-5 py-3" style="background:rgba(220,38,38,0.07);border:1px solid rgba(220,38,38,0.15)">
      <span class="text-sm text-slate-400">Total del período</span>
      <span class="font-mono text-lg font-bold" style="color:#DC2626">{{ formatCurrency(totalPeriodo) }}</span>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="mt-10 flex justify-center">
      <div class="h-7 w-7 animate-spin rounded-full border-2 border-danger border-t-transparent" style="border-color:#DC2626;border-top-color:transparent" />
    </div>

    <!-- Vacío -->
    <div v-else-if="!egresosFiltrados.length" class="fintech-card mt-6 flex flex-col items-center py-14 text-center">
      <span class="material-symbols-outlined text-5xl" style="color:rgba(220,38,38,0.3)">money_off</span>
      <p class="mt-3 text-sm text-slate-400">No hay egresos registrados.</p>
      <button class="mt-3 text-xs hover:underline" style="color:#DC2626" @click="showForm = true">Registrar egreso →</button>
    </div>

    <!-- Tabla -->
    <div v-else class="fintech-card mt-6 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Descripción</th>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Cuenta</th>
            <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Monto</th>
            <th class="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="e in egresosFiltrados"
            :key="e.id"
            style="border-bottom:1px solid rgba(255,255,255,0.04)"
            class="hover:bg-white/[0.02] transition-colors"
          >
            <td class="px-5 py-3 font-mono text-xs text-slate-400">{{ formatDate(e.fecha) }}</td>
            <td class="px-5 py-3 text-slate-200">{{ e.descripcion }}</td>
            <td class="px-5 py-3">
              <span class="rounded-md px-2 py-0.5 text-xs" style="background:rgba(255,255,255,0.06);color:#94A3B8">
                {{ e.cuenta?.nombre || '—' }}
              </span>
            </td>
            <td class="px-5 py-3 text-right font-mono font-semibold" style="color:#DC2626">
              {{ formatCurrency(e.monto) }}
            </td>
            <td class="px-5 py-3">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white/10 hover:text-slate-300"
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
          <div class="absolute inset-0" style="background:rgba(7,17,31,0.82);backdrop-filter:blur(6px)" />
          <div class="relative w-full max-w-sm rounded-2xl p-6 shadow-card" style="background:#0D2240;border:1px solid rgba(220,38,38,0.25)">
            <p class="text-base font-semibold text-white">¿Eliminar egreso?</p>
            <p class="mt-1 text-sm text-slate-400">{{ egresoEliminar?.descripcion }} — {{ formatCurrency(egresoEliminar?.monto) }}</p>
            <div class="mt-5 flex gap-3">
              <button class="flex-1 rounded-xl py-2.5 text-sm text-slate-400 hover:bg-white/5" @click="egresoEliminar = null">Cancelar</button>
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
import { ref, computed, onMounted } from 'vue'
import { useEgresosStore } from '../stores/egresos'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency }  from '../utils/currency'
import EgresoFormModal     from '../components/EgresoFormModal.vue'

const store        = useEgresosStore()
const cuentasStore = useCuentasStore()

const showForm      = ref(false)
const egresoEditar  = ref(null)
const egresoEliminar = ref(null)
const deleting      = ref(false)
const filtroCuenta  = ref('')

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
