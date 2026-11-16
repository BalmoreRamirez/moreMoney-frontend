<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)" @click="$emit('update:modelValue', false)" />

        <div class="relative w-full max-w-md rounded-2xl p-6" style="background:var(--color-surface);border:1px solid var(--color-border)">
          <h2 class="mb-5 text-base font-semibold" style="color:var(--color-text-primary)">
            {{ editData ? 'Editar cuenta' : 'Nueva cuenta' }}
          </h2>

          <form novalidate class="space-y-4" @submit.prevent="submit">
            <!-- Nombre -->
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model="form.nombre" id="float-CuentaFormModal-nombre" class="fintech-input" :class="{ 'p-filled': form.nombre !== '' && form.nombre != null }" required @blur="v$.nombre.$touch()" /><label for="float-CuentaFormModal-nombre" class="text-xs" style="color:var(--color-text-muted)">Nombre<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.nombre.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.nombre.$errors[0].$message }}</p>
            </div>

            <!-- Tipo -->
            <div>

              <FloatLabel variant="on" class="block w-full"><select v-model="form.tipo" id="float-CuentaFormModal-tipo" class="fintech-input" :class="{ 'p-filled': form.tipo !== '' && form.tipo != null }" required @blur="v$.tipo.$touch()">
                <option value="">Seleccionar tipo</option>
                <option value="banco">Banco</option>
                <option value="efectivo">Efectivo</option>
                <option value="digital">Digital</option>
              </select><label for="float-CuentaFormModal-tipo" class="text-xs" style="color:var(--color-text-muted)">Tipo<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.tipo.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.tipo.$errors[0].$message }}</p>
            </div>

            <!-- Saldo inicial (solo al crear) -->
            <div v-if="!editData">

              <FloatLabel variant="on" class="block w-full"><input
                v-model.number="form.saldo_inicial" id="float-CuentaFormModal-saldo_inicial"
                type="number"
                min="0"
                step="0.01"
                class="fintech-input" :class="{ 'p-filled': form.saldo_inicial !== '' && form.saldo_inicial != null }"
              @blur="v$.saldo_inicial.$touch()" /><label for="float-CuentaFormModal-saldo_inicial" class="text-xs" style="color:var(--color-text-muted)">Saldo inicial</label></FloatLabel>
            <p v-if="v$.saldo_inicial.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.saldo_inicial.$errors[0].$message }}</p>
              <p class="mt-1 text-[10px]" style="color:var(--color-text-muted)">El saldo actual se calculará sumando los movimientos sobre este valor.</p>
            </div>

            <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

            <div class="flex gap-3 pt-2">
              <button type="button" class="btn-ghost flex-1" @click="$emit('update:modelValue', false)">
                Cancelar
              </button>
              <button type="submit" class="btn-brand flex-1 disabled:opacity-50" :disabled="saving">
                {{ saving ? 'Guardando…' : 'Guardar' }}
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
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData:   { type: Object,  default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const form = ref({ nombre: '', tipo: '', saldo_inicial: 0 })
const v$ = useVuelidate(buildFormRules(form, { required: { nombre: 'El nombre', tipo: 'El tipo de cuenta' }, optionalRanges: { saldo_inicial: 'El saldo inicial' } }), form)

const saving  = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (v) => {
  if (v) {
    v$.value.$reset()
    errorMsg.value = ''
    if (props.editData) {
      form.value = { nombre: props.editData.nombre, tipo: props.editData.tipo, saldo_inicial: props.editData.saldo_inicial }
    } else {
      form.value = { nombre: '', tipo: '', saldo_inicial: 0 }
    }
  }
})

async function submit() {
  if (!(await v$.value.$validate())) return
  if (!form.value.nombre || !form.value.tipo) { errorMsg.value = 'Nombre y tipo son obligatorios.'; return }
  saving.value  = true
  errorMsg.value = ''
  try {
    emit('saved', { ...form.value, id: props.editData?.id })
    emit('update:modelValue', false)
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
