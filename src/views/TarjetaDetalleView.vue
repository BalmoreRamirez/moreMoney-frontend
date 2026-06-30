<template>
  <section>
    <!-- Back -->
    <button class="mb-5 flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-700" @click="router.back()">
      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
      Volver a tarjetas
    </button>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-success border-t-transparent" />
    </div>

    <div v-else-if="store.error" class="rounded-xl px-5 py-4 text-sm" style="background: var(--color-danger-bg); color: var(--color-danger)">
      {{ store.error }}
    </div>

    <template v-else-if="data">
      <!-- Encabezado de la tarjeta -->
      <div class="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-6">
        <!-- Plástico grande -->
        <div
          class="relative flex h-48 w-full flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-card sm:h-52 sm:max-w-xs"
          :style="cardStyle"
        >
          <div class="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full opacity-10" style="background:white" />
          <div class="pointer-events-none absolute -bottom-12 -right-4 h-48 w-48 rounded-full opacity-[0.06]" style="background:white" />
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-widest opacity-70">{{ data.tarjeta.banco }}</p>
            <p class="mt-0.5 text-lg font-bold text-white">{{ data.tarjeta.nombre }}</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="h-7 w-10 rounded-sm" style="background: linear-gradient(135deg,#f0c040,#c89520); opacity:.85" />
            <span class="font-mono text-xs tracking-widest text-white/60">•••• •••• •••• ••••</span>
          </div>
          <div class="flex items-end justify-between">
            <div>
              <p class="text-[9px] uppercase tracking-widest opacity-60">Disponible</p>
              <p class="font-mono text-xl font-bold text-white">{{ formatCurrency(data.saldos.saldo_disponible) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] uppercase tracking-widest opacity-60">Límite</p>
              <p class="font-mono text-sm text-white/80">{{ formatCurrency(data.saldos.limite_credito) }}</p>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div class="h-full" :style="{ width: usagePct + '%', background: usageColor, transition: 'width .7s ease' }" />
          </div>
        </div>

        <!-- Gráfico donut -->
        <div class="fintech-card flex w-full flex-col items-center justify-center p-6 lg:flex-1">
          <DonutChart
            :limite="data.saldos.limite_credito"
            :gastado="data.saldos.saldo_gastado"
            :disponible="data.saldos.saldo_disponible"
            :size="180"
          />
        </div>

        <!-- Info adicional -->
        <div class="fintech-card w-full space-y-4 p-5 lg:flex-1">
          <h3 class="text-sm font-semibold text-slate-600">Información</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl p-3" style="background: var(--color-surface-mid)">
              <p class="text-[10px] uppercase tracking-wider text-slate-500">Día de corte</p>
              <p class="mt-1 text-xl font-bold text-slate-900">{{ data.tarjeta.dia_corte }}</p>
            </div>
            <div class="rounded-xl p-3" style="background: var(--color-surface-mid)">
              <p class="text-[10px] uppercase tracking-wider text-slate-500">Día de pago</p>
              <p class="mt-1 text-xl font-bold text-slate-900">{{ data.tarjeta.dia_pago }}</p>
            </div>
          </div>
          <div class="rounded-xl p-3" style="background: var(--color-surface-mid)">
            <p class="text-[10px] uppercase tracking-wider text-slate-500">Saldo gastado</p>
            <p class="mt-1 font-mono text-lg font-semibold" :style="{ color: usageColor }">
              {{ formatCurrency(data.saldos.saldo_gastado) }}
            </p>
            <p class="mt-0.5 text-[10px] text-slate-500">{{ usagePct }}% del límite usado</p>
          </div>
        </div>
      </div>

      <!-- Pestañas de compras -->
      <div class="mt-8">
        <div class="flex gap-1 border-b" style="border-color: #E2E8F0">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors"
            :class="activeTab === tab.key
              ? 'border-b-2 border-success text-success'
              : 'text-slate-500 hover:text-slate-700'"
            @click="activeTab = tab.key"
          >
            <span class="material-symbols-outlined text-[16px]">{{ tab.icon }}</span>
            {{ tab.label }}
            <span
              class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
              :style="activeTab === tab.key
                ? 'background: rgba(16,185,129,0.2); color: #10B981'
                : 'background: rgba(10,25,47,0.04); color: #94A3B8'"
            >{{ tab.count }}</span>
          </button>
        </div>

        <!-- Tab: Compras normales -->
        <div v-if="activeTab === 'normales'" class="mt-4">
          <div v-if="!data.compras_normales.length" class="py-10 text-center text-sm text-slate-500">
            Sin compras normales registradas.
          </div>
          <div v-else class="fintech-card overflow-x-auto">
            <table class="w-full min-w-[420px] text-sm">
              <thead>
                <tr style="border-bottom: 1px solid #E8EDF5">
                  <th class="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Nombre</th>
                  <th class="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                  <th class="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">Monto</th>
                  <th class="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="c in data.compras_normales"
                  :key="c.id"
                  class="transition-colors"
                  style="border-bottom: 1px solid rgba(10,25,47,0.03)"
                >
                  <td class="px-4 py-3 font-medium text-slate-700">{{ c.nombre }}</td>
                  <td class="px-4 py-3 text-slate-500">{{ formatDate(c.fecha_compra) }}</td>
                  <td class="px-4 py-3 text-right font-mono text-slate-700">{{ formatCurrency(c.monto) }}</td>
                  <td class="px-4 py-3 text-center">
                    <span :class="c.estado === 'pagada' ? 'badge-success' : 'badge-alert'">
                      {{ c.estado }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab: Tasa cero -->
        <div v-if="activeTab === 'tasa_cero'" class="mt-4 space-y-4">
          <div v-if="!data.compras_tasa_cero.length" class="py-10 text-center text-sm text-slate-500">
            Sin compras a tasa cero registradas.
          </div>
          <div
            v-for="c in data.compras_tasa_cero"
            :key="c.id"
            class="fintech-card p-4"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="font-semibold text-slate-700">{{ c.nombre }}</p>
                <p class="mt-0.5 text-xs text-slate-500">{{ formatDate(c.fecha_compra) }}</p>
              </div>
              <div class="text-right">
                <p class="font-mono text-base font-bold text-slate-900">{{ formatCurrency(c.monto_total) }}</p>
                <span :class="c.estado === 'activa' ? 'badge-success' : 'badge-alert'">{{ c.estado }}</span>
              </div>
            </div>

            <!-- Barra de progreso de cuotas -->
            <div class="mt-4">
              <div class="mb-1.5 flex items-center justify-between text-xs">
                <span class="text-slate-500">Progreso de cuotas</span>
                <span class="font-mono text-slate-600">{{ cuotasPagadas(c) }}/{{ c.total_cuotas }}</span>
              </div>
              <div class="progress-bar-track">
                <div
                  class="progress-bar-fill"
                  :class="cuotasPct(c) >= 90 ? 'progress-bar-fill--danger' : cuotasPct(c) >= 50 ? '' : ''"
                  :style="{ width: cuotasPct(c) + '%' }"
                />
              </div>
              <p class="mt-1.5 text-[10px] text-slate-500">
                Cuota mensual: <span class="font-mono text-slate-600">{{ formatCurrency(cuotaMonto(c)) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTarjetasStore } from '../stores/tarjetas'
import DonutChart from '../components/DonutChart.vue'
import { formatCurrency } from '../utils/currency'

const route  = useRoute()
const router = useRouter()
const store  = useTarjetasStore()

onMounted(() => store.fetchTarjeta(route.params.id))

const data = computed(() => store.tarjeta)

// Plástico
const GRADIENTS = [
  ['#0D47A1', '#1565C0'], ['#004B49', '#00695C'], ['#1B5E20', '#2E7D32'],
  ['#4A148C', '#6A1B9A'], ['#880E4F', '#AD1457'], ['#E65100', '#EF6C00'],
  ['#263238', '#37474F'], ['#1A237E', '#283593'],
]
function bankHash(name = '') {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % GRADIENTS.length
}
const cardStyle = computed(() => {
  const [from, to] = GRADIENTS[bankHash(data.value?.tarjeta?.banco)]
  return { background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }
})

const usagePct = computed(() => {
  if (!data.value) return 0
  const { limite_credito, saldo_gastado } = data.value.saldos
  if (!limite_credito) return 0
  return Math.min(100, Math.round((saldo_gastado / limite_credito) * 100))
})
const usageColor = computed(() => {
  if (usagePct.value >= 90) return '#DC2626'
  if (usagePct.value >= 70) return '#F59E0B'
  return '#10B981'
})

// Pestañas
const activeTab = ref('normales')
const tabs = computed(() => [
  { key: 'normales',  icon: 'receipt_long',  label: 'Compras normales', count: data.value?.compras_normales.length ?? 0 },
  { key: 'tasa_cero', icon: 'payments',      label: 'Tasa cero',        count: data.value?.compras_tasa_cero.length ?? 0 },
])

// Helpers tasa cero
function cuotasPagadas(c) { return c.cuotas?.filter(q => q.estado === 'pagada').length ?? 0 }
function cuotasPct(c) {
  if (!c.total_cuotas) return 0
  return Math.round((cuotasPagadas(c) / c.total_cuotas) * 100)
}
function cuotaMonto(c) {
  return c.total_cuotas ? parseFloat(c.monto_total) / c.total_cuotas : 0
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
