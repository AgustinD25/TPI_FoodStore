import { useForm } from '@tanstack/react-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useRegistrar } from '../hooks/useRegistrar'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function RegisterPage() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const registrar = useRegistrar()

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      try {
        await registrar.mutateAsync({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        // Al completarse el registro se redirige al login.
        navigate('/login', { replace: true, state: { registrado: true } })
      } catch {
        // El error (409 por usuario o email repetido) queda en la mutación y se muestra abajo.
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-2xl font-bold text-slate-800">Crear cuenta</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => {
                const largo = value.trim().length
                if (largo === 0) return 'El usuario es obligatorio'
                if (largo < 3) return 'El usuario debe tener al menos 3 caracteres'
                if (largo > 50) return 'El usuario no puede superar los 50 caracteres'
                return undefined
              },
            }}
          >
            {(field) => (
              <Input
                label="Usuario"
                autoComplete="username"
                autoFocus
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                errores={field.state.meta.errors.map(String)}
              />
            )}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{ onChange: ({ value }) => (!value.trim() ? 'El nombre completo es obligatorio' : undefined) }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                errores={field.state.meta.errors.map(String)}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? 'El email es obligatorio' : !EMAIL_VALIDO.test(value.trim()) ? 'Ingresá un email válido' : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                errores={field.state.meta.errors.map(String)}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 8
                  ? 'La contraseña debe tener al menos 8 caracteres'
                  : value.length > 72
                    ? 'La contraseña no puede superar los 72 caracteres'
                    : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                errores={field.state.meta.errors.map(String)}
              />
            )}
          </form.Field>

          {registrar.isError && (
            <p role="alert" className="mt-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
              {registrar.error.message}
            </p>
          )}

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="mt-6 w-full" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Creando cuenta…' : 'Registrarme'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default RegisterPage
