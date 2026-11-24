from datetime import datetime
from typing import Annotated, List, Literal, Optional

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

EstadoPedido = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]
FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]  # RN-06

# RN-06: direccion_entrega de 5 a 200 caracteres
DireccionEntrega = Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=200)]


class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)  # cantidad >= 1


class PedidoCreate(SQLModel):
    items: List[ItemPedidoCreate] = Field(min_length=1)  # RN-01: al menos un ítem
    forma_pago: FormaPago
    direccion_entrega: DireccionEntrega
    notas: Optional[str] = None


class CambioEstado(SQLModel):
    estado: EstadoPedido  # uno de los cuatro estados


class DetallePedidoRead(SQLModel):
    id: int
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str] = None
    total: float
    created_at: datetime
    updated_at: datetime
    items: List[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: List[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float  # suma del total de los pedidos ENTREGADO
