<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { inject, type Ref } from 'vue'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()
const collapsed = inject<Ref<boolean>>('sidebarCollapsed')!
const darkMode = inject<Ref<boolean>>('darkMode')!

const user = computed(() => usersStore.selectedUser)

const initials = computed(() => {
  if (!user.value) return '??'
  const f = user.value.name?.[0] ?? ''
  const l = user.value.apellido?.[0] ?? ''
  return (f + l).toUpperCase()
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

function formatDate(d: string | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleDelete() {
  if (!user.value) return
  const result = await Swal.fire({
    title: '¿Eliminar usuario?',
    text: `El usuario "${user.value.username}" será eliminado permanentemente.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })
  if (!result.isConfirmed) return
  await usersStore.deleteUser(user.value.id)
  Swal.fire({
    title: 'Eliminado',
    text: 'El usuario fue eliminado.',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false,
  })
  router.push({ name: 'usuarios-lista' })
}

onMounted(async () => {
  await usersStore.fetchUser(Number(route.params.id))
})
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
        <header class="mb-8">
          <button
            class="text-[1.2rem] text-primary hover:underline cursor-pointer bg-transparent border-none mb-3"
            @click="router.push({ name: 'usuarios-lista' })"
          >
            ← Volver a usuarios
          </button>
          <h1 class="text-[2rem] font-bold text-body dark:text-dk-body">Detalle de Usuario</h1>
        </header>

        <div
          v-if="usersStore.loading"
          class="py-16 text-center text-[1.4rem] text-muted dark:text-dk-muted"
        >
          Cargando...
        </div>

        <div
          v-else-if="user"
          class="max-w-[60rem] bg-surface dark:bg-dk-surface rounded-2xl p-8 shadow-sm"
        >
          <!-- Avatar + Name -->
          <div
            class="flex items-center gap-6 mb-8 pb-6 border-b border-border dark:border-dk-border"
          >
            <div
              class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-[2rem] font-bold text-primary"
            >
              {{ initials }}
            </div>
            <div>
              <h2 class="text-[1.8rem] font-bold text-body dark:text-dk-body">
                {{ user.name }} {{ user.apellido }}
              </h2>
              <p class="text-[1.3rem] text-muted dark:text-dk-muted">@{{ user.username }}</p>
              <span
                class="inline-block mt-1 px-2 py-0.5 text-[1.1rem] font-semibold rounded"
                :class="rolColor(user.rol)"
              >
                {{ rolLabel(user.rol) }}
              </span>
            </div>
          </div>

          <!-- Info Grid -->
          <div class="grid grid-cols-2 gap-y-5 gap-x-8 text-[1.3rem] max-[768px]:grid-cols-1">
            <div>
              <p
                class="text-[1.1rem] text-muted dark:text-dk-muted uppercase tracking-wider mb-0.5"
              >
                Email
              </p>
              <p class="text-body dark:text-dk-body">{{ user.email }}</p>
            </div>
            <div>
              <p
                class="text-[1.1rem] text-muted dark:text-dk-muted uppercase tracking-wider mb-0.5"
              >
                Estado
              </p>
              <span
                class="inline-flex items-center gap-1"
                :class="
                  user.activo
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400'
                "
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="user.activo ? 'bg-emerald-500' : 'bg-red-500'"
                ></span>
                {{ user.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <div>
              <p
                class="text-[1.1rem] text-muted dark:text-dk-muted uppercase tracking-wider mb-0.5"
              >
                Creado
              </p>
              <p class="text-body dark:text-dk-body">{{ formatDate(user.created_at) }}</p>
            </div>
            <div>
              <p
                class="text-[1.1rem] text-muted dark:text-dk-muted uppercase tracking-wider mb-0.5"
              >
                Actualizado
              </p>
              <p class="text-body dark:text-dk-body">{{ formatDate(user.updated_at) }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-8 flex gap-4">
            <BaseButton
              variant="primary"
              @click="router.push({ name: 'usuarios-editar', params: { id: user.id } })"
            >
              Editar
            </BaseButton>
            <BaseButton variant="danger" @click="handleDelete"> Eliminar </BaseButton>
          </div>
        </div>
      </section>
    </section>
  </main>
</template>
