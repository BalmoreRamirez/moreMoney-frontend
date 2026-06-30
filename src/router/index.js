import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: 'tarjetas',
          name: 'tarjetas',
          component: () => import('../views/TarjetasView.vue'),
        },
        {
          path: 'tarjetas/:id',
          name: 'tarjeta-detalle',
          component: () => import('../views/TarjetaDetalleView.vue'),
        },
        {
          path: 'compras',
          name: 'compras',
          component: () => import('../views/ComprasView.vue'),
        },
        {
          path: 'calendario',
          name: 'calendario',
          component: () => import('../views/CalendarioView.vue'),
        },
        {
          path: 'cuentas',
          name: 'cuentas',
          component: () => import('../views/CuentasView.vue'),
        },
        {
          path: 'cuentas/:id',
          name: 'cuenta-detalle',
          component: () => import('../views/CuentaDetalleView.vue'),
        },
        {
          path: 'ingresos',
          name: 'ingresos',
          component: () => import('../views/IngresosView.vue'),
        },
        {
          path: 'egresos',
          name: 'egresos',
          component: () => import('../views/EgresosView.vue'),
        },
        {
          path: 'prestamos',
          name: 'prestamos',
          component: () => import('../views/PrestamosView.vue'),
        },
        {
          path: 'prestamos/:id',
          name: 'prestamo-detalle',
          component: () => import('../views/PrestamoDetalleView.vue'),
        },
        {
          path: 'creditos',
          name: 'creditos',
          component: () => import('../views/CreditosView.vue'),
        },
        {
          path: 'creditos/:id',
          name: 'credito-detalle',
          component: () => import('../views/CreditoDetalleView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
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
