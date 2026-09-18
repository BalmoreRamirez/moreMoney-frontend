<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close">
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)" />

        <div class="relative w-full max-w-md rounded-2xl shadow-card" style="background:var(--color-surface);border:1px solid var(--color-border)">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 pb-4">
            <h2 class="text-lg font-semibold" style="color:var(--color-text-primary)">{{ ingreso ? 'Editar ingreso' : 'Nuevo ingreso' }}</h2>
            <button class="icon-btn" @click="close">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Form -->
          <form class="px-6 pb-6 space-y-4" @submit.prevent="submit">

            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style="color:var(--color-text-secondary)">Descripción</label>
              <input
                v-model="form.descripcion"
                type="text"
                class="fintech-input"
                placeholder="Ej: Venta de artículo, comisión, regalo…"
                required
              />
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style="color:var(--color-text-secondary)">Monto ($)</label>
              <input
                v-model.number="form.monto"
                type="number"
                min="0.01"
                step="0.01"
                class="fintech-input"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style="color:var(--color-text-secondary)">Fecha</label>
              <input v-model="form.fecha" type="date" class="fintech-input" required />
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style="color:var(--color-text-secondary)">Cuenta destino</label>
              <select v-model.number="form.cuenta_id" class="fintech-input" required>
                <option :value="null" disabled>Selecciona una cuenta</option>
                <option v-for="c in cuentas" :key="c.id" :value="c.id">
                  {{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}
                </option>
              </select>
            </div>

            <p v-if="errorMsg" class="text-sm" style="color:var(--color-danger)">{{ errorMsg }}</p>

            <div class="flex gap-3 pt-1">
              <button type="button" class="btn-ghost flex-1" @click="close">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="btn-brand flex-1 disabled:opacity-40"
              >
                {{ saving ? 'Guardando…' : (ingreso ? 'Guardar cambios' : 'Registrar ingreso') }}
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
  modelValue: Boolean,
  ingreso:    { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas      = computed(() => cuentasStore.cuentas)

const defaultForm = () => ({
  descripcion: '',
  monto:       null,
  fecha:       new Date().toISOString().split('T')[0],
  cuenta_id:   null,
})

const form     = ref(defaultForm())
const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, async (open) => {
  if (!open) return
  errorMsg.value = ''
  form.value = props.ingreso
    ? { descripcion: props.ingreso.descripcion, monto: parseFloat(props.ingreso.monto), fecha: props.ingreso.fecha, cuenta_id: props.ingreso.cuenta_id }
    : defaultForm()
  if (!cuentasStore.cuentas.length) await cuentasStore.fetchCuentas()
})

function close() { emit('update:modelValue', false) }

async function submit() {
  saving.value   = true
  errorMsg.value = ''
  try {
    emit('saved', { ...form.value })
    close()
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || 'Error al guardar'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
