<template>
  <section>

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex items-start justify-between mb-7">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p class="mt-0.5 text-sm text-slate-500">Estado financiero global</p>
      </div>
      <span
        class="text-xs text-slate-500 border rounded-lg px-3 py-1.5"
        style="background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.07)"
      >
        {{ MONTHS[mesActual - 1] }} {{ anioActual }}
      </span>
    </div>

    <!-- ── Fila hero (3 paneles) ────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-4">

      <!-- Panel 1: Saldo en cuentas -->
      <div
        class="fintech-card p-6 flex flex-col justify-between"
        style="background:linear-gradient(135deg,rgba(16,185,129,0.08) 0%,transparent 100%);border-color:rgba(16,185,129,0.18)"
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
          <p class="text-xs text-slate-600 mt-1">saldo consolidado</p>
        </div>

        <div class="mt-6 pt-4 border-t space-y-4" style="border-color:rgba(255,255,255,0.07)">
          <!-- Capital en préstamos -->
          <div>
            <div class="flex items-center gap-1.5 mb-1">
              <span class="material-symbols-outlined text-[14px]" style="color:#FBBF24">handshake</span>
              <p class="text-xs text-slate-500">Capital en préstamos</p>
            </div>
            <p class="font-mono text-xl font-bold" style="color:#FBBF24">
              {{ stats ? formatCurrency(capitalEnCalle) : '—' }}
            </p>
            <p class="text-[10px] text-slate-700 mt-0.5">pendiente de recuperar</p>
          </div>
        </div>
      </div>

      <!-- Panel 2: Flujo del mes -->
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

      <!-- Panel 3: Uso de crédito -->
      <div class="fintech-card p-6 flex flex-col items-center">
        <div class="flex items-center gap-2 mb-4 self-start">
          <span class="material-symbols-outlined text-[16px]" style="color:#93C5FD">donut_large</span>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Uso de crédito</p>
        </div>
        <DonutChart
          :limite="totalLimite"
          :gastado="totalGastado"
          :disponible="totalDisponible"
          :size="164"
        />
      </div>
    </div>

    <!-- ── KPI strip ─────────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-5">

      <div class="fintech-card p-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[15px]" style="color:#F59E0B">calendar_month</span>
          <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500">A pagar</p>
        </div>
        <p class="font-mono text-xl font-bold mt-2.5" style="color:#F59E0B">
          {{ formatCurrency(reportesStore.grand_total) }}
        </p>
        <p class="text-[10px] text-slate-600 mt-0.5">este mes · {{ MONTHS[mesActual - 1] }}</p>
      </div>

      <div class="fintech-card p-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[15px]" style="color:#10B981">account_balance_wallet</span>
          <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500">Disponible</p>
        </div>
        <p class="font-mono text-xl font-bold mt-2.5" style="color:#10B981">
          {{ formatCurrency(totalDisponible) }}
        </p>
        <p class="text-[10px] text-slate-600 mt-0.5">en crédito · {{ tarjetasStore.tarjetas.length }} tarjetas</p>
      </div>

      <div class="fintech-card p-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[15px]" :style="{ color: colorGastado }">trending_up</span>
          <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500">Gastado</p>
        </div>
        <p class="font-mono text-xl font-bold mt-2.5" :style="{ color: colorGastado }">
          {{ formatCurrency(totalGastado) }}
        </p>
        <p class="text-[10px] text-slate-600 mt-0.5">{{ pctGastado }}% del límite global</p>
      </div>

      <div class="fintech-card p-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[15px]" :style="{ color: flujoColor }">swap_vert</span>
          <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500">Flujo neto</p>
        </div>
        <p class="font-mono text-xl font-bold mt-2.5" :style="{ color: flujoColor }">
          {{ stats ? (flujoNeto >= 0 ? '+' : '') + formatCurrency(flujoNeto) : '—' }}
        </p>
        <p class="text-[10px] text-slate-600 mt-0.5">ingresos − egresos del mes</p>
      </div>
    </div>

    <!-- ── Uso por tarjeta + Pagos del mes ────────────────────────────────── -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-5 mb-6">

      <!-- Barras por tarjeta -->
      <div class="fintech-card p-5 lg:col-span-3">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-5">
          Uso por tarjeta
        </h2>

        <div v-if="tarjetasStore.loading" class="flex justify-center py-6">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-success border-t-transparent" />
        </div>

        <div
          v-else-if="!tarjetasStore.tarjetas.length"
          class="flex flex-col items-center py-6 text-center"
        >
          <span class="material-symbols-outlined text-3xl mb-2" style="color:rgba(16,185,129,0.25)">credit_card_off</span>
          <p class="text-xs text-slate-500">Sin tarjetas registradas</p>
          <router-link to="/tarjetas" class="mt-2 text-xs text-success hover:underline">Agregar →</router-link>
        </div>

        <div v-else class="space-y-5">
          <div v-for="t in tarjetasStore.tarjetas" :key="t.id">
            <div class="flex items-center justify-between text-xs mb-1.5">
              <div class="flex items-center gap-2 min-w-0">
                <span class="font-medium text-slate-200 truncate">{{ t.nombre }}</span>
                <span class="text-slate-600 shrink-0">{{ t.banco }}</span>
              </div>
              <div class="flex items-center gap-3 shrink-0 ml-2">
                <span class="text-slate-600">{{ formatCurrency(t.saldo_disponible) }} disp.</span>
                <span
                  class="font-mono font-bold min-w-[34px] text-right"
                  :style="pctTarjeta(t) >= 90 ? 'color:#DC2626' : pctTarjeta(t) >= 70 ? 'color:#F59E0B' : 'color:#10B981'"
                >{{ pctTarjeta(t) }}%</span>
              </div>
            </div>

            <div class="progress-bar-track" style="height:7px">
              <div
                class="progress-bar-fill"
                :class="pctTarjeta(t) >= 90 ? 'progress-bar-fill--danger' : pctTarjeta(t) >= 70 ? 'progress-bar-fill--alert' : ''"
                :style="{ width: pctTarjeta(t) + '%', transition: 'width 0.7s ease' }"
              />
            </div>

            <div class="flex justify-between text-[10px] text-slate-700 mt-1">
              <span>{{ formatCurrency(t.saldo_gastado) }} usado</span>
              <span>límite {{ formatCurrency(t.limite_credito) }}</span>
            </div>
          </div>
        </div>

        <!-- Barra de uso global -->
        <div v-if="totalLimite > 0" class="mt-6 pt-4 border-t" style="border-color:rgba(255,255,255,0.06)">
          <div class="flex justify-between text-xs mb-2">
            <span class="text-slate-500">Uso global de crédito</span>
            <span
              class="font-mono font-bold"
              :style="pctGastado >= 90 ? 'color:#DC2626' : pctGastado >= 70 ? 'color:#F59E0B' : 'color:#10B981'"
            >{{ pctGastado }}%</span>
          </div>
          <div class="progress-bar-track" style="height:5px">
            <div
              class="progress-bar-fill"
              :class="pctGastado >= 90 ? 'progress-bar-fill--danger' : pctGastado >= 70 ? 'progress-bar-fill--alert' : ''"
              :style="{ width: pctGastado + '%', transition: 'width 0.7s ease' }"
            />
          </div>
        </div>
      </div>

      <!-- Pagos del mes -->
      <div class="fintech-card p-5 lg:col-span-2">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-5">
          Pagos de {{ MONTHS[mesActual - 1] }}
        </h2>

        <div
          v-if="!reportesStore.resumen.length"
          class="flex flex-col items-center py-6 text-center"
        >
          <span class="material-symbols-outlined text-3xl mb-2" style="color:rgba(245,158,11,0.2)">receipt_long</span>
          <p class="text-xs text-slate-500">Sin pagos este mes</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="r in reportesStore.resumen" :key="r.tarjeta_id">
            <div class="flex items-center justify-between text-xs mb-1.5">
              <span class="text-slate-300 font-medium truncate mr-2">{{ r.nombre }}</span>
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
            <p class="text-[10px] text-slate-700 mt-1">
              {{ r.normales_count }} normal{{ r.normales_count !== 1 ? 'es' : '' }}
              · {{ r.cuotas_detalle.length }} cuota{{ r.cuotas_detalle.length !== 1 ? 's' : '' }} tasa cero
            </p>
          </div>

          <!-- Total -->
          <div class="pt-4 mt-2 border-t flex items-center justify-between" style="border-color:rgba(255,255,255,0.07)">
            <span class="text-xs text-slate-500">Total del mes</span>
            <span class="font-mono text-2xl font-bold" style="color:#F59E0B">
              {{ formatCurrency(reportesStore.grand_total) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tarjetas individuales ────────────────────────────────────────────── -->
    <div>
      <h2 class="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Mis tarjetas</h2>

      <div v-if="tarjetasStore.loading" class="flex justify-center py-10">
        <div class="h-7 w-7 animate-spin rounded-full border-2 border-success border-t-transparent" />
      </div>

      <div
        v-else-if="!tarjetasStore.tarjetas.length"
        class="fintech-card flex flex-col items-center py-12 text-center"
      >
        <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.3)">credit_card_off</span>
        <p class="mt-3 text-sm text-slate-400">No hay tarjetas registradas.</p>
        <router-link to="/tarjetas" class="mt-3 text-xs text-success hover:underline">
          Agregar tarjeta →
        </router-link>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <router-link
          v-for="t in tarjetasStore.tarjetas"
          :key="t.id"
          :to="`/tarjetas/${t.id}`"
          class="fintech-card block p-5 transition-all hover:border-white/20 hover:-translate-y-0.5"
          style="text-decoration:none"
        >
          <!-- Card header -->
          <div class="flex items-start justify-between">
            <div>
              <p class="font-semibold text-slate-100">{{ t.nombre }}</p>
              <p class="text-xs text-slate-500">{{ t.banco }}</p>
            </div>
            <span
              class="rounded-lg px-2 py-1 text-[10px] font-bold"
              :style="pctTarjeta(t) >= 90
                ? 'background:rgba(220,38,38,0.15);color:#DC2626'
                : pctTarjeta(t) >= 70
                ? 'background:rgba(245,158,11,0.15);color:#F59E0B'
                : 'background:rgba(16,185,129,0.12);color:#10B981'"
            >{{ pctTarjeta(t) }}%</span>
          </div>

          <!-- Montos -->
          <div class="mt-4 flex items-end justify-between">
            <div>
              <p class="text-[10px] text-slate-600">Disponible</p>
              <p class="font-mono text-lg font-bold" style="color:#10B981">
                {{ formatCurrency(t.saldo_disponible) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-slate-600">Gastado</p>
              <p
                class="font-mono text-sm font-semibold"
                :style="pctTarjeta(t) >= 90 ? 'color:#DC2626' : pctTarjeta(t) >= 70 ? 'color:#F59E0B' : 'color:#94A3B8'"
              >{{ formatCurrency(t.saldo_gastado) }}</p>
            </div>
          </div>

          <!-- Barra -->
          <div class="mt-3 progress-bar-track" style="height:4px">
            <div
              class="progress-bar-fill"
              :class="pctTarjeta(t) >= 90 ? 'progress-bar-fill--danger' : pctTarjeta(t) >= 70 ? 'progress-bar-fill--alert' : ''"
              :style="{ width: pctTarjeta(t) + '%', transition: 'width 0.7s ease' }"
            />
          </div>

          <!-- Fechas -->
          <div class="mt-2 flex justify-between text-[10px] text-slate-600">
            <span>Corte: día {{ t.dia_corte }}</span>
            <span>Límite {{ formatCurrency(t.limite_credito) }}</span>
            <span>Pago: día {{ t.dia_pago }}</span>
          </div>
        </router-link>
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

const tarjetasStore = useTarjetasStore()
const reportesStore = useReportesStore()
const cuentasStore  = useCuentasStore()

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const now        = new Date()
const mesActual  = now.getMonth() + 1
const anioActual = now.getFullYear()

onMounted(async () => {
  await tarjetasStore.fetchTarjetas()
  reportesStore.month = mesActual
  reportesStore.year  = anioActual
  await reportesStore.fetchMensual()
  await cuentasStore.fetchStats(anioActual, mesActual)
})

// ── Crédito ─────────────────────────────────────────────────────────────────
const totalLimite     = computed(() => tarjetasStore.tarjetas.reduce((s, t) => s + parseFloat(t.limite_credito), 0))
const totalGastado    = computed(() => tarjetasStore.tarjetas.reduce((s, t) => s + parseFloat(t.saldo_gastado),    0))
const totalDisponible = computed(() => tarjetasStore.tarjetas.reduce((s, t) => s + parseFloat(t.saldo_disponible), 0))
const pctGastado      = computed(() => totalLimite.value ? Math.round((totalGastado.value / totalLimite.value) * 100) : 0)

const colorGastado = computed(() => {
  if (pctGastado.value >= 90) return '#DC2626'
  if (pctGastado.value >= 70) return '#F59E0B'
  return '#4B5563'
})

function pctTarjeta(t) {
  if (!t.limite_credito) return 0
  return Math.min(100, Math.round((t.saldo_gastado / t.limite_credito) * 100))
}

// ── Cuentas / flujo ─────────────────────────────────────────────────────────
const stats           = computed(() => cuentasStore.stats)
const saldoCuentas    = computed(() => stats.value?.saldo_total_cuentas ?? 0)
const capitalEnCalle  = computed(() => stats.value?.capital_en_calle    ?? 0)
const flujoNeto       = computed(() => stats.value?.flujo_mes?.neto     ?? 0)
const flujoColor      = computed(() => flujoNeto.value >= 0 ? '#10B981' : '#DC2626')
</script>
