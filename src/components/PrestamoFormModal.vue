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
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">
          {{ editData ? 'Editar préstamo' : 'Nuevo préstamo' }}
        </h2>

        <form class="mt-5 flex flex-col gap-4" novalidate @submit.prevent="submit">
          <div class="flex flex-col gap-4">
            <div>
            <FloatLabel variant="on" class="block w-full">
              <select v-model="form.cliente_id" id="float-PrestamoFormModal-cliente_id" required class="fintech-input w-full" :class="{ 'p-filled': form.cliente_id !== '' && form.cliente_id != null }" :aria-invalid="v$.cliente_id.$error" @blur="v$.cliente_id.$touch()">
              <option value="nuevo">Registrar cliente nuevo…</option>
              <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre }}{{ c.contacto ? ` · ${c.contacto}` : '' }}</option>
              </select>
              <label for="float-PrestamoFormModal-cliente_id" class="text-xs" style="color:var(--color-text-muted)">Cliente <span aria-hidden="true" style="color:var(--color-danger)">*</span></label>
            </FloatLabel>
            <p v-if="v$.cliente_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.cliente_id.$errors[0].$message }}</p>
            </div>
            <template v-if="form.cliente_id === 'nuevo'">
              <div>
                <FloatLabel variant="on" class="block w-full"><input v-model="form.deudor_nombre" id="float-PrestamoFormModal-deudor_nombre" type="text" required class="fintech-input w-full" :class="{ 'p-filled': form.deudor_nombre !== '' && form.deudor_nombre != null }" :aria-invalid="v$.deudor_nombre.$error" @blur="v$.deudor_nombre.$touch()" /><label for="float-PrestamoFormModal-deudor_nombre" class="text-xs" style="color:var(--color-text-muted)">Nombre del cliente <span aria-hidden="true" style="color:var(--color-danger)">*</span></label></FloatLabel>
                <p v-if="v$.deudor_nombre.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.deudor_nombre.$errors[0].$message }}</p>
              </div>
              <FloatLabel variant="on" class="block w-full"><input v-model="form.cliente_contacto" id="float-PrestamoFormModal-cliente_contacto" type="text" class="fintech-input w-full" :class="{ 'p-filled': form.cliente_contacto !== '' && form.cliente_contacto != null }" /><label for="float-PrestamoFormModal-cliente_contacto" class="text-xs" style="color:var(--color-text-muted)">Contacto (opcional)</label></FloatLabel>
            </template>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model.number="form.capital" id="float-PrestamoFormModal-capital" type="number" min="0.01" step="0.01" required class="fintech-input w-full" :class="{ 'p-filled': form.capital !== '' && form.capital != null }" :aria-invalid="v$.capital.$error" @blur="v$.capital.$touch()" /><label for="float-PrestamoFormModal-capital" class="text-xs" style="color:var(--color-text-muted)">Capital ($)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
              <p v-if="v$.capital.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.capital.$errors[0].$message }}</p>
            </div>
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model.number="form.tasa_display" id="float-PrestamoFormModal-tasa_display" type="number" min="0" max="100" step="0.01" required class="fintech-input w-full" :class="{ 'p-filled': form.tasa_display !== '' && form.tasa_display != null }" :aria-invalid="v$.tasa_display.$error" @blur="v$.tasa_display.$touch()" /><label for="float-PrestamoFormModal-tasa_display" class="text-xs" style="color:var(--color-text-muted)">Interés total (%)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
              <p v-if="v$.tasa_display.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.tasa_display.$errors[0].$message }}</p>
              <p class="mt-1 text-[10px]" style="color:var(--color-text-secondary)">Ej: 5 = 5% una sola vez sobre el capital</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model="form.fecha_inicio" id="float-PrestamoFormModal-fecha_inicio" type="date" required class="fintech-input w-full" :class="{ 'p-filled': form.fecha_inicio !== '' && form.fecha_inicio != null }" :aria-invalid="v$.fecha_inicio.$error" @blur="v$.fecha_inicio.$touch()" /><label for="float-PrestamoFormModal-fecha_inicio" class="text-xs" style="color:var(--color-text-muted)">Fecha de inicio<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
              <p v-if="v$.fecha_inicio.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.fecha_inicio.$errors[0].$message }}</p>
            </div>
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model.number="form.dias_duracion" id="float-PrestamoFormModal-dias_duracion" type="number" min="1" step="1" required class="fintech-input w-full" :class="{ 'p-filled': form.dias_duracion !== '' && form.dias_duracion != null }" :aria-invalid="v$.dias_duracion.$error" @blur="v$.dias_duracion.$touch()" /><label for="float-PrestamoFormModal-dias_duracion" class="text-xs" style="color:var(--color-text-muted)">Duración (días)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
              <p v-if="v$.dias_duracion.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.dias_duracion.$errors[0].$message }}</p>
            </div>
          </div>

          <!-- Fecha fin preview -->
          <div v-if="fechaFin" class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs" style="background:var(--color-surface-mid)">
            <span class="material-symbols-outlined text-[15px]" style="color:var(--color-brand)">event</span>
            <span style="color:var(--color-text-muted)">Fecha de vencimiento estimada:</span>
            <span class="font-semibold font-mono" style="color:var(--color-text-primary)">{{ fechaFin }}</span>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><select v-model.number="form.cuenta_id" id="float-PrestamoFormModal-cuenta_id" required class="fintech-input w-full" :class="{ 'p-filled': form.cuenta_id !== '' && form.cuenta_id != null }" :aria-invalid="v$.cuenta_id.$error" @blur="v$.cuenta_id.$touch()">
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select><label for="float-PrestamoFormModal-cuenta_id" class="text-xs" style="color:var(--color-text-muted)">Cuenta de origen (de donde sale el dinero)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.cuenta_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.cuenta_id.$errors[0].$message }}</p>
          </div>

          <!-- Resumen interés -->
          <div v-if="form.capital && form.tasa_display" class="rounded-lg px-4 py-3 text-xs" style="background:var(--color-surface-mid)">
            <p style="color:var(--color-text-secondary)">Interés total estimado:
              <span class="font-mono font-semibold" style="color:var(--color-text-secondary)">
                {{ formatCurrency((form.capital * form.tasa_display / 100)) }}
              </span>
            </p>
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-ghost flex-1" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="btn-brand flex-1 disabled:opacity-50">
              {{ saving ? 'Guardando…' : editData ? 'Guardar cambios' : 'Registrar préstamo' }}
            </button>
          </div>
        </form>
      </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { todayDateInput } from '../utils/dates'
import { ref, reactive, computed, watch } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { decimal, helpers, integer, maxValue, minValue, required, requiredIf } from '@vuelidate/validators'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency } from '../utils/currency'
import api from '../utils/api'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData:   { type: Object,  default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas = computed(() => cuentasStore.cuentas)
const clientes = ref([])

const form = reactive({
  deudor_nombre:   '',
  cliente_contacto: '',
  cliente_id:      'nuevo',
  capital:         '',
  tasa_display:    '',
  fecha_inicio:    todayDateInput(),
  dias_duracion:   '',
  cuenta_id:       '',
})

const twoDecimalPlaces = helpers.withMessage(
  'Usa un máximo de dos decimales.',
  value => value === '' || value == null || Math.abs(Number(value) * 100 - Math.round(Number(value) * 100)) < 1e-8,
)
const rules = computed(() => ({
  cliente_id: {
    required: helpers.withMessage('Selecciona un cliente.', required),
  },
  deudor_nombre: {
    requiredIfNew: helpers.withMessage('El nombre del cliente es obligatorio.', requiredIf(() => form.cliente_id === 'nuevo')),
  },
  capital: {
    required: helpers.withMessage('El capital es obligatorio.', required),
    decimal: helpers.withMessage('Ingresa un capital válido.', decimal),
    minValue: helpers.withMessage('El capital debe ser mayor que cero.', minValue(0.01)),
    twoDecimalPlaces,
  },
  tasa_display: {
    required: helpers.withMessage('El interés total es obligatorio.', required),
    decimal: helpers.withMessage('Ingresa un porcentaje válido.', decimal),
    minValue: helpers.withMessage('El interés no puede ser menor que 0%.', minValue(0)),
    maxValue: helpers.withMessage('El interés no puede superar 100%.', maxValue(100)),
    twoDecimalPlaces,
  },
  fecha_inicio: {
    required: helpers.withMessage('La fecha de inicio es obligatoria.', required),
  },
  dias_duracion: {
    required: helpers.withMessage('La duración es obligatoria.', required),
    integer: helpers.withMessage('La duración debe ser un número entero de días.', integer),
    minValue: helpers.withMessage('La duración mínima es un día.', minValue(1)),
  },
  cuenta_id: {
    required: helpers.withMessage('Selecciona una cuenta de origen.', required),
  },
}))
const v$ = useVuelidate(rules, form)

const fechaFin = computed(() => {
  if (!form.fecha_inicio || !form.dias_duracion) return null
  const d = new Date(form.fecha_inicio + 'T00:00:00')
  d.setDate(d.getDate() + parseInt(form.dias_duracion) - 1)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
})
const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  errorMsg.value = ''
  saving.value   = false
  api.get('/clientes-prestamo', { params: { activo: true } }).then(({ data }) => {
    clientes.value = data.data || []
    const ligado = props.editData?.cliente
    if (ligado && !ligado.activo && !clientes.value.some(c => c.id === ligado.id)) clientes.value.push(ligado)
  }).catch(() => { clientes.value = [] })
  if (props.editData) {
    Object.assign(form, {
      deudor_nombre:   props.editData.deudor_nombre,
      cliente_contacto: props.editData.cliente?.contacto || '',
      cliente_id: props.editData.cliente_id || 'nuevo',
      capital:         parseFloat(props.editData.capital),
      tasa_display:    parseFloat((parseFloat(props.editData.tasa_interes_mensual) * 100).toFixed(4)),
      fecha_inicio:    props.editData.fecha_inicio,
      dias_duracion:   props.editData.dias_duracion ?? '',
      cuenta_id:       props.editData.cuenta_id,
    })
  } else {
    Object.assign(form, { deudor_nombre: '', cliente_contacto: '', cliente_id: 'nuevo', capital: '', tasa_display: '', fecha_inicio: todayDateInput(), dias_duracion: '', cuenta_id: '' })
  }
  v$.value.$reset()
})

function close() { emit('update:modelValue', false) }

async function submit() {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  saving.value   = true
  errorMsg.value = ''
  try {
    const payload = {
      deudor_nombre:        form.deudor_nombre,
      cliente_contacto:    form.cliente_contacto || null,
      cliente_id:           form.cliente_id === 'nuevo' ? null : form.cliente_id,
      capital:              form.capital,
      tasa_interes_mensual: parseFloat((form.tasa_display / 100).toFixed(6)),
      fecha_inicio:         form.fecha_inicio,
      dias_duracion:        parseInt(form.dias_duracion),
      cuenta_id:            form.cuenta_id,
    }
    emit('saved', payload)
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
