<template>
  <section>
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Calendario</h1>
        <p class="mt-1 text-sm" style="color:#94A3B8">Cortes y fechas de pago de tus tarjetas.</p>
      </div>
    </div>

    <!-- Month navigation -->
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

    <!-- Legend -->
    <div class="mt-4 flex flex-wrap items-center gap-3 sm:gap-5">
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <span class="h-2.5 w-2.5 flex-shrink-0 rounded-full" style="background:#3B82F6" />
        Corte
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <span class="h-2.5 w-2.5 flex-shrink-0 rounded-full" style="background:#10B981" />
        Pago (pendiente)
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <span class="h-2.5 w-2.5 flex-shrink-0 rounded-full" style="background:#374151" />
        Pago (al día)
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="mt-8 flex items-center justify-center py-16">
      <span class="material-symbols-outlined animate-spin text-4xl" style="color:rgba(16,185,129,0.5)">progress_activity</span>
    </div>

    <!-- Calendar grid -->
    <div v-else class="mt-6 fintech-card overflow-hidden p-0">
      <!-- Days of week header -->
      <div class="grid grid-cols-7 border-b" style="border-color:rgba(255,255,255,0.06)">
        <div
          v-for="(day, i) in DAYS"
          :key="day"
          class="py-2 text-center text-[10px] font-semibold uppercase tracking-wider sm:py-3 sm:text-xs"
          style="color:#64748B"
        >
          <!-- Inicial en móvil, abreviatura completa en sm+ -->
          <span class="sm:hidden">{{ DAYS_SHORT[i] }}</span>
          <span class="hidden sm:inline">{{ day }}</span>
        </div>
      </div>

      <!-- Weeks -->
      <div>
        <div
          v-for="(week, wi) in calendarWeeks"
          :key="wi"
          class="grid grid-cols-7"
          :style="wi < calendarWeeks.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.04)' : ''"
        >
          <div
            v-for="(day, di) in week"
            :key="di"
            class="relative min-h-[60px] p-1 sm:min-h-[100px] sm:p-2"
            :class="[
              di < 6 ? 'border-r' : '',
              day && isToday(day) ? 'today-cell' : '',
              !day ? 'empty-cell' : '',
            ]"
            style="border-color:rgba(255,255,255,0.04)"
          >
            <!-- Day number -->
            <span
              v-if="day"
              class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium sm:h-6 sm:w-6 sm:text-xs"
              :class="isToday(day) ? 'text-white font-bold' : 'text-slate-400'"
              :style="isToday(day) ? 'background:#10B981' : ''"
            >{{ day }}</span>

            <!-- Events: solo puntos de color en móvil, etiquetas en sm+ -->
            <div v-if="day" class="mt-1 flex flex-col gap-1">
              <!-- Corte events -->
              <div
                v-for="ev in corteEvents(day)"
                :key="'corte-' + ev.tarjeta_id"
                class="flex items-center gap-1 rounded-md px-1 py-0.5 sm:px-1.5"
                style="background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.2)"
                :title="`Corte: ${ev.tarjeta_nombre} (${ev.banco})`"
              >
                <span class="h-1.5 w-1.5 flex-shrink-0 rounded-full" style="background:#3B82F6" />
                <span class="hidden truncate text-[10px] sm:block" style="color:#93C5FD">{{ ev.tarjeta_nombre }}</span>
              </div>

              <!-- Pago events -->
              <button
                v-for="ev in pagoEvents(day)"
                :key="'pago-' + ev.tarjeta_id"
                type="button"
                class="flex w-full items-center gap-1 rounded-md px-1 py-0.5 text-left transition-opacity hover:opacity-80 sm:px-1.5"
                :style="ev.tiene_pendientes
                  ? 'background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25)'
                  : 'background:rgba(55,65,81,0.4);border:1px solid rgba(255,255,255,0.06)'"
                :title="`Pago: ${ev.tarjeta_nombre} · ${ev.tiene_pendientes ? ev.pendientes_count + ' pendientes' : 'Al día'}`"
                @click="openPago(ev)"
              >
                <span
                  class="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  :style="ev.tiene_pendientes ? 'background:#10B981' : 'background:#374151'"
                />
                <span
                  class="hidden truncate text-[10px] sm:block"
                  :style="ev.tiene_pendientes ? 'color:#6EE7B7' : 'color:#6B7280'"
                >{{ ev.tarjeta_nombre }}</span>
                <span
                  v-if="ev.tiene_pendientes"
                  class="ml-auto hidden flex-shrink-0 text-[9px] font-bold sm:block"
                  style="color:#10B981"
                >{{ ev.pendientes_count }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state: no tarjetas -->
    <div v-if="!store.loading && store.tarjetas.length === 0" class="mt-4 rounded-xl px-6 py-8 text-center text-sm text-slate-500" style="background:rgba(255,255,255,0.02);border:1px dashed rgba(255,255,255,0.08)">
      No tienes tarjetas registradas. Añade una desde la sección <router-link to="/tarjetas" class="text-success hover:underline">Tarjetas</router-link>.
    </div>

    <!-- Pago detalle modal -->
    <PagoDetalleModal
      v-model="showModal"
      :tarjeta-id="selectedPago?.tarjeta_id"
      :tarjeta-nombre="selectedPago?.tarjeta_nombre"
      :banco="selectedPago?.banco"
      @confirmed="onConfirmed"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { ref } from 'vue'
import { useCalendarioStore } from '../stores/calendario'
import PagoDetalleModal from '../components/PagoDetalleModal.vue'

const store = useCalendarioStore()

const MONTHS     = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS       = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const DAYS_SHORT = ['L','M','X','J','V','S','D']

const showModal   = ref(false)
const selectedPago = ref(null)

onMounted(() => store.fetchCalendario())

watch(() => [store.year, store.month], () => store.fetchCalendario())

// Monday-based calendar grid
const firstDayOffset = computed(() => {
  const d = new Date(store.year, store.month - 1, 1).getDay()
  return (d + 6) % 7
})

const daysInMonth = computed(() => new Date(store.year, store.month, 0).getDate())

const calendarWeeks = computed(() => {
  const cells = []
  for (let i = 0; i < firstDayOffset.value; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth.value; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
})

const today = new Date()
function isToday(day) {
  return day === today.getDate() &&
         store.month === today.getMonth() + 1 &&
         store.year  === today.getFullYear()
}

function corteEvents(day) {
  return store.events.filter(e => e.day === day && e.type === 'corte')
}

function pagoEvents(day) {
  return store.events.filter(e => e.day === day && e.type === 'pago')
}

function prevMonth() {
  store.prevMonth()
}

function nextMonth() {
  store.nextMonth()
}

async function openPago(ev) {
  selectedPago.value = ev
  showModal.value    = true
  await store.fetchDetalle(ev.tarjeta_id)
}

function onConfirmed() {
  selectedPago.value = null
}
</script>

<style scoped>
.today-cell {
  background: rgba(16, 185, 129, 0.04);
}
.empty-cell {
  background: rgba(0, 0, 0, 0.1);
}
</style>
