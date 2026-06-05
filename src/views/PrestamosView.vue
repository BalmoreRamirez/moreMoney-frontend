<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Préstamos</h1>
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
        :class="filtro === f.value ? 'text-white' : 'text-slate-400 hover:text-slate-200'"
        :style="filtro === f.value
          ? 'background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3)'
          : 'background:rgba(255,255,255,0.04);border:1px solid transparent'"
        @click="setFiltro(f.value)"
      >
        {{ f.label }}
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

    <!-- Estado vacío -->
    <div v-else-if="!store.prestamos.length" class="mt-10 fintech-card flex flex-col items-center py-14 text-center">
      <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.3)">handshake</span>
      <p class="mt-3 font-semibold text-slate-300">Sin préstamos registrados</p>
      <p class="mt-1 text-sm text-slate-500">Registra un préstamo para llevar el control de deudas y cobros.</p>
      <button class="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style="background:#10B981" @click="showFormModal = true">
        Nuevo préstamo
      </button>
    </div>

    <!-- Grid de tarjetas -->
    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="p in store.prestamos"
        :key="p.id"
        class="fintech-card p-5 cursor-pointer transition-all hover:border-white/20 hover:-translate-y-0.5"
        @click="goToDetalle(p.id)"
      >
        <!-- Cabecera -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl" style="background:rgba(251,191,36,0.12)">
              <span class="material-symbols-outlined text-[20px]" style="color:#FBBF24">person</span>
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-100 truncate">{{ p.deudor_nombre }}</p>
              <p v-if="p.deudor_contacto" class="text-xs text-slate-500 truncate">{{ p.deudor_contacto }}</p>
              <p v-else class="text-xs text-slate-600">Sin contacto</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5" @click.stop>
            <span
              class="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              :style="p.estado === 'activo'
                ? 'background:rgba(251,191,36,0.15);color:#FBBF24'
                : 'background:rgba(16,185,129,0.15);color:#10B981'"
            >
              {{ p.estado === 'activo' ? 'Activo' : 'Pagado' }}
            </span>
            <button
              v-if="p.estado === 'activo' && !p.pagos?.length"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-danger"
              title="Eliminar"
              @click="confirmDelete(p)"
            >
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>

        <!-- Datos financieros -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p class="text-[10px] uppercase tracking-wider text-slate-600">Capital</p>
            <p class="mt-0.5 font-mono text-sm font-semibold text-slate-300">{{ formatCurrency(p.capital) }}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wider text-slate-600">Interés ({{ pctTasa(p.tasa_interes_mensual) }}%/mes)</p>
            <p class="mt-0.5 font-mono text-sm font-semibold text-slate-300">{{ formatCurrency(p.interes_generado) }}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wider text-slate-600">Total pagado</p>
            <p class="mt-0.5 font-mono text-sm font-semibold" style="color:#10B981">{{ formatCurrency(p.total_pagado) }}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wider text-slate-600">Saldo pendiente</p>
            <p class="mt-0.5 font-mono text-sm font-semibold" :style="{ color: p.saldo_pendiente <= 0 ? '#10B981' : '#FBBF24' }">
              {{ formatCurrency(Math.max(0, p.saldo_pendiente)) }}
            </p>
          </div>
        </div>

        <!-- Barra de progreso -->
        <div class="mt-4">
          <div class="flex justify-between text-[10px] text-slate-600 mb-1">
            <span>Recuperado</span>
            <span>{{ progresoLabel(p) }}</span>
          </div>
          <div class="h-1.5 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.06)">
            <div
              class="h-full rounded-full transition-all"
              :style="{ width: progresoPct(p) + '%', background: p.saldo_pendiente <= 0 ? '#10B981' : '#FBBF24' }"
            />
          </div>
        </div>

        <!-- Inicio -->
        <p class="mt-3 text-[11px] text-slate-600">
          {{ p.meses_transcurridos }} mes{{ p.meses_transcurridos !== 1 ? 'es' : '' }} desde {{ p.fecha_inicio }}
        </p>
      </div>
    </div>

    <!-- Modales -->
    <PrestamoFormModal v-model="showFormModal" @saved="onCrear" />

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePrestamosStore } from '../stores/prestamos'
import { useCuentasStore }   from '../stores/cuentas'
import { formatCurrency }    from '../utils/currency'
import PrestamoFormModal     from '../components/PrestamoFormModal.vue'
import ConfirmDeleteModal    from '../components/ConfirmDeleteModal.vue'

const store        = usePrestamosStore()
const cuentasStore = useCuentasStore()
const router       = useRouter()

const FILTROS = [
  { value: '',       label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'pagado', label: 'Pagados' },
]

const filtro = ref('')

onMounted(async () => {
  await cuentasStore.fetchCuentas()
  await store.fetchPrestamos()
})

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
function progresoLabel(p) {
  return `${progresoPct(p)}% (${formatCurrency(p.total_pagado)} / ${formatCurrency(p.total_deuda)})`
}

// Crear
const showFormModal = ref(false)
async function onCrear(payload) {
  try { await store.createPrestamo(payload) }
  catch (e) { console.error(e) }
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
