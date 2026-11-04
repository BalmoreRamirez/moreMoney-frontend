<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="inversion"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="presentation"
        @mousedown.self="$emit('close')"
        @keydown.esc="$emit('close')"
      >
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.5);backdrop-filter:blur(5px)" />
        <section
          class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-5 shadow-card sm:p-6"
          style="background:var(--color-surface);border:1px solid var(--color-border)"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inversion-detalle-title"
        >
          <header class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-widest" style="color:var(--color-text-muted)">Detalle de inversión</p>
              <h2 id="inversion-detalle-title" class="mt-1 text-lg font-bold" style="color:var(--color-text-primary)">
                {{ inversion.nombre }}
              </h2>
              <p class="mt-0.5 text-xs" style="color:var(--color-text-muted)">
                Compra: {{ formatDate(inversion.fecha_compra) }}
              </p>
            </div>
            <button class="icon-btn" aria-label="Cerrar detalle" @click="$emit('close')">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </header>

          <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div class="fintech-card p-3">
              <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Costo</p>
              <p class="mt-1 font-mono text-sm font-bold" style="color:var(--color-text-primary)">{{ formatCurrency(inversion.costo_total) }}</p>
            </div>
            <div class="fintech-card p-3">
              <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Total esperado / venta</p>
              <p class="mt-1 font-mono text-sm font-bold" style="color:var(--color-text-primary)">{{ formatCurrency(totalObjetivo) }}</p>
            </div>
            <div class="fintech-card p-3">
              <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Cobrado</p>
              <p class="mt-1 font-mono text-sm font-bold" style="color:var(--color-success)">{{ formatCurrency(inversion.total_cobrado || 0) }}</p>
            </div>
            <div v-if="inversion.estado === 'en_curso'" class="fintech-card p-3">
              <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Por cobrar</p>
              <p class="mt-1 font-mono text-sm font-bold" style="color:var(--color-alert)">{{ formatCurrency(Math.max(0, inversion.saldo_por_cobrar || 0)) }}</p>
            </div>
            <div v-if="ganancia != null" class="fintech-card p-3">
              <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">{{ inversion.estado === 'vendida' ? 'Ganancia' : 'Ganancia esperada' }}</p>
              <p class="mt-1 font-mono text-sm font-bold" :style="{ color: ganancia >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
                {{ formatCurrency(ganancia) }}
              </p>
            </div>
            <div class="fintech-card p-3">
              <p class="text-[10px] uppercase tracking-wider" style="color:var(--color-text-muted)">Cuenta de inversión</p>
              <p class="mt-1 truncate text-sm font-semibold" style="color:var(--color-text-primary)">{{ inversion.cuenta_egreso?.nombre || '—' }}</p>
            </div>
          </div>

          <div v-if="progreso != null" class="mt-4 rounded-xl p-4" style="background:var(--color-surface-mid)">
            <div class="mb-2 flex justify-between text-xs" style="color:var(--color-text-secondary)">
              <span>Progreso de cobro</span>
              <span>{{ progreso }}% · {{ formatCurrency(inversion.total_cobrado || 0) }} de {{ formatCurrency(totalObjetivo) }}</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill" :style="{ width: `${progreso}%` }" />
            </div>
          </div>

          <div class="mt-6">
            <div class="mb-3 flex items-center justify-between gap-3">
              <h3 class="text-sm font-semibold" style="color:var(--color-text-primary)">Historial de pagos</h3>
              <span class="text-xs" style="color:var(--color-text-muted)">{{ cobrosOrdenados.length }} pago{{ cobrosOrdenados.length === 1 ? '' : 's' }}</span>
            </div>

            <div v-if="!cobrosOrdenados.length" class="fintech-card py-8 text-center text-sm" style="color:var(--color-text-muted)">
              Todavía no hay pagos registrados.
            </div>
            <div v-else class="fintech-card overflow-hidden">
              <div class="hidden overflow-x-auto sm:block">
                <table class="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr style="border-bottom:1px solid var(--color-border)">
                      <th class="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Fecha</th>
                      <th class="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Cuenta</th>
                      <th class="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Monto</th>
                      <th class="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style="color:var(--color-text-muted)">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cobro in cobrosOrdenados" :key="cobro.id" style="border-bottom:1px solid var(--color-border-soft)">
                      <td class="px-4 py-3 whitespace-nowrap" style="color:var(--color-text-secondary)">{{ formatDate(cobro.fecha_cobro) }}</td>
                      <td class="px-4 py-3" style="color:var(--color-text-secondary)">{{ cuentaCobro(cobro) }}</td>
                      <td class="px-4 py-3 text-right font-mono font-semibold whitespace-nowrap" style="color:var(--color-success)">{{ formatCurrency(cobro.monto) }}</td>
                      <td class="px-4 py-3" style="color:var(--color-text-muted)">{{ cobro.nota || '—' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" class="px-4 py-3 text-right text-xs font-semibold" style="color:var(--color-text-secondary)">Total cobrado</td>
                      <td class="px-4 py-3 text-right font-mono font-bold whitespace-nowrap" style="color:var(--color-success)">{{ formatCurrency(inversion.total_cobrado || 0) }}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div class="divide-y sm:hidden" style="border-color:var(--color-border-soft)">
                <article v-for="cobro in cobrosOrdenados" :key="cobro.id" class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-3 py-3">
                  <div class="min-w-0">
                    <p class="text-xs font-medium" style="color:var(--color-text-primary)">{{ formatDate(cobro.fecha_cobro) }}</p>
                    <p class="mt-1 break-words text-xs" style="color:var(--color-text-secondary)">{{ cuentaCobro(cobro) }}</p>
                    <p v-if="cobro.nota" class="mt-1 break-words text-[11px]" style="color:var(--color-text-muted)">{{ cobro.nota }}</p>
                  </div>
                  <p class="whitespace-nowrap text-right font-mono text-sm font-semibold" style="color:var(--color-success)">{{ formatCurrency(cobro.monto) }}</p>
                </article>
                <div class="flex items-center justify-between gap-3 px-3 py-3">
                  <span class="text-xs font-semibold" style="color:var(--color-text-secondary)">Total cobrado</span>
                  <span class="whitespace-nowrap font-mono text-sm font-bold" style="color:var(--color-success)">{{ formatCurrency(inversion.total_cobrado || 0) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '../utils/currency'

const props = defineProps({
  inversion: { type: Object, default: null },
  cuentas: { type: Array, default: () => [] },
})

defineEmits(['close'])

const cobrosOrdenados = computed(() =>
  [...(props.inversion?.cobros || [])].sort((a, b) => {
    const fecha = String(a.fecha_cobro || '').localeCompare(String(b.fecha_cobro || ''))
    return fecha || Number(a.id) - Number(b.id)
  }),
)

const totalObjetivo = computed(() =>
  props.inversion?.estado === 'vendida'
    ? props.inversion.precio_venta_total
    : props.inversion?.precio_esperado,
)

const ganancia = computed(() =>
  props.inversion?.estado === 'vendida'
    ? props.inversion.ganancia
    : props.inversion?.ganancia_esperada,
)

const progreso = computed(() => {
  const total = Number(totalObjetivo.value)
  if (!Number.isFinite(total) || total <= 0) return null
  return Math.min(100, Math.round((Number(props.inversion?.total_cobrado || 0) / total) * 100))
})

function cuentaCobro(cobro) {
  return props.cuentas.find(c => Number(c.id) === Number(cobro.cuenta_id))?.nombre || '—'
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('es-SV', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
</script>
