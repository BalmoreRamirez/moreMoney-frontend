<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close" @keydown.esc="close">
        <div
          class="absolute inset-0"
          style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)"
        />
      <div
        class="relative w-full max-w-md rounded-2xl p-6 shadow-card"
        style="background:var(--color-surface);border:1px solid var(--color-border)"
      >
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">Registrar cobro</h2>
        <p class="mt-0.5 text-xs" style="color:var(--color-text-secondary)">{{ inversion?.nombre }}</p>

        <!-- Resumen -->
        <div v-if="inversion" class="mt-4 grid grid-cols-3 gap-2 rounded-xl p-3" style="background:var(--color-surface-mid)">
          <div class="text-center">
            <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-secondary)">Costo</p>
            <p class="mt-0.5 font-mono text-sm font-semibold" style="color:var(--color-text-secondary)">{{ formatCurrency(inversion.costo_total) }}</p>
          </div>
          <div class="text-center">
            <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-secondary)">Ya cobrado</p>
            <p class="mt-0.5 font-mono text-sm font-semibold" style="color:var(--color-success)">{{ formatCurrency(inversion.total_cobrado ?? 0) }}</p>
          </div>
          <div class="text-center">
            <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-secondary)">Pendiente</p>
            <p class="mt-0.5 font-mono text-sm font-semibold" style="color:var(--color-alert)">
              {{ inversion.saldo_por_cobrar != null ? formatCurrency(Math.max(0, inversion.saldo_por_cobrar)) : '—' }}
            </p>
          </div>
        </div>

        <!-- Barra de progreso -->
        <div v-if="inversion?.precio_esperado" class="mt-3">
          <div class="progress-bar-track h-1.5">
            <div
              class="progress-bar-fill h-full transition-all"
              :style="{ width: progresoPct + '%' }"
            />
          </div>
          <p class="mt-1 text-right text-[10px]" style="color:var(--color-text-secondary)">{{ progresoPct }}% cobrado</p>
        </div>

        <form novalidate class="mt-4 flex flex-col gap-4" @submit.prevent="submit">
          <div>

            <FloatLabel variant="on" class="block w-full"><input
              v-model.number="form.monto" id="float-CobrarInversionModal-monto"
              type="number" min="0.01" step="0.01"
              required
              class="fintech-input w-full" :class="{ 'p-filled': form.monto !== '' && form.monto != null }"
              @blur="v$.monto.$touch()"
            /><label for="float-CobrarInversionModal-monto" class="text-xs" style="color:var(--color-text-secondary)">Monto a cobrar ($)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.monto.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.monto.$errors[0].$message }}</p>
            <p v-if="sugerido > 0" class="mt-1 text-[10px]" style="color:var(--color-text-muted)">Pendiente sugerido: {{ formatCurrency(sugerido) }}</p>
            <p v-if="nuevoTotal !== null" class="mt-1 text-xs" style="color:var(--color-text-secondary)">
              Total cobrado después: <span class="font-mono font-semibold" style="color:var(--color-text-secondary)">{{ formatCurrency(nuevoTotal) }}</span>
            </p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model="form.fecha_cobro" id="float-CobrarInversionModal-fecha_cobro" type="date" required class="fintech-input w-full" :class="{ 'p-filled': form.fecha_cobro !== '' && form.fecha_cobro != null }" @blur="v$.fecha_cobro.$touch()" /><label for="float-CobrarInversionModal-fecha_cobro" class="text-xs" style="color:var(--color-text-secondary)">Fecha de cobro<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.fecha_cobro.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.fecha_cobro.$errors[0].$message }}</p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><select v-model.number="form.cuenta_id" id="float-CobrarInversionModal-cuenta_id" required class="fintech-input w-full" :class="{ 'p-filled': form.cuenta_id !== '' && form.cuenta_id != null }" @blur="v$.cuenta_id.$touch()">
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}</option>
            </select><label for="float-CobrarInversionModal-cuenta_id" class="text-xs" style="color:var(--color-text-secondary)">Cuenta de ingreso<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.cuenta_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.cuenta_id.$errors[0].$message }}</p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model="form.nota" id="float-CobrarInversionModal-nota" type="text" class="fintech-input w-full" :class="{ 'p-filled': form.nota !== '' && form.nota != null }"  /><label for="float-CobrarInversionModal-nota" class="text-xs" style="color:var(--color-text-secondary)">Nota (opcional)</label></FloatLabel>
          </div>

          <!-- Toggle pago final (solo si no hay precio esperado o aún no se cubre) -->
          <label v-if="mostrarToggleFinal" class="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3" style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2)">
            <input v-model="form.es_pago_final" type="checkbox" class="h-4 w-4 accent-blue-500" />
            <span class="text-sm" style="color:var(--color-text-secondary)">Este es el pago final — cerrar inversión</span>
          </label>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-1">
            <button type="button" class="btn-ghost flex-1" @click="close">
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="btn-brand flex-1 disabled:opacity-50"
            >
              {{ saving ? 'Guardando…' : 'Registrar cobro' }}
            </button>
          </div>
        </form>
      </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useVuelidate } from '@vuelidate/core'
import { buildFormRules } from '../utils/formValidation'
import { todayDateInput } from '../utils/dates'
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
const v$ = useVuelidate(buildFormRules(form, { positive: { monto: 'El monto' }, dates: { fecha_cobro: 'La fecha de cobro' }, required: { cuenta_id: 'La cuenta de ingreso' } }), form)

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
  v$.value.$reset()
  errorMsg.value = ''
  saving.value   = false
  form.value = {
    monto:         '',
    fecha_cobro:   todayDateInput(),
    cuenta_id:     '',
    nota:          '',
    es_pago_final: false,
  }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  if (!(await v$.value.$validate())) return
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

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
