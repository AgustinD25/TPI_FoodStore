import { useCartStore } from '@/store/cartStore'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import type { Producto } from '../types/producto.types'

interface ProductoCardProps {
  producto: Producto
}

function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)

  const sinStock = producto.stock <= 0
  const noDisponible = !producto.disponible
  const alLimite = enCarrito >= producto.stock

  const handleAgregar = () =>
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      stock: producto.stock,
    })

  return (
    <Card className="flex flex-col p-0">
      <div className="flex h-36 items-center justify-center overflow-hidden rounded-t-lg bg-slate-100 text-5xl">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true">🍽️</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {producto.categoria && (
          <span className="mb-1 w-fit rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
            {producto.categoria.nombre}
          </span>
        )}
        <h3 className="text-lg font-semibold text-slate-800">{producto.nombre}</h3>
        <p className="mt-1 flex-1 text-sm text-slate-600">{producto.descripcion || 'Sin descripción'}</p>
        <div className="mt-3 flex items-end justify-between">
          <span className="text-lg font-bold text-slate-900">{formatearPrecio(producto.precio_base)}</span>
          <span className={`text-xs ${sinStock || noDisponible ? 'text-red-600' : 'text-slate-500'}`}>
            {noDisponible ? 'No disponible' : sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
          </span>
        </div>
        <Button className="mt-3" onClick={handleAgregar} disabled={sinStock || noDisponible || alLimite}>
          {alLimite && !sinStock && !noDisponible ? 'Máximo en el carrito' : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  )
}

export default ProductoCard
