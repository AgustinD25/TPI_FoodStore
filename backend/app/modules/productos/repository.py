from typing import Optional

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from .models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(Producto, session)

    def search(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Producto], int]:
        """Productos ACTIVOS filtrados por nombre (sin distinguir mayúsculas), categoría y
        disponibilidad, con paginación. Devuelve (items, total)."""
        filtros = [col(Producto.activo).is_(True)]
        if search:
            filtros.append(func.lower(Producto.nombre).contains(search.strip().lower(), autoescape=True))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(col(Producto.disponible).is_(disponible))

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        consulta = (
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))  # evita una consulta extra por producto
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(consulta).all()), total

    def get_for_update(self, id: int) -> Optional[Producto]:
        # Bloquea la fila hasta el fin de la transacción (en PostgreSQL): dos pedidos
        # simultáneos del último producto no pueden descontar el mismo stock.
        return self.session.get(Producto, id, with_for_update=True)
