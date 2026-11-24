from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada
from .models import Producto
from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .unit_of_work import ProductoUnitOfWork


# ---- Excepciones de dominio (el Router las traduce a un código HTTP) ----
class ProductoNoEncontrado(Exception):
    """404"""


class ProductoService:
    """Reglas de negocio de los productos. No hace commit ni rollback: lo hace el Unit of Work."""

    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    @staticmethod
    def _activo(producto: Optional[Producto]) -> Producto:
        # Un producto dado de baja se trata como inexistente.
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado("Producto no encontrado")
        return producto

    @staticmethod
    def _verificar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("La categoría no existe o está dada de baja")

    def listar(
        self,
        skip: int,
        limit: int,
        search: Optional[str],
        categoria_id: Optional[int],
        disponible: Optional[bool],
    ) -> ProductosPaginados:
        with self.uow as uow:
            items, total = uow.productos.search(search, categoria_id, disponible, skip, limit)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in items]
            )

    def obtener(self, id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo(uow.productos.get_by_id(id)))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._verificar_categoria(uow, data.categoria_id)
            producto = uow.productos.add(Producto(**data.model_dump()))
            return ProductoRead.model_validate(producto)

    def actualizar(self, id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow.productos.get_by_id(id))
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            if "categoria_id" in cambios:
                self._verificar_categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def cambiar_stock(self, id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow.productos.get_by_id(id))
            producto.sqlmodel_update(data.model_dump(exclude_unset=True, exclude_none=True))
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, id: int) -> None:
        # Baja lógica: activo = false.
        with self.uow as uow:
            producto = self._activo(uow.productos.get_by_id(id))
            producto.activo = False
            uow.productos.add(producto)
