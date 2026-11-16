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

        <form class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Cliente</label>
            <select v-model="form.cliente_id" required class="fintech-input w-full">
              <option value="nuevo">Registrar cliente nuevo…</option>
              <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre }}{{ c.contacto ? ` · ${c.contacto}` : '' }}</option>
            </select>
            <template v-if="form.cliente_id === 'nuevo'">
              <input v-model="form.deudor_nombre" type="text" placeholder="Nombre del cliente" required class="fintech-input mt-2 w-full" />
              <input v-model="form.cliente_contacto" type="text" placeholder="Contacto (opcional)" class="fintech-input mt-2 w-full" />
            </template>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Capital ($)</label>
              <input v-model.number="form.capital" type="number" min="0.01" step="0.01" placeholder="1000.00" required class="fintech-input w-full" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Interés total (%)</label>
              <input v-model.number="form.tasa_display" type="number" min="0" max="100" step="0.01" placeholder="5" required class="fintech-input w-full" />
              <p class="mt-1 text-[10px]" style="color:var(--color-text-secondary)">Ej: 5 = 5% una sola vez sobre el capital</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Fecha de inicio</label>
              <input v-model="form.fecha_inicio" type="date" required class="fintech-input w-full" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Duración (días, opcional)</label>
              <input v-model.number="form.dias_duracion" type="number" min="1" step="1" placeholder="Ej: 30" class="fintech-input w-full" />
            </div>
          </div>

          <!-- Fecha fin preview -->
          <div v-if="fechaFin" class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs" style="background:var(--color-surface-mid)">
            <span class="material-symbols-outlined text-[15px]" style="color:var(--color-brand)">event</span>
            <span style="color:var(--color-text-muted)">Fecha de vencimiento estimada:</span>
            <span class="font-semibold font-mono" style="color:var(--color-text-primary)">{{ fechaFin }}</span>
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
import { ref, computed, watch } from 'vue'
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

const form = ref({
  deudor_nombre:   '',
  cliente_contacto: '',
  capital:         '',
  tasa_display:    '',
  fecha_inicio:    todayDateInput(),
  dias_duracion:   '',
  cuenta_id:       '',
})

const fechaFin = computed(() => {
  if (!form.value.fecha_inicio || !form.value.dias_duracion) return null
  const d = new Date(form.value.fecha_inicio + 'T00:00:00')
  d.setDate(d.getDate() + parseInt(form.value.dias_duracion) - 1)
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
    form.value = {
      deudor_nombre:   props.editData.deudor_nombre,
      cliente_contacto: props.editData.cliente?.contacto || '',
      cliente_id: props.editData.cliente_id || 'nuevo',
      capital:         parseFloat(props.editData.capital),
      tasa_display:    parseFloat((parseFloat(props.editData.tasa_interes_mensual) * 100).toFixed(4)),
      fecha_inicio:    props.editData.fecha_inicio,
      dias_duracion:   props.editData.dias_duracion ?? '',
      cuenta_id:       props.editData.cuenta_id,
    }
  } else {
    form.value = { deudor_nombre: '', cliente_contacto: '', cliente_id: 'nuevo', capital: '', tasa_display: '', fecha_inicio: todayDateInput(), dias_duracion: '', cuenta_id: '' }
  }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  saving.value   = true
  errorMsg.value = ''
  try {
    const payload = {
      deudor_nombre:        form.value.deudor_nombre,
      cliente_contacto:    form.value.cliente_contacto || null,
      cliente_id:           form.value.cliente_id === 'nuevo' ? null : form.value.cliente_id,
      capital:              form.value.capital,
      tasa_interes_mensual: parseFloat((form.value.tasa_display / 100).toFixed(6)),
      fecha_inicio:         form.value.fecha_inicio,
      dias_duracion:        form.value.dias_duracion ? parseInt(form.value.dias_duracion) : null,
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

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
