import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import Modal from '@/shared/ui/Modal'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import type { Pedido } from '../types/pedido.types'

interface PedidoDetalleProps {
  pedido: Pedido
  onClose: () => void
}

// Detalle de un pedido con sus líneas (nombre y precio copiados al momento de la compra).
function PedidoDetalle({ pedido, onClose }: PedidoDetalleProps) {
  return (
    <Modal titulo={`Pedido #${pedido.id}`} onClose={onClose} ancho="lg">
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <BadgeEstado estado={pedido.estado} />
        <span>{formatearFecha(pedido.created_at)}</span>
        <span>Pago: {pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</span>
      </div>
      <p className="mt-2 text-sm text-slate-700">
        <strong>Entrega:</strong> {pedido.direccion_entrega}
      </p>
      {pedido.notas && (
        <p className="mt-1 text-sm text-slate-700">
          <strong>Notas:</strong> {pedido.notas}
        </p>
      )}

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-2 font-medium">Producto</th>
            <th className="py-2 text-right font-medium">Precio</th>
            <th className="py-2 text-right font-medium">Cant.</th>
            <th className="py-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-2">{item.nombre_producto}</td>
              <td className="py-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="pt-3 text-right font-semibold">
              Total
            </td>
            <td className="pt-3 text-right text-base font-bold">{formatearPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-6 flex justify-end">
        <Button variante="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  )
}

export default PedidoDetalle
