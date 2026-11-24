from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import SoloAdmin, UsuarioActual
from app.modules.productos.service import ProductoNoEncontrado
from .schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from .service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from .unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    # FastAPI inyecta el Service ya armado con su Unit of Work. El Router nunca abre el UoW.
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]

# Reglas de negocio que se traducen a 400.
REGLAS_400 = (StockInsuficiente, ProductoNoDisponible, ProductoRepetido, TransicionInvalida)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, usuario: UsuarioActual, service: ServiceDep):
    """Crea el pedido desde el carrito. Es transaccional: si falla una validación no se
    persiste nada, tampoco el descuento de stock."""
    try:
        return service.crear(data, usuario)
    except (ProductoNoEncontrado, PedidoNoEncontrado) as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))
    except REGLAS_400 as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error))


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: UsuarioActual,
    service: ServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[EstadoPedido] = Query(None),
):
    """Los pedidos propios (user) o todos (admin)."""
    return service.listar(usuario, skip, limit, estado)


# IMPORTANTE: /resumen se declara ANTES de /{id}; si no, FastAPI tomaría «resumen» como un id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: SoloAdmin, service: ServiceDep):
    return service.resumen()


@router.get("/{id}", response_model=PedidoRead)
def detalle_pedido(usuario: UsuarioActual, service: ServiceDep, id: int = Path(..., gt=0)):
    try:
        return service.obtener(id, usuario)
    except PedidoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))
    except PedidoAjeno as error:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(error))


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado(
    data: CambioEstado, _admin: SoloAdmin, service: ServiceDep, id: int = Path(..., gt=0)
):
    """Solo admin: avanza o cancela según la máquina de estados."""
    try:
        return service.cambiar_estado(id, data.estado)
    except PedidoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))
    except TransicionInvalida as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error))


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(usuario: UsuarioActual, service: ServiceDep, id: int = Path(..., gt=0)):
    """El dueño cancela un pedido propio, solo desde PENDIENTE (restituye el stock)."""
    try:
        return service.cancelar(id, usuario)
    except PedidoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error))
    except PedidoAjeno as error:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(error))
    except TransicionInvalida as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error))
