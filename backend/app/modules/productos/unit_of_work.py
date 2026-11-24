from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from .repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    """Expone productos y categorías sobre la MISMA sesión (al crear o mover un producto hay
    que comprobar que su categoría exista y esté activa)."""

    def _crear_repositorios(self) -> None:
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
