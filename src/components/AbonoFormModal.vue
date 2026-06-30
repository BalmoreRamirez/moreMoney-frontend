<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0"
        style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)"
        @click="close"
      />
      <div
        class="relative w-full max-w-sm rounded-2xl p-6 shadow-card"
        style="background:#FFFFFF;border:1px solid #E2E8F0"
      >
        <h2 class="text-base font-semibold text-slate-900">Registrar abono</h2>
        <p v-if="prestamo" class="mt-1 text-xs text-slate-500">
          Deudor: <span class="text-slate-600">{{ prestamo.deudor_nombre }}</span> —
          Saldo pendiente: <span class="font-mono" style="color:#D97706">{{ formatCurrency(prestamo.saldo_pendiente) }}</span>
        </p>

        <form class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs text-slate-500">Monto del abono ($)</label>
            <input v-model.number="form.monto" type="number" min="0.01" step="0.01" placeholder="100.00" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-500">Fecha de pago</label>
            <input v-model="form.fecha_pago" type="date" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-500">Nota (opcional)</label>
            <input v-model="form.nota" type="text" placeholder="Ej. Abono parcial mes de mayo" class="fintech-input w-full" />
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50" style="background:#10B981">
              {{ saving ? 'Guardando…' : 'Registrar abono' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { formatCurrency } from '../utils/currency'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  prestamo:   { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const form     = ref({ monto: '', fecha_pago: '', nota: '' })
const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  errorMsg.value = ''
  saving.value   = false
  form.value     = { monto: '', fecha_pago: new Date().toISOString().split('T')[0], nota: '' }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  saving.value   = true
  errorMsg.value = ''
  try {
    emit('saved', { ...form.value })
    close()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Error al registrar abono'
    saving.value   = false
  }
}
</script>
