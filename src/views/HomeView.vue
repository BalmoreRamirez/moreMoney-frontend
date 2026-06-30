<template>
  <section>

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex items-start justify-between mb-7">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p class="mt-0.5 text-sm text-slate-500">Estado financiero global</p>
      </div>
      <span
        class="text-xs text-slate-500 border rounded-lg px-3 py-1.5"
        style="background:rgba(10,25,47,0.02);border-color:#E2E8F0"
      >
        {{ MONTHS[mesActual - 1] }} {{ anioActual }}
      </span>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════
         SECCIÓN: CUENTAS Y FLUJO (dinero real)
    ═══════════════════════════════════════════════════════════════════════ -->
    <div class="flex items-center gap-3 mb-4">
      <span class="material-symbols-outlined text-[14px]" style="color:#10B981">account_balance</span>
      <span class="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Cuentas y flujo</span>
      <div class="flex-1 h-px" style="background:#E8EDF5" />
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-8">

      <!-- Panel: Saldo en cuentas -->
      <div
        class="fintech-card p-6 flex flex-col justify-between"
        style="background:linear-gradient(135deg,rgba(5,150,105,0.06) 0%,transparent 100%);border-color:#A7F3D0"
      >
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-[16px]" style="color:#10B981">savings</span>
            <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Saldo en cuentas</p>
          </div>
          <p
            class="font-mono text-4xl font-bold leading-none mt-3"
            :style="{ color: saldoCuentas >= 0 ? '#10B981' : '#DC2626' }"
          >
            {{ stats ? formatCurrency(saldoCuentas) : '—' }}
          </p>
          <p class="text-xs text-slate-600 mt-1">dinero real disponible</p>
        </div>

        <div class="mt-6 pt-4 border-t" style="border-color:#E2E8F0">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="material-symbols-outlined text-[14px]" style="color:#D97706">handshake</span>
            <p class="text-xs text-slate-500">Capital en préstamos</p>
          </div>
          <p class="font-mono text-xl font-bold" style="color:#D97706">
            {{ stats ? formatCurrency(capitalEnCalle) : '—' }}
          </p>
          <p class="text-[10px] text-slate-600 mt-0.5">pendiente de recuperar</p>
        </div>
      </div>

      <!-- Panel: Flujo del mes -->
      <div class="fintech-card p-6">
        <div class="flex items-center gap-2 mb-5">
          <span class="material-symbols-outlined text-[16px]" :style="{ color: flujoColor }">swap_vert</span>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
            Flujo de {{ MONTHS[mesActual - 1] }}
          </p>
        </div>
        <FlowBars
          :ingresos="stats?.flujo_mes?.ingresos ?? 0"
          :egresos="stats?.flujo_mes?.egresos ?? 0"
          :neto="stats?.flujo_mes?.neto ?? 0"
          :hasData="!!stats"
        />
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════
         SECCIÓN: ANALÍTICAS (flujo en el tiempo)
    ═══════════════════════════════════════════════════════════════════════ -->
    <div class="flex items-center gap-3 mb-4">
      <span class="material-symbols-outlined text-[14px]" style="color:#6366F1">insights</span>
      <span class="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Analíticas</span>
      <div class="flex-1 h-px" style="background:#E8EDF5" />
    </div>

    <div class="mb-8">
      <AnalyticsPanel />
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════
         SECCIÓN: TARJETAS DE CRÉDITO (deuda / límites)
    ═══════════════════════════════════════════════════════════════════════ -->
    <div class="flex items-center gap-3 mb-4">
      <span class="material-symbols-outlined text-[14px]" style="color:#2D5991">credit_card</span>
      <span class="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Tarjetas de crédito</span>
      <div class="flex-1 h-px" style="background:#E8EDF5" />
    </div>

    <!-- KPIs de tarjetas + Donut -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-4">

      <!-- Donut: uso global de crédito -->
      <div class="fintech-card p-6 flex flex-col items-center">
        <div class="flex items-center gap-2 mb-4 self-start">
          <span class="material-symbols-outlined text-[16px]" style="color:#2D5991">donut_large</span>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Uso global de crédito</p>
        </div>
        <DonutChart
          :limite="totalLimite"
          :gastado="totalGastado"
          :disponible="totalDisponible"
          :size="164"
        />
      </div>

      <!-- KPIs de crédito (3 tarjetas) -->
      <div class="lg:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div class="fintech-card p-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[15px]" style="color:#F59E0B">calendar_month</span>
            <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500">A pagar</p>
          </div>
          <p class="font-mono text-xl font-bold mt-2.5" style="color:#F59E0B">
            {{ formatCurrency(reportesStore.grand_total) }}
          </p>
          <p class="text-[10px] text-slate-600 mt-0.5">en tarjetas · {{ MONTHS[mesActual - 1] }}</p>
        </div>

        <div class="fintech-card p-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[15px]" style="color:#2D5991">credit_score</span>
            <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500">Crédito libre</p>
          </div>
          <p class="font-mono text-xl font-bold mt-2.5" style="color:#2D5991">
            {{ formatCurrency(totalDisponible) }}
          </p>
          <p class="text-[10px] text-slate-600 mt-0.5">de {{ formatCurrency(totalLimite) }} en límite</p>
        </div>

        <div class="fintech-card p-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[15px]" :style="{ color: colorGastado }">receipt</span>
            <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500">Crédito cargado</p>
          </div>
          <p class="font-mono text-xl font-bold mt-2.5" :style="{ color: colorGastado }">
            {{ formatCurrency(totalGastado) }}
          </p>
          <p class="text-[10px] text-slate-600 mt-0.5">{{ pctGastado }}% del límite global</p>
        </div>
      </div>
    </div>

    <!-- Uso por tarjeta + Pagos del mes -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-5 mb-8">

      <!-- Barras de uso por tarjeta -->
      <div class="fintech-card p-5 lg:col-span-3">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-5">
          Carga por tarjeta
        </h2>

        <div v-if="tarjetasStore.loading" class="flex justify-center py-6">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-success border-t-transparent" />
        </div>

        <div
          v-else-if="!tarjetasStore.tarjetas.length"
          class="flex flex-col items-center py-6 text-center"
        >
          <span class="material-symbols-outlined text-3xl mb-2" style="color:rgba(45,89,145,0.12)">credit_card_off</span>
          <p class="text-xs text-slate-500">Sin tarjetas registradas</p>
          <router-link to="/tarjetas" class="mt-2 text-xs" style="color:#2D5991">Agregar →</router-link>
        </div>

        <div v-else class="space-y-5">
          <div v-for="t in tarjetasStore.tarjetas" :key="t.id">
            <div class="flex items-center justify-between text-xs mb-1.5">
              <div class="flex items-center gap-2 min-w-0">
                <span class="font-medium text-slate-700 truncate">{{ t.nombre }}</span>
                <span class="text-slate-500 shrink-0">{{ t.banco }}</span>
              </div>
              <div class="flex items-center gap-3 shrink-0 ml-2">
                <span class="text-slate-500">{{ formatCurrency(t.saldo_disponible) }} libre</span>
                <span
                  class="font-mono font-bold min-w-[34px] text-right"
                  :style="pctTarjeta(t) >= 90 ? 'color:#DC2626' : pctTarjeta(t) >= 70 ? 'color:#F59E0B' : 'color:#2D5991'"
                >{{ pctTarjeta(t) }}%</span>
              </div>
            </div>

            <div class="progress-bar-track" style="height:7px">
              <div
                class="h-full rounded-full"
                style="transition:width 0.7s ease"
                :style="{
                  width: pctTarjeta(t) + '%',
                  background: pctTarjeta(t) >= 90 ? '#DC2626' : pctTarjeta(t) >= 70 ? '#F59E0B' : '#2D5991',
                }"
              />
            </div>

            <div class="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>{{ formatCurrency(t.saldo_gastado) }} cargado</span>
              <span>límite {{ formatCurrency(t.limite_credito) }}</span>
            </div>
          </div>
        </div>

        <!-- Barra global -->
        <div v-if="totalLimite > 0" class="mt-6 pt-4 border-t" style="border-color:#E8EDF5">
          <div class="flex justify-between text-xs mb-2">
            <span class="text-slate-500">Uso global</span>
            <span
              class="font-mono font-bold"
              :style="pctGastado >= 90 ? 'color:#DC2626' : pctGastado >= 70 ? 'color:#F59E0B' : 'color:#2D5991'"
            >{{ pctGastado }}%</span>
          </div>
          <div class="progress-bar-track" style="height:5px">
            <div
              class="h-full rounded-full"
              style="transition:width 0.7s ease"
              :style="{
                width: pctGastado + '%',
                background: pctGastado >= 90 ? '#DC2626' : pctGastado >= 70 ? '#F59E0B' : '#2D5991',
              }"
            />
          </div>
        </div>
      </div>

      <!-- Pagos del mes (desglose por tarjeta) -->
      <div class="fintech-card p-5 lg:col-span-2">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-5">
          Pagos de {{ MONTHS[mesActual - 1] }}
        </h2>

        <div
          v-if="!reportesStore.resumen.length"
          class="flex flex-col items-center py-6 text-center"
        >
          <span class="material-symbols-outlined text-3xl mb-2" style="color:rgba(217,119,6,0.10)">receipt_long</span>
          <p class="text-xs text-slate-500">Sin pagos este mes</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="r in reportesStore.resumen" :key="r.tarjeta_id">
            <div class="flex items-center justify-between text-xs mb-1.5">
              <span class="text-slate-600 font-medium truncate mr-2">{{ r.nombre }}</span>
              <span
                class="font-mono font-bold shrink-0"
                :style="r.total > 0 ? 'color:#F59E0B' : 'color:#10B981'"
              >{{ formatCurrency(r.total) }}</span>
            </div>
            <div class="progress-bar-track" style="height:5px">
              <div
                class="h-full rounded-full"
                style="transition:width 0.7s ease"
                :style="{
                  width: reportesStore.grand_total > 0 ? ((r.total / reportesStore.grand_total) * 100) + '%' : '0%',
                  background: r.total > 0 ? '#F59E0B' : '#10B981',
                }"
              />
            </div>
            <p class="text-[10px] text-slate-600 mt-1">
              {{ r.normales_count }} normal{{ r.normales_count !== 1 ? 'es' : '' }}
              · {{ r.cuotas_detalle.length }} cuota{{ r.cuotas_detalle.length !== 1 ? 's' : '' }} tasa cero
            </p>
          </div>

          <div class="pt-4 mt-2 border-t flex items-center justify-between" style="border-color:#E2E8F0">
            <span class="text-xs text-slate-500">Total a pagar</span>
            <span class="font-mono text-2xl font-bold" style="color:#F59E0B">
              {{ formatCurrency(reportesStore.grand_total) }}
            </span>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTarjetasStore } from '../stores/tarjetas'
import { useReportesStore } from '../stores/reportes'
import { useCuentasStore }  from '../stores/cuentas'
import { formatCurrency }   from '../utils/currency'
import DonutChart           from '../components/DonutChart.vue'
import FlowBars             from '../components/FlowBars.vue'
import AnalyticsPanel       from '../components/AnalyticsPanel.vue'

const tarjetasStore = useTarjetasStore()
const reportesStore = useReportesStore()
const cuentasStore  = useCuentasStore()

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const now        = new Date()
const mesActual  = now.getMonth() + 1
const anioActual = now.getFullYear()

onMounted(() => {
  reportesStore.month = mesActual
  reportesStore.year  = anioActual
  Promise.all([
    tarjetasStore.fetchTarjetas(),
    reportesStore.fetchMensual(),
    cuentasStore.fetchStats(anioActual, mesActual),
  ])
})

// ── Crédito (tarjetas) ───────────────────────────────────────────────────────
const totalLimite     = computed(() => tarjetasStore.tarjetas.reduce((s, t) => s + parseFloat(t.limite_credito), 0))
const totalGastado    = computed(() => tarjetasStore.tarjetas.reduce((s, t) => s + parseFloat(t.saldo_gastado),    0))
const totalDisponible = computed(() => tarjetasStore.tarjetas.reduce((s, t) => s + parseFloat(t.saldo_disponible), 0))
const pctGastado      = computed(() => totalLimite.value ? Math.round((totalGastado.value / totalLimite.value) * 100) : 0)

const colorGastado = computed(() => {
  if (pctGastado.value >= 90) return '#DC2626'
  if (pctGastado.value >= 70) return '#F59E0B'
  return '#94A3B8'
})

function pctTarjeta(t) {
  if (!t.limite_credito) return 0
  return Math.min(100, Math.round((t.saldo_gastado / t.limite_credito) * 100))
}

// ── Cuentas / flujo (dinero real) ────────────────────────────────────────────
const stats          = computed(() => cuentasStore.stats)
const saldoCuentas   = computed(() => stats.value?.saldo_total_cuentas ?? 0)
const capitalEnCalle = computed(() => stats.value?.capital_en_calle    ?? 0)
const flujoNeto      = computed(() => stats.value?.flujo_mes?.neto     ?? 0)
const flujoColor     = computed(() => flujoNeto.value >= 0 ? '#10B981' : '#DC2626')
</script>
