<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close" @keydown.esc="close">
        <div
          class="absolute inset-0"
          style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)"
        />
      <div
        class="relative w-full max-w-md rounded-2xl p-6 shadow-card"
        style="background:var(--color-surface);border:1px solid var(--color-border)"
      >
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">Registrar venta</h2>
        <p class="mt-1 text-xs" style="color:var(--color-text-muted)">{{ inversion?.nombre }}</p>

        <div v-if="inversion" class="mt-3 rounded-lg px-4 py-2.5 text-xs" style="background:var(--color-surface-mid)">
          <span style="color:var(--color-text-muted)">Costo: </span>
          <span class="font-mono font-semibold" style="color:var(--color-text-secondary)">{{ formatCurrency(inversion.costo_total) }}</span>
        </div>

        <form novalidate class="mt-4 flex flex-col gap-4" @submit.prevent="submit">
          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model.number="form.precio_venta_total" id="float-VenderInversionModal-precio_venta_total" type="number" min="0.01" step="0.01" required class="fintech-input w-full" :class="{ 'p-filled': form.precio_venta_total !== '' && form.precio_venta_total != null }" @blur="v$.precio_venta_total.$touch()" /><label for="float-VenderInversionModal-precio_venta_total" class="text-xs" style="color:var(--color-text-muted)">Precio de venta total ($)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.precio_venta_total.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.precio_venta_total.$errors[0].$message }}</p>
            <p v-if="ganancia !== null" class="mt-1 text-xs" :style="{ color: ganancia >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
              Ganancia: {{ formatCurrency(ganancia) }}
            </p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model="form.fecha_venta" id="float-VenderInversionModal-fecha_venta" type="date" required class="fintech-input w-full" :class="{ 'p-filled': form.fecha_venta !== '' && form.fecha_venta != null }" @blur="v$.fecha_venta.$touch()" /><label for="float-VenderInversionModal-fecha_venta" class="text-xs" style="color:var(--color-text-muted)">Fecha de venta<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.fecha_venta.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.fecha_venta.$errors[0].$message }}</p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><select v-model.number="form.cuenta_ingreso_id" id="float-VenderInversionModal-cuenta_ingreso_id" required class="fintech-input w-full" :class="{ 'p-filled': form.cuenta_ingreso_id !== '' && form.cuenta_ingreso_id != null }" @blur="v$.cuenta_ingreso_id.$touch()">
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select><label for="float-VenderInversionModal-cuenta_ingreso_id" class="text-xs" style="color:var(--color-text-muted)">Cuenta de ingreso (donde entra el dinero)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.cuenta_ingreso_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.cuenta_ingreso_id.$errors[0].$message }}</p>
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-ghost flex-1" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="btn-brand flex-1 disabled:opacity-50">
              {{ saving ? 'Guardando…' : 'Confirmar venta' }}
            </button>
          </div>
        </form>
      </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useVuelidate } from '@vuelidate/core'
import { buildFormRules } from '../utils/formValidation'
import { todayDateInput } from '../utils/dates'
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
const v$ = useVuelidate(buildFormRules(form, { positive: { precio_venta_total: 'El precio de venta' }, dates: { fecha_venta: 'La fecha de venta' }, required: { cuenta_ingreso_id: 'La cuenta de ingreso' } }), form)

const saving   = ref(false)
const errorMsg = ref('')

const ganancia = computed(() => {
  if (!props.inversion || !form.value.precio_venta_total) return null
  return parseFloat(form.value.precio_venta_total) - parseFloat(props.inversion.costo_total)
})

watch(() => props.modelValue, (open) => {
  if (!open) return
  v$.value.$reset()
  errorMsg.value = ''
  saving.value   = false
  form.value     = { precio_venta_total: '', fecha_venta: todayDateInput(), cuenta_ingreso_id: '' }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  if (!(await v$.value.$validate())) return
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

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
