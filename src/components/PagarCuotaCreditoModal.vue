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
        <h2 class="text-base font-semibold text-slate-900">Pagar cuota</h2>

        <div v-if="cuota" class="mt-3 rounded-xl px-4 py-3 text-xs space-y-1.5" style="background:rgba(10,25,47,0.04)">
          <div class="flex justify-between text-slate-600">
            <span>Cuota</span>
            <span class="text-slate-600">{{ cuota.numero_cuota }} / {{ credito?.num_cuotas }}</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Capital</span>
            <span class="font-mono text-slate-600">{{ formatCurrency(cuota.capital_cuota) }}</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Interés</span>
            <span class="font-mono" style="color:#D97706">{{ formatCurrency(cuota.interes_cuota) }}</span>
          </div>
          <div class="flex justify-between text-slate-600 pt-1" style="border-top:1px solid #E8EDF5">
            <span class="font-semibold text-slate-600">Total a pagar</span>
            <span class="font-mono font-bold" style="color:#3B82F6">{{ formatCurrency(cuota.monto_total_cuota) }}</span>
          </div>
        </div>

        <form class="mt-4 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs text-slate-500">Cuenta de donde sale el pago</label>
            <select v-model.number="form.cuenta_pago_id" required class="fintech-input w-full">
              <option value="" disabled>Selecciona una cuenta</option>
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select>
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-500">Fecha de pago</label>
            <input v-model="form.fecha_pago" type="date" required class="fintech-input w-full" />
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50" style="background:#3B82F6">
              {{ saving ? 'Procesando…' : 'Confirmar pago' }}
            </button>
          </div>
        </form>
      </div>
    </div>
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
