<template>
  <section>
    <!-- Back -->
    <button
      class="mb-5 flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
      @click="router.back()"
    >
      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
      Volver a préstamos
    </button>

    <!-- Loading -->
    <div v-if="store.loading && !store.prestamo" class="flex justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-success border-t-transparent" />
    </div>

    <template v-else-if="store.prestamo">
      <!-- Encabezado -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-slate-800">{{ store.prestamo.deudor_nombre }}</h1>
            <span
              class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :style="store.prestamo.estado === 'activo'
                ? 'background:rgba(217,119,6,0.12);color:#D97706'
                : 'background:rgba(16,185,129,0.15);color:#10B981'"
            >
              {{ store.prestamo.estado === 'activo' ? 'Activo' : 'Pagado' }}
            </span>
          </div>
          <p class="mt-1 text-sm text-slate-400">
            {{ pctTasa(store.prestamo.tasa_interes_mensual) }}% interés mensual ·
            {{ store.prestamo.meses_transcurridos }} mes{{ store.prestamo.meses_transcurridos !== 1 ? 'es' : '' }} ·
            Cuenta: {{ store.prestamo.cuenta?.nombre }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2" v-if="store.prestamo.estado === 'activo'">
          <button
            class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            style="background:#10B981"
            @click="showAbonoModal = true"
          >
            <span class="material-symbols-outlined text-[18px]">payments</span>
            <span class="hidden sm:inline">Registrar abono</span>
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Capital</p>
          <p class="mt-1.5 font-mono text-xl font-bold text-slate-700">{{ formatCurrency(store.prestamo.capital) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Interés generado</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:#D97706">{{ formatCurrency(store.prestamo.interes_generado) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Total pagado</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:#10B981">{{ formatCurrency(store.prestamo.total_pagado) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Saldo pendiente</p>
          <p
            class="mt-1.5 font-mono text-xl font-bold"
            :style="{ color: store.prestamo.saldo_pendiente <= 0 ? '#10B981' : '#DC2626' }"
          >
            {{ formatCurrency(Math.max(0, store.prestamo.saldo_pendiente)) }}
          </p>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="mt-4 fintech-card p-5">
        <div class="flex justify-between text-xs text-slate-500 mb-2">
          <span>Progreso de recuperación</span>
          <span>{{ progresoPct }}% — {{ formatCurrency(store.prestamo.total_pagado) }} de {{ formatCurrency(store.prestamo.total_deuda) }}</span>
        </div>
        <div class="h-2.5 rounded-full overflow-hidden" style="background:#E8EDF5">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: progresoPct + '%', background: store.prestamo.saldo_pendiente <= 0 ? '#10B981' : '#D97706' }"
          />
        </div>
        <p v-if="store.prestamo.ganancia > 0" class="mt-2 text-xs text-slate-500">
          Ganancia generada hasta hoy:
          <span class="font-mono font-semibold" style="color:#10B981">{{ formatCurrency(store.prestamo.ganancia) }}</span>
        </p>
      </div>

      <!-- Historial de abonos -->
      <div class="mt-6">
        <h2 class="mb-3 text-sm font-semibold text-slate-600">Historial de abonos</h2>

        <div v-if="!store.prestamo.pagos?.length" class="fintech-card flex flex-col items-center py-10 text-center">
          <span class="material-symbols-outlined text-4xl" style="color:rgba(10,25,47,0.08)">receipt_long</span>
          <p class="mt-2 text-sm text-slate-500">Sin abonos registrados</p>
        </div>

        <div v-else class="fintech-card overflow-x-auto">
          <table class="min-w-[460px] w-full text-sm">
            <thead>
              <tr style="border-bottom:1px solid #E2E8F0">
                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Monto</th>
                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nota</th>
                <th class="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="pago in store.prestamo.pagos"
                :key="pago.id"
                class="transition-colors hover:bg-slate-50"
                style="border-bottom:1px solid #E2E8F0"
              >
                <td class="px-4 py-3 text-slate-600">{{ pago.fecha_pago }}</td>
                <td class="px-4 py-3 text-right font-mono font-semibold" style="color:#10B981">{{ formatCurrency(pago.monto) }}</td>
                <td class="px-4 py-3 text-slate-500">{{ pago.nota || '—' }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      class="flex items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      title="Editar abono"
                      @click="abrirEditar(pago)"
                    >
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      class="flex items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Eliminar abono"
                      @click="pedirConfirmacion(pago)"
                    >
                      <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ═══ MODALES ═══════════════════════════════════════════════════════════ -->

    <AbonoFormModal
      v-model="showAbonoModal"
      :prestamo="store.prestamo"
      @saved="onAbono"
    />

    <!-- Modal de edición de abono -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="abonoEditando" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="abonoEditando = null">
          <div class="absolute inset-0" style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)" />
          <div class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-card" style="border:1px solid #E2E8F0">
            <h3 class="mb-4 font-semibold text-slate-800">Editar abono</h3>

            <div class="space-y-3">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">Monto</label>
                <input v-model.number="editForm.monto" type="number" min="0.01" step="0.01" class="fintech-input w-full" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">Fecha de pago</label>
                <input v-model="editForm.fecha_pago" type="date" class="fintech-input w-full" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">Nota</label>
                <input v-model="editForm.nota" type="text" class="fintech-input w-full" placeholder="Opcional" />
              </div>
            </div>

            <div v-if="errorEditar" class="mt-3 rounded-lg px-3 py-2 text-sm" style="background:rgba(220,38,38,0.07);color:#DC2626;border:1px solid rgba(220,38,38,0.2)">
              {{ errorEditar }}
            </div>

            <div class="mt-5 flex gap-3">
              <button class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50" :disabled="guardando" @click="abonoEditando = null">
                Cancelar
              </button>
              <button
                class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style="background:#10B981"
                :disabled="guardando"
                @click="guardarEdicion"
              >
                {{ guardando ? 'Guardando…' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal de confirmación: eliminar abono -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="abonoAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="abonoAEliminar = null">
          <div class="absolute inset-0" style="background:rgba(15,23,42,0.45);backdrop-filter:blur(6px)" />
          <div class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-card" style="border:1px solid #E2E8F0">
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style="background:rgba(220,38,38,0.08)">
                <span class="material-symbols-outlined text-[22px]" style="color:#DC2626">delete</span>
              </div>
              <div>
                <h3 class="font-semibold text-slate-800">¿Eliminar abono?</h3>
                <p class="mt-1 text-sm text-slate-500">
                  Se eliminará el abono de
                  <span class="font-semibold text-slate-700">{{ formatCurrency(abonoAEliminar.monto) }}</span>
                  del <span class="font-semibold text-slate-700">{{ abonoAEliminar.fecha_pago }}</span>.
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div v-if="errorEliminar" class="mt-4 rounded-lg px-3 py-2 text-sm" style="background:rgba(220,38,38,0.07);color:#DC2626;border:1px solid rgba(220,38,38,0.2)">
              {{ errorEliminar }}
            </div>

            <div class="mt-5 flex gap-3">
              <button
                class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
                :disabled="eliminando"
                @click="abonoAEliminar = null"
              >
                Cancelar
              </button>
              <button
                class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style="background:#DC2626"
                :disabled="eliminando"
                @click="confirmarEliminar"
              >
                {{ eliminando ? 'Eliminando…' : 'Sí, eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter }  from 'vue-router'
import { usePrestamosStore }    from '../stores/prestamos'
import { formatCurrency }       from '../utils/currency'
import AbonoFormModal           from '../components/AbonoFormModal.vue'

const store  = usePrestamosStore()
const route  = useRoute()
const router = useRouter()

onMounted(() => store.fetchPrestamo(route.params.id))

function pctTasa(t) { return parseFloat((parseFloat(t) * 100).toFixed(2)) }

const progresoPct = computed(() => {
  const p = store.prestamo
  if (!p || !p.total_deuda || p.total_deuda <= 0) return 100
  return Math.min(100, Math.round((p.total_pagado / p.total_deuda) * 100))
})

// Abono
const showAbonoModal = ref(false)

async function onAbono(payload) {
  await store.registrarAbono(route.params.id, payload)
}

// Editar abono
const abonoEditando = ref(null)
const editForm      = ref({ monto: 0, fecha_pago: '', nota: '' })
const guardando     = ref(false)
const errorEditar   = ref('')

function abrirEditar(pago) {
  abonoEditando.value = pago
  editForm.value      = { monto: parseFloat(pago.monto), fecha_pago: pago.fecha_pago, nota: pago.nota || '' }
  errorEditar.value   = ''
}

async function guardarEdicion() {
  guardando.value   = true
  errorEditar.value = ''
  try {
    await store.updateAbono(route.params.id, abonoEditando.value.id, editForm.value)
    abonoEditando.value = null
  } catch (e) {
    errorEditar.value = e?.response?.data?.error || 'Error al guardar el abono'
  } finally {
    guardando.value = false
  }
}

// Eliminar abono
const abonoAEliminar = ref(null)
const eliminando     = ref(false)
const errorEliminar  = ref('')

function pedirConfirmacion(pago) {
  abonoAEliminar.value = pago
  errorEliminar.value  = ''
}

async function confirmarEliminar() {
  eliminando.value    = true
  errorEliminar.value = ''
  try {
    await store.deleteAbono(route.params.id, abonoAEliminar.value.id)
    abonoAEliminar.value = null
  } catch (e) {
    errorEliminar.value = e?.response?.data?.error || 'Error al eliminar el abono'
  } finally {
    eliminando.value = false
  }
}
</script>
