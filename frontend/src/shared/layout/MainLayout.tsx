import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

// Reúne la Navbar y el contenido de la ruta activa.
function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
