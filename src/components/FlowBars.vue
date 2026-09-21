<template>
  <div v-if="!hasData" class="flex flex-col items-center justify-center py-6 text-center">
    <span class="material-symbols-outlined text-3xl mb-2" style="color:var(--color-text-muted);opacity:0.3">account_balance</span>
    <p class="text-xs" style="color:var(--color-text-secondary)">Sin cuentas registradas</p>
  </div>

  <div v-else class="space-y-5">
    <!-- Ingresos -->
    <div>
      <div class="flex justify-between text-xs mb-2">
        <div class="flex items-center gap-1.5">
          <span class="h-2 w-2 rounded-full shrink-0" style="background:var(--color-success)" />
          <span style="color:var(--color-text-secondary)">Ingresos</span>
        </div>
        <span class="font-mono font-semibold" style="color:var(--color-success)">{{ formatCurrency(ingresos) }}</span>
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
          <span class="h-2 w-2 rounded-full shrink-0" style="background:var(--color-danger)" />
          <span style="color:var(--color-text-secondary)">Egresos</span>
        </div>
        <span class="font-mono font-semibold" style="color:var(--color-danger)">{{ formatCurrency(egresos) }}</span>
      </div>
      <div class="progress-bar-track" style="height:8px">
        <div
          class="h-full rounded-full"
          style="transition:width 0.7s ease;background:var(--color-danger)"
          :style="{ width: egPct + '%' }"
        />
      </div>
    </div>

    <!-- Neto -->
    <div class="border-t pt-4" style="border-color:var(--color-border)">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span
            class="material-symbols-outlined text-[16px]"
            :style="{ color: netoColor }"
          >{{ neto >= 0 ? 'trending_up' : 'trending_down' }}</span>
          <span class="text-xs" style="color:var(--color-text-secondary)">Neto del mes</span>
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
const netoColor = computed(() => props.neto >= 0 ? 'var(--color-success)' : 'var(--color-danger)')
</script>
