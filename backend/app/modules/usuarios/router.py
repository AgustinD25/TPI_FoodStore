from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.deps import SoloAdmin
from .schemas import UserPublic
from .service import AutoDesactivacion, UsuarioNoEncontrado, UsuarioService
from .unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=List[UserPublic])
def listar_usuarios(_admin: SoloAdmin, service: ServiceDep):
    return service.listar()


@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(admin: SoloAdmin, service: ServiceDep, id: int = Path(..., gt=0)):
    try:
        return service.cambiar_estado(id, admin.id, disabled=False)
    except UsuarioNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(admin: SoloAdmin, service: ServiceDep, id: int = Path(..., gt=0)):
    try:
        return service.cambiar_estado(id, admin.id, disabled=True)
    except UsuarioNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))
    except AutoDesactivacion as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error))
