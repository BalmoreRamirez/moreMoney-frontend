<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close">
        <div class="absolute inset-0" style="background:rgba(7,17,31,0.78);backdrop-filter:blur(6px)" />

        <div class="relative w-full max-w-md rounded-2xl p-6 shadow-card" style="background:#0D2240;border:1px solid rgba(255,255,255,0.1)">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">Nueva compra tasa cero</h2>
            <button class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white" @click="close">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form @submit.prevent="submit" class="space-y-4">
            <!-- Tarjeta -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Tarjeta</label>
              <select v-model="form.tarjeta_id" class="fintech-input" required>
                <option value="" disabled>Selecciona una tarjeta…</option>
                <option v-for="t in tarjetas" :key="t.id" :value="t.id">
                  {{ t.nombre }} — {{ t.banco }}
                </option>
              </select>
              <p v-if="errors.tarjeta_id" class="mt-1 text-xs text-danger">{{ errors.tarjeta_id }}</p>
            </div>

            <!-- Nombre -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Descripción del producto</label>
              <input v-model.trim="form.nombre" type="text" class="fintech-input" placeholder="Ej: Laptop Dell" required />
              <p v-if="errors.nombre" class="mt-1 text-xs text-danger">{{ errors.nombre }}</p>
            </div>

            <!-- Monto total + cuotas en fila -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-400">Monto total</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400">$</span>
                  <input v-model="form.monto_total" type="number" step="0.01" min="0.01" class="fintech-input pl-7 font-mono" placeholder="0.00" required />
                </div>
                <p v-if="errors.monto_total" class="mt-1 text-xs text-danger">{{ errors.monto_total }}</p>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-400">N° de cuotas</label>
                <input v-model.number="form.total_cuotas" type="number" min="1" max="60" class="fintech-input" placeholder="Ej: 12" required />
                <p v-if="errors.total_cuotas" class="mt-1 text-xs text-danger">{{ errors.total_cuotas }}</p>
              </div>
            </div>

            <!-- Preview cuota mensual -->
            <div v-if="cuotaMensual" class="flex items-center justify-between rounded-xl px-4 py-3" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2)">
              <span class="text-xs text-slate-400">Cuota mensual estimada</span>
              <span class="font-mono text-lg font-bold text-success">{{ cuotaMensual }}</span>
            </div>

            <!-- Fecha -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Fecha de compra</label>
              <input v-model="form.fecha_compra" type="date" class="fintech-input" required />
              <p v-if="errors.fecha_compra" class="mt-1 text-xs text-danger">{{ errors.fecha_compra }}</p>
            </div>

            <div v-if="serverError" class="rounded-lg px-4 py-3 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger);border:1px solid rgba(220,38,38,0.2)">
              {{ serverError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5" @click="close">Cancelar</button>
              <button type="submit" :disabled="saving" class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50" style="background:#10B981">
                {{ saving ? 'Generando cuotas…' : 'Crear y generar cuotas' }}
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
})
const emit = defineEmits(['update:modelValue', 'saved'])

const today = new Date().toISOString().split('T')[0]
const EMPTY = { tarjeta_id: '', nombre: '', monto_total: '', total_cuotas: '', fecha_compra: today }

const form        = ref({ ...EMPTY })
const errors      = ref({})
const serverError = ref('')
const saving      = ref(false)

watch(() => props.modelValue, (open) => {
  if (open) { form.value = { ...EMPTY }; errors.value = {}; serverError.value = '' }
})

// Preview en tiempo real
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
  saving.value = true
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
