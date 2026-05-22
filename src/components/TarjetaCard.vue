<template>
  <div
    class="relative flex h-48 w-full max-w-sm cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-card transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg select-none"
    :style="cardStyle"
    @click="$emit('click')"
  >
    <!-- Círculos decorativos del plástico -->
    <div class="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full opacity-10" style="background: white" />
    <div class="pointer-events-none absolute -bottom-12 -right-4 h-48 w-48 rounded-full opacity-[0.06]" style="background: white" />

    <!-- Fila superior: banco + acciones -->
    <div class="flex items-start justify-between">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">{{ tarjeta.banco }}</p>
        <p class="mt-0.5 text-base font-bold text-white">{{ tarjeta.nombre }}</p>
      </div>
      <div class="flex gap-2">
        <button
          class="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          @click.stop="$emit('edit', tarjeta)"
          title="Editar"
        >
          <span class="material-symbols-outlined text-[14px] text-white">edit</span>
        </button>
        <button
          class="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-red-500/40"
          @click.stop="$emit('delete', tarjeta)"
          title="Eliminar"
        >
          <span class="material-symbols-outlined text-[14px] text-white">delete</span>
        </button>
      </div>
    </div>

    <!-- Chip simulado -->
    <div class="flex items-center gap-3">
      <div class="h-7 w-10 rounded-sm" style="background: linear-gradient(135deg, #f0c040 0%, #c89520 100%); opacity: 0.85" />
      <span class="font-mono text-xs tracking-widest text-white/60">•••• •••• •••• ••••</span>
    </div>

    <!-- Fila inferior: saldos -->
    <div class="flex items-end justify-between">
      <div>
        <p class="text-[9px] uppercase tracking-widest opacity-60">Disponible</p>
        <p class="font-mono text-lg font-bold text-white">{{ formatCurrency(tarjeta.saldo_disponible) }}</p>
      </div>
      <div class="text-right">
        <p class="text-[9px] uppercase tracking-widest opacity-60">Límite</p>
        <p class="font-mono text-sm text-white/80">{{ formatCurrency(tarjeta.limite_credito) }}</p>
      </div>
    </div>

    <!-- Barra de uso del crédito -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
      <div
        class="h-full transition-all duration-700"
        :style="{ width: usagePercent + '%', background: usageColor }"
      />
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
  ['#0D47A1', '#1565C0'],
  ['#004B49', '#00695C'],
  ['#1B5E20', '#2E7D32'],
  ['#4A148C', '#6A1B9A'],
  ['#880E4F', '#AD1457'],
  ['#E65100', '#EF6C00'],
  ['#263238', '#37474F'],
  ['#1A237E', '#283593'],
]

function bankHash(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % GRADIENTS.length
}

const cardStyle = computed(() => {
  const [from, to] = GRADIENTS[bankHash(props.tarjeta.banco || '')]
  return { background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }
})

const usagePercent = computed(() => {
  const lim = parseFloat(props.tarjeta.limite_credito)
  const gas = parseFloat(props.tarjeta.saldo_gastado)
  if (!lim) return 0
  return Math.min(100, Math.round((gas / lim) * 100))
})

const usageColor = computed(() => {
  if (usagePercent.value >= 90) return '#DC2626'
  if (usagePercent.value >= 70) return '#F59E0B'
  return '#10B981'
})
</script>
