"""Dependencias de autenticación y autorización.

Flujo de una petición protegida:
    oauth2_scheme           -> extrae el JWT de la cookie HttpOnly access_token
    get_current_user        -> valida firma y expiración y carga al usuario        (401 si falla)
    get_current_active_user -> el usuario no puede estar desactivado               (400 si lo está)
    require_role([...])     -> el rol debe estar entre los permitidos              (403 si no)
"""
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.database import SessionDep
from app.core.security import decode_access_token
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.usuarios.schemas import UserPublic


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Lee el token EXCLUSIVAMENTE de la cookie HttpOnly. El encabezado Authorization no se
    acepta: si el frontend lo enviara tendría que poder leer el token, y la cookie HttpOnly
    existe justamente para que JavaScript no acceda a él."""

    async def __call__(self, request: Request) -> Optional[str]:
        token = request.cookies.get("access_token")
        if not token:
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No autenticado",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return None
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: SessionDep,
) -> UserPublic:
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None or payload.get("sub") is None:
        raise credenciales_invalidas
    usuario = UsuarioRepository(session).get_by_username(payload["sub"])
    if usuario is None:
        raise credenciales_invalidas
    return UserPublic.model_validate(usuario)


def get_current_active_user(
    usuario: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return usuario


def require_role(roles_permitidos: list[str]):
    """Fábrica de dependencias RBAC: exige que el rol del usuario esté entre los permitidos."""

    def verificar_rol(
        usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if usuario.role not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permisos insuficientes. Se requiere uno de: {roles_permitidos}",
            )
        return usuario

    return verificar_rol


# Atajos para los routers.
UsuarioActual = Annotated[UserPublic, Depends(get_current_active_user)]
SoloAdmin = Annotated[UserPublic, Depends(require_role(["admin"]))]
