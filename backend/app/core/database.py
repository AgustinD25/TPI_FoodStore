from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

def _normalizar_url(url: str) -> str:
    # El driver instalado es psycopg2-binary. Las versiones nuevas de SQLAlchemy interpretan
    # "postgresql://" como psycopg 3, así que se indica el driver de forma explícita.
    for prefijo in ("postgresql://", "postgres://"):
        if url.startswith(prefijo):
            return "postgresql+psycopg2://" + url[len(prefijo):]
    return url


DATABASE_URL = _normalizar_url(settings.DATABASE_URL)

# SQLite necesita check_same_thread=False porque FastAPI atiende cada request en un hilo distinto.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Una única instancia global del engine para toda la aplicación.
engine = create_engine(DATABASE_URL, connect_args=_connect_args)


def create_all_tables() -> None:
    # Importar los modelos los registra en SQLModel.metadata antes de crear las tablas.
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    # Fábrica de sesiones del Unit of Work: cada bloque `with uow` abre una sesión nueva.
    return Session(engine)


def get_session():
    # Una sesión por request, para las dependencias de autenticación (solo lecturas).
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
