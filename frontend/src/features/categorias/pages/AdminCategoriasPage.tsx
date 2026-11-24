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
import CategoriaFormModal from '../components/CategoriaFormModal'
import { useCategorias, useEliminarCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types/categoria.types'

const columnHelper = createColumnHelper<Categoria>()
const sinCategorias: Categoria[] = []

function AdminCategoriasPage() {
  const { data, isLoading, isError, error, refetch } = useCategorias()
  const eliminar = useEliminarCategoria()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [seleccionada, setSeleccionada] = useState<Categoria | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 })

  const resetEliminar = eliminar.reset
  const abrir = useCallback(
    (categoria: Categoria | null) => {
      resetEliminar()
      setSeleccionada(categoria)
      setModalAbierto(true)
    },
    [resetEliminar],
  )

  const mutarEliminar = eliminar.mutate
  const handleEliminar = useCallback(
    (categoria: Categoria) => {
      if (window.confirm(`¿Dar de baja la categoría «${categoria.nombre}»?`)) mutarEliminar(categoria.id)
    },
    [mutarEliminar],
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('nombre', { header: 'Nombre' }),
      columnHelper.accessor('descripcion', { header: 'Descripción', cell: (info) => info.getValue() || '—' }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variante="warning" tamano="sm" onClick={() => abrir(row.original)}>
              Editar
            </Button>
            <Button variante="danger" tamano="sm" onClick={() => handleEliminar(row.original)}>
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [abrir, handleEliminar],
  )

  const categorias = data ?? sinCategorias

  // Acota la página si borrar filas deja el índice fuera de rango (p. ej. «Página 2 de 1»).
  const paginaActual = { ...pagination, pageIndex: Math.min(pagination.pageIndex, Math.max(Math.ceil(categorias.length / pagination.pageSize) - 1, 0)) }

  const table = useReactTable({
    data: categorias,
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
        <h1 className="text-2xl font-bold text-slate-800">Categorías</h1>
        <Button onClick={() => abrir(null)}>Nueva categoría</Button>
      </div>

      {eliminar.isError && (
        <div className="mb-4">
          <EstadoError mensaje={`No se pudo eliminar: ${eliminar.error.message}`} />
        </div>
      )}

      {isLoading && <EstadoCarga mensaje="Cargando categorías…" />}
      {isError && <EstadoError mensaje={`No se pudieron cargar las categorías: ${error.message}`} onReintentar={() => refetch()} />}
      {!isLoading &&
        !isError &&
        (categorias.length === 0 ? (
          <EstadoVacio mensaje="Todavía no hay categorías." />
        ) : (
          <DataTable table={table} />
        ))}

      {modalAbierto && (
        <CategoriaFormModal categoria={seleccionada} onClose={() => setModalAbierto(false)} />
      )}
    </section>
  )
}

export default AdminCategoriasPage
