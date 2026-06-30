<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="$emit('update:modelValue', false)">
        <!-- Backdrop -->
        <div class="absolute inset-0" style="background: rgba(15,23,42,0.40); backdrop-filter: blur(6px)" />

        <!-- Panel -->
        <div class="relative w-full max-w-md rounded-2xl p-6 shadow-card" style="background: #FFFFFF; border: 1px solid #E2E8F0">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">
              {{ isEdit ? 'Editar Tarjeta' : 'Nueva Tarjeta' }}
            </h2>
            <button class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900" @click="$emit('update:modelValue', false)">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form @submit.prevent="submit" class="space-y-4">
            <!-- Nombre -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-500">Nombre de la tarjeta</label>
              <input v-model.trim="form.nombre" type="text" class="fintech-input" placeholder="Ej: Visa Platino" required />
              <p v-if="errors.nombre" class="mt-1 text-xs text-danger">{{ errors.nombre }}</p>
            </div>

            <!-- Banco -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-500">Banco emisor</label>
              <input v-model.trim="form.banco" type="text" class="fintech-input" placeholder="Ej: Banco Nacional" required />
              <p v-if="errors.banco" class="mt-1 text-xs text-danger">{{ errors.banco }}</p>
            </div>

            <!-- Límite de crédito -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-500">Límite de crédito</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-500">$</span>
                <input
                  v-model="form.limite_credito"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="fintech-input pl-7 font-mono"
                  placeholder="0.00"
                  required
                />
              </div>
              <p v-if="errors.limite_credito" class="mt-1 text-xs text-danger">{{ errors.limite_credito }}</p>
            </div>

            <!-- Días -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-500">Día de corte</label>
                <input
                  v-model.number="form.dia_corte"
                  type="number"
                  min="1"
                  max="31"
                  class="fintech-input"
                  placeholder="1–31"
                  required
                />
                <p v-if="errors.dia_corte" class="mt-1 text-xs text-danger">{{ errors.dia_corte }}</p>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-500">Día de pago</label>
                <input
                  v-model.number="form.dia_pago"
                  type="number"
                  min="1"
                  max="31"
                  class="fintech-input"
                  placeholder="1–31"
                  required
                />
                <p v-if="errors.dia_pago" class="mt-1 text-xs text-danger">{{ errors.dia_pago }}</p>
              </div>
            </div>

            <!-- Error global -->
            <div v-if="serverError" class="rounded-lg px-4 py-3 text-sm" style="background: var(--color-danger-bg); color: var(--color-danger); border: 1px solid rgba(220,38,38,0.2)">
              {{ serverError }}
            </div>

            <!-- Acciones -->
            <div class="flex gap-3 pt-2">
              <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50" @click="$emit('update:modelValue', false)">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style="background: #10B981"
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
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  tarjetaEdit: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const isEdit = computed(() => !!props.tarjetaEdit)

const EMPTY = { nombre: '', banco: '', limite_credito: '', dia_corte: '', dia_pago: '' }
const form        = ref({ ...EMPTY })
const errors      = ref({})
const serverError = ref('')
const saving      = ref(false)

watch(() => props.modelValue, (open) => {
  if (open) {
    form.value  = props.tarjetaEdit
      ? { nombre: props.tarjetaEdit.nombre, banco: props.tarjetaEdit.banco,
          limite_credito: props.tarjetaEdit.limite_credito, dia_corte: props.tarjetaEdit.dia_corte,
          dia_pago: props.tarjetaEdit.dia_pago }
      : { ...EMPTY }
    errors.value      = {}
    serverError.value = ''
  }
})

function validate() {
  const e = {}
  if (!form.value.nombre) e.nombre = 'El nombre es requerido'
  if (!form.value.banco)  e.banco  = 'El banco es requerido'
  const lim = parseFloat(form.value.limite_credito)
  if (!form.value.limite_credito || isNaN(lim) || lim <= 0) e.limite_credito = 'El límite debe ser mayor a 0'
  if (!form.value.dia_corte || form.value.dia_corte < 1 || form.value.dia_corte > 31) e.dia_corte = 'Día entre 1 y 31'
  if (!form.value.dia_pago  || form.value.dia_pago  < 1 || form.value.dia_pago  > 31) e.dia_pago  = 'Día entre 1 y 31'
  errors.value = e
  return !Object.keys(e).length
}

async function submit() {
  if (!validate()) return
  saving.value      = true
  serverError.value = ''
  try {
    emit('saved', { ...form.value, id: props.tarjetaEdit?.id })
    emit('update:modelValue', false)
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
