<template>
  <section>
    <!-- Back -->
    <button
      class="mb-5 flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
      @click="router.back()"
    >
      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
      Volver a créditos
    </button>

    <!-- Loading -->
    <div v-if="store.loading && !store.credito" class="flex justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style="border-color:#3B82F6;border-top-color:transparent" />
    </div>

    <template v-else-if="store.credito">
      <!-- Encabezado -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-slate-100">{{ store.credito.nombre }}</h1>
            <span
              class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :style="store.credito.estado === 'activo'
                ? 'background:rgba(59,130,246,0.15);color:#3B82F6'
                : 'background:rgba(16,185,129,0.15);color:#10B981'"
            >
              {{ store.credito.estado === 'activo' ? 'Activo' : 'Pagado' }}
            </span>
          </div>
          <p class="mt-1 text-sm text-slate-400">
            {{ tipoLabel }} · {{ pctTasa(store.credito.tasa_mensual) }}% mensual ·
            {{ store.credito.num_cuotas }} cuotas · Cuenta: {{ store.credito.cuenta?.nombre }}
          </p>
        </div>
      </div>

      <!-- KPIs -->
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Capital</p>
          <p class="mt-1.5 font-mono text-xl font-bold text-slate-200">{{ formatCurrency(store.credito.capital) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Total interés</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:#FBBF24">{{ formatCurrency(store.credito.total_interes) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Ya pagado</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:#10B981">{{ formatCurrency(store.credito.total_pagado) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Saldo pendiente</p>
          <p class="mt-1.5 font-mono text-xl font-bold" :style="{ color: store.credito.saldo_pendiente <= 0 ? '#10B981' : '#DC2626' }">
            {{ formatCurrency(Math.max(0, store.credito.saldo_pendiente)) }}
          </p>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="mt-4 fintech-card p-5">
        <div class="flex justify-between text-xs text-slate-500 mb-2">
          <span>Progreso de pago</span>
          <span>{{ store.credito.cuotas_pagadas }} / {{ store.credito.num_cuotas }} cuotas — {{ progresoPct }}%</span>
        </div>
        <div class="h-2.5 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.06)">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: progresoPct + '%', background: store.credito.saldo_pendiente <= 0 ? '#10B981' : '#3B82F6' }"
          />
        </div>
        <p class="mt-2 text-xs text-slate-500">
          Deuda total:
          <span class="font-mono font-semibold text-slate-300">{{ formatCurrency(store.credito.total_deuda) }}</span>
          (capital + intereses)
        </p>
      </div>

      <!-- Tabla de amortización -->
      <div class="mt-6">
        <h2 class="mb-3 text-sm font-semibold text-slate-400">Tabla de amortización</h2>

        <div class="fintech-card overflow-x-auto">
          <table class="min-w-[600px] w-full text-sm">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">#</th>
                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Fecha estimada</th>
                <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Capital</th>
                <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Interés</th>
                <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total cuota</th>
                <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="cuota in store.credito.cuotas"
                :key="cuota.id"
                class="transition-colors hover:bg-white/[0.02]"
                style="border-bottom:1px solid rgba(255,255,255,0.04)"
              >
                <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ cuota.numero_cuota }}</td>
                <td class="px-4 py-3 text-slate-400 text-xs">
                  {{ cuota.fecha_pago || cuota.fecha_estimada }}
                  <span v-if="cuota.fecha_pago" class="ml-1 text-[10px]" style="color:#10B981">(pagada)</span>
                </td>
                <td class="px-4 py-3 text-right font-mono text-xs text-slate-400">{{ formatCurrency(cuota.capital_cuota) }}</td>
                <td class="px-4 py-3 text-right font-mono text-xs" style="color:#FBBF24">{{ formatCurrency(cuota.interes_cuota) }}</td>
                <td class="px-4 py-3 text-right font-mono text-sm font-semibold text-slate-200">{{ formatCurrency(cuota.monto_total_cuota) }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    :style="cuota.estado === 'pagada'
                      ? 'background:rgba(16,185,129,0.15);color:#10B981'
                      : 'background:rgba(255,255,255,0.06);color:#64748B'"
                  >
                    {{ cuota.estado === 'pagada' ? 'Pagada' : 'Pendiente' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    v-if="cuota.estado === 'pendiente' && store.credito.estado === 'activo' && esSiguiente(cuota)"
                    class="rounded-lg px-3 py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-80"
                    style="background:#3B82F6"
                    @click="openPagar(cuota)"
                  >
                    Pagar
                  </button>
                  <span v-else-if="cuota.estado === 'pendiente'" class="text-[11px] text-slate-600">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Modal pagar cuota -->
    <PagarCuotaCreditoModal
      v-model="showPagarModal"
      :cuota="cuotaSeleccionada"
      :credito="store.credito"
      @saved="onPagarCuota"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter }     from 'vue-router'
import { useCreditosStore }        from '../stores/creditos'
import { useCuentasStore }         from '../stores/cuentas'
import { formatCurrency }          from '../utils/currency'
import PagarCuotaCreditoModal      from '../components/PagarCuotaCreditoModal.vue'

const store        = useCreditosStore()
const cuentasStore = useCuentasStore()
const route        = useRoute()
const router       = useRouter()

onMounted(() => Promise.all([cuentasStore.fetchCuentas(), store.fetchCredito(route.params.id)]))

function pctTasa(t) { return parseFloat((parseFloat(t) * 100).toFixed(2)) }

const tipoLabel = computed(() =>
  store.credito?.tipo_interes === 'simple' ? 'Interés simple' : 'Interés compuesto'
)

const progresoPct = computed(() => {
  const c = store.credito
  if (!c || !c.num_cuotas) return 0
  return Math.min(100, Math.round((c.cuotas_pagadas / c.num_cuotas) * 100))
})

// Solo permite pagar la primera cuota pendiente (orden secuencial)
function esSiguiente(cuota) {
  const cuotas = store.credito?.cuotas || []
  const primeraPendiente = cuotas.find(q => q.estado === 'pendiente')
  return primeraPendiente?.id === cuota.id
}

// Pagar cuota
const showPagarModal    = ref(false)
const cuotaSeleccionada = ref(null)

function openPagar(cuota) {
  cuotaSeleccionada.value = cuota
  showPagarModal.value    = true
}

async function onPagarCuota(payload) {
  try {
    await store.pagarCuota(route.params.id, cuotaSeleccionada.value.id, payload)
  } catch (e) {
    console.error(e)
  }
}
</script>
