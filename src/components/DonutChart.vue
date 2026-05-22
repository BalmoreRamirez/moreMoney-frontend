<template>
  <div class="flex flex-col items-center">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" style="overflow:visible">
      <!-- Fondo del donut -->
      <circle
        :cx="center" :cy="center" :r="radius"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        :stroke-width="thickness"
      />

      <!-- Arco disponible (verde) — empieza en 12 en punto -->
      <circle
        v-if="disponiblePct > 0"
        :cx="center" :cy="center" :r="radius"
        fill="none"
        stroke="#10B981"
        :stroke-width="thickness"
        stroke-linecap="butt"
        :stroke-dasharray="`${disponibleLen} ${circumference}`"
        :transform="`rotate(-90, ${center}, ${center})`"
        style="transition:stroke-dasharray 0.7s ease"
      />

      <!-- Arco gastado — empieza donde termina el disponible -->
      <circle
        v-if="gastadoPct > 0"
        :cx="center" :cy="center" :r="radius"
        fill="none"
        :stroke="gastadoColor"
        :stroke-width="thickness"
        stroke-linecap="butt"
        :stroke-dasharray="`${gastadoLen} ${circumference}`"
        :transform="`rotate(${gastadoDeg}, ${center}, ${center})`"
        style="transition:stroke-dasharray 0.7s ease"
      />

      <!-- Texto central -->
      <text
        :x="center" :y="center - 10"
        text-anchor="middle"
        font-family="Roboto Mono, monospace"
        font-size="11"
        fill="#64748B"
      >Disponible</text>
      <text
        :x="center" :y="center + 14"
        text-anchor="middle"
        font-family="Roboto Mono, monospace"
        font-size="18"
        font-weight="700"
        :fill="disponibleColor"
      >{{ disponiblePct }}%</text>
    </svg>

    <!-- Leyenda -->
    <div class="mt-4 flex w-full max-w-[220px] flex-col gap-2">
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full" style="background:#10B981" />
          <span class="text-slate-400">Disponible</span>
        </div>
        <span class="font-mono font-semibold text-success">{{ formatCurrency(disponible) }}</span>
      </div>
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full" :style="{ background: gastadoColor }" />
          <span class="text-slate-400">Gastado</span>
        </div>
        <span class="font-mono font-semibold" :style="{ color: gastadoColor }">{{ formatCurrency(gastado) }}</span>
      </div>
      <div class="mt-1 flex items-center justify-between border-t pt-2 text-xs" style="border-color:rgba(255,255,255,0.08)">
        <span class="text-slate-400">Límite total</span>
        <span class="font-mono text-slate-300">{{ formatCurrency(limite) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '../utils/currency'

const props = defineProps({
  limite:     { type: Number, default: 0 },
  gastado:    { type: Number, default: 0 },
  disponible: { type: Number, default: 0 },
  size:       { type: Number, default: 176 },
  thickness:  { type: Number, default: 14 },
})

const center = computed(() => props.size / 2)
const radius = computed(() => center.value - props.thickness)
const circumference = computed(() => 2 * Math.PI * radius.value)

const gastadoPct    = computed(() => {
  if (!props.limite) return 0
  return Math.min(100, Math.round((props.gastado / props.limite) * 100))
})
const disponiblePct = computed(() => Math.max(0, 100 - gastadoPct.value))

// Longitud de cada arco
const disponibleLen = computed(() => (disponiblePct.value / 100) * circumference.value)
const gastadoLen    = computed(() => (gastadoPct.value / 100) * circumference.value)

// El arco gastado rota hasta el punto donde termina el disponible
const gastadoDeg = computed(() => -90 + (disponiblePct.value / 100) * 360)

const gastadoColor = computed(() => {
  if (gastadoPct.value >= 90) return '#DC2626'
  if (gastadoPct.value >= 70) return '#F59E0B'
  return '#4B5563'
})
const disponibleColor = computed(() => {
  if (disponiblePct.value <= 10) return '#DC2626'
  if (disponiblePct.value <= 30) return '#F59E0B'
  return '#10B981'
})
</script>
