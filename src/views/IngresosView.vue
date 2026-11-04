<template>
  <section>
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold" style="color:var(--color-text-primary)">Ingresos</h1>
        <p class="mt-1 text-sm" style="color:var(--color-text-muted)">{{ tabDescription }}</p>
      </div>
      <button class="btn-brand" @click="onTabCreate">
        <span class="material-symbols-outlined text-[18px]">add</span>
        <span class="hidden sm:inline">{{ tabCreateLabel }}</span>
      </button>
    </div>

    <!-- Tabs -->
    <div class="mt-6 flex gap-1 rounded-xl p-1 w-fit" style="background:var(--color-surface-mid);border:1px solid var(--color-border)">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        class="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
        :style="activeTab === tab.key
          ? 'background:var(--color-brand);color:#fff;box-shadow:0 2px 8px rgba(3,36,107,0.2)'
          : 'color:var(--color-text-secondary)'"
        @click="activeTab = tab.key"
      >
        <span class="material-symbols-outlined align-middle text-[16px] mr-1">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="store.error" class="mt-4 rounded-xl px-5 py-4 text-sm" style="background:var(--color-danger-bg);color:var(--color-danger)">
      {{ store.error }}
    </div>

    <!-- ════ SUELDOS ════ -->
    <template v-else-if="activeTab === 'sueldos'">
      <AppDataTable
        class="mt-6"
        :data="store.sueldos"
        :loading="store.loading"
        empty-text="Sin sueldos registrados"
        empty-icon="payments"
      >
        <!-- Nombre + estado -->
        <Column field="nombre" header="Nombre" sortable style="min-width:200px">
          <template #body="{ data: s }">
            <div class="flex items-center gap-2">
              <p class="font-semibold" style="color:var(--color-text-primary)">{{ s.nombre }}</p>
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                :style="s.activo ? 'background:var(--color-success-bg);color:var(--color-success)' : 'background:var(--color-surface-high);color:var(--color-text-muted)'"
              >{{ s.activo ? 'Activo' : 'Inactivo' }}</span>
            </div>
          </template>
        </Column>

        <!-- Cuenta -->
        <Column field="cuenta.nombre" header="Cuenta" sortable style="min-width:140px">
          <template #body="{ data: s }">
            <span class="text-sm" style="color:var(--color-text-secondary)">{{ s.cuenta?.nombre ?? '—' }}</span>
          </template>
        </Column>

        <!-- Día de cobro -->
        <Column field="dia_cobro" header="Día cobro" sortable style="min-width:110px">
          <template #body="{ data: s }">
            <span class="text-sm" style="color:var(--color-text-secondary)">Día {{ s.dia_cobro }}</span>
          </template>
        </Column>

        <!-- Último cobro -->
        <Column header="Último cobro" style="min-width:120px">
          <template #body="{ data: s }">
            <span class="text-sm" style="color:var(--color-text-secondary)">{{ ultimoCobro(s) }}</span>
          </template>
        </Column>

        <!-- Monto -->
        <Column field="monto" header="Monto/mes" sortable style="min-width:120px">
          <template #body="{ data: s }">
            <span class="font-mono font-semibold" style="color:var(--color-success)">{{ formatCurrency(s.monto) }}</span>
          </template>
        </Column>

        <!-- Acciones -->
        <Column header="Acciones" style="min-width:152px;width:152px">
          <template #body="{ data: s }">
            <div class="flex items-center justify-center gap-2">
              <AccionIcono
                v-if="s.activo"
                icon="payments"
                label="Cobrar sueldo"
                variant="success"
                @click="openCobrar(s)"
              />
              <AccionIcono
                icon="edit"
                label="Editar sueldo"
                @click="openEditSueldo(s)"
              />
              <AccionIcono
                icon="delete"
                label="Eliminar sueldo"
                variant="danger"
                @click="confirmDeleteSueldo(s)"
              />
            </div>
          </template>
        </Column>
      </AppDataTable>
    </template>

    <!-- ════ INVERSIONES ════ -->
    <template v-else-if="activeTab === 'inversiones'">
      <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold" style="color:var(--color-text-primary)">Seguimiento de inversiones</h2>
          <p class="mt-0.5 text-xs" style="color:var(--color-text-muted)">Capital, cobros y rentabilidad en un solo lugar</p>
        </div>
        <div class="flex flex-wrap gap-2" aria-label="Filtrar inversiones por estado">
        <button
          v-for="f in FILTROS_ESTADO"
          :key="f.value"
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
          :style="filtroEstado === f.value
            ? 'background:var(--color-brand-light);color:var(--color-brand);border:1px solid var(--color-brand-border)'
            : 'background:var(--color-surface-mid);color:var(--color-text-secondary);border:1px solid transparent'"
          @click="setFiltroEstado(f.value)"
        >{{ f.label }}</button>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-end justify-between gap-2">
        <h3 class="text-sm font-semibold" style="color:var(--color-text-primary)">Resumen de inversiones</h3>
        <p class="text-[11px]" style="color:var(--color-text-muted)">Totales según el filtro seleccionado</p>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 xl:grid-cols-5">
        <article v-for="metric in resumenInversiones" :key="metric.label" class="rounded-xl border p-3 sm:p-4" :class="metric.label === 'Ganancia estimada' ? 'col-span-2 sm:col-span-1' : ''" style="background:var(--color-surface);border-color:var(--color-border)">
          <p class="text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]" style="color:var(--color-text-muted)">{{ metric.label }}</p>
          <p class="mt-1.5 font-mono text-base font-bold sm:mt-2 sm:text-lg" :style="{ color: metric.color }">{{ formatCurrency(metric.value) }}</p>
          <p v-if="metric.note" class="mt-1 text-[11px]" style="color:var(--color-text-muted)">{{ metric.note }}</p>
        </article>
      </div>

      <AppDataTable
        class="mt-4 hidden sm:block"
        :data="store.inversiones"
        :loading="store.loading"
        :empty-text="emptyInvestmentsText"
        empty-icon="trending_up"
      >
        <!-- Nombre + estado -->
        <Column field="nombre" header="Inversión" sortable style="min-width:200px">
          <template #body="{ data: inv }">
            <div class="min-w-0">
              <p class="font-semibold truncate" style="color:var(--color-text-primary)">{{ inv.nombre }}</p>
              <div v-if="inv.fecha_compra" class="text-[11px]" style="color:var(--color-text-muted)">{{ formatDate(inv.fecha_compra) }}</div>
              <div v-if="inv.estado === 'vendida'" class="text-[11px]" style="color:var(--color-text-muted)">Venta: {{ formatDate(fechaVenta(inv)) }}</div>
            </div>
          </template>
        </Column>

        <!-- Estado -->
        <Column field="estado" header="Estado" sortable style="min-width:100px">
          <template #body="{ data: inv }">
            <span
              class="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              :style="inv.estado === 'en_curso' ? 'background:var(--color-alert-bg);color:var(--color-alert)' : 'background:var(--color-success-bg);color:var(--color-success)'"
            >{{ inv.estado === 'en_curso' ? 'En curso' : 'Vendida' }}</span>
          </template>
        </Column>

        <!-- Costo -->
        <Column field="costo_total" header="Capital" sortable style="min-width:120px">
          <template #body="{ data: inv }">
            <span class="font-mono text-sm font-semibold" style="color:var(--color-text-primary)">{{ formatCurrency(inv.costo_total) }}</span>
          </template>
        </Column>

        <!-- Ingreso cobrado -->
        <Column header="Cobrado" style="min-width:125px">
          <template #body="{ data: inv }">
            <span class="font-mono text-sm font-semibold" style="color:var(--color-success)">{{ formatCurrency(inv.total_cobrado ?? 0) }}</span>
            <p class="mt-0.5 text-[10px]" style="color:var(--color-text-muted)">{{ inv.estado === 'vendida' ? 'Total recibido' : 'Abonos recibidos' }}</p>
          </template>
        </Column>

        <Column header="Por cobrar" style="min-width:125px">
          <template #body="{ data: inv }">
            <template v-if="inv.estado === 'en_curso' && inv.saldo_por_cobrar != null">
              <span class="font-mono text-sm font-semibold" :style="{ color: Number(inv.saldo_por_cobrar) > 0 ? 'var(--color-alert)' : 'var(--color-success)' }">{{ formatCurrency(Math.max(0, Number(inv.saldo_por_cobrar))) }}</span>
              <p class="mt-0.5 text-[10px]" style="color:var(--color-text-muted)">del precio esperado</p>
            </template>
            <span v-else class="text-sm" style="color:var(--color-text-muted)">—</span>
          </template>
        </Column>

        <Column header="Ganancia" style="min-width:125px">
          <template #body="{ data: inv }">
            <template v-if="(inv.estado === 'vendida' ? inv.ganancia : inv.ganancia_esperada) != null">
              <span class="font-mono text-sm font-semibold" :style="{ color: Number(inv.estado === 'vendida' ? inv.ganancia : inv.ganancia_esperada) >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">{{ formatCurrency(inv.estado === 'vendida' ? inv.ganancia : inv.ganancia_esperada) }}</span>
              <p class="mt-0.5 text-[10px]" style="color:var(--color-text-muted)">{{ inv.estado === 'vendida' ? 'Realizada' : 'Estimada' }}</p>
            </template>
            <span v-else class="text-sm" style="color:var(--color-text-muted)">—</span>
          </template>
        </Column>

        <!-- Progreso (en_curso con cobros) -->
        <Column header="Progreso" style="min-width:130px">
          <template #body="{ data: inv }">
            <template v-if="inv.estado === 'vendida'">
              <div class="text-[10px] mb-1" style="color:var(--color-success)">Completada</div>
              <div class="progress-bar-track"><div class="progress-bar-fill" style="width:100%" /></div>
            </template>
            <template v-else-if="inv.precio_esperado && Number(inv.precio_esperado) > 0">
              <div class="text-[10px] mb-1" style="color:var(--color-text-muted)">
                {{ progresoCobro(inv) }}%
              </div>
              <div class="progress-bar-track">
                <div
                  class="progress-bar-fill"
                  :style="{ width: progresoCobro(inv) + '%' }"
                />
              </div>
            </template>
            <span v-else class="text-[11px]" style="color:var(--color-text-muted)">—</span>
          </template>
        </Column>

        <!-- Acciones -->
        <Column header="Acciones" style="min-width:184px;width:184px">
          <template #body="{ data: inv }">
            <InversionAcciones
              :inversion="inv"
              @detalle="openDetalleInversion(inv)"
              @cobrar="openCobrarInv(inv)"
              @editar="openEditInversion(inv)"
              @eliminar="confirmDeleteInversion(inv)"
              @resetear="doResetearInversion(inv)"
            />
          </template>
        </Column>
      </AppDataTable>

      <div v-if="store.loading" class="mt-4 flex justify-center rounded-xl border py-8 sm:hidden" style="background:var(--color-surface);border-color:var(--color-border)">
        <div class="h-6 w-6 animate-spin rounded-full border-2" style="border-color:var(--color-brand);border-top-color:transparent" />
      </div>
      <div v-else-if="!store.inversiones.length" class="mt-4 flex flex-col items-center rounded-xl border py-8 text-center sm:hidden" style="background:var(--color-surface);border-color:var(--color-border)">
        <span class="material-symbols-outlined mb-2 text-4xl" style="color:var(--color-text-muted);opacity:.35">trending_up</span>
        <p class="text-sm" style="color:var(--color-text-muted)">{{ emptyInvestmentsText }}</p>
      </div>
      <div v-else class="mt-4 space-y-3 sm:hidden">
        <article v-for="inv in store.inversiones" :key="inv.id" class="rounded-xl border p-4" style="background:var(--color-surface);border-color:var(--color-border)">
          <header class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="truncate text-sm font-semibold" style="color:var(--color-text-primary)">{{ inv.nombre }}</h3>
              <p class="mt-1 text-[11px]" style="color:var(--color-text-muted)">Compra: {{ formatDate(inv.fecha_compra) }}</p>
              <p v-if="inv.estado === 'vendida'" class="text-[11px]" style="color:var(--color-text-muted)">Venta: {{ formatDate(fechaVenta(inv)) }}</p>
            </div>
            <span class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold" :style="inv.estado === 'en_curso' ? 'background:var(--color-alert-bg);color:var(--color-alert)' : 'background:var(--color-success-bg);color:var(--color-success)'">
              {{ inv.estado === 'en_curso' ? 'En curso' : 'Vendida' }}
            </span>
          </header>

          <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <dt class="text-[10px] uppercase tracking-wide" style="color:var(--color-text-muted)">Capital</dt>
              <dd class="mt-1 font-mono text-sm font-semibold" style="color:var(--color-text-primary)">{{ formatCurrency(inv.costo_total) }}</dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-wide" style="color:var(--color-text-muted)">Cobrado</dt>
              <dd class="mt-1 font-mono text-sm font-semibold" style="color:var(--color-success)">{{ formatCurrency(inv.total_cobrado ?? 0) }}</dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-wide" style="color:var(--color-text-muted)">Por cobrar</dt>
              <dd class="mt-1 font-mono text-sm font-semibold" :style="{ color: inv.estado === 'en_curso' && Number(inv.saldo_por_cobrar || 0) > 0 ? 'var(--color-alert)' : 'var(--color-text-secondary)' }">
                {{ inv.estado === 'en_curso' && inv.saldo_por_cobrar != null ? formatCurrency(Math.max(0, Number(inv.saldo_por_cobrar))) : '—' }}
              </dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-wide" style="color:var(--color-text-muted)">{{ inv.estado === 'vendida' ? 'Ganancia' : 'Ganancia estimada' }}</dt>
              <dd v-if="(inv.estado === 'vendida' ? inv.ganancia : inv.ganancia_esperada) != null" class="mt-1 font-mono text-sm font-semibold" :style="{ color: Number(inv.estado === 'vendida' ? inv.ganancia : inv.ganancia_esperada) >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
                {{ formatCurrency(inv.estado === 'vendida' ? inv.ganancia : inv.ganancia_esperada) }}
              </dd>
              <dd v-else class="mt-1 text-sm" style="color:var(--color-text-muted)">—</dd>
            </div>
          </dl>

          <div v-if="inv.estado === 'vendida' || (inv.precio_esperado && Number(inv.precio_esperado) > 0)" class="mt-4">
            <div class="mb-1.5 flex justify-between text-[10px]" :style="{ color: inv.estado === 'vendida' ? 'var(--color-success)' : 'var(--color-text-muted)' }">
              <span>{{ inv.estado === 'vendida' ? 'Completada' : 'Progreso de cobro' }}</span>
              <span v-if="inv.estado !== 'vendida'">{{ progresoCobro(inv) }}%</span>
            </div>
            <div class="progress-bar-track"><div class="progress-bar-fill" :style="{ width: (inv.estado === 'vendida' ? 100 : progresoCobro(inv)) + '%' }" /></div>
          </div>

          <div class="mt-4 border-t pt-3" style="border-color:var(--color-border-soft)">
            <InversionAcciones
              :inversion="inv"
              @detalle="openDetalleInversion(inv)"
              @cobrar="openCobrarInv(inv)"
              @editar="openEditInversion(inv)"
              @eliminar="confirmDeleteInversion(inv)"
              @resetear="doResetearInversion(inv)"
            />
          </div>
        </article>
      </div>
    </template>

    <!-- ════ OTROS INGRESOS ════ -->
    <template v-else-if="activeTab === 'otros'">
      <AppDataTable
        class="mt-6"
        :data="store.otros"
        :loading="store.loading"
        empty-text="Sin ingresos registrados"
        empty-icon="add_circle"
      >
        <!-- Fecha -->
        <Column field="fecha" header="Fecha" sortable style="min-width:110px">
          <template #body="{ data: item }">
            <span class="text-sm" style="color:var(--color-text-secondary)">{{ item.fecha }}</span>
          </template>
        </Column>

        <!-- Descripción -->
        <Column field="descripcion" header="Descripción" sortable style="min-width:200px">
          <template #body="{ data: item }">
            <span class="text-sm" style="color:var(--color-text-primary)">{{ item.descripcion }}</span>
          </template>
        </Column>

        <!-- Cuenta -->
        <Column field="cuenta.nombre" header="Cuenta" sortable style="min-width:140px">
          <template #body="{ data: item }">
            <span class="text-sm" style="color:var(--color-text-secondary)">{{ item.cuenta?.nombre ?? '—' }}</span>
          </template>
        </Column>

        <!-- Monto -->
        <Column field="monto" header="Monto" sortable style="min-width:120px">
          <template #body="{ data: item }">
            <span class="font-mono font-semibold" style="color:var(--color-success)">{{ formatCurrency(item.monto) }}</span>
          </template>
        </Column>

        <!-- Acciones -->
        <Column header="Acciones" style="min-width:120px;width:120px">
          <template #body="{ data: item }">
            <div class="flex items-center justify-center gap-2">
              <AccionIcono
                icon="edit"
                label="Editar ingreso"
                @click="openEditOtro(item)"
              />
              <AccionIcono
                icon="delete"
                label="Eliminar ingreso"
                variant="danger"
                @click="confirmDeleteOtro(item)"
              />
            </div>
          </template>
        </Column>
      </AppDataTable>
    </template>

    <!-- ═══ MODALES ═══ -->
    <SueldoFormModal
      v-model="showSueldoModal"
      :edit-data="editSueldo"
      @saved="onSueldoSaved"
    />

    <CobrarSueldoModal
      v-model="showCobrarModal"
      :sueldo="cobrarTarget"
      @confirmed="onCobrar"
    />

    <InversionFormModal
      v-model="showInversionModal"
      :edit-data="editInversion"
      @saved="onInversionSaved"
    />

    <CobrarInversionModal
      v-model="showCobrarInvModal"
      :inversion="cobrarInvTarget"
      @saved="onCobrarInv"
    />

    <InversionDetalleModal
      :inversion="detalleInversion"
      :cuentas="cuentasStore.cuentas"
      @close="detalleInversion = null"
    />

    <IngresoFormModal
      v-model="showOtroModal"
      :ingreso="editOtro"
      @saved="onOtroSaved"
    />

    <ConfirmDeleteModal
      v-if="deleteTarget"
      :nombre="deleteTarget.nombre"
      :warning="deleteType === 'inversion' ? 'El egreso de la inversión se conservará en los movimientos de la cuenta; eliminar la ficha no devuelve el dinero.' : ''"
      :error="deleteErrorMsg"
      :deleting="deleting"
      @confirm="doDelete"
      @cancel="deleteTarget = null; deleteErrorMsg = ''"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useIngresosStore } from '../stores/ingresos'
import { useCuentasStore } from '../stores/cuentas'
import { formatCurrency } from '../utils/currency'
import AppDataTable         from '../components/AppDataTable.vue'
import SueldoFormModal      from '../components/SueldoFormModal.vue'
import CobrarSueldoModal    from '../components/CobrarSueldoModal.vue'
import InversionFormModal   from '../components/InversionFormModal.vue'
import CobrarInversionModal from '../components/CobrarInversionModal.vue'
import InversionDetalleModal from '../components/InversionDetalleModal.vue'
import InversionAcciones from '../components/InversionAcciones.vue'
import AccionIcono from '../components/AccionIcono.vue'
import IngresoFormModal     from '../components/IngresoFormModal.vue'
import ConfirmDeleteModal   from '../components/ConfirmDeleteModal.vue'
import { useToast } from '../composables/useToast'

const store        = useIngresosStore()
const cuentasStore = useCuentasStore()
const toast        = useToast()

const TABS = [
  { key: 'sueldos',     label: 'Sueldos',     icon: 'payments' },
  { key: 'inversiones', label: 'Inversiones', icon: 'trending_up' },
  { key: 'otros',       label: 'Otros',       icon: 'add_circle' },
]

const FILTROS_ESTADO = [
  { value: 'en_curso', label: 'En curso' },
  { value: 'vendida',  label: 'Vendidas' },
  { value: '',         label: 'Todas' },
]

const activeTab    = ref('sueldos')
const filtroEstado = ref('en_curso')

onMounted(() => Promise.all([cuentasStore.fetchCuentas(), store.fetchSueldos(), store.fetchInversiones(), store.fetchOtros()]))

watch(activeTab, (tab) => {
  if (tab === 'sueldos')     store.fetchSueldos()
  if (tab === 'inversiones') store.fetchInversiones({ estado: filtroEstado.value || undefined })
  if (tab === 'otros')       store.fetchOtros()
})

const tabCreateLabel = computed(() => ({
  sueldos:     'Nuevo sueldo',
  inversiones: 'Nueva inversión',
  otros:       'Nuevo ingreso',
}[activeTab.value]))

const tabDescription = computed(() => ({
  sueldos: 'Consulta tus sueldos y cobros registrados.',
  inversiones: 'Sigue el capital, los cobros y la rentabilidad.',
  otros: 'Administra tus otros ingresos registrados.',
}[activeTab.value]))

const emptyInvestmentsText = computed(() => {
  if (filtroEstado.value === 'en_curso') return 'No hay inversiones en curso.'
  if (filtroEstado.value === 'vendida') return 'No hay inversiones vendidas.'
  return 'Sin inversiones registradas.'
})

const resumenInversiones = computed(() => {
  const inversiones = store.inversiones || []
  const sumar = (selector) => inversiones.reduce((total, inv) => total + Number(selector(inv) || 0), 0)
  return [
    { label: 'Capital invertido', value: sumar(inv => inv.costo_total), color: 'var(--color-text-primary)' },
    { label: 'Total cobrado', value: sumar(inv => inv.total_cobrado), color: 'var(--color-success)' },
    { label: 'Por cobrar', value: sumar(inv => inv.estado === 'en_curso' ? Math.max(0, Number(inv.saldo_por_cobrar || 0)) : 0), color: 'var(--color-alert)' },
    { label: 'Ganancia realizada', value: sumar(inv => inv.estado === 'vendida' ? inv.ganancia : 0), color: 'var(--color-success)' },
    { label: 'Ganancia estimada', value: sumar(inv => inv.estado === 'en_curso' ? inv.ganancia_esperada : 0), color: 'var(--color-alert)' },
  ]
})

function progresoCobro(inversion) {
  const objetivo = Number(inversion.precio_esperado)
  if (!objetivo || objetivo <= 0) return 0
  return Math.min(100, Math.round((Number(inversion.total_cobrado || 0) / objetivo) * 100))
}

function onTabCreate() {
  if (activeTab.value === 'sueldos')     openCreateSueldo()
  if (activeTab.value === 'inversiones') openCreateInversion()
  if (activeTab.value === 'otros')       openCreateOtro()
}

function setFiltroEstado(val) {
  filtroEstado.value = val
  store.fetchInversiones({ estado: val || undefined })
}

const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
function ultimoCobro(sueldo) {
  if (!sueldo.cobros?.length) return 'Nunca'
  const cobros = [...sueldo.cobros].sort((a, b) => b.anio - a.anio || b.mes - a.mes)
  const c = cobros[0]
  return `${MESES_CORTOS[c.mes - 1]} ${c.anio}`
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fechaVenta(inversion) {
  const cobros = inversion.cobros || []
  return inversion.fecha_venta || cobros.at(-1)?.fecha_cobro || '—'
}

// ─── SUELDOS ────────────────────────────────────────────────────────────────
const showSueldoModal = ref(false)
const editSueldo      = ref(null)

function openCreateSueldo() { editSueldo.value = null; showSueldoModal.value = true }
function openEditSueldo(s)  { editSueldo.value = s;    showSueldoModal.value = true }

async function onSueldoSaved(payload) {
  try {
    if (payload.id) await store.updateSueldo(payload.id, payload)
    else            await store.createSueldo(payload)
    toast.success(payload.id ? 'Sueldo actualizado' : 'Sueldo registrado')
  } catch (e) {
    toast.fromError(e, 'No se pudo guardar el sueldo')
  }
}

// ─── COBRAR SUELDO ────────────────────────────────────────────────────────────
const showCobrarModal = ref(false)
const cobrarTarget    = ref(null)

function openCobrar(s) { cobrarTarget.value = s; showCobrarModal.value = true }

async function onCobrar(payload) {
  if (!cobrarTarget.value) return
  try {
    await store.cobrarSueldo(cobrarTarget.value.id, payload)
    toast.success('Sueldo marcado como cobrado')
  } catch (e) {
    toast.fromError(e, 'No se pudo registrar el cobro')
  }
}

// ─── INVERSIONES ─────────────────────────────────────────────────────────────
const showInversionModal = ref(false)
const editInversion      = ref(null)
const detalleInversion   = ref(null)

function openCreateInversion()  { editInversion.value = null; showInversionModal.value = true }
function openEditInversion(inv) { editInversion.value = inv;  showInversionModal.value = true }
function openDetalleInversion(inv) { detalleInversion.value = inv }

async function onInversionSaved(payload) {
  try {
    if (editInversion.value) await store.updateInversion(editInversion.value.id, payload)
    else                     await store.createInversion(payload)
    toast.success(editInversion.value ? 'Inversión actualizada' : 'Inversión registrada')
  } catch (e) {
    toast.fromError(e, 'No se pudo guardar la inversión')
  }
}

async function doResetearInversion(inv) {
  try {
    await store.resetearInversion(inv.id)
  } catch (e) {
    console.error(e)
  }
}

// ─── COBRAR INVERSIÓN ────────────────────────────────────────────────────────
const showCobrarInvModal = ref(false)
const cobrarInvTarget    = ref(null)

function openCobrarInv(inv) { cobrarInvTarget.value = inv; showCobrarInvModal.value = true }

async function onCobrarInv(payload) {
  if (!cobrarInvTarget.value) return
  try {
    await store.registrarCobro(cobrarInvTarget.value.id, payload)
    toast.success('Cobro de inversión registrado')
  } catch (e) {
    toast.fromError(e, 'No se pudo registrar el cobro')
  }
}

// ─── ELIMINAR ────────────────────────────────────────────────────────────────
const deleteTarget   = ref(null)
const deleteErrorMsg = ref('')
const deleting       = ref(false)
const deleteType     = ref('')

function confirmDeleteSueldo(s)      { deleteTarget.value = s;   deleteType.value = 'sueldo';    deleteErrorMsg.value = '' }
function confirmDeleteInversion(inv) { deleteTarget.value = inv; deleteType.value = 'inversion'; deleteErrorMsg.value = '' }
function confirmDeleteOtro(item)     { deleteTarget.value = item; deleteType.value = 'otro';     deleteErrorMsg.value = '' }

async function doDelete() {
  deleting.value = true
  try {
    if (deleteType.value === 'sueldo')    await store.deleteSueldo(deleteTarget.value.id)
    if (deleteType.value === 'inversion') await store.deleteInversion(deleteTarget.value.id)
    if (deleteType.value === 'otro')      await store.deleteOtro(deleteTarget.value.id)
    const labels = { sueldo: 'Sueldo', inversion: 'Inversión', otro: 'Ingreso' }
    toast.success(`${labels[deleteType.value] || 'Registro'} eliminado`)
    deleteTarget.value = null
  } catch (e) {
    deleteErrorMsg.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally {
    deleting.value = false
  }
}

// ─── OTROS INGRESOS ──────────────────────────────────────────────────────────
const showOtroModal = ref(false)
const editOtro      = ref(null)

function openCreateOtro()   { editOtro.value = null; showOtroModal.value = true }
function openEditOtro(item) { editOtro.value = item; showOtroModal.value = true }

async function onOtroSaved(payload) {
  try {
    if (editOtro.value) await store.updateOtro(editOtro.value.id, payload)
    else                await store.createOtro(payload)
    toast.success(editOtro.value ? 'Ingreso actualizado' : 'Ingreso registrado')
  } catch (e) {
    toast.fromError(e, 'No se pudo guardar el ingreso')
  }
}
</script>
