import { useMutation } from '@tanstack/react-query'
import { registrar } from '../api/auth'
import type { RegistroDatos } from '../types/auth.types'

// POST /auth/register encapsulado en una mutación.
export function useRegistrar() {
  return useMutation({ mutationFn: (datos: RegistroDatos) => registrar(datos) })
}
