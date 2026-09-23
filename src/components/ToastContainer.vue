<template>
  <Teleport to="body">
    <div class="toast-wrap" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast--${t.type}`"
          role="alert"
        >
          <span class="material-symbols-outlined toast-icon">{{ icons[t.type] }}</span>
          <p class="toast-msg">{{ t.message }}</p>
          <button class="toast-close" :aria-label="'Cerrar notificación'" @click="remove(t.id)">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { toasts, remove } = useToast()

const icons = {
  success: 'check_circle',
  error:   'error',
  info:    'info',
  warning: 'warning',
}
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 280px;
  max-width: 380px;
  padding: 14px 14px 14px 16px;
  border-radius: 14px;
  border-left: 4px solid;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
  pointer-events: all;
  backdrop-filter: blur(12px);
}

/* Success */
.toast--success {
  background: var(--toast-success-bg, rgba(240,253,244,0.97));
  border-color: #10B981;
  color: #065f46;
}
.toast--success .toast-icon { color: #10B981; }

/* Error */
.toast--error {
  background: var(--toast-error-bg, rgba(254,242,242,0.97));
  border-color: #DC2626;
  color: #7f1d1d;
}
.toast--error .toast-icon { color: #DC2626; }

/* Warning */
.toast--warning {
  background: var(--toast-warning-bg, rgba(255,251,235,0.97));
  border-color: #F59E0B;
  color: #78350f;
}
.toast--warning .toast-icon { color: #F59E0B; }

/* Info */
.toast--info {
  background: var(--toast-info-bg, rgba(239,246,255,0.97));
  border-color: #3B82F6;
  color: #1e3a8a;
}
.toast--info .toast-icon { color: #3B82F6; }

/* Dark mode */
[data-theme="dark"] .toast--success {
  background: rgba(6,78,59,0.92);
  color: #a7f3d0;
}
[data-theme="dark"] .toast--error {
  background: rgba(127,29,29,0.92);
  color: #fecaca;
}
[data-theme="dark"] .toast--warning {
  background: rgba(120,53,15,0.92);
  color: #fde68a;
}
[data-theme="dark"] .toast--info {
  background: rgba(30,58,138,0.92);
  color: #bfdbfe;
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}

.toast-msg {
  flex: 1;
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.45;
  font-family: 'Inter', sans-serif;
}

.toast-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s;
  color: inherit;
  margin-top: 1px;
}
.toast-close:hover { opacity: 1; }

/* Animación entrada/salida */
.toast-enter-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.toast-leave-active { transition: all 0.25s ease; }

.toast-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.95);
}
.toast-move { transition: transform 0.25s ease; }

@media (max-width: 480px) {
  .toast-wrap {
    top: 16px;
    right: 12px;
    left: 12px;
  }
  .toast {
    min-width: unset;
    max-width: 100%;
  }
}
</style>
