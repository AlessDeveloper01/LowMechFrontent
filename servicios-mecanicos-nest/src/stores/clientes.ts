import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  email: string
  direccion: string
  rfc: string
  notas: string
}

type ClienteInput = Omit<Cliente, 'id'>

const STORAGE_KEY = 'lowmech_clientes_v1'

function cargarClientes(): Cliente[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        const primero = parsed[0] as Record<string, unknown>
        if ('nombre' in primero && 'telefono' in primero && 'email' in primero) {
          return parsed as Cliente[]
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
  return `#CLT-2026-${num}`
}

const datosIniciales: Cliente[] = [
  {
    id: '#CLT-001',
    nombre: 'Carlos Ramirez',
    telefono: '555-123-4567',
    email: 'carlos@email.com',
    direccion: 'Av. Reforma 123, Col. Centro',
    rfc: 'RABC850312AB1',
    notas: 'Cliente frecuente, prefiere aceite sintetico',
  },
  {
    id: '#CLT-002',
    nombre: 'Maria Lopez',
    telefono: '555-987-6543',
    email: 'maria@email.com',
    direccion: 'Calle Juarez 456, Col. Norte',
    rfc: 'LOPM900515CD2',
    notas: '',
  },
  {
    id: '#CLT-003',
    nombre: 'Ana Garcia',
    telefono: '555-456-7890',
    email: 'ana@email.com',
    direccion: 'Blvd. Insurgentes 789, Col. Sur',
    rfc: 'GAAA880720EF3',
    notas: 'Siempre pide factura',
  },
  {
    id: '#CLT-004',
    nombre: 'Jose Martinez',
    telefono: '555-321-0987',
    email: 'jose@email.com',
    direccion: 'Av. Universidad 321, Col. Del Valle',
    rfc: 'MAJM750101GH4',
    notas: 'Tiene 2 vehiculos registrados',
  },
  {
    id: '#CLT-005',
    nombre: 'Pedro Sanchez',
    telefono: '555-789-0123',
    email: 'pedro@email.com',
    direccion: 'Calle Morelos 654, Col. Industrial',
    rfc: 'SAPR920909IJ5',
    notas: '',
  },
]

export const useClientesStore = defineStore('clientes', () => {
  const clientes = ref<Cliente[]>(cargarClientes())

  watch(
    clientes,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  const totalClientes = computed(() => clientes.value.length)

  function obtenerPorId(id: string): Cliente | undefined {
    return clientes.value.find((c) => c.id === id)
  }

  function obtenerPorNombre(nombre: string): Cliente | undefined {
    return clientes.value.find((c) => c.nombre === nombre)
  }

  function crear(datos: ClienteInput): Cliente {
    const nuevo: Cliente = { ...datos, id: generarId() }
    clientes.value.unshift(nuevo)
    return nuevo
  }

  function actualizar(id: string, datos: Partial<ClienteInput>): boolean {
    const idx = clientes.value.findIndex((c) => c.id === id)
    if (idx === -1) return false
    const actual = clientes.value[idx]!
    clientes.value[idx] = {
      id: actual.id,
      nombre: datos.nombre ?? actual.nombre,
      telefono: datos.telefono ?? actual.telefono,
      email: datos.email ?? actual.email,
      direccion: datos.direccion ?? actual.direccion,
      rfc: datos.rfc ?? actual.rfc,
      notas: datos.notas ?? actual.notas,
    }
    return true
  }

  function eliminar(id: string): boolean {
    const idx = clientes.value.findIndex((c) => c.id === id)
    if (idx === -1) return false
    clientes.value.splice(idx, 1)
    return true
  }

  return {
    clientes,
    totalClientes,
    obtenerPorId,
    obtenerPorNombre,
    crear,
    actualizar,
    eliminar,
  }
})
