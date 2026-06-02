<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0"
        style="background:rgba(7,17,31,0.8);backdrop-filter:blur(6px)"
        @click="$emit('cancel')"
      />
      <div
        class="relative w-full max-w-sm rounded-2xl p-6 shadow-card"
        style="background:#0D2240;border:1px solid rgba(255,255,255,0.1)"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style="background:var(--color-danger-bg)"
          >
            <span class="material-symbols-outlined text-danger">warning</span>
          </div>
          <div>
            <h3 class="font-semibold text-white">Eliminar registro</h3>
            <p class="mt-1 text-sm text-slate-400">
              ¿Eliminar <strong class="text-white">{{ nombre }}</strong>? Esta acción no se puede deshacer.
            </p>
            <p v-if="error" class="mt-2 text-xs text-danger">{{ error }}</p>
          </div>
        </div>
        <div class="mt-5 flex gap-3">
          <button
            class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5"
            @click="$emit('cancel')"
          >
            Cancelar
          </button>
          <button
            class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style="background:#DC2626"
            :disabled="deleting"
            @click="$emit('confirm')"
          >
            {{ deleting ? 'Eliminando…' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  nombre:   { type: String, default: '' },
  error:    { type: String, default: '' },
  deleting: { type: Boolean, default: false },
})

defineEmits(['confirm', 'cancel'])
</script>
