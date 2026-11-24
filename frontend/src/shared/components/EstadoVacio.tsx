import type { ReactNode } from 'react'

interface EstadoVacioProps {
  mensaje: string
  children?: ReactNode // acción opcional (por ejemplo, un enlace)
}

function EstadoVacio({ mensaje, children }: EstadoVacioProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      <p>{mensaje}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}

export default EstadoVacio
