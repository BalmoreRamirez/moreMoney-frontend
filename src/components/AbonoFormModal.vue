<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close">
        <div
          class="absolute inset-0"
          style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)"
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

        <form novalidate class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model.number="form.monto" id="float-AbonoFormModal-monto" type="number" min="0.01" step="0.01" required class="fintech-input w-full" :class="{ 'p-filled': form.monto !== '' && form.monto != null }" @blur="v$.monto.$touch()" /><label for="float-AbonoFormModal-monto" class="text-xs" style="color:var(--color-text-muted)">Monto del abono ($)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.monto.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.monto.$errors[0].$message }}</p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model="form.fecha_pago" id="float-AbonoFormModal-fecha_pago" type="date" required class="fintech-input w-full" :class="{ 'p-filled': form.fecha_pago !== '' && form.fecha_pago != null }" @blur="v$.fecha_pago.$touch()" /><label for="float-AbonoFormModal-fecha_pago" class="text-xs" style="color:var(--color-text-muted)">Fecha de pago<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.fecha_pago.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.fecha_pago.$errors[0].$message }}</p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model="form.nota" id="float-AbonoFormModal-nota" type="text" class="fintech-input w-full" :class="{ 'p-filled': form.nota !== '' && form.nota != null }"  /><label for="float-AbonoFormModal-nota" class="text-xs" style="color:var(--color-text-muted)">Nota (opcional)</label></FloatLabel>
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
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>

<script setup>
import { useVuelidate } from '@vuelidate/core'
import { buildFormRules } from '../utils/formValidation'
import { todayDateInput } from '../utils/dates'
import { ref, watch } from 'vue'
import { formatCurrency }    from '../utils/currency'
import { usePrestamosStore } from '../stores/prestamos'
import { useToast }          from '../composables/useToast'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  prestamo:   { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const prestamosStore = usePrestamosStore()
const toast          = useToast()

const form     = ref({ monto: '', fecha_pago: '', nota: '' })
const v$ = useVuelidate(buildFormRules(form, { positive: { monto: 'El monto' }, dates: { fecha_pago: 'La fecha de pago' } }), form)

const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  v$.value.$reset()
  errorMsg.value = ''
  saving.value   = false
  form.value     = { monto: '', fecha_pago: todayDateInput(), nota: '' }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  if (!(await v$.value.$validate())) return
  saving.value   = true
  errorMsg.value = ''
  try {
    await prestamosStore.registrarAbono(props.prestamo.id, { ...form.value })
    toast.success('Abono registrado')
    emit('saved')
    close()
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e.message || 'Error al registrar abono'
  } finally {
    saving.value = false
  }
}
</script>
