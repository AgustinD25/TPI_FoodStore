import EstadoCarga from '@/shared/components/EstadoCarga'
import EstadoError from '@/shared/components/EstadoError'
import { formatearPrecio } from '@/shared/utils/formato'
import ResumenCard from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/usePedidos'

function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos()

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Resumen del negocio</h1>

      {isLoading && <EstadoCarga mensaje="Cargando indicadores…" />}
      {isError && <EstadoError mensaje={`No se pudo cargar el resumen: ${error.message}`} onReintentar={() => refetch()} />}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pendientes" valor={data.pendientes} acento="text-amber-600" />
          <ResumenCard titulo="En preparación" valor={data.en_preparacion} acento="text-blue-600" />
          <ResumenCard titulo="Entregados" valor={data.entregados} acento="text-green-600" />
          <ResumenCard titulo="Cancelados" valor={data.cancelados} acento="text-red-600" />
          <ResumenCard titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
          <ResumenCard
            titulo="Ingresos"
            valor={formatearPrecio(data.ingresos_entregados)}
            detalle="Suma de los pedidos entregados"
            acento="text-indigo-600"
          />
        </div>
      )}
    </section>
  )
}

export default AdminResumenPage
