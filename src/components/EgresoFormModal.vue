<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="close">
        <div class="absolute inset-0" style="background:rgba(7,17,31,0.82);backdrop-filter:blur(6px)" />

        <div class="relative w-full max-w-md rounded-2xl shadow-card" style="background:#0D2240;border:1px solid rgba(255,255,255,0.1)">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 pb-4">
            <h2 class="text-lg font-semibold text-white">{{ egreso ? 'Editar egreso' : 'Nuevo egreso' }}</h2>
            <button class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white" @click="close">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Form -->
          <form class="px-6 pb-6 space-y-4" @submit.prevent="submit">

            <!-- Descripción -->
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Descripción</label>
              <input
                v-model="form.descripcion"
                type="text"
                class="fintech-input"
                placeholder="Ej: Pago de electricidad"
                required
              />
            </div>

            <!-- Monto -->
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Monto</label>
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

            <!-- Fecha -->
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</label>
              <input
                v-model="form.fecha"
                type="date"
                class="fintech-input"
                required
              />
            </div>

            <!-- Cuenta -->
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Cuenta</label>
              <select v-model.number="form.cuenta_id" class="fintech-input" required>
                <option :value="null" disabled>Selecciona una cuenta</option>
                <option v-for="c in cuentas" :key="c.id" :value="c.id">
                  {{ c.nombre }} ({{ c.tipo }})
                </option>
              </select>
            </div>

            <!-- Error -->
            <p v-if="errorMsg" class="text-sm" style="color:#DC2626">{{ errorMsg }}</p>

            <!-- Actions -->
            <div class="flex gap-3 pt-1">
              <button type="button" class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5" @click="close">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                style="background:#DC2626"
              >
                {{ saving ? 'Guardando…' : (egreso ? 'Guardar cambios' : 'Registrar egreso') }}
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
import { useEgresosStore }  from '../stores/egresos'
import { useCuentasStore }  from '../stores/cuentas'

const props = defineProps({
  modelValue: Boolean,
  egreso:     { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const egresosStore = useEgresosStore()
const cuentasStore = useCuentasStore()
const cuentas      = computed(() => cuentasStore.cuentas)

const today = new Date().toISOString().split('T')[0]

const defaultForm = () => ({
  descripcion: '',
  monto:       null,
  fecha:       today,
  cuenta_id:   null,
})

const form     = ref(defaultForm())
const saving   = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, async (open) => {
  if (open) {
    errorMsg.value = ''
    if (props.egreso) {
      form.value = {
        descripcion: props.egreso.descripcion,
        monto:       parseFloat(props.egreso.monto),
        fecha:       props.egreso.fecha,
        cuenta_id:   props.egreso.cuenta_id,
      }
    } else {
      form.value = defaultForm()
    }
    if (!cuentasStore.cuentas.length) await cuentasStore.fetchCuentas()
  }
})

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  saving.value   = true
  errorMsg.value = ''
  try {
    if (props.egreso) {
      await egresosStore.updateEgreso(props.egreso.id, form.value)
    } else {
      await egresosStore.createEgreso(form.value)
    }
    emit('saved')
    close()
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
