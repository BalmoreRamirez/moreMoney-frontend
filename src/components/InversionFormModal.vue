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
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">{{ editData ? 'Editar inversión' : 'Registrar inversión' }}</h2>

        <form novalidate class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model="form.nombre" id="float-InversionFormModal-nombre" type="text" required class="fintech-input w-full" :class="{ 'p-filled': form.nombre !== '' && form.nombre != null }" @blur="v$.nombre.$touch()" /><label for="float-InversionFormModal-nombre" class="text-xs" style="color:var(--color-text-muted)">Nombre / Descripción<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.nombre.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.nombre.$errors[0].$message }}</p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model.number="form.costo_total" id="float-InversionFormModal-costo_total" type="number" min="0.01" step="0.01" required class="fintech-input w-full" :class="{ 'p-filled': form.costo_total !== '' && form.costo_total != null }" @blur="v$.costo_total.$touch()" /><label for="float-InversionFormModal-costo_total" class="text-xs" style="color:var(--color-text-muted)">Costo total ($)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.costo_total.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.costo_total.$errors[0].$message }}</p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model="form.fecha_compra" id="float-InversionFormModal-fecha_compra" type="date" required class="fintech-input w-full" :class="{ 'p-filled': form.fecha_compra !== '' && form.fecha_compra != null }" @blur="v$.fecha_compra.$touch()" /><label for="float-InversionFormModal-fecha_compra" class="text-xs" style="color:var(--color-text-muted)">Fecha de compra<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.fecha_compra.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.fecha_compra.$errors[0].$message }}</p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input
              v-model.number="form.precio_esperado" id="float-InversionFormModal-precio_esperado"
              type="number" min="0.01" step="0.01"
              class="fintech-input w-full" :class="{ 'p-filled': form.precio_esperado !== '' && form.precio_esperado != null }"
            @blur="v$.precio_esperado.$touch()" /><label for="float-InversionFormModal-precio_esperado" class="text-xs" style="color:var(--color-text-muted)">Precio de venta esperado ($)
              (opcional)</label></FloatLabel>
            <p v-if="v$.precio_esperado.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.precio_esperado.$errors[0].$message }}</p>
            <p v-if="gananciaEsperada !== null" class="mt-1.5 text-xs" :style="gananciaEsperada >= 0 ? 'color:var(--color-success)' : 'color:var(--color-danger)'">
              Ganancia esperada: {{ formatCurrency(gananciaEsperada) }}
              ({{ gananciaEsperadaPct }}%)
            </p>
          </div>

          <div v-if="!editData">

            <FloatLabel variant="on" class="block w-full"><select v-model.number="form.cuenta_egreso_id" id="float-InversionFormModal-cuenta_egreso_id" required class="fintech-input w-full" :class="{ 'p-filled': form.cuenta_egreso_id !== '' && form.cuenta_egreso_id != null }" @blur="v$.cuenta_egreso_id.$touch()">
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select><label for="float-InversionFormModal-cuenta_egreso_id" class="text-xs" style="color:var(--color-text-muted)">Cuenta de egreso (donde sale el dinero)<span v-if="!editData" aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.cuenta_egreso_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.cuenta_egreso_id.$errors[0].$message }}</p>
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-ghost flex-1" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="btn-brand flex-1 disabled:opacity-50">
              {{ saving ? 'Guardando…' : editData ? 'Guardar cambios' : 'Registrar inversión' }}
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

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData:   { type: Object,  default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas = computed(() => cuentasStore.cuentas)

const today    = todayDateInput()
const form     = ref({ nombre: '', costo_total: '', precio_esperado: '', fecha_compra: today, cuenta_egreso_id: '' })
const v$ = useVuelidate(buildFormRules(form, { required: { nombre: 'El nombre' }, positive: { costo_total: 'El costo total' }, optionalPositive: { precio_esperado: 'El precio esperado' }, dates: { fecha_compra: 'La fecha de compra' }, conditionalRequired: { cuenta_egreso_id: { label: 'La cuenta de origen', when: () => !props.editData } } }), form)

const saving   = ref(false)
const errorMsg = ref('')

const gananciaEsperada = computed(() => {
  const costo    = parseFloat(form.value.costo_total)
  const esperado = parseFloat(form.value.precio_esperado)
  if (!form.value.precio_esperado || isNaN(costo) || isNaN(esperado)) return null
  return parseFloat((esperado - costo).toFixed(2))
})

const gananciaEsperadaPct = computed(() => {
  const costo = parseFloat(form.value.costo_total)
  if (!costo || gananciaEsperada.value === null) return 0
  return parseFloat(((gananciaEsperada.value / costo) * 100).toFixed(1))
})

watch(() => props.modelValue, (open) => {
  if (!open) return
  v$.value.$reset()
  errorMsg.value = ''
  saving.value   = false
  if (props.editData) {
    form.value = {
      nombre:          props.editData.nombre,
      costo_total:     props.editData.costo_total,
      precio_esperado: props.editData.precio_esperado ?? '',
      fecha_compra:    props.editData.fecha_compra,
      cuenta_egreso_id: '',
    }
  } else {
    form.value = { nombre: '', costo_total: '', precio_esperado: '', fecha_compra: todayDateInput(), cuenta_egreso_id: '' }
  }
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
    errorMsg.value = e.response?.data?.error || 'Error al guardar'
    saving.value   = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
