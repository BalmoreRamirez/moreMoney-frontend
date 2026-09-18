<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold" style="color:var(--color-text-primary)">Cuentas</h1>
        <p class="mt-1 text-sm" style="color:var(--color-text-muted)">Control de tus billeteras y flujo de dinero.</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="store.cuentas.length >= 2"
          class="btn-ghost"
          @click="showTransferModal = true"
        >
          <span class="material-symbols-outlined text-[18px]">swap_horiz</span>
          <span class="hidden sm:inline">Mover fondos</span>
        </button>
        <button class="btn-brand" @click="openCreate">
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span class="hidden sm:inline">Nueva cuenta</span>
        </button>
      </div>
    </div>

    <!-- Saldo total consolidado -->
    <div v-if="!store.loading && store.cuentas.length" class="mt-6 fintech-card p-6 text-center" style="background:linear-gradient(135deg,var(--color-brand-light) 0%,var(--color-surface) 100%)">
      <p class="text-xs font-semibold uppercase tracking-widest" style="color:var(--color-text-muted)">Saldo total disponible</p>
      <p class="mt-2 font-mono font-bold" :style="{ fontSize: 'clamp(2rem,8vw,3rem)', color: store.saldo_total >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
        {{ formatCurrency(store.saldo_total) }}
      </p>
      <p class="mt-1 text-xs" style="color:var(--color-text-muted)">{{ store.cuentas.length }} cuenta{{ store.cuentas.length !== 1 ? 's' : '' }} activa{{ store.cuentas.length !== 1 ? 's' : '' }}</p>
    </div>

    <!-- Error -->
    <div v-if="store.error" class="mt-4 rounded-xl px-5 py-4 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger)">
      {{ store.error }}
    </div>

    <!-- Tabla -->
    <AppDataTable
      v-else
      class="mt-6"
      :data="store.cuentas"
      :loading="store.loading"
      empty-text="Sin cuentas registradas"
      empty-icon="account_balance_wallet"
    >
      <!-- Cuenta -->
      <Column field="nombre" header="Cuenta" sortable style="min-width:200px">
        <template #body="{ data: c }">
          <div class="flex items-center gap-3 cursor-pointer" @click="goToDetalle(c.id)">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" :style="iconoBg(c.tipo)">
              <span class="material-symbols-outlined text-[16px]" :style="{ color: iconoColor(c.tipo) }">{{ iconoTipo(c.tipo) }}</span>
            </div>
            <div>
              <p class="font-semibold" style="color:var(--color-text-primary)">{{ c.nombre }}</p>
              <p class="text-[11px] capitalize" style="color:var(--color-text-muted)">{{ c.tipo }}</p>
            </div>
          </div>
        </template>
      </Column>

      <!-- Saldo actual -->
      <Column field="saldo_actual" header="Saldo actual" sortable style="min-width:140px">
        <template #body="{ data: c }">
          <span class="font-mono text-lg font-bold" :style="{ color: c.saldo_actual >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
            {{ formatCurrency(c.saldo_actual) }}
          </span>
        </template>
      </Column>

      <!-- Ingresos -->
      <Column field="total_ingresos" header="Ingresos" sortable style="min-width:120px">
        <template #body="{ data: c }">
          <span class="font-mono text-sm font-semibold" style="color:var(--color-success)">{{ formatCurrency(c.total_ingresos) }}</span>
        </template>
      </Column>

      <!-- Egresos -->
      <Column field="total_egresos" header="Egresos" sortable style="min-width:120px">
        <template #body="{ data: c }">
          <span class="font-mono text-sm font-semibold" style="color:var(--color-danger)">{{ formatCurrency(c.total_egresos) }}</span>
        </template>
      </Column>

      <!-- Acciones -->
      <Column header="" style="min-width:110px;width:110px">
        <template #body="{ data: c }">
          <div class="flex items-center justify-end gap-1">
            <button class="icon-btn" title="Ver detalle" @click="goToDetalle(c.id)">
              <span class="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
            <button class="icon-btn" title="Editar" @click.stop="openEdit(c)">
              <span class="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button class="icon-btn-danger" title="Eliminar" @click.stop="confirmDelete(c)">
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </template>
      </Column>
    </AppDataTable>

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
import AppDataTable       from '../components/AppDataTable.vue'
import CuentaFormModal    from '../components/CuentaFormModal.vue'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue'
import TransferenciaModal from '../components/TransferenciaModal.vue'

const store  = useCuentasStore()
const router = useRouter()

onMounted(() => store.fetchCuentas(true))

function goToDetalle(id) { router.push(`/cuentas/${id}`) }

function iconoTipo(tipo) {
  return { banco: 'account_balance', efectivo: 'payments', digital: 'phone_iphone' }[tipo] ?? 'wallet'
}
function iconoBg(tipo) {
  return { banco: 'background:rgba(3,36,107,0.10)', efectivo: 'background:rgba(16,185,129,0.10)', digital: 'background:rgba(99,102,241,0.10)' }[tipo] ?? ''
}
function iconoColor(tipo) {
  return { banco: '#03246B', efectivo: '#10B981', digital: '#6366F1' }[tipo] ?? '#94A3B8'
}

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
