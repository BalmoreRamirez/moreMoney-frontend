<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close" @keydown.esc="close">
        <div
          class="absolute inset-0"
          style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)"
        />
      <div
        class="relative w-full max-w-sm rounded-2xl p-6 shadow-card"
        style="background:var(--color-surface);border:1px solid var(--color-border)"
      >
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">Registrar cobro</h2>
        <p class="mt-1 text-xs" style="color:var(--color-text-muted)">{{ sueldo?.nombre }}</p>

        <form novalidate class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div class="grid grid-cols-2 gap-3">
            <div>

              <FloatLabel variant="on" class="block w-full"><select v-model.number="form.mes" id="float-CobrarSueldoModal-mes" required class="fintech-input w-full" :class="{ 'p-filled': form.mes !== '' && form.mes != null }" @blur="v$.mes.$touch()">
                <option v-for="(m, i) in MESES" :key="i" :value="i + 1">{{ m }}</option>
              </select><label for="float-CobrarSueldoModal-mes" class="text-xs" style="color:var(--color-text-muted)">Mes<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.mes.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.mes.$errors[0].$message }}</p>
            </div>
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model.number="form.anio" id="float-CobrarSueldoModal-anio" type="number" min="2000" max="2099" required class="fintech-input w-full" :class="{ 'p-filled': form.anio !== '' && form.anio != null }" @blur="v$.anio.$touch()" /><label for="float-CobrarSueldoModal-anio" class="text-xs" style="color:var(--color-text-muted)">Año<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.anio.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.anio.$errors[0].$message }}</p>
            </div>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model="form.fecha_cobro" id="float-CobrarSueldoModal-fecha_cobro" type="date" required class="fintech-input w-full" :class="{ 'p-filled': form.fecha_cobro !== '' && form.fecha_cobro != null }" @blur="v$.fecha_cobro.$touch()" /><label for="float-CobrarSueldoModal-fecha_cobro" class="text-xs" style="color:var(--color-text-muted)">Fecha de cobro<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.fecha_cobro.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.fecha_cobro.$errors[0].$message }}</p>
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-ghost flex-1" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="btn-brand flex-1 disabled:opacity-50">
              {{ saving ? 'Registrando…' : 'Confirmar cobro' }}
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
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  sueldo:     { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'confirmed'])

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const today = new Date()
const form     = ref({ mes: today.getMonth() + 1, anio: today.getFullYear(), fecha_cobro: todayDateInput(today) })
const v$ = useVuelidate(buildFormRules(form, { integers: { mes: { label: 'El mes', min: 1, max: 12 }, anio: { label: 'El año', min: 2000, max: 2099 } }, dates: { fecha_cobro: 'La fecha de cobro' } }), form)

const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  v$.value.$reset()
  errorMsg.value  = ''
  saving.value    = false
  const d         = new Date()
  form.value      = { mes: d.getMonth() + 1, anio: d.getFullYear(), fecha_cobro: todayDateInput(d) }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  if (!(await v$.value.$validate())) return
  saving.value   = true
  errorMsg.value = ''
  try {
    emit('confirmed', { ...form.value })
    close()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Error al registrar cobro'
    saving.value   = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
