<template>
  <button
    type="button"
    class="income-action-icon"
    :class="`income-action-icon--${variant}`"
    :title="label"
    :aria-label="label"
    @click="$emit('click', $event)"
  >
    <span class="material-symbols-outlined">{{ icon }}</span>
  </button>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  variant: { type: String, default: 'neutral', validator: value => ['neutral', 'success', 'warning', 'danger'].includes(value) },
})

defineEmits(['click'])
</script>

<style scoped>
.income-action-icon {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  flex: 0 0 2rem;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 0.625rem;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease, transform 140ms ease;
}

.income-action-icon .material-symbols-outlined { font-size: 16px; }
.income-action-icon:hover { transform: translateY(-1px); }
.income-action-icon:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }
.income-action-icon--neutral { background: var(--color-surface-mid); color: var(--color-text-secondary); }
.income-action-icon--neutral:hover { border-color: var(--color-border); background: var(--color-surface-high); color: var(--color-text-primary); }
.income-action-icon--success { background: var(--color-success-bg); color: var(--color-success); }
.income-action-icon--success:hover { border-color: var(--color-success); }
.income-action-icon--warning { background: var(--color-alert-bg); color: var(--color-alert); }
.income-action-icon--warning:hover { border-color: var(--color-alert); }
.income-action-icon--danger { background: var(--color-danger-bg); color: var(--color-danger); }
.income-action-icon--danger:hover { border-color: var(--color-danger); }
</style>
