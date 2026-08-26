<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Compras</h1>
        <p class="mt-1 text-sm text-slate-500">Gestión de gastos normales y compras a tasa cero.</p>
      </div>

      <div class="flex items-center gap-3">
        <select
          v-model="filtroTarjeta"
          class="fintech-input w-56 text-sm"
          @change="recargarTodo"
        >
          <option value="">Todas las tarjetas</option>
          <option v-for="t in tarjetasStore.tarjetas" :key="t.id" :value="t.id">
            {{ t.nombre }} — {{ t.banco }}
          </option>
        </select>
      </div>
    </div>

    <!-- Pestañas + botón de acción -->
    <div class="mt-6 flex flex-wrap items-center justify-between gap-2 border-b" style="border-color:#E2E8F0">
      <div class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors sm:gap-2 sm:px-4"
          :class="activeTab === tab.key
            ? 'border-b-2 border-success text-success'
            : 'text-slate-500 hover:text-slate-700'"
          @click="activeTab = tab.key"
        >
          <span class="material-symbols-outlined text-[16px]">{{ tab.icon }}</span>
          <span class="hidden sm:inline">{{ tab.label }}</span>
          <span class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
            :style="activeTab === tab.key
              ? 'background:rgba(16,185,129,0.2);color:#10B981'
              : 'background:rgba(10,25,47,0.04);color:#94A3B8'"
          >{{ tab.key === 'normales' ? comprasStore.normales.length : comprasStore.tasaCero.length }}</span>
        </button>
      </div>

      <div class="pb-2">
        <button
          v-if="activeTab === 'normales'"
          class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white hover:opacity-90 sm:gap-2 sm:px-4"
          style="background:#10B981"
          @click="openCreateNormal"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span class="hidden sm:inline">Nueva compra</span>
        </button>
        <button
          v-else
          class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white hover:opacity-90 sm:gap-2 sm:px-4"
          style="background:#10B981"
          @click="openCreateTasaCero"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span class="hidden sm:inline">Nueva tasa cero</span>
        </button>
      </div>
    </div>

    <!-- Filtro de estado (sólo en pestaña tasa cero) -->
    <div v-if="activeTab === 'tasa_cero'" class="mt-4 flex items-center gap-1 rounded-xl p-1 w-fit" style="background:rgba(10,25,47,0.03);border:1px solid #E2E8F0">
      <button
        v-for="opt in estadoOpts"
        :key="opt.value"
        class="rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors"
        :style="filtroEstado === opt.value
          ? 'background:rgba(16,185,129,0.18);color:#10B981'
          : 'color:#94A3B8'"
        @click="setFiltroEstado(opt.value)"
      >{{ opt.label }}</button>
    </div>

    <!-- Error -->
    <div v-if="comprasStore.error" class="mt-4 rounded-xl px-5 py-4 text-sm"
      style="background:var(--color-danger-bg);color:var(--color-danger)">
      {{ comprasStore.error }}
    </div>

    <template v-else>
      <!-- ── TAB: Compras Normales — Calendario ── -->
      <div v-if="activeTab === 'normales'" class="mt-4">

        <!-- Barra de herramientas del calendario -->
        <div class="fintech-card mb-4 px-5 py-4">
          <div class="flex flex-wrap items-center justify-between gap-4">

            <!-- Navegación mes -->
            <div class="flex items-center gap-2">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                @click="prevMonth"
              >
                <span class="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span class="w-44 text-center text-sm font-semibold capitalize text-slate-800">
                {{ monthLabel }}
              </span>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                @click="nextMonth"
              >
                <span class="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
              <button
                class="ml-1 rounded-lg border px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                style="border-color:#E2E8F0"
                @click="goToToday"
              >Hoy</button>
            </div>

            <!-- KPIs del mes -->
            <div class="hidden md:flex items-center gap-5">
              <div class="text-center">
                <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Total mes</p>
                <p class="font-mono text-sm font-bold text-slate-800">{{ formatCurrency(monthSummary.total) }}</p>
              </div>
              <div class="h-8 w-px" style="background:#E2E8F0"></div>
              <div class="text-center">
                <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Pendiente</p>
                <p class="font-mono text-sm font-bold" style="color:#D97706">{{ formatCurrency(monthSummary.pendiente) }}</p>
              </div>
              <div class="h-8 w-px" style="background:#E2E8F0"></div>
              <div class="text-center">
                <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Pagado</p>
                <p class="font-mono text-sm font-bold" style="color:#059669">{{ formatCurrency(monthSummary.pagada) }}</p>
              </div>
            </div>

            <!-- Toggle vista -->
            <div class="flex items-center gap-1 rounded-lg p-1" style="background:rgba(10,25,47,0.04);border:1px solid #E2E8F0">
              <button
                class="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                :style="calView === 'cal' ? 'background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.1)' : ''"
                :title="'Vista calendario'"
                @click="calView = 'cal'"
              >
                <span class="material-symbols-outlined text-[16px]" :class="calView === 'cal' ? 'text-success' : 'text-slate-400'">calendar_month</span>
              </button>
              <button
                class="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                :style="calView === 'list' ? 'background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.1)' : ''"
                :title="'Vista lista'"
                @click="calView = 'list'"
              >
                <span class="material-symbols-outlined text-[16px]" :class="calView === 'list' ? 'text-success' : 'text-slate-400'">view_list</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Vista Calendario -->
        <div v-if="calView === 'cal'">
          <div class="fintech-card overflow-hidden">

            <!-- Cabecera días de la semana -->
            <div class="grid grid-cols-7 border-b" style="border-color:#E2E8F0">
              <div
                v-for="d in dayNames"
                :key="d"
                class="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400"
              >{{ d }}</div>
            </div>

            <!-- Celdas del calendario -->
            <div class="grid grid-cols-7 divide-x divide-y" style="border-color:#E2E8F0">
              <div
                v-for="(cell, i) in calendarCells"
                :key="i"
                class="min-h-[110px] p-2 transition-colors"
                :class="[
                  !cell.currentMonth ? 'bg-slate-50/70 cursor-default' : 'cursor-pointer hover:bg-blue-50/30',
                  cell.isToday && cell.currentMonth ? 'bg-emerald-50/40' : '',
                  selectedDay === cell.dateStr ? 'ring-2 ring-inset ring-success/50' : ''
                ]"
                @click="handleDayClick(cell)"
              >
                <!-- Número del día -->
                <div class="mb-1.5 flex items-start justify-between">
                  <span
                    class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                    :class="cell.isToday && cell.currentMonth
                      ? 'bg-success text-white'
                      : cell.currentMonth
                        ? 'text-slate-600'
                        : 'text-slate-300'"
                  >{{ cell.day }}</span>

                  <!-- Total del día -->
                  <span
                    v-if="cell.currentMonth && cell.purchases.length"
                    class="font-mono text-[10px] font-semibold text-slate-400"
                  >{{ formatCurrency(cell.dayTotal) }}</span>
                </div>

                <!-- Chips de compras -->
                <div class="space-y-0.5">
                  <div
                    v-for="c in cell.purchases.slice(0, 2)"
                    :key="c.id"
                    class="flex items-center justify-between gap-1 rounded px-1.5 py-0.5 leading-tight"
                    :class="c.estado === 'pagada'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'"
                  >
                    <span class="truncate text-[10px] font-medium" style="max-width:80px">{{ c.nombre }}</span>
                    <span class="shrink-0 font-mono text-[10px] font-semibold">{{ formatAmount(c.monto) }}</span>
                  </div>
                  <div
                    v-if="cell.purchases.length > 2"
                    class="rounded px-1.5 py-0.5 text-center text-[10px] font-semibold text-slate-500"
                    style="background:rgba(10,25,47,0.06)"
                  >+{{ cell.purchases.length - 2 }} más</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state calendario -->
          <div v-if="!comprasStore.loading && !comprasStore.normales.length" class="mt-4 fintech-card flex flex-col items-center py-14 text-center">
            <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.25)">receipt_long</span>
            <p class="mt-3 font-semibold text-slate-600">Sin compras este mes</p>
            <p class="mt-1 text-sm text-slate-500">Registra una nueva compra para verla en el calendario.</p>
          </div>
        </div>

        <!-- Vista Lista -->
        <div v-else>
          <AppDataTable
            :data="comprasStore.normales"
            :loading="comprasStore.loading"
            empty-text="Sin compras normales"
            empty-icon="receipt_long"
          >
            <Column field="fecha_compra" header="Fecha" sortable style="min-width:110px">
              <template #body="{ data: c }">
                <span class="text-sm text-slate-600">{{ formatDate(c.fecha_compra) }}</span>
              </template>
            </Column>

            <Column field="nombre" header="Compra" sortable style="min-width:200px">
              <template #body="{ data: c }">
                <p class="text-sm font-medium text-slate-700 truncate">{{ c.nombre }}</p>
                <span class="text-[11px] text-slate-500">{{ c.tarjeta?.nombre }} · {{ c.tarjeta?.banco }}</span>
              </template>
            </Column>

            <Column field="estado" header="Estado" sortable style="min-width:100px">
              <template #body="{ data: c }">
                <span :class="c.estado === 'pagada' ? 'badge-success' : 'badge-alert'">{{ c.estado }}</span>
              </template>
            </Column>

            <Column field="monto" header="Monto" sortable style="min-width:120px">
              <template #body="{ data: c }">
                <span class="font-mono text-sm font-semibold text-slate-700">{{ formatCurrency(c.monto) }}</span>
              </template>
            </Column>

            <Column header="" style="min-width:90px;width:90px">
              <template #body="{ data: c }">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    title="Editar"
                    @click="openEditNormal(c)"
                  >
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-danger"
                    title="Eliminar"
                    @click="confirmDeleteNormal(c)"
                  >
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </template>
            </Column>
          </AppDataTable>
        </div>
      </div>

      <!-- ── TAB: Tasa Cero ── -->
      <div v-if="activeTab === 'tasa_cero'" class="mt-4 space-y-4">
        <div v-if="!comprasStore.tasaCero.length" class="fintech-card flex flex-col items-center py-14 text-center">
          <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.3)">payments</span>
          <p class="mt-3 font-semibold text-slate-600">Sin compras a tasa cero</p>
          <p class="mt-1 text-sm text-slate-500">Registra una compra con cuotas para verla aquí.</p>
        </div>

        <div
          v-for="c in comprasStore.tasaCero"
          :key="c.id"
          class="fintech-card p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <p class="font-semibold text-slate-700">{{ c.nombre }}</p>
                <span :class="c.estado === 'activa' ? 'badge-success' : 'badge-alert'">{{ c.estado }}</span>
              </div>
              <p class="mt-0.5 text-xs text-slate-500">
                {{ c.tarjeta?.nombre }} — {{ c.tarjeta?.banco }} &nbsp;·&nbsp; {{ formatDate(c.fecha_compra) }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <div class="text-right mr-1">
                <p class="font-mono text-lg font-bold text-slate-900">{{ formatCurrency(c.monto_total) }}</p>
                <p class="text-xs text-slate-500">{{ formatCurrency(cuotaMonto(c)) }}/mes</p>
              </div>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Editar"
                @click="openEditTasaCero(c)"
              >
                <span class="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                :class="tieneCuotasPagadas(c)
                  ? 'cursor-not-allowed text-slate-400'
                  : 'text-slate-500 hover:bg-red-500/10 hover:text-danger'"
                :title="tieneCuotasPagadas(c) ? 'No se puede eliminar: ya tiene cuotas pagadas' : 'Eliminar'"
                :disabled="tieneCuotasPagadas(c)"
                @click="!tieneCuotasPagadas(c) && confirmDeleteTasaCero(c)"
              >
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>

          <div class="mt-4">
            <div class="mb-1.5 flex items-center justify-between text-xs">
              <span class="text-slate-500">Progreso de cuotas</span>
              <span class="font-mono text-slate-600">
                {{ cuotasBlocks(c) }}
                <span class="ml-1 text-slate-500">{{ cuotasPagadas(c) }}/{{ c.total_cuotas }}</span>
              </span>
            </div>
            <div class="progress-bar-track">
              <div
                class="progress-bar-fill transition-all duration-700"
                :class="cuotasPct(c) >= 90 ? 'progress-bar-fill--danger' : ''"
                :style="{ width: cuotasPct(c) + '%' }"
              />
            </div>
            <p v-if="tieneCuotasPagadas(c)" class="mt-1.5 flex items-center gap-1 text-[10px]" style="color:#F59E0B">
              <span class="material-symbols-outlined text-[12px]">lock</span>
              No eliminable — {{ cuotasPagadas(c) }} cuota{{ cuotasPagadas(c) > 1 ? 's' : '' }} pagada{{ cuotasPagadas(c) > 1 ? 's' : '' }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal detalle del día -->
    <Teleport to="body">
      <div
        v-if="selectedDay"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(15,23,42,0.5);backdrop-filter:blur(2px)"
        @click.self="clearDay"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col" style="max-height:85vh">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color:#E2E8F0">
            <div>
              <h3 class="font-semibold text-slate-800 capitalize">{{ selectedDayLabel }}</h3>
              <p class="text-xs text-slate-500 mt-0.5">
                <template v-if="selectedDayData && selectedDayData.purchases.length">
                  {{ selectedDayData.purchases.length }} compra{{ selectedDayData.purchases.length !== 1 ? 's' : '' }}
                  &nbsp;·&nbsp;
                  Total: <span class="font-mono font-semibold">{{ formatCurrency(selectedDayData.dayTotal) }}</span>
                </template>
                <template v-else>Sin compras registradas</template>
              </p>
            </div>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              @click="clearDay"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto p-6">
            <!-- Sin compras -->
            <div
              v-if="!selectedDayData || !selectedDayData.purchases.length"
              class="flex flex-col items-center py-10 text-center"
            >
              <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.25)">receipt_long</span>
              <p class="mt-3 text-sm text-slate-500">No hay compras para este día.</p>
              <button
                class="mt-4 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                style="background:#10B981"
                @click="clearDay(); openCreateNormal()"
              >
                <span class="material-symbols-outlined text-[16px]">add</span>
                Añadir compra
              </button>
            </div>

            <!-- Lista de compras -->
            <div v-else class="space-y-2">
              <div
                v-for="c in selectedDayData.purchases"
                :key="c.id"
                class="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                style="background:var(--color-surface-mid);border:1px solid var(--color-border-soft)"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    :class="c.estado === 'pagada' ? 'bg-emerald-100' : 'bg-amber-100'"
                  >
                    <span class="material-symbols-outlined text-[18px]"
                      :class="c.estado === 'pagada' ? 'text-emerald-600' : 'text-amber-600'"
                    >receipt_long</span>
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-slate-700">{{ c.nombre }}</p>
                    <p class="text-[11px] text-slate-400">{{ c.tarjeta?.nombre }} · {{ c.tarjeta?.banco }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <div class="text-right">
                    <p class="font-mono text-sm font-bold text-slate-800">{{ formatCurrency(c.monto) }}</p>
                    <span :class="c.estado === 'pagada' ? 'badge-success' : 'badge-alert'" style="font-size:10px;padding:1px 6px">
                      {{ c.estado }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button
                      class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="Editar"
                      @click="clearDay(); openEditNormal(c)"
                    >
                      <span class="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                    <button
                      class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-danger transition-colors"
                      title="Eliminar"
                      @click="clearDay(); confirmDeleteNormal(c)"
                    >
                      <span class="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-2 px-6 py-4 border-t" style="border-color:#E2E8F0">
            <button
              class="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              style="background:#10B981"
              @click="clearDay(); openCreateNormal()"
            >
              <span class="material-symbols-outlined text-[16px]">add</span>
              Nueva compra
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modales -->
    <CompraNormalFormModal
      v-model="showNormalModal"
      :tarjetas="tarjetasStore.tarjetas"
      :editData="editNormalTarget"
      @saved="onSaveNormal"
    />
    <CompraTasaCeroFormModal
      v-model="showTasaCeroModal"
      :tarjetas="tarjetasStore.tarjetas"
      :editData="editTasaCeroTarget"
      @saved="onSaveTasaCero"
    />
    <ConfirmDeleteModal
      v-if="deleteNormalTarget"
      :nombre="deleteNormalTarget.nombre"
      :error="deleteErrorMsg"
      :deleting="deleting"
      @confirm="doDeleteNormal"
      @cancel="deleteNormalTarget = null; deleteErrorMsg = ''"
    />
    <ConfirmDeleteModal
      v-if="deleteTasaCeroTarget"
      :nombre="deleteTasaCeroTarget.nombre"
      :error="deleteErrorMsg"
      :deleting="deleting"
      @confirm="doDeleteTasaCero"
      @cancel="deleteTasaCeroTarget = null; deleteErrorMsg = ''"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useComprasStore }  from '../stores/compras'
import { useTarjetasStore } from '../stores/tarjetas'
import { formatCurrency, formatAmount } from '../utils/currency'
import AppDataTable            from '../components/AppDataTable.vue'
import CompraNormalFormModal   from '../components/CompraNormalFormModal.vue'
import CompraTasaCeroFormModal from '../components/CompraTasaCeroFormModal.vue'
import ConfirmDeleteModal      from '../components/ConfirmDeleteModal.vue'

const comprasStore  = useComprasStore()
const tarjetasStore = useTarjetasStore()

const activeTab     = ref('normales')
const filtroTarjeta = ref('')
const filtroEstado  = ref('activa')
const calView       = ref('cal')

const tabs = [
  { key: 'normales',  icon: 'receipt_long', label: 'Compras normales' },
  { key: 'tasa_cero', icon: 'payments',     label: 'Tasa cero' },
]

const estadoOpts = [
  { value: 'activa',     label: 'Activas' },
  { value: '',           label: 'Todas' },
  { value: 'finalizada', label: 'Finalizadas' },
]

// ── Calendario ──────────────────────────────────────────────────
const now         = new Date()
const calMonth    = ref(now.getMonth())
const calYear     = ref(now.getFullYear())
const selectedDay = ref(null)

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const dayNames    = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const monthLabel = computed(() => `${MONTH_NAMES[calMonth.value]} ${calYear.value}`)

function prevMonth() {
  if (calMonth.value === 0) { calMonth.value = 11; calYear.value-- }
  else calMonth.value--
  selectedDay.value = null
}
function nextMonth() {
  if (calMonth.value === 11) { calMonth.value = 0; calYear.value++ }
  else calMonth.value++
  selectedDay.value = null
}
function goToToday() {
  const d = new Date()
  calMonth.value = d.getMonth()
  calYear.value  = d.getFullYear()
  selectedDay.value = null
}

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate())

const purchasesByDate = computed(() => {
  const map = {}
  for (const c of comprasStore.normales) {
    const key = c.fecha_compra?.slice(0, 10)
    if (!key) continue
    if (!map[key]) map[key] = []
    map[key].push(c)
  }
  return map
})

const calendarCells = computed(() => {
  const firstDay     = new Date(calYear.value, calMonth.value, 1).getDay()
  const daysInMonth  = new Date(calYear.value, calMonth.value + 1, 0).getDate()
  const prevMonthDays = new Date(calYear.value, calMonth.value, 0).getDate()
  const cells = []

  // Días del mes anterior (relleno)
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, currentMonth: false, dateStr: null, isToday: false, purchases: [], dayTotal: 0 })
  }

  // Días del mes actual
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr  = toDateStr(calYear.value, calMonth.value, d)
    const purchases = purchasesByDate.value[dateStr] || []
    const dayTotal  = purchases.reduce((s, c) => s + parseFloat(c.monto || 0), 0)
    cells.push({ day: d, currentMonth: true, dateStr, isToday: dateStr === todayStr, purchases, dayTotal })
  }

  // Días del mes siguiente (relleno hasta completar 6 filas)
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, dateStr: null, isToday: false, purchases: [], dayTotal: 0 })
  }

  return cells
})

const selectedDayData = computed(() =>
  selectedDay.value ? calendarCells.value.find(c => c.dateStr === selectedDay.value) ?? null : null
)

const selectedDayLabel = computed(() => {
  if (!selectedDay.value) return ''
  const d = new Date(selectedDay.value + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

function handleDayClick(cell) {
  if (!cell.currentMonth) return
  selectedDay.value = selectedDay.value === cell.dateStr ? null : cell.dateStr
}

function clearDay() {
  selectedDay.value = null
}

function selectDay(cell) {
  selectedDay.value = selectedDay.value === cell.dateStr ? null : cell.dateStr
}

const monthSummary = computed(() => {
  const prefix = `${calYear.value}-${String(calMonth.value + 1).padStart(2, '0')}`
  let total = 0, pendiente = 0, pagada = 0
  for (const c of comprasStore.normales) {
    if (!c.fecha_compra?.startsWith(prefix)) continue
    const m = parseFloat(c.monto || 0)
    total += m
    if (c.estado === 'pendiente') pendiente += m
    else pagada += m
  }
  return { total, pendiente, pagada }
})

// ── Ciclo de vida ────────────────────────────────────────────────
onMounted(async () => {
  await tarjetasStore.fetchTarjetas()
  recargarTodo()
})

function recargarTodo() {
  const baseParams = filtroTarjeta.value ? { tarjeta_id: filtroTarjeta.value } : {}
  comprasStore.fetchNormales(baseParams)
  const tcParams = { ...baseParams }
  if (filtroEstado.value) tcParams.estado = filtroEstado.value
  comprasStore.fetchTasaCero(tcParams)
}

function setFiltroEstado(val) {
  filtroEstado.value = val
  const baseParams = filtroTarjeta.value ? { tarjeta_id: filtroTarjeta.value } : {}
  const tcParams = { ...baseParams }
  if (val) tcParams.estado = val
  comprasStore.fetchTasaCero(tcParams)
}

// ── Modales ──────────────────────────────────────────────────────
const showNormalModal    = ref(false)
const showTasaCeroModal  = ref(false)
const editNormalTarget   = ref(null)
const editTasaCeroTarget = ref(null)

function openCreateNormal()   { editNormalTarget.value = null; showNormalModal.value = true }
function openEditNormal(c)    { editNormalTarget.value = c;    showNormalModal.value = true }
function openCreateTasaCero() { editTasaCeroTarget.value = null; showTasaCeroModal.value = true }
function openEditTasaCero(c)  { editTasaCeroTarget.value = c;    showTasaCeroModal.value = true }

async function onSaveNormal(payload) {
  try {
    if (editNormalTarget.value) await comprasStore.updateNormal(editNormalTarget.value.id, payload)
    else await comprasStore.createNormal(payload)
    recargarTodo()
    tarjetasStore.fetchTarjetas()
  } catch (e) { console.error(e) }
}

async function onSaveTasaCero(payload) {
  try {
    if (editTasaCeroTarget.value) await comprasStore.updateTasaCero(editTasaCeroTarget.value.id, payload)
    else await comprasStore.createTasaCero(payload)
    recargarTodo()
    tarjetasStore.fetchTarjetas()
  } catch (e) { console.error(e) }
}

// ── Eliminar ─────────────────────────────────────────────────────
const deleteNormalTarget   = ref(null)
const deleteTasaCeroTarget = ref(null)
const deleteErrorMsg       = ref('')
const deleting             = ref(false)

function confirmDeleteNormal(c)   { deleteNormalTarget.value = c;   deleteErrorMsg.value = '' }
function confirmDeleteTasaCero(c) { deleteTasaCeroTarget.value = c; deleteErrorMsg.value = '' }

async function doDeleteNormal() {
  deleting.value = true
  try {
    await comprasStore.deleteNormal(deleteNormalTarget.value.id)
    await Promise.all([
      comprasStore.fetchNormales(filtroTarjeta.value ? { tarjeta_id: filtroTarjeta.value } : {}),
      tarjetasStore.fetchTarjetas(),
    ])
    selectedDay.value = null
    deleteNormalTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally { deleting.value = false }
}

async function doDeleteTasaCero() {
  deleting.value = true
  try {
    await comprasStore.deleteTasaCero(deleteTasaCeroTarget.value.id)
    await Promise.all([
      comprasStore.fetchTasaCero(filtroTarjeta.value ? { tarjeta_id: filtroTarjeta.value } : {}),
      tarjetasStore.fetchTarjetas(),
    ])
    deleteTasaCeroTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally { deleting.value = false }
}

// ── Helpers Tasa Cero ────────────────────────────────────────────
function cuotasPagadas(c)      { return c.cuotas?.filter(q => q.estado === 'pagada').length ?? 0 }
function tieneCuotasPagadas(c) { return cuotasPagadas(c) > 0 }
function cuotasPct(c)          { return c.total_cuotas ? Math.round((cuotasPagadas(c) / c.total_cuotas) * 100) : 0 }
function cuotaMonto(c)         { return c.total_cuotas ? parseFloat(c.monto_total) / c.total_cuotas : 0 }

function cuotasBlocks(c) {
  const paid  = cuotasPagadas(c)
  const total = c.total_cuotas ?? 0
  const BLOCKS = 10
  const filled = Math.round((paid / total) * BLOCKS)
  return '[' + '█'.repeat(filled) + '░'.repeat(BLOCKS - filled) + ']'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

