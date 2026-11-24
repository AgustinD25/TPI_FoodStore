import { useCallback, useMemo, useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { useUsuarios } from '@/features/usuarios'
import DataTable from '@/shared/components/DataTable'
import EstadoCarga from '@/shared/components/EstadoCarga'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import { Select } from '@/shared/ui/Input'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import PedidoDetalle from '../components/PedidoDetalle'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import type { EstadoPedido, Pedido } from '../types/pedido.types'

const columnHelper = createColumnHelper<Pedido>()
const sinPedidos: Pedido[] = []

// Espejo de la máquina de estados del backend, solo para decidir qué botones mostrar:
// la validación real está en el Service de pedidos (una transición inválida responde 400).
const AVANCE: Partial<Record<EstadoPedido, { estado: EstadoPedido; etiqueta: string }>> = {
  PENDIENTE: { estado: 'EN_PREPARACION', etiqueta: 'Preparar' },
  EN_PREPARACION: { estado: 'ENTREGADO', etiqueta: 'Entregar' },
}
const PUEDE_CANCELARSE: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION']

const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  // El panel pide limit=100 y pagina del lado del cliente con TanStack Table.
  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: 0,
    limit: 100,
    estado: estado || undefined,
  })
  const usuarios = useUsuarios()
  const cambiar = useCambiarEstadoPedido()

  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 })

  const mutar = cambiar.mutate
  const resetCambiar = cambiar.reset
  const handleCambio = useCallback(
    (pedido: Pedido, nuevo: EstadoPedido) => {
      if (nuevo === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido #${pedido.id}? Se devolverá el stock.`)) return
      resetCambiar()
      mutar({ id: pedido.id, estado: nuevo })
    },
    [mutar, resetCambiar],
  )

  const nombres = useMemo(
    () => new Map((usuarios.data ?? []).map((u) => [u.id, u.username])),
    [usuarios.data],
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: '#' }),
      columnHelper.accessor((p) => nombres.get(p.usuario_id) ?? `Usuario ${p.usuario_id}`, {
        id: 'cliente',
        header: 'Cliente',
      }),
      columnHelper.accessor('created_at', { header: 'Fecha', cell: (info) => formatearFecha(info.getValue()) }),
      columnHelper.accessor('forma_pago', {
        header: 'Pago',
        cell: (info) => (info.getValue() === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'),
      }),
      columnHelper.accessor('total', { header: 'Total', cell: (info) => formatearPrecio(info.getValue()) }),
      columnHelper.accessor('estado', { header: 'Estado', cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const pedido = row.original
          const siguiente = AVANCE[pedido.estado]
          return (
            <div className="flex flex-wrap gap-2">
              <Button variante="secondary" tamano="sm" onClick={() => setDetalle(pedido)}>
                Detalle
              </Button>
              {siguiente && (
                <Button variante="success" tamano="sm" onClick={() => handleCambio(pedido, siguiente.estado)}>
                  {siguiente.etiqueta}
                </Button>
              )}
              {PUEDE_CANCELARSE.includes(pedido.estado) && (
                <Button variante="danger" tamano="sm" onClick={() => handleCambio(pedido, 'CANCELADO')}>
                  Cancelar
                </Button>
              )}
            </div>
          )
        },
      }),
    ],
    [handleCambio, nombres],
  )

  const pedidos = data?.items ?? sinPedidos

  // Acota la página si borrar filas deja el índice fuera de rango (p. ej. «Página 2 de 1»).
  const paginaActual = { ...pagination, pageIndex: Math.min(pagination.pageIndex, Math.max(Math.ceil(pedidos.length / pagination.pageSize) - 1, 0)) }

  const table = useReactTable({
    data: pedidos,
    columns,
    state: { sorting, pagination: paginaActual },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  })

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
        <div className="w-56">
          <Select
            label="Filtrar por estado"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as EstadoPedido | '')
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {cambiar.isError && (
        <div className="mb-4">
          <EstadoError mensaje={cambiar.error.message} />
        </div>
      )}

      {isLoading && <EstadoCarga mensaje="Cargando pedidos…" />}
      {isError && <EstadoError mensaje={`No se pudieron cargar los pedidos: ${error.message}`} onReintentar={() => refetch()} />}
      {!isLoading &&
        !isError &&
        (pedidos.length === 0 ? <EstadoVacio mensaje="No hay pedidos para mostrar." /> : <DataTable table={table} />)}

      {detalle && <PedidoDetalle pedido={detalle} onClose={() => setDetalle(null)} />}
    </section>
  )
}

export default AdminPedidosPage
