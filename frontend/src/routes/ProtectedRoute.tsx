import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '@/features/auth'
import EstadoCarga from '@/shared/components/EstadoCarga'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  allowedRoles?: Rol[] // si se indica, el usuario necesita alguno de estos roles
  children?: ReactNode // sin children se renderizan las rutas hijas (<Outlet />)
}

// Protege las rutas de cliente y de administración. La protección REAL está en el backend
// (get_current_active_user y require_role): ocultar una pantalla no reemplaza esa validación.
//
//   Verificando la sesión (checkSession) -> indicador de carga
//   Sin sesión                            -> /login
//   Rol no permitido                      -> /unauthorized
//   Sesión válida y rol permitido         -> la página (<Outlet />)
function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  if (cargando) return <EstadoCarga mensaje="Verificando sesión…" />

  // `state.desde` permite volver a la pantalla pedida después de iniciar sesión.
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location }} />

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children ?? <Outlet />
}

export default ProtectedRoute
