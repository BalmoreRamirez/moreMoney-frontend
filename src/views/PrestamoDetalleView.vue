<template>
  <section>
    <!-- Back -->
    <button
      class="mb-5 flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
      @click="router.back()"
    >
      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
      Volver a préstamos
    </button>

    <!-- Loading -->
    <div v-if="store.loading && !store.prestamo" class="flex justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-success border-t-transparent" />
    </div>

    <template v-else-if="store.prestamo">
      <!-- Encabezado -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-slate-100">{{ store.prestamo.deudor_nombre }}</h1>
            <span
              class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :style="store.prestamo.estado === 'activo'
                ? 'background:rgba(251,191,36,0.15);color:#FBBF24'
                : 'background:rgba(16,185,129,0.15);color:#10B981'"
            >
              {{ store.prestamo.estado === 'activo' ? 'Activo' : 'Pagado' }}
            </span>
          </div>
          <p class="mt-1 text-sm text-slate-400">
            {{ pctTasa(store.prestamo.tasa_interes_mensual) }}% interés mensual ·
            {{ store.prestamo.meses_transcurridos }} mes{{ store.prestamo.meses_transcurridos !== 1 ? 'es' : '' }} ·
            Cuenta: {{ store.prestamo.cuenta?.nombre }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2" v-if="store.prestamo.estado === 'activo'">
          <button
            class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            style="background:#10B981"
            @click="showAbonoModal = true"
          >
            <span class="material-symbols-outlined text-[18px]">payments</span>
            <span class="hidden sm:inline">Registrar abono</span>
          </button>
          <button
            class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            style="background:#3B82F6"
            @click="confirmPagar = true"
          >
            <span class="material-symbols-outlined text-[18px]">check_circle</span>
            <span class="hidden sm:inline">Marcar como pagado</span>
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Capital</p>
          <p class="mt-1.5 font-mono text-xl font-bold text-slate-200">{{ formatCurrency(store.prestamo.capital) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Interés generado</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:#FBBF24">{{ formatCurrency(store.prestamo.interes_generado) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Total pagado</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:#10B981">{{ formatCurrency(store.prestamo.total_pagado) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Saldo pendiente</p>
          <p
            class="mt-1.5 font-mono text-xl font-bold"
            :style="{ color: store.prestamo.saldo_pendiente <= 0 ? '#10B981' : '#DC2626' }"
          >
            {{ formatCurrency(Math.max(0, store.prestamo.saldo_pendiente)) }}
          </p>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="mt-4 fintech-card p-5">
        <div class="flex justify-between text-xs text-slate-500 mb-2">
          <span>Progreso de recuperación</span>
          <span>{{ progresoPct }}% — {{ formatCurrency(store.prestamo.total_pagado) }} de {{ formatCurrency(store.prestamo.total_deuda) }}</span>
        </div>
        <div class="h-2.5 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.06)">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: progresoPct + '%', background: store.prestamo.saldo_pendiente <= 0 ? '#10B981' : '#FBBF24' }"
          />
        </div>
        <p v-if="store.prestamo.ganancia > 0" class="mt-2 text-xs text-slate-500">
          Ganancia generada hasta hoy:
          <span class="font-mono font-semibold" style="color:#10B981">{{ formatCurrency(store.prestamo.ganancia) }}</span>
        </p>
      </div>

      <!-- Historial de abonos -->
      <div class="mt-6">
        <h2 class="mb-3 text-sm font-semibold text-slate-400">Historial de abonos</h2>

        <div v-if="!store.prestamo.pagos?.length" class="fintech-card flex flex-col items-center py-10 text-center">
          <span class="material-symbols-outlined text-4xl" style="color:rgba(255,255,255,0.1)">receipt_long</span>
          <p class="mt-2 text-sm text-slate-500">Sin abonos registrados</p>
        </div>

        <div v-else class="fintech-card overflow-x-auto">
          <table class="min-w-[460px] w-full text-sm">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Monto</th>
                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nota</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="pago in store.prestamo.pagos"
                :key="pago.id"
                class="transition-colors hover:bg-white/[0.02]"
                style="border-bottom:1px solid rgba(255,255,255,0.04)"
              >
                <td class="px-4 py-3 text-slate-400">{{ pago.fecha_pago }}</td>
                <td class="px-4 py-3 text-right font-mono font-semibold" style="color:#10B981">{{ formatCurrency(pago.monto) }}</td>
                <td class="px-4 py-3 text-slate-500">{{ pago.nota || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ═══ MODALES ═══════════════════════════════════════════════════════════ -->

    <AbonoFormModal
      v-model="showAbonoModal"
      :prestamo="store.prestamo"
      @saved="onAbono"
    />

    <!-- Confirm marcar pagado -->
    <Teleport to="body">
      <div v-if="confirmPagar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0"
          style="background:rgba(7,17,31,0.8);backdrop-filter:blur(6px)"
          @click="confirmPagar = false"
        />
        <div
          class="relative w-full max-w-sm rounded-2xl p-6 shadow-card"
          style="background:#0D2240;border:1px solid rgba(255,255,255,0.1)"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style="background:rgba(59,130,246,0.15)">
              <span class="material-symbols-outlined text-[20px]" style="color:#3B82F6">check_circle</span>
            </div>
            <div>
              <h3 class="font-semibold text-white">Marcar como pagado</h3>
              <p class="mt-1 text-sm text-slate-400">
                ¿Confirmar que el préstamo de
                <strong class="text-white">{{ store.prestamo?.deudor_nombre }}</strong>
                ha sido liquidado completamente?
              </p>
              <p v-if="store.prestamo?.ganancia > 0" class="mt-2 text-xs" style="color:#10B981">
                Se registrará una ganancia de {{ formatCurrency(store.prestamo.ganancia) }}.
              </p>
              <p v-if="pagarError" class="mt-2 text-xs text-danger">{{ pagarError }}</p>
            </div>
          </div>
          <div class="mt-5 flex gap-3">
            <button class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5" @click="confirmPagar = false">
              Cancelar
            </button>
            <button
              :disabled="pagando"
              class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style="background:#3B82F6"
              @click="doPagar"
            >
              {{ pagando ? 'Procesando…' : 'Confirmar pago' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter }  from 'vue-router'
import { usePrestamosStore }    from '../stores/prestamos'
import { formatCurrency }       from '../utils/currency'
import AbonoFormModal           from '../components/AbonoFormModal.vue'

const store  = usePrestamosStore()
const route  = useRoute()
const router = useRouter()

onMounted(() => store.fetchPrestamo(route.params.id))

function pctTasa(t) { return parseFloat((parseFloat(t) * 100).toFixed(2)) }

const progresoPct = computed(() => {
  const p = store.prestamo
  if (!p || !p.total_deuda || p.total_deuda <= 0) return 100
  return Math.min(100, Math.round((p.total_pagado / p.total_deuda) * 100))
})

// Abono
const showAbonoModal = ref(false)
const abonoError     = ref('')

async function onAbono(payload) {
  abonoError.value = ''
  try {
    await store.registrarAbono(route.params.id, payload)
  } catch (e) {
    abonoError.value = e.response?.data?.error || 'Error al registrar abono'
  }
}

// Marcar pagado
const confirmPagar = ref(false)
const pagarError   = ref('')
const pagando      = ref(false)

async function doPagar() {
  pagando.value  = true
  pagarError.value = ''
  try {
    await store.marcarPagado(route.params.id)
    confirmPagar.value = false
  } catch (e) {
    pagarError.value = e.response?.data?.error || 'Error al marcar como pagado'
  } finally {
    pagando.value = false
  }
}
</script>
