interface EstadoCargaProps {
  mensaje?: string
}

function EstadoCarga({ mensaje = 'Cargando…' }: EstadoCargaProps) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-8 text-slate-500"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
      {mensaje}
    </div>
  )
}

export default EstadoCarga
