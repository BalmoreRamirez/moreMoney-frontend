import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
          path: 'reportes',
          name: 'reportes',
          component: () => import('../views/ReportesView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
