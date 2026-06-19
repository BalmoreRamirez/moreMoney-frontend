<template>
  <div class="fintech-card p-5">
    <!-- Header + period tabs -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[16px]" style="color:#A78BFA">insights</span>
        <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Flujo en el tiempo</p>
      </div>
      <div class="flex rounded-lg overflow-hidden" style="border:1px solid rgba(255,255,255,0.08)">
        <button
          v-for="p in PERIODOS"
          :key="p.value"
          class="px-3 py-1.5 text-[10px] font-semibold transition-colors"
          :style="periodo === p.value
            ? 'background:rgba(167,139,250,0.15);color:#A78BFA'
            : 'color:#475569'"
          @click="periodo = p.value"
        >{{ p.label }}</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-10">
      <div class="h-6 w-6 animate-spin rounded-full border-2" style="border-color:#A78BFA;border-top-color:transparent" />
    </div>

    <template v-else-if="serie.length">
      <!-- Bar chart -->
      <div class="overflow-x-auto">
        <div :style="{ minWidth: serie.length > 15 ? serie.length * 20 + 'px' : 'auto' }">
          <div class="flex items-end gap-1" style="height:100px">
            <div
              v-for="(row, i) in serie"
              :key="i"
              class="flex-1 flex items-end gap-px relative"
              style="min-width:12px"
            >
              <!-- Hover tooltip -->
              <div class="absolute bottom-full mb-1 left-1/2 z-20 pointer-events-none opacity-0 hover-tooltip"
                   style="transform:translateX(-50%)">
                <div class="rounded-lg px-2 py-1.5 text-[10px] whitespace-nowrap shadow-lg"
                     style="background:#0A1628;border:1px solid rgba(255,255,255,0.12)">
                  <p class="text-slate-400 mb-0.5">{{ formatLabel(row.label) }}</p>
                  <p style="color:#10B981">↑ {{ formatCurrency(row.ingresos) }}</p>
                  <p style="color:#EF4444">↓ {{ formatCurrency(row.egresos) }}</p>
                </div>
              </div>

              <!-- Ingreso bar (green) -->
              <div
                class="flex-1 rounded-t-sm bar-col"
                style="background:#10B981;transition:height 0.4s ease;min-height:2px"
                :style="{ height: barPct(row.ingresos) + '%' }"
              />
              <!-- Egreso bar (red) -->
              <div
                class="flex-1 rounded-t-sm bar-col"
                style="background:#EF4444;transition:height 0.4s ease;min-height:2px"
                :style="{ height: barPct(row.egresos) + '%' }"
              />
            </div>
          </div>

          <!-- X-axis labels -->
          <div class="flex gap-1 mt-1">
            <div
              v-for="(row, i) in serie"
              :key="i"
              class="flex-1 text-center overflow-hidden"
              style="min-width:12px;font-size:8px;color:#334155;white-space:nowrap"
            >
              <template v-if="shouldShowLabel(i)">{{ formatLabel(row.label) }}</template>
            </div>
          </div>
        </div>
      </div>

      <!-- Totals + legend -->
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-3 border-t"
           style="border-color:rgba(255,255,255,0.06)">
        <div>
          <p class="text-[10px] text-slate-600">Ingresos</p>
          <p class="font-mono text-sm font-bold" style="color:#10B981">{{ formatCurrency(totalIngresos) }}</p>
        </div>
        <div>
          <p class="text-[10px] text-slate-600">Egresos</p>
          <p class="font-mono text-sm font-bold" style="color:#EF4444">{{ formatCurrency(totalEgresos) }}</p>
        </div>
        <div>
          <p class="text-[10px] text-slate-600">Neto</p>
          <p class="font-mono text-sm font-bold" :style="{ color: netoTotal >= 0 ? '#10B981' : '#EF4444' }">
            {{ formatCurrency(netoTotal) }}
          </p>
        </div>
        <div class="ml-auto flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-sm" style="background:#10B981" />
            <span class="text-[9px] text-slate-600">Ingreso</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-sm" style="background:#EF4444" />
            <span class="text-[9px] text-slate-600">Egreso</span>
          </div>
        </div>
      </div>

      <!-- Category breakdown -->
      <div v-if="categorias.length" class="mt-5">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-3">Desglose por categoría</p>
        <div class="space-y-2.5">
          <div v-for="cat in categorias" :key="cat.categoria" class="flex items-center gap-2">
            <span
              class="text-[10px] text-slate-500 shrink-0"
              style="width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
            >{{ catLabel(cat.categoria) }}</span>
            <div class="flex-1 flex gap-px" style="height:7px">
              <div
                v-if="cat.ingresos > 0"
                style="background:#10B981;transition:width 0.5s ease;min-width:2px;border-radius:2px 0 0 2px"
                :style="{ width: catPct(cat.ingresos) + '%' }"
              />
              <div
                v-if="cat.egresos > 0"
                style="background:#EF4444;transition:width 0.5s ease;min-width:2px;border-radius:0 2px 2px 0"
                :style="{ width: catPct(cat.egresos) + '%' }"
              />
            </div>
            <div class="text-right shrink-0" style="font-size:9px;width:90px">
              <span v-if="cat.egresos > 0" style="color:#EF4444">-{{ formatCurrency(cat.egresos) }}</span>
              <span v-if="cat.ingresos > 0 && cat.egresos > 0" style="color:#334155"> / </span>
              <span v-if="cat.ingresos > 0" style="color:#10B981">+{{ formatCurrency(cat.ingresos) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="flex flex-col items-center py-10 text-center">
      <span class="material-symbols-outlined text-4xl mb-2" style="color:rgba(167,139,250,0.2)">bar_chart</span>
      <p class="text-xs text-slate-500">Sin transacciones en este periodo</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useReportesStore }     from '../stores/reportes'
import { formatCurrency }       from '../utils/currency'

const reportesStore = useReportesStore()

const PERIODOS = [
  { value: 'dia',    label: 'Día' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes',    label: 'Mes' },
  { value: 'anio',   label: 'Año' },
]

const MESES_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const CAT_LABELS = {
  sueldo:            'Sueldo',
  inversion:         'Inversión',
  cobro_inversion:   'Cobro inversión',
  prestamo:          'Préstamo',
  abono_prestamo:    'Abono préstamo',
  ganancia_prestamo: 'Ganancia prest.',
  manual:            'Manual',
  transferencia:     'Transferencia',
  otro:              'Otro',
}

const periodo = ref('mes')

watch(periodo, (p) => reportesStore.fetchFlujo(p), { immediate: true })

const loading    = computed(() => reportesStore.flujo.loading)
const serie      = computed(() => reportesStore.flujo.serie)
const categorias = computed(() => reportesStore.flujo.categorias)

const maxVal = computed(() =>
  Math.max(...serie.value.map(r => r.ingresos), ...serie.value.map(r => r.egresos), 1)
)

const catMaxVal = computed(() =>
  Math.max(...categorias.value.map(c => c.ingresos + c.egresos), 1)
)

const totalIngresos = computed(() => serie.value.reduce((s, r) => s + r.ingresos, 0))
const totalEgresos  = computed(() => serie.value.reduce((s, r) => s + r.egresos,  0))
const netoTotal     = computed(() => totalIngresos.value - totalEgresos.value)

function barPct(val) {
  if (!val) return 2
  return Math.max(2, Math.round((val / maxVal.value) * 98))
}

function catPct(val) {
  if (!val) return 0
  return Math.max(1, Math.round((val / catMaxVal.value) * 100))
}

function shouldShowLabel(i) {
  if (periodo.value === 'dia') return i % 5 === 0 || i === serie.value.length - 1
  return true
}

function formatLabel(label) {
  if (periodo.value === 'dia') {
    const parts = label.split('-')
    return `${parseInt(parts[2])} ${MESES_SHORT[parseInt(parts[1]) - 1]}`
  }
  if (periodo.value === 'semana') {
    const parts = label.split('-')
    return `S${parts[1]}`
  }
  if (periodo.value === 'mes') {
    const parts = label.split('-')
    return MESES_SHORT[parseInt(parts[1]) - 1]
  }
  return label
}

function catLabel(cat) {
  return CAT_LABELS[cat] || cat
}
</script>

<style scoped>
.bar-col { cursor: default; }

.bar-col:hover ~ .hover-tooltip,
.bar-col:hover + .bar-col ~ .hover-tooltip {
  opacity: 1;
}
</style>
