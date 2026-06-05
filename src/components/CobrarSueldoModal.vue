<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0"
        style="background:rgba(7,17,31,0.8);backdrop-filter:blur(6px)"
        @click="close"
      />
      <div
        class="relative w-full max-w-sm rounded-2xl p-6 shadow-card"
        style="background:#0D2240;border:1px solid rgba(255,255,255,0.1)"
      >
        <h2 class="text-base font-semibold text-white">Registrar cobro</h2>
        <p class="mt-1 text-xs text-slate-400">{{ sueldo?.nombre }}</p>

        <form class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-xs text-slate-400">Mes</label>
              <select v-model.number="form.mes" required class="fintech-input w-full">
                <option v-for="(m, i) in MESES" :key="i" :value="i + 1">{{ m }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-slate-400">Año</label>
              <input v-model.number="form.anio" type="number" min="2000" max="2099" required class="fintech-input w-full" />
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Fecha de cobro</label>
            <input v-model="form.fecha_cobro" type="date" required class="fintech-input w-full" />
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50" style="background:#10B981">
              {{ saving ? 'Registrando…' : 'Confirmar cobro' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  sueldo:     { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'confirmed'])

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const today = new Date()
const form     = ref({ mes: today.getMonth() + 1, anio: today.getFullYear(), fecha_cobro: today.toISOString().split('T')[0] })
const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  errorMsg.value  = ''
  saving.value    = false
  const d         = new Date()
  form.value      = { mes: d.getMonth() + 1, anio: d.getFullYear(), fecha_cobro: d.toISOString().split('T')[0] }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  saving.value   = true
  errorMsg.value = ''
  try {
    emit('confirmed', { ...form.value })
    close()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Error al registrar cobro'
    saving.value   = false
  }
}
</script>
