from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import UsuarioActual
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
from .schemas import MensajeRespuesta
from .service import AuthService, CredencialesIncorrectas, CuentaDesactivada

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: ServiceDep):
    try:
        return service.register(data)
    except UsuarioDuplicado as error:
        raise HTTPException(status.HTTP_409_CONFLICT, str(error))


@router.post("/token", response_model=MensajeRespuesta)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: ServiceDep,
):
    """Login con formulario OAuth2 (username y password). El JWT viaja en la cookie HttpOnly
    `access_token`, que expira a los 30 minutos; el cuerpo NO incluye el token."""
    try:
        token = service.authenticate(form.username, form.password)
    except CredencialesIncorrectas as error:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, str(error), headers={"WWW-Authenticate": "Bearer"}
        )
    except CuentaDesactivada as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error))
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,  # JavaScript no puede leerla (protege contra el robo del token por XSS)
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # igual que la expiración del JWT
        samesite="lax",
        secure=settings.COOKIE_SECURE,
    )
    return MensajeRespuesta(message="Login exitoso")


@router.post("/logout", response_model=MensajeRespuesta)
def logout(response: Response):
    # Set-Cookie que borra la cookie en el navegador.
    response.delete_cookie(
        key="access_token", httponly=True, samesite="lax", secure=settings.COOKIE_SECURE
    )
    return MensajeRespuesta(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: UsuarioActual):
    return usuario
