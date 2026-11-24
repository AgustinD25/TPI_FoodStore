import { useState } from 'react'
import { Link } from 'react-router-dom'
import EstadoCarga from '@/shared/components/EstadoCarga'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import PedidoDetalle from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido.types'

const POR_PAGINA = 6

function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [detalle, setDetalle] = useState<Pedido | null>(null)

  // El backend devuelve solo los pedidos del usuario de la sesión.
  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  const handleCancelar = (pedido: Pedido) => {
    if (window.confirm(`¿Cancelar el pedido #${pedido.id}? Se devolverá el stock.`)) {
      cancelar.reset()
      cancelar.mutate(pedido.id)
    }
  }

  const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Mis pedidos</h1>

      {cancelar.isError && (
        <div className="mb-4">
          <EstadoError mensaje={`No se pudo cancelar: ${cancelar.error.message}`} />
        </div>
      )}

      {isLoading && <EstadoCarga mensaje="Cargando tus pedidos…" />}
      {isError && <EstadoError mensaje={`No se pudieron cargar los pedidos: ${error.message}`} onReintentar={() => refetch()} />}

      {data && data.items.length === 0 && (
        <EstadoVacio mensaje="Todavía no hiciste ningún pedido.">
          <Link to="/" className="font-medium text-indigo-600 hover:underline">
            Ir al catálogo
          </Link>
        </EstadoVacio>
      )}

      {data && data.items.length > 0 && (
        <div className="grid gap-4">
          {data.items.map((pedido) => (
            <Card key={pedido.id} className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-800">Pedido #{pedido.id}</p>
                <p className="text-sm text-slate-500">{formatearFecha(pedido.created_at)}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {pedido.items.length} {pedido.items.length === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <BadgeEstado estado={pedido.estado} />
                <span className="text-lg font-bold">{formatearPrecio(pedido.total)}</span>
              </div>
              <div className="flex gap-2">
                <Button variante="secondary" tamano="sm" onClick={() => setDetalle(pedido)}>
                  Ver detalle
                </Button>
                {/* El cliente solo puede cancelar desde PENDIENTE */}
                {pedido.estado === 'PENDIENTE' && (
                  <Button variante="danger" tamano="sm" onClick={() => handleCancelar(pedido)} disabled={cancelar.isPending}>
                    Cancelar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />

      {detalle && <PedidoDetalle pedido={detalle} onClose={() => setDetalle(null)} />}
    </section>
  )
}

export default MisPedidosPage
