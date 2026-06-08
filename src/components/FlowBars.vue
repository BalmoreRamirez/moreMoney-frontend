<template>
  <div v-if="!hasData" class="flex flex-col items-center justify-center py-6 text-center">
    <span class="material-symbols-outlined text-3xl mb-2" style="color:rgba(148,163,184,0.2)">account_balance</span>
    <p class="text-xs text-slate-600">Sin cuentas registradas</p>
  </div>

  <div v-else class="space-y-5">
    <!-- Ingresos -->
    <div>
      <div class="flex justify-between text-xs mb-2">
        <div class="flex items-center gap-1.5">
          <span class="h-2 w-2 rounded-full shrink-0" style="background:#10B981" />
          <span class="text-slate-400">Ingresos</span>
        </div>
        <span class="font-mono font-semibold" style="color:#10B981">{{ formatCurrency(ingresos) }}</span>
      </div>
      <div class="progress-bar-track" style="height:8px">
        <div
          class="progress-bar-fill"
          style="transition:width 0.7s ease"
          :style="{ width: ingPct + '%' }"
        />
      </div>
    </div>

    <!-- Egresos -->
    <div>
      <div class="flex justify-between text-xs mb-2">
        <div class="flex items-center gap-1.5">
          <span class="h-2 w-2 rounded-full shrink-0" style="background:#DC2626" />
          <span class="text-slate-400">Egresos</span>
        </div>
        <span class="font-mono font-semibold" style="color:#DC2626">{{ formatCurrency(egresos) }}</span>
      </div>
      <div class="progress-bar-track" style="height:8px">
        <div
          class="h-full rounded-full"
          style="transition:width 0.7s ease"
          :style="{ width: egPct + '%', background: '#DC2626' }"
        />
      </div>
    </div>

    <!-- Neto -->
    <div class="border-t pt-4" style="border-color:rgba(255,255,255,0.06)">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span
            class="material-symbols-outlined text-[16px]"
            :style="{ color: netoColor }"
          >{{ neto >= 0 ? 'trending_up' : 'trending_down' }}</span>
          <span class="text-xs text-slate-400">Neto del mes</span>
        </div>
        <span class="font-mono text-xl font-bold" :style="{ color: netoColor }">
          {{ neto >= 0 ? '+' : '' }}{{ formatCurrency(neto) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '../utils/currency'

const props = defineProps({
  ingresos: { type: Number, default: 0 },
  egresos:  { type: Number, default: 0 },
  neto:     { type: Number, default: 0 },
  hasData:  { type: Boolean, default: false },
})

const maxVal   = computed(() => Math.max(props.ingresos, props.egresos, 1))
const ingPct   = computed(() => Math.min(100, (props.ingresos / maxVal.value) * 100))
const egPct    = computed(() => Math.min(100, (props.egresos  / maxVal.value) * 100))
const netoColor = computed(() => props.neto >= 0 ? '#10B981' : '#DC2626')
</script>
