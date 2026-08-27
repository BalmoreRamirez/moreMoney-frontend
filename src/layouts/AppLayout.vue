<template>
  <div class="flex min-h-screen" style="background:var(--color-primary)">
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
      style="background:var(--color-surface);border-right:1px solid var(--color-border)"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center gap-3 px-5" style="border-bottom:1px solid var(--color-border-soft)">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:var(--color-success-bg)">
          <span class="material-symbols-outlined text-[18px]" style="color:var(--color-success)">account_balance</span>
        </div>
        <span class="text-base font-bold tracking-tight" style="color:var(--color-text-primary)">moreMoney</span>
      </div>

      <!-- Navegación -->
      <nav class="flex flex-1 flex-col gap-0.5 px-3 py-4 overflow-y-auto">
        <span class="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest" style="color:var(--color-text-muted)">General</span>
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
            :class="isActive(item.to) ? 'nav-icon--active' : 'nav-icon--idle'"
          >{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Footer sidebar -->
      <div class="px-4 py-4" style="border-top:1px solid var(--color-border-soft)">
        <p class="text-[11px]" style="color:var(--color-text-muted)">moreMoney © {{ currentYear }}</p>
      </div>
    </aside>

    <!-- Área de contenido -->
    <div class="flex min-w-0 flex-1 flex-col lg:pl-60">
      <!-- Top bar -->
      <header
        class="sticky top-0 z-20 flex h-16 items-center justify-between px-4 lg:px-6"
        style="background:var(--header-bg);backdrop-filter:blur(12px);border-bottom:1px solid var(--color-border-soft)"
      >
        <div class="flex items-center gap-2">
          <button
            class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors lg:hidden"
            style="color:var(--color-text-secondary);background:transparent"
            @mouseenter="e => e.currentTarget.style.background = 'var(--color-surface-high)'"
            @mouseleave="e => e.currentTarget.style.background = 'transparent'"
            @click="menuOpen = !menuOpen"
          >
            <span class="material-symbols-outlined text-[22px]">{{ menuOpen ? 'close' : 'menu' }}</span>
          </button>
          <span class="material-symbols-outlined hidden text-[18px] sm:block" style="color:var(--color-text-muted)">{{ currentNav?.icon }}</span>
          <span class="text-sm font-semibold" style="color:var(--color-text-primary)">{{ currentNav?.label }}</span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Fecha (solo md+) + toggle siempre visible -->
          <div class="flex items-center gap-2">
            <span class="hidden text-xs tabular-nums md:block" style="color:var(--color-text-muted)">{{ todayLabel }}</span>
            <button
              class="theme-toggle"
              :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
              @click="toggle"
            >
              <span class="material-symbols-outlined text-[17px]">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
            </button>
          </div>

          <div class="flex items-center gap-2 pl-3" style="border-left:1px solid var(--color-border)">
            <span class="material-symbols-outlined hidden text-[18px] sm:block" style="color:var(--color-text-muted)">account_circle</span>
            <span class="hidden text-xs font-medium sm:block" style="color:var(--color-text-secondary)">{{ authStore.usuario?.usuario }}</span>
            <button
              class="logout-btn flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-all"
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
import { useTheme } from '../composables/useTheme'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()
const menuOpen  = ref(false)
const { isDark, toggle } = useTheme()

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
/* Header bg con transparencia adaptado al tema */
:root { --header-bg: rgba(255,255,255,0.9); }
[data-theme="dark"] { --header-bg: rgba(22,27,34,0.9); }

.nav-link--active {
  color: var(--color-text-primary);
  background: var(--color-primary-soft);
  border: 1px solid var(--color-border);
}
.nav-icon--active { color: #2D5991; }
[data-theme="dark"] .nav-icon--active { color: #60A5FA; }

.nav-link--idle {
  color: var(--color-text-secondary);
  border: 1px solid transparent;
}
.nav-link--idle:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-mid);
}
.nav-icon--idle { color: var(--color-text-muted); }
.nav-link--idle:hover .nav-icon--idle { color: var(--color-text-secondary); }

/* Botón toggle de tema */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  background: var(--color-surface-mid);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  flex-shrink: 0;
}
.theme-toggle:hover {
  background: var(--color-surface-high);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

/* Botón logout */
.logout-btn {
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
}
.logout-btn:hover {
  background: var(--color-surface-high);
}

.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from,   .overlay-leave-to     { opacity: 0; }
</style>
