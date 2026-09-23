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
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">{{ editData ? 'Editar sueldo' : 'Nuevo sueldo' }}</h2>

        <form class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Nombre</label>
            <input v-model="form.nombre" type="text" placeholder="Ej. Sueldo empresa XYZ" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Monto mensual ($)</label>
            <input v-model.number="form.monto" type="number" min="0.01" step="0.01" placeholder="700.00" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Día de cobro (1–31)</label>
            <input v-model.number="form.dia_cobro" type="number" min="1" max="31" placeholder="15" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs" style="color:var(--color-text-muted)">Cuenta de ingreso</label>
            <select v-model.number="form.cuenta_id" required class="fintech-input w-full">
              <option value="" disabled>Selecciona una cuenta</option>
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select>
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
const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
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
