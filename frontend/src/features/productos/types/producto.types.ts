import type { Categoria } from '@/features/categorias'

// Mismos campos que ProductoRead del backend.
export interface Producto {
  id: number
  categoria_id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  activo: boolean
  categoria: Categoria | null
}

export interface ProductoInput {
  categoria_id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
}

export interface ProductosPaginados {
  total: number
  items: Producto[]
}

// Parámetros de consulta del listado: skip = página × limit.
export interface FiltrosProductos {
  skip: number
  limit: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}

export interface StockInput {
  stock?: number
  disponible?: boolean
}
