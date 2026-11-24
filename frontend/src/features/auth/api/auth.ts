import axios from 'axios'
import { api } from '@/shared/api/axiosInstance'
import { handleApiError, request } from '@/shared/api/handleApiError'
import type { RegistroDatos, Usuario } from '../types/auth.types'

// POST /auth/token: formulario OAuth2 (no JSON). El servidor responde con la cookie HttpOnly;
// el cuerpo no trae el token y este archivo nunca lo ve.
export async function login(username: string, password: string): Promise<void> {
  try {
    await api.post('/auth/token', new URLSearchParams({ username, password }))
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// GET /auth/me: el usuario si hay sesión válida, o null si no la hay (401) o la cuenta fue
// desactivada (400).
export async function obtenerPerfil(): Promise<Usuario | null> {
  try {
    return (await api.get<Usuario>('/auth/me')).data
  } catch (error) {
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 400)) {
      return null
    }
    throw new Error(handleApiError(error))
  }
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout') // el servidor borra la cookie
}

export function registrar(datos: RegistroDatos): Promise<Usuario> {
  return request(api.post<Usuario>('/auth/register', datos))
}
