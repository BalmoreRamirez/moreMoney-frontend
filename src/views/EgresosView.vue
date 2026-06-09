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

    <!-- Accordion -->
    <div v-else class="mt-6 flex flex-col gap-2">
      <div
        v-for="grupo in egresosAgrupados"
        :key="grupo.fecha"
        class="overflow-hidden rounded-xl"
        style="border:1px solid rgba(255,255,255,0.07);background:#0D2240"
      >
        <!-- Cabecera del accordion -->
        <button
          class="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
          @click="toggleGrupo(grupo.fecha)"
        >
          <div class="flex items-center gap-3">
            <span
              class="material-symbols-outlined text-[18px] transition-transform duration-200"
              style="color:#DC2626"
              :style="{ transform: abiertos.has(grupo.fecha) ? 'rotate(90deg)' : 'rotate(0deg)' }"
            >chevron_right</span>
            <span class="font-mono text-sm font-semibold text-slate-200">{{ formatDate(grupo.fecha) }}</span>
            <span class="rounded-full px-2 py-0.5 text-xs text-slate-500" style="background:rgba(255,255,255,0.05)">
              {{ grupo.egresos.length }} egreso{{ grupo.egresos.length !== 1 ? 's' : '' }}
            </span>
          </div>
          <span class="font-mono text-sm font-bold" style="color:#DC2626">{{ formatCurrency(grupo.total) }}</span>
        </button>

        <!-- Cuerpo colapsable -->
        <Transition name="accordion">
          <div v-if="abiertos.has(grupo.fecha)" style="border-top:1px solid rgba(255,255,255,0.05)">
            <div
              v-for="e in grupo.egresos"
              :key="e.id"
              class="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-white/[0.02]"
              style="border-bottom:1px solid rgba(255,255,255,0.04)"
            >
              <div class="flex-1 min-w-0">
                <p class="truncate text-sm text-slate-200">{{ e.descripcion }}</p>
                <span class="mt-0.5 inline-block rounded-md px-2 py-0.5 text-xs" style="background:rgba(255,255,255,0.06);color:#94A3B8">
                  {{ e.cuenta?.nombre || '—' }}
                </span>
              </div>
              <span class="font-mono text-sm font-semibold shrink-0" style="color:#DC2626">{{ formatCurrency(e.monto) }}</span>
              <div class="flex items-center gap-1 shrink-0">
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
            </div>
          </div>
        </Transition>
      </div>
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
import { ref, computed, onMounted, watch } from 'vue'
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

const egresosAgrupados = computed(() => {
  const map = new Map()
  for (const e of egresosFiltrados.value) {
    const fecha = e.fecha?.split('T')[0] ?? ''
    if (!map.has(fecha)) map.set(fecha, [])
    map.get(fecha).push(e)
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([fecha, egresos]) => ({
      fecha,
      egresos,
      total: egresos.reduce((s, e) => s + parseFloat(e.monto), 0),
    }))
})

const abiertos = ref(new Set())

watch(egresosAgrupados, (grupos) => {
  if (grupos.length && !abiertos.value.size) {
    abiertos.value = new Set([grupos[0].fecha])
  }
}, { immediate: true })

function toggleGrupo(fecha) {
  const next = new Set(abiertos.value)
  next.has(fecha) ? next.delete(fecha) : next.add(fecha)
  abiertos.value = next
}

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

.accordion-enter-active, .accordion-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  max-height: 800px;
  overflow: hidden;
}
.accordion-enter-from, .accordion-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
