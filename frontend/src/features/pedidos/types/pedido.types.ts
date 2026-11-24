export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

// Mismos campos que DetallePedidoRead del backend. La línea guarda una COPIA del nombre y del
// precio del producto: no cambia aunque el producto cambie después.
export interface DetallePedido {
  id: number
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

// Mismos campos que PedidoRead del backend.
export interface Pedido {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

export interface PedidosPaginados {
  total: number
  items: Pedido[]
}

export interface FiltrosPedidos {
  skip: number
  limit: number
  estado?: EstadoPedido
}

export interface ItemPedidoCreate {
  producto_id: number
  cantidad: number
}

export interface PedidoCreate {
  items: ItemPedidoCreate[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas?: string
}

export interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}
