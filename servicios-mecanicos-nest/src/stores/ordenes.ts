import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export type EstadoOrden = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'
export type Prioridad = 'normal' | 'alta' | 'urgente'

export interface ServicioLinea {
  tipo: 'servicio' | 'refaccion'
  descripcion: string
  cantidad: number
  precioUnitario: number
}

export interface Orden {
  id: string
  // Cliente
  clienteNombre: string
  clienteTelefono: string
  clienteEmail: string
  // Vehiculo
  vehiculoNombre: string
  placa: string
  marca: string
  modelo: string
  anio: string
  kilometraje: number
  // Servicios
  servicios: ServicioLinea[]
  // Info adicional
  diagnostico: string
  notas: string
  fechaIngreso: string
  fechaPromesa: string
  mecanico: string
  prioridad: Prioridad
  // Estado
  estado: EstadoOrden
  fechaFin: string | null
  // Finanzas
  anticipo: number
}

type OrdenInput = Omit<Orden, 'id'>

const STORAGE_KEY = 'lowmech_ordenes_v2'

function cargarOrdenes(): Orden[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        const primero = parsed[0] as Record<string, unknown>
        if ('servicios' in primero && 'clienteNombre' in primero && 'vehiculoNombre' in primero) {
          return parsed as Orden[]
        }
      }
    }
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datosIniciales))
  return datosIniciales
}

function generarId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000
  return `#ORD-2026-${num}`
}

const datosIniciales: Orden[] = [
  {
    id: '#ORD-2026-0145',
    clienteNombre: 'Carlos Ramirez',
    clienteTelefono: '555-123-4567',
    clienteEmail: 'carlos@email.com',
    vehiculoNombre: 'Toyota Corolla 2020',
    placa: 'ABC-123-D',
    marca: 'Toyota',
    modelo: 'Corolla',
    anio: '2020',
    kilometraje: 45000,
    servicios: [
      { tipo: 'servicio', descripcion: 'Cambio de aceite 5W-30', cantidad: 1, precioUnitario: 450 },
      {
        tipo: 'refaccion',
        descripcion: 'Filtro de aceite premium',
        cantidad: 1,
        precioUnitario: 280,
      },
      {
        tipo: 'servicio',
        descripcion: 'Revision general 21 puntos',
        cantidad: 1,
        precioUnitario: 350,
      },
    ],
    diagnostico: 'Mantenimiento preventivo por kilometraje',
    notas: 'Cliente frecuente, aplicar descuento',
    fechaIngreso: '2026-02-15',
    fechaPromesa: '2026-02-16',
    mecanico: 'Luis Hernandez',
    prioridad: 'normal',
    estado: 'en_proceso',
    fechaFin: null,
    anticipo: 500,
  },
  {
    id: '#ORD-2026-0146',
    clienteNombre: 'Maria Lopez',
    clienteTelefono: '555-987-6543',
    clienteEmail: 'maria@email.com',
    vehiculoNombre: 'Honda Civic 2019',
    placa: 'XYZ-789-F',
    marca: 'Honda',
    modelo: 'Civic',
    anio: '2019',
    kilometraje: 62000,
    servicios: [
      {
        tipo: 'servicio',
        descripcion: 'Reparacion de transmision',
        cantidad: 1,
        precioUnitario: 6500,
      },
      { tipo: 'refaccion', descripcion: 'Kit de clutch', cantidad: 1, precioUnitario: 2000 },
    ],
    diagnostico: 'Transmision presenta ruido al cambiar de marcha',
    notas: 'Esperando refacciones',
    fechaIngreso: '2026-02-16',
    fechaPromesa: '2026-02-20',
    mecanico: 'Roberto Diaz',
    prioridad: 'alta',
    estado: 'pendiente',
    fechaFin: null,
    anticipo: 3000,
  },
  {
    id: '#ORD-2026-0147',
    clienteNombre: 'Ana Garcia',
    clienteTelefono: '555-456-7890',
    clienteEmail: 'ana@email.com',
    vehiculoNombre: 'Nissan Sentra 2018',
    placa: 'GHI-321-H',
    marca: 'Nissan',
    modelo: 'Sentra',
    anio: '2018',
    kilometraje: 78000,
    servicios: [
      { tipo: 'servicio', descripcion: 'Afinacion completa', cantidad: 1, precioUnitario: 1200 },
      { tipo: 'refaccion', descripcion: 'Bujias NGK (4 pzas)', cantidad: 4, precioUnitario: 180 },
      { tipo: 'refaccion', descripcion: 'Filtro de aire', cantidad: 1, precioUnitario: 320 },
    ],
    diagnostico: 'Afinacion por kilometraje programado',
    notas: '',
    fechaIngreso: '2026-02-14',
    fechaPromesa: '2026-02-14',
    mecanico: 'Manuel Torres',
    prioridad: 'normal',
    estado: 'completado',
    fechaFin: '2026-02-14',
    anticipo: 3200,
  },
  {
    id: '#ORD-2026-0148',
    clienteNombre: 'Jose Martinez',
    clienteTelefono: '555-321-0987',
    clienteEmail: 'jose@email.com',
    vehiculoNombre: 'Ford F-150 2021',
    placa: 'DEF-456-G',
    marca: 'Ford',
    modelo: 'F-150',
    anio: '2021',
    kilometraje: 35000,
    servicios: [
      { tipo: 'servicio', descripcion: 'Diagnostico de motor', cantidad: 1, precioUnitario: 800 },
      {
        tipo: 'servicio',
        descripcion: 'Diagnostico sistema electrico',
        cantidad: 1,
        precioUnitario: 700,
      },
    ],
    diagnostico: 'Check engine encendido, se requiere diagnostico',
    notas: 'Diagnostico inicial, cotizar reparacion',
    fechaIngreso: '2026-02-17',
    fechaPromesa: '2026-02-18',
    mecanico: 'Luis Hernandez',
    prioridad: 'normal',
    estado: 'pendiente',
    fechaFin: null,
    anticipo: 0,
  },
]

export const useOrdenesStore = defineStore('ordenes', () => {
  const ordenes = ref<Orden[]>(cargarOrdenes())

  watch(
    ordenes,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  const totalOrdenes = computed(() => ordenes.value.length)
  const ordenesPendientes = computed(
    () => ordenes.value.filter((o) => o.estado === 'pendiente').length,
  )
  const ordenesEnProceso = computed(
    () => ordenes.value.filter((o) => o.estado === 'en_proceso').length,
  )
  const ordenesCompletadas = computed(
    () => ordenes.value.filter((o) => o.estado === 'completado').length,
  )
  const ingresosTotales = computed(() =>
    ordenes.value
      .filter((o) => o.estado === 'completado')
      .reduce((sum, o) => sum + calcularTotal(o.servicios), 0),
  )

  function obtenerPorId(id: string): Orden | undefined {
    return ordenes.value.find((o) => o.id === id)
  }

  function crear(datos: OrdenInput): Orden {
    const nueva: Orden = { ...datos, id: generarId() }
    ordenes.value.unshift(nueva)
    return nueva
  }

  function actualizar(id: string, datos: Partial<OrdenInput>): boolean {
    const idx = ordenes.value.findIndex((o) => o.id === id)
    if (idx === -1) return false
    const actual = ordenes.value[idx]!
    ordenes.value[idx] = {
      id: actual.id,
      clienteNombre: datos.clienteNombre ?? actual.clienteNombre,
      clienteTelefono: datos.clienteTelefono ?? actual.clienteTelefono,
      clienteEmail: datos.clienteEmail ?? actual.clienteEmail,
      vehiculoNombre: datos.vehiculoNombre ?? actual.vehiculoNombre,
      placa: datos.placa ?? actual.placa,
      marca: datos.marca ?? actual.marca,
      modelo: datos.modelo ?? actual.modelo,
      anio: datos.anio ?? actual.anio,
      kilometraje: datos.kilometraje ?? actual.kilometraje,
      servicios: datos.servicios ?? actual.servicios,
      diagnostico: datos.diagnostico ?? actual.diagnostico,
      notas: datos.notas ?? actual.notas,
      fechaIngreso: datos.fechaIngreso ?? actual.fechaIngreso,
      fechaPromesa: datos.fechaPromesa ?? actual.fechaPromesa,
      mecanico: datos.mecanico ?? actual.mecanico,
      prioridad: datos.prioridad ?? actual.prioridad,
      estado: datos.estado ?? actual.estado,
      fechaFin: datos.fechaFin !== undefined ? datos.fechaFin : actual.fechaFin,
      anticipo: datos.anticipo ?? actual.anticipo,
    }
    return true
  }

  function eliminar(id: string): boolean {
    const idx = ordenes.value.findIndex((o) => o.id === id)
    if (idx === -1) return false
    ordenes.value.splice(idx, 1)
    return true
  }

  function cambiarEstado(id: string, estado: EstadoOrden): boolean {
    const idx = ordenes.value.findIndex((o) => o.id === id)
    if (idx === -1) return false
    const orden = ordenes.value[idx]!
    orden.estado = estado
    if (estado === 'completado') {
      orden.fechaFin = new Date().toISOString().split('T')[0] ?? null
    }
    return true
  }

  return {
    ordenes,
    totalOrdenes,
    ordenesPendientes,
    ordenesEnProceso,
    ordenesCompletadas,
    ingresosTotales,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    cambiarEstado,
  }
})

export function calcularSubtotal(servicios: ServicioLinea[]): number {
  return servicios.reduce((sum, s) => sum + s.cantidad * s.precioUnitario, 0)
}

export function calcularIVA(servicios: ServicioLinea[]): number {
  return calcularSubtotal(servicios) * 0.16
}

export function calcularTotal(servicios: ServicioLinea[]): number {
  return calcularSubtotal(servicios) + calcularIVA(servicios)
}
