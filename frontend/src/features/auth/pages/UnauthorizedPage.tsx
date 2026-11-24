import { Link } from 'react-router-dom'

function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <h1 className="text-3xl font-bold text-slate-800">Acceso denegado</h1>
      <p className="mt-3 text-slate-600">No tenés permisos para ver esta página.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Volver al inicio
      </Link>
    </div>
  )
}

export default UnauthorizedPage
