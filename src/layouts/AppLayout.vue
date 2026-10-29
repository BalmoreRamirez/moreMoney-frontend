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
      class="app-sidebar fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 lg:translate-x-0"
      :class="[
        menuOpen ? 'translate-x-0' : '-translate-x-full',
        sidebarCollapsed ? 'lg:w-14' : 'lg:w-60',
        'w-60'
      ]"
    >
      <!-- Logo + toggle desktop -->
      <div
        class="sidebar-brand flex h-[76px] flex-shrink-0 items-center transition-all duration-300"
        :class="sidebarCollapsed ? 'lg:justify-center lg:px-0' : 'gap-3 px-4'"
      >
        <div
          class="sidebar-logo-mark flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300"
          :class="sidebarCollapsed ? 'lg:hidden' : ''"
        >
          <span class="material-symbols-outlined text-[19px]">account_balance</span>
        </div>
        <div
          class="min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-all duration-300"
          :class="sidebarCollapsed ? 'lg:hidden' : ''"
        >
          <p class="text-[15px] font-bold tracking-tight" style="color:var(--sidebar-text)">moreMoney</p>
          <p class="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em]" style="color:var(--sidebar-text-muted)">Finanzas personales</p>
        </div>
        <button
          class="sidebar-collapse-btn hidden lg:flex flex-shrink-0"
          :title="sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'"
          :aria-label="sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'"
          @click="toggleSidebar"
        >
          <span class="material-symbols-outlined text-[20px]">
            {{ sidebarCollapsed ? 'chevron_right' : 'chevron_left' }}
          </span>
        </button>
      </div>

      <!-- Navegación -->
      <nav class="flex flex-1 flex-col gap-0.5 px-2 py-4 overflow-y-auto overflow-x-hidden">
        <template v-for="(group, gIdx) in navGroups" :key="group.label">
          <!-- Separador entre grupos -->
          <div
            v-if="gIdx > 0"
            class="sidebar-section-divider transition-all duration-300"
            :class="sidebarCollapsed ? 'my-2 mx-1' : 'my-3 mx-2'"
          />
          <!-- Etiqueta de grupo -->
          <span
            class="sidebar-section-label mb-1 overflow-hidden whitespace-nowrap px-2 text-[9px] font-bold uppercase tracking-[0.18em] transition-all duration-300"
            :class="sidebarCollapsed ? 'lg:opacity-0 lg:h-0 lg:mb-0' : 'lg:opacity-100'"
          >{{ group.label }}</span>
          <!-- Ítems del grupo -->
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="sidebar-nav-link group flex items-center rounded-xl py-1.5 text-sm font-medium transition-all duration-200"
            :class="[
              isActive(item.to) ? 'nav-link--active' : 'nav-link--idle',
              sidebarCollapsed ? 'lg:justify-center lg:px-0 lg:gap-0' : 'px-2.5 gap-2.5'
            ]"
            :title="sidebarCollapsed ? item.label : ''"
            @click="menuOpen = false"
          >
            <span class="nav-icon-shell flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] transition-all duration-200">
              <span
                class="material-symbols-outlined text-[19px] transition-colors duration-150"
                :class="isActive(item.to) ? 'nav-icon--active' : 'nav-icon--idle'"
              >{{ item.icon }}</span>
            </span>
            <span
              class="overflow-hidden whitespace-nowrap transition-all duration-300"
              :class="sidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'"
            >{{ item.label }}</span>
          </router-link>
        </template>
      </nav>

      <!-- Footer sidebar -->
      <div
        class="sidebar-footer overflow-hidden px-4 py-4 transition-all duration-300"
        :class="sidebarCollapsed ? 'lg:px-2' : ''"
      >
        <p
          class="whitespace-nowrap overflow-hidden text-[10px] font-medium transition-all duration-300"
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
        class="app-topbar sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 px-4 lg:px-7"
      >
        <div class="flex min-w-0 items-center gap-3">
          <button
            class="topbar-icon-btn lg:hidden"
            aria-label="Abrir menú de navegación"
            @click="menuOpen = !menuOpen"
          >
            <span class="material-symbols-outlined text-[21px]">{{ menuOpen ? 'close' : 'menu' }}</span>
          </button>

          <div class="topbar-page-icon hidden sm:flex">
            <span class="material-symbols-outlined text-[20px]">{{ currentNav?.icon }}</span>
          </div>

          <div class="min-w-0">
            <p class="hidden text-[10px] font-semibold uppercase tracking-[0.16em] sm:block" style="color:var(--color-text-muted)">
              MoreMoney · Finanzas personales
            </p>
            <h1 class="truncate text-sm font-bold sm:mt-0.5 sm:text-base" style="color:var(--color-text-primary)">
              {{ currentNav?.label }}
            </h1>
          </div>
        </div>

        <div class="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <div class="topbar-date hidden md:flex">
            <span class="material-symbols-outlined text-[17px]">calendar_today</span>
            <span class="capitalize">{{ todayLabel }}</span>
          </div>

          <button
            class="topbar-icon-btn"
            :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            @click="toggle"
          >
            <span class="material-symbols-outlined text-[18px]">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <div class="topbar-user">
            <div class="topbar-avatar">
              <span class="material-symbols-outlined text-[16px]">person</span>
            </div>
            <span class="hidden max-w-32 truncate text-xs font-semibold sm:block" style="color:var(--color-text-secondary)">
              {{ authStore.usuario?.usuario }}
            </span>
            <button
              class="topbar-logout"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              @click="showLogoutConfirm = true"
            >
              <span class="material-symbols-outlined text-[17px]">logout</span>
              <span class="hidden lg:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Contenido de la ruta activa -->
      <main class="app-content flex-1 p-4 lg:p-7">
        <router-view />
      </main>
    </div>
  </div>

  <ToastContainer />

  <!-- Inactivity warning banner -->
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="inactivityWarning"
        class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl px-5 py-3 shadow-card"
        style="background:var(--color-alert-bg);border:1px solid var(--color-alert-border);min-width:280px"
      >
        <span class="material-symbols-outlined text-[20px]" style="color:var(--color-alert)">timer</span>
        <p class="flex-1 text-sm font-medium" style="color:var(--color-alert)">
          Tu sesión cerrará en 1 minuto por inactividad
        </p>
        <button
          class="rounded-lg px-3 py-1 text-xs font-semibold"
          style="background:var(--color-alert);color:#fff"
          @click="keepSession"
        >
          Mantener
        </button>
      </div>
    </Transition>
  </Teleport>

  <!-- Confirm logout -->
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="showLogoutConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="showLogoutConfirm = false" @keydown.esc="showLogoutConfirm = false">
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.5);backdrop-filter:blur(6px)" />
        <div class="relative w-full max-w-xs rounded-2xl p-6 shadow-card" style="background:var(--color-surface);border:1px solid var(--color-border)">
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style="background:var(--color-danger-bg)">
              <span class="material-symbols-outlined text-[22px]" style="color:var(--color-danger)">logout</span>
            </div>
            <div>
              <h3 class="font-semibold" style="color:var(--color-text-primary)">¿Cerrar sesión?</h3>
              <p class="mt-1 text-sm" style="color:var(--color-text-secondary)">Se cerrará tu sesión actual.</p>
            </div>
          </div>
          <div class="mt-5 flex gap-3">
            <button class="btn-ghost flex-1" @click="showLogoutConfirm = false">Cancelar</button>
            <button
              class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
              style="background:var(--color-danger)"
              @click="handleLogout"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTheme } from '../composables/useTheme'
import { useInactivityTimeout } from '../composables/useInactivityTimeout'
import { useToast } from '../composables/useToast'
import ToastContainer from '../components/ToastContainer.vue'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()
const menuOpen  = ref(false)
const { isDark, toggle } = useTheme()

const sidebarCollapsed    = ref(localStorage.getItem('sidebar-collapsed') === 'true')
const showLogoutConfirm   = ref(false)
const toast               = useToast()

const { isWarning: inactivityWarning } = useInactivityTimeout({
  onWarning: () => { /* banner ya reactivo via isWarning */ },
  onTimeout: () => {
    authStore.logout()
    router.push('/login')
    toast.warning('Sesión cerrada por inactividad')
  },
})

function keepSession() {
  // cualquier interacción ya reinicia los timers; solo ocultamos el banner
  inactivityWarning.value = false
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebar-collapsed', sidebarCollapsed.value)
}

function handleLogout() {
  showLogoutConfirm.value = false
  authStore.logout()
  router.push('/login')
}

const navGroups = [
  {
    label: 'General',
    items: [
      { to: '/', icon: 'dashboard', label: 'Dashboard' },
    ],
  },
  {
    label: 'Tarjetas',
    items: [
      { to: '/tarjetas',   icon: 'credit_card',    label: 'Tarjetas' },
      { to: '/compras',    icon: 'shopping_bag',   label: 'Compras' },
      { to: '/calendario', icon: 'calendar_month', label: 'Calendario' },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { to: '/cuentas',   icon: 'account_balance_wallet', label: 'Cuentas' },
      { to: '/ingresos',  icon: 'payments',               label: 'Ingresos' },
      { to: '/egresos',   icon: 'money_off',              label: 'Egresos' },
      { to: '/prestamos', icon: 'handshake',              label: 'Préstamos' },
      { to: '/creditos',  icon: 'credit_score',           label: 'Créditos' },
    ],
  },
]

const allNavItems = navGroups.flatMap(g => g.items)

function isActive(to) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

const currentNav  = computed(() => allNavItems.find((n) => isActive(n.to)))
const currentYear = new Date().getFullYear()

const todayLabel = computed(() =>
  new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)
</script>

<style scoped>
/* Barra superior */
.app-topbar {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-soft);
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.045);
}
.topbar-page-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(3, 36, 107, 0.08);
  border-radius: 13px;
  background: var(--color-brand-light);
  color: var(--color-brand);
}
.topbar-icon-btn {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.18s, color 0.18s, border-color 0.18s, transform 0.18s;
}
.topbar-icon-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(3, 36, 107, 0.2);
  background: var(--color-brand-light);
  color: var(--color-brand);
}
.topbar-date {
  height: 40px;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface-mid);
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.topbar-date .material-symbols-outlined { color: var(--color-brand); }
.topbar-user {
  display: flex;
  height: 48px;
  align-items: center;
  gap: 9px;
  padding: 0 6px 0 8px;
  border: 1px solid var(--color-border);
  border-radius: 15px;
  background: var(--color-surface-mid);
}
.topbar-avatar {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(3, 36, 107, 0.08);
  border-radius: 11px;
  background: var(--color-brand-light);
  color: var(--color-brand);
}
.topbar-logout {
  display: inline-flex;
  height: 34px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 9px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: background 0.18s, color 0.18s, border-color 0.18s;
}
.topbar-logout:hover {
  border-color: var(--color-danger);
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.app-sidebar {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(ellipse at 12% 0%, rgba(77, 123, 211, 0.2), transparent 38%),
    var(--sidebar-bg);
  box-shadow: 12px 0 32px rgba(3, 16, 42, 0.16);
}
.sidebar-brand {
  border-bottom: 1px solid var(--sidebar-border);
}
.sidebar-logo-mark {
  border: 1px solid rgba(248, 189, 38, 0.28);
  background: var(--sidebar-logo-icon-bg);
  color: var(--sidebar-logo-icon-color);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}
.sidebar-section-divider {
  height: 1px;
  flex-shrink: 0;
  background: var(--sidebar-border);
}
.sidebar-section-label {
  color: var(--sidebar-text-muted);
}
.sidebar-footer {
  border-top: 1px solid var(--sidebar-border);
}
.sidebar-nav-link {
  position: relative;
  min-height: 44px;
  border: 1px solid transparent;
  color: var(--sidebar-text);
  text-decoration: none;
}
.nav-link--active {
  border-color: var(--sidebar-active-border);
  background: linear-gradient(100deg, var(--sidebar-active-bg), rgba(248, 189, 38, 0.04));
  font-weight: 700;
}
.nav-link--active::before {
  position: absolute;
  top: 9px;
  bottom: 9px;
  left: -1px;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: var(--sidebar-active-icon);
  content: '';
}
.nav-link--active .nav-icon-shell {
  background: rgba(248, 189, 38, 0.13);
}
.nav-icon--active { color: var(--sidebar-active-icon); }

.nav-link--idle {
  opacity: 0.75;
}
.nav-link--idle:hover {
  transform: translateX(2px);
  border-color: var(--sidebar-border);
  background: var(--sidebar-hover-bg);
  opacity: 1;
}
.nav-icon--idle { color: var(--sidebar-text); }
.nav-link--idle:hover .nav-icon-shell { background: rgba(255, 255, 255, 0.07); }
.sidebar-nav-link:focus-visible,
.sidebar-collapse-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from,   .overlay-leave-to     { opacity: 0; }

/* Botón colapsar sidebar */
.sidebar-collapse-btn {
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
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
