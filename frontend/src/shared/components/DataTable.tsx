import { flexRender } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'
import Button from '@/shared/ui/Button'

interface DataTableProps<TData> {
  table: Table<TData> // la instancia la crea la página con useReactTable
}

const FLECHAS: Record<string, string> = { asc: ' ▲', desc: ' ▼' }

// Presentación genérica de una tabla de TanStack Table: encabezados ordenables, cuerpo y
// paginación del lado del cliente. No tiene estado propio: todo llega por la instancia `table`.
function DataTable<TData>({ table }: DataTableProps<TData>) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left font-semibold text-slate-700">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!header.column.getCanSort()}
                        className="font-semibold enabled:cursor-pointer enabled:hover:text-indigo-600"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {FLECHAS[header.column.getIsSorted() as string] ?? null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
        <span>
          Página {table.getState().pagination.pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
        </span>
        <div className="flex gap-2">
          <Button variante="secondary" tamano="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Anterior
          </Button>
          <Button variante="secondary" tamano="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DataTable
