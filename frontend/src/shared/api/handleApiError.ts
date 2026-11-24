import axios from 'axios'

// Convierte el `detail` de la API en un mensaje para la pantalla.
export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Error inesperado.'
  if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder.'
  if (!error.response) return 'No se pudo conectar con el servidor.'

  const { status, data } = error.response
  const detail = (data as { detail?: unknown } | undefined)?.detail

  if (typeof detail === 'string') return detail // 400, 401, 403, 404 y 409: mensaje del backend
  if (status === 422 && Array.isArray(detail)) {
    const primero = detail[0] as { msg?: string; loc?: Array<string | number> } | undefined
    const campo = primero?.loc?.[primero.loc.length - 1]
    if (primero?.msg) return campo ? `Dato inválido (${campo}): ${primero.msg}` : primero.msg
    return 'Los datos enviados no son válidos.'
  }
  if (status === 401) return 'La sesión venció. Iniciá sesión de nuevo.'
  if (status === 403) return 'No tenés permisos para realizar esta acción.'
  if (status >= 500) return 'Error del servidor. Intentá de nuevo más tarde.'
  return 'No se pudo completar la operación.'
}

// Ejecuta una petición de Axios y devuelve solo `data`. Si falla, lanza un Error con el mensaje
// ya traducido: TanStack Query lo expone en `error.message`.
export async function request<T>(peticion: Promise<{ data: T }>): Promise<T> {
  try {
    return (await peticion).data
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}
