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
  background: var(--color-success-bg);
  border-color: var(--color-success);
  color: var(--color-success-text);
}
.toast--success .toast-icon { color: var(--color-success); }

/* Error */
.toast--error {
  background: var(--color-danger-bg);
  border-color: var(--color-danger);
  color: var(--color-danger-text);
}
.toast--error .toast-icon { color: var(--color-danger); }

/* Warning */
.toast--warning {
  background: var(--color-alert-bg);
  border-color: var(--color-alert);
  color: var(--color-alert-text);
}
.toast--warning .toast-icon { color: var(--color-alert); }

/* Info */
.toast--info {
  background: var(--color-info-bg);
  border-color: var(--color-info);
  color: var(--color-info-text);
}
.toast--info .toast-icon { color: var(--color-info); }

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
  font-family: var(--font-sans);
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
