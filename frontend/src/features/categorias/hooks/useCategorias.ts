import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from '../api/categorias'
import type { CategoriaInput } from '../types/categoria.types'

const CLAVE = ['categorias'] as const

// Estado del servidor: el listado de categorías activas (queryKey descriptiva).
export function useCategorias() {
  return useQuery({ queryKey: CLAVE, queryFn: listarCategorias })
}

// Cada mutación invalida la consulta del listado en onSuccess: TanStack Query la vuelve a pedir.
export function useCrearCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: CategoriaInput) => crearCategoria(datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVE }),
  })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Partial<CategoriaInput> }) =>
      actualizarCategoria(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE })
      queryClient.invalidateQueries({ queryKey: ['productos'] }) // los productos muestran su categoría
    },
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVE }),
  })
}
