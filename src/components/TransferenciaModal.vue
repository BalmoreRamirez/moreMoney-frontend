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
        <div class="flex items-center gap-3 mb-5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl" style="background:rgba(167,139,250,0.12)">
            <span class="material-symbols-outlined text-[20px]" style="color:#A78BFA">swap_horiz</span>
          </div>
          <h2 class="text-base font-semibold text-white">Mover fondos</h2>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Cuenta origen</label>
            <select v-model.number="form.origen_id" required class="fintech-input w-full" @change="onOrigenChange">
              <option value="" disabled>Selecciona cuenta</option>
              <option
                v-for="c in cuentas"
                :key="c.id"
                :value="c.id"
                :disabled="c.id === form.destino_id"
              >
                {{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}
              </option>
            </select>
          </div>

          <!-- Flecha visual -->
          <div class="flex items-center justify-center">
            <span class="material-symbols-outlined text-slate-600">arrow_downward</span>
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Cuenta destino</label>
            <select v-model.number="form.destino_id" required class="fintech-input w-full">
              <option value="" disabled>Selecciona cuenta</option>
              <option
                v-for="c in cuentas"
                :key="c.id"
                :value="c.id"
                :disabled="c.id === form.origen_id"
              >
                {{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Monto ($)</label>
            <input
              v-model.number="form.monto"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
              class="fintech-input w-full"
            />
            <p v-if="saldoOrigen !== null" class="mt-1 text-[10px] text-slate-600">
              Disponible: <span class="font-mono" style="color:#A78BFA">{{ formatCurrency(saldoOrigen) }}</span>
            </p>
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Descripción (opcional)</label>
            <input
              v-model="form.descripcion"
              type="text"
              placeholder="Ej. Fondos para gastos del mes"
              class="fintech-input w-full"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Fecha</label>
            <input v-model="form.fecha" type="date" required class="fintech-input w-full" />
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5"
              @click="close"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style="background:#A78BFA"
            >
              {{ saving ? 'Moviendo…' : 'Confirmar' }}
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

const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit  = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas      = computed(() => cuentasStore.cuentas)

const today = new Date().toISOString().split('T')[0]
const form  = ref({ origen_id: '', destino_id: '', monto: '', descripcion: '', fecha: today })
const saving   = ref(false)
const errorMsg = ref('')

const saldoOrigen = computed(() => {
  if (!form.value.origen_id) return null
  const c = cuentas.value.find(x => x.id === form.value.origen_id)
  return c ? c.saldo_actual : null
})

watch(() => props.modelValue, (open) => {
  if (!open) return
  saving.value   = false
  errorMsg.value = ''
  form.value     = { origen_id: '', destino_id: '', monto: '', descripcion: '', fecha: today }
})

function onOrigenChange() {
  if (form.value.destino_id === form.value.origen_id) form.value.destino_id = ''
}

function close() { emit('update:modelValue', false) }

async function submit() {
  saving.value   = true
  errorMsg.value = ''
  try {
    await cuentasStore.transferir({
      origen_id:   form.value.origen_id,
      destino_id:  form.value.destino_id,
      monto:       form.value.monto,
      descripcion: form.value.descripcion || null,
      fecha:       form.value.fecha,
    })
    emit('saved')
    close()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Error al mover fondos'
    saving.value   = false
  }
}
</script>
