from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.core.tiempo import ahora

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


class Pedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="PENDIENTE")  # PENDIENTE | EN_PREPARACION | ENTREGADO | CANCELADO
    forma_pago: str  # EFECTIVO | TRANSFERENCIA
    direccion_entrega: str  # 5 a 200 caracteres (se valida en el schema)
    notas: Optional[str] = None
    # total = suma de los subtotales de sus líneas. Queda FIJO desde la creación.
    total: float = 0
    created_at: datetime = Field(default_factory=ahora)
    updated_at: datetime = Field(default_factory=ahora)

    # Usuario 1:N Pedido  /  Pedido 1:N DetallePedido
    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    # Línea INMUTABLE de un pedido. Guarda una COPIA del nombre y del precio del producto: si el
    # producto cambia después, el pedido sigue mostrando lo que realmente se vendió y se cobró.
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int  # >= 1
    nombre_producto: str  # copia del nombre
    precio_unitario: float  # copia del precio_base al crear el pedido
    subtotal: float  # precio_unitario × cantidad

    # Pedido 1:N DetallePedido  /  Producto 1:N DetallePedido
    pedido: Optional["Pedido"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")
