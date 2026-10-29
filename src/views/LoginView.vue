<template>
  <div class="login-root">

    <!-- ── Panel izquierdo (branding) ──────────────────────── -->
    <div class="left-panel">
      <!-- Círculos decorativos de fondo -->
      <div class="deco-circle deco-circle--1" />
      <div class="deco-circle deco-circle--2" />
      <div class="deco-circle deco-circle--3" />

      <!-- Iconos flotantes decorativos -->
      <span class="float-icon" style="top:12%;left:8%;font-size:42px;opacity:.07">account_balance</span>
      <span class="float-icon" style="top:22%;right:10%;font-size:28px;opacity:.06">credit_card</span>
      <span class="float-icon" style="bottom:28%;left:12%;font-size:36px;opacity:.06">trending_up</span>
      <span class="float-icon" style="bottom:15%;right:8%;font-size:30px;opacity:.07">savings</span>
      <span class="float-icon" style="top:48%;left:6%;font-size:22px;opacity:.05">payments</span>
      <span class="float-icon" style="top:38%;right:6%;font-size:22px;opacity:.05">bar_chart</span>

      <!-- Contenido central del branding -->
      <div class="left-content">
        <!-- Logo -->
        <div class="logo-wrap">
          <div class="logo-icon">
            <span class="material-symbols-outlined" style="font-size:28px;color:var(--color-accent)">account_balance</span>
          </div>
          <span class="logo-text">moreMoney</span>
        </div>

        <h2 class="brand-headline">Tu dinero,<br>bajo control.</h2>
        <p class="brand-sub">Gestiona tarjetas, préstamos, inversiones<br>y cuentas desde un solo lugar.</p>

        <!-- Features -->
        <div class="features">
          <div v-for="f in features" :key="f.text" class="feature-item">
            <span class="material-symbols-outlined feature-icon">{{ f.icon }}</span>
            <span class="feature-text">{{ f.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Panel derecho (formulario) ─────────────────────── -->
    <div class="right-panel">
      <div class="form-box fintech-card px-6 py-8 sm:px-8 sm:py-9">
        <div class="mobile-brand" aria-label="moreMoney">
          <div class="mobile-brand-icon">
            <span class="material-symbols-outlined" aria-hidden="true">account_balance</span>
          </div>
          <span class="mobile-brand-name">moreMoney</span>
        </div>

        <!-- Cabecera del form -->
        <div class="form-header">
          <h1 class="form-title">Bienvenido</h1>
          <p class="form-subtitle">Ingresa tus credenciales para continuar</p>
        </div>

        <!-- Form -->
        <form class="login-form" aria-label="Iniciar sesión" novalidate @submit.prevent="handleLogin">

          <!-- Usuario -->
          <div class="field">
            <label class="field-label" for="login-usuario">Usuario</label>
            <div class="input-wrap" :class="{ focused: focusedField === 'usuario' }">
              <span class="material-symbols-outlined input-icon">person</span>
              <input
                v-model="form.usuario"
                id="login-usuario"
                type="text"
                autocomplete="username"
                placeholder="Tu nombre de usuario"
                class="login-input"
                required
                @focus="focusedField = 'usuario'"
                @blur="focusedField = null"
              />
            </div>
          </div>

          <!-- Contraseña -->
          <div class="field">
            <label class="field-label" for="login-contrasena">Contraseña</label>
            <div class="input-wrap" :class="{ focused: focusedField === 'contrasena' }">
              <span class="material-symbols-outlined input-icon">lock</span>
              <input
                v-model="form.contrasena"
                id="login-contrasena"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Tu contraseña"
                class="login-input"
                required
                @focus="focusedField = 'contrasena'"
                @blur="focusedField = null"
              />
              <button
                type="button"
                class="toggle-pw"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <span class="material-symbols-outlined" style="font-size:18px">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="error-msg" role="alert" aria-live="polite">
            <span class="material-symbols-outlined" style="font-size:16px">error</span>
            {{ errorMsg }}
          </div>

          <!-- Submit -->
          <button type="submit" :disabled="loading" class="submit-btn">
            <span v-if="loading" class="material-symbols-outlined animate-spin" style="font-size:18px">progress_activity</span>
            <span>{{ loading ? 'Ingresando…' : 'Ingresar' }}</span>
          </button>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router    = useRouter()
const authStore = useAuthStore()

const form          = ref({ usuario: '', contrasena: '' })
const errorMsg      = ref('')
const loading       = ref(false)
const showPassword  = ref(false)
const focusedField  = ref(null)

const features = [
  { icon: 'credit_card',   text: 'Control de tarjetas y cortes' },
  { icon: 'handshake',     text: 'Gestión de préstamos e intereses' },
  { icon: 'trending_up',   text: 'Inversiones y seguimiento de ganancias' },
  { icon: 'account_balance_wallet', text: 'Cuentas y flujo de efectivo' },
]

async function handleLogin() {
  errorMsg.value = ''
  if (!form.value.usuario || !form.value.contrasena) {
    errorMsg.value = 'Completa todos los campos.'
    return
  }
  loading.value = true
  try {
    await authStore.login(form.value)
    router.push('/')
  } catch {
    errorMsg.value = 'Credenciales inválidas. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Layout ────────────────────────────────────────────── */
.login-root {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--color-brand);
}

/* ── Panel izquierdo ─────────────────────────────────── */
.left-panel {
  position: relative;
  display: none;
  flex: 1;
  overflow: hidden;
  background: linear-gradient(145deg, var(--color-brand) 0%, var(--color-brand-hover) 55%, var(--sidebar-bg) 100%);
}
@media (min-width: 900px) { .left-panel { display: flex; align-items: center; justify-content: center; } }

.deco-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.deco-circle--1 {
  width: 420px; height: 420px;
  top: -100px; right: -80px;
  background: color-mix(in srgb, var(--color-accent) 7%, transparent);
}
.deco-circle--2 {
  width: 280px; height: 280px;
  bottom: -60px; left: -60px;
  background: rgba(255,255,255,0.04);
}
.deco-circle--3 {
  width: 180px; height: 180px;
  top: 42%; left: 55%;
  background: color-mix(in srgb, var(--color-accent) 4%, transparent);
}

.float-icon {
  font-family: 'Material Symbols Outlined';
  position: absolute;
  pointer-events: none;
  color: white;
}

/* ── Contenido branding ─────────────────────────────── */
.left-content {
  position: relative;
  z-index: 2;
  padding: 48px;
  max-width: 420px;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 48px;
}
.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px; height: 44px;
  border-radius: 12px;
  background: var(--sidebar-logo-icon-bg);
  border: 1px solid var(--sidebar-active-border);
}
.logo-text {
  font-size: 20px;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: -0.02em;
}

.brand-headline {
  font-size: 40px;
  font-weight: 800;
  line-height: 1.15;
  color: #FFFFFF;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
}
.brand-sub {
  font-size: 14px;
  line-height: 1.65;
  color: rgba(255,255,255,0.45);
  margin-bottom: 40px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.feature-icon {
  font-size: 18px;
  color: var(--color-accent);
  flex-shrink: 0;
}
.feature-text {
  font-size: 13px;
  color: rgba(255,255,255,0.60);
}

/* ── Panel derecho ──────────────────────────────────── */
.right-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 24px 16px;
  background: var(--color-primary);
}
@media (min-width: 900px) {
  .right-panel {
    width: 440px;
    flex-shrink: 0;
    padding: 48px 40px;
  }
}

.form-box {
  width: 100%;
  max-width: 400px;
}

.mobile-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto 30px;
}
.mobile-brand-icon {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--color-brand-light);
  color: var(--color-brand);
}
.mobile-brand-icon .material-symbols-outlined { font-size: 22px; }
.mobile-brand-name {
  color: var(--color-brand);
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.035em;
}

.form-header {
  margin-bottom: 32px;
}
.form-title {
  font-size: clamp(25px, 5vw, 29px);
  font-weight: 800;
  color: var(--color-brand);
  letter-spacing: -0.03em;
  margin-bottom: 6px;
}
.form-subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* ── Campos ─────────────────────────────────────────── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 0;
  min-height: 50px;
  border-radius: 13px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  transition: border-color 0.15s, box-shadow 0.15s;
  overflow: hidden;
}
.input-wrap.focused {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px var(--color-brand-focus);
}
.input-wrap:focus-within .input-icon { color: var(--color-brand); }

.input-icon {
  font-size: 18px;
  color: var(--color-text-muted);
  padding: 0 0 0 14px;
  flex-shrink: 0;
}

.login-input {
  flex: 1;
  padding: 13px 14px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  outline: none;
}
.login-input::placeholder { color: var(--color-text-muted); }

.toggle-pw {
  padding: 0 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
}
.toggle-pw:hover { color: var(--color-text-secondary); }
.toggle-pw:focus-visible {
  border-radius: 8px;
  outline: 2px solid var(--color-brand);
  outline-offset: -3px;
}

/* ── Error ──────────────────────────────────────────── */
.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  color: var(--color-danger);
  background: var(--color-danger-bg);
  border: 1px solid var(--color-danger-border);
}

/* ── Botón submit ───────────────────────────────────── */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 50px;
  padding: 13px 16px;
  border-radius: 13px;
  border: none;
  background: var(--color-brand);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--color-brand) 20%, transparent);
  transition: background 0.15s, opacity 0.15s, transform 0.15s, box-shadow 0.15s;
  margin-top: 4px;
}
.submit-btn:hover:not(:disabled) {
  background: var(--color-brand-hover);
  box-shadow: 0 10px 22px color-mix(in srgb, var(--color-brand) 26%, transparent);
  transform: translateY(-1px);
}
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Link registro ──────────────────────────────────── */
.register-link {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.register-link-a {
  color: var(--color-brand);
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}
.register-link-a:hover { text-decoration: underline; }

@media (min-width: 900px) {
  .mobile-brand { display: none; }
  .form-header { text-align: left; }
}

@media (max-width: 899px) {
  .form-header { text-align: center; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
}
</style>
