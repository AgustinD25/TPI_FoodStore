"""Carga los datos iniciales. Es IDEMPOTENTE: se puede ejecutar varias veces sin duplicar nada.

Uso, desde la carpeta backend/ y con el entorno virtual activado:
    python -m app.db.seed

Crea (solo si faltan):
  - el usuario administrador:  admin / Admin1234!   (rol admin)
  - 4 categorías
  - 8 productos con stock
"""
from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = [
    ("Pizzas", "Pizzas al horno de piedra"),
    ("Empanadas", "Empanadas artesanales"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Dulces para cerrar la comida"),
]

# (nombre, descripcion, precio_base, stock, categoria)
PRODUCTOS = [
    ("Pizza muzzarella", "Pizza grande de muzzarella", 8500.0, 20, "Pizzas"),
    ("Pizza napolitana", "Con tomate, ajo y albahaca", 9200.0, 15, "Pizzas"),
    ("Empanada de carne", "Empanada de carne cortada a cuchillo", 1200.0, 60, "Empanadas"),
    ("Empanada de jamón y queso", "Empanada al horno", 1100.0, 50, "Empanadas"),
    ("Gaseosa 1.5 L", "Línea cola", 2500.0, 30, "Bebidas"),
    ("Agua mineral 500 ml", "Sin gas", 900.0, 40, "Bebidas"),
    ("Flan casero", "Con dulce de leche y crema", 3200.0, 12, "Postres"),
    ("Tiramisú", "Porción individual", 4100.0, 8, "Postres"),
]


def crear_admin(session: Session) -> None:
    existente = session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first()
    if existente:
        print(f"Admin: '{ADMIN['username']}' ya existe, se omite")
        return
    session.add(
        Usuario(
            username=ADMIN["username"],
            full_name=ADMIN["full_name"],
            email=ADMIN["email"],
            hashed_password=hash_password(ADMIN["password"]),
            role="admin",
        )
    )
    session.commit()
    print(f"Admin: '{ADMIN['username']}' creado con el rol admin")


def cargar_catalogo(session: Session) -> None:
    creadas = 0
    por_nombre: dict[str, Categoria] = {}
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            session.flush()
            creadas += 1
        por_nombre[nombre] = categoria

    productos = 0
    for nombre, descripcion, precio, stock, categoria in PRODUCTOS:
        if session.exec(select(Producto).where(Producto.nombre == nombre)).first() is None:
            session.add(
                Producto(
                    categoria_id=por_nombre[categoria].id,
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    stock=stock,
                )
            )
            productos += 1
    session.commit()
    print(f"Catálogo: {creadas} categorías y {productos} productos creados")


def main() -> None:
    create_all_tables()
    with Session(engine) as session:
        crear_admin(session)
        cargar_catalogo(session)


if __name__ == "__main__":
    main()
