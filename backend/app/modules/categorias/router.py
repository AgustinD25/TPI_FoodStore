from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status

from app.core.deps import SoloAdmin
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from .unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


# Lecturas públicas: devuelven solo categorías activas.
@router.get("", response_model=List[CategoriaRead])
def listar_categorias(service: ServiceDep):
    return service.listar()


@router.get("/{id}", response_model=CategoriaRead)
def detalle_categoria(service: ServiceDep, id: int = Path(..., gt=0)):
    try:
        return service.obtener(id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))


# Escrituras: solo admin.
@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(data: CategoriaCreate, _admin: SoloAdmin, service: ServiceDep):
    try:
        return service.crear(data)
    except NombreDuplicado as error:
        raise HTTPException(status.HTTP_409_CONFLICT, str(error))


@router.put("/{id}", response_model=CategoriaRead)
def actualizar_categoria(
    data: CategoriaUpdate, _admin: SoloAdmin, service: ServiceDep, id: int = Path(..., gt=0)
):
    try:
        return service.actualizar(id, data)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))
    except NombreDuplicado as error:
        raise HTTPException(status.HTTP_409_CONFLICT, str(error))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(_admin: SoloAdmin, service: ServiceDep, id: int = Path(..., gt=0)):
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
