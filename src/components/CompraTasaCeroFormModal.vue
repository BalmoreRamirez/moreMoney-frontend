<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close">
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)" />

        <div class="relative w-full max-w-md rounded-2xl p-6 shadow-card" style="background:var(--color-surface);border:1px solid var(--color-border)">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-lg font-semibold" style="color:var(--color-text-primary)">
              {{ isEdit ? 'Editar compra tasa cero' : 'Nueva compra tasa cero' }}
            </h2>
            <button class="icon-btn" @click="close">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Aviso cuando hay cuotas pagadas -->
          <div v-if="isEdit && hasPaidCuotas" class="mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-xs" style="background:var(--color-alert-bg);border:1px solid var(--color-alert);color:var(--color-alert)">
            <span class="material-symbols-outlined text-[16px] shrink-0 mt-0.5">lock</span>
            <span>Tiene cuotas pagadas. Solo puedes editar la descripción.</span>
          </div>

          <form novalidate @submit.prevent="submit" class="space-y-4">
            <!-- Tarjeta -->
            <div>

              <FloatLabel variant="on" class="block w-full"><select v-model="form.tarjeta_id" id="float-CompraTasaCeroFormModal-tarjeta_id" class="fintech-input" :class="{ 'p-filled': form.tarjeta_id !== '' && form.tarjeta_id != null }" :disabled="isEdit && hasPaidCuotas" required @blur="v$.tarjeta_id.$touch()">
                <option v-for="t in tarjetas" :key="t.id" :value="t.id">
                  {{ t.nombre }} — {{ t.banco }}
                </option>
              </select><label for="float-CompraTasaCeroFormModal-tarjeta_id" class="text-xs" style="color:var(--color-text-muted)">Tarjeta<span v-if="!hasPaidCuotas" aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.tarjeta_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.tarjeta_id.$errors[0].$message }}</p>
              <p v-if="errors.tarjeta_id" class="mt-1 text-xs text-danger">{{ errors.tarjeta_id }}</p>
            </div>

            <!-- Nombre -->
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model.trim="form.nombre" id="float-CompraTasaCeroFormModal-nombre" type="text" class="fintech-input" :class="{ 'p-filled': form.nombre !== '' && form.nombre != null }" required @blur="v$.nombre.$touch()" /><label for="float-CompraTasaCeroFormModal-nombre" class="text-xs" style="color:var(--color-text-muted)">Descripción del producto<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.nombre.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.nombre.$errors[0].$message }}</p>
              <p v-if="errors.nombre" class="mt-1 text-xs text-danger">{{ errors.nombre }}</p>
            </div>

            <!-- Monto total + cuotas -->
            <div class="grid grid-cols-2 gap-3">
              <div>

                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm" style="color:var(--color-text-muted)">$</span>
                  <FloatLabel variant="on" class="block w-full"><input
                    v-model="form.monto_total" id="float-CompraTasaCeroFormModal-monto_total" type="number" step="0.01" min="0.01"
                    class="fintech-input pl-7 font-mono"
                    :class="[{ 'p-filled': form.monto_total !== '' && form.monto_total != null }, isEdit && hasPaidCuotas ? 'opacity-40 cursor-not-allowed' : '']"
                    :disabled="isEdit && hasPaidCuotas" required
                  @blur="v$.monto_total.$touch()" /><label for="float-CompraTasaCeroFormModal-monto_total" class="text-xs" style="color:var(--color-text-muted)">Monto total<span v-if="!hasPaidCuotas" aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.monto_total.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.monto_total.$errors[0].$message }}</p>
                </div>
                <p v-if="errors.monto_total" class="mt-1 text-xs text-danger">{{ errors.monto_total }}</p>
              </div>
              <div>

                <FloatLabel variant="on" class="block w-full"><input
                  v-model.number="form.total_cuotas" id="float-CompraTasaCeroFormModal-total_cuotas" type="number" min="1" max="60"
                  class="fintech-input"
                  :class="[{ 'p-filled': form.total_cuotas !== '' && form.total_cuotas != null }, isEdit && hasPaidCuotas ? 'opacity-40 cursor-not-allowed' : '']"
                  :disabled="isEdit && hasPaidCuotas" required
                @blur="v$.total_cuotas.$touch()" /><label for="float-CompraTasaCeroFormModal-total_cuotas" class="text-xs" style="color:var(--color-text-muted)">N° de cuotas<span v-if="!hasPaidCuotas" aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.total_cuotas.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.total_cuotas.$errors[0].$message }}</p>
                <p v-if="errors.total_cuotas" class="mt-1 text-xs text-danger">{{ errors.total_cuotas }}</p>
              </div>
            </div>

            <!-- Preview cuota mensual -->
            <div v-if="cuotaMensual" class="flex items-center justify-between rounded-xl px-4 py-3" style="background:var(--color-success-bg);border:1px solid var(--color-success-border)">
              <span class="text-xs" style="color:var(--color-text-muted)">Cuota mensual estimada</span>
              <span class="font-mono text-lg font-bold text-success">{{ cuotaMensual }}</span>
            </div>

            <!-- Fecha -->
            <div>

              <FloatLabel variant="on" class="block w-full"><input
                v-model="form.fecha_compra" id="float-CompraTasaCeroFormModal-fecha_compra" type="date"
                class="fintech-input"
                :class="[{ 'p-filled': form.fecha_compra !== '' && form.fecha_compra != null }, isEdit && hasPaidCuotas ? 'opacity-40 cursor-not-allowed' : '']"
                :disabled="isEdit && hasPaidCuotas"
                required
              @blur="v$.fecha_compra.$touch()" /><label for="float-CompraTasaCeroFormModal-fecha_compra" class="text-xs" style="color:var(--color-text-muted)">Fecha de compra<span v-if="!hasPaidCuotas" aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.fecha_compra.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.fecha_compra.$errors[0].$message }}</p>
              <p v-if="errors.fecha_compra" class="mt-1 text-xs text-danger">{{ errors.fecha_compra }}</p>
            </div>

            <div v-if="serverError" class="rounded-lg px-4 py-3 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger);border:1px solid var(--color-danger-border)">
              {{ serverError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" class="btn-ghost flex-1" @click="close">Cancelar</button>
              <button type="submit" :disabled="saving" class="btn-brand flex-1 disabled:opacity-50">
                {{ saving
                  ? (isEdit ? 'Guardando…' : 'Generando cuotas…')
                  : (isEdit ? 'Guardar cambios' : 'Crear y generar cuotas') }}
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
import { formatCurrency } from '../utils/currency'

const props = defineProps({
  modelValue:       Boolean,
  tarjetas:         { type: Array, default: () => [] },
  editData:         { type: Object, default: null },
  defaultTarjetaId: { type: [Number, String], default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const today = todayDateInput()
const EMPTY = { tarjeta_id: '', nombre: '', monto_total: '', total_cuotas: '', fecha_compra: today }

const form        = ref({ ...EMPTY })
const errors      = ref({})
const serverError = ref('')
const v$ = useVuelidate(buildFormRules(form, { conditionalRequired: { tarjeta_id: { label: 'La tarjeta', when: () => !hasPaidCuotas.value }, nombre: { label: 'La descripción', when: () => true }, fecha_compra: { label: 'La fecha de compra', when: () => !hasPaidCuotas.value } }, conditionalPositive: { monto_total: { label: 'El monto', when: () => !hasPaidCuotas.value } }, conditionalInteger: { total_cuotas: { label: 'El total de cuotas', min: 1, max: 60, when: () => !hasPaidCuotas.value } } }), form)

const saving      = ref(false)

const isEdit        = computed(() => !!props.editData)
const hasPaidCuotas = computed(() =>
  isEdit.value && (props.editData.cuotas || []).some(c => c.estado === 'pagada')
)

watch(() => props.modelValue, (open) => {
  if (!open) return
  v$.value.$reset()
  errors.value      = {}
  serverError.value = ''
  if (props.editData) {
    form.value = {
      tarjeta_id:   props.editData.tarjeta_id,
      nombre:       props.editData.nombre,
      monto_total:  props.editData.monto_total,
      total_cuotas: props.editData.total_cuotas,
      fecha_compra: (props.editData.fecha_compra ?? today).split('T')[0],
    }
  } else {
    form.value = { ...EMPTY, tarjeta_id: props.defaultTarjetaId ?? '' }
  }
})

const cuotaMensual = computed(() => {
  const m = parseFloat(form.value.monto_total)
  const n = parseInt(form.value.total_cuotas)
  if (!m || !n || m <= 0 || n < 1) return null
  return formatCurrency(m / n)
})

function close() { emit('update:modelValue', false) }

async function submit() {
  if (!(await v$.value.$validate())) return
  saving.value      = true
  serverError.value = ''
  try {
    emit('saved', { ...form.value })
    close()
  } catch (err) {
    serverError.value = err.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
