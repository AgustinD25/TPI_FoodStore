from typing import Optional

from .models import Categoria
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


# ---- Excepciones de dominio (el Router las traduce a un código HTTP) ----
class CategoriaNoEncontrada(Exception):
    """404"""


class NombreDuplicado(Exception):
    """409"""


class CategoriaService:
    """Reglas de negocio de las categorías. No conoce HTTP ni SQL y NO hace commit ni rollback:
    cada caso de uso corre dentro de `with self.uow` y devuelve el schema DENTRO del bloque."""

    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    @staticmethod
    def _activa(categoria: Optional[Categoria]) -> Categoria:
        # Un registro dado de baja se trata como inexistente.
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow.categorias.get_by_id(id)))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre):
                raise NombreDuplicado(f"Ya existe una categoría con el nombre '{data.nombre}'")
            categoria = uow.categorias.add(Categoria(nombre=data.nombre, descripcion=data.descripcion))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa(uow.categorias.get_by_id(id))
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            nombre = cambios.get("nombre")
            if nombre and uow.categorias.get_by_nombre(nombre, excluir_id=id):
                raise NombreDuplicado(f"Ya existe una categoría con el nombre '{nombre}'")
            categoria.sqlmodel_update(cambios)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, id: int) -> None:
        # Baja lógica: activo = false. No libera el nombre ni oculta sus productos.
        with self.uow as uow:
            categoria = self._activa(uow.categorias.get_by_id(id))
            categoria.activo = False
            uow.categorias.add(categoria)
