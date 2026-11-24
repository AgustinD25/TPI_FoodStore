from typing import Annotated, Optional

from pydantic import StringConstraints
from sqlmodel import SQLModel

# nombre: 2 a 100 caracteres, sin espacios en los extremos
NombreCategoria = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]


class CategoriaCreate(SQLModel):
    nombre: NombreCategoria
    descripcion: str = ""


class CategoriaUpdate(SQLModel):
    # PUT actualiza SOLO los campos enviados y conserva los demás (actualización parcial).
    nombre: Optional[NombreCategoria] = None
    descripcion: Optional[str] = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    activo: bool
