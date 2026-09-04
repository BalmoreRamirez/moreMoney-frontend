<template>
  <section>
    <!-- Back + acciones -->
    <div class="mb-5 flex items-center justify-between gap-3">
      <button class="flex items-center gap-1 text-sm transition-colors shrink-0"
        style="color:var(--color-text-muted)"
        @click="router.back()">
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver a tarjetas
      </button>

      <!-- Botones nueva compra (solo cuando hay datos cargados) -->
      <div v-if="data" class="flex gap-2">
        <button class="add-btn" @click="openNormal">
          <span class="material-symbols-outlined text-[15px]">add</span>
          Compra normal
        </button>
        <button class="add-btn add-btn--outline" @click="openTasaCero">
          <span class="material-symbols-outlined text-[15px]">add</span>
          Tasa cero
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style="border-color:var(--color-success);border-top-color:transparent" />
    </div>

    <div v-else-if="store.error" class="rounded-xl px-5 py-4 text-sm"
      style="background:var(--color-danger-bg);color:var(--color-danger)">
      {{ store.error }}
    </div>

    <template v-else-if="data">

      <!-- ── Encabezado compacto ───────────────────────────────── -->
      <div class="fintech-card flex items-center gap-4 p-4">

        <!-- Plástico mini -->
        <div class="relative hidden sm:flex h-24 w-40 shrink-0 flex-col justify-between overflow-hidden rounded-xl p-3.5"
          :style="cardStyle">
          <div class="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10" style="background:white" />
          <p class="text-[9px] font-bold uppercase tracking-widest text-white/60">{{ data.tarjeta.banco }}</p>
          <div>
            <p class="text-[8px] uppercase tracking-widest text-white/40">{{ data.tarjeta.nombre }}</p>
            <p class="font-mono text-sm font-bold text-white leading-tight">{{ formatCurrency(data.saldos.saldo_disponible) }}</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex flex-1 flex-col gap-2.5">

          <!-- Fila 1: métricas + badge próximo pago -->
          <div class="flex flex-wrap items-end gap-x-5 gap-y-2">
            <div>
              <p class="kpi-label">Disponible</p>
              <p class="kpi-value font-mono" style="color:var(--color-success)">{{ formatCurrency(data.saldos.saldo_disponible) }}</p>
            </div>
            <div>
              <p class="kpi-label">Gastado</p>
              <p class="kpi-value font-mono" :style="{ color: usageColor }">{{ formatCurrency(data.saldos.saldo_gastado) }}</p>
            </div>
            <div>
              <p class="kpi-label">Corte</p>
              <p class="kpi-value" style="color:var(--color-text-primary)">día {{ data.tarjeta.dia_corte }}</p>
            </div>
            <div>
              <p class="kpi-label">Pago</p>
              <p class="kpi-value" style="color:var(--color-text-primary)">día {{ data.tarjeta.dia_pago }}</p>
            </div>

            <!-- Próximo pago badge — alineado al extremo derecho -->
            <div class="ml-auto flex items-center gap-2.5 rounded-lg px-3 py-2 next-pay-badge">
              <span class="material-symbols-outlined text-[14px]" style="color:#b45309">payment</span>
              <div>
                <p class="kpi-label" style="color:#b45309">Próximo pago · {{ labelProximoPago }}</p>
                <p class="font-mono text-base font-bold leading-tight" style="color:#92400e">
                  {{ formatCurrency(totalCorteAPagar + totalCuotasCorte) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Fila 2: barra de uso -->
          <div>
            <div class="mb-1 flex items-center justify-between">
              <p class="text-[10px]" style="color:var(--color-text-muted)">
                Límite <span class="font-mono">{{ formatCurrency(data.saldos.limite_credito) }}</span>
              </p>
              <p class="text-[10px] font-bold" :style="{ color: usageColor }">{{ usagePct }}%</p>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill transition-all duration-700"
                :style="{ width: usagePct + '%', background: usageColor }" />
            </div>
          </div>

        </div>
      </div>

      <!-- ── Cortes ────────────────────────────────────────────── -->
      <div class="mt-8 grid gap-5 lg:grid-cols-2">

        <!-- CORTE A PAGAR -->
        <div class="fintech-card overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b" style="border-color:var(--color-border)">
            <div class="flex items-center gap-2">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg" style="background:rgba(245,158,11,0.12)">
                <span class="material-symbols-outlined text-[15px]" style="color:var(--color-alert)">credit_card_clock</span>
              </span>
              <div>
                <p class="text-sm font-semibold" style="color:var(--color-text-primary)">Corte a pagar</p>
                <p class="text-[10px]" style="color:var(--color-text-muted)">hasta el día {{ data.tarjeta.dia_corte }} — {{ labelUltimoCorte }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-mono text-base font-bold" style="color:var(--color-alert)">{{ formatCurrency(totalCorteAPagar) }}</p>
              <p class="text-[10px]" style="color:var(--color-text-muted)">{{ corteAPagar.length }} compra{{ corteAPagar.length !== 1 ? 's' : '' }}</p>
            </div>
          </div>

          <div v-if="!corteAPagar.length" class="flex items-center justify-center gap-2 py-8 text-sm" style="color:var(--color-text-muted)">
            <span class="material-symbols-outlined text-[18px]">check_circle</span>
            Sin compras pendientes en este corte
          </div>

          <div v-else>
            <div
              v-for="c in corteAPagar"
              :key="c.id"
              class="purchase-row flex items-center justify-between px-5 py-3 gap-3"
            >
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium truncate" style="color:var(--color-text-primary)">{{ c.nombre }}</p>
                <p class="text-[11px]" style="color:var(--color-text-muted)">{{ formatDate(c.fecha_compra) }}</p>
              </div>
              <span class="font-mono text-sm font-semibold shrink-0" style="color:var(--color-alert)">{{ formatCurrency(c.monto) }}</span>
            </div>

            <!-- Tasa cero cuotas del corte actual -->
            <template v-if="cuotasCorteActual.length">
              <div class="px-5 py-2 text-[10px] font-semibold uppercase tracking-wider"
                style="background:var(--color-surface-mid);color:var(--color-text-muted)">
                Cuotas tasa cero
              </div>
              <div
                v-for="q in cuotasCorteActual"
                :key="'q-' + q.cuotaId"
                class="purchase-row flex items-center justify-between px-5 py-3 gap-3"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium truncate" style="color:var(--color-text-primary)">{{ q.nombre }}</p>
                  <p class="text-[11px]" style="color:var(--color-text-muted)">Cuota {{ q.numeroCuota }}/{{ q.totalCuotas }} · {{ formatDate(q.fechaEstimada) }}</p>
                </div>
                <span class="font-mono text-sm font-semibold shrink-0" style="color:var(--color-alert)">{{ formatCurrency(q.monto) }}</span>
              </div>
            </template>

            <!-- Total -->
            <div class="flex items-center justify-between px-5 py-3" style="background:var(--color-surface-mid);border-top:1px solid var(--color-border)">
              <span class="text-xs font-semibold" style="color:var(--color-text-muted)">Total a pagar</span>
              <span class="font-mono font-bold" style="color:var(--color-alert)">{{ formatCurrency(totalCorteAPagar + totalCuotasCorte) }}</span>
            </div>
          </div>
        </div>

        <!-- CORTE EN PROCESO -->
        <div class="fintech-card overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b" style="border-color:var(--color-border)">
            <div class="flex items-center gap-2">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg" style="background:rgba(59,130,246,0.1)">
                <span class="material-symbols-outlined text-[15px]" style="color:#3B82F6">schedule</span>
              </span>
              <div>
                <p class="text-sm font-semibold" style="color:var(--color-text-primary)">Corte en proceso</p>
                <p class="text-[10px]" style="color:var(--color-text-muted)">desde el día {{ data.tarjeta.dia_corte }} — acumulando</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-mono text-base font-bold" style="color:#3B82F6">{{ formatCurrency(totalCorteEnProceso) }}</p>
              <p class="text-[10px]" style="color:var(--color-text-muted)">{{ corteEnProceso.length }} compra{{ corteEnProceso.length !== 1 ? 's' : '' }}</p>
            </div>
          </div>

          <div v-if="!corteEnProceso.length" class="flex items-center justify-center gap-2 py-8 text-sm" style="color:var(--color-text-muted)">
            <span class="material-symbols-outlined text-[18px]">hourglass_empty</span>
            Sin compras en el siguiente corte
          </div>

          <div v-else>
            <div
              v-for="c in corteEnProceso"
              :key="c.id"
              class="purchase-row flex items-center justify-between px-5 py-3 gap-3"
            >
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium truncate" style="color:var(--color-text-primary)">{{ c.nombre }}</p>
                <p class="text-[11px]" style="color:var(--color-text-muted)">{{ formatDate(c.fecha_compra) }}</p>
              </div>
              <span class="font-mono text-sm font-semibold shrink-0" style="color:#3B82F6">{{ formatCurrency(c.monto) }}</span>
            </div>
            <div class="flex items-center justify-between px-5 py-3" style="background:var(--color-surface-mid);border-top:1px solid var(--color-border)">
              <span class="text-xs font-semibold" style="color:var(--color-text-muted)">Acumulado</span>
              <span class="font-mono font-bold" style="color:#3B82F6">{{ formatCurrency(totalCorteEnProceso) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Tasa cero ──────────────────────────────────────────── -->
      <div class="mt-6">
        <div class="mb-3 flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px]" style="color:var(--color-text-muted)">payments</span>
          <h2 class="text-xs font-semibold uppercase tracking-widest" style="color:var(--color-text-muted)">
            Tasa cero
            <span class="ml-1 rounded-full px-1.5 py-0.5 text-[10px]"
              style="background:rgba(16,185,129,0.15);color:var(--color-success)">
              {{ data.compras_tasa_cero.length }}
            </span>
          </h2>
        </div>

        <div v-if="!data.compras_tasa_cero.length" class="fintech-card flex items-center justify-center gap-2 py-8 text-sm" style="color:var(--color-text-muted)">
          <span class="material-symbols-outlined text-[18px]">info</span>
          Sin compras a tasa cero registradas
        </div>

        <div v-else class="space-y-3">
          <div v-for="c in data.compras_tasa_cero" :key="c.id" class="fintech-card p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-semibold truncate" style="color:var(--color-text-primary)">{{ c.nombre }}</p>
                <p class="mt-0.5 text-xs" style="color:var(--color-text-muted)">{{ formatDate(c.fecha_compra) }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="font-mono text-base font-bold" style="color:var(--color-text-primary)">{{ formatCurrency(c.monto_total) }}</p>
                <span class="text-[11px] rounded-full px-2 py-0.5"
                  :style="c.estado === 'activa'
                    ? 'background:rgba(16,185,129,0.12);color:var(--color-success)'
                    : 'background:rgba(100,116,139,0.1);color:var(--color-text-muted)'">
                  {{ c.estado }}
                </span>
              </div>
            </div>
            <div class="mt-4">
              <div class="mb-1.5 flex items-center justify-between text-xs">
                <span style="color:var(--color-text-muted)">Cuotas pagadas</span>
                <span class="font-mono font-semibold" style="color:var(--color-text-secondary)">{{ cuotasPagadas(c) }}/{{ c.total_cuotas }}</span>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill" :style="{ width: cuotasPct(c) + '%' }" />
              </div>
              <p class="mt-1.5 text-[10px]" style="color:var(--color-text-muted)">
                Cuota mensual:
                <span class="font-mono" style="color:var(--color-text-secondary)">{{ formatCurrency(cuotaMonto(c)) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

    </template>

    <!-- Modales de compra -->
    <CompraNormalFormModal
      v-model="showNormal"
      :tarjetas="tarjetaComoArray"
      :default-tarjeta-id="tarjetaId"
      @saved="onNormalSaved"
    />
    <CompraTasaCeroFormModal
      v-model="showTasaCero"
      :tarjetas="tarjetaComoArray"
      :default-tarjeta-id="tarjetaId"
      @saved="onTasaCeroSaved"
    />

  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTarjetasStore } from '../stores/tarjetas'
import { useComprasStore }  from '../stores/compras'
import { formatCurrency } from '../utils/currency'
import CompraNormalFormModal   from '../components/CompraNormalFormModal.vue'
import CompraTasaCeroFormModal from '../components/CompraTasaCeroFormModal.vue'

const route        = useRoute()
const router       = useRouter()
const store        = useTarjetasStore()
const comprasStore = useComprasStore()

const tarjetaId = computed(() => Number(route.params.id))

onMounted(() => store.fetchTarjeta(route.params.id))

// ── Modales de compra ─────────────────────────────────────
const showNormal   = ref(false)
const showTasaCero = ref(false)

const tarjetaComoArray = computed(() =>
  data.value?.tarjeta ? [{ ...data.value.tarjeta, ...data.value.saldos }] : []
)

function openNormal()   { showNormal.value   = true }
function openTasaCero() { showTasaCero.value = true }

async function onNormalSaved(payload) {
  try {
    await comprasStore.createNormal(payload)
    await store.fetchTarjeta(route.params.id)
  } catch (e) { console.error(e) }
}

async function onTasaCeroSaved(payload) {
  try {
    await comprasStore.createTasaCero(payload)
    await store.fetchTarjeta(route.params.id)
  } catch (e) { console.error(e) }
}

const data = computed(() => store.tarjeta)

// ── Plástico ──────────────────────────────────────────────
const GRADIENTS = [
  ['#0D47A1','#1565C0'], ['#004B49','#00695C'], ['#1B5E20','#2E7D32'],
  ['#4A148C','#6A1B9A'], ['#880E4F','#AD1457'], ['#E65100','#EF6C00'],
  ['#263238','#37474F'], ['#1A237E','#283593'],
]
function bankHash(name = '') {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % GRADIENTS.length
}
const cardStyle = computed(() => {
  const [from, to] = GRADIENTS[bankHash(data.value?.tarjeta?.banco)]
  return { background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }
})

const usagePct = computed(() => {
  if (!data.value) return 0
  const { limite_credito, saldo_gastado } = data.value.saldos
  if (!limite_credito) return 0
  return Math.min(100, Math.round((saldo_gastado / limite_credito) * 100))
})
const usageColor = computed(() => {
  if (usagePct.value >= 90) return '#DC2626'
  if (usagePct.value >= 70) return '#F59E0B'
  return '#10B981'
})

// ── Lógica de cortes ──────────────────────────────────────
// Último corte: si hoy >= dia_corte → corte de este mes; si no → corte del mes pasado
const lastCutDate = computed(() => {
  const dia   = data.value?.tarjeta?.dia_corte ?? 1
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const cutThisMonth = new Date(today.getFullYear(), today.getMonth(), dia)
  return today >= cutThisMonth
    ? cutThisMonth
    : new Date(today.getFullYear(), today.getMonth() - 1, dia)
})

const labelUltimoCorte = computed(() => {
  return lastCutDate.value.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
})

const labelProximoPago = computed(() => {
  const dia   = data.value?.tarjeta?.dia_pago ?? 1
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const payThisMonth = new Date(today.getFullYear(), today.getMonth(), dia)
  const next = today <= payThisMonth
    ? payThisMonth
    : new Date(today.getFullYear(), today.getMonth() + 1, dia)
  return next.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
})

// Compras normales pendientes por corte
const comprasPendientes = computed(() =>
  (data.value?.compras_normales ?? []).filter(c => c.estado === 'pendiente')
)

const corteAPagar = computed(() =>
  comprasPendientes.value.filter(c => new Date(c.fecha_compra + 'T00:00:00') <= lastCutDate.value)
)

const corteEnProceso = computed(() =>
  comprasPendientes.value.filter(c => new Date(c.fecha_compra + 'T00:00:00') > lastCutDate.value)
)

const totalCorteAPagar    = computed(() => corteAPagar.value.reduce((s, c) => s + parseFloat(c.monto), 0))
const totalCorteEnProceso = computed(() => corteEnProceso.value.reduce((s, c) => s + parseFloat(c.monto), 0))

// Cuotas tasa cero pendientes del corte actual (primera cuota pendiente de cada compra)
const cuotasCorteActual = computed(() => {
  const result = []
  for (const c of (data.value?.compras_tasa_cero ?? [])) {
    if (c.estado !== 'activa') continue
    const primera = (c.cuotas ?? [])
      .filter(q => q.estado === 'pendiente')
      .sort((a, b) => a.numero_cuota - b.numero_cuota)[0]
    if (!primera) continue
    const fechaEst = new Date(primera.fecha_estimada_pago + 'T00:00:00')
    if (fechaEst <= lastCutDate.value) {
      result.push({
        cuotaId:     primera.id,
        nombre:      c.nombre,
        numeroCuota: primera.numero_cuota,
        totalCuotas: c.total_cuotas,
        fechaEstimada: primera.fecha_estimada_pago,
        monto:       parseFloat(primera.monto_cuota),
      })
    }
  }
  return result
})

const totalCuotasCorte = computed(() =>
  cuotasCorteActual.value.reduce((s, q) => s + q.monto, 0)
)

// ── Tasa cero helpers ─────────────────────────────────────
function cuotasPagadas(c) { return c.cuotas?.filter(q => q.estado === 'pagada').length ?? 0 }
function cuotasPct(c) {
  if (!c.total_cuotas) return 0
  return Math.round((cuotasPagadas(c) / c.total_cuotas) * 100)
}
function cuotaMonto(c) {
  return c.total_cuotas ? parseFloat(c.monto_total) / c.total_cuotas : 0
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
/* ── KPIs ──────────────────────────────────────── */
.kpi-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}
.kpi-value {
  font-size: 15px;
  font-weight: 800;
  margin-top: 2px;
  line-height: 1.15;
}

/* ── Badge próximo pago ────────────────────────── */
.next-pay-badge {
  background: rgba(180, 83, 9, 0.09);
  border: 1px solid rgba(180, 83, 9, 0.2);
}

/* ── Filas de compras ──────────────────────────── */
.purchase-row + .purchase-row {
  border-top: 1px solid var(--color-border);
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  background: var(--color-success);
  color: #fff;
  border: none;
}
.add-btn:hover { opacity: 0.88; transform: translateY(-1px); }

.add-btn--outline {
  background: transparent;
  color: var(--color-success);
  border: 1.5px solid var(--color-success);
}
.add-btn--outline:hover { background: var(--color-success-bg); }
</style>
