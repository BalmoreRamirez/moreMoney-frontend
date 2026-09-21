<template>
  <div class="fintech-card p-5">

    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="text-sm font-semibold" style="color:var(--color-text-primary)">Flujo de caja</h3>
        <p class="text-[10px] mt-0.5" style="color:var(--color-text-muted)">{{ PERIODO_LABELS[periodo] }}</p>
      </div>
      <div class="flex rounded-lg overflow-hidden" style="border:1px solid var(--color-border)">
        <button
          v-for="p in PERIODOS" :key="p.value"
          class="px-3 py-1.5 text-[10px] font-semibold transition-colors"
          :style="periodo === p.value
            ? 'background:var(--color-brand-light);color:var(--color-brand)'
            : 'color:var(--color-text-secondary)'"
          @click="periodo = p.value"
        >{{ p.label }}</button>
      </div>
    </div>

    <!-- ── Loading ─────────────────────────────────────────────────────────── -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="h-6 w-6 animate-spin rounded-full border-2"
           style="border-color:var(--color-brand);border-top-color:transparent" />
    </div>

    <template v-else-if="allLabels.length">
      <div class="flex gap-4">

        <!-- ── Chart ──────────────────────────────────────────────────────── -->
        <div class="flex-1 min-w-0">
          <apexchart
            type="area"
            height="190"
            :options="chartOptions"
            :series="chartSeries"
          />
        </div>

        <!-- ── Cards ──────────────────────────────────────────────────────── -->
        <div class="flex flex-col gap-3 shrink-0" style="width:160px">

          <!-- Tarjetas -->
          <div class="rounded-2xl p-4"
               style="background:var(--color-brand-light);border:1px solid var(--color-border)">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:var(--color-brand)" />
              <span class="text-[10px] font-semibold uppercase tracking-wider" style="color:var(--color-text-secondary)">Tarjetas</span>
            </div>
            <p class="font-mono text-[15px] font-bold leading-tight" style="color:var(--color-text-primary)">
              {{ formatCurrency(totalTarjetas) }}
            </p>
            <p class="text-[10px] mt-1.5 font-semibold"
               :style="{ color: pctTarjetas <= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
              {{ pctTarjetas > 0 ? '+' : '' }}{{ pctTarjetas.toFixed(1) }}%
              {{ pctTarjetas <= 0 ? '↓' : '↑' }}
            </p>
          </div>

          <!-- Cuentas -->
          <div class="rounded-2xl p-4"
               style="background:var(--color-success-bg);border:1px solid var(--color-border)">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:var(--color-success)" />
              <span class="text-[10px] font-semibold uppercase tracking-wider" style="color:var(--color-text-secondary)">Cuentas</span>
            </div>
            <p class="font-mono text-[15px] font-bold leading-tight" style="color:var(--color-text-primary)">
              {{ formatCurrency(totalCuentas) }}
            </p>
            <p class="text-[10px] mt-1.5 font-semibold"
               :style="{ color: pctCuentas >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
              {{ pctCuentas > 0 ? '+' : '' }}{{ pctCuentas.toFixed(1) }}%
              {{ pctCuentas >= 0 ? '↑' : '↓' }}
            </p>
          </div>

        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center py-10 text-center">
      <span class="material-symbols-outlined text-4xl mb-2"
            style="color:var(--color-border)">show_chart</span>
      <p class="text-xs" style="color:var(--color-text-muted)">Sin datos en este periodo</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useReportesStore } from '../stores/reportes'
import { formatCurrency }   from '../utils/currency'
import { useTheme }         from '../composables/useTheme'

const { isDark } = useTheme()
const apexTheme  = computed(() => isDark.value ? 'dark' : 'light')

const reportesStore = useReportesStore()

const PERIODOS = [
  { value: 'dia',    label: 'Día'    },
  { value: 'semana', label: 'Semana' },
  { value: 'mes',    label: 'Mes'    },
  { value: 'anio',   label: 'Año'    },
]
const PERIODO_LABELS = {
  dia:    'Últimos 30 días',
  semana: 'Últimas 12 semanas',
  mes:    'Últimos 12 meses',
  anio:   'Últimos 5 años',
}
const MESES_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const periodo = ref('mes')

watch(periodo, (p) => {
  reportesStore.fetchFlujo(p)
  reportesStore.fetchFlujoTarjetas(p)
}, { immediate: true })

const loading = computed(() =>
  reportesStore.flujo.loading || reportesStore.flujoTarjetas.loading
)

// ── Labels unificados ────────────────────────────────────────────────────────
const allLabels = computed(() => {
  const s = new Set([
    ...reportesStore.flujo.serie.map(r => r.label),
    ...reportesStore.flujoTarjetas.serie.map(r => r.label),
  ])
  return [...s].sort()
})

const tarjetasMap = computed(() => {
  const m = {}
  reportesStore.flujoTarjetas.serie.forEach(r => { m[r.label] = r.egresos })
  return m
})

const cuentasMap = computed(() => {
  const m = {}
  reportesStore.flujo.serie.forEach(r => { m[r.label] = r.ingresos })
  return m
})

// ── Totales ──────────────────────────────────────────────────────────────────
const totalTarjetas = computed(() =>
  Object.values(tarjetasMap.value).reduce((s, v) => s + v, 0)
)
const totalCuentas = computed(() =>
  Object.values(cuentasMap.value).reduce((s, v) => s + v, 0)
)

// % cambio: segunda mitad vs primera mitad del periodo
function pctChange(map, labels) {
  if (labels.length < 2) return 0
  const mid    = Math.floor(labels.length / 2)
  const first  = labels.slice(0, mid).reduce((s, l) => s + (map[l] || 0), 0)
  const second = labels.slice(mid).reduce((s, l)  => s + (map[l] || 0), 0)
  if (first === 0) return 0
  return ((second - first) / Math.abs(first)) * 100
}

const pctTarjetas = computed(() => pctChange(tarjetasMap.value, allLabels.value))
const pctCuentas  = computed(() => pctChange(cuentasMap.value,  allLabels.value))

// ── Formato eje X ────────────────────────────────────────────────────────────
function formatLabel(label) {
  if (periodo.value === 'dia') {
    const [, m, d] = label.split('-')
    return `${parseInt(d)} ${MESES_SHORT[parseInt(m) - 1]}`
  }
  if (periodo.value === 'semana') return `S${label.split('-')[1]}`
  if (periodo.value === 'mes') {
    const [, m] = label.split('-')
    return MESES_SHORT[parseInt(m) - 1]
  }
  return label
}

// ── ApexCharts ───────────────────────────────────────────────────────────────
const chartSeries = computed(() => [
  {
    name: 'Tarjetas',
    data: allLabels.value.map(l => +(tarjetasMap.value[l] || 0).toFixed(2)),
  },
  {
    name: 'Cuentas',
    data: allLabels.value.map(l => +(cuentasMap.value[l]  || 0).toFixed(2)),
  },
])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    background: 'transparent',
    toolbar: { show: false },
    zoom:    { enabled: false },
    animations: { enabled: true, easing: 'easeinout', speed: 500 },
  },
  theme: { mode: apexTheme.value },

  colors: ['#03246B', '#10B981'],

  stroke: {
    curve: 'smooth',
    width: 2,
  },

  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.2,
      opacityTo:   0.01,
      stops: [0, 95, 100],
    },
  },

  dataLabels: { enabled: false },
  markers: { size: 0, hover: { size: 5, sizeOffset: 2 } },

  xaxis: {
    categories: allLabels.value.map(l => formatLabel(l)),
    labels: {
      style: { colors: '#64748B', fontSize: '10px', fontFamily: 'inherit' },
      rotate: 0,
      hideOverlappingLabels: true,
    },
    axisBorder: { show: false },
    axisTicks:  { show: false },
    crosshairs: {
      stroke: { color: 'rgba(3,36,107,0.3)', dashArray: 4 },
    },
  },

  yaxis: {
    labels: {
      style: { colors: '#64748B', fontSize: '10px', fontFamily: 'inherit' },
      formatter: (val) => {
        const abs = Math.abs(val)
        if (abs >= 1_000_000) return '$' + (val / 1_000_000).toFixed(1) + 'M'
        if (abs >= 1_000)     return '$' + (val / 1_000).toFixed(0)     + 'K'
        return '$' + val.toFixed(0)
      },
    },
  },

  grid: {
    borderColor: '#E2E8F0',
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true  } },
    padding: { left: 4, right: 4 },
  },

  legend: { show: false },

  tooltip: {
    theme: apexTheme.value,
    shared: true,
    intersect: false,
    style: { fontSize: '11px', fontFamily: 'inherit' },
    custom: ({ series, dataPointIndex, w }) => {
      const label = w.globals.categoryLabels[dataPointIndex]
      const tarj  = series[0][dataPointIndex] || 0
      const cuen  = series[1][dataPointIndex] || 0
      return `<div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:10px;padding:10px 13px;font-size:11px;min-width:170px">
        <div style="color:var(--color-text-muted);margin-bottom:7px;font-weight:600;font-size:10px">${label}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
          <span style="width:8px;height:8px;border-radius:50%;background:#03246B;flex-shrink:0"></span>
          <span style="color:var(--color-brand);flex:1">Tarjetas</span>
          <span style="color:var(--color-text-primary);font-family:monospace">${formatCurrency(tarj)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="width:8px;height:8px;border-radius:50%;background:var(--color-success);flex-shrink:0"></span>
          <span style="color:var(--color-success);flex:1">Cuentas</span>
          <span style="color:var(--color-text-primary);font-family:monospace">${formatCurrency(cuen)}</span>
        </div>
      </div>`
    },
  },
}))
</script>
