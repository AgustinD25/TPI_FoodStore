import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  listarPedidos,
  obtenerResumen,
} from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from '../types/pedido.types'

// queryKey descriptiva: ['pedidos', filtros].
export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['resumen-pedidos'], queryFn: obtenerResumen })
}

// Un pedido toca tres cosas: la lista de pedidos, el stock de los productos (se descuenta al
// crear y se restituye al cancelar) y los indicadores del resumen. Se invalidan las tres.
function useInvalidarPedidos() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    queryClient.invalidateQueries({ queryKey: ['productos'] })
    queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] })
  }
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: (datos: PedidoCreate) => crearPedido(datos),
    onSuccess: invalidar,
  })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: invalidar,
  })
}
