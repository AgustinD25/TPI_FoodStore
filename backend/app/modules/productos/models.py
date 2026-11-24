from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id")  # pertenece a UNA categoría (1:N)
    nombre: str
    descripcion: str = ""
    precio_base: float  # >= 0 (se valida en el schema y en el Service)
    imagen_url: str = ""
    stock: int = 0  # >= 0. Se descuenta al crear un pedido y se restituye al cancelarlo
    disponible: bool = True
    activo: bool = True  # baja lógica. Solo se vende si está activo, disponible y con stock

    # Categoria 1:N Producto  /  Producto 1:N DetallePedido
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
