<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-30 flex w-60 flex-col"
      :style="{ background: 'linear-gradient(180deg, #0A192F 0%, #081423 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center gap-3 px-5" style="border-bottom: 1px solid rgba(255,255,255,0.06)">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background: rgba(16,185,129,0.15)">
          <span class="material-symbols-outlined text-[18px]" style="color: #10B981">account_balance</span>
        </div>
        <span class="text-base font-bold tracking-tight text-white">moreMoney</span>
      </div>

      <!-- Navegación -->
      <nav class="flex flex-1 flex-col gap-1 px-3 py-4">
        <span class="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest" style="color: #4B5563">General</span>

        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
          :class="isActive(item.to)
            ? 'nav-link--active'
            : 'nav-link--idle'"
        >
          <span
            class="material-symbols-outlined text-[20px] transition-colors duration-150"
            :class="isActive(item.to) ? 'text-success' : 'text-slate-500 group-hover:text-slate-300'"
          >{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Footer sidebar -->
      <div class="px-4 py-4" style="border-top: 1px solid rgba(255,255,255,0.06)">
        <p class="text-[11px]" style="color: #4B5563">moreMoney © {{ currentYear }}</p>
      </div>
    </aside>

    <!-- Área de contenido -->
    <div class="flex flex-1 flex-col pl-60">
      <!-- Top bar -->
      <header
        class="sticky top-0 z-20 flex h-16 items-center justify-between px-6"
        style="background: rgba(7,17,31,0.7); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.06)"
      >
        <!-- Breadcrumb / título de sección -->
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]" style="color: #4B5563">{{ currentNav?.icon }}</span>
          <span class="text-sm font-semibold text-slate-200">{{ currentNav?.label }}</span>
        </div>

        <!-- Indicador de fecha -->
        <span class="text-xs tabular-nums" style="color: #4B5563">{{ todayLabel }}</span>
      </header>

      <!-- Contenido de la ruta activa -->
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/',           icon: 'dashboard',       label: 'Dashboard' },
  { to: '/tarjetas',   icon: 'credit_card',      label: 'Tarjetas' },
  { to: '/compras',    icon: 'shopping_bag',     label: 'Compras' },
  { to: '/calendario', icon: 'calendar_month',   label: 'Calendario' },
  { to: '/reportes',   icon: 'bar_chart',        label: 'Reportes' },
]

function isActive(to) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

const currentNav = computed(() => navItems.find((n) => isActive(n.to)))

const currentYear = new Date().getFullYear()

const todayLabel = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<style scoped>
.nav-link--active {
  color: #F1F5F9;
  background: rgba(16, 185, 129, 0.10);
  border: 1px solid rgba(16, 185, 129, 0.18);
}

.nav-link--idle {
  color: #64748B;
  border: 1px solid transparent;
}

.nav-link--idle:hover {
  color: #CBD5E1;
  background: rgba(255, 255, 255, 0.04);
}
</style>
