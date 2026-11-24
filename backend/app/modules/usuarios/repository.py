from typing import Optional

from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from .models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session) -> None:
        super().__init__(Usuario, session)

    def get_by_username(self, username: str) -> Optional[Usuario]:
        return self.session.exec(select(Usuario).where(Usuario.username == username)).first()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        return self.session.exec(select(Usuario).where(Usuario.email == email)).first()

    def list_all(self) -> list[Usuario]:
        # Incluye a los desactivados: el administrador necesita verlos para reactivarlos.
        return list(self.session.exec(select(Usuario).order_by(Usuario.id)).all())
