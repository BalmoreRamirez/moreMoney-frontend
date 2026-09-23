<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold" style="color:var(--color-text-primary)">Créditos recibidos</h1>
        <p class="mt-1 text-sm" style="color:var(--color-text-muted)">Préstamos que tomaste para cubrir gastos, con interés simple o compuesto.</p>
      </div>
      <button class="btn-brand" @click="showFormModal = true">
        <span class="material-symbols-outlined text-[18px]">add</span>
        <span class="hidden sm:inline">Nuevo crédito</span>
      </button>
    </div>

    <!-- KPIs -->
    <div v-if="!store.loading && store.creditos.length" class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <!-- Capital recibido -->
      <div class="fintech-card px-5 py-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg" style="background:var(--color-brand-light)">
            <span class="material-symbols-outlined text-[15px]" style="color:var(--color-brand)">credit_score</span>
          </div>
          <span class="text-[10px] font-semibold uppercase tracking-widest" style="color:var(--color-text-muted)">Capital recibido</span>
        </div>
        <p class="font-mono text-xl font-bold" style="color:var(--color-text-primary)">{{ formatCurrency(kpi.capital) }}</p>
        <p class="mt-0.5 text-[11px]" style="color:var(--color-text-muted)">{{ store.creditos.length }} crédito{{ store.creditos.length !== 1 ? 's' : '' }}</p>
      </div>

      <!-- Ya pagado -->
      <div class="fintech-card px-5 py-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg" style="background:var(--color-success-bg)">
            <span class="material-symbols-outlined text-[15px]" style="color:var(--color-success)">check_circle</span>
          </div>
          <span class="text-[10px] font-semibold uppercase tracking-widest" style="color:var(--color-text-muted)">Ya pagado</span>
        </div>
        <p class="font-mono text-xl font-bold" style="color:var(--color-success)">{{ formatCurrency(kpi.pagado) }}</p>
        <div class="progress-bar-track mt-1.5">
          <div class="progress-bar-fill" :style="{ width: kpi.pct + '%' }" />
        </div>
        <p class="mt-1 text-[11px]" style="color:var(--color-text-muted)">{{ kpi.pct }}% del total adeudado</p>
      </div>

      <!-- Por pagar -->
      <div class="fintech-card px-5 py-4">
        <div class="flex items-center gap-2 mb-2">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-lg"
            :style="kpi.restante > 0 ? 'background:var(--color-danger-bg)' : 'background:var(--color-success-bg)'"
          >
            <span
              class="material-symbols-outlined text-[15px]"
              :style="kpi.restante > 0 ? 'color:var(--color-danger)' : 'color:var(--color-success)'"
            >{{ kpi.restante > 0 ? 'pending' : 'task_alt' }}</span>
          </div>
          <span class="text-[10px] font-semibold uppercase tracking-widest" style="color:var(--color-text-muted)">Por pagar</span>
        </div>
        <p class="font-mono text-xl font-bold" :style="{ color: kpi.restante > 0 ? 'var(--color-danger)' : 'var(--color-success)' }">
          {{ formatCurrency(kpi.restante) }}
        </p>
        <p class="mt-0.5 text-[11px]" style="color:var(--color-text-muted)">{{ kpi.activos }} activo{{ kpi.activos !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="mt-5 flex flex-wrap gap-2">
      <button
        v-for="f in FILTROS"
        :key="f.value"
        class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
        :style="filtro === f.value
          ? 'background:var(--color-brand-light);color:var(--color-brand);border:1px solid rgba(3,36,107,0.25)'
          : 'background:var(--color-surface-mid);color:var(--color-text-secondary);border:1px solid transparent'"
        @click="setFiltro(f.value)"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="store.error" class="mt-4 rounded-xl px-5 py-4 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger)">
      {{ store.error }}
    </div>

    <!-- Tabla -->
    <AppDataTable
      v-else
      class="mt-6"
      :data="store.creditos"
      :loading="store.loading"
      empty-text="Sin créditos registrados"
      empty-icon="credit_score"
    >
      <!-- Nombre -->
      <Column field="nombre" header="Crédito" sortable style="min-width:200px">
        <template #body="{ data: c }">
          <div class="flex items-center gap-3 cursor-pointer" @click="goToDetalle(c.id)">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style="background:var(--color-brand-light)">
              <span class="material-symbols-outlined text-[16px]" style="color:var(--color-brand)">credit_score</span>
            </div>
            <div class="min-w-0">
              <p class="font-semibold truncate" style="color:var(--color-text-primary)">{{ c.nombre }}</p>
              <p class="text-[11px]" style="color:var(--color-text-muted)">
                {{ c.tipo_interes === 'simple' ? 'Simple' : 'Compuesto' }} · {{ pctTasa(c.tasa_mensual) }}%/mes
              </p>
            </div>
          </div>
        </template>
      </Column>

      <!-- Estado -->
      <Column field="estado" header="Estado" sortable style="min-width:100px">
        <template #body="{ data: c }">
          <Tag
            :value="c.estado === 'activo' ? 'Activo' : 'Pagado'"
            :severity="c.estado === 'activo' ? 'success' : 'secondary'"
          />
        </template>
      </Column>

      <!-- Capital -->
      <Column field="capital" header="Capital" sortable style="min-width:120px">
        <template #body="{ data: c }">
          <span class="font-mono font-semibold" style="color:var(--color-text-primary)">{{ formatCurrency(c.capital) }}</span>
        </template>
      </Column>

      <!-- Interés -->
      <Column field="total_interes" header="Interés" sortable style="min-width:120px">
        <template #body="{ data: c }">
          <span class="font-mono font-semibold" style="color:var(--color-alert)">{{ formatCurrency(c.total_interes) }}</span>
        </template>
      </Column>

      <!-- Pagado -->
      <Column field="total_pagado" header="Pagado" sortable style="min-width:120px">
        <template #body="{ data: c }">
          <span class="font-mono font-semibold" style="color:var(--color-success)">{{ formatCurrency(c.total_pagado) }}</span>
        </template>
      </Column>

      <!-- Pendiente -->
      <Column field="saldo_pendiente" header="Pendiente" sortable style="min-width:120px">
        <template #body="{ data: c }">
          <span class="font-mono font-semibold" :style="{ color: c.saldo_pendiente <= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
            {{ formatCurrency(Math.max(0, c.saldo_pendiente)) }}
          </span>
        </template>
      </Column>

      <!-- Progreso -->
      <Column header="Progreso" style="min-width:140px">
        <template #body="{ data: c }">
          <div>
            <div class="flex justify-between text-[10px] mb-1" style="color:var(--color-text-muted)">
              <span>{{ progresoPct(c) }}%</span>
              <span>{{ c.cuotas_pagadas }}/{{ c.num_cuotas }}</span>
            </div>
            <div class="progress-bar-track">
              <div
                class="progress-bar-fill progress-bar-fill--brand transition-all"
                :style="{ width: progresoPct(c) + '%' }"
              />
            </div>
          </div>
        </template>
      </Column>

      <!-- Acciones -->
      <Column header="" style="min-width:90px;width:90px">
        <template #body="{ data: c }">
          <div class="flex items-center justify-end gap-1">
            <button class="icon-btn" title="Ver detalle" @click="goToDetalle(c.id)">
              <span class="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
            <button
              v-if="c.estado === 'activo' && c.cuotas_pagadas === 0"
              class="icon-btn-danger"
              title="Eliminar"
              @click.stop="confirmDelete(c)"
            >
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </template>
      </Column>
    </AppDataTable>

    <!-- Modales -->
    <CreditoFormModal v-model="showFormModal" @saved="onCrear" />

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
import { ref, computed, onMounted } from 'vue'
import { useRouter }        from 'vue-router'
import { useCreditosStore } from '../stores/creditos'
import { useCuentasStore }  from '../stores/cuentas'
import { formatCurrency }   from '../utils/currency'
import AppDataTable         from '../components/AppDataTable.vue'
import CreditoFormModal     from '../components/CreditoFormModal.vue'
import ConfirmDeleteModal   from '../components/ConfirmDeleteModal.vue'
import { useToast } from '../composables/useToast'

const store        = useCreditosStore()
const cuentasStore = useCuentasStore()
const router       = useRouter()
const toast        = useToast()

const FILTROS = [
  { value: '',       label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'pagado', label: 'Pagados' },
]

const filtro = ref('activo')

const kpi = computed(() => {
  const list     = store.creditos
  const capital  = list.reduce((s, c) => s + parseFloat(c.capital       || 0), 0)
  const pagado   = list.reduce((s, c) => s + parseFloat(c.total_pagado  || 0), 0)
  const total    = list.reduce((s, c) => s + parseFloat(c.capital || 0) + parseFloat(c.total_interes || 0), 0)
  const restante = list.reduce((s, c) => s + Math.max(0, parseFloat(c.saldo_pendiente || 0)), 0)
  const activos  = list.filter(c => c.estado === 'activo').length
  const pct      = total > 0 ? Math.round((pagado / total) * 100) : 0
  return { capital, pagado, restante, activos, pct }
})

onMounted(() => Promise.all([cuentasStore.fetchCuentas(), store.fetchCreditos({ estado: 'activo' })]))

function setFiltro(val) {
  filtro.value = val
  store.fetchCreditos(val ? { estado: val } : {})
}

function goToDetalle(id) { router.push(`/creditos/${id}`) }
function pctTasa(t)      { return parseFloat((parseFloat(t) * 100).toFixed(2)) }

function progresoPct(c) {
  if (!c.num_cuotas) return 0
  return Math.min(100, Math.round((c.cuotas_pagadas / c.num_cuotas) * 100))
}

const showFormModal = ref(false)
async function onCrear(payload) {
  try {
    await store.createCredito(payload)
    toast.success('Crédito registrado')
  } catch (e) { toast.fromError(e, 'No se pudo registrar el crédito') }
}

const deleteTarget   = ref(null)
const deleteErrorMsg = ref('')
const deleting       = ref(false)

function confirmDelete(c) { deleteTarget.value = c; deleteErrorMsg.value = '' }

async function doDelete() {
  deleting.value = true
  try {
    await store.deleteCredito(deleteTarget.value.id)
    toast.success('Crédito eliminado')
    deleteTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally {
    deleting.value = false
  }
}
</script>
