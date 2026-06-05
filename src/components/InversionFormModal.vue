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
        <h2 class="text-base font-semibold text-white">Registrar inversión</h2>

        <form class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Nombre / Descripción</label>
            <input v-model="form.nombre" type="text" placeholder="Ej. Pantalones para reventa" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Costo total ($)</label>
            <input v-model.number="form.costo_total" type="number" min="0.01" step="0.01" placeholder="150.00" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Fecha de compra</label>
            <input v-model="form.fecha_compra" type="date" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Cuenta de egreso (donde sale el dinero)</label>
            <select v-model.number="form.cuenta_egreso_id" required class="fintech-input w-full">
              <option value="" disabled>Selecciona una cuenta</option>
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select>
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50" style="background:#10B981">
              {{ saving ? 'Guardando…' : 'Registrar inversión' }}
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
import { formatCurrency }  from '../utils/currency'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas = computed(() => cuentasStore.cuentas)

const today    = new Date().toISOString().split('T')[0]
const form     = ref({ nombre: '', costo_total: '', fecha_compra: today, cuenta_egreso_id: '' })
const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  errorMsg.value = ''
  saving.value   = false
  form.value     = { nombre: '', costo_total: '', fecha_compra: new Date().toISOString().split('T')[0], cuenta_egreso_id: '' }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  saving.value   = true
  errorMsg.value = ''
  try {
    emit('saved', { ...form.value })
    close()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Error al guardar'
    saving.value   = false
  }
}
</script>
