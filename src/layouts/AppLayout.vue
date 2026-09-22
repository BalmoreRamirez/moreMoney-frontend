<template>
  <div class="flex min-h-screen" style="background:var(--color-primary)">
    <!-- Overlay móvil -->
    <Transition name="overlay">
      <div
        v-if="menuOpen"
        class="fixed inset-0 z-20 lg:hidden"
        style="background:rgba(3,36,107,0.45);backdrop-filter:blur(4px)"
        @click="menuOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 lg:translate-x-0"
      :class="[
        menuOpen ? 'translate-x-0' : '-translate-x-full',
        sidebarCollapsed ? 'lg:w-14' : 'lg:w-60',
        'w-60'
      ]"
      style="background:var(--sidebar-bg)"
    >
      <!-- Logo + toggle desktop -->
      <div
        class="flex h-16 items-center flex-shrink-0 transition-all duration-300"
        :class="sidebarCollapsed ? 'lg:justify-center lg:px-0' : 'gap-3 px-4'"
        style="border-bottom:1px solid var(--sidebar-border)"
      >
        <!-- Logo icon: oculto en desktop colapsado -->
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 transition-all duration-300"
          :class="sidebarCollapsed ? 'lg:hidden' : ''"
          style="background:var(--sidebar-logo-icon-bg)"
        >
          <span class="material-symbols-outlined text-[18px]" style="color:var(--sidebar-logo-icon-color)">account_balance</span>
        </div>
        <!-- Texto: oculto en desktop colapsado -->
        <span
          class="text-base font-bold tracking-tight overflow-hidden whitespace-nowrap transition-all duration-300 flex-1"
          :class="sidebarCollapsed ? 'lg:hidden' : ''"
          style="color:var(--sidebar-text)"
        >moreMoney</span>
        <!-- Botón toggle — solo desktop -->
        <button
          class="sidebar-collapse-btn hidden lg:flex flex-shrink-0"
          :title="sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'"
          @click="toggleSidebar"
        >
          <span class="material-symbols-outlined text-[20px]">
            {{ sidebarCollapsed ? 'chevron_right' : 'chevron_left' }}
          </span>
        </button>
      </div>

      <!-- Navegación -->
      <nav class="flex flex-1 flex-col gap-0.5 px-2 py-4 overflow-y-auto overflow-x-hidden">
        <span
          class="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest overflow-hidden whitespace-nowrap transition-all duration-300"
          :class="sidebarCollapsed ? 'lg:opacity-0 lg:h-0 lg:mb-0' : 'lg:opacity-100'"
          style="color:var(--sidebar-text-muted)"
        >General</span>
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link group flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-150"
          :class="[
            isActive(item.to) ? 'nav-link--active' : 'nav-link--idle',
            sidebarCollapsed ? 'lg:justify-center lg:px-0 lg:gap-0' : 'px-3 gap-3'
          ]"
          :title="sidebarCollapsed ? item.label : ''"
          @click="menuOpen = false"
        >
          <span
            class="material-symbols-outlined text-[20px] flex-shrink-0 transition-colors duration-150"
            :class="isActive(item.to) ? 'nav-icon--active' : 'nav-icon--idle'"
          >{{ item.icon }}</span>
          <span
            class="overflow-hidden whitespace-nowrap transition-all duration-300"
            :class="sidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'"
          >{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Footer sidebar -->
      <div
        class="px-4 py-4 overflow-hidden transition-all duration-300"
        :class="sidebarCollapsed ? 'lg:px-2' : ''"
        style="border-top:1px solid var(--sidebar-border)"
      >
        <p
          class="text-[11px] whitespace-nowrap overflow-hidden transition-all duration-300"
          :class="sidebarCollapsed ? 'lg:opacity-0' : 'lg:opacity-100'"
          style="color:var(--sidebar-text-muted)"
        >moreMoney © {{ currentYear }}</p>
      </div>
    </aside>

    <!-- Área de contenido -->
    <div
      class="flex min-w-0 flex-1 flex-col transition-all duration-300"
      :class="sidebarCollapsed ? 'lg:pl-14' : 'lg:pl-60'"
    >
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
          <span class="material-symbols-outlined hidden text-[18px] sm:block" style="color:var(--color-brand)">{{ currentNav?.icon }}</span>
          <span class="text-sm font-bold" style="color:var(--color-text-primary)">{{ currentNav?.label }}</span>
        </div>

        <div class="flex items-center gap-3">
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
            <div
              class="hidden h-7 w-7 items-center justify-center rounded-full sm:flex"
              style="background:var(--color-brand-light)"
            >
              <span class="material-symbols-outlined text-[15px]" style="color:var(--color-brand)">person</span>
            </div>
            <span class="hidden text-xs font-semibold sm:block" style="color:var(--color-text-secondary)">{{ authStore.usuario?.usuario }}</span>
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
      <main class="flex-1 p-4 lg:p-6" style="background:var(--page-header-gradient)">
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

const sidebarCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebar-collapsed', sidebarCollapsed.value)
}

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
/* Header */
:root         { --header-bg: rgba(255,255,255,0.92); }
[data-theme="dark"] { --header-bg: rgba(22,27,34,0.92); }

/* Nav links — sobre fondo navy oscuro */
.nav-link--active {
  color: var(--sidebar-text);
  background: var(--sidebar-active-bg);
  border: 1px solid var(--sidebar-active-border);
  font-weight: 700;
}
.nav-icon--active { color: var(--sidebar-active-icon); }

.nav-link--idle {
  color: var(--sidebar-text);
  border: 1px solid transparent;
  opacity: 0.75;
}
.nav-link--idle:hover {
  background: var(--sidebar-hover-bg);
  opacity: 1;
}
.nav-icon--idle { color: var(--sidebar-text); }
.nav-link--idle:hover .nav-icon--idle { color: var(--sidebar-text); }

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
  background: var(--color-brand-light);
  color: var(--color-brand);
  border-color: rgba(3,36,107,0.2);
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
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from,   .overlay-leave-to     { opacity: 0; }

/* Botón colapsar sidebar */
.sidebar-collapse-btn {
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--sidebar-border);
  color: var(--sidebar-text);
  background: transparent;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s, background 0.15s;
  flex-shrink: 0;
}
.sidebar-collapse-btn:hover {
  opacity: 1;
  background: var(--sidebar-hover-bg);
}
</style>
