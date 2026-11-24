from typing import Annotated, List, Optional

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead

NombreProducto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=150)]


class ProductoCreate(SQLModel):
    categoria_id: int = Field(gt=0)
    nombre: NombreProducto
    descripcion: str = ""
    precio_base: float = Field(ge=0)  # >= 0
    imagen_url: str = ""
    stock: int = Field(default=0, ge=0)  # >= 0
    disponible: bool = True


class ProductoUpdate(SQLModel):
    # PUT actualiza SOLO los campos enviados y conserva los demás (actualización parcial).
    categoria_id: Optional[int] = Field(default=None, gt=0)
    nombre: Optional[NombreProducto] = None
    descripcion: Optional[str] = None
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = None
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None


class ProductoStockUpdate(SQLModel):
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None


class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str
    precio_base: float
    imagen_url: str
    stock: int
    disponible: bool
    activo: bool
    categoria: Optional[CategoriaRead] = None


class ProductosPaginados(SQLModel):
    total: int
    items: List[ProductoRead]
