<template>
  <section>
    <!-- Back -->
    <button
      class="mb-5 flex items-center gap-1.5 text-sm transition-colors"
      style="color:var(--color-text-muted)"
      @click="router.back()"
    >
      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
      Volver a créditos
    </button>

    <!-- Loading -->
    <div v-if="store.loading && !store.credito" class="flex justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style="border-color:var(--color-brand);border-top-color:transparent" />
    </div>

    <template v-else-if="store.credito">
      <!-- Encabezado -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold" style="color:var(--color-text-primary)">{{ store.credito.nombre }}</h1>
            <span
              class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :style="store.credito.estado === 'activo'
                ? 'background:var(--color-brand-light);color:var(--color-brand)'
                : 'background:rgba(16,185,129,0.15);color:var(--color-success)'"
            >
              {{ store.credito.estado === 'activo' ? 'Activo' : 'Pagado' }}
            </span>
          </div>
          <p class="mt-1 text-sm" style="color:var(--color-text-muted)">
            {{ tipoLabel }} · {{ pctTasa(store.credito.tasa_mensual) }}% mensual ·
            {{ store.credito.num_cuotas }} cuotas · Cuenta: {{ store.credito.cuenta?.nombre }}
          </p>
        </div>
      </div>

      <!-- KPIs -->
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Capital</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:var(--color-text-primary)">{{ formatCurrency(store.credito.capital) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Total interés</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:var(--color-alert)">{{ formatCurrency(store.credito.total_interes) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Ya pagado</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:var(--color-success)">{{ formatCurrency(store.credito.total_pagado) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Saldo pendiente</p>
          <p class="mt-1.5 font-mono text-xl font-bold" :style="{ color: store.credito.saldo_pendiente <= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
            {{ formatCurrency(Math.max(0, store.credito.saldo_pendiente)) }}
          </p>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="mt-4 fintech-card p-5">
        <div class="flex justify-between text-xs mb-2" style="color:var(--color-text-muted)">
          <span>Progreso de pago</span>
          <span>{{ store.credito.cuotas_pagadas }} / {{ store.credito.num_cuotas }} cuotas — {{ progresoPct }}%</span>
        </div>
        <div class="progress-bar-track">
          <div
            class="progress-bar-fill progress-bar-fill--brand transition-all duration-500"
            :style="{ width: progresoPct + '%' }"
          />
        </div>
        <p class="mt-2 text-xs" style="color:var(--color-text-muted)">
          Deuda total:
          <span class="font-mono font-semibold" style="color:var(--color-text-primary)">{{ formatCurrency(store.credito.total_deuda) }}</span>
          (capital + intereses)
        </p>
      </div>

      <!-- Tabla de amortización -->
      <div class="mt-6">
        <h2 class="mb-3 text-sm font-semibold" style="color:var(--color-text-secondary)">Tabla de amortización</h2>

        <div class="fintech-card overflow-x-auto">
          <table class="min-w-[600px] w-full text-sm">
            <thead>
              <tr style="border-bottom:1px solid var(--color-border)">
                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">#</th>
                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Fecha estimada</th>
                <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Capital</th>
                <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Interés</th>
                <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Total cuota</th>
                <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Estado</th>
                <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="cuota in store.credito.cuotas"
                :key="cuota.id"
                class="transition-colors"
                style="border-bottom:1px solid var(--color-border)"
              >
                <td class="px-4 py-3 font-mono text-xs" style="color:var(--color-text-muted)">{{ cuota.numero_cuota }}</td>
                <td class="px-4 py-3 text-xs" style="color:var(--color-text-muted)">
                  {{ cuota.fecha_pago || cuota.fecha_estimada }}
                  <span v-if="cuota.fecha_pago" class="ml-1 text-[10px]" style="color:var(--color-success)">(pagada)</span>
                </td>
                <td class="px-4 py-3 text-right font-mono text-xs" style="color:var(--color-text-secondary)">{{ formatCurrency(cuota.capital_cuota) }}</td>
                <td class="px-4 py-3 text-right font-mono text-xs" style="color:var(--color-alert)">{{ formatCurrency(cuota.interes_cuota) }}</td>
                <td class="px-4 py-3 text-right font-mono text-sm font-semibold" style="color:var(--color-text-primary)">{{ formatCurrency(cuota.monto_total_cuota) }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    :style="cuota.estado === 'pagada'
                      ? 'background:rgba(16,185,129,0.15);color:var(--color-success)'
                      : 'background:var(--color-surface-mid);color:var(--color-text-muted)'"
                  >
                    {{ cuota.estado === 'pagada' ? 'Pagada' : 'Pendiente' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    v-if="cuota.estado === 'pendiente' && store.credito.estado === 'activo' && esSiguiente(cuota)"
                    class="btn-brand rounded-lg px-3 py-1 text-[11px]"
                    @click="openPagar(cuota)"
                  >
                    Pagar
                  </button>
                  <span v-else-if="cuota.estado === 'pendiente'" class="text-[11px]" style="color:var(--color-text-muted)">—</span>
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
import { useToast } from '../composables/useToast'

const store        = useCreditosStore()
const cuentasStore = useCuentasStore()
const route        = useRoute()
const router       = useRouter()
const toast        = useToast()

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
    toast.success('Cuota pagada')
  } catch (e) {
    toast.fromError(e, 'No se pudo registrar el pago')
  }
}
</script>
