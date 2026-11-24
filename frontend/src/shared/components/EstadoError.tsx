import Button from '@/shared/ui/Button'

interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700"
    >
      <span>{mensaje}</span>
      {onReintentar && (
        <Button variante="danger" tamano="sm" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export default EstadoError
