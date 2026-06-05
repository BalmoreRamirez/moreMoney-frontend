<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0"
        style="background:rgba(7,17,31,0.8);backdrop-filter:blur(6px)"
        @click="close"
      />
      <div
        class="relative w-full max-w-md rounded-2xl p-6 shadow-card"
        style="background:#0D2240;border:1px solid rgba(255,255,255,0.1)"
      >
        <h2 class="text-base font-semibold text-white">Registrar venta</h2>
        <p class="mt-1 text-xs text-slate-400">{{ inversion?.nombre }}</p>

        <div v-if="inversion" class="mt-3 rounded-lg px-4 py-2.5 text-xs" style="background:rgba(255,255,255,0.04)">
          <span class="text-slate-500">Costo: </span>
          <span class="font-mono font-semibold text-slate-300">{{ formatCurrency(inversion.costo_total) }}</span>
        </div>

        <form class="mt-4 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Precio de venta total ($)</label>
            <input v-model.number="form.precio_venta_total" type="number" min="0.01" step="0.01" placeholder="200.00" required class="fintech-input w-full" />
            <p v-if="ganancia !== null" class="mt-1 text-xs" :style="{ color: ganancia >= 0 ? '#10B981' : '#DC2626' }">
              Ganancia: {{ formatCurrency(ganancia) }}
            </p>
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Fecha de venta</label>
            <input v-model="form.fecha_venta" type="date" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Cuenta de ingreso (donde entra el dinero)</label>
            <select v-model.number="form.cuenta_ingreso_id" required class="fintech-input w-full">
              <option value="" disabled>Selecciona una cuenta</option>
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} ({{ c.tipo }})</option>
            </select>
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50" style="background:#10B981">
              {{ saving ? 'Guardando…' : 'Confirmar venta' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency } from '../utils/currency'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  inversion:  { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas = computed(() => cuentasStore.cuentas)

const form     = ref({ precio_venta_total: '', fecha_venta: '', cuenta_ingreso_id: '' })
const saving   = ref(false)
const errorMsg = ref('')

const ganancia = computed(() => {
  if (!props.inversion || !form.value.precio_venta_total) return null
  return parseFloat(form.value.precio_venta_total) - parseFloat(props.inversion.costo_total)
})

watch(() => props.modelValue, (open) => {
  if (!open) return
  errorMsg.value = ''
  saving.value   = false
  form.value     = { precio_venta_total: '', fecha_venta: new Date().toISOString().split('T')[0], cuenta_ingreso_id: '' }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  saving.value   = true
  errorMsg.value = ''
  try {
    emit('saved', { ...form.value })
    close()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Error al registrar venta'
    saving.value   = false
  }
}
</script>
