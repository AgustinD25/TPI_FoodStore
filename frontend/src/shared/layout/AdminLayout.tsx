import { NavLink, Outlet } from 'react-router-dom'

const SECCIONES = [
  { to: '/admin/resumen', etiqueta: 'Resumen' },
  { to: '/admin/categorias', etiqueta: 'Categorías' },
  { to: '/admin/productos', etiqueta: 'Productos' },
  { to: '/admin/pedidos', etiqueta: 'Pedidos' },
  { to: '/admin/usuarios', etiqueta: 'Usuarios' },
]

// Submenú del panel de administración: se muestra sobre todas las pantallas /admin/*.
function AdminLayout() {
  return (
    <div>
      <nav aria-label="Panel de administración" className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {SECCIONES.map((seccion) => (
          <NavLink
            key={seccion.to}
            to={seccion.to}
            className={({ isActive }) =>
              `rounded-md px-4 py-2 text-sm font-medium ${
                isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`
            }
          >
            {seccion.etiqueta}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}

export default AdminLayout
