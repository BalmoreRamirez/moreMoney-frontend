<template>
  <section>
    <!-- Back -->
    <button
      class="mb-5 flex items-center gap-1.5 text-sm transition-colors"
      style="color:var(--color-text-muted)"
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
            <h1 class="text-2xl font-bold" style="color:var(--color-text-primary)">{{ store.prestamo.deudor_nombre }}</h1>
            <span
              class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :style="store.prestamo.estado === 'activo'
                ? 'background:rgba(248,189,38,0.15);color:var(--color-alert)'
                : 'background:rgba(16,185,129,0.15);color:var(--color-success)'"
            >
              {{ store.prestamo.estado === 'activo' ? 'Activo' : 'Pagado' }}
            </span>
          </div>
          <p class="mt-1 text-sm" style="color:var(--color-text-muted)">
            {{ pctTasa(store.prestamo.tasa_interes_mensual) }}% interés mensual ·
            {{ store.prestamo.meses_transcurridos }} mes{{ store.prestamo.meses_transcurridos !== 1 ? 'es' : '' }} ·
            Cuenta: {{ store.prestamo.cuenta?.nombre }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2" v-if="store.prestamo.estado === 'activo'">
          <button
            class="btn-brand"
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
          <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Capital</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:var(--color-text-primary)">{{ formatCurrency(store.prestamo.capital) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Interés generado</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:var(--color-alert)">{{ formatCurrency(store.prestamo.interes_generado) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Total pagado</p>
          <p class="mt-1.5 font-mono text-xl font-bold" style="color:var(--color-success)">{{ formatCurrency(store.prestamo.total_pagado) }}</p>
        </div>
        <div class="fintech-card p-4">
          <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Saldo pendiente</p>
          <p
            class="mt-1.5 font-mono text-xl font-bold"
            :style="{ color: store.prestamo.saldo_pendiente <= 0 ? 'var(--color-success)' : 'var(--color-danger)' }"
          >
            {{ formatCurrency(Math.max(0, store.prestamo.saldo_pendiente)) }}
          </p>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="mt-4 fintech-card p-5">
        <div class="flex justify-between text-xs mb-2" style="color:var(--color-text-muted)">
          <span>Progreso de recuperación</span>
          <span>{{ progresoPct }}% — {{ formatCurrency(store.prestamo.total_pagado) }} de {{ formatCurrency(store.prestamo.total_deuda) }}</span>
        </div>
        <div class="progress-bar-track">
          <div
            class="progress-bar-fill transition-all duration-500"
            :class="store.prestamo.saldo_pendiente <= 0 ? '' : 'progress-bar-fill--accent'"
            :style="{ width: progresoPct + '%' }"
          />
        </div>
        <p v-if="store.prestamo.ganancia > 0" class="mt-2 text-xs" style="color:var(--color-text-muted)">
          Ganancia generada hasta hoy:
          <span class="font-mono font-semibold" style="color:var(--color-success)">{{ formatCurrency(store.prestamo.ganancia) }}</span>
        </p>
      </div>

      <!-- Historial de abonos -->
      <div class="mt-6">
        <h2 class="mb-3 text-sm font-semibold" style="color:var(--color-text-secondary)">Historial de abonos</h2>

        <div v-if="!store.prestamo.pagos?.length" class="fintech-card flex flex-col items-center py-10 text-center">
          <span class="material-symbols-outlined text-4xl" style="color:var(--color-brand-light)">receipt_long</span>
          <p class="mt-2 text-sm" style="color:var(--color-text-muted)">Sin abonos registrados</p>
        </div>

        <div v-else class="fintech-card overflow-x-auto">
          <table class="min-w-[460px] w-full text-sm">
            <thead>
              <tr style="border-bottom:1px solid var(--color-border)">
                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Fecha</th>
                <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Monto</th>
                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Nota</th>
                <th class="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="pago in store.prestamo.pagos"
                :key="pago.id"
                class="transition-colors"
                style="border-bottom:1px solid var(--color-border)"
              >
                <td class="px-4 py-3" style="color:var(--color-text-secondary)">{{ pago.fecha_pago }}</td>
                <td class="px-4 py-3 text-right font-mono font-semibold" style="color:var(--color-success)">{{ formatCurrency(pago.monto) }}</td>
                <td class="px-4 py-3" style="color:var(--color-text-muted)">{{ pago.nota || '—' }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button class="icon-btn" title="Editar abono" @click="abrirEditar(pago)">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button class="icon-btn-danger" title="Eliminar abono" @click="pedirConfirmacion(pago)">
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
          <div class="relative w-full max-w-sm rounded-2xl p-6 shadow-card" style="background:var(--color-surface);border:1px solid var(--color-border)">
            <h3 class="mb-4 font-semibold" style="color:var(--color-text-primary)">Editar abono</h3>

            <div class="space-y-3">
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Monto</label>
                <input v-model.number="editForm.monto" type="number" min="0.01" step="0.01" class="fintech-input w-full" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Fecha de pago</label>
                <input v-model="editForm.fecha_pago" type="date" class="fintech-input w-full" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Nota</label>
                <input v-model="editForm.nota" type="text" class="fintech-input w-full" placeholder="Opcional" />
              </div>
            </div>

            <div v-if="errorEditar" class="mt-3 rounded-lg px-3 py-2 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger);border:1px solid rgba(220,38,38,0.2)">
              {{ errorEditar }}
            </div>

            <div class="mt-5 flex gap-3">
              <button class="btn-ghost flex-1" :disabled="guardando" @click="abonoEditando = null">Cancelar</button>
              <button class="btn-brand flex-1 disabled:opacity-50" :disabled="guardando" @click="guardarEdicion">
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
          <div class="relative w-full max-w-sm rounded-2xl p-6 shadow-card" style="background:var(--color-surface);border:1px solid var(--color-border)">
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style="background:var(--color-danger-bg)">
                <span class="material-symbols-outlined text-[22px]" style="color:var(--color-danger)">delete</span>
              </div>
              <div>
                <h3 class="font-semibold" style="color:var(--color-text-primary)">¿Eliminar abono?</h3>
                <p class="mt-1 text-sm" style="color:var(--color-text-secondary)">
                  Se eliminará el abono de
                  <span class="font-semibold" style="color:var(--color-text-primary)">{{ formatCurrency(abonoAEliminar.monto) }}</span>
                  del <span class="font-semibold" style="color:var(--color-text-primary)">{{ abonoAEliminar.fecha_pago }}</span>.
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div v-if="errorEliminar" class="mt-4 rounded-lg px-3 py-2 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger);border:1px solid rgba(220,38,38,0.2)">
              {{ errorEliminar }}
            </div>

            <div class="mt-5 flex gap-3">
              <button class="btn-ghost flex-1" :disabled="eliminando" @click="abonoAEliminar = null">Cancelar</button>
              <button
                class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style="background:var(--color-danger)"
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
