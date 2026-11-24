import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import Button from '@/shared/ui/Button'

function Navbar() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidadCarrito = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0))

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-indigo-600 shadow">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" className="text-xl font-bold text-white">
          Food Store
        </Link>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-indigo-100">
          <Link to="/" className="hover:text-white">
            Catálogo
          </Link>
          <Link to="/carrito" className="hover:text-white">
            Carrito{cantidadCarrito > 0 && ` (${cantidadCarrito})`}
          </Link>

          {usuario ? (
            <>
              <Link to="/mis-pedidos" className="hover:text-white">
                Mis pedidos
              </Link>
              {usuario.role === 'admin' && (
                <Link to="/admin/resumen" className="hover:text-white">
                  Panel de administración
                </Link>
              )}
              <span className="rounded-md bg-indigo-700 px-3 py-1 text-white">
                {usuario.full_name} · {usuario.role}
              </span>
              <Button variante="secondary" tamano="sm" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-white">
                Iniciar sesión
              </Link>
              <Link to="/register" className="hover:text-white">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
