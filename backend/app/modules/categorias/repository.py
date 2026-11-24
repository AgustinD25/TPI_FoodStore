from typing import Optional

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(Categoria, session)

    def get_by_nombre(self, nombre: str, excluir_id: Optional[int] = None) -> Optional[Categoria]:
        # Sin distinguir mayúsculas y sin importar si está activa o dada de baja
        # (la baja lógica NO libera el nombre único).
        consulta = select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        if excluir_id is not None:
            consulta = consulta.where(Categoria.id != excluir_id)
        return self.session.exec(consulta).first()

    def list_activas(self) -> list[Categoria]:
        consulta = select(Categoria).where(col(Categoria.activo).is_(True)).order_by(Categoria.nombre)
        return list(self.session.exec(consulta).all())
