<template>
  <section>
    <!-- Back -->
    <button
      class="mb-5 flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
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
            <h1 class="text-2xl font-bold text-slate-800">{{ store.prestamo.deudor_nombre }}</h1>
            <span
              class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :style="store.prestamo.estado === 'activo'
                ? 'background:rgba(217,119,6,0.12);color:#D97706'
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
        </div>
      </div>

      <!-- KPIs -->
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Capital</p>
          <p class="mt-1.5 font-mono text-xl font-bold text-slate-700">{{ formatCurrency(store.prestamo.capital) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Interés generado</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:#D97706">{{ formatCurrency(store.prestamo.interes_generado) }}</p>
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
        <div class="h-2.5 rounded-full overflow-hidden" style="background:#E8EDF5">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: progresoPct + '%', background: store.prestamo.saldo_pendiente <= 0 ? '#10B981' : '#D97706' }"
          />
        </div>
        <p v-if="store.prestamo.ganancia > 0" class="mt-2 text-xs text-slate-500">
          Ganancia generada hasta hoy:
          <span class="font-mono font-semibold" style="color:#10B981">{{ formatCurrency(store.prestamo.ganancia) }}</span>
        </p>
      </div>

      <!-- Historial de abonos -->
      <div class="mt-6">
        <h2 class="mb-3 text-sm font-semibold text-slate-600">Historial de abonos</h2>

        <div v-if="!store.prestamo.pagos?.length" class="fintech-card flex flex-col items-center py-10 text-center">
          <span class="material-symbols-outlined text-4xl" style="color:rgba(10,25,47,0.08)">receipt_long</span>
          <p class="mt-2 text-sm text-slate-500">Sin abonos registrados</p>
        </div>

        <div v-else class="fintech-card overflow-x-auto">
          <table class="min-w-[460px] w-full text-sm">
            <thead>
              <tr style="border-bottom:1px solid #E2E8F0">
                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Monto</th>
                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nota</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="pago in store.prestamo.pagos"
                :key="pago.id"
                class="transition-colors hover:bg-slate-50"
                style="border-bottom:1px solid #E2E8F0"
              >
                <td class="px-4 py-3 text-slate-600">{{ pago.fecha_pago }}</td>
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

async function onAbono(payload) {
  await store.registrarAbono(route.params.id, payload)
}
</script>
