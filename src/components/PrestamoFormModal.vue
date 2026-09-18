<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0"
        style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)"
        @click="close"
      />
      <div
        class="relative w-full max-w-md rounded-2xl p-6 shadow-card"
        style="background:var(--color-surface);border:1px solid var(--color-border)"
      >
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">
          {{ editData ? 'Editar préstamo' : 'Nuevo préstamo' }}
        </h2>

        <form class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Nombre del deudor</label>
            <input v-model="form.deudor_nombre" type="text" placeholder="Ej. Juan Pérez" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Contacto (opcional)</label>
            <input v-model="form.deudor_contacto" type="text" placeholder="Teléfono o correo" class="fintech-input w-full" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Capital ($)</label>
              <input v-model.number="form.capital" type="number" min="0.01" step="0.01" placeholder="1000.00" required class="fintech-input w-full" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Interés mensual (%)</label>
              <input v-model.number="form.tasa_display" type="number" min="0" max="100" step="0.01" placeholder="5" required class="fintech-input w-full" />
              <p class="mt-1 text-[10px]" style="color:var(--color-text-secondary)">Ej: 5 = 5% por mes</p>
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Fecha de inicio</label>
            <input v-model="form.fecha_inicio" type="date" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Cuenta de origen (de donde sale el dinero)</label>
            <select v-model.number="form.cuenta_id" required class="fintech-input w-full">
              <option value="" disabled>Selecciona una cuenta</option>
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select>
          </div>

          <!-- Resumen interés -->
          <div v-if="form.capital && form.tasa_display" class="rounded-lg px-4 py-3 text-xs" style="background:var(--color-surface-mid)">
            <p style="color:var(--color-text-secondary)">Interés mensual estimado:
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
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency } from '../utils/currency'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData:   { type: Object,  default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas = computed(() => cuentasStore.cuentas)

const form = ref({
  deudor_nombre:   '',
  deudor_contacto: '',
  capital:         '',
  tasa_display:    '',
  fecha_inicio:    new Date().toISOString().split('T')[0],
  cuenta_id:       '',
})
const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  errorMsg.value = ''
  saving.value   = false
  if (props.editData) {
    form.value = {
      deudor_nombre:   props.editData.deudor_nombre,
      deudor_contacto: props.editData.deudor_contacto || '',
      capital:         parseFloat(props.editData.capital),
      tasa_display:    parseFloat((parseFloat(props.editData.tasa_interes_mensual) * 100).toFixed(4)),
      fecha_inicio:    props.editData.fecha_inicio,
      cuenta_id:       props.editData.cuenta_id,
    }
  } else {
    form.value = { deudor_nombre: '', deudor_contacto: '', capital: '', tasa_display: '', fecha_inicio: new Date().toISOString().split('T')[0], cuenta_id: '' }
  }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  saving.value   = true
  errorMsg.value = ''
  try {
    const payload = {
      deudor_nombre:        form.value.deudor_nombre,
      deudor_contacto:      form.value.deudor_contacto || null,
      capital:              form.value.capital,
      tasa_interes_mensual: parseFloat((form.value.tasa_display / 100).toFixed(6)),
      fecha_inicio:         form.value.fecha_inicio,
      cuenta_id:            form.value.cuenta_id,
    }
    emit('saved', payload)
    close()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Error al guardar'
    saving.value   = false
  }
}
</script>
