<template>
  <div class="flex min-h-screen">
    <!-- Overlay móvil -->
    <Transition name="overlay">
      <div
        v-if="menuOpen"
        class="fixed inset-0 z-20 lg:hidden"
        style="background: rgba(7,17,31,0.75); backdrop-filter: blur(4px)"
        @click="menuOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-30 flex w-60 flex-col transition-transform duration-300 lg:translate-x-0"
      :class="menuOpen ? 'translate-x-0' : '-translate-x-full'"
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
          :class="isActive(item.to) ? 'nav-link--active' : 'nav-link--idle'"
          @click="menuOpen = false"
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
    <div class="flex min-w-0 flex-1 flex-col lg:pl-60">
      <!-- Top bar -->
      <header
        class="sticky top-0 z-20 flex h-16 items-center justify-between px-4 lg:px-6"
        style="background: rgba(7,17,31,0.7); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.06)"
      >
        <div class="flex items-center gap-2">
          <!-- Botón hamburguesa (solo móvil) -->
          <button
            class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 lg:hidden"
            @click="menuOpen = !menuOpen"
          >
            <span class="material-symbols-outlined text-[22px]">{{ menuOpen ? 'close' : 'menu' }}</span>
          </button>

          <!-- Ícono + título de sección -->
          <span class="material-symbols-outlined hidden text-[18px] sm:block" style="color: #4B5563">{{ currentNav?.icon }}</span>
          <span class="text-sm font-semibold text-slate-200">{{ currentNav?.label }}</span>
        </div>

        <!-- Fecha + usuario + logout -->
        <div class="flex items-center gap-3">
          <span class="hidden text-xs tabular-nums md:block" style="color: #4B5563">{{ todayLabel }}</span>
          <div class="flex items-center gap-2" style="border-left: 1px solid rgba(255,255,255,0.08); padding-left: 0.75rem">
            <span class="material-symbols-outlined hidden text-[18px] sm:block" style="color: #4B5563">account_circle</span>
            <span class="hidden text-xs font-medium sm:block" style="color: #94A3B8">{{ authStore.usuario?.usuario }}</span>
            <button
              class="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-all hover:bg-white/5"
              style="color: #4B5563; border: 1px solid rgba(255,255,255,0.06)"
              title="Cerrar sesión"
              @click="handleLogout"
            >
              <span class="material-symbols-outlined text-[15px]">logout</span>
              <span class="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Contenido de la ruta activa -->
      <main class="flex-1 p-4 lg:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()
const menuOpen  = ref(false)

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

const navItems = [
  { to: '/',           icon: 'dashboard',              label: 'Dashboard' },
  { to: '/tarjetas',   icon: 'credit_card',             label: 'Tarjetas' },
  { to: '/compras',    icon: 'shopping_bag',            label: 'Compras' },
  { to: '/calendario', icon: 'calendar_month',          label: 'Calendario' },
  { to: '/reportes',   icon: 'bar_chart',               label: 'Reportes' },
  { to: '/cuentas',    icon: 'account_balance_wallet',  label: 'Cuentas' },
  { to: '/ingresos',   icon: 'payments',                label: 'Ingresos' },
  { to: '/egresos',    icon: 'money_off',               label: 'Egresos' },
  { to: '/prestamos',  icon: 'handshake',               label: 'Préstamos' },
]

function isActive(to) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

const currentNav  = computed(() => navItems.find((n) => isActive(n.to)))
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

.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from,   .overlay-leave-to     { opacity: 0; }
</style>
