<template>
  <section>
    <!-- Encabezado -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Tarjetas</h1>
        <p class="mt-1 text-sm text-slate-500">
          {{ store.total }} tarjeta{{ store.total !== 1 ? 's' : '' }} registrada{{ store.total !== 1 ? 's' : '' }}
        </p>
      </div>
      <button
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style="background: #10B981"
        @click="openCreate"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        Nueva tarjeta
      </button>
    </div>

    <!-- Estado de carga -->
    <div v-if="store.loading" class="mt-10 flex justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-success border-t-transparent" />
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="mt-6 rounded-xl px-5 py-4 text-sm" style="background: var(--color-danger-bg); color: var(--color-danger)">
      {{ store.error }}
    </div>

    <!-- Grid de tarjetas -->
    <div v-else-if="store.tarjetas.length" class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <TarjetaCard
        v-for="t in store.tarjetas"
        :key="t.id"
        :tarjeta="t"
        @click="goToDetalle(t.id)"
        @edit="openEdit(t)"
        @delete="confirmDelete(t)"
      />
    </div>

    <!-- Estado vacío -->
    <div v-else class="mt-10 fintech-card flex flex-col items-center justify-center p-16 text-center">
      <span class="material-symbols-outlined text-5xl" style="color: rgba(16,185,129,0.35)">credit_card_off</span>
      <p class="mt-3 font-semibold text-slate-600">No tienes tarjetas registradas</p>
      <p class="mt-1 text-sm text-slate-500">Crea tu primera tarjeta para comenzar a controlar tus gastos.</p>
      <button
        class="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
        style="background: #10B981"
        @click="openCreate"
      >
        Agregar tarjeta
      </button>
    </div>

    <!-- Paginación -->
    <div v-if="store.totalPages > 1" class="mt-6 flex items-center justify-center gap-2">
      <button
        class="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-slate-500 transition-colors disabled:opacity-30 hover:bg-slate-100"
        :disabled="store.page === 1"
        @click="changePage(store.page - 1)"
      >
        <span class="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>

      <button
        v-for="p in pageRange"
        :key="p"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors"
        :class="p === store.page
          ? 'text-white'
          : 'text-slate-500 hover:bg-slate-100'"
        :style="p === store.page ? 'background: rgba(16,185,129,0.2); color: #10B981' : ''"
        @click="changePage(p)"
      >
        {{ p }}
      </button>

      <button
        class="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-slate-500 transition-colors disabled:opacity-30 hover:bg-slate-100"
        :disabled="store.page === store.totalPages"
        @click="changePage(store.page + 1)"
      >
        <span class="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </div>

    <!-- Modal crear/editar -->
    <TarjetaFormModal
      v-model="showModal"
      :tarjeta-edit="editTarget"
      @saved="onSaved"
    />

    <!-- Confirm delete -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="deleteTarget = null">
          <div class="absolute inset-0" style="background: rgba(7,17,31,0.8); backdrop-filter: blur(6px)" />
          <div class="relative w-full max-w-sm rounded-2xl p-6 shadow-card" style="background: #FFFFFF; border: 1px solid #E2E8F0">
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style="background: var(--color-danger-bg)">
                <span class="material-symbols-outlined text-danger">warning</span>
              </div>
              <div>
                <h3 class="font-semibold text-slate-900">Eliminar tarjeta</h3>
                <p class="mt-1 text-sm text-slate-500">
                  ¿Eliminar <strong class="text-slate-900">{{ deleteTarget?.nombre }}</strong>? Esta acción no se puede deshacer.
                </p>
                <p v-if="deleteError" class="mt-2 text-xs text-danger">{{ deleteError }}</p>
              </div>
            </div>
            <div class="mt-5 flex gap-3">
              <button class="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50" @click="deleteTarget = null">Cancelar</button>
              <button
                class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style="background: #DC2626"
                :disabled="deleting"
                @click="doDelete"
              >
                {{ deleting ? 'Eliminando…' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTarjetasStore } from '../stores/tarjetas'
import TarjetaCard      from '../components/TarjetaCard.vue'
import TarjetaFormModal from '../components/TarjetaFormModal.vue'

const store  = useTarjetasStore()
const router = useRouter()

onMounted(() => store.fetchTarjetas())

// Paginación
const pageRange = computed(() => {
  const pages = []
  for (let i = 1; i <= store.totalPages; i++) pages.push(i)
  return pages
})
function changePage(p) { store.fetchTarjetas(p) }

// Navegación
function goToDetalle(id) { router.push(`/tarjetas/${id}`) }

// Crear
const showModal  = ref(false)
const editTarget = ref(null)
function openCreate() { editTarget.value = null; showModal.value = true }
function openEdit(t)  { editTarget.value = t;    showModal.value = true }

async function onSaved(payload) {
  try {
    if (payload.id) await store.updateTarjeta(payload.id, payload)
    else            await store.createTarjeta(payload)
  } catch (e) {
    console.error(e)
  }
}

// Eliminar
const deleteTarget = ref(null)
const deleteError  = ref('')
const deleting     = ref(false)
function confirmDelete(t) { deleteTarget.value = t; deleteError.value = '' }

async function doDelete() {
  deleting.value = true
  deleteError.value = ''
  try {
    await store.deleteTarjeta(deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) {
    deleteError.value = e.response?.data?.error || 'No se pudo eliminar la tarjeta'
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
