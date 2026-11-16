<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close" @keydown.esc="close">
        <div
          class="absolute inset-0"
          style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)"
        />
      <div
        class="relative w-full max-w-sm rounded-2xl p-6 shadow-card"
        style="background:var(--color-surface);border:1px solid var(--color-border)"
      >
        <div class="flex items-center gap-3 mb-5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl" style="background:var(--color-brand-light)">
            <span class="material-symbols-outlined text-[20px]" style="color:var(--color-brand)">swap_horiz</span>
          </div>
          <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">Mover fondos</h2>
        </div>

        <form novalidate class="flex flex-col gap-4" @submit.prevent="submit">
          <div>

            <FloatLabel variant="on" class="block w-full"><select v-model.number="form.origen_id" id="float-TransferenciaModal-origen_id" required class="fintech-input w-full" :class="{ 'p-filled': form.origen_id !== '' && form.origen_id != null }" @change="onOrigenChange" @blur="v$.origen_id.$touch()">
              <option
                v-for="c in cuentas"
                :key="c.id"
                :value="c.id"
                :disabled="c.id === form.destino_id"
              >
                {{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}
              </option>
            </select><label for="float-TransferenciaModal-origen_id" class="text-xs" style="color:var(--color-text-muted)">Cuenta origen<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.origen_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.origen_id.$errors[0].$message }}</p>
          </div>

          <!-- Flecha visual -->
          <div class="flex items-center justify-center">
            <span class="material-symbols-outlined" style="color:var(--color-text-muted)">arrow_downward</span>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><select v-model.number="form.destino_id" id="float-TransferenciaModal-destino_id" required class="fintech-input w-full" :class="{ 'p-filled': form.destino_id !== '' && form.destino_id != null }" @blur="v$.destino_id.$touch()">
              <option
                v-for="c in cuentas"
                :key="c.id"
                :value="c.id"
                :disabled="c.id === form.origen_id"
              >
                {{ c.nombre }} — {{ formatCurrency(c.saldo_actual) }}
              </option>
            </select><label for="float-TransferenciaModal-destino_id" class="text-xs" style="color:var(--color-text-muted)">Cuenta destino<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.destino_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.destino_id.$errors[0].$message }}</p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input
              v-model.number="form.monto" id="float-TransferenciaModal-monto"
              type="number"
              min="0.01"
              step="0.01"
              required
              class="fintech-input w-full" :class="{ 'p-filled': form.monto !== '' && form.monto != null }"
            @blur="v$.monto.$touch()" /><label for="float-TransferenciaModal-monto" class="text-xs" style="color:var(--color-text-muted)">Monto ($)<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.monto.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.monto.$errors[0].$message }}</p>
            <p v-if="saldoOrigen !== null" class="mt-1 text-[10px]" style="color:var(--color-text-muted)">
              Disponible: <span class="font-mono" style="color:var(--color-brand)">{{ formatCurrency(saldoOrigen) }}</span>
            </p>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input
              v-model="form.descripcion" id="float-TransferenciaModal-descripcion"
              type="text"
              class="fintech-input w-full" :class="{ 'p-filled': form.descripcion !== '' && form.descripcion != null }"
             /><label for="float-TransferenciaModal-descripcion" class="text-xs" style="color:var(--color-text-muted)">Descripción (opcional)</label></FloatLabel>
          </div>

          <div>

            <FloatLabel variant="on" class="block w-full"><input v-model="form.fecha" id="float-TransferenciaModal-fecha" type="date" required class="fintech-input w-full" :class="{ 'p-filled': form.fecha !== '' && form.fecha != null }" @blur="v$.fecha.$touch()" /><label for="float-TransferenciaModal-fecha" class="text-xs" style="color:var(--color-text-muted)">Fecha<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.fecha.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.fecha.$errors[0].$message }}</p>
          </div>

          <p v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              class="btn-ghost flex-1"
              @click="close"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style="background:var(--color-brand)"
            >
              {{ saving ? 'Moviendo…' : 'Confirmar' }}
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

const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit  = defineEmits(['update:modelValue', 'saved'])

const cuentasStore = useCuentasStore()
const cuentas      = computed(() => cuentasStore.cuentas)

const today = todayDateInput()
const form  = ref({ origen_id: '', destino_id: '', monto: '', descripcion: '', fecha: today })
const v$ = useVuelidate(buildFormRules(form, { required: { origen_id: 'La cuenta de origen', destino_id: 'La cuenta de destino' }, distinct: { destino_id: { other: 'origen_id', message: 'Las cuentas de origen y destino deben ser diferentes.' } }, positive: { monto: 'El monto' }, dates: { fecha: 'La fecha' } }), form)

const saving   = ref(false)
const errorMsg = ref('')

const saldoOrigen = computed(() => {
  if (!form.value.origen_id) return null
  const c = cuentas.value.find(x => x.id === form.value.origen_id)
  return c ? c.saldo_actual : null
})

watch(() => props.modelValue, (open) => {
  if (!open) return
  v$.value.$reset()
  saving.value   = false
  errorMsg.value = ''
  form.value     = { origen_id: '', destino_id: '', monto: '', descripcion: '', fecha: today }
})

function onOrigenChange() {
  if (form.value.destino_id === form.value.origen_id) form.value.destino_id = ''
}

function close() { emit('update:modelValue', false) }

async function submit() {
  if (!(await v$.value.$validate())) return
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

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
