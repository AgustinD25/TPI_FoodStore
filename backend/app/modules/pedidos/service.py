from datetime import datetime, timezone
from typing import Optional

from app.core.tiempo import ahora
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic
from .models import DetallePedido, Pedido
from .schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from .unit_of_work import PedidoUnitOfWork

# RN-02: máquina de estados. Un estado terminal (ENTREGADO, CANCELADO) no admite cambios.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


# ---- Excepciones de dominio (el Router las traduce a un código HTTP) ----
class PedidoNoEncontrado(Exception):
    """404"""


class PedidoAjeno(Exception):
    """403: el pedido es de otro usuario."""


class StockInsuficiente(Exception):
    """400"""


class ProductoNoDisponible(Exception):
    """400"""


class ProductoRepetido(Exception):
    """400"""


class TransicionInvalida(Exception):
    """400"""


class PedidoService:
    """Reglas de negocio de los pedidos (RN-01 a RN-06). No conoce HTTP ni SQL y NO hace commit
    ni rollback: cada caso de uso corre dentro de `with self.uow` y el Unit of Work decide si
    se confirma o se descarta todo. El schema de salida se arma DENTRO del bloque."""

    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        # RN-03: devuelve al stock la cantidad de cada línea, en la MISMA transacción que cambia
        # el estado.
        for linea in pedido.items:
            producto = uow.productos.get_for_update(linea.producto_id)
            if producto is not None:
                producto.stock += linea.cantidad

    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(f"Pedido {pedido_id} no encontrado")
        return pedido

    # ---------------- RN-01: crear el pedido desde el carrito ----------------
    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            # Ningún producto repetido entre los ítems.
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Un mismo producto no puede repetirse entre los ítems")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )

            total = 0.0
            for item in data.items:
                # Por cada ítem, en la misma iteración: verificar, descontar y crear la línea.
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente de '{producto.nombre}': "
                        f"hay {producto.stock} y se pidieron {item.cantidad}"
                    )

                producto.stock -= item.cantidad  # descuento de stock
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.agregar_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # COPIA del nombre
                        precio_unitario=producto.precio_base,  # COPIA del precio
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)  # fijo desde la creación (RN-05)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ---------------- Consultas ----------------
    def listar(
        self, usuario: UserPublic, skip: int, limit: int, estado: Optional[str]
    ) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                pedidos, total = uow.pedidos.list_all(estado, skip, limit)
            else:
                pedidos, total = uow.pedidos.list_by_usuario(usuario.id, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            # RN-04: el cliente solo ve sus propios pedidos; el admin ve todos.
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    # ---------------- RN-02 / RN-03: cambios de estado ----------------
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """Uso del admin: avanza o cancela según la máquina de estados."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            # Toda transición se VALIDA antes de modificar el pedido.
            if nuevo_estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(
                    f"No se puede pasar de {pedido.estado} a {nuevo_estado}"
                )
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo_estado
            pedido.updated_at = ahora()
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """Uso del cliente dueño: cancela un pedido propio SOLO desde PENDIENTE."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = ahora()
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ---------------- Resumen para el panel ----------------
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            inicio_dia = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get("PENDIENTE", 0),
                en_preparacion=por_estado.get("EN_PREPARACION", 0),
                entregados=por_estado.get("ENTREGADO", 0),
                cancelados=por_estado.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.contar_desde(inicio_dia),
                ingresos_entregados=uow.pedidos.ingresos_entregados(),
            )
