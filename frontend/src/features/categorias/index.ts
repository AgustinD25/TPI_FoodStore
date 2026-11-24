// API pública de la feature categorias (barrel). Las demás features importan SOLO desde acá.
export { default as AdminCategoriasPage } from './pages/AdminCategoriasPage'
export { useCategorias } from './hooks/useCategorias'
export type { Categoria, CategoriaInput } from './types/categoria.types'
