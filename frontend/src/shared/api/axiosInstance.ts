import axios from 'axios'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'

// Instancia única de Axios para toda la aplicación.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  // El token viaja en una cookie HttpOnly: el navegador la guarda y la envía solo si
  // withCredentials es true (el frontend y el backend están en puertos distintos).
  withCredentials: true,
  timeout: 10000,
})

// Peticiones que responden 401 como parte de su funcionamiento normal (credenciales
// incorrectas en el login, "sin sesión" al consultar /auth/me).
const RUTAS_DE_AUTH = ['/auth/token', '/auth/me']
const DETALLE_CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

// Interceptor de respuesta. Limpia el authStore cuando:
//   - hay un 401 fuera de /auth/token y /auth/me (la sesión venció), o
//   - hay un 400 con el detalle «Cuenta de usuario desactivada».
// La vuelta a /login la hace ProtectedRoute al quedar sin usuario. No hay interceptor de
// solicitud: el token viaja en la cookie HttpOnly, que JavaScript no puede leer.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const esDeAuth = RUTAS_DE_AUTH.some((ruta) => url.includes(ruta))
    const cuentaDesactivada =
      status === 400 && error.response?.data?.detail === DETALLE_CUENTA_DESACTIVADA

    if ((status === 401 && !esDeAuth) || cuentaDesactivada) {
      useAuthStore.getState().limpiarSesion()
    }
    return Promise.reject(error)
  },
)

export default api
