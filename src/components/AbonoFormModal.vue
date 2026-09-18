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
        style="background:var(--color-surface);border:1px solid var(--color-border)"
      >
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">Registrar abono</h2>
        <p v-if="prestamo" class="mt-1 text-xs" style="color:var(--color-text-muted)">
          Deudor: <span style="color:var(--color-text-secondary)">{{ prestamo.deudor_nombre }}</span> —
          Saldo pendiente: <span class="font-mono" style="color:var(--color-alert)">{{ formatCurrency(prestamo.saldo_pendiente) }}</span>
        </p>

        <form class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Monto del abono ($)</label>
            <input v-model.number="form.monto" type="number" min="0.01" step="0.01" placeholder="100.00" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Fecha de pago</label>
            <input v-model="form.fecha_pago" type="date" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Nota (opcional)</label>
            <input v-model="form.nota" type="text" placeholder="Ej. Abono parcial mes de mayo" class="fintech-input w-full" />
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-ghost flex-1" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="btn-brand flex-1 disabled:opacity-50">
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
