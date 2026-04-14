<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClientesStore } from '@/stores/clientes'
import { useVehiculosStore } from '@/stores/vehiculos'
import { useOrdenesStore } from '@/stores/ordenes'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import Swal from 'sweetalert2'

const router = useRouter()
const cliStore = useClientesStore()
const vehStore = useVehiculosStore()
const ordStore = useOrdenesStore()

const collapsed = inject<Ref<boolean>>('sidebarCollapsed')!
const darkMode = inject<Ref<boolean>>('darkMode')!

const busqueda = ref('')

const clientesFiltrados = computed(() => {
  if (!busqueda.value.trim()) return cliStore.clientes
  const q = busqueda.value.toLowerCase()
  return cliStore.clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(q) ||
      c.telefono.includes(q) ||
      c.email.toLowerCase().includes(q),
  )
})

function contarVehiculos(nombre: string): number {
  return vehStore.vehiculos.filter((v) => v.clienteNombre === nombre).length
}

function contarOrdenes(nombre: string): number {
  return ordStore.ordenes.filter((o) => o.clienteNombre === nombre).length
}

async function confirmarEliminar(id: string, nombre: string) {
  const result = await Swal.fire({
    title: '¿Eliminar cliente?',
    text: `El cliente "${nombre}" será eliminado permanentemente.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })
  if (!result.isConfirmed) return
  cliStore.eliminar(id)
  Swal.fire({
    title: 'Eliminado',
    text: 'El cliente fue eliminado.',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false,
  })
}
</script>

<template>
  <div class="min-h-screen bg-bg dark:bg-dk-bg transition-colors duration-300">
    <AppSidebar />
    <div
      class="min-h-screen flex flex-col transition-all duration-300 ease-out max-[768px]:ml-0"
      :class="collapsed ? 'ml-[6.4rem]' : 'ml-[22rem]'"
    >
      <AppTopbar :dark-mode="darkMode" @toggle-dark="darkMode = !darkMode" />

      <main class="flex-1 px-12 py-10 max-[768px]:px-5 max-[768px]:py-6">
        <header
          class="flex items-end justify-between mb-10 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-4"
        >
          <section>
            <h1
              class="text-[3.2rem] font-extralight text-body dark:text-dk-body tracking-[-0.03em] leading-none mb-2"
            >
              Clientes
            </h1>
            <p class="text-[1.3rem] text-muted dark:text-dk-muted">
              {{ cliStore.totalClientes }} clientes registrados
            </p>
          </section>
          <button
            class="flex items-center gap-2 px-6 py-3 text-[1.3rem] font-semibold text-white bg-primary border-none cursor-pointer hover:bg-primary-dark transition-colors"
            @click="router.push({ name: 'clientes-crear' })"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Cliente
          </button>
        </header>

        <!-- Busqueda -->
        <nav
          class="flex items-center gap-3 px-4 py-3 bg-surface dark:bg-dk-surface border border-border dark:border-dk-border mb-8 max-w-[32rem] max-[768px]:max-w-none"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="text-muted dark:text-dk-muted shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por nombre, telefono, email..."
            class="flex-1 text-[1.3rem] text-body dark:text-dk-body bg-transparent border-none outline-none placeholder:text-muted dark:placeholder:text-dk-muted"
          />
        </nav>

        <!-- Tabla -->
        <section
          class="bg-surface dark:bg-dk-surface border border-border dark:border-dk-border overflow-hidden"
        >
          <header
            class="grid grid-cols-[2fr_1fr_1.5fr_1fr_6rem] gap-4 px-6 py-4 border-b border-border dark:border-dk-border max-[768px]:hidden"
          >
            <span
              class="text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider"
              >Nombre</span
            >
            <span
              class="text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider"
              >Telefono</span
            >
            <span
              class="text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider"
              >Email</span
            >
            <span
              class="text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider"
              >Vehiculos</span
            >
            <span
              class="text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider text-right"
              >Acciones</span
            >
          </header>

          <article
            v-for="c in clientesFiltrados"
            :key="c.id"
            class="grid grid-cols-[2fr_1fr_1.5fr_1fr_6rem] gap-4 px-6 py-5 border-b border-border/60 dark:border-dk-border/60 last:border-b-0 items-center hover:bg-bg dark:hover:bg-dk-bg transition-colors cursor-pointer max-[768px]:grid-cols-1 max-[768px]:gap-2"
            @click="router.push({ name: 'clientes-detalle', params: { id: c.id } })"
          >
            <section class="flex items-center gap-4">
              <span
                class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[1.1rem] font-semibold shrink-0"
                >{{
                  c.nombre
                    .split(' ')
                    .map((w) => w.charAt(0))
                    .slice(0, 2)
                    .join('')
                }}</span
              >
              <section>
                <p class="text-[1.3rem] font-medium text-body dark:text-dk-body">{{ c.nombre }}</p>
                <p v-if="c.rfc" class="text-[1.1rem] text-muted dark:text-dk-muted">
                  RFC: {{ c.rfc }}
                </p>
              </section>
            </section>
            <span class="text-[1.3rem] text-body dark:text-dk-body">{{ c.telefono }}</span>
            <span class="text-[1.3rem] text-muted dark:text-dk-muted truncate">{{ c.email }}</span>
            <span class="text-[1.3rem] text-body dark:text-dk-body"
              >{{ contarVehiculos(c.nombre) }} vehiculos</span
            >
            <nav class="flex items-center justify-end gap-2" @click.stop>
              <button
                class="w-7 h-7 flex items-center justify-center text-muted dark:text-dk-muted hover:text-primary cursor-pointer border-none bg-transparent transition-colors"
                title="Editar"
                @click="router.push({ name: 'clientes-editar', params: { id: c.id } })"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                class="w-7 h-7 flex items-center justify-center text-muted dark:text-dk-muted hover:text-red-500 cursor-pointer border-none bg-transparent transition-colors"
                title="Eliminar"
                @click="confirmarEliminar(c.id, c.nombre)"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </nav>
          </article>

          <section v-if="clientesFiltrados.length === 0" class="px-6 py-16 text-center">
            <p class="text-[1.4rem] text-muted dark:text-dk-muted">No se encontraron clientes</p>
          </section>
        </section>
      </main>
    </div>
  </div>
</template>
