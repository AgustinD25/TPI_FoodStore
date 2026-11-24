import { api } from '@/shared/api/axiosInstance'
import { request } from '@/shared/api/handleApiError'
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from '../types/pedido.types'

export function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  return request(api.post<Pedido>('/pedidos', datos))
}

// Los propios (user) o todos (admin): lo decide el backend según el rol de la sesión.
export function listarPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  return request(api.get<PedidosPaginados>('/pedidos', { params: filtros }))
}

// Solo admin: avanza o cancela según la máquina de estados.
export function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  return request(api.patch<Pedido>(`/pedidos/${id}/estado`, { estado }))
}

// El dueño cancela un pedido propio, solo desde PENDIENTE.
export function cancelarPedido(id: number): Promise<Pedido> {
  return request(api.patch<Pedido>(`/pedidos/${id}/cancelar`))
}

export function obtenerResumen(): Promise<ResumenPedidos> {
  return request(api.get<ResumenPedidos>('/pedidos/resumen'))
}
