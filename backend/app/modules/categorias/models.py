from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, unique=True)  # único, 2 a 100 caracteres (se valida en el schema)
    descripcion: str = ""
    # Baja lógica. No libera el nombre único ni oculta sus productos.
    activo: bool = Field(default=True)

    # Categoria 1:N Producto
    productos: list["Producto"] = Relationship(back_populates="categoria")
