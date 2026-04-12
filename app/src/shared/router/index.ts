import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/dashboard/views/DashboardView.vue'),
    },
    {
      path: '/nodes',
      name: 'nodes',
      component: () => import('@/nodes/views/NodesView.vue'),
    },
    {
      path: '/provision',
      name: 'provision',
      component: () => import('@/views/ProvisionView.vue'),
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('@/logs/views/LogsView.vue'),
    },
  ],
})

export default router
