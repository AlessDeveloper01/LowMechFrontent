import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    // Ordenes
    {
      path: '/ordenes',
      name: 'ordenes-lista',
      component: () => import('@/views/OrdenesListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/ordenes/crear',
      name: 'ordenes-crear',
      component: () => import('@/views/OrdenFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/ordenes/:id',
      name: 'ordenes-detalle',
      component: () => import('@/views/OrdenDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/ordenes/:id/editar',
      name: 'ordenes-editar',
      component: () => import('@/views/OrdenFormView.vue'),
      meta: { requiresAuth: true },
    },
    // Vehiculos
    {
      path: '/vehiculos',
      name: 'vehiculos-lista',
      component: () => import('@/views/VehiculosListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/vehiculos/crear',
      name: 'vehiculos-crear',
      component: () => import('@/views/VehiculoFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/vehiculos/:id',
      name: 'vehiculos-detalle',
      component: () => import('@/views/VehiculoDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/vehiculos/:id/editar',
      name: 'vehiculos-editar',
      component: () => import('@/views/VehiculoFormView.vue'),
      meta: { requiresAuth: true },
    },
    // Clientes
    {
      path: '/clientes',
      name: 'clientes-lista',
      component: () => import('@/views/ClientesListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/clientes/crear',
      name: 'clientes-crear',
      component: () => import('@/views/ClienteFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/clientes/:id',
      name: 'clientes-detalle',
      component: () => import('@/views/ClienteDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/clientes/:id/editar',
      name: 'clientes-editar',
      component: () => import('@/views/ClienteFormView.vue'),
      meta: { requiresAuth: true },
    },
    // Inventario
    {
      path: '/inventario',
      name: 'inventario-lista',
      component: () => import('@/views/InventarioListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/inventario/crear',
      name: 'inventario-crear',
      component: () => import('@/views/InventarioFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/inventario/:id',
      name: 'inventario-detalle',
      component: () => import('@/views/InventarioDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/inventario/:id/editar',
      name: 'inventario-editar',
      component: () => import('@/views/InventarioFormView.vue'),
      meta: { requiresAuth: true },
    },
    // Usuarios
    {
      path: '/usuarios',
      name: 'usuarios-lista',
      component: () => import('@/views/UsuariosListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/usuarios/crear',
      name: 'usuarios-crear',
      component: () => import('@/views/UsuarioFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/usuarios/:id',
      name: 'usuarios-detalle',
      component: () => import('@/views/UsuarioDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/usuarios/:id/editar',
      name: 'usuarios-editar',
      component: () => import('@/views/UsuarioFormView.vue'),
      meta: { requiresAuth: true },
    },
    // Reportes y Configuracion
    {
      path: '/reportes',
      name: 'reportes',
      component: () => import('@/views/ReportesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/configuracion',
      name: 'configuracion',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'login' }
  if (to.meta.guest && auth.isAuthenticated) return { name: 'dashboard' }
})

export default router
