<template>
  <section>
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p class="mt-1 text-sm" style="color:#94A3B8">Resumen global de tus tarjetas y gastos.</p>
      </div>
      <span class="text-xs text-slate-600 pt-1">{{ MONTHS[mesActual - 1] }} {{ anioActual }}</span>
    </div>

    <!-- ── KPI: Tarjetas ──────────────────────────────────────────────────── -->
    <div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="fintech-card p-5">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]" style="color:#10B981">account_balance_wallet</span>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Disponible total</p>
        </div>
        <p class="mt-3 font-mono text-2xl font-bold" style="color:#10B981">{{ formatCurrency(totalDisponible) }}</p>
        <p class="mt-1 text-xs text-slate-600">de {{ formatCurrency(totalLimite) }} en límite</p>
      </div>

      <div class="fintech-card p-5">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]" :style="{ color: colorGastado }">trending_up</span>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Saldo gastado</p>
        </div>
        <p class="mt-3 font-mono text-2xl font-bold" :style="{ color: colorGastado }">{{ formatCurrency(totalGastado) }}</p>
        <p class="mt-1 text-xs text-slate-600">{{ pctGastado }}% del límite global</p>
      </div>

      <div class="fintech-card p-5">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]" style="color:#F59E0B">calendar_month</span>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">A pagar este mes</p>
        </div>
        <p class="mt-3 font-mono text-2xl font-bold" style="color:#F59E0B">{{ formatCurrency(reportesStore.grand_total) }}</p>
        <p class="mt-1 text-xs text-slate-600">{{ MONTHS[mesActual - 1] }} {{ anioActual }}</p>
      </div>

      <div class="fintech-card p-5">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]" style="color:#93C5FD">credit_card</span>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Tarjetas</p>
        </div>
        <p class="mt-3 font-mono text-2xl font-bold text-slate-100">{{ tarjetasStore.tarjetas.length }}</p>
        <p class="mt-1 text-xs text-slate-600">registradas</p>
      </div>
    </div>

    <!-- Barra de uso global -->
    <div v-if="totalLimite > 0" class="mt-2 px-1">
      <div class="progress-bar-track">
        <div
          class="progress-bar-fill transition-all duration-700"
          :class="pctGastado >= 90 ? 'progress-bar-fill--danger' : ''"
          :style="{ width: pctGastado + '%' }"
        />
      </div>
    </div>

    <!-- ── KPI: Cuentas, Capital en calle, Flujo del mes ─────────────────── -->
    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <!-- Saldo en cuentas -->
      <div class="fintech-card p-5" style="background:linear-gradient(135deg,rgba(16,185,129,0.06) 0%,rgba(10,25,47,0) 100%);border-color:rgba(16,185,129,0.15)">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]" style="color:#10B981">savings</span>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Saldo en cuentas</p>
        </div>
        <p class="mt-3 font-mono text-2xl font-bold" :style="{ color: saldoCuentas >= 0 ? '#10B981' : '#DC2626' }">
          {{ cuentasStore.stats ? formatCurrency(cuentasStore.stats.saldo_total_cuentas) : '—' }}
        </p>
        <p class="mt-1 text-xs text-slate-600">saldo disponible consolidado</p>
      </div>

      <!-- Capital en calle -->
      <div class="fintech-card p-5" style="background:linear-gradient(135deg,rgba(251,191,36,0.06) 0%,rgba(10,25,47,0) 100%);border-color:rgba(251,191,36,0.15)">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]" style="color:#FBBF24">handshake</span>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Capital en calle</p>
        </div>
        <p class="mt-3 font-mono text-2xl font-bold" style="color:#FBBF24">
          {{ cuentasStore.stats ? formatCurrency(cuentasStore.stats.capital_en_calle) : '—' }}
        </p>
        <p class="mt-1 text-xs text-slate-600">en préstamos activos</p>
      </div>

      <!-- Flujo del mes -->
      <div class="fintech-card p-5" :style="flujoStyle">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]" :style="{ color: flujoColor }">swap_vert</span>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Flujo {{ MONTHS[mesActual - 1] }}</p>
        </div>
        <p class="mt-3 font-mono text-2xl font-bold" :style="{ color: flujoColor }">
          {{ cuentasStore.stats ? formatCurrency(cuentasStore.stats.flujo_mes.neto) : '—' }}
        </p>
        <p v-if="cuentasStore.stats" class="mt-1 text-xs text-slate-600">
          +{{ formatCurrency(cuentasStore.stats.flujo_mes.ingresos) }} / -{{ formatCurrency(cuentasStore.stats.flujo_mes.egresos) }}
        </p>
        <p v-else class="mt-1 text-xs text-slate-600">ingresos − egresos del mes</p>
      </div>
    </div>

    <!-- ── Tarjetas individuales ────────────────────────────────────────── -->
    <div class="mt-8">
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Mis tarjetas</h2>

      <div v-if="tarjetasStore.loading" class="flex justify-center py-10">
        <div class="h-7 w-7 animate-spin rounded-full border-2 border-success border-t-transparent" />
      </div>

      <div v-else-if="!tarjetasStore.tarjetas.length" class="fintech-card flex flex-col items-center py-12 text-center">
        <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.3)">credit_card_off</span>
        <p class="mt-3 text-sm text-slate-400">No hay tarjetas registradas.</p>
        <router-link to="/tarjetas" class="mt-3 text-xs text-success hover:underline">Agregar tarjeta →</router-link>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <router-link
          v-for="t in tarjetasStore.tarjetas"
          :key="t.id"
          :to="`/tarjetas/${t.id}`"
          class="fintech-card block p-5 transition-all hover:border-white/20 hover:-translate-y-0.5"
          style="text-decoration:none"
        >
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

          <div class="mt-4 flex items-end justify-between">
            <div>
              <p class="text-[10px] text-slate-600">Disponible</p>
              <p class="font-mono text-lg font-bold" style="color:#10B981">{{ formatCurrency(t.saldo_disponible) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-slate-600">Límite</p>
              <p class="font-mono text-sm text-slate-400">{{ formatCurrency(t.limite_credito) }}</p>
            </div>
          </div>

          <div class="mt-3 progress-bar-track" style="height:4px">
            <div
              class="progress-bar-fill"
              :class="pctTarjeta(t) >= 90 ? 'progress-bar-fill--danger' : ''"
              :style="{ width: pctTarjeta(t) + '%', transition: 'width 0.7s ease' }"
            />
          </div>

          <div class="mt-2 flex justify-between text-[10px] text-slate-600">
            <span>Corte: día {{ t.dia_corte }}</span>
            <span>Pago: día {{ t.dia_pago }}</span>
          </div>
        </router-link>
      </div>
    </div>

    <!-- ── Desglose del mes ─────────────────────────────────────────────── -->
    <div v-if="reportesStore.resumen.length" class="mt-8">
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Pagos de {{ MONTHS[mesActual - 1] }}</h2>
      <div class="fintech-card overflow-hidden">
        <div
          v-for="r in reportesStore.resumen"
          :key="r.tarjeta_id"
          class="flex items-center justify-between px-5 py-3.5"
          style="border-bottom:1px solid rgba(255,255,255,0.04)"
        >
          <div>
            <p class="text-sm font-medium text-slate-200">{{ r.nombre }}</p>
            <p class="text-xs text-slate-600">
              {{ r.normales_count }} compra{{ r.normales_count !== 1 ? 's' : '' }} normal{{ r.normales_count !== 1 ? 'es' : '' }}
              · {{ r.cuotas_detalle.length }} cuota{{ r.cuotas_detalle.length !== 1 ? 's' : '' }} tasa cero
            </p>
          </div>
          <span
            class="font-mono text-base font-bold"
            :style="r.total > 0 ? 'color:#F59E0B' : 'color:#10B981'"
          >{{ formatCurrency(r.total) }}</span>
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

const totalLimite     = computed(() => tarjetasStore.tarjetas.reduce((s, t) => s + parseFloat(t.limite_credito), 0))
const totalGastado    = computed(() => tarjetasStore.tarjetas.reduce((s, t) => s + parseFloat(t.saldo_gastado), 0))
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

// Widgets de cuentas
const saldoCuentas = computed(() => cuentasStore.stats?.saldo_total_cuentas ?? 0)
const flujoNeto    = computed(() => cuentasStore.stats?.flujo_mes?.neto ?? 0)
const flujoColor   = computed(() => flujoNeto.value >= 0 ? '#10B981' : '#DC2626')
const flujoStyle   = computed(() => flujoNeto.value >= 0
  ? 'background:linear-gradient(135deg,rgba(16,185,129,0.06) 0%,rgba(10,25,47,0) 100%);border-color:rgba(16,185,129,0.15)'
  : 'background:linear-gradient(135deg,rgba(220,38,38,0.06) 0%,rgba(10,25,47,0) 100%);border-color:rgba(220,38,38,0.15)',
)
</script>
