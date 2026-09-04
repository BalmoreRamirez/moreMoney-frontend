<template>
  <section class="space-y-8">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold" style="color:var(--color-text-primary)">Dashboard</h1>
        <p class="mt-0.5 text-sm" style="color:var(--color-text-secondary)">Resumen financiero global</p>
      </div>
      <span class="text-xs border rounded-lg px-3 py-1.5"
        style="background:var(--color-surface-mid);border-color:var(--color-border);color:var(--color-text-muted)">
        {{ MONTHS[mesActual - 1] }} {{ anioActual }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <span class="material-symbols-outlined animate-spin text-4xl" style="color:rgba(16,185,129,0.4)">progress_activity</span>
    </div>

    <template v-else>

      <!-- ══════════════════════════════════════════════════════
           SECCIÓN 1: CRÉDITOS OTORGADOS
           ══════════════════════════════════════════════════════ -->
      <div>
        <div class="mb-3 flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px]" style="color:var(--color-text-muted)">handshake</span>
          <h2 class="text-xs font-semibold uppercase tracking-widest" style="color:var(--color-text-muted)">Créditos otorgados</h2>
        </div>

        <!-- KPIs créditos -->
        <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">

          <div class="fintech-card p-4">
            <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" style="color:var(--color-text-muted)">Capital en calle</p>
            <p class="font-mono text-xl font-bold" style="color:#3B82F6">{{ formatCurrency(capitalInvertido) }}</p>
            <p class="mt-0.5 text-[11px]" style="color:var(--color-text-muted)">{{ prestamosActivos.length }} activo{{ prestamosActivos.length !== 1 ? 's' : '' }}</p>
          </div>

          <div class="fintech-card p-4">
            <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" style="color:var(--color-text-muted)">Capital recuperado</p>
            <p class="font-mono text-xl font-bold" style="color:var(--color-success)">{{ formatCurrency(capitalRecuperado) }}</p>
            <div class="mt-2 progress-bar-track">
              <div class="progress-bar-fill" :style="{ width: pctRecuperado + '%' }" />
            </div>
            <p class="mt-1 text-[11px]" style="color:var(--color-text-muted)">{{ pctRecuperado }}% del capital</p>
          </div>

          <div class="fintech-card p-4">
            <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" style="color:var(--color-text-muted)">Ganancia esperada</p>
            <p class="font-mono text-xl font-bold" style="color:var(--color-alert)">{{ formatCurrency(gananciasEsperadas) }}</p>
            <p class="mt-0.5 text-[11px]" style="color:var(--color-text-muted)">interés acumulado</p>
          </div>

          <div class="fintech-card p-4">
            <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" style="color:var(--color-text-muted)">Total egresos mes</p>
            <p class="font-mono text-xl font-bold" style="color:var(--color-danger)">{{ formatCurrency(totalEgresos) }}</p>
            <p class="mt-0.5 text-[11px]" style="color:var(--color-text-muted)">salidas en {{ MONTHS[mesActual - 1] }}</p>
          </div>
        </div>

        <!-- Tabla compacta de préstamos activos -->
        <div v-if="prestamosActivos.length" class="mt-3 fintech-card overflow-hidden">
          <div
            v-for="p in prestamosActivos"
            :key="p.id"
            class="loan-row flex items-center justify-between gap-4 px-4 py-3"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium truncate" style="color:var(--color-text-primary)">{{ p.deudor_nombre }}</p>
              <p class="text-[11px]" style="color:var(--color-text-muted)">
                Capital {{ formatCurrency(p.capital) }} · {{ (parseFloat(p.tasa_interes_mensual) * 100).toFixed(0) }}%/mes
              </p>
            </div>
            <div class="flex items-center gap-5 shrink-0 text-right">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wide" style="color:var(--color-text-muted)">Pagado</p>
                <p class="font-mono text-sm font-bold" style="color:var(--color-success)">{{ formatCurrency(p.total_pagado) }}</p>
              </div>
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wide" style="color:var(--color-text-muted)">Interés</p>
                <p class="font-mono text-sm font-bold" style="color:var(--color-alert)">{{ formatCurrency(p.interes_generado) }}</p>
              </div>
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wide" style="color:var(--color-text-muted)">Pendiente</p>
                <p class="font-mono text-sm font-bold" style="color:var(--color-danger)">{{ formatCurrency(p.saldo_pendiente) }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="mt-3 fintech-card flex items-center justify-center gap-2 py-6 text-sm" style="color:var(--color-text-muted)">
          <span class="material-symbols-outlined text-[18px]">info</span>
          Sin préstamos activos
        </div>
      </div>


      <!-- ══════════════════════════════════════════════════════
           SECCIÓN 2: TARJETAS DE CRÉDITO
           ══════════════════════════════════════════════════════ -->
      <div>
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px]" style="color:var(--color-text-muted)">credit_card</span>
            <h2 class="text-xs font-semibold uppercase tracking-widest" style="color:var(--color-text-muted)">Tarjetas de crédito</h2>
          </div>
          <div class="flex items-center gap-4 text-right">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wide" style="color:var(--color-text-muted)">Disponible total</p>
              <p class="font-mono text-sm font-bold" style="color:var(--color-success)">{{ formatCurrency(totalDisponible) }}</p>
            </div>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wide" style="color:var(--color-text-muted)">Gastado total</p>
              <p class="font-mono text-sm font-bold" style="color:var(--color-danger)">{{ formatCurrency(totalGastado) }}</p>
            </div>
          </div>
        </div>

        <!-- Grid de donut cards -->
        <div v-if="tarjetasStore.tarjetas.length"
          class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <router-link
            v-for="t in tarjetasStore.tarjetas"
            :key="t.id"
            :to="`/tarjetas/${t.id}`"
            class="fintech-card flex flex-col items-center px-4 py-5 text-center card-link"
          >
            <!-- Nombre y banco -->
            <p class="text-sm font-bold truncate w-full" style="color:var(--color-text-primary)">{{ t.nombre }}</p>
            <p class="text-[11px] mb-4" style="color:var(--color-text-muted)">{{ t.banco }}</p>

            <!-- Donut ring -->
            <div class="ring-wrap relative mb-3">
              <svg viewBox="0 0 100 100" class="ring-svg" style="transform:rotate(-90deg)">
                <!-- Track -->
                <circle cx="50" cy="50" r="40" fill="none" class="ring-track"
                  stroke-width="9" />
                <!-- Progress -->
                <circle cx="50" cy="50" r="40" fill="none"
                  :stroke="pctBgColor(t)"
                  stroke-width="9"
                  stroke-linecap="round"
                  :stroke-dasharray="CIRC"
                  :stroke-dashoffset="CIRC * (1 - pctGastado(t) / 100)"
                  style="transition:stroke-dashoffset 0.6s ease"
                />
                <!-- Dot endpoint -->
                <circle
                  :cx="50 + 40 * Math.sin(2 * Math.PI * pctGastado(t) / 100)"
                  :cy="50 - 40 * Math.cos(2 * Math.PI * pctGastado(t) / 100)"
                  r="4.5"
                  :fill="pctBgColor(t)"
                />
              </svg>
              <!-- Centro -->
              <div class="ring-center">
                <span class="font-mono text-2xl font-bold" :style="pctColor(t)">{{ pctGastado(t) }}%</span>
              </div>
            </div>

            <!-- Montos -->
            <p class="font-mono text-xs font-semibold" style="color:var(--color-text-secondary)">
              {{ formatCurrency(t.saldo_gastado) }}
              <span style="color:var(--color-text-muted)"> de </span>
              {{ formatCurrency(t.limite_credito) }}
            </p>
            <p class="mt-0.5 text-[11px]" style="color:var(--color-text-muted)">utilizado</p>

            <!-- Divider -->
            <div class="w-full my-3" style="border-top:1px solid var(--color-border)" />

            <!-- Disponible + día pago -->
            <div class="flex w-full justify-between text-left">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wide" style="color:var(--color-text-muted)">Disponible</p>
                <p class="font-mono text-sm font-bold" style="color:var(--color-success)">{{ formatCurrency(t.saldo_disponible) }}</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-semibold uppercase tracking-wide" style="color:var(--color-text-muted)">Día de pago</p>
                <p class="font-mono text-sm font-bold" style="color:var(--color-text-primary)">{{ t.dia_pago }}</p>
              </div>
            </div>
          </router-link>
        </div>

        <div v-else class="fintech-card flex items-center justify-center gap-2 py-6 text-sm" style="color:var(--color-text-muted)">
          <span class="material-symbols-outlined text-[18px]">info</span>
          Sin tarjetas registradas
        </div>
      </div>

    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { usePrestamosStore } from '../stores/prestamos'
import { useCuentasStore }   from '../stores/cuentas'
import { useTarjetasStore }  from '../stores/tarjetas'
import { formatCurrency }    from '../utils/currency'

const prestamosStore = usePrestamosStore()
const cuentasStore   = useCuentasStore()
const tarjetasStore  = useTarjetasStore()

const MONTHS     = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const now        = new Date()
const mesActual  = now.getMonth() + 1
const anioActual = now.getFullYear()

const loading = ref(true)

onMounted(async () => {
  await Promise.all([
    prestamosStore.fetchPrestamos({}, true),
    cuentasStore.fetchStats(anioActual, mesActual),
    tarjetasStore.fetchTarjetas(1, true),
  ])
  loading.value = false
})

// ── Créditos ──────────────────────────────────────────────
const prestamosActivos = computed(() =>
  prestamosStore.prestamos.filter(p => p.estado === 'activo')
)
const capitalInvertido = computed(() =>
  prestamosActivos.value.reduce((s, p) => s + parseFloat(p.capital ?? 0), 0)
)
const capitalRecuperado = computed(() =>
  prestamosActivos.value.reduce((s, p) => s + parseFloat(p.total_pagado ?? 0), 0)
)
const gananciasEsperadas = computed(() =>
  prestamosActivos.value.reduce((s, p) => s + parseFloat(p.interes_generado ?? 0), 0)
)
const pctRecuperado = computed(() =>
  capitalInvertido.value > 0
    ? Math.min(100, Math.round((capitalRecuperado.value / capitalInvertido.value) * 100))
    : 0
)
const totalEgresos = computed(() =>
  cuentasStore.stats?.flujo_mes?.egresos ?? 0
)

// ── Tarjetas ──────────────────────────────────────────────
const CIRC = 2 * Math.PI * 40   // circumferencia del ring (r=40)

const totalDisponible = computed(() =>
  tarjetasStore.tarjetas.reduce((s, t) => s + parseFloat(t.saldo_disponible ?? 0), 0)
)
const totalGastado = computed(() =>
  tarjetasStore.tarjetas.reduce((s, t) => s + parseFloat(t.saldo_gastado ?? 0), 0)
)

function pctGastado(t) {
  const lim = parseFloat(t.limite_credito)
  if (!lim) return 0
  return Math.min(100, Math.round((parseFloat(t.saldo_gastado) / lim) * 100))
}

function pctColor(t) {
  const p = pctGastado(t)
  if (p >= 80) return 'color:var(--color-danger)'
  if (p >= 50) return 'color:var(--color-alert)'
  return 'color:var(--color-success)'
}

function pctBgColor(t) {
  const p = pctGastado(t)
  if (p >= 80) return 'var(--color-danger)'
  if (p >= 50) return 'var(--color-alert)'
  return 'var(--color-success)'
}
</script>

<style scoped>
.loan-row + .loan-row {
  border-top: 1px solid var(--color-border);
}

.card-link {
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
}
.card-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.10);
}

/* Donut ring */
.ring-wrap {
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}
.ring-svg {
  width: 100%;
  height: 100%;
}
.ring-track {
  stroke: var(--color-border);
}
[data-theme="dark"] .ring-track {
  stroke: var(--color-surface-high);
}
.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
