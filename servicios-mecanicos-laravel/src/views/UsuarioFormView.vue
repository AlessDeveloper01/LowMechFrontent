<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { inject, type Ref } from 'vue'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()
const collapsed = inject<Ref<boolean>>('sidebarCollapsed')!
const darkMode = inject<Ref<boolean>>('darkMode')!

const isEdit = computed(() => !!route.params.id)

const form = ref({
  username: '',
  email: '',
  name: '',
  apellido: '',
  password: '',
  rol: 'mecanico',
  activo: true,
})

const saving = ref(false)
const errors = ref<Record<string, string>>({})

onMounted(async () => {
  if (isEdit.value) {
    await usersStore.fetchUser(Number(route.params.id))
    if (usersStore.selectedUser) {
      const u = usersStore.selectedUser
      form.value = {
        username: u.username,
        email: u.email,
        name: u.name,
        apellido: u.apellido,
        password: '',
        rol: u.rol,
        activo: u.activo,
      }
    }
  }
})

function validate(): boolean {
  errors.value = {}
  if (!form.value.username || form.value.username.length < 4)
    errors.value.username = 'Mínimo 4 caracteres'
  if (!form.value.email || !/\S+@\S+\.\S+/.test(form.value.email))
    errors.value.email = 'Email inválido'
  if (!form.value.name) errors.value.name = 'Nombre obligatorio'
  if (!form.value.apellido) errors.value.apellido = 'Apellido obligatorio'
  if (!isEdit.value && (!form.value.password || form.value.password.length < 6))
    errors.value.password = 'Mínimo 6 caracteres'
  return Object.keys(errors.value).length === 0
}

async function guardar() {
  if (!validate()) return
  saving.value = true
  try {
    const payload: Record<string, unknown> = { ...form.value }
    if (isEdit.value && !payload.password) delete payload.password

    if (isEdit.value) {
      await usersStore.updateUser(Number(route.params.id), payload)
      await Swal.fire({
        title: 'Actualizado',
        text: 'El usuario fue actualizado correctamente.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    } else {
      await usersStore.createUser(payload)
      await Swal.fire({
        title: 'Creado',
        text: 'El usuario fue creado correctamente.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    }
    router.push({ name: 'usuarios-lista' })
  } catch {
    /* error handled by store */
  } finally {
    saving.value = false
  }
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
        <header class="mb-8">
          <button
            class="text-[1.2rem] text-primary hover:underline cursor-pointer bg-transparent border-none mb-3"
            @click="router.push({ name: 'usuarios-lista' })"
          >
            ← Volver a usuarios
          </button>
          <h1 class="text-[2rem] font-bold text-body dark:text-dk-body">
            {{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </h1>
        </header>

        <form
          class="max-w-[60rem] bg-surface dark:bg-dk-surface rounded-2xl p-8 shadow-sm"
          @submit.prevent="guardar"
        >
          <div class="grid grid-cols-2 gap-6 max-[768px]:grid-cols-1">
            <div>
              <BaseInput
                id="username"
                v-model="form.username"
                label="Usuario"
                placeholder="ej. jlopez"
              />
              <p v-if="errors.username" class="mt-1 text-[1.1rem] text-red-500">
                {{ errors.username }}
              </p>
            </div>
            <div>
              <BaseInput
                id="email"
                v-model="form.email"
                label="Email"
                type="email"
                placeholder="correo@ejemplo.com"
              />
              <p v-if="errors.email" class="mt-1 text-[1.1rem] text-red-500">
                {{ errors.email }}
              </p>
            </div>
            <div>
              <BaseInput id="name" v-model="form.name" label="Nombre" placeholder="Juan" />
              <p v-if="errors.name" class="mt-1 text-[1.1rem] text-red-500">
                {{ errors.name }}
              </p>
            </div>
            <div>
              <BaseInput
                id="apellido"
                v-model="form.apellido"
                label="Apellido"
                placeholder="López"
              />
              <p v-if="errors.apellido" class="mt-1 text-[1.1rem] text-red-500">
                {{ errors.apellido }}
              </p>
            </div>
            <div>
              <BaseInput
                id="password"
                v-model="form.password"
                label="Contraseña"
                type="password"
                :placeholder="isEdit ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'"
              />
              <p v-if="errors.password" class="mt-1 text-[1.1rem] text-red-500">
                {{ errors.password }}
              </p>
            </div>
            <div>
              <label
                for="rol"
                class="block text-[1.2rem] font-semibold text-body dark:text-dk-body mb-1"
              >
                Rol
              </label>
              <select
                id="rol"
                v-model="form.rol"
                class="w-full h-[4.4rem] px-4 rounded-xl border border-border dark:border-dk-border bg-bg dark:bg-dk-bg text-[1.3rem] text-body dark:text-dk-body outline-none focus:border-primary transition-colors"
              >
                <option value="admin">Administrador</option>
                <option value="mecanico">Mecánico</option>
                <option value="recepcionista">Recepcionista</option>
              </select>
            </div>
          </div>

          <div v-if="isEdit" class="mt-6 flex items-center gap-3">
            <input
              id="activo"
              v-model="form.activo"
              type="checkbox"
              class="w-5 h-5 accent-primary"
            />
            <label for="activo" class="text-[1.3rem] text-body dark:text-dk-body">
              Usuario activo
            </label>
          </div>

          <div class="mt-8 flex gap-4">
            <BaseButton type="submit" variant="primary" :disabled="saving">
              {{ saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Usuario' }}
            </BaseButton>
            <BaseButton
              type="button"
              variant="ghost"
              @click="router.push({ name: 'usuarios-lista' })"
            >
              Cancelar
            </BaseButton>
          </div>
        </form>
      </section>
    </section>
  </main>
</template>
