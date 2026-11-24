from typing import Generic, Optional, Type, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """CRUD genérico. Cada módulo lo hereda y agrega las consultas propias de su dominio.

    Regla de la arquitectura: un repositorio NUNCA llama a commit() y no tiene reglas de
    negocio. Solo hace flush(), que envía el cambio dentro de la transacción en curso (así el
    id ya está disponible) pero deja que el Unit of Work decida si se confirma o se descarta.
    """

    def __init__(self, model: Type[T], session: Session) -> None:
        self.model = model
        self.session = session

    def get_by_id(self, id: int) -> Optional[T]:
        return self.session.get(self.model, id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
