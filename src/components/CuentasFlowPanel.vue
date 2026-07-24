<template>
  <div class="fintech-card p-5">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="text-sm font-semibold text-slate-700">Flujo por cuenta</h3>
        <p class="text-[10px] text-slate-500 mt-0.5">{{ MESES[mesActual - 1] }} {{ anioActual }}</p>
      </div>
      <div class="flex items-center gap-4 text-[10px] text-slate-500">
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-2 w-2 rounded-full" style="background:#10B981" />Ingresos
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-2 w-2 rounded-full" style="background:#DC2626" />Egresos
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-2 w-2 rounded-full" style="background:#6366F1" />Saldo
        </span>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="h-5 w-5 animate-spin rounded-full border-2" style="border-color:#10B981;border-top-color:transparent" />
    </div>

    <div v-else-if="!cuentas.length" class="flex flex-col items-center py-10 text-center">
      <span class="material-symbols-outlined text-4xl mb-2" style="color:rgba(16,185,129,0.15)">account_balance</span>
      <p class="text-xs text-slate-500">Sin cuentas registradas</p>
    </div>

    <template v-else>
      <apexchart
        type="bar"
        :height="chartHeight"
        :options="chartOptions"
        :series="chartSeries"
      />

    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency }  from '../utils/currency'

const props = defineProps({
  mesActual:  { type: Number, required: true },
  anioActual: { type: Number, required: true },
})

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const cuentasStore = useCuentasStore()
const loading = computed(() => cuentasStore.loading)
const cuentas = computed(() => cuentasStore.flujoCuentas?.data ?? [])

const chartHeight = computed(() => Math.max(160, cuentas.value.length * 55))

const chartSeries = computed(() => [
  { name: 'Ingresos', data: cuentas.value.map(c => parseFloat(c.ingresos.toFixed(2)))      },
  { name: 'Egresos',  data: cuentas.value.map(c => parseFloat(c.egresos.toFixed(2)))       },
  { name: 'Saldo',    data: cuentas.value.map(c => parseFloat(c.saldo_actual.toFixed(2)))  },
])

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    background: 'transparent',
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 500 },
  },
  plotOptions: {
    bar: {
      horizontal:   false,
      columnWidth:  cuentas.value.length === 1 ? '30%' : '55%',
      borderRadius: 5,
      dataLabels: { position: 'top' },
    },
  },
  colors: ['#10B981', '#DC2626', '#6366F1'],
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: {
    categories: cuentas.value.map(c => c.nombre),
    labels: {
      style: { colors: '#64748B', fontSize: '11px', fontFamily: 'inherit' },
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
    padding: { left: 0, right: 0, top: 0, bottom: 0 },
  },
  legend:      { show: false },
  theme:       { mode: 'light' },
  tooltip: {
    theme: 'light',
    shared: true,
    intersect: false,
    style: { fontSize: '11px', fontFamily: 'inherit' },
    y: { formatter: (val) => formatCurrency(val) },
  },
}))
</script>
