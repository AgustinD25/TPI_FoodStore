import { useForm } from '@tanstack/react-form'
import { useCategorias } from '@/features/categorias'
import Button from '@/shared/ui/Button'
import { Input, Select, Textarea } from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import { useActualizarProducto, useCrearProducto } from '../hooks/useProductos'
import type { Producto } from '../types/producto.types'

interface ProductoFormModalProps {
  producto: Producto | null // null = alta, con valor = edición
  onClose: () => void
}

interface ProductoFormValues {
  categoria_id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
}

function ProductoFormModal({ producto, onClose }: ProductoFormModalProps) {
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const editando = producto !== null

  const valoresIniciales: ProductoFormValues = {
    categoria_id: producto?.categoria_id ?? categorias.data?.[0]?.id ?? 0,
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    precio_base: producto?.precio_base ?? 0,
    imagen_url: producto?.imagen_url ?? '',
    stock: producto?.stock ?? 0,
    disponible: producto?.disponible ?? true,
  }

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: async ({ value }) => {
      const datos = {
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        imagen_url: value.imagen_url.trim(),
      }
      try {
        if (producto) await actualizar.mutateAsync({ id: producto.id, datos })
        else await crear.mutateAsync(datos)
        onClose()
      } catch {
        // El error (por ejemplo 404 por categoría dada de baja) queda en la mutación y se muestra abajo.
      }
    },
  })

  const error = (editando ? actualizar.error : crear.error)?.message

  return (
    <Modal titulo={editando ? 'Editar producto' : 'Nuevo producto'} onClose={onClose} ancho="lg">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="grid gap-x-4 sm:grid-cols-2">
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) => (!value.trim() ? 'El nombre es obligatorio' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Nombre"
                autoFocus
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                errores={field.state.meta.errors.map(String)}
              />
            )}
          </form.Field>

          <form.Field
            name="categoria_id"
            validators={{
              onChange: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría'),
            }}
          >
            {(field) => (
              <Select
                label="Categoría"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                errores={field.state.meta.errors.map(String)}
              >
                {field.state.value === 0 && <option value={0}>Elegí una categoría</option>}
                {categorias.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Select>
            )}
          </form.Field>

          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                Number.isNaN(value) ? 'Ingresá un precio válido' : value < 0 ? 'El precio no puede ser negativo' : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Precio base"
                type="number"
                min="0"
                step="0.01"
                value={Number.isNaN(field.state.value) ? '' : field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value === '' ? NaN : Number(e.target.value))}
                errores={field.state.meta.errors.map(String)}
              />
            )}
          </form.Field>

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
                value={Number.isNaN(field.state.value) ? '' : field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value === '' ? NaN : Number(e.target.value))}
                errores={field.state.meta.errors.map(String)}
              />
            )}
          </form.Field>
        </div>

        <form.Field name="imagen_url">
          {(field) => (
            <Input
              label="URL de la imagen (opcional)"
              type="url"
              placeholder="https://…"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <Textarea
              label="Descripción"
              rows={2}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
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

        {error && (
          <p role="alert" className="mt-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
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

export default ProductoFormModal
