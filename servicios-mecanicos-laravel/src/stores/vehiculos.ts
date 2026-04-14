import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export type EstadoVehiculo = 'en_taller' | 'disponible' | 'en_espera'

export interface Vehiculo {
  id: string
  nombre: string
  marca: string
  modelo: string
  anio: string
  placa: string
  color: string
  vin: string
  kilometraje: number
  combustible: string
  clienteNombre: string
  clienteTelefono: string
  clienteEmail: string
  estado: EstadoVehiculo
  notas: string
}

type VehiculoInput = Omit<Vehiculo, 'id'>

const STORAGE_KEY = 'lowmech_vehiculos_v1'

function cargarVehiculos(): Vehiculo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        const primero = parsed[0] as Record<string, unknown>
        if ('marca' in primero && 'placa' in primero && 'clienteNombre' in primero) {
          return parsed as Vehiculo[]
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
  return `#VHC-2026-${num}`
}

const datosIniciales: Vehiculo[] = [
  {
    id: '#VHC-001',
    nombre: 'Toyota Corolla 2020',
    marca: 'Toyota',
    modelo: 'Corolla',
    anio: '2020',
    placa: 'ABC-123-D',
    color: 'Blanco',
    vin: '2T1BURHE8KC123456',
    kilometraje: 45230,
    combustible: 'Gasolina',
    clienteNombre: 'Carlos Ramirez',
    clienteTelefono: '555-123-4567',
    clienteEmail: 'carlos@email.com',
    estado: 'en_taller',
    notas: 'Cliente frecuente, mantener aceite sintetico',
  },
  {
    id: '#VHC-002',
    nombre: 'Honda Civic 2019',
    marca: 'Honda',
    modelo: 'Civic',
    anio: '2019',
    placa: 'XYZ-789-F',
    color: 'Negro',
    vin: '2HGFC2F59KH543210',
    kilometraje: 62000,
    combustible: 'Gasolina',
    clienteNombre: 'Maria Lopez',
    clienteTelefono: '555-987-6543',
    clienteEmail: 'maria@email.com',
    estado: 'en_taller',
    notas: '',
  },
  {
    id: '#VHC-003',
    nombre: 'Nissan Sentra 2018',
    marca: 'Nissan',
    modelo: 'Sentra',
    anio: '2018',
    placa: 'GHI-321-H',
    color: 'Gris',
    vin: '3N1AB7AP8JY654321',
    kilometraje: 78000,
    combustible: 'Gasolina',
    clienteNombre: 'Ana Garcia',
    clienteTelefono: '555-456-7890',
    clienteEmail: 'ana@email.com',
    estado: 'disponible',
    notas: 'Ultimo servicio: afinacion completa',
  },
  {
    id: '#VHC-004',
    nombre: 'Ford F-150 2021',
    marca: 'Ford',
    modelo: 'F-150',
    anio: '2021',
    placa: 'DEF-456-G',
    color: 'Azul',
    vin: '1FTFW1E86MFA12345',
    kilometraje: 35000,
    combustible: 'Gasolina',
    clienteNombre: 'Jose Martinez',
    clienteTelefono: '555-321-0987',
    clienteEmail: 'jose@email.com',
    estado: 'en_espera',
    notas: 'Esperando refacciones de motor',
  },
  {
    id: '#VHC-005',
    nombre: 'Mazda 3 2022',
    marca: 'Mazda',
    modelo: '3',
    anio: '2022',
    placa: 'JKL-654-M',
    color: 'Rojo',
    vin: '3MZBM1M70NM789012',
    kilometraje: 18500,
    combustible: 'Gasolina',
    clienteNombre: 'Pedro Sanchez',
    clienteTelefono: '555-789-0123',
    clienteEmail: 'pedro@email.com',
    estado: 'disponible',
    notas: 'Vehiculo nuevo, primer servicio pendiente',
  },
]

export const useVehiculosStore = defineStore('vehiculos', () => {
  const vehiculos = ref<Vehiculo[]>(cargarVehiculos())

  watch(
    vehiculos,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  const totalVehiculos = computed(() => vehiculos.value.length)
  const vehiculosEnTaller = computed(
    () => vehiculos.value.filter((v) => v.estado === 'en_taller').length,
  )
  const vehiculosDisponibles = computed(
    () => vehiculos.value.filter((v) => v.estado === 'disponible').length,
  )

  function obtenerPorId(id: string): Vehiculo | undefined {
    return vehiculos.value.find((v) => v.id === id)
  }

  function crear(datos: VehiculoInput): Vehiculo {
    const nuevo: Vehiculo = { ...datos, id: generarId() }
    vehiculos.value.unshift(nuevo)
    return nuevo
  }

  function actualizar(id: string, datos: Partial<VehiculoInput>): boolean {
    const idx = vehiculos.value.findIndex((v) => v.id === id)
    if (idx === -1) return false
    const actual = vehiculos.value[idx]!
    vehiculos.value[idx] = {
      id: actual.id,
      nombre: datos.nombre ?? actual.nombre,
      marca: datos.marca ?? actual.marca,
      modelo: datos.modelo ?? actual.modelo,
      anio: datos.anio ?? actual.anio,
      placa: datos.placa ?? actual.placa,
      color: datos.color ?? actual.color,
      vin: datos.vin ?? actual.vin,
      kilometraje: datos.kilometraje ?? actual.kilometraje,
      combustible: datos.combustible ?? actual.combustible,
      clienteNombre: datos.clienteNombre ?? actual.clienteNombre,
      clienteTelefono: datos.clienteTelefono ?? actual.clienteTelefono,
      clienteEmail: datos.clienteEmail ?? actual.clienteEmail,
      estado: datos.estado ?? actual.estado,
      notas: datos.notas ?? actual.notas,
    }
    return true
  }

  function eliminar(id: string): boolean {
    const idx = vehiculos.value.findIndex((v) => v.id === id)
    if (idx === -1) return false
    vehiculos.value.splice(idx, 1)
    return true
  }

  return {
    vehiculos,
    totalVehiculos,
    vehiculosEnTaller,
    vehiculosDisponibles,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
  }
})
