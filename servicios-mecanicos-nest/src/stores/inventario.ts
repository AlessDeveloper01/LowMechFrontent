import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export type EstadoStock = 'critico' | 'bajo' | 'normal'

export interface ItemInventario {
  id: string
  nombre: string
  sku: string
  categoria: string
  stock: number
  stockMinimo: number
  unidad: string
  precioCompra: number
  precioVenta: number
  proveedor: string
  ubicacion: string
  notas: string
}

type ItemInput = Omit<ItemInventario, 'id'>

const STORAGE_KEY = 'lowmech_inventario_v1'

function cargarItems(): ItemInventario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        const primero = parsed[0] as Record<string, unknown>
        if ('sku' in primero && 'stock' in primero && 'categoria' in primero) {
          return parsed as ItemInventario[]
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
  return `#INV-${num}`
}

const datosIniciales: ItemInventario[] = [
  {
    id: '#INV-001',
    nombre: 'Aceite Sintetico 5W-30',
    sku: 'OIL-5W30-001',
    categoria: 'Aceites',
    stock: 3,
    stockMinimo: 10,
    unidad: 'Litros',
    precioCompra: 85,
    precioVenta: 120,
    proveedor: 'Lubricantes SA',
    ubicacion: 'Estante A-1',
    notas: '',
  },
  {
    id: '#INV-002',
    nombre: 'Filtro de Aceite Premium',
    sku: 'FLT-OIL-001',
    categoria: 'Filtros',
    stock: 2,
    stockMinimo: 8,
    unidad: 'Piezas',
    precioCompra: 150,
    precioVenta: 220,
    proveedor: 'Filtros del Norte',
    ubicacion: 'Estante B-2',
    notas: 'Compatible con Toyota/Honda',
  },
  {
    id: '#INV-003',
    nombre: 'Pastillas de Freno Delanteras',
    sku: 'BRK-FRT-001',
    categoria: 'Frenos',
    stock: 5,
    stockMinimo: 6,
    unidad: 'Pares',
    precioCompra: 280,
    precioVenta: 450,
    proveedor: 'Frenos MX',
    ubicacion: 'Estante C-1',
    notas: '',
  },
  {
    id: '#INV-004',
    nombre: 'Bujias NGK Platinum',
    sku: 'SPK-NGK-001',
    categoria: 'Encendido',
    stock: 8,
    stockMinimo: 12,
    unidad: 'Piezas',
    precioCompra: 120,
    precioVenta: 180,
    proveedor: 'NGK Distribuidores',
    ubicacion: 'Estante D-3',
    notas: '',
  },
  {
    id: '#INV-005',
    nombre: 'Correa de Distribucion',
    sku: 'BLT-DIS-001',
    categoria: 'Transmision',
    stock: 1,
    stockMinimo: 4,
    unidad: 'Piezas',
    precioCompra: 450,
    precioVenta: 750,
    proveedor: 'Gates Mexico',
    ubicacion: 'Estante E-1',
    notas: '',
  },
  {
    id: '#INV-006',
    nombre: 'Anticongelante Concentrado',
    sku: 'CLT-CON-001',
    categoria: 'Liquidos',
    stock: 6,
    stockMinimo: 8,
    unidad: 'Litros',
    precioCompra: 95,
    precioVenta: 140,
    proveedor: 'Lubricantes SA',
    ubicacion: 'Estante A-3',
    notas: '',
  },
  {
    id: '#INV-007',
    nombre: 'Filtro de Aire',
    sku: 'FLT-AIR-001',
    categoria: 'Filtros',
    stock: 10,
    stockMinimo: 6,
    unidad: 'Piezas',
    precioCompra: 180,
    precioVenta: 280,
    proveedor: 'Filtros del Norte',
    ubicacion: 'Estante B-1',
    notas: '',
  },
  {
    id: '#INV-008',
    nombre: 'Pastillas de Freno Traseras',
    sku: 'BRK-RR-001',
    categoria: 'Frenos',
    stock: 4,
    stockMinimo: 6,
    unidad: 'Pares',
    precioCompra: 250,
    precioVenta: 400,
    proveedor: 'Frenos MX',
    ubicacion: 'Estante C-2',
    notas: '',
  },
  {
    id: '#INV-009',
    nombre: 'Aceite Mineral 20W-50',
    sku: 'OIL-20W50-001',
    categoria: 'Aceites',
    stock: 12,
    stockMinimo: 8,
    unidad: 'Litros',
    precioCompra: 55,
    precioVenta: 85,
    proveedor: 'Lubricantes SA',
    ubicacion: 'Estante A-2',
    notas: '',
  },
  {
    id: '#INV-010',
    nombre: 'Limpiaparabrisas Universal',
    sku: 'WPR-UNI-001',
    categoria: 'Accesorios',
    stock: 7,
    stockMinimo: 10,
    unidad: 'Pares',
    precioCompra: 90,
    precioVenta: 150,
    proveedor: 'Accesorios Auto',
    ubicacion: 'Estante F-1',
    notas: '',
  },
]

export function getEstadoStock(item: ItemInventario): EstadoStock {
  if (item.stock <= item.stockMinimo * 0.3) return 'critico'
  if (item.stock <= item.stockMinimo) return 'bajo'
  return 'normal'
}

export const useInventarioStore = defineStore('inventario', () => {
  const items = ref<ItemInventario[]>(cargarItems())

  watch(
    items,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  const totalItems = computed(() => items.value.length)
  const itemsCriticos = computed(
    () => items.value.filter((i) => getEstadoStock(i) === 'critico').length,
  )
  const itemsBajos = computed(() => items.value.filter((i) => getEstadoStock(i) === 'bajo').length)
  const valorInventario = computed(() =>
    items.value.reduce((s, i) => s + i.stock * i.precioCompra, 0),
  )

  const categorias = computed(() => [...new Set(items.value.map((i) => i.categoria))].sort())

  function obtenerPorId(id: string): ItemInventario | undefined {
    return items.value.find((i) => i.id === id)
  }

  function crear(datos: ItemInput): ItemInventario {
    const nuevo: ItemInventario = { ...datos, id: generarId() }
    items.value.unshift(nuevo)
    return nuevo
  }

  function actualizar(id: string, datos: Partial<ItemInput>): boolean {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx === -1) return false
    const actual = items.value[idx]!
    items.value[idx] = {
      id: actual.id,
      nombre: datos.nombre ?? actual.nombre,
      sku: datos.sku ?? actual.sku,
      categoria: datos.categoria ?? actual.categoria,
      stock: datos.stock ?? actual.stock,
      stockMinimo: datos.stockMinimo ?? actual.stockMinimo,
      unidad: datos.unidad ?? actual.unidad,
      precioCompra: datos.precioCompra ?? actual.precioCompra,
      precioVenta: datos.precioVenta ?? actual.precioVenta,
      proveedor: datos.proveedor ?? actual.proveedor,
      ubicacion: datos.ubicacion ?? actual.ubicacion,
      notas: datos.notas ?? actual.notas,
    }
    return true
  }

  function eliminar(id: string): boolean {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx === -1) return false
    items.value.splice(idx, 1)
    return true
  }

  function ajustarStock(id: string, cantidad: number): boolean {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx === -1) return false
    items.value[idx]!.stock = Math.max(0, items.value[idx]!.stock + cantidad)
    return true
  }

  return {
    items,
    totalItems,
    itemsCriticos,
    itemsBajos,
    valorInventario,
    categorias,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    ajustarStock,
  }
})
