import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { useAuthStore } from '@/store/authStore'

interface EstadoNavegacion {
  registrado?: boolean
  desde?: { pathname: string }
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const estado = location.state as EstadoNavegacion | null

  const usuario = useAuthStore((s) => s.usuario)
  const error = useAuthStore((s) => s.error)
  const login = useAuthStore((s) => s.login)
  const [enviando, setEnviando] = useState(false)

  // TanStack Form: valores iniciales, validación por campo y envío.
  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setEnviando(true)
      const ok = await login(value.username.trim(), value.password)
      setEnviando(false)
      // Vuelve a la pantalla que se quiso visitar (por ejemplo /checkout), o al catálogo.
      if (ok) navigate(estado?.desde?.pathname ?? '/', { replace: true })
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-2xl font-bold text-slate-800">Iniciar sesión</h1>

        {estado?.registrado && (
          <p role="status" className="mt-4 rounded-md bg-green-100 px-3 py-2 text-sm text-green-700">
            Cuenta creada. Ya podés iniciar sesión.
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (!value.trim() ? 'El usuario es obligatorio' : undefined) }}
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
            name="password"
            validators={{ onChange: ({ value }) => (!value ? 'La contraseña es obligatoria' : undefined) }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                errores={field.state.meta.errors.map(String)}
              />
            )}
          </form.Field>

          {error && (
            <p role="alert" className="mt-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" className="mt-6 w-full" disabled={!canSubmit || enviando}>
                {enviando ? 'Ingresando…' : 'Ingresar'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default LoginPage
