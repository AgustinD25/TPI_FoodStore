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
import DataTable from '@/shared/components/DataTable'
import EstadoCarga from '@/shared/components/EstadoCarga'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Button from '@/shared/ui/Button'
import { formatearPrecio } from '@/shared/utils/formato'
import ProductoFormModal from '../components/ProductoFormModal'
import StockModal from '../components/StockModal'
import { useEliminarProducto, useProductos } from '../hooks/useProductos'
import type { Producto } from '../types/producto.types'

const columnHelper = createColumnHelper<Producto>()
const sinProductos: Producto[] = []

type ModalActivo = { tipo: 'form'; producto: Producto | null } | { tipo: 'stock'; producto: Producto } | null

function AdminProductosPage() {
  // El panel pide limit=100 y pagina del lado del cliente con TanStack Table.
  const { data, isLoading, isError, error, refetch } = useProductos({ skip: 0, limit: 100 })
  const eliminar = useEliminarProducto()

  const [modal, setModal] = useState<ModalActivo>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 })

  const resetEliminar = eliminar.reset
  const mutarEliminar = eliminar.mutate

  const abrirForm = useCallback(
    (producto: Producto | null) => {
      resetEliminar()
      setModal({ tipo: 'form', producto })
    },
    [resetEliminar],
  )
  const abrirStock = useCallback((producto: Producto) => setModal({ tipo: 'stock', producto }), [])
  const handleEliminar = useCallback(
    (producto: Producto) => {
      if (window.confirm(`¿Dar de baja el producto «${producto.nombre}»?`)) mutarEliminar(producto.id)
    },
    [mutarEliminar],
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('nombre', { header: 'Nombre' }),
      columnHelper.accessor((p) => p.categoria?.nombre ?? '—', { id: 'categoria', header: 'Categoría' }),
      columnHelper.accessor('precio_base', {
        header: 'Precio base',
        cell: (info) => formatearPrecio(info.getValue()),
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => (
          <span className={info.getValue() === 0 ? 'font-semibold text-red-600' : ''}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('disponible', {
        header: 'Disponible',
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Sí</span>
          ) : (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">No</span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variante="warning" tamano="sm" onClick={() => abrirForm(row.original)}>
              Editar
            </Button>
            <Button variante="secondary" tamano="sm" onClick={() => abrirStock(row.original)}>
              Stock
            </Button>
            <Button variante="danger" tamano="sm" onClick={() => handleEliminar(row.original)}>
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [abrirForm, abrirStock, handleEliminar],
  )

  const productos = data?.items ?? sinProductos

  // Acota la página si borrar filas deja el índice fuera de rango (p. ej. «Página 2 de 1»).
  const paginaActual = { ...pagination, pageIndex: Math.min(pagination.pageIndex, Math.max(Math.ceil(productos.length / pagination.pageSize) - 1, 0)) }

  const table = useReactTable({
    data: productos,
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Productos</h1>
        <Button onClick={() => abrirForm(null)}>Nuevo producto</Button>
      </div>

      {eliminar.isError && (
        <div className="mb-4">
          <EstadoError mensaje={`No se pudo eliminar: ${eliminar.error.message}`} />
        </div>
      )}

      {isLoading && <EstadoCarga mensaje="Cargando productos…" />}
      {isError && <EstadoError mensaje={`No se pudieron cargar los productos: ${error.message}`} onReintentar={() => refetch()} />}
      {!isLoading &&
        !isError &&
        (productos.length === 0 ? <EstadoVacio mensaje="Todavía no hay productos." /> : <DataTable table={table} />)}

      {modal?.tipo === 'form' && <ProductoFormModal producto={modal.producto} onClose={() => setModal(null)} />}
      {modal?.tipo === 'stock' && <StockModal producto={modal.producto} onClose={() => setModal(null)} />}
    </section>
  )
}

export default AdminProductosPage
