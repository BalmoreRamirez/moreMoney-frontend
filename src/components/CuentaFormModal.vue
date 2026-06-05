<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0" style="background:rgba(7,17,31,0.8);backdrop-filter:blur(6px)" @click="$emit('update:modelValue', false)" />

        <div class="relative w-full max-w-md rounded-2xl p-6" style="background:#0D2240;border:1px solid rgba(255,255,255,0.1)">
          <h2 class="mb-5 text-base font-semibold text-white">
            {{ editData ? 'Editar cuenta' : 'Nueva cuenta' }}
          </h2>

          <form class="space-y-4" @submit.prevent="submit">
            <!-- Nombre -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Nombre</label>
              <input v-model="form.nombre" class="fintech-input" placeholder="Ej: BHD León, Efectivo casa" required />
            </div>

            <!-- Tipo -->
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Tipo</label>
              <select v-model="form.tipo" class="fintech-input" required>
                <option value="">Seleccionar tipo</option>
                <option value="banco">Banco</option>
                <option value="efectivo">Efectivo</option>
                <option value="digital">Digital</option>
              </select>
            </div>

            <!-- Saldo inicial (solo al crear) -->
            <div v-if="!editData">
              <label class="mb-1.5 block text-xs font-medium text-slate-400">Saldo inicial</label>
              <input
                v-model.number="form.saldo_inicial"
                type="number"
                min="0"
                step="0.01"
                class="fintech-input"
                placeholder="0.00"
              />
              <p class="mt-1 text-[10px] text-slate-600">El saldo actual se calculará sumando los movimientos sobre este valor.</p>
            </div>

            <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

            <div class="flex gap-3 pt-2">
              <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5" @click="$emit('update:modelValue', false)">
                Cancelar
              </button>
              <button type="submit" class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50" style="background:#10B981" :disabled="saving">
                {{ saving ? 'Guardando…' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData:   { type: Object,  default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const form = ref({ nombre: '', tipo: '', saldo_inicial: 0 })
const saving  = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (v) => {
  if (v) {
    errorMsg.value = ''
    if (props.editData) {
      form.value = { nombre: props.editData.nombre, tipo: props.editData.tipo, saldo_inicial: props.editData.saldo_inicial }
    } else {
      form.value = { nombre: '', tipo: '', saldo_inicial: 0 }
    }
  }
})

async function submit() {
  if (!form.value.nombre || !form.value.tipo) { errorMsg.value = 'Nombre y tipo son obligatorios.'; return }
  saving.value  = true
  errorMsg.value = ''
  try {
    emit('saved', { ...form.value, id: props.editData?.id })
    emit('update:modelValue', false)
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
