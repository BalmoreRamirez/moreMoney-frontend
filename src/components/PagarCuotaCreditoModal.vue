<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close" @keydown.window.esc="close">
        <div
          class="absolute inset-0"
          style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)"
        />
      <div
        class="relative w-full max-w-sm rounded-2xl p-6 shadow-card"
        style="background:var(--color-surface);border:1px solid var(--color-border)"
      >
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">Pagar cuota</h2>

        <div v-if="cuota" class="mt-3 rounded-xl px-4 py-3 text-xs space-y-1.5" style="background:var(--color-surface-mid)">
          <div class="flex justify-between" style="color:var(--color-text-secondary)">
            <span>Cuota</span>
            <span style="color:var(--color-text-secondary)">{{ cuota.numero_cuota }} / {{ credito?.num_cuotas }}</span>
          </div>
          <div class="flex justify-between" style="color:var(--color-text-secondary)">
            <span>Capital</span>
            <span class="font-mono" style="color:var(--color-text-secondary)">{{ formatCurrency(cuota.capital_cuota) }}</span>
          </div>
          <div class="flex justify-between" style="color:var(--color-text-secondary)">
            <span>Interés</span>
            <span class="font-mono" style="color:var(--color-alert)">{{ formatCurrency(cuota.interes_cuota) }}</span>
          </div>
          <div class="flex justify-between pt-1" style="border-top:1px solid var(--color-border);color:var(--color-text-secondary)">
            <span class="font-semibold" style="color:var(--color-text-secondary)">Total a pagar</span>
            <span class="font-mono font-bold" style="color:var(--color-brand)">{{ formatCurrency(cuota.monto_total_cuota) }}</span>
          </div>
        </div>

        <form class="mt-4 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Cuenta de donde sale el pago</label>
            <select v-model.number="form.cuenta_pago_id" required class="fintech-input w-full">
              <option value="" disabled>Selecciona una cuenta</option>
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select>
          </div>

          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Fecha de pago</label>
            <input v-model="form.fecha_pago" type="date" required class="fintech-input w-full" />
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-ghost flex-1" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="btn-brand flex-1 disabled:opacity-50">
              {{ saving ? 'Procesando…' : 'Confirmar pago' }}
            </button>
          </div>
        </form>
      </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { computed }   from 'vue'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency }  from '../utils/currency'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  cuota:      { type: Object,  default: null },
  credito:    { type: Object,  default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas      = computed(() => cuentasStore.cuentas)

const form     = ref({ cuenta_pago_id: '', fecha_pago: '' })
const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  saving.value   = false
  errorMsg.value = ''
  form.value     = { cuenta_pago_id: '', fecha_pago: new Date().toISOString().split('T')[0] }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  saving.value   = true
  errorMsg.value = ''
  try {
    emit('saved', { ...form.value })
    close()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Error al procesar'
    saving.value   = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
