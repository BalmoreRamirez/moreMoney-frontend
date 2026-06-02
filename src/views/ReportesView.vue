<template>
  <section>
    <!-- Encabezado -->
    <div>
      <h1 class="text-2xl font-bold text-slate-100">Reportes</h1>
      <p class="mt-1 text-sm" style="color:#94A3B8">Consolidado mensual global de pagos.</p>
    </div>

    <!-- Navegación de mes -->
    <div class="mt-6 flex items-center justify-between">
      <button
        class="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
        @click="prevMonth"
      >
        <span class="material-symbols-outlined text-[18px]">chevron_left</span>
        Anterior
      </button>

      <h2 class="text-xl font-semibold text-white">{{ MONTHS[store.month - 1] }} {{ store.year }}</h2>

      <button
        class="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
        @click="nextMonth"
      >
        Siguiente
        <span class="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="mt-8 flex items-center justify-center py-16">
      <span class="material-symbols-outlined animate-spin text-4xl" style="color:rgba(16,185,129,0.5)">progress_activity</span>
    </div>

    <template v-else>
      <!-- Gran total del mes -->
      <div class="mt-6 fintech-card p-6 text-center sm:p-8" style="background:linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(10,25,47,0) 100%);border-color:rgba(16,185,129,0.2)">
        <p class="text-sm font-medium uppercase tracking-widest text-slate-500">Total a pagar en {{ MONTHS[store.month - 1] }}</p>
        <p class="mt-3 break-all font-mono font-bold leading-none sm:break-normal" style="font-size:clamp(2rem, 8vw, 3.5rem);color:#10B981">
          {{ formatCurrency(store.grand_total) }}
        </p>
        <p v-if="store.resumen.length" class="mt-3 text-sm text-slate-500">
          {{ store.resumen.length }} tarjeta{{ store.resumen.length > 1 ? 's' : '' }}
          ·
          {{ totalNormalesCount }} compra{{ totalNormalesCount !== 1 ? 's' : '' }} normal{{ totalNormalesCount !== 1 ? 'es' : '' }} pendiente{{ totalNormalesCount !== 1 ? 's' : '' }}
          ·
          {{ totalCuotasCount }} cuota{{ totalCuotasCount !== 1 ? 's' : '' }} del mes
        </p>
        <p v-if="store.grand_total === 0 && store.resumen.length > 0" class="mt-2 text-sm font-medium" style="color:#10B981">
          ¡Sin pendientes este mes!
        </p>
      </div>

      <!-- Sin tarjetas -->
      <div v-if="store.resumen.length === 0" class="mt-6 fintech-card flex flex-col items-center py-14 text-center">
        <span class="material-symbols-outlined text-5xl" style="color:rgba(16,185,129,0.3)">bar_chart</span>
        <p class="mt-3 font-semibold text-slate-300">Sin tarjetas registradas</p>
        <p class="mt-1 text-sm text-slate-500">Añade tarjetas desde la sección <router-link to="/tarjetas" class="text-success hover:underline">Tarjetas</router-link>.</p>
      </div>

      <!-- Desglose por tarjeta -->
      <div v-else class="mt-4 space-y-4">
        <div
          v-for="r in store.resumen"
          :key="r.tarjeta_id"
          class="fintech-card p-5"
        >
          <!-- Cabecera tarjeta -->
          <div class="mb-4 flex items-center justify-between">
            <div>
              <p class="font-semibold text-slate-100">{{ r.nombre }}</p>
              <p class="text-xs text-slate-500">{{ r.banco }} · Pago día {{ r.dia_pago }}</p>
            </div>
            <span
              class="font-mono text-xl font-bold"
              :style="r.total > 0 ? 'color:#F59E0B' : 'color:#10B981'"
            >{{ formatCurrency(r.total) }}</span>
          </div>

          <!-- Filas de detalle -->
          <div class="space-y-2 rounded-xl overflow-hidden" style="border:1px solid rgba(255,255,255,0.06)">
            <!-- Compras normales -->
            <div class="flex items-center justify-between px-4 py-3" style="border-bottom:1px solid rgba(255,255,255,0.04)">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px] text-slate-500">receipt_long</span>
                <span class="text-sm text-slate-300">Compras normales pendientes</span>
                <span v-if="r.normales_count > 0" class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style="background:rgba(245,158,11,0.15);color:#F59E0B">
                  {{ r.normales_count }}
                </span>
              </div>
              <span class="font-mono text-sm font-semibold" :style="r.total_normales > 0 ? 'color:#F59E0B' : 'color:#4B5563'">
                {{ formatCurrency(r.total_normales) }}
              </span>
            </div>

            <!-- Cuotas tasa cero -->
            <div class="px-4 py-3" :style="r.cuotas_detalle.length ? 'border-bottom:1px solid rgba(255,255,255,0.04)' : ''">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[16px] text-slate-500">payments</span>
                  <span class="text-sm text-slate-300">Cuotas tasa cero del mes</span>
                  <span v-if="r.cuotas_detalle.length > 0" class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style="background:rgba(59,130,246,0.15);color:#93C5FD">
                    {{ r.cuotas_detalle.length }}
                  </span>
                </div>
                <span class="font-mono text-sm font-semibold" :style="r.total_cuotas > 0 ? 'color:#93C5FD' : 'color:#4B5563'">
                  {{ formatCurrency(r.total_cuotas) }}
                </span>
              </div>
              <!-- Desglose de cuotas -->
              <div v-if="r.cuotas_detalle.length" class="mt-2 space-y-1 pl-4 sm:pl-6">
                <div
                  v-for="(cd, i) in r.cuotas_detalle"
                  :key="i"
                  class="flex items-start justify-between gap-2 text-xs text-slate-500"
                >
                  <span class="min-w-0 truncate">{{ cd.nombre_compra }} <span class="text-slate-600">cuota {{ cd.numero_cuota }}/{{ cd.total_cuotas }}</span></span>
                  <span class="flex-shrink-0 font-mono" style="color:#93C5FD">{{ formatCurrency(cd.monto_cuota) }}</span>
                </div>
              </div>
            </div>

            <!-- Total tarjeta -->
            <div class="flex items-center justify-between px-4 py-3" style="background:rgba(255,255,255,0.02)">
              <span class="text-sm font-semibold text-slate-300">Total a pagar</span>
              <span class="font-mono text-base font-bold" :style="r.total > 0 ? 'color:#F59E0B' : 'color:#10B981'">
                {{ formatCurrency(r.total) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { onMounted, watch, computed } from 'vue'
import { useReportesStore } from '../stores/reportes'
import { formatCurrency } from '../utils/currency'

const store = useReportesStore()

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

onMounted(() => store.fetchMensual())
watch(() => [store.year, store.month], () => store.fetchMensual())

const totalNormalesCount = computed(() => store.resumen.reduce((s, r) => s + r.normales_count, 0))
const totalCuotasCount   = computed(() => store.resumen.reduce((s, r) => s + r.cuotas_detalle.length, 0))

function prevMonth() { store.prevMonth() }
function nextMonth() { store.nextMonth() }
</script>
