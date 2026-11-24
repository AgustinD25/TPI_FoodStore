import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activarUsuario, desactivarUsuario, listarUsuarios } from '../api/usuarios'

const CLAVE = ['usuarios'] as const

export function useUsuarios() {
  return useQuery({ queryKey: CLAVE, queryFn: listarUsuarios })
}

// Activar y desactivar: useMutation con invalidación del listado en onSuccess.
export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      activar ? activarUsuario(id) : desactivarUsuario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVE }),
  })
}
