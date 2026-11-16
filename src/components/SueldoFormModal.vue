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
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">{{ editData ? 'Editar sueldo' : 'Nuevo sueldo' }}</h2>

        <form novalidate class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model="form.nombre" id="float-SueldoFormModal-nombre" type="text" required class="fintech-input w-full" :class="{ 'p-filled': form.nombre !== '' && form.nombre != null }" @blur="v$.nombre.$touch()" /><label for="float-SueldoFormModal-nombre" class="text-xs" style="color:var(--color-text-muted)">Nombre<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.nombre.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.nombre.$errors[0].$message }}</p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model.number="form.monto" id="float-SueldoFormModal-monto" type="number" min="0.01" step="0.01" required class="fintech-input w-full" :class="{ 'p-filled': form.monto !== '' && form.monto != null }" @blur="v$.monto.$touch()" /><label for="float-SueldoFormModal-monto" class="text-xs" style="color:var(--color-text-muted)">Monto mensual ($)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.monto.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.monto.$errors[0].$message }}</p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model.number="form.dia_cobro" id="float-SueldoFormModal-dia_cobro" type="number" min="1" max="31" required class="fintech-input w-full" :class="{ 'p-filled': form.dia_cobro !== '' && form.dia_cobro != null }" @blur="v$.dia_cobro.$touch()" /><label for="float-SueldoFormModal-dia_cobro" class="text-xs" style="color:var(--color-text-muted)">Día de cobro (1–31)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.dia_cobro.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.dia_cobro.$errors[0].$message }}</p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><select v-model.number="form.cuenta_id" id="float-SueldoFormModal-cuenta_id" required class="fintech-input w-full" :class="{ 'p-filled': form.cuenta_id !== '' && form.cuenta_id != null }" @blur="v$.cuenta_id.$touch()">
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select><label for="float-SueldoFormModal-cuenta_id" class="text-xs" style="color:var(--color-text-muted)">Cuenta de ingreso<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.cuenta_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.cuenta_id.$errors[0].$message }}</p>
          </div>

          <div v-if="editData" class="flex items-center gap-2">
            <input id="chk-activo" v-model="form.activo" type="checkbox" class="h-4 w-4 rounded" />
            <label for="chk-activo" class="text-sm" style="color:var(--color-text-secondary)">Sueldo activo</label>
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-ghost flex-1" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="btn-brand flex-1 disabled:opacity-50">
              {{ saving ? 'Guardando…' : (editData ? 'Guardar cambios' : 'Crear sueldo') }}
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
import { ref, computed, watch } from 'vue'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency }  from '../utils/currency'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData:   { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas = computed(() => cuentasStore.cuentas)

const form     = ref({ nombre: '', monto: '', dia_cobro: '', cuenta_id: '', activo: true })
const v$ = useVuelidate(buildFormRules(form, { required: { nombre: 'El nombre', cuenta_id: 'La cuenta' }, positive: { monto: 'El monto mensual' }, integers: { dia_cobro: { label: 'El día de cobro', min: 1, max: 31 } } }), form)

const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  v$.value.$reset()
  errorMsg.value = ''
  if (props.editData) {
    form.value = {
      nombre:    props.editData.nombre,
      monto:     props.editData.monto,
      dia_cobro: props.editData.dia_cobro,
      cuenta_id: props.editData.cuenta_id,
      activo:    props.editData.activo,
    }
  } else {
    form.value = { nombre: '', monto: '', dia_cobro: '', cuenta_id: '', activo: true }
  }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  if (!(await v$.value.$validate())) return
  saving.value   = true
  errorMsg.value = ''
  try {
    const payload = { ...form.value }
    if (props.editData) payload.id = props.editData.id
    emit('saved', payload)
    close()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Error al guardar'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
