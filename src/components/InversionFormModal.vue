<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close" @keydown.window.esc="close">
        <div
          class="absolute inset-0"
          style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)"
        />
      <div
        class="relative w-full max-w-md rounded-2xl p-6 shadow-card"
        style="background:var(--color-surface);border:1px solid var(--color-border)"
      >
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">{{ editData ? 'Editar inversión' : 'Registrar inversión' }}</h2>

        <form class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Nombre / Descripción</label>
            <input v-model="form.nombre" type="text" placeholder="Ej. Pantalones para reventa" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Costo total ($)</label>
            <input v-model.number="form.costo_total" type="number" min="0.01" step="0.01" placeholder="150.00" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Fecha de compra</label>
            <input v-model="form.fecha_compra" type="date" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">
              Precio de venta esperado ($)
              <span class="ml-1" style="color:var(--color-text-muted)">(opcional)</span>
            </label>
            <input
              v-model.number="form.precio_esperado"
              type="number" min="0.01" step="0.01" placeholder="Ej. 200.00"
              class="fintech-input w-full"
            />
            <p v-if="gananciaEsperada !== null" class="mt-1.5 text-xs" :style="gananciaEsperada >= 0 ? 'color:var(--color-success)' : 'color:var(--color-danger)'">
              Ganancia esperada: {{ formatCurrency(gananciaEsperada) }}
              ({{ gananciaEsperadaPct }}%)
            </p>
          </div>

          <div v-if="!editData">
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Cuenta de egreso (donde sale el dinero)</label>
            <select v-model.number="form.cuenta_egreso_id" required class="fintech-input w-full">
              <option value="" disabled>Selecciona una cuenta</option>
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select>
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-ghost flex-1" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="btn-brand flex-1 disabled:opacity-50">
              {{ saving ? 'Guardando…' : editData ? 'Guardar cambios' : 'Registrar inversión' }}
            </button>
          </div>
        </form>
      </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency }  from '../utils/currency'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData:   { type: Object,  default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas = computed(() => cuentasStore.cuentas)

const today    = new Date().toISOString().split('T')[0]
const form     = ref({ nombre: '', costo_total: '', precio_esperado: '', fecha_compra: today, cuenta_egreso_id: '' })
const saving   = ref(false)
const errorMsg = ref('')

const gananciaEsperada = computed(() => {
  const costo    = parseFloat(form.value.costo_total)
  const esperado = parseFloat(form.value.precio_esperado)
  if (!form.value.precio_esperado || isNaN(costo) || isNaN(esperado)) return null
  return parseFloat((esperado - costo).toFixed(2))
})

const gananciaEsperadaPct = computed(() => {
  const costo = parseFloat(form.value.costo_total)
  if (!costo || gananciaEsperada.value === null) return 0
  return parseFloat(((gananciaEsperada.value / costo) * 100).toFixed(1))
})

watch(() => props.modelValue, (open) => {
  if (!open) return
  errorMsg.value = ''
  saving.value   = false
  if (props.editData) {
    form.value = {
      nombre:          props.editData.nombre,
      costo_total:     props.editData.costo_total,
      precio_esperado: props.editData.precio_esperado ?? '',
      fecha_compra:    props.editData.fecha_compra,
      cuenta_egreso_id: '',
    }
  } else {
    form.value = { nombre: '', costo_total: '', precio_esperado: '', fecha_compra: new Date().toISOString().split('T')[0], cuenta_egreso_id: '' }
  }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  saving.value   = true
  errorMsg.value = ''
  try {
    emit('saved', { ...form.value })
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
