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
        style="background:#FFFFFF;border:1px solid #E2E8F0"
      >
        <h2 class="text-base font-semibold text-slate-900">{{ editData ? 'Editar sueldo' : 'Nuevo sueldo' }}</h2>

        <form class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs text-slate-500">Nombre</label>
            <input v-model="form.nombre" type="text" placeholder="Ej. Sueldo empresa XYZ" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-500">Monto mensual ($)</label>
            <input v-model.number="form.monto" type="number" min="0.01" step="0.01" placeholder="700.00" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-500">Día de cobro (1–31)</label>
            <input v-model.number="form.dia_cobro" type="number" min="1" max="31" placeholder="15" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-500">Cuenta de ingreso</label>
            <select v-model.number="form.cuenta_id" required class="fintech-input w-full">
              <option value="" disabled>Selecciona una cuenta</option>
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select>
          </div>

          <div v-if="editData" class="flex items-center gap-2">
            <input id="chk-activo" v-model="form.activo" type="checkbox" class="h-4 w-4 rounded" />
            <label for="chk-activo" class="text-sm text-slate-600">Sueldo activo</label>
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50" style="background:#10B981">
              {{ saving ? 'Guardando…' : (editData ? 'Guardar cambios' : 'Crear sueldo') }}
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
