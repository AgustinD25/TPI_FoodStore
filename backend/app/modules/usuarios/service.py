from .schemas import UserPublic
from .unit_of_work import UsuarioUnitOfWork


# ---- Excepciones de dominio (el Router las traduce a un código HTTP) ----
class UsuarioNoEncontrado(Exception):
    """404"""


class UsuarioDuplicado(Exception):
    """409: el username o el email ya existen."""


class AutoDesactivacion(Exception):
    """400: el administrador intenta desactivarse a sí mismo."""


class UsuarioService:
    """Gestión de usuarios para el administrador: listado, activación y desactivación."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def cambiar_estado(self, usuario_id: int, actor_id: int, disabled: bool) -> UserPublic:
        """Activa o desactiva. Es idempotente: responde igual aunque el estado no cambie."""
        if disabled and usuario_id == actor_id:
            raise AutoDesactivacion("El administrador no puede desactivarse a sí mismo")
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(f"Usuario {usuario_id} no encontrado")
            usuario.disabled = disabled
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
