<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close">
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)" />

        <div class="relative w-full max-w-md rounded-2xl shadow-card" style="background:var(--color-surface);border:1px solid var(--color-border)">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 pb-4">
            <h2 class="text-lg font-semibold" style="color:var(--color-text-primary)">{{ ingreso ? 'Editar ingreso' : 'Nuevo ingreso' }}</h2>
            <button class="icon-btn" @click="close">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Form -->
          <form novalidate class="px-6 pb-6 space-y-4" @submit.prevent="submit">

            <div>

              <FloatLabel variant="on" class="block w-full"><input
                v-model="form.descripcion" id="float-IngresoFormModal-descripcion"
                type="text"
                class="fintech-input" :class="{ 'p-filled': form.descripcion !== '' && form.descripcion != null }"
                required
              @blur="v$.descripcion.$touch()" /><label for="float-IngresoFormModal-descripcion" class="text-xs" style="color:var(--color-text-secondary)">Descripción<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.descripcion.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.descripcion.$errors[0].$message }}</p>
            </div>

            <div>

              <FloatLabel variant="on" class="block w-full"><input
                v-model.number="form.monto" id="float-IngresoFormModal-monto"
                type="number"
                min="0.01"
                step="0.01"
                class="fintech-input" :class="{ 'p-filled': form.monto !== '' && form.monto != null }"
                required
              @blur="v$.monto.$touch()" /><label for="float-IngresoFormModal-monto" class="text-xs" style="color:var(--color-text-secondary)">Monto ($)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.monto.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.monto.$errors[0].$message }}</p>
            </div>

            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model="form.fecha" id="float-IngresoFormModal-fecha" type="date" class="fintech-input" :class="{ 'p-filled': form.fecha !== '' && form.fecha != null }" required @blur="v$.fecha.$touch()" /><label for="float-IngresoFormModal-fecha" class="text-xs" style="color:var(--color-text-secondary)">Fecha<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.fecha.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.fecha.$errors[0].$message }}</p>
            </div>

            <div>

              <FloatLabel variant="on" class="block w-full"><select v-model.number="form.cuenta_id" id="float-IngresoFormModal-cuenta_id" class="fintech-input" :class="{ 'p-filled': form.cuenta_id !== '' && form.cuenta_id != null }" required @blur="v$.cuenta_id.$touch()">
                <option v-for="c in cuentas" :key="c.id" :value="c.id">
                  {{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}
                </option>
              </select><label for="float-IngresoFormModal-cuenta_id" class="text-xs" style="color:var(--color-text-secondary)">Cuenta destino<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.cuenta_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.cuenta_id.$errors[0].$message }}</p>
            </div>

            <p v-if="errorMsg" class="text-sm" style="color:var(--color-danger)">{{ errorMsg }}</p>

            <div class="flex gap-3 pt-1">
              <button type="button" class="btn-ghost flex-1" @click="close">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="btn-brand flex-1 disabled:opacity-40"
              >
                {{ saving ? 'Guardando…' : (ingreso ? 'Guardar cambios' : 'Registrar ingreso') }}
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
  modelValue: Boolean,
  ingreso:    { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas      = computed(() => cuentasStore.cuentas)

const defaultForm = () => ({
  descripcion: '',
  monto:       null,
  fecha:       todayDateInput(),
  cuenta_id:   null,
})

const form     = ref(defaultForm())
const v$ = useVuelidate(buildFormRules(form, { required: { descripcion: 'La descripción', cuenta_id: 'La cuenta' }, positive: { monto: 'El monto' }, dates: { fecha: 'La fecha' } }), form)

const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, async (open) => {
  if (!open) return
  v$.value.$reset()
  errorMsg.value = ''
  form.value = props.ingreso
    ? { descripcion: props.ingreso.descripcion, monto: parseFloat(props.ingreso.monto), fecha: props.ingreso.fecha, cuenta_id: props.ingreso.cuenta_id }
    : defaultForm()
  if (!cuentasStore.cuentas.length) await cuentasStore.fetchCuentas()
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
    errorMsg.value = e?.response?.data?.error || 'Error al guardar'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
