# Food Store — Trabajo Práctico Integrador (Programación IV, TUP)

Aplicación web de pedidos de comida: catálogo público, carrito, pedidos con control de stock y panel de administración.

- **Backend:** FastAPI + SQLModel + PostgreSQL, arquitectura en capas (Router → Service → UnitOfWork → Repository → Model).
- **Frontend:** React + TypeScript + Vite + Tailwind CSS, organizado por *features*.
- **Autenticación:** JWT en cookie `HttpOnly`, roles `admin` y `user`.

| | |
|---|---|
| Repositorio | https://github.com/AgustinD25/TPI_FoodStore |
| Video de demostración | https://www.youtube.com/watch?v=6CFARHi9wyI |
| Alumno | Agustín Díaz |

## Estructura

```
TPI_FoodStore/
├── backend/    API REST (FastAPI)
│   └── app/
│       ├── core/       configuración, base de datos, seguridad, UnitOfWork base
│       ├── db/         seed inicial
│       └── modules/    auth · usuarios · categorias · productos · pedidos
│           └── <modulo>/  models · schemas · repository · unit_of_work · service · router
└── frontend/   SPA (React)
    └── src/
        ├── features/   auth · categorias · productos · pedidos · usuarios
        ├── shared/     api, layout, componentes y UI reutilizables
        ├── store/      Zustand (authStore, cartStore)
        └── routes/     AppRouter y ProtectedRoute
```

## Requisitos

- Python 3.11 o superior (probado con 3.13)
- Node.js 20 o superior y [pnpm](https://pnpm.io)
- PostgreSQL 14 o superior

## Puesta en marcha

### 1. Base de datos

Crear una base vacía (las tablas se crean solas al iniciar el backend):

```sql
CREATE DATABASE foodstore_db;
```

### 2. Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Editar `backend/.env` y completar `DATABASE_URL` (usuario, contraseña) y `SECRET_KEY`
(`python -c "import secrets; print(secrets.token_urlsafe(48))"`).

Cargar los datos iniciales (administrador, categorías y productos; se puede repetir sin duplicar):

```powershell
python -m app.db.seed
```

Iniciar el servidor:

```powershell
uvicorn app.main:app --reload
```

API en `http://localhost:8000` — documentación interactiva en `http://localhost:8000/docs`.

### 3. Frontend

```powershell
cd frontend
pnpm install
copy .env.example .env
pnpm dev
```

Aplicación en `http://localhost:5173`.

## Variables de entorno

| Archivo | Variable | Descripción |
|---|---|---|
| `backend/.env` | `DATABASE_URL` | Conexión a PostgreSQL (también acepta `sqlite:///./foodstore.db` para pruebas) |
| | `SECRET_KEY` | Clave de firma del JWT (mínimo 32 caracteres) |
| | `ALGORITHM` | `HS256` |
| | `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión (30) |
| | `FRONTEND_ORIGIN` | Origen permitido por CORS (`http://localhost:5173`) |
| `frontend/.env` | `VITE_API_URL` | URL base de la API (`http://localhost:8000/api/v1`) |

## Usuario administrador de prueba

Lo crea el seed: usuario `admin`, contraseña `Admin1234!`. Los clientes se registran desde la pantalla «Registrarse».

## Funcionalidades

**Cliente**
- Catálogo con búsqueda por nombre, filtro por categoría y paginación.
- Carrito persistente en el navegador (cantidades limitadas por stock).
- Confirmación del pedido (dirección, forma de pago, notas) y listado «Mis pedidos» con cancelación mientras está pendiente.

**Administrador**
- Resumen con indicadores (pedidos por estado, pedidos de hoy, ingresos).
- ABM de categorías y productos (baja lógica), ajuste de stock.
- Gestión de pedidos con filtro por estado y cambio de estado.
- Activar / desactivar usuarios.

## Reglas de negocio

- **RN-01** Precio y nombre del producto se copian al detalle del pedido: cambiar el producto después no altera pedidos existentes.
- **RN-02** El stock se descuenta al crear el pedido y se devuelve al cancelarlo.
- **RN-03** Un producto no disponible o sin stock suficiente rechaza el pedido completo.
- **RN-04** Máquina de estados: `PENDIENTE → EN_PREPARACION → ENTREGADO`; se puede cancelar desde `PENDIENTE` o `EN_PREPARACION`. `ENTREGADO` y `CANCELADO` son finales.
- **RN-05** Un cliente solo ve y cancela sus propios pedidos; el administrador gestiona todos.
- **RN-06** Las bajas son lógicas (campos booleanos), no se borran filas.
- La creación del pedido es **atómica**: si un ítem falla, se revierte todo (incluido el stock) en el `UnitOfWork`.

## Endpoints principales (`/api/v1`)

| Módulo | Endpoints |
|---|---|
| auth | `POST /auth/register`, `POST /auth/token`, `GET /auth/me`, `POST /auth/logout` |
| usuarios (admin) | `GET /admin/usuarios`, `POST /admin/usuarios/{id}/activar`, `POST /admin/usuarios/{id}/desactivar` |
| categorias | `GET`, `POST`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` |
| productos | `GET` (búsqueda, categoría, paginación), `POST`, `GET /{id}`, `PUT /{id}`, `PATCH /{id}/stock`, `DELETE /{id}` |
| pedidos | `POST`, `GET`, `GET /resumen` (admin), `GET /{id}`, `PATCH /{id}/estado` (admin), `PATCH /{id}/cancelar` |

El detalle completo y las pruebas manuales están en `http://localhost:8000/docs`.
