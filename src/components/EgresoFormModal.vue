<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close">
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)" />

        <div class="relative w-full max-w-md rounded-2xl shadow-card" style="background:var(--color-surface);border:1px solid var(--color-border)">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 pb-4">
            <h2 class="text-lg font-semibold" style="color:var(--color-text-primary)">{{ egreso ? 'Editar egreso' : 'Nuevo egreso' }}</h2>
            <button class="icon-btn" @click="close">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Form -->
          <form novalidate class="px-6 pb-6 space-y-4" @submit.prevent="submit">

            <!-- Descripción -->
            <div>

              <FloatLabel variant="on" class="block w-full"><input
                v-model="form.descripcion" id="float-EgresoFormModal-descripcion"
                type="text"
                class="fintech-input" :class="{ 'p-filled': form.descripcion !== '' && form.descripcion != null }"
                required
              @blur="v$.descripcion.$touch()" /><label for="float-EgresoFormModal-descripcion" class="text-xs" style="color:var(--color-text-secondary)">Descripción<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.descripcion.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.descripcion.$errors[0].$message }}</p>
            </div>

            <!-- Monto -->
            <div>

              <FloatLabel variant="on" class="block w-full"><input
                v-model.number="form.monto" id="float-EgresoFormModal-monto"
                type="number"
                min="0.01"
                step="0.01"
                class="fintech-input" :class="{ 'p-filled': form.monto !== '' && form.monto != null }"
                required
              @blur="v$.monto.$touch()" /><label for="float-EgresoFormModal-monto" class="text-xs" style="color:var(--color-text-secondary)">Monto<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.monto.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.monto.$errors[0].$message }}</p>
            </div>

            <!-- Fecha -->
            <div>

              <FloatLabel variant="on" class="block w-full"><input
                v-model="form.fecha" id="float-EgresoFormModal-fecha"
                type="date"
                class="fintech-input" :class="{ 'p-filled': form.fecha !== '' && form.fecha != null }"
                required
              @blur="v$.fecha.$touch()" /><label for="float-EgresoFormModal-fecha" class="text-xs" style="color:var(--color-text-secondary)">Fecha<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.fecha.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.fecha.$errors[0].$message }}</p>
            </div>

            <!-- Cuenta -->
            <div>

              <FloatLabel variant="on" class="block w-full"><select v-model.number="form.cuenta_id" id="float-EgresoFormModal-cuenta_id" class="fintech-input" :class="{ 'p-filled': form.cuenta_id !== '' && form.cuenta_id != null }" required @blur="v$.cuenta_id.$touch()">
                <option v-for="c in cuentas" :key="c.id" :value="c.id">
                  {{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}
                </option>
              </select><label for="float-EgresoFormModal-cuenta_id" class="text-xs" style="color:var(--color-text-secondary)">Cuenta<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.cuenta_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.cuenta_id.$errors[0].$message }}</p>
            </div>

            <!-- Error -->
            <p v-if="errorMsg" class="text-sm" style="color:var(--color-danger)">{{ errorMsg }}</p>

            <!-- Actions -->
            <div class="flex gap-3 pt-1">
              <button type="button" class="btn-ghost flex-1" @click="close">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                style="background:var(--color-danger)"
              >
                {{ saving ? 'Guardando…' : (egreso ? 'Guardar cambios' : 'Registrar egreso') }}
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
import { useEgresosStore }  from '../stores/egresos'
import { useCuentasStore }  from '../stores/cuentas'
import { formatCurrency }   from '../utils/currency'
import { useToast } from '../composables/useToast'

const props = defineProps({
  modelValue: Boolean,
  egreso:     { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const egresosStore = useEgresosStore()
const cuentasStore = useCuentasStore()
const toast        = useToast()
const cuentas      = computed(() => cuentasStore.cuentas)

const today = todayDateInput()

const defaultForm = () => ({
  descripcion: '',
  monto:       null,
  fecha:       today,
  cuenta_id:   null,
})

const form     = ref(defaultForm())
const v$ = useVuelidate(buildFormRules(form, { required: { descripcion: 'La descripción', cuenta_id: 'La cuenta' }, positive: { monto: 'El monto' }, dates: { fecha: 'La fecha' } }), form)

const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, async (open) => {
  if (open) {
    v$.value.$reset()
    errorMsg.value = ''
    if (props.egreso) {
      form.value = {
        descripcion: props.egreso.descripcion,
        monto:       parseFloat(props.egreso.monto),
        fecha:       (props.egreso.fecha ?? '').split('T')[0],
        cuenta_id:   props.egreso.cuenta_id,
      }
    } else {
      form.value = defaultForm()
    }
    if (!cuentasStore.cuentas.length) await cuentasStore.fetchCuentas()
  }
})

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  if (!(await v$.value.$validate())) return
  saving.value   = true
  errorMsg.value = ''
  try {
    if (props.egreso) {
      await egresosStore.updateEgreso(props.egreso.id, form.value)
      toast.success('Egreso actualizado')
    } else {
      await egresosStore.createEgreso(form.value)
      toast.success('Egreso registrado')
    }
    emit('saved')
    close()
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
