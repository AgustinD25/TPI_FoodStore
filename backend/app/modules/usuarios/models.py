from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.core.tiempo import ahora

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    full_name: str
    email: str = Field(index=True, unique=True)
    hashed_password: str  # hash bcrypt, nunca texto plano
    role: str = Field(default="user")  # "user" | "admin". El registro público crea "user"
    disabled: bool = Field(default=False)  # baja lógica: el admin activa / desactiva
    created_at: datetime = Field(default_factory=ahora)

    # Usuario 1:N Pedido
    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
