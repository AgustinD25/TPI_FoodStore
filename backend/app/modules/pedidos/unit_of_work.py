from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository
from .repository import PedidoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Los repositorios de pedidos y de productos comparten UNA sola sesión: por eso el pedido,
    sus líneas y el descuento (o la restitución) de stock viajan en la misma transacción. Si algo
    falla, el rollback del __exit__ descarta TODO, incluido el stock."""

    def _crear_repositorios(self) -> None:
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
