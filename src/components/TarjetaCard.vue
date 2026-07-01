<template>
  <div
    class="group relative cursor-pointer overflow-hidden rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg select-none"
    style="height:168px;width:100%"
    :style="cardStyle"
    @click="$emit('click')"
  >
    <!-- Shine overlay -->
    <div
      class="pointer-events-none absolute inset-0"
      style="background:linear-gradient(120deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.02) 45%,rgba(0,0,0,0.12) 100%)"
    />
    <!-- Single subtle circle top-right -->
    <div
      class="pointer-events-none absolute rounded-full"
      style="width:200px;height:200px;top:-70px;right:-55px;background:rgba(255,255,255,0.05)"
    />

    <!-- Content -->
    <div class="absolute inset-0 flex flex-col justify-between p-5">

      <!-- Top: bank label + name + actions -->
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="text-[8px] font-bold uppercase tracking-[0.22em] truncate" style="color:rgba(255,255,255,0.42)">
            {{ tarjeta.banco }}
          </p>
          <p class="mt-0.5 text-[13px] font-bold text-white leading-snug truncate">
            {{ tarjeta.nombre }}
          </p>
        </div>

        <!-- Actions: appear on hover -->
        <div class="flex shrink-0 gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            class="flex h-6 w-6 items-center justify-center rounded-full"
            style="background:rgba(255,255,255,0.15)"
            title="Editar"
            @click.stop="$emit('edit', tarjeta)"
          >
            <span class="material-symbols-outlined text-[11px] text-white">edit</span>
          </button>
          <button
            class="flex h-6 w-6 items-center justify-center rounded-full"
            style="background:rgba(255,255,255,0.15)"
            title="Eliminar"
            @click.stop="$emit('delete', tarjeta)"
          >
            <span class="material-symbols-outlined text-[11px] text-white">delete</span>
          </button>
        </div>
      </div>

      <!-- Middle: chip + dots -->
      <div class="flex items-center gap-3">
        <!-- EMV chip -->
        <div
          class="relative shrink-0 overflow-hidden rounded"
          style="width:36px;height:26px;background:linear-gradient(135deg,#f5d060 0%,#c8960c 55%,#f5d060 100%)"
        >
          <div
            class="absolute inset-0"
            style="background-image:
              repeating-linear-gradient(0deg,transparent,transparent 28%,rgba(0,0,0,0.13) 28%,rgba(0,0,0,0.13) 35%),
              repeating-linear-gradient(90deg,transparent,transparent 28%,rgba(0,0,0,0.13) 28%,rgba(0,0,0,0.13) 35%)"
          />
        </div>
        <span class="font-mono text-[10px] tracking-[0.16em]" style="color:rgba(255,255,255,0.32)">
          •••• •••• •••• ••••
        </span>
      </div>

      <!-- Bottom: amounts + usage bar -->
      <div>
        <div class="flex items-end justify-between mb-1.5">
          <div>
            <p class="mb-0.5 text-[7px] font-semibold uppercase tracking-[0.18em]" style="color:rgba(255,255,255,0.38)">
              Disponible
            </p>
            <p class="font-mono text-[15px] font-bold leading-none text-white">
              {{ formatCurrency(tarjeta.saldo_disponible) }}
            </p>
          </div>
          <div class="text-right">
            <p class="mb-0.5 text-[7px] font-semibold uppercase tracking-[0.18em]" style="color:rgba(255,255,255,0.38)">
              Límite
            </p>
            <p class="font-mono text-xs font-medium leading-none" style="color:rgba(255,255,255,0.60)">
              {{ formatCurrency(tarjeta.limite_credito) }}
            </p>
          </div>
        </div>

        <!-- Usage bar -->
        <div class="h-1 w-full overflow-hidden rounded-full" style="background:rgba(255,255,255,0.10)">
          <div
            class="h-full rounded-full transition-all duration-700"
            :style="{ width: usagePercent + '%', background: usageColor }"
          />
        </div>
        <p class="mt-0.5 text-[7px] tabular-nums" style="color:rgba(255,255,255,0.28)">
          {{ usagePercent }}% utilizado
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '../utils/currency'

const props = defineProps({
  tarjeta: { type: Object, required: true },
})
defineEmits(['click', 'edit', 'delete'])

const GRADIENTS = [
  ['#0A1F3F', '#1A3A6B'],   // azul profundo
  ['#0C2D40', '#1B5B6E'],   // azul petróleo
  ['#0D2B2A', '#1B5C55'],   // verde esmeralda
  ['#1A0A3C', '#3B1A72'],   // púrpura
  ['#2D0E0E', '#6B2020'],   // rojo vino
  ['#1A150A', '#4A3510'],   // café oscuro
  ['#1C2537', '#2E3F5C'],   // gris acero
  ['#0E1C30', '#1E3550'],   // navy
]

function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % GRADIENTS.length
}

const cardStyle = computed(() => {
  // Use nombre for variety — banco can be the same for all cards of the same user
  const key = props.tarjeta.nombre || props.tarjeta.banco || ''
  const [from, to] = GRADIENTS[hashStr(key)]
  return { background: `linear-gradient(140deg, ${from} 0%, ${to} 100%)` }
})

const usagePercent = computed(() => {
  const lim = parseFloat(props.tarjeta.limite_credito)
  const gas = parseFloat(props.tarjeta.saldo_gastado)
  if (!lim) return 0
  return Math.min(100, Math.round((gas / lim) * 100))
})

const usageColor = computed(() => {
  if (usagePercent.value >= 90) return '#EF4444'
  if (usagePercent.value >= 70) return '#F59E0B'
  return '#34D399'
})
</script>
