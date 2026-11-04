<template>
  <div class="investment-actions" role="group" :aria-label="`Acciones para ${inversion.nombre}`">
    <div class="investment-action-slot">
      <AccionIcono
        v-if="inversion.cobros?.length"
        icon="receipt_long"
        label="Ver detalle de pagos"
        @click="$emit('detalle')"
      />
    </div>
    <div class="investment-action-slot">
      <AccionIcono
        v-if="inversion.estado === 'en_curso'"
        icon="payments"
        label="Cobrar"
        variant="success"
        @click="$emit('cobrar')"
      />
      <AccionIcono
        v-else-if="inversion.estado === 'vendida'"
        icon="restart_alt"
        label="Resetear a En curso"
        variant="warning"
        @click="$emit('resetear')"
      />
    </div>
    <div class="investment-action-slot">
      <AccionIcono
        v-if="inversion.estado === 'en_curso'"
        icon="edit"
        label="Editar inversión"
        @click="$emit('editar')"
      />
    </div>
    <div class="investment-action-slot">
      <AccionIcono
        v-if="inversion.estado === 'en_curso' && !inversion.cobros?.length"
        icon="delete"
        label="Eliminar inversión"
        variant="danger"
        @click="$emit('eliminar')"
      />
    </div>
  </div>
</template>

<script setup>
import AccionIcono from './AccionIcono.vue'

defineProps({ inversion: { type: Object, required: true } })
defineEmits(['detalle', 'cobrar', 'editar', 'eliminar', 'resetear'])
</script>

<style scoped>
.investment-actions {
  display: grid;
  grid-template-columns: repeat(4, 2rem);
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.investment-action-slot {
  display: flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
}

</style>
