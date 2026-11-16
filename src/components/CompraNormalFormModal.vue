<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close">
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)" />

        <div class="relative w-full max-w-md rounded-2xl p-6 shadow-card" style="background:var(--color-surface);border:1px solid var(--color-border)">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-lg font-semibold" style="color:var(--color-text-primary)">{{ editData ? 'Editar compra' : 'Nueva compra normal' }}</h2>
            <button class="icon-btn" @click="close">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form novalidate @submit.prevent="submit" class="space-y-4">
            <!-- Tarjeta -->
            <div>

              <FloatLabel variant="on" class="block w-full"><select v-model="form.tarjeta_id" id="float-CompraNormalFormModal-tarjeta_id" class="fintech-input" :class="{ 'p-filled': form.tarjeta_id !== '' && form.tarjeta_id != null }" required @blur="v$.tarjeta_id.$touch()">
                <option v-for="t in tarjetas" :key="t.id" :value="t.id">
                  {{ t.nombre }} — {{ t.banco }}
                </option>
              </select><label for="float-CompraNormalFormModal-tarjeta_id" class="text-xs" style="color:var(--color-text-muted)">Tarjeta<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.tarjeta_id.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.tarjeta_id.$errors[0].$message }}</p>
              <p v-if="errors.tarjeta_id" class="mt-1 text-xs text-danger">{{ errors.tarjeta_id }}</p>
            </div>

            <!-- Nombre -->
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model.trim="form.nombre" id="float-CompraNormalFormModal-nombre" type="text" class="fintech-input" :class="{ 'p-filled': form.nombre !== '' && form.nombre != null }" required @blur="v$.nombre.$touch()" /><label for="float-CompraNormalFormModal-nombre" class="text-xs" style="color:var(--color-text-muted)">Descripción<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.nombre.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.nombre.$errors[0].$message }}</p>
              <p v-if="errors.nombre" class="mt-1 text-xs text-danger">{{ errors.nombre }}</p>
            </div>

            <!-- Monto -->
            <div>

              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm" style="color:var(--color-text-muted)">$</span>
                <FloatLabel variant="on" class="block w-full"><input v-model="form.monto" id="float-CompraNormalFormModal-monto" type="number" step="0.01" min="0.01" class="fintech-input pl-7 font-mono" :class="{ 'p-filled': form.monto !== '' && form.monto != null }" required @blur="v$.monto.$touch()" /><label for="float-CompraNormalFormModal-monto" class="text-xs" style="color:var(--color-text-muted)">Monto<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.monto.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.monto.$errors[0].$message }}</p>
              </div>
              <p v-if="errors.monto" class="mt-1 text-xs text-danger">{{ errors.monto }}</p>
            </div>

            <!-- Fecha -->
            <div>

              <FloatLabel variant="on" class="block w-full"><input v-model="form.fecha_compra" id="float-CompraNormalFormModal-fecha_compra" type="date" class="fintech-input" :class="{ 'p-filled': form.fecha_compra !== '' && form.fecha_compra != null }" required @blur="v$.fecha_compra.$touch()" /><label for="float-CompraNormalFormModal-fecha_compra" class="text-xs" style="color:var(--color-text-muted)">Fecha de compra<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.fecha_compra.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.fecha_compra.$errors[0].$message }}</p>
              <p v-if="errors.fecha_compra" class="mt-1 text-xs text-danger">{{ errors.fecha_compra }}</p>
            </div>

            <!-- Estado (solo en edición) -->
            <div v-if="editData">

              <FloatLabel variant="on" class="block w-full"><select v-model="form.estado" id="float-CompraNormalFormModal-estado" class="fintech-input" :class="{ 'p-filled': form.estado !== '' && form.estado != null }">
                <option value="pendiente">Pendiente</option>
                <option value="pagada">Pagada</option>
              </select><label for="float-CompraNormalFormModal-estado" class="text-xs" style="color:var(--color-text-muted)">Estado</label></FloatLabel>
            </div>

            <div v-if="serverError" class="rounded-lg px-4 py-3 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger);border:1px solid var(--color-danger-border)">
              {{ serverError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" class="btn-ghost flex-1" @click="close">Cancelar</button>
              <button type="submit" :disabled="saving" class="btn-brand flex-1 disabled:opacity-50">
                {{ saving ? 'Guardando…' : (editData ? 'Guardar cambios' : 'Registrar compra') }}
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
import { ref, watch }         from 'vue'
import { useComprasStore }   from '../stores/compras'
import { useToast }          from '../composables/useToast'

const props = defineProps({
  modelValue:       Boolean,
  tarjetas:         { type: Array, default: () => [] },
  editData:         { type: Object, default: null },
  defaultTarjetaId: { type: [Number, String], default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const today = todayDateInput()
const EMPTY = { tarjeta_id: '', nombre: '', monto: '', fecha_compra: today, estado: 'pendiente' }

const comprasStore = useComprasStore()
const toast        = useToast()

const form        = ref({ ...EMPTY })
const errors      = ref({})
const serverError = ref('')
const v$ = useVuelidate(buildFormRules(form, { required: { tarjeta_id: 'La tarjeta', nombre: 'La descripción' }, positive: { monto: 'El monto' }, dates: { fecha_compra: 'La fecha de compra' } }), form)

const saving      = ref(false)

watch(() => props.modelValue, (open) => {
  if (open) {
    v$.value.$reset()
    errors.value      = {}
    serverError.value = ''
    if (props.editData) {
      form.value = {
        tarjeta_id:   props.editData.tarjeta_id,
        nombre:       props.editData.nombre,
        monto:        props.editData.monto,
        fecha_compra: props.editData.fecha_compra,
        estado:       props.editData.estado ?? 'pendiente',
      }
    } else {
      form.value = { ...EMPTY, tarjeta_id: props.defaultTarjetaId ?? '' }
    }
  }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  if (!(await v$.value.$validate())) return
  saving.value      = true
  serverError.value = ''
  try {
    if (props.editData) {
      await comprasStore.updateNormal(props.editData.id, form.value)
      toast.success('Compra actualizada')
    } else {
      await comprasStore.createNormal(form.value)
      toast.success('Compra registrada')
    }
    emit('saved')
    close()
  } catch (err) {
    serverError.value = err?.response?.data?.error || err.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
