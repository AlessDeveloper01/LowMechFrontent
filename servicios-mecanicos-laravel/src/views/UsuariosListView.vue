<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { inject, type Ref } from 'vue'
import Swal from 'sweetalert2'

const router = useRouter()
const usersStore = useUsersStore()
const collapsed = inject<Ref<boolean>>('sidebarCollapsed')!
const darkMode = inject<Ref<boolean>>('darkMode')!

onMounted(() => {
  usersStore.fetchUsers()
})

function rolLabel(rol: string) {
  const map: Record<string, string> = {
    admin: 'Administrador',
    mecanico: 'Mecánico',
    recepcionista: 'Recepcionista',
  }
  return map[rol] ?? rol
}

function rolColor(rol: string) {
  const map: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    mecanico: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    recepcionista: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  }
  return map[rol] ?? 'bg-gray-100 text-gray-700'
}

async function handleDelete(id: number, username: string) {
  const result = await Swal.fire({
    title: '¿Eliminar usuario?',
    text: `El usuario "${username}" será eliminado permanentemente.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })
  if (!result.isConfirmed) return
  await usersStore.deleteUser(id)
  Swal.fire({
    title: 'Eliminado',
    text: 'El usuario fue eliminado.',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false,
  })
}
</script>

<template>
  <main class="min-h-screen bg-bg dark:bg-dk-bg transition-colors duration-300">
    <AppSidebar />
    <section
      class="min-h-screen flex flex-col transition-all duration-300 ease-out max-[768px]:ml-0"
      :class="collapsed ? 'ml-[6.4rem]' : 'ml-[22rem]'"
    >
      <AppTopbar :dark-mode="darkMode" @toggle-dark="darkMode = !darkMode" />

      <section class="flex-1 p-10 max-[768px]:p-5">
        <!-- Header -->
        <header class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-[2rem] font-bold text-body dark:text-dk-body">Usuarios</h1>
            <p class="text-[1.3rem] text-muted dark:text-dk-muted mt-1">
              Gestión de usuarios del sistema
            </p>
          </div>
          <BaseButton variant="primary" @click="router.push({ name: 'usuarios-crear' })">
            + Nuevo Usuario
          </BaseButton>
        </header>

        <!-- Loading -->
        <div
          v-if="usersStore.loading"
          class="py-16 text-center text-[1.4rem] text-muted dark:text-dk-muted"
        >
          Cargando usuarios...
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-[1.3rem]">
            <thead>
              <tr class="border-b border-border dark:border-dk-border">
                <th
                  class="text-left py-3 px-4 text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider"
                >
                  Usuario
                </th>
                <th
                  class="text-left py-3 px-4 text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider"
                >
                  Nombre
                </th>
                <th
                  class="text-left py-3 px-4 text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  class="text-left py-3 px-4 text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider"
                >
                  Rol
                </th>
                <th
                  class="text-left py-3 px-4 text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  class="text-right py-3 px-4 text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="u in usersStore.users"
                :key="u.id"
                class="border-b border-border/50 dark:border-dk-border/50 hover:bg-surface dark:hover:bg-dk-surface transition-colors"
              >
                <td class="py-3 px-4 font-medium text-body dark:text-dk-body">
                  {{ u.username }}
                </td>
                <td class="py-3 px-4 text-body dark:text-dk-body">{{ u.name }} {{ u.apellido }}</td>
                <td class="py-3 px-4 text-muted dark:text-dk-muted">{{ u.email }}</td>
                <td class="py-3 px-4">
                  <span
                    class="inline-block px-2 py-0.5 text-[1.1rem] font-semibold rounded"
                    :class="rolColor(u.rol)"
                  >
                    {{ rolLabel(u.rol) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="inline-flex items-center gap-1 text-[1.1rem]"
                    :class="
                      u.activo
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500 dark:text-red-400'
                    "
                  >
                    <span
                      class="w-2 h-2 rounded-full"
                      :class="u.activo ? 'bg-emerald-500' : 'bg-red-500'"
                    ></span>
                    {{ u.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      class="px-3 py-1 text-[1.1rem] text-primary hover:bg-primary/10 rounded transition-colors cursor-pointer border-none bg-transparent"
                      @click="router.push({ name: 'usuarios-detalle', params: { id: u.id } })"
                    >
                      Ver
                    </button>
                    <button
                      class="px-3 py-1 text-[1.1rem] text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors cursor-pointer border-none bg-transparent"
                      @click="router.push({ name: 'usuarios-editar', params: { id: u.id } })"
                    >
                      Editar
                    </button>
                    <button
                      class="px-3 py-1 text-[1.1rem] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors cursor-pointer border-none bg-transparent"
                      @click="handleDelete(u.id, u.username)"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <p
            v-if="usersStore.users.length === 0 && !usersStore.loading"
            class="py-12 text-center text-[1.3rem] text-muted dark:text-dk-muted"
          >
            No hay usuarios registrados
          </p>
        </div>
      </section>
    </section>
  </main>
</template>
