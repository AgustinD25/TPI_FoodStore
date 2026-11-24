import { api } from '@/shared/api/axiosInstance'
import { request } from '@/shared/api/handleApiError'
import type { Categoria, CategoriaInput } from '../types/categoria.types'

export function listarCategorias(): Promise<Categoria[]> {
  return request(api.get<Categoria[]>('/categorias'))
}

export function crearCategoria(datos: CategoriaInput): Promise<Categoria> {
  return request(api.post<Categoria>('/categorias', datos))
}

export function actualizarCategoria(id: number, datos: Partial<CategoriaInput>): Promise<Categoria> {
  return request(api.put<Categoria>(`/categorias/${id}`, datos))
}

export function eliminarCategoria(id: number): Promise<void> {
  return request(api.delete<void>(`/categorias/${id}`))
}
