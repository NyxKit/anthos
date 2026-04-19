import { createRouter, createWebHistory, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/auth/stores/auth'
import { useUsersStore } from '@/users/stores/users'
import { RouteName } from '../types'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: RouteName.Dashboard,
      component: () => import('@/dashboard/views/DashboardView.vue'),
    },
    {
      path: '/login',
      name: RouteName.Login,
      component: () => import('@/auth/views/SignInView.vue'),
      meta: { hideShell: true },
    },
    {
      path: '/setup',
      name: RouteName.Setup,
      component: () => import('@/views/UserSetupView.vue'),
      meta: { hideShell: true },
    },
    {
      path: '/users',
      name: RouteName.Users,
      component: () => import('@/users/views/UsersView.vue'),
    },
    {
      path: '/account',
      name: RouteName.Account,
      component: () => import('@/users/views/AccountView.vue'),
    },
    {
      path: '/nodes',
      name: RouteName.Nodes,
      component: () => import('@/nodes/views/NodesView.vue'),
    },
    {
      path: '/provision',
      name: RouteName.Provision,
      component: () => import('@/views/ProvisionView.vue'),
    },
    {
      path: '/logs',
      name: RouteName.Logs,
      component: () => import('@/logs/views/LogsView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: RouteName.NotFound,
      component: () => import('@/shared/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to: RouteLocationNormalized) => {
  const authStore = useAuthStore()
  const usersStore = useUsersStore()

  if (!usersStore.isReady) {
    await usersStore.loadSetupStatus()
  }

  if (!authStore.isReady) {
    await authStore.bootstrap()
  }

  if (usersStore.setupRequired) {
    if (to.name !== RouteName.Setup) {
      return { name: RouteName.Setup }
    }

    return true
  }

  if (!authStore.isAuthenticated && to.name !== RouteName.Login) {
    return { name: RouteName.Login }
  }

  if (authStore.isAuthenticated && (to.name === RouteName.Login || to.name === RouteName.Setup)) {
    return { name: RouteName.Users }
  }

  return true
})

export default router
