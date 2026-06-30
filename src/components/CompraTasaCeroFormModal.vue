<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close">
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)" />

        <div class="relative w-full max-w-md rounded-2xl p-6 shadow-card" style="background:#FFFFFF;border:1px solid #E2E8F0">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">
              {{ isEdit ? 'Editar compra tasa cero' : 'Nueva compra tasa cero' }}
            </h2>
            <button class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" @click="close">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Aviso cuando hay cuotas pagadas -->
          <div v-if="isEdit && hasPaidCuotas" class="mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-xs" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);color:#F59E0B">
            <span class="material-symbols-outlined text-[16px] shrink-0 mt-0.5">lock</span>
            <span>Tiene cuotas pagadas. Solo puedes editar la descripción.</span>
          </div>

          <form @submit.prevent="submit" class="space-y-4">
            <!-- Tarjeta -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-500">Tarjeta</label>
              <select v-model="form.tarjeta_id" class="fintech-input" :disabled="isEdit && hasPaidCuotas" required>
                <option value="" disabled>Selecciona una tarjeta…</option>
                <option v-for="t in tarjetas" :key="t.id" :value="t.id">
                  {{ t.nombre }} — {{ t.banco }}
                </option>
              </select>
              <p v-if="errors.tarjeta_id" class="mt-1 text-xs text-danger">{{ errors.tarjeta_id }}</p>
            </div>

            <!-- Nombre -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-500">Descripción del producto</label>
              <input v-model.trim="form.nombre" type="text" class="fintech-input" placeholder="Ej: Laptop Dell" required />
              <p v-if="errors.nombre" class="mt-1 text-xs text-danger">{{ errors.nombre }}</p>
            </div>

            <!-- Monto total + cuotas -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-500">Monto total</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-500">$</span>
                  <input
                    v-model="form.monto_total" type="number" step="0.01" min="0.01"
                    class="fintech-input pl-7 font-mono"
                    :class="isEdit && hasPaidCuotas ? 'opacity-40 cursor-not-allowed' : ''"
                    :disabled="isEdit && hasPaidCuotas"
                    placeholder="0.00" required
                  />
                </div>
                <p v-if="errors.monto_total" class="mt-1 text-xs text-danger">{{ errors.monto_total }}</p>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-500">N° de cuotas</label>
                <input
                  v-model.number="form.total_cuotas" type="number" min="1" max="60"
                  class="fintech-input"
                  :class="isEdit && hasPaidCuotas ? 'opacity-40 cursor-not-allowed' : ''"
                  :disabled="isEdit && hasPaidCuotas"
                  placeholder="Ej: 12" required
                />
                <p v-if="errors.total_cuotas" class="mt-1 text-xs text-danger">{{ errors.total_cuotas }}</p>
              </div>
            </div>

            <!-- Preview cuota mensual -->
            <div v-if="cuotaMensual" class="flex items-center justify-between rounded-xl px-4 py-3" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2)">
              <span class="text-xs text-slate-500">Cuota mensual estimada</span>
              <span class="font-mono text-lg font-bold text-success">{{ cuotaMensual }}</span>
            </div>

            <!-- Fecha -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-500">Fecha de compra</label>
              <input
                v-model="form.fecha_compra" type="date"
                class="fintech-input"
                :class="isEdit && hasPaidCuotas ? 'opacity-40 cursor-not-allowed' : ''"
                :disabled="isEdit && hasPaidCuotas"
                required
              />
              <p v-if="errors.fecha_compra" class="mt-1 text-xs text-danger">{{ errors.fecha_compra }}</p>
            </div>

            <div v-if="serverError" class="rounded-lg px-4 py-3 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger);border:1px solid rgba(220,38,38,0.2)">
              {{ serverError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50" @click="close">Cancelar</button>
              <button type="submit" :disabled="saving" class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50" style="background:#10B981">
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
import { ref, computed, watch } from 'vue'
import { formatCurrency } from '../utils/currency'

const props = defineProps({
  modelValue: Boolean,
  tarjetas:   { type: Array, default: () => [] },
  editData:   { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const today = new Date().toISOString().split('T')[0]
const EMPTY = { tarjeta_id: '', nombre: '', monto_total: '', total_cuotas: '', fecha_compra: today }

const form        = ref({ ...EMPTY })
const errors      = ref({})
const serverError = ref('')
const saving      = ref(false)

const isEdit        = computed(() => !!props.editData)
const hasPaidCuotas = computed(() =>
  isEdit.value && (props.editData.cuotas || []).some(c => c.estado === 'pagada')
)

watch(() => props.modelValue, (open) => {
  if (!open) return
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
    form.value = { ...EMPTY }
  }
})

const cuotaMensual = computed(() => {
  const m = parseFloat(form.value.monto_total)
  const n = parseInt(form.value.total_cuotas)
  if (!m || !n || m <= 0 || n < 1) return null
  return formatCurrency(m / n)
})

function close() { emit('update:modelValue', false) }

function validate() {
  const e = {}
  if (!form.value.tarjeta_id)  e.tarjeta_id  = 'Selecciona una tarjeta'
  if (!form.value.nombre)       e.nombre       = 'La descripción es requerida'
  const m = parseFloat(form.value.monto_total)
  if (!form.value.monto_total || isNaN(m) || m <= 0) e.monto_total = 'El monto debe ser mayor a 0'
  const n = parseInt(form.value.total_cuotas)
  if (!form.value.total_cuotas || isNaN(n) || n < 1) e.total_cuotas = 'Mínimo 1 cuota'
  if (!form.value.fecha_compra) e.fecha_compra = 'La fecha es requerida'
  errors.value = e
  return !Object.keys(e).length
}

async function submit() {
  if (!validate()) return
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
