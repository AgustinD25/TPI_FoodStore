from datetime import datetime
from typing import Optional

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from .models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    """Consultas de pedidos y de sus líneas. No tiene reglas de negocio ni llama a commit()."""

    def __init__(self, session: Session) -> None:
        super().__init__(Pedido, session)

    def agregar_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def _listar(
        self, usuario_id: Optional[int], estado: Optional[str], skip: int, limit: int
    ) -> tuple[list[Pedido], int]:
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        consulta = (
            select(Pedido)
            .where(*filtros)
            .options(selectinload(Pedido.items))  # las líneas en una sola consulta extra
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(consulta).all()), total

    def list_by_usuario(
        self, usuario_id: int, estado: Optional[str], skip: int, limit: int
    ) -> tuple[list[Pedido], int]:
        return self._listar(usuario_id, estado, skip, limit)

    def list_all(self, estado: Optional[str], skip: int, limit: int) -> tuple[list[Pedido], int]:
        return self._listar(None, estado, skip, limit)

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in filas}

    def contar_desde(self, desde: datetime) -> int:
        consulta = select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        return self.session.exec(consulta).one()

    def ingresos_entregados(self) -> float:
        consulta = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == "ENTREGADO")
        return float(self.session.exec(consulta).one())
