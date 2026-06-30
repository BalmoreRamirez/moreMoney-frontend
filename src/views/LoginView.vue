<template>
  <div
    class="flex min-h-screen items-center justify-center"
    style="background: linear-gradient(135deg, #F0F4FA 0%, #E8EDF5 100%)"
  >
    <div
      class="w-full max-w-sm rounded-2xl p-8"
      style="background: #FFFFFF; border: 1px solid #E2E8F0; backdrop-filter: blur(12px)"
    >
      <!-- Logo -->
      <div class="mb-8 flex flex-col items-center gap-3">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl"
          style="background: rgba(16,185,129,0.15)"
        >
          <span class="material-symbols-outlined text-[28px]" style="color: #10B981">account_balance</span>
        </div>
        <h1 class="text-xl font-bold tracking-tight text-slate-900">moreMoney</h1>
        <p class="text-xs" style="color: #94A3B8">Control financiero inteligente</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <!-- Usuario -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium" style="color: #64748B">Usuario</label>
          <div class="relative">
            <span
              class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
              style="color: #94A3B8"
            >person</span>
            <input
              v-model="form.usuario"
              type="text"
              autocomplete="username"
              placeholder="Tu usuario"
              class="w-full rounded-lg py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition-all"
              style="background: rgba(10,25,47,0.03); border: 1px solid #E2E8F0"
              :style="inputFocusStyle"
              @focus="focusedField = 'usuario'"
              @blur="focusedField = null"
            />
          </div>
        </div>

        <!-- Contraseña -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium" style="color: #64748B">Contraseña</label>
          <div class="relative">
            <span
              class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
              style="color: #94A3B8"
            >lock</span>
            <input
              v-model="form.contrasena"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Tu contraseña"
              class="w-full rounded-lg py-2.5 pl-9 pr-10 text-sm text-slate-900 outline-none transition-all"
              style="background: rgba(10,25,47,0.03); border: 1px solid #E2E8F0"
              :style="inputFocusStyle"
              @focus="focusedField = 'contrasena'"
              @blur="focusedField = null"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2"
              @click="showPassword = !showPassword"
            >
              <span class="material-symbols-outlined text-[18px]" style="color: #94A3B8">
                {{ showPassword ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Error -->
        <p v-if="errorMsg" class="rounded-lg px-3 py-2 text-xs" style="background: rgba(220,38,38,0.08); color: #F87171; border: 1px solid rgba(220,38,38,0.2)">
          {{ errorMsg }}
        </p>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="mt-2 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all"
          style="background: #10B981"
          :style="loading ? 'opacity: 0.7; cursor: not-allowed' : 'opacity: 1; cursor: pointer'"
        >
          <span v-if="loading" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          <span>{{ loading ? 'Ingresando...' : 'Ingresar' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ usuario: '', contrasena: '' })
const errorMsg = ref('')
const loading = ref(false)
const showPassword = ref(false)
const focusedField = ref(null)

const inputFocusStyle = computed(() =>
  focusedField.value ? 'border-color: rgba(16,185,129,0.5) !important; box-shadow: 0 0 0 2px rgba(16,185,129,0.1)' : ''
)

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
