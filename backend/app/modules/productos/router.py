from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status

from app.core.deps import SoloAdmin
from app.modules.categorias.service import CategoriaNoEncontrada
from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .service import ProductoNoEncontrado, ProductoService
from .unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]


# Lecturas públicas: devuelven solo productos activos.
@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Texto a buscar en el nombre (sin distinguir mayúsculas)"),
    categoria_id: Optional[int] = Query(None, gt=0),
    disponible: Optional[bool] = Query(None),
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{id}", response_model=ProductoRead)
def detalle_producto(service: ServiceDep, id: int = Path(..., gt=0)):
    try:
        return service.obtener(id)
    except ProductoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))


# Escrituras: solo admin.
@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate, _admin: SoloAdmin, service: ServiceDep):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))


@router.put("/{id}", response_model=ProductoRead)
def actualizar_producto(
    data: ProductoUpdate, _admin: SoloAdmin, service: ServiceDep, id: int = Path(..., gt=0)
):
    try:
        return service.actualizar(id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))


@router.patch("/{id}/stock", response_model=ProductoRead)
def cambiar_stock(
    data: ProductoStockUpdate, _admin: SoloAdmin, service: ServiceDep, id: int = Path(..., gt=0)
):
    try:
        return service.cambiar_stock(id, data)
    except ProductoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(_admin: SoloAdmin, service: ServiceDep, id: int = Path(..., gt=0)):
    try:
        service.eliminar(id)
    except ProductoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
