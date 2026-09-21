<template>
  <div class="fintech-card p-5">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="text-sm font-semibold" style="color:var(--color-text-primary)">Gasto mensual por tarjeta</h3>
        <p class="text-[10px] mt-0.5" style="color:var(--color-text-muted)">Últimos {{ mesesOpcion }} meses</p>
      </div>
      <div class="flex gap-1">
        <button
          v-for="m in [3, 6, 12]"
          :key="m"
          class="rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors"
          :style="mesesOpcion === m
            ? 'background:var(--color-brand-light);color:var(--color-brand)'
            : 'color:var(--color-text-secondary)'"
          @click="setMeses(m)"
        >{{ m }}m</button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="h-5 w-5 animate-spin rounded-full border-2" style="border-color:var(--color-brand);border-top-color:transparent" />
    </div>

    <div v-else-if="!tarjetas.length" class="flex flex-col items-center py-10 text-center">
      <span class="material-symbols-outlined text-4xl mb-2" style="color:var(--color-border)">credit_card_off</span>
      <p class="text-xs" style="color:var(--color-text-muted)">Sin tarjetas registradas</p>
    </div>

    <div v-else-if="!hasData" class="flex flex-col items-center py-10 text-center">
      <span class="material-symbols-outlined text-4xl mb-2" style="color:var(--color-border)">show_chart</span>
      <p class="text-xs" style="color:var(--color-text-muted)">Sin gastos en este periodo</p>
    </div>

    <template v-else>
      <div class="flex gap-4">
        <!-- Chart -->
        <div class="flex-1 min-w-0">
          <apexchart
            type="area"
            height="200"
            :options="chartOptions"
            :series="chartSeries"
          />
        </div>

        <!-- Leyenda + totales -->
        <div class="flex flex-col gap-2 shrink-0" style="width:148px">
          <div
            v-for="(t, i) in tarjetas"
            :key="t.id"
            class="rounded-xl p-3"
            :style="`background:${hexToRgba(COLORS[i % COLORS.length], 0.08)};border:1px solid ${hexToRgba(COLORS[i % COLORS.length], 0.2)}`"
          >
            <div class="flex items-center gap-1.5 mb-1.5">
              <span class="h-2 w-2 rounded-full shrink-0" :style="`background:${COLORS[i % COLORS.length]}`" />
              <span class="text-[10px] font-semibold truncate uppercase tracking-wider" style="color:var(--color-text-secondary)">{{ t.nombre }}</span>
            </div>
            <p class="font-mono text-[13px] font-bold" style="color:var(--color-text-primary)">{{ formatCurrency(totalTarjeta(t)) }}</p>
            <p class="text-[9px] mt-0.5" style="color:var(--color-text-muted)">total {{ mesesOpcion }}m</p>
          </div>
        </div>
      </div>

      <!-- Desglose normales vs cuotas (mes actual) -->
      <div class="mt-4 pt-4 border-t" style="border-color:var(--color-border)">
        <p class="text-[10px] font-semibold uppercase tracking-wider mb-3" style="color:var(--color-text-muted)">
          Composición este mes
        </p>
        <div class="space-y-3">
          <div v-for="t in tarjetas" :key="t.id">
            <div class="flex items-center justify-between text-[11px] mb-1">
              <span class="font-medium truncate mr-2" style="color:var(--color-text-secondary)">{{ t.nombre }}</span>
              <span class="font-mono font-semibold shrink-0" style="color:var(--color-brand)">
                {{ formatCurrency(mesActualNormales(t) + mesActualCuotas(t)) }}
              </span>
            </div>
            <div class="h-2 w-full rounded-full overflow-hidden" style="background:var(--color-border)">
              <div class="h-full flex rounded-full overflow-hidden">
                <div
                  class="h-full"
                  style="background:var(--color-brand);transition:width 0.6s ease"
                  :style="{ width: pctNormales(t) + '%' }"
                />
                <div
                  class="h-full"
                  style="background:var(--color-alert);transition:width 0.6s ease"
                  :style="{ width: pctCuotas(t) + '%' }"
                />
              </div>
            </div>
            <div class="flex gap-4 mt-1 text-[9px]" style="color:var(--color-text-muted)">
              <span><span class="font-semibold" style="color:var(--color-brand)">{{ formatCurrency(mesActualNormales(t)) }}</span> normales</span>
              <span><span class="font-semibold" style="color:var(--color-alert)">{{ formatCurrency(mesActualCuotas(t)) }}</span> cuotas</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useReportesStore } from '../stores/reportes'
import { formatCurrency }   from '../utils/currency'
import { useTheme }         from '../composables/useTheme'

const { isDark } = useTheme()
const apexTheme  = computed(() => isDark.value ? 'dark' : 'light')

const COLORS = ['#03246B', '#10B981', '#D97706', '#7C3AED', '#DC2626', '#0891B2']

const MESES_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const reportesStore = useReportesStore()

const mesesOpcion = ref(6)

function setMeses(m) {
  mesesOpcion.value = m
  reportesStore.fetchHistorialTarjetas(m)
}

watch(mesesOpcion, () => {}, { immediate: false })
reportesStore.fetchHistorialTarjetas(mesesOpcion.value)

const loading  = computed(() => reportesStore.historialTarjetas.loading)
const tarjetas = computed(() => reportesStore.historialTarjetas.tarjetas)
const meses    = computed(() => reportesStore.historialTarjetas.meses)

const hasData = computed(() =>
  tarjetas.value.some(t => t.totales.some(v => v > 0))
)

function totalTarjeta(t) {
  return t.totales.reduce((s, v) => s + v, 0)
}

// Último mes del historial = mes actual
function mesActualNormales(t) { return t.normales[t.normales.length - 1] || 0 }
function mesActualCuotas(t)   { return t.cuotas[t.cuotas.length - 1]   || 0 }

function pctNormales(t) {
  const total = mesActualNormales(t) + mesActualCuotas(t)
  if (!total) return 0
  return Math.round((mesActualNormales(t) / total) * 100)
}
function pctCuotas(t) {
  return 100 - pctNormales(t)
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function formatLabel(label) {
  const [, m] = label.split('-')
  return MESES_SHORT[parseInt(m) - 1]
}

const chartSeries = computed(() =>
  tarjetas.value.map((t, i) => ({
    name: t.nombre,
    data: t.totales.map(v => parseFloat(v.toFixed(2))),
  }))
)

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    background: 'transparent',
    toolbar: { show: false },
    zoom:    { enabled: false },
    animations: { enabled: true, easing: 'easeinout', speed: 500 },
  },
  colors: COLORS,
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.15, opacityTo: 0.01, stops: [0, 95, 100] },
  },
  dataLabels: { enabled: false },
  markers:    { size: 0, hover: { size: 4 } },
  xaxis: {
    categories: meses.value.map(l => formatLabel(l)),
    labels: {
      style: { colors: '#64748B', fontSize: '10px', fontFamily: 'inherit' },
      rotate: 0,
    },
    axisBorder: { show: false },
    axisTicks:  { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#94A3B8', fontSize: '10px', fontFamily: 'inherit' },
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
  theme:  { mode: apexTheme.value },
  tooltip: {
    theme: apexTheme.value,
    shared: true,
    intersect: false,
    style: { fontSize: '11px', fontFamily: 'inherit' },
    y: { formatter: (val) => formatCurrency(val) },
  },
}))
</script>
