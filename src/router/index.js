import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import { encodeUrlSegment as enc } from '../utils/urlEncoding'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: `/${enc('login')}`,
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: `/${enc('dashboard')}`,
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: enc('tarjetas'),
          name: 'tarjetas',
          component: () => import('../views/TarjetasView.vue'),
        },
        {
          path: `${enc('tarjetas')}/:id`,
          name: 'tarjeta-detalle',
          component: () => import('../views/TarjetaDetalleView.vue'),
        },
        {
          path: enc('compras'),
          name: 'compras',
          component: () => import('../views/ComprasView.vue'),
        },
        {
          path: enc('calendario'),
          name: 'calendario',
          component: () => import('../views/CalendarioView.vue'),
        },
        {
          path: enc('cuentas'),
          name: 'cuentas',
          component: () => import('../views/CuentasView.vue'),
        },
        {
          path: `${enc('cuentas')}/:id`,
          name: 'cuenta-detalle',
          component: () => import('../views/CuentaDetalleView.vue'),
        },
        {
          path: enc('ingresos'),
          name: 'ingresos',
          component: () => import('../views/IngresosView.vue'),
        },
        {
          path: enc('egresos'),
          name: 'egresos',
          component: () => import('../views/EgresosView.vue'),
        },
        {
          path: enc('prestamos'),
          name: 'prestamos',
          component: () => import('../views/PrestamosView.vue'),
        },
        { path: enc('clientes-prestamo'), name: 'clientes-prestamo', component: () => import('../views/ClientesPrestamoView.vue') },
        {
          path: `${enc('prestamos')}/:id`,
          name: 'prestamo-detalle',
          component: () => import('../views/PrestamoDetalleView.vue'),
        },
        {
          path: enc('creditos'),
          name: 'creditos',
          component: () => import('../views/CreditosView.vue'),
        },
        {
          path: `${enc('creditos')}/:id`,
          name: 'credito-detalle',
          component: () => import('../views/CreditoDetalleView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'dashboard' },
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (!to.meta.public && !token) {
    return { name: 'login' }
  }
  if (to.name === 'login' && token) {
    return { name: 'dashboard' }
  }
})

export default router
