import { useForm } from '@tanstack/react-form'
import Button from '@/shared/ui/Button'
import { Input, Select, Textarea } from '@/shared/ui/Input'
import type { FormaPago } from '../types/pedido.types'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  onSubmit: (datos: DatosCheckout) => Promise<void>
  error: string | null // error de la API (por ejemplo, stock insuficiente)
}

// Formulario de checkout con TanStack Form: dirección (5 a 200 caracteres), forma de pago y notas.
function CheckoutForm({ onSubmit, error }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: async ({ value }) => {
      await onSubmit({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim(),
      })
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo === 0) return 'La dirección de entrega es obligatoria'
            if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
            if (largo > 200) return 'La dirección no puede superar los 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            autoFocus
            placeholder="Calle y número, piso, localidad"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            errores={field.state.meta.errors.map(String)}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Select
            label="Forma de pago"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value as FormaPago)}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </Select>
        )}
      </form.Field>

      <form.Field name="notas">
        {(field) => (
          <Textarea
            label="Notas (opcional)"
            rows={3}
            placeholder="Por ejemplo: sin cebolla, timbre roto…"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="mt-6 w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Confirmando pedido…' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

export default CheckoutForm
