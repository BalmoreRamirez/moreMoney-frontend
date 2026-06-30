<template>
  <div class="fintech-card overflow-hidden">
    <DataTable
      :value="data"
      :loading="loading"
      stripedRows
      :pt="PT"
      v-bind="$attrs"
    >
      <template #loading>
        <div class="flex justify-center py-10">
          <div
            class="h-7 w-7 animate-spin rounded-full border-2"
            style="border-color:#10B981;border-top-color:transparent"
          />
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center py-12 text-center">
          <span
            class="material-symbols-outlined text-5xl mb-3"
            style="color:rgba(100,116,139,0.25)"
          >{{ emptyIcon }}</span>
          <p class="text-sm text-slate-600">{{ emptyText }}</p>
        </div>
      </template>

      <slot />
    </DataTable>
  </div>
</template>

<script setup>
import DataTable from 'primevue/datatable'

defineProps({
  data:      { type: Array,   default: () => [] },
  loading:   { type: Boolean, default: false },
  emptyText: { type: String,  default: 'Sin datos' },
  emptyIcon: { type: String,  default: 'table_rows' },
})

defineOptions({ inheritAttrs: false })

const PT = {
  root:             { style: 'background:transparent;border:none;font-family:inherit' },
  tableContainer:   { style: 'overflow-x:auto' },
  table:            { style: 'width:100%;border-collapse:collapse' },
  thead:            { style: 'border-bottom:1px solid #E2E8F0' },
  headerRow:        { style: 'background:rgba(10,25,47,0.02)' },
  columnHeader:     { style: 'padding:10px 16px;border:none;color:#64748B;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;background:transparent' },
  columnHeaderContent: { style: 'display:flex;align-items:center;gap:4px' },
  columnTitle:      { style: 'color:#64748B' },
  tbody:            {},
  row:              { style: 'border-bottom:1px solid #E2E8F0;transition:background 0.15s' },
  bodyCell:         { style: 'padding:11px 16px;border:none;color:#0F172A;font-size:13px;vertical-align:middle' },
  emptyMessageCell: { style: 'border:none;padding:0' },
  loadingOverlay:   { style: 'background:rgba(240,244,250,0.8);backdrop-filter:blur(2px)' },
}
</script>

<style scoped>
/* Striped rows */
:deep(.p-datatable-striped .p-datatable-row:nth-child(even) > td) {
  background: rgba(10,25,47,0.02);
}
/* Row hover */
:deep(.p-datatable-row:hover > td) {
  background: rgba(10,25,47,0.03) !important;
}
/* Remove last row border */
:deep(.p-datatable-row:last-child > td) {
  border-bottom: none;
}
/* Sort icons */
:deep(.p-datatable-sort-icon) {
  color: #94A3B8;
  width: 12px;
  height: 12px;
}
</style>
