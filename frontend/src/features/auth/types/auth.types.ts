export type Rol = 'user' | 'admin'

// Igual que UserPublic del backend (nunca incluye hashed_password).
export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

export interface RegistroDatos {
  username: string
  full_name: string
  email: string
  password: string
}
