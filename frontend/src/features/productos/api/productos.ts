import { api } from '@/shared/api/axiosInstance'
import { request } from '@/shared/api/handleApiError'
import type {
  FiltrosProductos,
  Producto,
  ProductoInput,
  ProductosPaginados,
  StockInput,
} from '../types/producto.types'

export function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  // Axios omite los parámetros undefined.
  return request(api.get<ProductosPaginados>('/productos', { params: filtros }))
}

export function crearProducto(datos: ProductoInput): Promise<Producto> {
  return request(api.post<Producto>('/productos', datos))
}

export function actualizarProducto(id: number, datos: Partial<ProductoInput>): Promise<Producto> {
  return request(api.put<Producto>(`/productos/${id}`, datos))
}

export function cambiarStock(id: number, datos: StockInput): Promise<Producto> {
  return request(api.patch<Producto>(`/productos/${id}/stock`, datos))
}

export function eliminarProducto(id: number): Promise<void> {
  return request(api.delete<void>(`/productos/${id}`))
}
