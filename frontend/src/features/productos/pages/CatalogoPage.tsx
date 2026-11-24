import { useEffect, useState } from 'react'
import { useCategorias } from '@/features/categorias'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import Skeleton from '@/shared/components/Skeleton'
import { Input, Select } from '@/shared/ui/Input'
import ProductoCard from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 8

function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [termino, setTermino] = useState('') // la búsqueda ya "asentada" (con retardo)
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  // Retardo de 350 ms para no consultar en cada tecla. El efecto solo actualiza estado local.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setTermino(busqueda.trim())
      setPagina(0)
    }, 350)
    return () => clearTimeout(temporizador)
  }, [busqueda])

  const categorias = useCategorias()

  // Paginación EN EL SERVIDOR: skip = página × limit.
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: termino || undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-800">Catálogo</h1>

      <div className="mb-6 grid gap-x-4 sm:grid-cols-2">
        <Input
          label="Buscar por nombre"
          type="search"
          placeholder="Ej.: pizza"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Select
          label="Categoría"
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
            setPagina(0)
          }}
        >
          <option value="">Todas</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>
      </div>

      {isError && (
        <EstadoError mensaje={`No se pudo cargar el catálogo: ${error.message}`} onReintentar={() => refetch()} />
      )}

      {/* Skeleton mientras carga la primera vez */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Cargando productos">
          {Array.from({ length: POR_PAGINA }, (_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="mt-3 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-4 h-9 w-full" />
            </div>
          ))}
        </div>
      )}

      {data && data.items.length === 0 && (
        <EstadoVacio mensaje="No encontramos productos con esos filtros." />
      )}

      {data && data.items.length > 0 && (
        <div
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${isPlaceholderData ? 'opacity-60' : ''}`}
        >
          {data.items.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}

      <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </section>
  )
}

export default CatalogoPage
