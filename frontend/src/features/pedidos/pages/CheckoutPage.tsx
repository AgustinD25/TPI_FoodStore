import { Link, useNavigate } from 'react-router-dom'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Card from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'
import CheckoutForm, { type DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()

  const handleConfirmar = async (datos: DatosCheckout) => {
    try {
      await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega,
        notas: datos.notas || undefined,
      })
      // El pedido se creó: se vacía el carrito y se redirige a «Mis pedidos».
      vaciar()
      navigate('/mis-pedidos', { replace: true })
    } catch {
      // El error (400 por stock insuficiente, 404 por producto inexistente…) queda en la mutación
      // y se muestra en el formulario. Como la transacción se revirtió, no se guardó nada.
    }
  }

  if (items.length === 0) {
    return (
      <section>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Confirmar pedido</h1>
        <EstadoVacio mensaje="No hay productos en el carrito.">
          <Link to="/" className="font-medium text-indigo-600 hover:underline">
            Ir al catálogo
          </Link>
        </EstadoVacio>
      </section>
    )
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Confirmar pedido</h1>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="text-lg font-semibold text-slate-800">Datos de entrega</h2>
          <CheckoutForm onSubmit={handleConfirmar} error={crearPedido.isError ? crearPedido.error.message : null} />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800">Resumen</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between py-2">
                <span>
                  {item.cantidad} × {item.nombre}
                </span>
                <span>{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-slate-200 pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </p>
        </Card>
      </div>
    </section>
  )
}

export default CheckoutPage
