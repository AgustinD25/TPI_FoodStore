from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


# ---- Excepciones de dominio ----
class CredencialesIncorrectas(Exception):
    """401"""


class CuentaDesactivada(Exception):
    """400 «Cuenta de usuario desactivada»"""


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def register(self, data: UserCreate) -> UserPublic:
        username = data.username.strip()
        email = data.email.strip().lower()
        with self.uow as uow:
            if uow.usuarios.get_by_username(username):
                raise UsuarioDuplicado("El nombre de usuario ya está en uso")
            if uow.usuarios.get_by_email(email):
                raise UsuarioDuplicado("El email ya está registrado")
            usuario = uow.usuarios.add(
                Usuario(
                    username=username,
                    full_name=data.full_name,
                    email=email,
                    hashed_password=hash_password(data.password),  # bcrypt, nunca texto plano
                    role="user",  # el registro público SIEMPRE crea un usuario con rol user
                )
            )
            return UserPublic.model_validate(usuario)

    def authenticate(self, username: str, password: str) -> str:
        """Valida las credenciales y devuelve el JWT (el Router lo pone en la cookie)."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username.strip())
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesIncorrectas("Credenciales incorrectas")
            if usuario.disabled:
                raise CuentaDesactivada("Cuenta de usuario desactivada")
            return create_access_token({"sub": usuario.username, "role": usuario.role})
