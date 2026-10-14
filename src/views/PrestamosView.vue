<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold" style="color:var(--color-text-primary)">Préstamos</h1>
        <p class="mt-1 text-sm" style="color:var(--color-text-muted)">Créditos otorgados a terceros con interés simple.</p>
      </div>
      <button class="btn-brand" @click="showFormModal = true">
        <span class="material-symbols-outlined text-[18px]">add</span>
        <span class="hidden sm:inline">Nuevo préstamo</span>
      </button>
    </div>

    <!-- KPIs -->
    <div v-if="!store.loading && store.prestamos.length" class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="fintech-card px-5 py-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg" style="background:var(--color-alert-bg)">
            <span class="material-symbols-outlined text-[15px]" style="color:var(--color-alert)">handshake</span>
          </div>
          <span class="text-[10px] font-semibold uppercase tracking-widest" style="color:var(--color-text-muted)">Capital prestado</span>
        </div>
        <p class="font-mono text-xl font-bold" style="color:var(--color-text-primary)">{{ formatCurrency(kpi.capital) }}</p>
        <p class="mt-0.5 text-[11px]" style="color:var(--color-text-muted)">{{ store.prestamos.length }} préstamo{{ store.prestamos.length !== 1 ? 's' : '' }}</p>
      </div>

      <div class="fintech-card px-5 py-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg" style="background:var(--color-success-bg)">
            <span class="material-symbols-outlined text-[15px]" style="color:var(--color-success)">check_circle</span>
          </div>
          <span class="text-[10px] font-semibold uppercase tracking-widest" style="color:var(--color-text-muted)">Recuperado</span>
        </div>
        <p class="font-mono text-xl font-bold" style="color:var(--color-success)">{{ formatCurrency(kpi.pagado) }}</p>
        <div class="progress-bar-track mt-1.5">
          <div class="progress-bar-fill" :style="{ width: kpi.pct + '%' }" />
        </div>
        <p class="mt-1 text-[11px]" style="color:var(--color-text-muted)">{{ kpi.pct }}% del total adeudado</p>
      </div>

      <div class="fintech-card px-5 py-4">
        <div class="flex items-center gap-2 mb-2">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-lg"
            :style="kpi.restante > 0 ? 'background:var(--color-alert-bg)' : 'background:var(--color-success-bg)'"
          >
            <span
              class="material-symbols-outlined text-[15px]"
              :style="kpi.restante > 0 ? 'color:var(--color-alert)' : 'color:var(--color-success)'"
            >{{ kpi.restante > 0 ? 'pending' : 'task_alt' }}</span>
          </div>
          <span class="text-[10px] font-semibold uppercase tracking-widest" style="color:var(--color-text-muted)">Por cobrar</span>
        </div>
        <p class="font-mono text-xl font-bold" :style="{ color: kpi.restante > 0 ? 'var(--color-alert)' : 'var(--color-success)' }">
          {{ formatCurrency(kpi.restante) }}
        </p>
        <p class="mt-0.5 text-[11px]" style="color:var(--color-text-muted)">{{ kpi.activos }} activo{{ kpi.activos !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <!-- Filtros: Activos | Pagados | Todos | Calendario -->
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

    <!-- ── VISTA: LISTA ──────────────────────────────────────── -->
    <template v-else-if="filtro !== 'calendario'">
      <AppDataTable
        class="mt-6"
        :data="store.prestamos"
        :loading="store.loading"
        empty-text="Sin préstamos registrados"
        empty-icon="handshake"
      >
        <Column field="deudor_nombre" header="Deudor" sortable style="min-width:180px">
          <template #body="{ data: p }">
            <div class="flex items-center gap-3 cursor-pointer" @click="goToDetalle(p.id)">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style="background:var(--color-alert-bg)">
                <span class="material-symbols-outlined text-[16px]" style="color:var(--color-alert)">person</span>
              </div>
              <div class="min-w-0">
                <p class="font-semibold truncate" style="color:var(--color-text-primary)">{{ p.deudor_nombre }}</p>
                <p class="text-[11px] truncate" style="color:var(--color-text-muted)">{{ p.deudor_contacto || '—' }}</p>
              </div>
            </div>
          </template>
        </Column>

        <Column field="estado" header="Estado" sortable style="min-width:100px">
          <template #body="{ data: p }">
            <Tag :value="p.estado === 'activo' ? 'Activo' : 'Pagado'" :severity="p.estado === 'activo' ? 'success' : 'secondary'" />
          </template>
        </Column>

        <Column field="capital" header="Capital" sortable style="min-width:120px">
          <template #body="{ data: p }">
            <span class="font-mono font-semibold" style="color:var(--color-text-secondary)">{{ formatCurrency(p.capital) }}</span>
          </template>
        </Column>

        <Column field="interes_generado" header="Interés" sortable style="min-width:130px">
          <template #body="{ data: p }">
            <div>
              <span class="font-mono" style="color:var(--color-text-secondary)">{{ formatCurrency(p.interes_generado) }}</span>
              <p class="text-[10px]" style="color:var(--color-text-muted)">{{ pctTasa(p.tasa_interes_mensual) }}%/mes</p>
            </div>
          </template>
        </Column>

        <Column field="total_pagado" header="Pagado" sortable style="min-width:120px">
          <template #body="{ data: p }">
            <span class="font-mono font-semibold" style="color:var(--color-success)">{{ formatCurrency(p.total_pagado) }}</span>
          </template>
        </Column>

        <Column field="saldo_pendiente" header="Pendiente" sortable style="min-width:120px">
          <template #body="{ data: p }">
            <span class="font-mono font-semibold" :style="{ color: p.saldo_pendiente <= 0 ? 'var(--color-success)' : 'var(--color-alert)' }">
              {{ formatCurrency(Math.max(0, p.saldo_pendiente)) }}
            </span>
          </template>
        </Column>

        <Column header="Progreso" style="min-width:140px">
          <template #body="{ data: p }">
            <div>
              <div class="flex justify-between text-[10px] mb-1" style="color:var(--color-text-muted)">
                <span>{{ progresoPct(p) }}%</span>
                <span>{{ formatCurrency(p.total_pagado) }} / {{ formatCurrency(p.total_deuda) }}</span>
              </div>
              <div class="progress-bar-track">
                <div
                  class="progress-bar-fill transition-all"
                  :class="p.saldo_pendiente <= 0 ? '' : 'progress-bar-fill--accent'"
                  :style="{ width: progresoPct(p) + '%' }"
                />
              </div>
            </div>
          </template>
        </Column>

        <Column header="" style="min-width:100px;width:100px">
          <template #body="{ data: p }">
            <div class="flex items-center justify-end gap-1">
              <button class="icon-btn" title="Ver detalle" @click="goToDetalle(p.id)">
                <span class="material-symbols-outlined text-[16px]">open_in_new</span>
              </button>
              <template v-if="p.estado === 'activo' && !p.pagos?.length">
                <button class="icon-btn" title="Editar" @click="openEdit(p)">
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button class="icon-btn-danger" title="Eliminar" @click="confirmDelete(p)">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </template>
            </div>
          </template>
        </Column>
      </AppDataTable>
    </template>

    <!-- ── VISTA: CALENDARIO ────────────────────────────────── -->
    <template v-else-if="filtro === 'calendario'">
      <div class="mt-4">

        <!-- Sin datos -->
        <div v-if="loansWithRange.length === 0 && !store.loading"
          class="fintech-card flex flex-col items-center gap-3 py-14 text-center">
          <span class="material-symbols-outlined text-4xl" style="color:var(--color-text-muted)">calendar_month</span>
          <p class="text-sm font-medium" style="color:var(--color-text-secondary)">Sin préstamos con duración configurada</p>
          <p class="text-xs" style="color:var(--color-text-muted)">
            Agrega días de duración al crear o editar un préstamo para verlos aquí.
          </p>
        </div>

        <template v-else>
          <!-- Leyenda de colores -->
          <div class="mb-4 flex flex-wrap gap-3">
            <div
              v-for="loan in loansWithRange"
              :key="loan.id"
              class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-opacity"
              :style="`background:${loan.color}18;border:1px solid ${loan.color}40`"
              @click="goToDetalle(loan.id)"
            >
              <span class="h-2.5 w-2.5 rounded-full flex-shrink-0" :style="`background:${loan.color}`" />
              <span style="color:var(--color-text-primary)">{{ loan.deudor_nombre }}</span>
              <span style="color:var(--color-text-muted)">· {{ loan.dias_duracion }} días</span>
            </div>
          </div>

          <!-- Tarjeta del calendario -->
          <div class="fintech-card overflow-hidden">
            <!-- Navegación de mes -->
            <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid var(--color-border)">
              <button class="icon-btn" @click="prevMonth">
                <span class="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <div class="flex items-center gap-3">
                <h3 class="text-sm font-bold capitalize" style="color:var(--color-text-primary)">{{ monthLabel }}</h3>
                <button
                  class="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors"
                  style="background:var(--color-surface-mid);color:var(--color-text-muted)"
                  @click="goToToday"
                >
                  Hoy
                </button>
              </div>
              <button class="icon-btn" @click="nextMonth">
                <span class="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>

            <!-- Cabeceras de día de la semana -->
            <div class="grid grid-cols-7 px-3 pt-3 pb-1" style="border-bottom:1px solid var(--color-border-soft)">
              <div
                v-for="d in DOW_LABELS"
                :key="d"
                class="text-center text-[11px] font-semibold pb-2"
                style="color:var(--color-text-muted)"
              >{{ d }}</div>
            </div>

            <!-- Celdas de días -->
            <div class="grid grid-cols-7 gap-px p-3" style="background:var(--color-border-soft)">
              <div
                v-for="(cell, idx) in calendarCells"
                :key="idx"
                class="min-h-[56px] rounded-lg p-1.5"
                style="background:var(--color-surface)"
              >
                <template v-if="cell">
                  <!-- Número del día -->
                  <div class="mb-1 flex items-center justify-center">
                    <span
                      class="flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-semibold"
                      :style="cell.isToday
                        ? 'background:var(--color-brand);color:#fff'
                        : 'color:var(--color-text-secondary)'"
                    >{{ cell.day }}</span>
                  </div>

                  <!-- Barras de préstamos -->
                  <div class="space-y-0.5">
                    <div
                      v-for="loan in cell.loans"
                      :key="loan.id"
                      class="loan-bar"
                      :class="{
                        'loan-bar--start': loan.isStart,
                        'loan-bar--end':   loan.isEnd,
                        'loan-bar--mid':   !loan.isStart && !loan.isEnd,
                      }"
                      :style="`background:${loan.color}`"
                      :title="`${loan.nombre}${loan.isStart ? ' · Inicio' : loan.isEnd ? ' · Vence' : ''}`"
                    >
                      <span
                        v-if="loan.isStart"
                        class="truncate px-1"
                        style="font-size:9px;font-weight:700;line-height:1;color:#374151"
                      >{{ loan.nombre }}</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- Modales -->
    <PrestamoFormModal v-model="showFormModal" :edit-data="editTarget2" @saved="onSaved" />

    <ConfirmDeleteModal
      v-if="deleteTarget"
      :nombre="deleteTarget.deudor_nombre"
      :error="deleteErrorMsg"
      :deleting="deleting"
      @confirm="doDelete"
      @cancel="deleteTarget = null; deleteErrorMsg = ''"
    />
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePrestamosStore } from '../stores/prestamos'
import { useCuentasStore }   from '../stores/cuentas'
import { formatCurrency }    from '../utils/currency'
import AppDataTable       from '../components/AppDataTable.vue'
import PrestamoFormModal  from '../components/PrestamoFormModal.vue'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue'
import { useToast } from '../composables/useToast'

const store        = usePrestamosStore()
const cuentasStore = useCuentasStore()
const router       = useRouter()
const toast        = useToast()

const FILTROS = [
  { value: 'activo',     label: 'Activos' },
  { value: 'pagado',     label: 'Pagados' },
  { value: '',           label: 'Todos' },
  { value: 'calendario', label: 'Calendario' },
]

const filtro = ref('activo')

const kpi = computed(() => {
  const list     = store.prestamos
  const capital  = list.reduce((s, p) => s + parseFloat(p.capital        || 0), 0)
  const pagado   = list.reduce((s, p) => s + parseFloat(p.total_pagado   || 0), 0)
  const restante = list.reduce((s, p) => s + Math.max(0, parseFloat(p.saldo_pendiente || 0)), 0)
  const activos  = list.filter(p => p.estado === 'activo').length
  const deuda    = list.reduce((s, p) => s + parseFloat(p.total_deuda    || 0), 0)
  const pct      = deuda > 0 ? Math.round((pagado / deuda) * 100) : 0
  return { capital, pagado, restante, activos, pct }
})

onMounted(() => Promise.all([cuentasStore.fetchCuentas(), store.fetchPrestamos({ estado: 'activo' })]))

function setFiltro(val) {
  filtro.value = val
  if (val === 'calendario') {
    store.fetchPrestamos({ estado: 'activo' }, true)
  } else {
    store.fetchPrestamos(val ? { estado: val } : {})
  }
}

function goToDetalle(id) { router.push(`/prestamos/${id}`) }
function pctTasa(t) { return parseFloat((parseFloat(t) * 100).toFixed(2)) }

function progresoPct(p) {
  if (!p.total_deuda || p.total_deuda <= 0) return 100
  return Math.min(100, Math.round((p.total_pagado / p.total_deuda) * 100))
}

// ── Calendario ────────────────────────────────────────────
const LOAN_COLORS = [
  '#93C5FD', // azul pastel
  '#86EFAC', // verde pastel
  '#FCD34D', // amarillo pastel
  '#C4B5FD', // violeta pastel
  '#FCA5A5', // rojo pastel
  '#F9A8D4', // rosa pastel
  '#5EEAD4', // teal pastel
  '#FDBA74', // naranja pastel
]

const DOW_LABELS = ['L','M','X','J','V','S','D']

const today = new Date(); today.setHours(0, 0, 0, 0)
const calYear  = ref(today.getFullYear())
const calMonth = ref(today.getMonth())

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const monthLabel = computed(() => `${MONTHS_ES[calMonth.value]} ${calYear.value}`)

function prevMonth() {
  if (calMonth.value === 0) { calYear.value--; calMonth.value = 11 }
  else calMonth.value--
}
function nextMonth() {
  if (calMonth.value === 11) { calYear.value++; calMonth.value = 0 }
  else calMonth.value++
}
function goToToday() { calYear.value = today.getFullYear(); calMonth.value = today.getMonth() }

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const loansWithRange = computed(() =>
  store.prestamos
    .filter(p => p.fecha_inicio && p.dias_duracion)
    .map((p, i) => {
      const start = new Date(p.fecha_inicio + 'T00:00:00')
      const end   = new Date(start)
      end.setDate(end.getDate() + p.dias_duracion - 1)
      return { ...p, color: LOAN_COLORS[i % LOAN_COLORS.length], rangeStart: start, rangeEnd: end }
    })
)

const calendarCells = computed(() => {
  const year  = calYear.value
  const month = calMonth.value

  let dow = new Date(year, month, 1).getDay()
  dow = (dow + 6) % 7

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []

  for (let i = 0; i < dow; i++) cells.push(null)

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const loans = loansWithRange.value
      .filter(p => date >= p.rangeStart && date <= p.rangeEnd)
      .map(p => ({
        id:      p.id,
        nombre:  p.deudor_nombre,
        color:   p.color,
        isStart: isSameDay(date, p.rangeStart),
        isEnd:   isSameDay(date, p.rangeEnd),
      }))
    cells.push({ day: d, isToday: isSameDay(date, today), loans })
  }

  return cells
})

// ── Crear / Editar ────────────────────────────────────────
const showFormModal = ref(false)
const editTarget2   = ref(null)

function openEdit(p) { editTarget2.value = p; showFormModal.value = true }

watch(showFormModal, (open) => { if (!open) editTarget2.value = null })

async function onSaved(payload) {
  try {
    if (editTarget2.value) await store.updatePrestamo(editTarget2.value.id, payload)
    else                   await store.createPrestamo(payload)
    toast.success(editTarget2.value ? 'Préstamo actualizado' : 'Préstamo registrado')
  } catch (e) { toast.fromError(e, 'No se pudo guardar el préstamo') }
}

// ── Eliminar ──────────────────────────────────────────────
const deleteTarget   = ref(null)
const deleteErrorMsg = ref('')
const deleting       = ref(false)

function confirmDelete(p) { deleteTarget.value = p; deleteErrorMsg.value = '' }

async function doDelete() {
  deleting.value = true
  try {
    await store.deletePrestamo(deleteTarget.value.id)
    toast.success('Préstamo eliminado')
    deleteTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
/* ── Barras de préstamos en el calendario ──────────────── */
.loan-bar {
  height: 14px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  overflow: hidden;
  opacity: 0.88;
  transition: opacity 0.15s;
}
.loan-bar:hover { opacity: 1; }

.loan-bar--start {
  border-radius: 4px 2px 2px 4px;
  margin-left: 1px;
}
.loan-bar--end {
  border-radius: 2px 4px 4px 2px;
  margin-right: 1px;
}
.loan-bar--mid {
  border-radius: 0;
}
</style>
