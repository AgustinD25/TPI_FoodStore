from datetime import datetime
from typing import Annotated

from pydantic import EmailStr, StringConstraints
from sqlmodel import Field, SQLModel

NombreStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


class UserCreate(SQLModel):
    """Datos del registro público. El rol no se elige: siempre se crea con rol 'user'."""

    username: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=50)]
    full_name: NombreStr
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)  # bcrypt usa hasta 72 bytes


class UserPublic(SQLModel):
    """Vista pública del usuario. NUNCA incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
