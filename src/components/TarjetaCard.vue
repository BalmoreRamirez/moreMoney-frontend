<template>
  <div
    class="group relative cursor-pointer overflow-hidden rounded-2xl shadow-md transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl select-none"
    style="aspect-ratio:1.586;width:100%"
    :style="cardStyle"
    @click="$emit('click')"
  >
    <!-- Shine diagonal overlay -->
    <div
      class="pointer-events-none absolute inset-0"
      style="background:linear-gradient(125deg,rgba(255,255,255,0.13) 0%,rgba(255,255,255,0.04) 40%,rgba(0,0,0,0.10) 100%)"
    />

    <!-- Circle decoration top-right -->
    <div
      class="pointer-events-none absolute rounded-full"
      style="width:55%;height:55%;top:-18%;right:-15%;background:rgba(255,255,255,0.06)"
    />
    <!-- Circle decoration bottom-left -->
    <div
      class="pointer-events-none absolute rounded-full"
      style="width:65%;height:65%;bottom:-25%;left:-18%;background:rgba(0,0,0,0.10)"
    />

    <!-- All content in absolute layer -->
    <div class="absolute inset-0 flex flex-col justify-between p-[7%]">

      <!-- Top row: bank + actions -->
      <div class="flex items-start justify-between">
        <div class="min-w-0">
          <p class="text-[9px] font-bold uppercase tracking-[0.25em] truncate" style="color:rgba(255,255,255,0.50)">
            {{ tarjeta.banco }}
          </p>
          <p class="mt-0.5 text-[15px] font-bold text-white leading-tight truncate">
            {{ tarjeta.nombre }}
          </p>
        </div>

        <!-- Action buttons: visible on hover -->
        <div class="flex gap-1.5 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            class="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
            style="background:rgba(255,255,255,0.15)"
            title="Editar"
            @click.stop="$emit('edit', tarjeta)"
          >
            <span class="material-symbols-outlined text-[13px] text-white">edit</span>
          </button>
          <button
            class="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
            style="background:rgba(255,255,255,0.15)"
            title="Eliminar"
            @click.stop="$emit('delete', tarjeta)"
          >
            <span class="material-symbols-outlined text-[13px] text-white">delete</span>
          </button>
        </div>
      </div>

      <!-- Middle row: chip + number -->
      <div class="flex items-center gap-3">
        <!-- EMV chip (gold, with SIM-card grid) -->
        <div
          class="relative rounded overflow-hidden shrink-0"
          style="width:42px;height:30px;background:linear-gradient(135deg,#f5d060 0%,#c8960c 50%,#f5d060 100%)"
        >
          <!-- Chip grid lines -->
          <div
            class="absolute inset-0"
            style="background-image:
              repeating-linear-gradient(0deg,transparent,transparent 31%,rgba(0,0,0,0.12) 31%,rgba(0,0,0,0.12) 34%),
              repeating-linear-gradient(90deg,transparent,transparent 31%,rgba(0,0,0,0.12) 31%,rgba(0,0,0,0.12) 34%)"
          />
          <!-- Chip center contact -->
          <div
            class="absolute"
            style="inset:22% 20%;border-radius:2px;background:rgba(180,130,10,0.5)"
          />
        </div>
        <span class="font-mono text-[11px] tracking-[0.20em]" style="color:rgba(255,255,255,0.40)">
          •••• •••• •••• ••••
        </span>
      </div>

      <!-- Bottom row: amounts + network + bar -->
      <div>
        <!-- Amounts -->
        <div class="flex items-end justify-between mb-2">
          <div>
            <p class="text-[8px] font-semibold uppercase tracking-[0.20em] mb-0.5" style="color:rgba(255,255,255,0.45)">
              Disponible
            </p>
            <p class="font-mono font-bold leading-none text-white" style="font-size:clamp(14px,4cqw,20px)">
              {{ formatCurrency(tarjeta.saldo_disponible) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-[8px] font-semibold uppercase tracking-[0.20em] mb-0.5" style="color:rgba(255,255,255,0.45)">
              Límite
            </p>
            <p class="font-mono text-sm font-semibold leading-none" style="color:rgba(255,255,255,0.72)">
              {{ formatCurrency(tarjeta.limite_credito) }}
            </p>
          </div>
        </div>

        <!-- Usage bar -->
        <div class="h-1.5 w-full rounded-full overflow-hidden" style="background:rgba(255,255,255,0.12)">
          <div
            class="h-full rounded-full transition-all duration-700"
            :style="{ width: usagePercent + '%', background: usageColor }"
          />
        </div>
        <p class="mt-1 text-[8px] tabular-nums" style="color:rgba(255,255,255,0.35)">
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
  ['#0D2B2A', '#1B5C55'],   // verde esmeralda oscuro
  ['#1A0A3C', '#3B1A72'],   // púrpura oscuro
  ['#2D0E0E', '#6B2020'],   // rojo vino
  ['#1A150A', '#4A3510'],   // café oscuro
  ['#1C2537', '#2E3F5C'],   // gris acero
  ['#0E1C30', '#1E3550'],   // navy
]

function bankHash(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % GRADIENTS.length
}

const cardStyle = computed(() => {
  const [from, to] = GRADIENTS[bankHash(props.tarjeta.banco || '')]
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
