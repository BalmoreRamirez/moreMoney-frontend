<template>
  <div class="flex min-h-screen">
    <!-- Overlay móvil -->
    <Transition name="overlay">
      <div
        v-if="menuOpen"
        class="fixed inset-0 z-20 lg:hidden"
        style="background:rgba(15,23,42,0.4);backdrop-filter:blur(4px)"
        @click="menuOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-30 flex w-60 flex-col transition-transform duration-300 lg:translate-x-0"
      :class="menuOpen ? 'translate-x-0' : '-translate-x-full'"
      style="background:#FFFFFF;border-right:1px solid #E2E8F0"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center gap-3 px-5" style="border-bottom:1px solid #E8EDF5">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#ECFDF5">
          <span class="material-symbols-outlined text-[18px]" style="color:#059669">account_balance</span>
        </div>
        <span class="text-base font-bold tracking-tight" style="color:#0A192F">moreMoney</span>
      </div>

      <!-- Navegación -->
      <nav class="flex flex-1 flex-col gap-0.5 px-3 py-4 overflow-y-auto">
        <span class="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest" style="color:#94A3B8">General</span>
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
            :class="isActive(item.to) ? 'nav-icon--active' : 'text-slate-400 group-hover:text-slate-600'"
          >{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Footer sidebar -->
      <div class="px-4 py-4" style="border-top:1px solid #E8EDF5">
        <p class="text-[11px]" style="color:#94A3B8">moreMoney © {{ currentYear }}</p>
      </div>
    </aside>

    <!-- Área de contenido -->
    <div class="flex min-w-0 flex-1 flex-col lg:pl-60">
      <!-- Top bar -->
      <header
        class="sticky top-0 z-20 flex h-16 items-center justify-between px-4 lg:px-6"
        style="background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);border-bottom:1px solid #E8EDF5"
      >
        <div class="flex items-center gap-2">
          <button
            class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 lg:hidden"
            style="color:#475569"
            @click="menuOpen = !menuOpen"
          >
            <span class="material-symbols-outlined text-[22px]">{{ menuOpen ? 'close' : 'menu' }}</span>
          </button>
          <span class="material-symbols-outlined hidden text-[18px] sm:block" style="color:#94A3B8">{{ currentNav?.icon }}</span>
          <span class="text-sm font-semibold" style="color:#0F172A">{{ currentNav?.label }}</span>
        </div>

        <div class="flex items-center gap-3">
          <span class="hidden text-xs tabular-nums md:block" style="color:#94A3B8">{{ todayLabel }}</span>
          <div class="flex items-center gap-2 pl-3" style="border-left:1px solid #E2E8F0">
            <span class="material-symbols-outlined hidden text-[18px] sm:block" style="color:#94A3B8">account_circle</span>
            <span class="hidden text-xs font-medium sm:block" style="color:#475569">{{ authStore.usuario?.usuario }}</span>
            <button
              class="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-all hover:bg-slate-100"
              style="color:#64748B;border:1px solid #E2E8F0"
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
  { to: '/',           icon: 'dashboard',             label: 'Dashboard' },
  { to: '/tarjetas',   icon: 'credit_card',            label: 'Tarjetas' },
  { to: '/compras',    icon: 'shopping_bag',           label: 'Compras' },
  { to: '/calendario', icon: 'calendar_month',         label: 'Calendario' },
  { to: '/cuentas',    icon: 'account_balance_wallet', label: 'Cuentas' },
  { to: '/ingresos',   icon: 'payments',               label: 'Ingresos' },
  { to: '/egresos',    icon: 'money_off',              label: 'Egresos' },
  { to: '/prestamos',  icon: 'handshake',              label: 'Préstamos' },
  { to: '/creditos',   icon: 'credit_score',           label: 'Créditos' },
]

function isActive(to) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

const currentNav  = computed(() => navItems.find((n) => isActive(n.to)))
const currentYear = new Date().getFullYear()

const todayLabel = computed(() =>
  new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)
</script>

<style scoped>
.nav-link--active {
  color: #0A192F;
  background: #E8EDF5;
  border: 1px solid #C6D2E5;
}
.nav-icon--active { color: #2D5991; }

.nav-link--idle {
  color: #64748B;
  border: 1px solid transparent;
}
.nav-link--idle:hover {
  color: #0A192F;
  background: #F8FAFC;
}

.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from,   .overlay-leave-to     { opacity: 0; }
</style>
