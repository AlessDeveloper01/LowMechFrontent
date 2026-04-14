<script setup lang="ts">
import { ref, computed, inject, onMounted, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  useOrdenesStore,
  calcularSubtotal,
  calcularIVA,
  calcularTotal,
  type EstadoOrden,
  type Prioridad,
  type ServicioLinea,
} from '@/stores/ordenes'
import { useVehiculosStore } from '@/stores/vehiculos'
import { useClientesStore } from '@/stores/clientes'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()
const store = useOrdenesStore()
const vehStore = useVehiculosStore()
const cliStore = useClientesStore()

const collapsed = inject<Ref<boolean>>('sidebarCollapsed')!
const darkMode = inject<Ref<boolean>>('darkMode')!

const esEdicion = computed(() => !!route.params.id)
const titulo = computed(() => (esEdicion.value ? 'Editar Orden' : 'Nueva Orden de Servicio'))

const form = ref({
  clienteNombre: '',
  clienteTelefono: '',
  clienteEmail: '',
  vehiculoNombre: '',
  placa: '',
  marca: '',
  modelo: '',
  anio: '',
  kilometraje: 0,
  servicios: [
    { tipo: 'servicio' as const, descripcion: '', cantidad: 1, precioUnitario: 0 },
  ] as ServicioLinea[],
  diagnostico: '',
  notas: '',
  fechaIngreso: new Date().toISOString().split('T')[0] ?? '',
  fechaPromesa: '',
  mecanico: '',
  prioridad: 'normal' as Prioridad,
  estado: 'pendiente' as EstadoOrden,
  anticipo: 0,
})

const errores = ref<Record<string, string>>({})
const clienteSeleccionado = ref('')
const vehiculoSeleccionado = ref('')

const clientes = computed(() =>
  cliStore.clientes.map((c) => ({
    nombre: c.nombre,
    telefono: c.telefono,
    email: c.email,
  })),
)

const mecanicos = ['Luis Hernandez', 'Roberto Diaz', 'Manuel Torres', 'Carlos Mendez']

const serviciosFrecuentes = [
  { nombre: 'Cambio de aceite 5W-30', precio: 450 },
  { nombre: 'Afinacion completa', precio: 1200 },
  { nombre: 'Revision de frenos', precio: 350 },
  { nombre: 'Diagnostico electronico', precio: 300 },
  { nombre: 'Balanceo y rotacion', precio: 250 },
]

function seleccionarCliente(nombre: string) {
  const c = clientes.value.find((x) => x.nombre === nombre)
  if (c) {
    form.value.clienteNombre = c.nombre
    form.value.clienteTelefono = c.telefono
    form.value.clienteEmail = c.email
  }
}

function seleccionarVehiculo(id: string) {
  const v = vehStore.obtenerPorId(id)
  if (v) {
    form.value.vehiculoNombre = v.nombre
    form.value.placa = v.placa
    form.value.marca = v.marca
    form.value.modelo = v.modelo
    form.value.anio = v.anio
    form.value.clienteNombre = v.clienteNombre
    form.value.clienteTelefono = v.clienteTelefono
    form.value.clienteEmail = v.clienteEmail
    const matchCliente = clientes.value.find((c) => c.nombre === v.clienteNombre)
    if (matchCliente) clienteSeleccionado.value = matchCliente.nombre
  }
}

function agregarServicio() {
  form.value.servicios.push({ tipo: 'servicio', descripcion: '', cantidad: 1, precioUnitario: 0 })
}

function eliminarServicio(idx: number) {
  if (form.value.servicios.length > 1) {
    form.value.servicios.splice(idx, 1)
  }
}

function agregarServicioFrecuente(nombre: string, precio: number) {
  form.value.servicios.push({
    tipo: 'servicio',
    descripcion: nombre,
    cantidad: 1,
    precioUnitario: precio,
  })
}

const subtotal = computed(() => calcularSubtotal(form.value.servicios))
const iva = computed(() => calcularIVA(form.value.servicios))
const total = computed(() => calcularTotal(form.value.servicios))
const saldoPendiente = computed(() => total.value - form.value.anticipo)

function validar(): boolean {
  errores.value = {}
  if (!form.value.clienteNombre.trim()) errores.value.clienteNombre = 'Selecciona un cliente'
  if (!form.value.vehiculoNombre.trim()) errores.value.vehiculoNombre = 'Selecciona un vehiculo'
  if (form.value.servicios.every((s) => !s.descripcion.trim()))
    errores.value.servicios = 'Agrega al menos un servicio'
  return Object.keys(errores.value).length === 0
}

async function guardar() {
  if (!validar()) return
  const datos = {
    clienteNombre: form.value.clienteNombre,
    clienteTelefono: form.value.clienteTelefono,
    clienteEmail: form.value.clienteEmail,
    vehiculoNombre: form.value.vehiculoNombre,
    placa: form.value.placa,
    marca: form.value.marca,
    modelo: form.value.modelo,
    anio: form.value.anio,
    kilometraje: form.value.kilometraje,
    servicios: form.value.servicios.filter((s) => s.descripcion.trim()),
    diagnostico: form.value.diagnostico,
    notas: form.value.notas,
    fechaIngreso: form.value.fechaIngreso,
    fechaPromesa: form.value.fechaPromesa,
    mecanico: form.value.mecanico,
    prioridad: form.value.prioridad,
    estado: form.value.estado,
    fechaFin: null as string | null,
    anticipo: form.value.anticipo,
  }
  if (esEdicion.value) {
    store.actualizar(route.params.id as string, datos)
  } else {
    store.crear(datos)
  }
  await Swal.fire({
    title: esEdicion.value ? 'Actualizada' : 'Creada',
    text: esEdicion.value
      ? 'La orden fue actualizada correctamente.'
      : 'La orden fue creada correctamente.',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false,
  })
  router.push({ name: 'ordenes-lista' })
}

onMounted(() => {
  if (esEdicion.value) {
    const orden = store.obtenerPorId(route.params.id as string)
    if (orden) {
      form.value = {
        clienteNombre: orden.clienteNombre,
        clienteTelefono: orden.clienteTelefono,
        clienteEmail: orden.clienteEmail,
        vehiculoNombre: orden.vehiculoNombre,
        placa: orden.placa,
        marca: orden.marca,
        modelo: orden.modelo,
        anio: orden.anio,
        kilometraje: orden.kilometraje,
        servicios: [...orden.servicios],
        diagnostico: orden.diagnostico,
        notas: orden.notas,
        fechaIngreso: orden.fechaIngreso,
        fechaPromesa: orden.fechaPromesa,
        mecanico: orden.mecanico,
        prioridad: orden.prioridad,
        estado: orden.estado,
        anticipo: orden.anticipo,
      }
      // Auto-seleccionar cliente y vehiculo
      const matchCliente = clientes.value.find((c) => c.nombre === orden.clienteNombre)
      if (matchCliente) clienteSeleccionado.value = matchCliente.nombre
      const matchVehiculo = vehStore.vehiculos.find((v) => v.nombre === orden.vehiculoNombre)
      if (matchVehiculo) vehiculoSeleccionado.value = matchVehiculo.id
    }
  }
})

function fmt(n: number): string {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

      <article class="flex-1 px-12 py-10 max-[768px]:px-5 max-[768px]:py-6">
        <!-- Header -->
        <header
          class="flex items-start justify-between mb-10 max-[768px]:flex-col max-[768px]:gap-6"
        >
          <hgroup>
            <h1
              class="text-[2.8rem] font-light text-body dark:text-dk-body tracking-[-0.03em] leading-tight"
            >
              {{ titulo }}
            </h1>
            <p class="text-[1.3rem] text-muted dark:text-dk-muted mt-1">
              Completa los campos para registrar una nueva orden
            </p>
          </hgroup>
          <nav class="flex gap-4 max-[768px]:flex-col max-[768px]:w-full">
            <button
              class="px-8 py-3 text-[1.3rem] font-semibold text-muted dark:text-dk-muted bg-transparent border border-border dark:border-dk-border cursor-pointer hover:text-body dark:hover:text-dk-body transition-colors"
              @click="router.back()"
            >
              Cancelar
            </button>
            <button
              class="px-8 py-3 text-[1.3rem] font-semibold text-white bg-primary border-none cursor-pointer hover:bg-primary-dark transition-colors"
              @click="guardar"
            >
              {{ esEdicion ? 'Guardar Cambios' : 'Guardar Orden' }}
            </button>
          </nav>
        </header>

        <!-- 3-column layout -->
        <section
          class="grid grid-cols-[1fr_28rem_24rem] gap-10 items-start max-[1200px]:grid-cols-[1fr_28rem] max-[900px]:grid-cols-1"
        >
          <!-- FORM -->
          <form class="flex flex-col gap-8" @submit.prevent="guardar">
            <!-- Cliente -->
            <section
              class="bg-surface dark:bg-dk-surface border border-border dark:border-dk-border p-10"
            >
              <header class="flex items-center justify-between mb-8">
                <h2 class="text-[1.6rem] font-bold text-body dark:text-dk-body">
                  Informacion del Cliente
                </h2>
                <button
                  type="button"
                  class="text-[1.3rem] font-semibold text-primary bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
                >
                  + Nuevo Cliente
                </button>
              </header>
              <fieldset class="grid grid-cols-2 gap-6 max-[480px]:grid-cols-1 border-0 p-0 m-0">
                <p class="flex flex-col gap-1.5 col-span-2 max-[480px]:col-span-1">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Cliente</label
                  >
                  <select
                    v-model="clienteSeleccionado"
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-bg dark:bg-dk-bg border border-border dark:border-dk-border outline-none focus:border-primary transition-colors"
                    :class="{ 'border-red-500': errores.clienteNombre }"
                    @change="seleccionarCliente(clienteSeleccionado)"
                  >
                    <option value="">Seleccionar cliente...</option>
                    <option v-for="c in clientes" :key="c.nombre" :value="c.nombre">
                      {{ c.nombre }}
                    </option>
                  </select>
                  <span v-if="errores.clienteNombre" class="text-[1.1rem] text-red-500">{{
                    errores.clienteNombre
                  }}</span>
                </p>
                <p class="flex flex-col gap-1.5">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Telefono</label
                  >
                  <input
                    v-model="form.clienteTelefono"
                    type="tel"
                    readonly
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-bg dark:bg-dk-bg border border-border dark:border-dk-border outline-none cursor-not-allowed opacity-70"
                  />
                </p>
                <p class="flex flex-col gap-1.5">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Correo Electronico</label
                  >
                  <input
                    v-model="form.clienteEmail"
                    type="email"
                    readonly
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-bg dark:bg-dk-bg border border-border dark:border-dk-border outline-none cursor-not-allowed opacity-70"
                  />
                </p>
              </fieldset>
            </section>

            <!-- Vehiculo -->
            <section
              class="bg-surface dark:bg-dk-surface border border-border dark:border-dk-border p-10"
            >
              <header class="flex items-center justify-between mb-8">
                <h2 class="text-[1.6rem] font-bold text-body dark:text-dk-body">
                  Informacion del Vehiculo
                </h2>
                <button
                  type="button"
                  class="text-[1.3rem] font-semibold text-primary bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
                >
                  + Nuevo Vehiculo
                </button>
              </header>
              <fieldset class="grid grid-cols-2 gap-6 max-[480px]:grid-cols-1 border-0 p-0 m-0">
                <p class="flex flex-col gap-1.5">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Vehiculo</label
                  >
                  <select
                    v-model="vehiculoSeleccionado"
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-bg dark:bg-dk-bg border border-border dark:border-dk-border outline-none focus:border-primary transition-colors"
                    :class="{ 'border-red-500': errores.vehiculoNombre }"
                    @change="seleccionarVehiculo(vehiculoSeleccionado)"
                  >
                    <option value="">Seleccionar vehiculo...</option>
                    <option v-for="v in vehStore.vehiculos" :key="v.id" :value="v.id">
                      {{ v.nombre }} — {{ v.placa }}
                    </option>
                  </select>
                  <span v-if="errores.vehiculoNombre" class="text-[1.1rem] text-red-500">{{
                    errores.vehiculoNombre
                  }}</span>
                </p>
                <p class="flex flex-col gap-1.5">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Placas</label
                  >
                  <input
                    v-model="form.placa"
                    type="text"
                    readonly
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-bg dark:bg-dk-bg border border-border dark:border-dk-border outline-none cursor-not-allowed opacity-70"
                  />
                </p>
                <p class="flex flex-col gap-1.5">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body">Marca</label>
                  <input
                    v-model="form.marca"
                    type="text"
                    readonly
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-bg dark:bg-dk-bg border border-border dark:border-dk-border outline-none cursor-not-allowed opacity-70"
                  />
                </p>
                <p class="flex flex-col gap-1.5">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Modelo</label
                  >
                  <input
                    v-model="form.modelo"
                    type="text"
                    readonly
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-bg dark:bg-dk-bg border border-border dark:border-dk-border outline-none cursor-not-allowed opacity-70"
                  />
                </p>
                <p class="flex flex-col gap-1.5">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body">Anio</label>
                  <input
                    v-model="form.anio"
                    type="text"
                    readonly
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-bg dark:bg-dk-bg border border-border dark:border-dk-border outline-none cursor-not-allowed opacity-70"
                  />
                </p>
                <p class="flex flex-col gap-1.5">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Kilometraje Actual</label
                  >
                  <input
                    v-model.number="form.kilometraje"
                    type="number"
                    min="0"
                    placeholder="50000"
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-surface dark:bg-dk-surface border border-border dark:border-dk-border outline-none focus:border-primary transition-colors placeholder:text-muted dark:placeholder:text-dk-muted"
                  />
                </p>
              </fieldset>
            </section>

            <!-- Servicios -->
            <section
              class="bg-surface dark:bg-dk-surface border border-border dark:border-dk-border p-10"
            >
              <header class="flex items-center justify-between mb-8">
                <h2 class="text-[1.6rem] font-bold text-body dark:text-dk-body">
                  Servicios y Refacciones
                </h2>
                <button
                  type="button"
                  class="text-[1.3rem] font-semibold text-primary bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
                  @click="agregarServicio"
                >
                  + Agregar Servicio
                </button>
              </header>
              <p v-if="errores.servicios" class="text-[1.1rem] text-red-500 mb-4">
                {{ errores.servicios }}
              </p>
              <section class="overflow-x-auto -mx-10 px-10">
                <table class="w-full border-collapse min-w-[56rem]">
                  <thead>
                    <tr class="border-b border-border dark:border-dk-border">
                      <th
                        class="px-4 py-3 text-[1.1rem] font-semibold text-muted dark:text-dk-muted text-left uppercase tracking-wider"
                      >
                        Tipo
                      </th>
                      <th
                        class="px-4 py-3 text-[1.1rem] font-semibold text-muted dark:text-dk-muted text-left uppercase tracking-wider"
                      >
                        Descripcion
                      </th>
                      <th
                        class="px-4 py-3 text-[1.1rem] font-semibold text-muted dark:text-dk-muted text-left uppercase tracking-wider w-20"
                      >
                        Cant.
                      </th>
                      <th
                        class="px-4 py-3 text-[1.1rem] font-semibold text-muted dark:text-dk-muted text-left uppercase tracking-wider w-28"
                      >
                        Precio
                      </th>
                      <th
                        class="px-4 py-3 text-[1.1rem] font-semibold text-muted dark:text-dk-muted text-left uppercase tracking-wider w-28"
                      >
                        Total
                      </th>
                      <th class="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(s, i) in form.servicios"
                      :key="i"
                      class="border-b border-border/50 dark:border-dk-border/50 hover:bg-bg dark:hover:bg-dk-bg transition-colors"
                    >
                      <td class="p-3">
                        <select
                          v-model="s.tipo"
                          class="w-full px-3 py-2.5 text-[1.3rem] text-body dark:text-dk-body bg-surface dark:bg-dk-surface border border-border dark:border-dk-border outline-none focus:border-primary transition-colors"
                        >
                          <option value="servicio">Servicio</option>
                          <option value="refaccion">Refaccion</option>
                        </select>
                      </td>
                      <td class="p-3">
                        <input
                          v-model="s.descripcion"
                          type="text"
                          placeholder="Descripcion del servicio"
                          class="w-full px-3 py-2.5 text-[1.3rem] text-body dark:text-dk-body bg-surface dark:bg-dk-surface border border-border dark:border-dk-border outline-none focus:border-primary transition-colors placeholder:text-muted dark:placeholder:text-dk-muted"
                        />
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="s.cantidad"
                          type="number"
                          min="1"
                          class="w-full px-3 py-2.5 text-[1.3rem] text-body dark:text-dk-body bg-surface dark:bg-dk-surface border border-border dark:border-dk-border outline-none focus:border-primary transition-colors"
                        />
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="s.precioUnitario"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          class="w-full px-3 py-2.5 text-[1.3rem] text-body dark:text-dk-body bg-surface dark:bg-dk-surface border border-border dark:border-dk-border outline-none focus:border-primary transition-colors"
                        />
                      </td>
                      <td class="p-3 text-[1.4rem] font-bold text-body dark:text-dk-body">
                        ${{ fmt(s.cantidad * s.precioUnitario) }}
                      </td>
                      <td class="p-3 text-center">
                        <button
                          type="button"
                          title="Eliminar"
                          class="w-8 h-8 inline-flex items-center justify-center text-[2rem] text-muted dark:text-dk-muted bg-transparent border-none cursor-pointer leading-none hover:text-red-500 transition-colors"
                          @click="eliminarServicio(i)"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </section>

            <!-- Info adicional -->
            <section
              class="bg-surface dark:bg-dk-surface border border-border dark:border-dk-border p-10"
            >
              <h2 class="text-[1.6rem] font-bold text-body dark:text-dk-body mb-8">
                Informacion Adicional
              </h2>
              <fieldset class="grid grid-cols-2 gap-6 max-[480px]:grid-cols-1 border-0 p-0 m-0">
                <p class="flex flex-col gap-1.5 col-span-2 max-[480px]:col-span-1">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Diagnostico / Motivo de Ingreso</label
                  >
                  <textarea
                    v-model="form.diagnostico"
                    rows="3"
                    placeholder="Describa el diagnostico o motivo por el cual ingresa el vehiculo..."
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-surface dark:bg-dk-surface border border-border dark:border-dk-border outline-none focus:border-primary transition-colors resize-none placeholder:text-muted dark:placeholder:text-dk-muted"
                  ></textarea>
                </p>
                <p class="flex flex-col gap-1.5 col-span-2 max-[480px]:col-span-1">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Notas Internas</label
                  >
                  <textarea
                    v-model="form.notas"
                    rows="2"
                    placeholder="Notas o comentarios adicionales (no visible para el cliente)"
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-surface dark:bg-dk-surface border border-border dark:border-dk-border outline-none focus:border-primary transition-colors resize-none placeholder:text-muted dark:placeholder:text-dk-muted"
                  ></textarea>
                </p>
                <p class="flex flex-col gap-1.5">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Fecha de Ingreso</label
                  >
                  <input
                    v-model="form.fechaIngreso"
                    type="date"
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-surface dark:bg-dk-surface border border-border dark:border-dk-border outline-none focus:border-primary transition-colors"
                  />
                </p>
                <p class="flex flex-col gap-1.5">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Fecha Promesa de Entrega</label
                  >
                  <input
                    v-model="form.fechaPromesa"
                    type="date"
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-surface dark:bg-dk-surface border border-border dark:border-dk-border outline-none focus:border-primary transition-colors"
                  />
                </p>
                <p class="flex flex-col gap-1.5">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Mecanico Asignado</label
                  >
                  <select
                    v-model="form.mecanico"
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-surface dark:bg-dk-surface border border-border dark:border-dk-border outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Sin asignar</option>
                    <option v-for="m in mecanicos" :key="m" :value="m">{{ m }}</option>
                  </select>
                </p>
                <p class="flex flex-col gap-1.5">
                  <label class="text-[1.2rem] font-medium text-body dark:text-dk-body"
                    >Prioridad</label
                  >
                  <select
                    v-model="form.prioridad"
                    class="px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-surface dark:bg-dk-surface border border-border dark:border-dk-border outline-none focus:border-primary transition-colors"
                  >
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </p>
              </fieldset>
            </section>
          </form>

          <!-- RESUMEN -->
          <aside
            class="sticky top-[calc(6.5rem+2rem)] bg-surface dark:bg-dk-surface border border-border dark:border-dk-border p-8 self-start max-[900px]:static"
          >
            <h3 class="text-[1.6rem] font-bold text-body dark:text-dk-body mb-6">
              Resumen de la Orden
            </h3>
            <p
              class="flex justify-between items-center py-4 border-b border-border dark:border-dk-border"
            >
              <span class="text-[1.3rem] text-muted dark:text-dk-muted">Subtotal</span>
              <span class="text-[1.3rem] font-semibold text-body dark:text-dk-body"
                >${{ fmt(subtotal) }}</span
              >
            </p>
            <p
              class="flex justify-between items-center py-4 border-b border-border dark:border-dk-border"
            >
              <span class="text-[1.3rem] text-muted dark:text-dk-muted">IVA (16%)</span>
              <span class="text-[1.3rem] font-semibold text-body dark:text-dk-body"
                >${{ fmt(iva) }}</span
              >
            </p>
            <p class="flex justify-between items-center py-5">
              <span class="text-[1.5rem] font-bold text-body dark:text-dk-body">Total</span>
              <span class="text-[2rem] font-bold text-primary">${{ fmt(total) }}</span>
            </p>
            <p class="flex flex-col gap-1.5 pt-6 border-t border-border dark:border-dk-border">
              <label class="text-[1.2rem] font-medium text-body dark:text-dk-body">Anticipo</label>
              <input
                v-model.number="form.anticipo"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="w-full px-4 py-3 text-[1.4rem] text-body dark:text-dk-body bg-bg dark:bg-dk-bg border border-border dark:border-dk-border outline-none focus:border-primary transition-colors"
              />
            </p>
            <p class="flex justify-between items-center py-4 mt-1">
              <span class="text-[1.3rem] text-muted dark:text-dk-muted">Saldo Pendiente</span>
              <span class="text-[1.4rem] font-semibold text-primary"
                >${{ fmt(saldoPendiente) }}</span
              >
            </p>
            <button
              type="button"
              class="mt-6 w-full py-3.5 text-[1.3rem] font-semibold text-white bg-primary border-none cursor-pointer hover:bg-primary-dark transition-colors"
              @click="guardar"
            >
              {{ esEdicion ? 'Guardar Cambios' : 'Guardar Orden' }}
            </button>
          </aside>

          <!-- PROMOCIONES -->
          <aside
            class="sticky top-[calc(6.5rem+2rem)] self-start flex flex-col gap-6 max-[1200px]:hidden"
          >
            <section
              class="bg-surface dark:bg-dk-surface border border-border dark:border-dk-border p-8"
            >
              <header class="flex items-center justify-between mb-6">
                <h3 class="text-[1.6rem] font-bold text-body dark:text-dk-body">Promociones</h3>
                <span
                  class="text-[1rem] font-semibold text-primary uppercase tracking-wider bg-primary/8 px-3 py-1 rounded-full"
                  >Activas</span
                >
              </header>
              <article
                class="border border-border dark:border-dk-border bg-bg dark:bg-dk-bg p-5 mb-3 relative overflow-hidden cursor-pointer hover:border-primary transition-colors"
              >
                <span class="absolute top-0 left-0 w-full h-[3px] bg-primary"></span>
                <header class="flex items-start justify-between gap-3 mb-2">
                  <p class="text-[1.3rem] font-bold text-body dark:text-dk-body leading-snug">
                    Mantenimiento Basico
                  </p>
                  <span class="shrink-0 text-[1.6rem] font-black text-primary">20%</span>
                </header>
                <p class="text-[1.1rem] text-muted dark:text-dk-muted mb-3">
                  Aceite + filtro + 21 puntos. Vehiculos hasta 2020.
                </p>
                <footer class="flex items-center justify-between">
                  <time class="text-[1rem] text-muted dark:text-dk-muted">Vence 28/02</time>
                  <button
                    type="button"
                    class="text-[1.1rem] font-semibold text-primary border-none bg-transparent cursor-pointer hover:opacity-70"
                  >
                    Aplicar
                  </button>
                </footer>
              </article>
              <article
                class="border border-border dark:border-dk-border bg-bg dark:bg-dk-bg p-5 mb-3 relative overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
              >
                <span class="absolute top-0 left-0 w-full h-[3px] bg-blue-600"></span>
                <header class="flex items-start justify-between gap-3 mb-2">
                  <p class="text-[1.3rem] font-bold text-body dark:text-dk-body leading-snug">
                    Cliente Frecuente
                  </p>
                  <span class="shrink-0 text-[1.6rem] font-black text-blue-500">15%</span>
                </header>
                <p class="text-[1.1rem] text-muted dark:text-dk-muted mb-3">
                  3+ servicios en 6 meses.
                </p>
                <footer class="flex items-center justify-between">
                  <time class="text-[1rem] text-muted dark:text-dk-muted">Vence 31/03</time>
                  <button
                    type="button"
                    class="text-[1.1rem] font-semibold text-blue-500 border-none bg-transparent cursor-pointer hover:opacity-70"
                  >
                    Aplicar
                  </button>
                </footer>
              </article>
              <article
                class="border border-border dark:border-dk-border bg-bg dark:bg-dk-bg p-5 relative overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors"
              >
                <span class="absolute top-0 left-0 w-full h-[3px] bg-emerald-500"></span>
                <header class="flex items-start justify-between gap-3 mb-2">
                  <p class="text-[1.3rem] font-bold text-body dark:text-dk-body leading-snug">
                    Frenos Gratis
                  </p>
                  <span class="shrink-0 text-[1.6rem] font-black text-emerald-500">0</span>
                </header>
                <p class="text-[1.1rem] text-muted dark:text-dk-muted mb-3">
                  Con cualquier servicio de motor.
                </p>
                <footer class="flex items-center justify-between">
                  <time class="text-[1rem] text-muted dark:text-dk-muted">Vence 15/03</time>
                  <button
                    type="button"
                    class="text-[1.1rem] font-semibold text-emerald-500 border-none bg-transparent cursor-pointer hover:opacity-70"
                  >
                    Aplicar
                  </button>
                </footer>
              </article>
            </section>

            <!-- Servicios frecuentes -->
            <section
              class="bg-surface dark:bg-dk-surface border border-border dark:border-dk-border p-8"
            >
              <h3 class="text-[1.4rem] font-bold text-body dark:text-dk-body mb-5">
                Servicios Frecuentes
              </h3>
              <nav class="flex flex-col gap-2">
                <button
                  v-for="sf in serviciosFrecuentes"
                  :key="sf.nombre"
                  type="button"
                  class="flex items-center justify-between w-full px-4 py-3 text-left bg-bg dark:bg-dk-bg border border-border dark:border-dk-border hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
                  @click="agregarServicioFrecuente(sf.nombre, sf.precio)"
                >
                  <span class="text-[1.2rem] font-medium text-body dark:text-dk-body">{{
                    sf.nombre
                  }}</span>
                  <span class="text-[1.2rem] font-bold text-primary">${{ sf.precio }}</span>
                </button>
              </nav>
            </section>
          </aside>
        </section>
      </article>
    </section>
  </main>
</template>
