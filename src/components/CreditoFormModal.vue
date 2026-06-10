<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0"
        style="background:rgba(7,17,31,0.8);backdrop-filter:blur(6px)"
        @click="close"
      />
      <div
        class="relative w-full max-w-lg rounded-2xl p-6 shadow-card overflow-y-auto max-h-[90vh]"
        style="background:#0D2240;border:1px solid rgba(255,255,255,0.1)"
      >
        <h2 class="text-base font-semibold text-white">Nuevo crédito recibido</h2>
        <p class="mt-1 text-xs text-slate-400">Préstamo que tú recibiste para cubrir un gasto.</p>

        <form class="mt-5 flex flex-col gap-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Nombre / descripción</label>
            <input v-model="form.nombre" type="text" placeholder="Ej. Préstamo para pagar Visa BHD" required class="fintech-input w-full" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-xs text-slate-400">Capital recibido ($)</label>
              <input v-model.number="form.capital" type="number" min="0.01" step="0.01" placeholder="5000.00" required class="fintech-input w-full" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-slate-400">Número de cuotas</label>
              <input v-model.number="form.num_cuotas" type="number" min="1" step="1" placeholder="12" required class="fintech-input w-full" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-xs text-slate-400">Tipo de interés</label>
              <select v-model="form.tipo_interes" required class="fintech-input w-full">
                <option value="simple">Interés simple</option>
                <option value="compuesto">Interés compuesto</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-slate-400">Tasa mensual (%)</label>
              <input v-model.number="form.tasa_display" type="number" min="0" max="100" step="0.01" placeholder="3" required class="fintech-input w-full" />
              <p class="mt-1 text-[10px] text-slate-600">Ej: 3 = 3% por mes</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-xs text-slate-400">Fecha de inicio</label>
              <input v-model="form.fecha_inicio" type="date" required class="fintech-input w-full" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-slate-400">Cuenta donde entra el dinero</label>
              <select v-model.number="form.cuenta_id" required class="fintech-input w-full">
                <option value="" disabled>Selecciona</option>
                <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
            </div>
          </div>

          <!-- Propósito opcional -->
          <div>
            <label class="mb-1.5 block text-xs text-slate-400">Propósito (opcional)</label>
            <input v-model="form.proposito_tipo" type="text" placeholder="Ej. pago_tarjeta, egreso, compra" class="fintech-input w-full" />
          </div>

          <!-- Resumen de amortización -->
          <div v-if="resumen" class="rounded-xl px-4 py-3 text-xs space-y-1" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07)">
            <p class="font-semibold text-slate-300 mb-2">Resumen estimado</p>
            <div class="flex justify-between text-slate-500">
              <span>Cuota mensual</span>
              <span class="font-mono text-slate-300">{{ formatCurrency(resumen.cuota) }}</span>
            </div>
            <div class="flex justify-between text-slate-500">
              <span>Total intereses</span>
              <span class="font-mono" style="color:#FBBF24">{{ formatCurrency(resumen.totalInteres) }}</span>
            </div>
            <div class="flex justify-between text-slate-500">
              <span>Total a pagar</span>
              <span class="font-mono text-slate-200 font-semibold">{{ formatCurrency(resumen.totalPagar) }}</span>
            </div>
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5" @click="close">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50" style="background:#3B82F6">
              {{ saving ? 'Guardando…' : 'Registrar crédito' }}
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
const form  = ref({
  nombre:       '',
  capital:      '',
  tipo_interes: 'simple',
  tasa_display: '',
  num_cuotas:   '',
  fecha_inicio: today,
  cuenta_id:    '',
  proposito_tipo: '',
})
const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  saving.value   = false
  errorMsg.value = ''
  form.value     = { nombre: '', capital: '', tipo_interes: 'simple', tasa_display: '', num_cuotas: '', fecha_inicio: today, cuenta_id: '', proposito_tipo: '' }
})

const resumen = computed(() => {
  const cap = parseFloat(form.value.capital)
  const r   = parseFloat(form.value.tasa_display) / 100
  const n   = parseInt(form.value.num_cuotas)
  if (!cap || !n || isNaN(r)) return null

  let cuota, totalInteres
  if (form.value.tipo_interes === 'simple') {
    cuota        = parseFloat((cap / n + cap * r).toFixed(2))
    totalInteres = parseFloat((cap * r * n).toFixed(2))
  } else {
    cuota = r === 0
      ? parseFloat((cap / n).toFixed(2))
      : parseFloat((cap * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)).toFixed(2))
    totalInteres = parseFloat((cuota * n - cap).toFixed(2))
  }

  return { cuota, totalInteres, totalPagar: parseFloat((cap + totalInteres).toFixed(2)) }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  saving.value   = true
  errorMsg.value = ''
  try {
    emit('saved', {
      nombre:         form.value.nombre,
      capital:        form.value.capital,
      tipo_interes:   form.value.tipo_interes,
      tasa_mensual:   parseFloat((form.value.tasa_display / 100).toFixed(6)),
      num_cuotas:     form.value.num_cuotas,
      fecha_inicio:   form.value.fecha_inicio,
      cuenta_id:      form.value.cuenta_id,
      proposito_tipo: form.value.proposito_tipo || null,
    })
    close()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Error al guardar'
    saving.value   = false
  }
}
</script>
