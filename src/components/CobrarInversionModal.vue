<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0"
        style="background:rgba(7,17,31,0.8);backdrop-filter:blur(6px)"
        @click="close"
      />
      <div
        class="relative w-full max-w-md rounded-2xl p-6 shadow-card"
        style="background:#0D2240;border:1px solid rgba(255,255,255,0.1)"
      >
        <h2 class="text-base font-semibold text-white">Registrar cobro</h2>
        <p class="mt-0.5 text-xs text-slate-400">{{ inversion?.nombre }}</p>

        <!-- Resumen -->
        <div v-if="inversion" class="mt-4 grid grid-cols-3 gap-2 rounded-xl p-3" style="background:rgba(255,255,255,0.04)">
          <div class="text-center">
            <p class="text-[10px] uppercase tracking-wider text-slate-600">Costo</p>
            <p class="mt-0.5 font-mono text-sm font-semibold text-slate-300">{{ formatCurrency(inversion.costo_total) }}</p>
          </div>
          <div class="text-center">
            <p class="text-[10px] uppercase tracking-wider text-slate-600">Ya cobrado</p>
            <p class="mt-0.5 font-mono text-sm font-semibold" style="color:#10B981">{{ formatCurrency(inversion.total_cobrado ?? 0) }}</p>
          </div>
          <div class="text-center">
            <p class="text-[10px] uppercase tracking-wider text-slate-600">Pendiente</p>
            <p class="mt-0.5 font-mono text-sm font-semibold" style="color:#FBBF24">
              {{ inversion.saldo_por_cobrar != null ? formatCurrency(Math.max(0, inversion.saldo_por_cobrar)) : '—' }}
            </p>
          </div>
        </div>

        <!-- Barra de progreso -->
        <div v-if="inversion?.precio_esperado" class="mt-3">
          <div class="h-1.5 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.06)">
            <div
              class="h-full rounded-full transition-all"
              :style="{ width: progresoPct + '%', background: '#10B981' }"
            />
          </div>
          <p class="mt-1 text-right text-[10px] text-slate-600">{{ progresoPct }}% cobrado</p>
        </div>

        <form class="mt-4 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Monto a cobrar ($)</label>
            <input
              v-model.number="form.monto"
              type="number" min="0.01" step="0.01"
              :placeholder="sugerido > 0 ? sugerido.toFixed(2) : '0.00'"
              required
              class="fintech-input w-full"
            />
            <p v-if="nuevoTotal !== null" class="mt-1 text-xs text-slate-500">
              Total cobrado después: <span class="font-mono font-semibold text-slate-300">{{ formatCurrency(nuevoTotal) }}</span>
            </p>
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Fecha de cobro</label>
            <input v-model="form.fecha_cobro" type="date" required class="fintech-input w-full" />
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Cuenta de ingreso</label>
            <select v-model.number="form.cuenta_id" required class="fintech-input w-full">
              <option value="" disabled>Selecciona una cuenta</option>
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select>
          </div>

          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Nota <span class="text-slate-600">(opcional)</span></label>
            <input v-model="form.nota" type="text" placeholder="Ej. Pago parcial cliente" class="fintech-input w-full" />
          </div>

          <!-- Toggle pago final (solo si no hay precio esperado o aún no se cubre) -->
          <label v-if="mostrarToggleFinal" class="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3" style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2)">
            <input v-model="form.es_pago_final" type="checkbox" class="h-4 w-4 accent-blue-500" />
            <span class="text-sm text-slate-300">Este es el pago final — cerrar inversión</span>
          </label>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-1">
            <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5" @click="close">
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style="background:#10B981"
            >
              {{ saving ? 'Guardando…' : 'Registrar cobro' }}
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
  inversion:  { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas = computed(() => cuentasStore.cuentas)

const form     = ref({ monto: '', fecha_cobro: '', cuenta_id: '', nota: '', es_pago_final: false })
const saving   = ref(false)
const errorMsg = ref('')

const sugerido = computed(() => {
  if (!props.inversion) return 0
  const pendiente = props.inversion.saldo_por_cobrar
  return pendiente != null && pendiente > 0 ? parseFloat(pendiente.toFixed(2)) : 0
})

const nuevoTotal = computed(() => {
  if (!form.value.monto || !props.inversion) return null
  return parseFloat(((props.inversion.total_cobrado ?? 0) + parseFloat(form.value.monto)).toFixed(2))
})

const progresoPct = computed(() => {
  if (!props.inversion?.precio_esperado) return 0
  const total = parseFloat(props.inversion.total_cobrado ?? 0)
  const esp   = parseFloat(props.inversion.precio_esperado)
  return Math.min(100, Math.round((total / esp) * 100))
})

const mostrarToggleFinal = computed(() => {
  if (!props.inversion) return false
  // No tiene precio esperado, o el nuevo total no alcanza todavía
  if (!props.inversion.precio_esperado) return true
  const esp   = parseFloat(props.inversion.precio_esperado)
  const nuevo = nuevoTotal.value ?? 0
  return nuevo < esp
})

watch(() => props.modelValue, (open) => {
  if (!open) return
  errorMsg.value = ''
  saving.value   = false
  form.value = {
    monto:         '',
    fecha_cobro:   new Date().toISOString().split('T')[0],
    cuenta_id:     '',
    nota:          '',
    es_pago_final: false,
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
    errorMsg.value = e.response?.data?.error || 'Error al registrar cobro'
    saving.value   = false
  }
}
</script>
