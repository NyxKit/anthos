import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/auth/stores/auth'
import { useUsersStore } from '@/users/stores/users'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/dashboard/views/DashboardView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/auth/views/SignInView.vue'),
      meta: { hideShell: true },
    },
    {
      path: '/setup',
      name: 'setup',
      component: () => import('@/views/UserSetupView.vue'),
      meta: { hideShell: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/users/views/UsersView.vue'),
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

router.beforeEach(async to => {
  const auth = useAuthStore()
  const users = useUsersStore()

  if (!users.isReady) {
    await users.loadSetupStatus()
  }

  if (!auth.isReady) {
    await auth.bootstrap()
  }

  if (users.setupRequired) {
    if (to.path !== '/setup') {
      return '/setup'
    }

    return true
  }

  if (!auth.isAuthenticated && to.path !== '/login') {
    return '/login'
  }

  if (auth.isAuthenticated && (to.path === '/login' || to.path === '/setup')) {
    return '/users'
  }

  return true
})

export default router
