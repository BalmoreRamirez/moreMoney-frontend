<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div><h1 class="text-2xl font-bold" style="color:var(--color-text-primary)">Clientes de préstamos</h1><p class="mt-1 text-sm" style="color:var(--color-text-muted)">Historial y comportamiento de pago</p></div>
      <button class="btn-brand" @click="nuevo"><span class="material-symbols-outlined">person_add</span> Nuevo cliente</button>
    </div>
    <p v-if="error" class="mt-4 text-sm" style="color:var(--color-danger)">{{ error }}</p>
    <AppDataTable class="mt-5" :data="clientes" :loading="loading" empty-text="Aún no hay clientes. Puedes registrarlos al crear un préstamo." empty-icon="group">
      <Column field="nombre" header="Cliente" sortable style="min-width:200px">
        <template #body="{ data: c }"><div><p class="font-semibold" style="color:var(--color-text-primary)">{{ c.nombre }}</p><p class="text-[11px]" style="color:var(--color-text-muted)">{{ c.contacto || 'Sin contacto' }}</p></div></template>
      </Column>
      <Column field="prestamos.length" header="Préstamos" sortable style="min-width:105px"><template #body="{ data: c }">{{ c.prestamos.length }}</template></Column>
      <Column field="categoria_general" header="Categoría reciente" sortable style="min-width:170px"><template #body="{ data: c }"><span class="rounded-full px-2.5 py-1 text-xs font-semibold" :style="badge(c.categoria_general)">{{ labels[c.categoria_general] || 'Sin historial' }}</span></template></Column>
      <Column field="activo" header="Estado" sortable style="min-width:100px"><template #body="{ data: c }"><span class="rounded-full px-2 py-1 text-xs font-semibold" :style="c.activo ? 'background:var(--color-success-bg);color:var(--color-success)' : 'background:var(--color-surface-mid);color:var(--color-text-muted)'">{{ c.activo ? 'Activo' : 'Desactivado' }}</span></template></Column>
      <Column header="Historial" style="min-width:220px"><template #body="{ data: c }"><div class="flex flex-wrap gap-1 text-[10px]" style="color:var(--color-text-secondary)"><span>Antes {{ c.resumen.anticipado }}</span><span>· A tiempo {{ c.resumen.puntual }}</span><span>· Tarde {{ c.resumen.tardio }}</span><span>· Vencidos {{ c.resumen.vencido }}</span></div></template></Column>
      <Column header="Acciones" style="min-width:210px;width:210px"><template #body="{ data: c }"><div class="flex justify-end gap-1"><button class="btn-ghost px-2 py-1 text-xs" @click="visualizar(c)"><span class="material-symbols-outlined mr-1 text-sm">visibility</span>Visualizar</button><button class="icon-btn" title="Editar cliente" @click="editar(c)"><span class="material-symbols-outlined text-base">edit</span></button><button v-if="c.prestamos.length" class="icon-btn" :title="c.activo ? 'Desactivar cliente' : 'Activar cliente'" :disabled="cambiandoEstado===c.id" @click="cambiarEstado(c)"><span class="material-symbols-outlined text-base">{{ c.activo ? 'person_off' : 'person_check' }}</span></button><button v-else class="icon-btn-danger" title="Eliminar cliente" @click="confirmarEliminar(c)"><span class="material-symbols-outlined text-base">delete</span></button></div></template></Column>
    </AppDataTable>

    <div v-if="clienteSeleccionado" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6" @mousedown.self="clienteSeleccionado=null">
      <div class="fintech-card flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden">
        <header class="flex items-start justify-between gap-4 border-b p-5" style="border-color:var(--color-border)">
          <div><p class="text-xs uppercase tracking-widest" style="color:var(--color-text-muted)">Historial del cliente</p><h2 class="mt-1 text-xl font-bold" style="color:var(--color-text-primary)">{{ clienteSeleccionado.nombre }}</h2><p class="text-sm" style="color:var(--color-text-muted)">{{ clienteSeleccionado.contacto || 'Sin contacto registrado' }}</p></div>
          <button class="icon-btn" aria-label="Cerrar historial" @click="clienteSeleccionado=null"><span class="material-symbols-outlined">close</span></button>
        </header>
        <div class="overflow-y-auto p-5">
          <div class="mb-5 flex flex-wrap gap-2 text-xs">
            <span v-for="k in ['anticipado','puntual','tardio','pendiente','vencido']" :key="k" class="rounded-lg px-2.5 py-1.5" style="background:var(--color-surface-mid);color:var(--color-text-secondary)">{{ labels[k] }}: <strong>{{ clienteSeleccionado.resumen[k] }}</strong></span>
          </div>
          <div v-if="prestamosOrdenados.length" class="space-y-4">
            <article v-for="p in prestamosOrdenados" :key="p.id" class="rounded-xl border p-4" style="border-color:var(--color-border)">
              <div class="flex flex-wrap items-start justify-between gap-3"><div><h3 class="font-semibold" style="color:var(--color-text-primary)">Préstamo #{{ p.id }} · {{ money(p.capital) }}</h3><p class="mt-1 text-xs" style="color:var(--color-text-muted)">Inicio {{ fecha(p.fecha_inicio) }} <template v-if="p.dias_duracion">· Vence {{ fechaFin(p) }}</template><template v-else>· Sin vencimiento definido</template> · {{ p.pagos.length }} abonos</p></div><span class="rounded-full px-2.5 py-1 text-xs font-semibold" :style="badge(p.categoria_pago)">{{ labels[p.categoria_pago] || p.categoria_pago }}</span></div>
              <div class="mt-4 overflow-x-auto rounded-lg border" style="border-color:var(--color-border)">
                <table class="w-full min-w-[420px] text-left text-xs"><thead style="background:var(--color-surface-mid);color:var(--color-text-muted)"><tr><th class="px-3 py-2">Fecha de abono</th><th class="px-3 py-2">Detalle</th><th class="px-3 py-2 text-right">Monto</th></tr></thead><tbody><tr v-for="pago in pagosOrdenados(p)" :key="pago.id" class="border-t" style="border-color:var(--color-border);color:var(--color-text-secondary)"><td class="px-3 py-2">{{ fecha(pago.fecha_pago) }}</td><td class="px-3 py-2">{{ pago.nota || 'Abono' }}</td><td class="px-3 py-2 text-right font-mono">{{ money(pago.monto) }}</td></tr><tr v-if="!p.pagos.length"><td colspan="3" class="px-3 py-4 text-center" style="color:var(--color-text-muted)">Sin abonos registrados</td></tr></tbody></table>
              </div>
            </article>
          </div>
          <p v-else class="py-10 text-center text-sm" style="color:var(--color-text-muted)">Este cliente aún no tiene préstamos.</p>
        </div>
      </div>
    </div>
    <div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form class="fintech-card w-full max-w-md space-y-3 p-5" novalidate @submit.prevent="guardar">
        <h2 class="font-semibold" style="color:var(--color-text-primary)">{{ editando ? 'Editar cliente' : 'Nuevo cliente' }}</h2>
        <FloatLabel variant="on" class="block w-full"><input v-model="form.nombre" id="float-ClientesPrestamoView-nombre" class="fintech-input w-full" :class="{ 'p-filled': form.nombre !== '' && form.nombre != null }" required @blur="v$.nombre.$touch()" /><label for="float-ClientesPrestamoView-nombre" class="text-xs">Nombre completo<span aria-hidden="true" style="color:var(--color-danger)"> *</span></label></FloatLabel>
            <p v-if="v$.nombre.$error" class="mt-1 text-[11px]" style="color:var(--color-danger)">{{ v$.nombre.$errors[0].$message }}</p>
        <FloatLabel variant="on" class="block w-full"><input v-model="form.contacto" id="float-ClientesPrestamoView-contacto" class="fintech-input w-full" :class="{ 'p-filled': form.contacto !== '' && form.contacto != null }"  /><label for="float-ClientesPrestamoView-contacto" class="text-xs">Teléfono o correo (opcional)</label></FloatLabel>
        <p v-if="error" class="text-xs" style="color:var(--color-danger)">{{ error }}</p>
        <div class="flex justify-end gap-2"><button type="button" class="btn-ghost" @click="modal=false">Cancelar</button><button class="btn-brand" :disabled="saving">Guardar</button></div>
      </form>
    </div>
    <ConfirmDeleteModal v-if="clienteEliminar" :nombre="clienteEliminar.nombre" warning="Solo se pueden eliminar clientes sin préstamos asociados." :error="errorEliminar" :deleting="eliminando" @confirm="eliminar" @cancel="clienteEliminar=null;errorEliminar=''" />
  </section>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import api from '../utils/api'
import { formatCurrency } from '../utils/currency'
import AppDataTable from '../components/AppDataTable.vue'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue'
const clientes=ref([]),loading=ref(false),modal=ref(false),saving=ref(false),error=ref(''),editando=ref(null),form=ref({nombre:'',contacto:''}),clienteSeleccionado=ref(null),clienteEliminar=ref(null),eliminando=ref(false),errorEliminar=ref(''),cambiandoEstado=ref(null)
const v$ = useVuelidate({ nombre: { required: helpers.withMessage('El nombre del cliente es obligatorio.', required) } }, form)
const labels={anticipado:'Pagó antes',puntual:'Pagó a tiempo',tardio:'Pagó tarde',pendiente:'En curso',vencido:'Vencido',sin_historial:'Sin historial',sin_vencimiento:'Sin vencimiento'}
function money(v){return formatCurrency(v)}
function fecha(v){return v?new Date(`${v}T00:00:00`).toLocaleDateString('es-SV'):'—'}
const prestamosOrdenados = computed(() => [...(clienteSeleccionado.value?.prestamos || [])].sort((a,b)=>String(b.fecha_inicio).localeCompare(String(a.fecha_inicio))))
function pagosOrdenados(p){return [...(p.pagos||[])].sort((a,b)=>String(a.fecha_pago).localeCompare(String(b.fecha_pago)))}
function fechaFin(p){const d=new Date(`${p.fecha_inicio}T00:00:00`);d.setDate(d.getDate()+Number(p.dias_duracion)-1);return fecha(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)}
function visualizar(c){clienteSeleccionado.value=c}
function confirmarEliminar(c){clienteEliminar.value=c;errorEliminar.value=''}
async function eliminar(){if(!clienteEliminar.value)return;eliminando.value=true;errorEliminar.value='';try{await api.delete(`/clientes-prestamo/${clienteEliminar.value.id}`);clienteEliminar.value=null;await cargar()}catch(e){errorEliminar.value=e.response?.data?.error||'No se pudo eliminar el cliente'}finally{eliminando.value=false}}
async function cambiarEstado(c){cambiandoEstado.value=c.id;error.value='';try{await api.put(`/clientes-prestamo/${c.id}/estado`,{activo:!c.activo});await cargar()}catch(e){error.value=e.response?.data?.error||'No se pudo cambiar el estado del cliente'}finally{cambiandoEstado.value=null}}
function color(k){return ({anticipado:'var(--color-success)',puntual:'var(--color-success)',tardio:'var(--color-danger)',vencido:'var(--color-danger)',pendiente:'var(--color-alert)'})[k]||'var(--color-text-muted)'}
function badge(k){return `background:${k==='tardio'||k==='vencido'?'var(--color-danger-bg)':'var(--color-success-bg)'};color:${color(k)}`}
async function cargar(){loading.value=true;try{clientes.value=(await api.get('/clientes-prestamo')).data.data||[]}catch(e){error.value=e.response?.data?.error||'No se pudieron cargar los clientes'}finally{loading.value=false}}
function nuevo(){form.value={nombre:'',contacto:''};v$.value.$reset();editando.value=null;error.value='';modal.value=true}
function editar(c){form.value={nombre:c.nombre,contacto:c.contacto||''};v$.value.$reset();editando.value=c.id;error.value='';modal.value=true}
async function guardar(){if(!(await v$.value.$validate()))return;saving.value=true;error.value='';try{if(editando.value)await api.put(`/clientes-prestamo/${editando.value}`,form.value);else await api.post('/clientes-prestamo',form.value);modal.value=false;await cargar()}catch(e){error.value=e.response?.data?.error||'No se pudo guardar el cliente'}finally{saving.value=false}}
onMounted(cargar)
</script>
