import { QueryClient } from '@tanstack/react-query'

// Instancia única de TanStack Query. Se exporta para poder vaciar la caché cuando la sesión
// se cierra o vence (así un usuario nuevo no ve datos del anterior).
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})
