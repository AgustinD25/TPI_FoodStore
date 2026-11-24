import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarProducto,
  cambiarStock,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from '../api/productos'
import type { FiltrosProductos, ProductoInput, StockInput } from '../types/producto.types'

// queryKey descriptiva: ['productos', filtros]. Cada combinación de filtros se cachea aparte.
export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => listarProductos(filtros),
    placeholderData: keepPreviousData, // mantiene la página anterior mientras llega la nueva
  })
}

// Cada mutación invalida TODAS las consultas ['productos', ...] en onSuccess.
function useInvalidarProductos() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['productos'] })
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: (datos: ProductoInput) => crearProducto(datos),
    onSuccess: invalidar,
  })
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Partial<ProductoInput> }) =>
      actualizarProducto(id, datos),
    onSuccess: invalidar,
  })
}

export function useCambiarStock() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: StockInput }) => cambiarStock(id, datos),
    onSuccess: invalidar,
  })
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    onSuccess: invalidar,
  })
}
