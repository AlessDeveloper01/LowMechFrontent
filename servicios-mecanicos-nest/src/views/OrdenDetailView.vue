<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  useOrdenesStore,
  calcularSubtotal,
  calcularIVA,
  calcularTotal,
  type EstadoOrden,
} from '@/stores/ordenes'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()
const store = useOrdenesStore()

const collapsed = inject<Ref<boolean>>('sidebarCollapsed')!
const darkMode = inject<Ref<boolean>>('darkMode')!

const orden = computed(() => store.obtenerPorId(route.params.id as string))

const estadoConfig: Record<EstadoOrden, { label: string; clase: string }> = {
  pendiente: {
    label: 'Pendiente',
    clase: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  },
  en_proceso: {
    label: 'En proceso',
    clase: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  },
  completado: {
    label: 'Completado',
    clase: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  cancelado: {
    label: 'Cancelado',
    clase: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
}

const prioridadConfig: Record<string, { label: string; clase: string }> = {
  normal: { label: 'Normal', clase: 'text-muted dark:text-dk-muted' },
  alta: { label: 'Alta', clase: 'text-amber-500' },
  urgente: { label: 'Urgente', clase: 'text-red-500' },
}

const estadosDisponibles: { valor: EstadoOrden; label: string }[] = [
  { valor: 'pendiente', label: 'Pendiente' },
  { valor: 'en_proceso', label: 'En proceso' },
  { valor: 'completado', label: 'Completado' },
  { valor: 'cancelado', label: 'Cancelado' },
]

function cambiarEstado(estado: EstadoOrden) {
  if (orden.value) store.cambiarEstado(orden.value.id, estado)
}

async function confirmarEliminar() {
  if (!orden.value) return
  const result = await Swal.fire({
    title: '¿Eliminar orden?',
    text: `La orden #${orden.value.id} será eliminada permanentemente.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })
  if (!result.isConfirmed) return
  store.eliminar(orden.value.id)
  await Swal.fire({ title: 'Eliminado', text: 'La orden fue eliminada.', icon: 'success', timer: 1500, showConfirmButton: false })
  router.push({ name: 'ordenes-lista' })
}

function fmt(n: number): string {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

      <main v-if="orden" class="flex-1 px-12 py-10 max-[768px]:px-5 max-[768px]:py-6">
        <!-- Header -->
        <header class="flex items-center gap-4 mb-10">
          <button
            class="w-9 h-9 flex items-center justify-center text-muted dark:text-dk-muted hover:text-body dark:hover:text-dk-body cursor-pointer border-none bg-transparent transition-colors"
            @click="router.push({ name: 'ordenes-lista' })"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p class="flex-1 flex items-center gap-4">
            <h1
              class="text-[2.4rem] font-light text-body dark:text-dk-body tracking-[-0.02em] leading-none"
            >
              {{ orden.id }}
            </h1>
            <span
              class="text-[1.1rem] font-medium px-3 py-1 rounded-full"
              :class="estadoConfig[orden.estado].clase"
              >{{ estadoConfig[orden.estado].label }}</span
            >
            <span
              v-if="orden.prioridad !== 'normal'"
              class="text-[1.1rem] font-semibold"
              :class="prioridadConfig[orden.prioridad]?.clase"
              >{{ prioridadConfig[orden.prioridad]?.label }}</span
            >
          </p>
          <nav class="flex items-center gap-3">
            <button
              class="px-5 py-2.5 text-[1.2rem] font-medium text-primary border border-primary/30 bg-transparent cursor-pointer hover:bg-primary hover:text-white transition-colors"
              @click="router.push({ name: 'ordenes-editar', params: { id: orden.id } })"
            >
              Editar
            </button>
            <button
              class="px-5 py-2.5 text-[1.2rem] font-medium text-red-500 border border-red-200 dark:border-red-900/40 bg-transparent cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              @click="confirmarEliminar"
            >
              Eliminar
            </button>
          </nav>
        </header>

        <section class="grid grid-cols-[1fr_30rem] gap-14 max-[1000px]:grid-cols-1">
          <!-- Left -->
          <article class="flex flex-col gap-10">
            <!-- Cliente -->
            <section>
              <h2
                class="text-[1.1rem] font-semibold text-primary/60 uppercase tracking-[0.15em] mb-4"
              >
                Cliente
              </h2>
              <dl class="grid grid-cols-3 gap-6">
                <p>
                  <dt class="text-[1.1rem] text-muted dark:text-dk-muted block mb-1">Nombre</dt>
                  <dd class="text-[1.4rem] font-medium text-body dark:text-dk-body">
                    {{ orden.clienteNombre }}
                  </dd>
                </p>
                <p>
                  <dt class="text-[1.1rem] text-muted dark:text-dk-muted block mb-1">Telefono</dt>
                  <dd class="text-[1.4rem] font-medium text-body dark:text-dk-body">
                    {{ orden.clienteTelefono }}
                  </dd>
                </p>
                <p>
                  <dt class="text-[1.1rem] text-muted dark:text-dk-muted block mb-1">Email</dt>
                  <dd class="text-[1.4rem] font-medium text-body dark:text-dk-body">
                    {{ orden.clienteEmail }}
                  </dd>
                </p>
              </dl>
            </section>

            <!-- Vehiculo -->
            <section>
              <h2
                class="text-[1.1rem] font-semibold text-primary/60 uppercase tracking-[0.15em] mb-4"
              >
                Vehiculo
              </h2>
              <dl class="grid grid-cols-3 gap-6">
                <p>
                  <dt class="text-[1.1rem] text-muted dark:text-dk-muted block mb-1">Vehiculo</dt>
                  <dd class="text-[1.4rem] font-medium text-body dark:text-dk-body">
                    {{ orden.vehiculoNombre }}
                  </dd>
                </p>
                <p>
                  <dt class="text-[1.1rem] text-muted dark:text-dk-muted block mb-1">Placa</dt>
                  <dd class="text-[1.4rem] font-medium text-body dark:text-dk-body">
                    {{ orden.placa }}
                  </dd>
                </p>
                <p>
                  <dt class="text-[1.1rem] text-muted dark:text-dk-muted block mb-1">
                    Kilometraje
                  </dt>
                  <dd class="text-[1.4rem] font-medium text-body dark:text-dk-body">
                    <data :value="orden.kilometraje"
                      >{{ orden.kilometraje.toLocaleString() }} km</data
                    >
                  </dd>
                </p>
              </dl>
            </section>

            <!-- Diagnostico -->
            <section v-if="orden.diagnostico">
              <h2
                class="text-[1.1rem] font-semibold text-primary/60 uppercase tracking-[0.15em] mb-4"
              >
                Diagnostico
              </h2>
              <p class="text-[1.4rem] text-body dark:text-dk-body leading-relaxed">
                {{ orden.diagnostico }}
              </p>
              <p v-if="orden.notas" class="text-[1.3rem] text-muted dark:text-dk-muted mt-2">
                {{ orden.notas }}
              </p>
            </section>

            <!-- Servicios -->
            <section>
              <h2
                class="text-[1.1rem] font-semibold text-primary/60 uppercase tracking-[0.15em] mb-4"
              >
                Servicios
              </h2>
              <table class="border border-border dark:border-dk-border overflow-hidden w-full">
                <thead class="bg-bg dark:bg-dk-bg border-b border-border dark:border-dk-border">
                  <tr>
                    <th
                      class="text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider px-5 py-3 text-left"
                    >
                      Descripcion
                    </th>
                    <th
                      class="text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider px-5 py-3 text-right w-16"
                    >
                      Cant.
                    </th>
                    <th
                      class="text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider px-5 py-3 text-right w-24"
                    >
                      Precio
                    </th>
                    <th
                      class="text-[1.1rem] font-semibold text-muted dark:text-dk-muted uppercase tracking-wider px-5 py-3 text-right w-28"
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(s, i) in orden.servicios"
                    :key="i"
                    class="border-b border-border/60 dark:border-dk-border/60 last:border-b-0"
                  >
                    <td class="px-5 py-4">
                      <span
                        class="text-[1rem] uppercase tracking-wider font-medium px-2 py-0.5 rounded"
                        :class="
                          s.tipo === 'servicio'
                            ? 'text-primary bg-primary/10'
                            : 'text-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        "
                        >{{ s.tipo }}</span
                      >
                      <span class="text-[1.3rem] text-body dark:text-dk-body ml-2">{{
                        s.descripcion
                      }}</span>
                    </td>
                    <td class="text-[1.3rem] text-body dark:text-dk-body px-5 py-4 text-right">
                      <data :value="s.cantidad">{{ s.cantidad }}</data>
                    </td>
                    <td class="text-[1.3rem] text-muted dark:text-dk-muted px-5 py-4 text-right">
                      <data :value="s.precioUnitario">${{ fmt(s.precioUnitario) }}</data>
                    </td>
                    <td
                      class="text-[1.3rem] font-semibold text-body dark:text-dk-body px-5 py-4 text-right"
                    >
                      <data :value="s.cantidad * s.precioUnitario"
                        >${{ fmt(s.cantidad * s.precioUnitario) }}</data
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
              <!-- Totales -->
              <aside class="mt-4 flex flex-col items-end gap-1">
                <dl class="flex items-center gap-6">
                  <dt class="text-[1.2rem] text-muted dark:text-dk-muted">Subtotal</dt>
                  <dd class="text-[1.3rem] font-medium text-body dark:text-dk-body">
                    <data :value="calcularSubtotal(orden.servicios)"
                      >${{ fmt(calcularSubtotal(orden.servicios)) }}</data
                    >
                  </dd>
                </dl>
                <dl class="flex items-center gap-6">
                  <dt class="text-[1.2rem] text-muted dark:text-dk-muted">IVA (16%)</dt>
                  <dd class="text-[1.3rem] font-medium text-body dark:text-dk-body">
                    <data :value="calcularIVA(orden.servicios)"
                      >${{ fmt(calcularIVA(orden.servicios)) }}</data
                    >
                  </dd>
                </dl>
                <dl
                  class="flex items-center gap-6 pt-2 border-t border-border dark:border-dk-border mt-1"
                >
                  <dt class="text-[1.4rem] font-bold text-body dark:text-dk-body">Total</dt>
                  <dd class="text-[2rem] font-bold text-primary">
                    <data :value="calcularTotal(orden.servicios)"
                      >${{ fmt(calcularTotal(orden.servicios)) }}</data
                    >
                  </dd>
                </dl>
              </aside>
            </section>

            <!-- Info -->
            <footer>
              <dl class="grid grid-cols-3 gap-6">
                <p>
                  <dt class="text-[1.1rem] text-muted dark:text-dk-muted block mb-1">
                    Fecha ingreso
                  </dt>
                  <dd class="text-[1.4rem] font-medium text-body dark:text-dk-body">
                    <time :datetime="orden.fechaIngreso">{{ orden.fechaIngreso }}</time>
                  </dd>
                </p>
                <p>
                  <dt class="text-[1.1rem] text-muted dark:text-dk-muted block mb-1">
                    Fecha promesa
                  </dt>
                  <dd class="text-[1.4rem] font-medium text-body dark:text-dk-body">
                    <time v-if="orden.fechaPromesa" :datetime="orden.fechaPromesa">{{
                      orden.fechaPromesa
                    }}</time>
                    <span v-else>—</span>
                  </dd>
                </p>
                <p>
                  <dt class="text-[1.1rem] text-muted dark:text-dk-muted block mb-1">Fecha fin</dt>
                  <dd class="text-[1.4rem] font-medium text-body dark:text-dk-body">
                    <time v-if="orden.fechaFin" :datetime="orden.fechaFin">{{
                      orden.fechaFin
                    }}</time>
                    <span v-else>—</span>
                  </dd>
                </p>
                <p>
                  <dt class="text-[1.1rem] text-muted dark:text-dk-muted block mb-1">Mecanico</dt>
                  <dd class="text-[1.4rem] font-medium text-body dark:text-dk-body">
                    {{ orden.mecanico || 'Sin asignar' }}
                  </dd>
                </p>
                <p>
                  <dt class="text-[1.1rem] text-muted dark:text-dk-muted block mb-1">Anticipo</dt>
                  <dd class="text-[1.4rem] font-medium text-primary">
                    <data :value="orden.anticipo">${{ fmt(orden.anticipo) }}</data>
                  </dd>
                </p>
                <p>
                  <dt class="text-[1.1rem] text-muted dark:text-dk-muted block mb-1">Saldo</dt>
                  <dd class="text-[1.4rem] font-medium text-body dark:text-dk-body">
                    <data :value="calcularTotal(orden.servicios) - orden.anticipo"
                      >${{ fmt(calcularTotal(orden.servicios) - orden.anticipo) }}</data
                    >
                  </dd>
                </p>
              </dl>
            </footer>
          </article>

          <!-- Right: cambiar estado -->
          <aside>
            <h2
              class="text-[1.1rem] font-semibold text-primary/60 uppercase tracking-[0.15em] mb-5"
            >
              Cambiar estado
            </h2>
            <nav class="flex flex-col gap-2">
              <button
                v-for="e in estadosDisponibles"
                :key="e.valor"
                class="flex items-center gap-3 px-5 py-4 text-left text-[1.3rem] font-medium cursor-pointer border transition-colors"
                :class="
                  orden.estado === e.valor
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface dark:bg-dk-surface text-body dark:text-dk-body border-border dark:border-dk-border hover:border-primary/40'
                "
                @click="cambiarEstado(e.valor)"
              >
                <span v-if="orden.estado === e.valor" class="w-2 h-2 rounded-full bg-white"></span>
                <span v-else class="w-2 h-2 rounded-full border border-current opacity-30"></span>
                {{ e.label }}
              </button>
            </nav>
          </aside>
        </section>
      </main>

      <main v-else class="flex-1 px-12 py-10 flex items-center justify-center">
        <article class="text-center">
          <p class="text-[1.6rem] text-muted dark:text-dk-muted mb-4">Orden no encontrada</p>
          <button
            class="text-[1.3rem] font-medium text-primary cursor-pointer border-none bg-transparent"
            @click="router.push({ name: 'ordenes-lista' })"
          >
            Volver a ordenes
          </button>
        </article>
      </main>
    </div>
  </div>
</template>
