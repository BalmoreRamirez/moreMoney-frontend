<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close" @keydown.esc="close">
        <div
          class="absolute inset-0"
          style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)"
        />
      <div
        class="relative w-full max-w-lg rounded-2xl p-6 shadow-card overflow-y-auto max-h-[90vh]"
        style="background:var(--color-surface);border:1px solid var(--color-border)"
      >
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">Nuevo crédito recibido</h2>
        <p class="mt-1 text-xs" style="color:var(--color-text-secondary)">Préstamo que tú recibiste para cubrir un gasto.</p>

        <form novalidate class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model="form.nombre" id="float-CreditoFormModal-nombre" type="text" required class="fintech-input w-full" :class="{ 'p-filled': form.nombre !== '' && form.nombre != null }" @blur="v$.nombre.$touch()" /><label for="float-CreditoFormModal-nombre" class="text-xs" style="color:var(--color-text-secondary)">Nombre / descripción<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.nombre.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.nombre.$errors[0].$message }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model.number="form.capital" id="float-CreditoFormModal-capital" type="number" min="0.01" step="0.01" required class="fintech-input w-full" :class="{ 'p-filled': form.capital !== '' && form.capital != null }" @blur="v$.capital.$touch()" /><label for="float-CreditoFormModal-capital" class="text-xs" style="color:var(--color-text-secondary)">Capital recibido ($)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.capital.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.capital.$errors[0].$message }}</p>
            </div>
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model.number="form.num_cuotas" id="float-CreditoFormModal-num_cuotas" type="number" min="1" step="1" required class="fintech-input w-full" :class="{ 'p-filled': form.num_cuotas !== '' && form.num_cuotas != null }" @blur="v$.num_cuotas.$touch()" /><label for="float-CreditoFormModal-num_cuotas" class="text-xs" style="color:var(--color-text-secondary)">Número de cuotas<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.num_cuotas.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.num_cuotas.$errors[0].$message }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>

              <FloatLabel variant="on" class="block w-full"><select v-model="form.tipo_interes" id="float-CreditoFormModal-tipo_interes" required class="fintech-input w-full" :class="{ 'p-filled': form.tipo_interes !== '' && form.tipo_interes != null }" @blur="v$.tipo_interes.$touch()">
                <option value="simple">Interés simple</option>
                <option value="compuesto">Interés compuesto</option>
              </select><label for="float-CreditoFormModal-tipo_interes" class="text-xs" style="color:var(--color-text-secondary)">Tipo de interés<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.tipo_interes.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.tipo_interes.$errors[0].$message }}</p>
            </div>
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model.number="form.tasa_display" id="float-CreditoFormModal-tasa_display" type="number" min="0" max="100" step="0.01" required class="fintech-input w-full" :class="{ 'p-filled': form.tasa_display !== '' && form.tasa_display != null }" @blur="v$.tasa_display.$touch()" /><label for="float-CreditoFormModal-tasa_display" class="text-xs" style="color:var(--color-text-secondary)">Tasa mensual (%)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.tasa_display.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.tasa_display.$errors[0].$message }}</p>
              <p class="mt-1 text-[10px]" style="color:var(--color-text-secondary)">Ej: 3 = 3% por mes</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model="form.fecha_inicio" id="float-CreditoFormModal-fecha_inicio" type="date" required class="fintech-input w-full" :class="{ 'p-filled': form.fecha_inicio !== '' && form.fecha_inicio != null }" @blur="v$.fecha_inicio.$touch()" /><label for="float-CreditoFormModal-fecha_inicio" class="text-xs" style="color:var(--color-text-secondary)">Fecha de inicio<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.fecha_inicio.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.fecha_inicio.$errors[0].$message }}</p>
            </div>
            <div>

              <FloatLabel variant="on" class="block w-full"><select v-model.number="form.cuenta_id" id="float-CreditoFormModal-cuenta_id" required class="fintech-input w-full" :class="{ 'p-filled': form.cuenta_id !== '' && form.cuenta_id != null }" @blur="v$.cuenta_id.$touch()">
                <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select><label for="float-CreditoFormModal-cuenta_id" class="text-xs" style="color:var(--color-text-secondary)">Cuenta donde entra el dinero<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.cuenta_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.cuenta_id.$errors[0].$message }}</p>
            </div>
          </div>

          <!-- Propósito opcional -->
          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model="form.proposito_tipo" id="float-CreditoFormModal-proposito_tipo" type="text" class="fintech-input w-full" :class="{ 'p-filled': form.proposito_tipo !== '' && form.proposito_tipo != null }"  /><label for="float-CreditoFormModal-proposito_tipo" class="text-xs" style="color:var(--color-text-secondary)">Propósito (opcional)</label></FloatLabel>
          </div>

          <!-- Resumen de amortización -->
          <div v-if="resumen" class="rounded-xl px-4 py-3 text-xs space-y-1" style="background:var(--color-surface-mid);border:1px solid var(--color-border)">
            <p class="font-semibold mb-2" style="color:var(--color-text-secondary)">Resumen estimado</p>
            <div class="flex justify-between" style="color:var(--color-text-secondary)">
              <span>Cuota mensual</span>
              <span class="font-mono" style="color:var(--color-text-secondary)">{{ formatCurrency(resumen.installment) }}</span>
            </div>
            <div class="flex justify-between" style="color:var(--color-text-secondary)">
              <span>Total intereses</span>
              <span class="font-mono" style="color:var(--color-alert)">{{ formatCurrency(resumen.totalInterest) }}</span>
            </div>
            <div class="flex justify-between" style="color:var(--color-text-secondary)">
              <span>Total a pagar</span>
              <span class="font-mono font-semibold" style="color:var(--color-text-primary)">{{ formatCurrency(resumen.totalPayment) }}</span>
            </div>
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-ghost flex-1" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="btn-brand flex-1 disabled:opacity-50">
              {{ saving ? 'Guardando…' : 'Registrar crédito' }}
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
import { formatCurrency }  from '../utils/currency'
import { calculateCreditSchedule } from '../utils/creditSchedule'

const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit  = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas      = computed(() => cuentasStore.cuentas)

const today = todayDateInput()
const form  = ref({
  nombre:       '',
  capital:      '',
  tipo_interes: 'simple',
  tasa_display: '',
  num_cuotas:   '',
  fecha_inicio: today,
  cuenta_id:    '',
  proposito_tipo: '',
})
const v$ = useVuelidate(buildFormRules(form, { required: { nombre: 'El nombre', tipo_interes: 'El tipo de interés', cuenta_id: 'La cuenta' }, positive: { capital: 'El capital' }, ranges: { tasa_display: { label: 'La tasa de interés', min: 0, max: 100 } }, integers: { num_cuotas: { label: 'El número de cuotas', min: 1 } }, dates: { fecha_inicio: 'La fecha de inicio' } }), form)

const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  v$.value.$reset()
  saving.value   = false
  errorMsg.value = ''
  form.value     = { nombre: '', capital: '', tipo_interes: 'simple', tasa_display: '', num_cuotas: '', fecha_inicio: today, cuenta_id: '', proposito_tipo: '' }
})

const resumen = computed(() => {
  return calculateCreditSchedule({
    capital: parseFloat(form.value.capital),
    monthlyRate: parseFloat(form.value.tasa_display) / 100,
    installments: parseInt(form.value.num_cuotas),
    interestType: form.value.tipo_interes,
  })
})

function close() { emit('update:modelValue', false) }

async function submit() {
  if (!(await v$.value.$validate())) return
  saving.value   = true
  errorMsg.value = ''
  try {
    emit('saved', {
      nombre:         form.value.nombre,
      capital:        form.value.capital,
      tipo_interes:   form.value.tipo_interes,
      tasa_mensual:   parseFloat((form.value.tasa_display / 100).toFixed(6)),
      num_cuotas:     form.value.num_cuotas,
      fecha_inicio:   form.value.fecha_inicio,
      cuenta_id:      form.value.cuenta_id,
      proposito_tipo: form.value.proposito_tipo || null,
    })
    close()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Error al guardar'
    saving.value   = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
