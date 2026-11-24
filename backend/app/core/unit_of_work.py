from typing import Callable, Optional

from sqlmodel import Session

from app.core.database import session_factory as session_factory_por_defecto


class UnitOfWork:
    """Controla la transacción de un caso de uso.

    Al entrar al bloque `with` abre una sesión y expone los repositorios que comparten esa
    sesión. Al salir hace commit si no hubo errores o rollback si se lanzó una excepción, y
    SIEMPRE cierra la sesión. Es el único lugar de la aplicación donde se llama a commit() y
    rollback(): ningún Service ni Router lo hace.
    """

    session: Session

    def __init__(self, session_factory: Callable[[], Session] = session_factory_por_defecto) -> None:
        self.session_factory = session_factory

    def _crear_repositorios(self) -> None:
        # Cada módulo sobrescribe este método para exponer los repositorios que necesita.
        raise NotImplementedError

    def __enter__(self):
        self.session = self.session_factory()
        self._crear_repositorios()
        return self

    def __exit__(self, exc_type: Optional[type], exc_val, exc_tb) -> None:
        try:
            if exc_type is not None:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            # try/finally: la sesión se cierra aunque el commit falle (por ejemplo por una
            # restricción de la base). La excepción original se vuelve a lanzar hacia el Router.
            self.session.close()
