import { useEffect } from 'react'
import AppRouter from '@/routes/AppRouter'
import { useAuthStore } from '@/store/authStore'

function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // La ÚNICA llamada en useEffect: confirma la sesión con GET /auth/me al montar la aplicación.
  // (La cookie HttpOnly la envía el navegador: no se vuelven a pedir las credenciales.)
  useEffect(() => {
    checkSession()
  }, [checkSession])

  return <AppRouter />
}

export default App
