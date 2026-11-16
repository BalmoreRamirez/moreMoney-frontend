<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="$emit('update:modelValue', false)">
        <!-- Backdrop -->
        <div class="absolute inset-0" style="background: rgba(15,23,42,0.40); backdrop-filter: blur(6px)" />

        <!-- Panel -->
        <div class="relative w-full max-w-md rounded-2xl p-6 shadow-card" style="background:var(--color-surface);border:1px solid var(--color-border)">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-lg font-semibold" style="color:var(--color-text-primary)">
              {{ isEdit ? 'Editar Tarjeta' : 'Nueva Tarjeta' }}
            </h2>
            <button class="icon-btn" @click="$emit('update:modelValue', false)">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form novalidate @submit.prevent="submit" class="space-y-4">
            <!-- Nombre -->
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model.trim="form.nombre" id="float-TarjetaFormModal-nombre" type="text" class="fintech-input" :class="{ 'p-filled': form.nombre !== '' && form.nombre != null }" required @blur="v$.nombre.$touch()" /><label for="float-TarjetaFormModal-nombre" class="text-xs" style="color:var(--color-text-muted)">Nombre de la tarjeta<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.nombre.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.nombre.$errors[0].$message }}</p>
              <p v-if="errors.nombre" class="mt-1 text-xs text-danger">{{ errors.nombre }}</p>
            </div>

            <!-- Banco -->
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model.trim="form.banco" id="float-TarjetaFormModal-banco" type="text" class="fintech-input" :class="{ 'p-filled': form.banco !== '' && form.banco != null }" required @blur="v$.banco.$touch()" /><label for="float-TarjetaFormModal-banco" class="text-xs" style="color:var(--color-text-muted)">Banco emisor<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.banco.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.banco.$errors[0].$message }}</p>
              <p v-if="errors.banco" class="mt-1 text-xs text-danger">{{ errors.banco }}</p>
            </div>

            <!-- Límite de crédito -->
            <div>

              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm" style="color:var(--color-text-muted)">$</span>
                <FloatLabel variant="on" class="block w-full"><input
                  v-model="form.limite_credito" id="float-TarjetaFormModal-limite_credito"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="fintech-input pl-7 font-mono" :class="{ 'p-filled': form.limite_credito !== '' && form.limite_credito != null }"
                  required
                @blur="v$.limite_credito.$touch()" /><label for="float-TarjetaFormModal-limite_credito" class="text-xs" style="color:var(--color-text-muted)">Límite de crédito<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.limite_credito.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.limite_credito.$errors[0].$message }}</p>
              </div>
              <p v-if="errors.limite_credito" class="mt-1 text-xs text-danger">{{ errors.limite_credito }}</p>
            </div>

            <!-- Cuenta de pago por defecto -->
            <div>

              <FloatLabel variant="on" class="block w-full"><select v-model.number="form.cuenta_pago_id" id="float-TarjetaFormModal-cuenta_pago_id" class="fintech-input w-full" :class="{ 'p-filled': form.cuenta_pago_id !== '' && form.cuenta_pago_id != null }">
                <option :value="null">Sin cuenta predeterminada</option>
                <option v-for="c in cuentas" :key="c.id" :value="c.id">
                  {{ c.nombre }} ({{ c.tipo }})
                </option>
              </select><label for="float-TarjetaFormModal-cuenta_pago_id" class="text-xs" style="color:var(--color-text-muted)">Cuenta de pago (opcional)</label></FloatLabel>
              <p class="mt-1 text-xs" style="color:var(--color-text-muted)">Se usará por defecto al confirmar el pago de esta tarjeta.</p>
            </div>

            <!-- Días -->
            <div class="grid grid-cols-2 gap-3">
              <div>

                <FloatLabel variant="on" class="block w-full"><input
                  v-model.number="form.dia_corte" id="float-TarjetaFormModal-dia_corte"
                  type="number"
                  min="1"
                  max="31"
                  class="fintech-input" :class="{ 'p-filled': form.dia_corte !== '' && form.dia_corte != null }"
                  required
                @blur="v$.dia_corte.$touch()" /><label for="float-TarjetaFormModal-dia_corte" class="text-xs" style="color:var(--color-text-muted)">Día de corte<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.dia_corte.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.dia_corte.$errors[0].$message }}</p>
                <p v-if="errors.dia_corte" class="mt-1 text-xs text-danger">{{ errors.dia_corte }}</p>
              </div>
              <div>

                <FloatLabel variant="on" class="block w-full"><input
                  v-model.number="form.dia_pago" id="float-TarjetaFormModal-dia_pago"
                  type="number"
                  min="1"
                  max="31"
                  class="fintech-input" :class="{ 'p-filled': form.dia_pago !== '' && form.dia_pago != null }"
                  required
                @blur="v$.dia_pago.$touch()" /><label for="float-TarjetaFormModal-dia_pago" class="text-xs" style="color:var(--color-text-muted)">Día de pago<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.dia_pago.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.dia_pago.$errors[0].$message }}</p>
                <p v-if="errors.dia_pago" class="mt-1 text-xs text-danger">{{ errors.dia_pago }}</p>
              </div>
            </div>

            <!-- Error global -->
            <div v-if="serverError" class="rounded-lg px-4 py-3 text-sm" style="background: var(--color-danger-bg); color: var(--color-danger); border: 1px solid var(--color-danger-border)">
              {{ serverError }}
            </div>

            <!-- Acciones -->
            <div class="flex gap-3 pt-2">
              <button type="button" class="btn-ghost flex-1" @click="$emit('update:modelValue', false)">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="btn-brand flex-1 disabled:opacity-50"
              >
                {{ saving ? 'Guardando…' : (isEdit ? 'Actualizar' : 'Crear tarjeta') }}
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
import { ref, watch, computed } from 'vue'
import { useCuentasStore }   from '../stores/cuentas'
import { useTarjetasStore }  from '../stores/tarjetas'
import { useToast }          from '../composables/useToast'

const props = defineProps({
  modelValue: Boolean,
  tarjetaEdit: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const isEdit = computed(() => !!props.tarjetaEdit)

const cuentasStore  = useCuentasStore()
const tarjetasStore = useTarjetasStore()
const toast         = useToast()
const cuentas       = computed(() => cuentasStore.cuentas)

const EMPTY = { nombre: '', banco: '', limite_credito: '', dia_corte: '', dia_pago: '', cuenta_pago_id: null }
const form        = ref({ ...EMPTY })
const errors      = ref({})
const serverError = ref('')
const v$ = useVuelidate(buildFormRules(form, { required: { nombre: 'El nombre de la tarjeta', banco: 'El banco' }, positive: { limite_credito: 'El límite de crédito' }, integers: { dia_corte: { label: 'El día de corte', min: 1, max: 31 }, dia_pago: { label: 'El día de pago', min: 1, max: 31 } } }), form)

const saving      = ref(false)

watch(() => props.modelValue, async (open) => {
  if (open) {
    v$.value.$reset()
    if (!cuentasStore.cuentas.length) await cuentasStore.fetchCuentas()
    form.value  = props.tarjetaEdit
      ? { nombre: props.tarjetaEdit.nombre, banco: props.tarjetaEdit.banco,
          limite_credito: props.tarjetaEdit.limite_credito, dia_corte: props.tarjetaEdit.dia_corte,
          dia_pago: props.tarjetaEdit.dia_pago,
          cuenta_pago_id: props.tarjetaEdit.cuenta_pago_id ?? null }
      : { ...EMPTY }
    errors.value      = {}
    serverError.value = ''
  }
})

async function submit() {
  if (!(await v$.value.$validate())) return
  saving.value      = true
  serverError.value = ''
  try {
    if (props.tarjetaEdit) {
      await tarjetasStore.updateTarjeta(props.tarjetaEdit.id, form.value)
      toast.success('Tarjeta actualizada')
    } else {
      await tarjetasStore.createTarjeta(form.value)
      toast.success('Tarjeta creada')
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (err) {
    serverError.value = err?.response?.data?.error || err.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
