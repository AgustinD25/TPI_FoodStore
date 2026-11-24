import { useForm } from '@tanstack/react-form'
import Button from '@/shared/ui/Button'
import { Input, Textarea } from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import { useActualizarCategoria, useCrearCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types/categoria.types'

interface CategoriaFormModalProps {
  categoria: Categoria | null // null = alta, con valor = edición
  onClose: () => void
}

function CategoriaFormModal({ categoria, onClose }: CategoriaFormModalProps) {
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const editando = categoria !== null

  // TanStack Form: valores iniciales, validación por campo y envío.
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      const datos = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() }
      try {
        if (categoria) await actualizar.mutateAsync({ id: categoria.id, datos })
        else await crear.mutateAsync(datos)
        onClose()
      } catch {
        // El error (por ejemplo 409 por nombre duplicado) queda en la mutación y se muestra abajo.
      }
    },
  })

  const error = (editando ? actualizar.error : crear.error)?.message

  return (
    <Modal titulo={editando ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const largo = value.trim().length
              if (largo === 0) return 'El nombre es obligatorio'
              if (largo < 2) return 'El nombre debe tener al menos 2 caracteres'
              if (largo > 100) return 'El nombre no puede superar los 100 caracteres'
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              label="Nombre"
              name="nombre"
              autoFocus
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors.map(String)}
            />
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <Textarea
              label="Descripción"
              name="descripcion"
              rows={3}
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

export default CategoriaFormModal
