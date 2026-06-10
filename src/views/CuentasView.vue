<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Cuentas</h1>
        <p class="mt-1 text-sm text-slate-400">Control de tus billeteras y flujo de dinero.</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="store.cuentas.length >= 2"
          class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          style="background:#A78BFA"
          @click="showTransferModal = true"
        >
          <span class="material-symbols-outlined text-[18px]">swap_horiz</span>
          <span class="hidden sm:inline">Mover fondos</span>
        </button>
        <button
          class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          style="background:#10B981"
          @click="openCreate"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span class="hidden sm:inline">Nueva cuenta</span>
        </button>
      </div>
    </div>

    <!-- Saldo total consolidado -->
    <div v-if="!store.loading && store.cuentas.length" class="mt-6 fintech-card p-6 text-center" style="background:linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(10,25,47,0) 100%);border-color:rgba(16,185,129,0.2)">
      <p class="text-xs font-medium uppercase tracking-widest text-slate-500">Saldo total disponible</p>
      <p class="mt-2 font-mono font-bold" :style="{ fontSize: 'clamp(2rem,8vw,3rem)', color: store.saldo_total >= 0 ? '#10B981' : '#DC2626' }">
        {{ formatCurrency(store.saldo_total) }}
      </p>
      <p class="mt-1 text-xs text-slate-500">{{ store.cuentas.length }} cuenta{{ store.cuentas.length !== 1 ? 's' : '' }} activa{{ store.cuentas.length !== 1 ? 's' : '' }}</p>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="mt-10 flex justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-success border-t-transparent" />
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="mt-4 rounded-xl px-5 py-4 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger)">
      {{ store.error }}
    </div>

    <!-- Grid de cuentas -->
    <div v-else-if="store.cuentas.length" class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="c in store.cuentas"
        :key="c.id"
        class="fintech-card p-5 cursor-pointer transition-all hover:border-white/20 hover:-translate-y-0.5"
        @click="goToDetalle(c.id)"
      >
        <!-- Cabecera -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl" :style="iconoBg(c.tipo)">
              <span class="material-symbols-outlined text-[20px]" :style="{ color: iconoColor(c.tipo) }">{{ iconoTipo(c.tipo) }}</span>
            </div>
            <div>
              <p class="font-semibold text-slate-100">{{ c.nombre }}</p>
              <p class="text-xs capitalize text-slate-500">{{ c.tipo }}</p>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex gap-1" @click.stop>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-200"
              title="Editar"
              @click="openEdit(c)"
            >
              <span class="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-danger"
              title="Eliminar"
              @click="confirmDelete(c)"
            >
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>

        <!-- Saldo actual -->
        <div class="mt-4">
          <p class="text-[10px] uppercase tracking-wider text-slate-600">Saldo actual</p>
          <p class="mt-1 font-mono text-2xl font-bold" :style="{ color: c.saldo_actual >= 0 ? '#10B981' : '#DC2626' }">
            {{ formatCurrency(c.saldo_actual) }}
          </p>
        </div>

        <!-- Métricas ingresos/egresos -->
        <div class="mt-4 grid grid-cols-2 gap-2">
          <div class="rounded-lg p-2.5" style="background:rgba(16,185,129,0.08)">
            <p class="text-[10px] text-slate-600">Ingresos</p>
            <p class="mt-0.5 font-mono text-sm font-semibold" style="color:#10B981">{{ formatCurrency(c.total_ingresos) }}</p>
          </div>
          <div class="rounded-lg p-2.5" style="background:rgba(220,38,38,0.08)">
            <p class="text-[10px] text-slate-600">Egresos</p>
            <p class="mt-0.5 font-mono text-sm font-semibold" style="color:#DC2626">{{ formatCurrency(c.total_egresos) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="mt-10 fintech-card flex flex-col items-center py-14 text-center">
      <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.3)">account_balance_wallet</span>
      <p class="mt-3 font-semibold text-slate-300">Sin cuentas registradas</p>
      <p class="mt-1 text-sm text-slate-500">Crea tu primera cuenta para comenzar a registrar el flujo de dinero.</p>
      <button class="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style="background:#10B981" @click="openCreate">
        Agregar cuenta
      </button>
    </div>

    <!-- Modal crear/editar -->
    <CuentaFormModal
      v-model="showModal"
      :edit-data="editTarget"
      @saved="onSaved"
    />

    <!-- Transferencia entre cuentas -->
    <TransferenciaModal v-model="showTransferModal" />

    <!-- Confirm delete -->
    <ConfirmDeleteModal
      v-if="deleteTarget"
      :nombre="deleteTarget.nombre"
      :error="deleteErrorMsg"
      :deleting="deleting"
      @confirm="doDelete"
      @cancel="deleteTarget = null; deleteErrorMsg = ''"
    />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency } from '../utils/currency'
import CuentaFormModal     from '../components/CuentaFormModal.vue'
import ConfirmDeleteModal   from '../components/ConfirmDeleteModal.vue'
import TransferenciaModal   from '../components/TransferenciaModal.vue'

const store  = useCuentasStore()
const router = useRouter()

onMounted(() => store.fetchCuentas())

function goToDetalle(id) { router.push(`/cuentas/${id}`) }

// Iconos por tipo
function iconoTipo(tipo) {
  return { banco: 'account_balance', efectivo: 'payments', digital: 'phone_iphone' }[tipo] ?? 'wallet'
}
function iconoBg(tipo) {
  return { banco: 'background:rgba(59,130,246,0.12)', efectivo: 'background:rgba(16,185,129,0.12)', digital: 'background:rgba(167,139,250,0.12)' }[tipo] ?? ''
}
function iconoColor(tipo) {
  return { banco: '#93C5FD', efectivo: '#10B981', digital: '#A78BFA' }[tipo] ?? '#94A3B8'
}

// Modal crear/editar
const showTransferModal = ref(false)
const showModal  = ref(false)
const editTarget = ref(null)
function openCreate() { editTarget.value = null; showModal.value = true }
function openEdit(c)  { editTarget.value = c;    showModal.value = true }

async function onSaved(payload) {
  try {
    if (payload.id) await store.updateCuenta(payload.id, payload)
    else            await store.createCuenta(payload)
  } catch (e) {
    console.error(e)
  }
}

// Eliminar
const deleteTarget   = ref(null)
const deleteErrorMsg = ref('')
const deleting       = ref(false)
function confirmDelete(c) { deleteTarget.value = c; deleteErrorMsg.value = '' }

async function doDelete() {
  deleting.value = true
  try {
    await store.deleteCuenta(deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar la cuenta'
  } finally {
    deleting.value = false
  }
}
</script>
