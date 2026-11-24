// API pública de la feature auth (barrel). Las demás features importan SOLO desde acá.
export { default as LoginPage } from './pages/LoginPage'
export { default as RegisterPage } from './pages/RegisterPage'
export { default as UnauthorizedPage } from './pages/UnauthorizedPage'
export type { RegistroDatos, Rol, Usuario } from './types/auth.types'
