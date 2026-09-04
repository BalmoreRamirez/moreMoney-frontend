<template>
  <section>
    <!-- Encabezado -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold" style="color:var(--color-text-primary)">Tarjetas</h1>
        <p class="mt-1 text-sm" style="color:var(--color-text-secondary)">
          {{ store.total }} tarjeta{{ store.total !== 1 ? 's' : '' }} registrada{{ store.total !== 1 ? 's' : '' }}
        </p>
      </div>
      <button
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style="background: #10B981"
        @click="openCreate"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        Nueva tarjeta
      </button>
    </div>

    <!-- Estado de carga -->
    <div v-if="store.loading" class="mt-10 flex justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-success border-t-transparent" />
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="mt-6 rounded-xl px-5 py-4 text-sm" style="background: var(--color-danger-bg); color: var(--color-danger)">
      {{ store.error }}
    </div>

    <!-- Grid de tarjetas (donut rings) -->
    <div v-else-if="store.tarjetas.length"
      class="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

      <div
        v-for="t in store.tarjetas"
        :key="t.id"
        class="fintech-card group relative flex flex-col items-center px-4 py-5 text-center cursor-pointer card-item"
        @click="goToDetalle(t.id)"
      >
        <!-- Acciones hover -->
        <div class="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            class="action-btn"
            title="Editar"
            @click.stop="openEdit(t)"
          >
            <span class="material-symbols-outlined text-[13px]">edit</span>
          </button>
          <button
            class="action-btn action-btn--danger"
            title="Eliminar"
            @click.stop="confirmDelete(t)"
          >
            <span class="material-symbols-outlined text-[13px]">delete</span>
          </button>
        </div>

        <!-- Nombre y banco -->
        <p class="text-sm font-bold truncate w-full" style="color:var(--color-text-primary)">{{ t.nombre }}</p>
        <p class="text-[11px] mb-4" style="color:var(--color-text-muted)">{{ t.banco }}</p>

        <!-- Donut ring -->
        <div class="ring-wrap relative mb-3">
          <svg viewBox="0 0 100 100" class="ring-svg" style="transform:rotate(-90deg)">
            <circle cx="50" cy="50" r="40" fill="none" class="ring-track" stroke-width="9" />
            <circle cx="50" cy="50" r="40" fill="none"
              :stroke="pctColor(t)"
              stroke-width="9"
              stroke-linecap="round"
              :stroke-dasharray="CIRC"
              :stroke-dashoffset="CIRC * (1 - pctGastado(t) / 100)"
              style="transition:stroke-dashoffset 0.6s ease"
            />
            <circle
              :cx="50 + 40 * Math.sin(2 * Math.PI * pctGastado(t) / 100)"
              :cy="50 - 40 * Math.cos(2 * Math.PI * pctGastado(t) / 100)"
              r="4.5"
              :fill="pctColor(t)"
            />
          </svg>
          <div class="ring-center">
            <span class="font-mono text-2xl font-bold" :style="'color:' + pctColor(t)">{{ pctGastado(t) }}%</span>
          </div>
        </div>

        <!-- Montos -->
        <p class="font-mono text-xs font-semibold" style="color:var(--color-text-secondary)">
          {{ formatCurrency(t.saldo_gastado) }}
          <span style="color:var(--color-text-muted)"> / </span>
          {{ formatCurrency(t.limite_credito) }}
        </p>
        <p class="mt-0.5 text-[11px]" style="color:var(--color-text-muted)">utilizado</p>

        <div class="w-full my-3" style="border-top:1px solid var(--color-border)" />

        <!-- Disponible + día pago -->
        <div class="flex w-full justify-between text-left">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-wide" style="color:var(--color-text-muted)">Disponible</p>
            <p class="font-mono text-sm font-bold" style="color:var(--color-success)">{{ formatCurrency(t.saldo_disponible) }}</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-semibold uppercase tracking-wide" style="color:var(--color-text-muted)">Día pago</p>
            <p class="font-mono text-sm font-bold" style="color:var(--color-text-primary)">{{ t.dia_pago }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="mt-10 fintech-card flex flex-col items-center justify-center p-16 text-center">
      <span class="material-symbols-outlined text-5xl" style="color: rgba(16,185,129,0.35)">credit_card_off</span>
      <p class="mt-3 font-semibold text-slate-600">No tienes tarjetas registradas</p>
      <p class="mt-1 text-sm text-slate-500">Crea tu primera tarjeta para comenzar a controlar tus gastos.</p>
      <button
        class="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
        style="background: #10B981"
        @click="openCreate"
      >
        Agregar tarjeta
      </button>
    </div>

    <!-- Paginación -->
    <div v-if="store.totalPages > 1" class="mt-6 flex items-center justify-center gap-2">
      <button
        class="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-slate-500 transition-colors disabled:opacity-30 hover:bg-slate-100"
        :disabled="store.page === 1"
        @click="changePage(store.page - 1)"
      >
        <span class="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>

      <button
        v-for="p in pageRange"
        :key="p"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors"
        :class="p === store.page
          ? 'text-white'
          : 'text-slate-500 hover:bg-slate-100'"
        :style="p === store.page ? 'background: rgba(16,185,129,0.2); color: #10B981' : ''"
        @click="changePage(p)"
      >
        {{ p }}
      </button>

      <button
        class="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-slate-500 transition-colors disabled:opacity-30 hover:bg-slate-100"
        :disabled="store.page === store.totalPages"
        @click="changePage(store.page + 1)"
      >
        <span class="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </div>

    <!-- Modal crear/editar -->
    <TarjetaFormModal
      v-model="showModal"
      :tarjeta-edit="editTarget"
      @saved="onSaved"
    />

    <!-- Confirm delete -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="deleteTarget = null">
          <div class="absolute inset-0" style="background: rgba(7,17,31,0.8); backdrop-filter: blur(6px)" />
          <div class="relative w-full max-w-sm rounded-2xl p-6 shadow-card" style="background:var(--color-surface);border:1px solid var(--color-border)">
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style="background:var(--color-danger-bg)">
                <span class="material-symbols-outlined" style="color:var(--color-danger)">warning</span>
              </div>
              <div>
                <h3 class="font-semibold" style="color:var(--color-text-primary)">Eliminar tarjeta</h3>
                <p class="mt-1 text-sm" style="color:var(--color-text-secondary)">
                  ¿Eliminar <strong style="color:var(--color-text-primary)">{{ deleteTarget?.nombre }}</strong>? Esta acción no se puede deshacer.
                </p>
                <p v-if="deleteError" class="mt-2 text-xs" style="color:var(--color-danger)">{{ deleteError }}</p>
              </div>
            </div>
            <div class="mt-5 flex gap-3">
              <button class="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors" style="color:var(--color-text-secondary);background:var(--color-surface-mid);border:none;cursor:pointer" @click="deleteTarget = null">Cancelar</button>
              <button
                class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style="background: #DC2626"
                :disabled="deleting"
                @click="doDelete"
              >
                {{ deleting ? 'Eliminando…' : 'Eliminar' }}
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
import { useRouter } from 'vue-router'
import { useTarjetasStore } from '../stores/tarjetas'
import TarjetaFormModal from '../components/TarjetaFormModal.vue'
import { formatCurrency } from '../utils/currency'

const store  = useTarjetasStore()
const router = useRouter()

onMounted(() => store.fetchTarjetas())

// ── Donut helpers ──────────────────────────────────────────
const CIRC = 2 * Math.PI * 40

function pctGastado(t) {
  const lim = parseFloat(t.limite_credito)
  if (!lim) return 0
  return Math.min(100, Math.round((parseFloat(t.saldo_gastado) / lim) * 100))
}

function pctColor(t) {
  const p = pctGastado(t)
  if (p >= 80) return 'var(--color-danger)'
  if (p >= 50) return 'var(--color-alert)'
  return 'var(--color-success)'
}

// Paginación
const pageRange = computed(() => {
  const pages = []
  for (let i = 1; i <= store.totalPages; i++) pages.push(i)
  return pages
})
function changePage(p) { store.fetchTarjetas(p) }

// Navegación
function goToDetalle(id) { router.push(`/tarjetas/${id}`) }

// Crear
const showModal  = ref(false)
const editTarget = ref(null)
function openCreate() { editTarget.value = null; showModal.value = true }
function openEdit(t)  { editTarget.value = t;    showModal.value = true }

async function onSaved(payload) {
  try {
    if (payload.id) await store.updateTarjeta(payload.id, payload)
    else            await store.createTarjeta(payload)
  } catch (e) {
    console.error(e)
  }
}

// Eliminar
const deleteTarget = ref(null)
const deleteError  = ref('')
const deleting     = ref(false)
function confirmDelete(t) { deleteTarget.value = t; deleteError.value = '' }

async function doDelete() {
  deleting.value = true
  deleteError.value = ''
  try {
    await store.deleteTarjeta(deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) {
    deleteError.value = e.response?.data?.error || 'No se pudo eliminar la tarjeta'
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }

.card-item {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.card-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.10);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: var(--color-surface-high);
  color: var(--color-text-secondary);
  transition: background 0.15s;
}
.action-btn:hover { background: var(--color-border); }
.action-btn--danger:hover { background: var(--color-danger-bg); color: var(--color-danger); }

.ring-wrap { width: 130px; height: 130px; flex-shrink: 0; }
.ring-svg  { width: 100%; height: 100%; }
.ring-track { stroke: var(--color-border); }
[data-theme="dark"] .ring-track { stroke: var(--color-surface-high); }
.ring-center {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}
</style>
