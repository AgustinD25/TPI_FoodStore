import type { Usuario } from '@/features/auth'
import { api } from '@/shared/api/axiosInstance'
import { request } from '@/shared/api/handleApiError'

export function listarUsuarios(): Promise<Usuario[]> {
  return request(api.get<Usuario[]>('/admin/usuarios'))
}

export function activarUsuario(id: number): Promise<Usuario> {
  return request(api.post<Usuario>(`/admin/usuarios/${id}/activar`))
}

export function desactivarUsuario(id: number): Promise<Usuario> {
  return request(api.post<Usuario>(`/admin/usuarios/${id}/desactivar`))
}
