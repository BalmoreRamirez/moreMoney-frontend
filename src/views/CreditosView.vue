<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Créditos recibidos</h1>
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
        :class="filtro === f.value ? 'text-white' : 'text-slate-400 hover:text-slate-200'"
        :style="filtro === f.value
          ? 'background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3)'
          : 'background:rgba(255,255,255,0.04);border:1px solid transparent'"
        @click="setFiltro(f.value)"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="mt-10 flex justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style="border-color:#3B82F6;border-top-color:transparent" />
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="mt-4 rounded-xl px-5 py-4 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger)">
      {{ store.error }}
    </div>

    <!-- Estado vacío -->
    <div v-else-if="!store.creditos.length" class="mt-10 fintech-card flex flex-col items-center py-14 text-center">
      <span class="material-symbols-outlined text-5xl" style="color:rgba(59,130,246,0.3)">account_balance</span>
      <p class="mt-3 font-semibold text-slate-300">Sin créditos registrados</p>
      <p class="mt-1 text-sm text-slate-500">Registra un préstamo recibido para llevar el control de tus deudas y cuotas.</p>
      <button class="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style="background:#3B82F6" @click="showFormModal = true">
        Nuevo crédito
      </button>
    </div>

    <!-- Grid de tarjetas -->
    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="c in store.creditos"
        :key="c.id"
        class="fintech-card p-5 cursor-pointer transition-all hover:border-white/20 hover:-translate-y-0.5"
        @click="goToDetalle(c.id)"
      >
        <!-- Cabecera -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style="background:rgba(59,130,246,0.12)">
              <span class="material-symbols-outlined text-[20px]" style="color:#3B82F6">credit_score</span>
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-100 truncate">{{ c.nombre }}</p>
              <p class="text-xs text-slate-500">
                {{ c.tipo_interes === 'simple' ? 'Interés simple' : 'Interés compuesto' }} ·
                {{ pctTasa(c.tasa_mensual) }}%/mes
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0 ml-2" @click.stop>
            <span
              class="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              :style="c.estado === 'activo'
                ? 'background:rgba(59,130,246,0.15);color:#3B82F6'
                : 'background:rgba(16,185,129,0.15);color:#10B981'"
            >
              {{ c.estado === 'activo' ? 'Activo' : 'Pagado' }}
            </span>
            <button
              v-if="c.estado === 'activo' && c.cuotas_pagadas === 0"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-danger"
              title="Eliminar"
              @click="confirmDelete(c)"
            >
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>

        <!-- Datos financieros -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p class="text-[10px] uppercase tracking-wider text-slate-600">Capital</p>
            <p class="mt-0.5 font-mono text-sm font-semibold text-slate-300">{{ formatCurrency(c.capital) }}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wider text-slate-600">Total interés</p>
            <p class="mt-0.5 font-mono text-sm font-semibold" style="color:#FBBF24">{{ formatCurrency(c.total_interes) }}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wider text-slate-600">Pagado</p>
            <p class="mt-0.5 font-mono text-sm font-semibold" style="color:#10B981">{{ formatCurrency(c.total_pagado) }}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wider text-slate-600">Saldo pendiente</p>
            <p class="mt-0.5 font-mono text-sm font-semibold" :style="{ color: c.saldo_pendiente <= 0 ? '#10B981' : '#DC2626' }">
              {{ formatCurrency(Math.max(0, c.saldo_pendiente)) }}
            </p>
          </div>
        </div>

        <!-- Cuotas y barra -->
        <div class="mt-4">
          <div class="flex justify-between text-[10px] text-slate-600 mb-1">
            <span>Progreso</span>
            <span>{{ c.cuotas_pagadas }} / {{ c.num_cuotas }} cuotas</span>
          </div>
          <div class="h-1.5 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.06)">
            <div
              class="h-full rounded-full transition-all"
              :style="{ width: progresoPct(c) + '%', background: c.saldo_pendiente <= 0 ? '#10B981' : '#3B82F6' }"
            />
          </div>
        </div>

        <!-- Próxima cuota -->
        <p v-if="c.proxima_cuota" class="mt-3 text-[11px] text-slate-600">
          Próxima cuota: <span class="text-slate-400 font-mono">{{ formatCurrency(c.proxima_cuota.monto_total_cuota) }}</span>
          — {{ c.proxima_cuota.fecha_estimada }}
        </p>
      </div>
    </div>

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

// Crear
const showFormModal = ref(false)
async function onCrear(payload) {
  try { await store.createCredito(payload) }
  catch (e) { console.error(e) }
}

// Eliminar
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
