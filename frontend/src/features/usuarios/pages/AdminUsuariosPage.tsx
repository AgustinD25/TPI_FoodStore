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
import type { Usuario } from '@/features/auth'
import DataTable from '@/shared/components/DataTable'
import EstadoCarga from '@/shared/components/EstadoCarga'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Button from '@/shared/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'

const columnHelper = createColumnHelper<Usuario>()
const sinUsuarios: Usuario[] = []

function AdminUsuariosPage() {
  const miId = useAuthStore((s) => s.usuario?.id)
  const { data, isLoading, isError, error, refetch } = useUsuarios()
  const cambiar = useCambiarEstadoUsuario()

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 })

  const mutar = cambiar.mutate
  const resetCambiar = cambiar.reset
  const handleCambio = useCallback(
    (usuario: Usuario, activar: boolean) => {
      if (!activar && !window.confirm(`¿Desactivar la cuenta de ${usuario.username}?`)) return
      resetCambiar()
      mutar({ id: usuario.id, activar })
    },
    [mutar, resetCambiar],
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', { header: 'Usuario' }),
      columnHelper.accessor('full_name', { header: 'Nombre' }),
      columnHelper.accessor('email', { header: 'Email' }),
      columnHelper.accessor('role', { header: 'Rol' }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Desactivado</span>
          ) : (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Activo</span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const usuario = row.original
          if (usuario.disabled) {
            return (
              <Button variante="success" tamano="sm" onClick={() => handleCambio(usuario, true)}>
                Activar
              </Button>
            )
          }
          // El botón Desactivar NO se muestra en la fila del usuario de la sesión.
          if (usuario.id === miId) return <span className="text-xs text-slate-400">(vos)</span>
          return (
            <Button variante="danger" tamano="sm" onClick={() => handleCambio(usuario, false)}>
              Desactivar
            </Button>
          )
        },
      }),
    ],
    [handleCambio, miId],
  )

  const usuarios = data ?? sinUsuarios

  // Acota la página si borrar filas deja el índice fuera de rango (p. ej. «Página 2 de 1»).
  const paginaActual = { ...pagination, pageIndex: Math.min(pagination.pageIndex, Math.max(Math.ceil(usuarios.length / pagination.pageSize) - 1, 0)) }

  const table = useReactTable({
    data: usuarios,
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
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Usuarios</h1>

      {cambiar.isError && (
        <div className="mb-4">
          <EstadoError mensaje={cambiar.error.message} />
        </div>
      )}

      {isLoading && <EstadoCarga mensaje="Cargando usuarios…" />}
      {isError && <EstadoError mensaje={`No se pudieron cargar los usuarios: ${error.message}`} onReintentar={() => refetch()} />}
      {!isLoading &&
        !isError &&
        (usuarios.length === 0 ? <EstadoVacio mensaje="No hay usuarios registrados." /> : <DataTable table={table} />)}
    </section>
  )
}

export default AdminUsuariosPage
