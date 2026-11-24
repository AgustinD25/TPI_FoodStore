// API pública de la feature pedidos (barrel).
export { default as CarritoPage } from './pages/CarritoPage'
export { default as CheckoutPage } from './pages/CheckoutPage'
export { default as MisPedidosPage } from './pages/MisPedidosPage'
export { default as AdminPedidosPage } from './pages/AdminPedidosPage'
export { default as AdminResumenPage } from './pages/AdminResumenPage'
export { usePedidos, useCrearPedido, useCambiarEstadoPedido, useCancelarPedido, useResumenPedidos } from './hooks/usePedidos'
export type { Pedido, DetallePedido, EstadoPedido, ResumenPedidos } from './types/pedido.types'
