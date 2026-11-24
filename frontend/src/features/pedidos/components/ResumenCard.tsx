import Card from '@/shared/ui/Card'

interface ResumenCardProps {
  titulo: string
  valor: string | number
  detalle?: string
  acento?: string // clase de color del valor
}

// Tarjeta con un indicador del resumen del panel.
function ResumenCard({ titulo, valor, detalle, acento = 'text-slate-900' }: ResumenCardProps) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className={`mt-2 text-3xl font-bold ${acento}`}>{valor}</p>
      {detalle && <p className="mt-1 text-xs text-slate-400">{detalle}</p>}
    </Card>
  )
}

export default ResumenCard
