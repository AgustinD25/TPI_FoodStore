import { Link } from 'react-router-dom'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'

// El carrito es público y se persiste en el navegador (cartStore con persist).
function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())

  if (items.length === 0) {
    return (
      <section>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Carrito</h1>
        <EstadoVacio mensaje="Tu carrito está vacío.">
          <Link to="/" className="font-medium text-indigo-600 hover:underline">
            Ver el catálogo
          </Link>
        </EstadoVacio>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Carrito</h1>
        <Button variante="secondary" tamano="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 text-right font-semibold">Precio</th>
              <th className="px-4 py-3 text-center font-semibold">Cantidad</th>
              <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.producto_id}>
                <td className="px-4 py-3 font-medium text-slate-800">{item.nombre}</td>
                <td className="px-4 py-3 text-right">{formatearPrecio(item.precio_unitario)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variante="secondary"
                      tamano="sm"
                      aria-label={`Restar uno a ${item.nombre}`}
                      onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                    >
                      −
                    </Button>
                    <span className="w-8 text-center">{item.cantidad}</span>
                    <Button
                      variante="secondary"
                      tamano="sm"
                      aria-label={`Sumar uno a ${item.nombre}`}
                      disabled={item.cantidad >= item.stock}
                      onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                    >
                      +
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatearPrecio(item.precio_unitario * item.cantidad)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variante="danger" tamano="sm" onClick={() => quitar(item.producto_id)}>
                    Quitar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-6 flex flex-col items-end gap-3">
        <p className="text-lg">
          Total: <strong className="text-2xl">{formatearPrecio(total)}</strong>
        </p>
        <Link
          to="/checkout"
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Continuar con el pedido
        </Link>
      </div>
    </section>
  )
}

export default CarritoPage
