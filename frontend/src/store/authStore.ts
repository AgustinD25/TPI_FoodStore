import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import * as authApi from '@/features/auth/api/auth'
import type { Usuario } from '@/features/auth/types/auth.types'
import { queryClient } from '@/shared/api/queryClient'

interface AuthState {
  usuario: Usuario | null // usuario autenticado. El token NO se guarda: viaja en la cookie HttpOnly
  cargando: boolean // confirmando la sesión con /auth/me al iniciar la aplicación
  error: string | null // mensaje del último intento de login fallido

  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void // limpia el usuario sin llamar al backend (lo usa el interceptor)
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      error: null,

      // POST /auth/token (el servidor guarda la cookie) y luego GET /auth/me (datos del usuario).
      login: async (username, password) => {
        set({ error: null })
        try {
          await authApi.login(username, password)
          const usuario = await authApi.obtenerPerfil()
          set({ usuario })
          return usuario !== null
        } catch (e) {
          set({ usuario: null, error: e instanceof Error ? e.message : 'No se pudo iniciar sesión' })
          return false
        }
      },

      // POST /auth/logout (el servidor borra la cookie), y limpia el store y la caché de datos.
      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          queryClient.clear()
          set({ usuario: null })
        }
      },

      // Al montar la app: confirma la sesión con GET /auth/me. Si la cookie venció o el backend
      // no responde, no hay usuario. En cualquier caso termina la verificación.
      checkSession: async () => {
        try {
          set({ usuario: await authApi.obtenerPerfil() })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },

      limpiarSesion: () => {
        queryClient.clear()
        set({ usuario: null })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      // Solo se guardan los datos del usuario: nunca el token, ni cargando ni error.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
