import { useForm } from '@tanstack/react-form'
import Button from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import { useCambiarStock } from '../hooks/useProductos'
import type { Producto } from '../types/producto.types'

interface StockModalProps {
  producto: Producto
  onClose: () => void
}

// Cambio de stock y disponibilidad (PATCH /productos/{id}/stock).
function StockModal({ producto, onClose }: StockModalProps) {
  const cambiar = useCambiarStock()

  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      try {
        await cambiar.mutateAsync({ id: producto.id, datos: value })
        onClose()
      } catch {
        // El error queda en la mutación y se muestra abajo.
      }
    },
  })

  return (
    <Modal titulo={`Stock de «${producto.nombre}»`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              Number.isNaN(value) || !Number.isInteger(value)
                ? 'Ingresá un stock entero'
                : value < 0
                  ? 'El stock no puede ser negativo'
                  : undefined,
          }}
        >
          {(field) => (
            <Input
              label="Stock"
              type="number"
              min="0"
              step="1"
              autoFocus
              value={Number.isNaN(field.state.value) ? '' : field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value === '' ? NaN : Number(e.target.value))}
              errores={field.state.meta.errors.map(String)}
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        {cambiar.isError && (
          <p role="alert" className="mt-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
            {cambiar.error.message}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variante="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Guardando…' : 'Guardar'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  )
}

export default StockModal
