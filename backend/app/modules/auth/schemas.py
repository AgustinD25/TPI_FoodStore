from sqlmodel import SQLModel


class MensajeRespuesta(SQLModel):
    """Respuesta de login y logout. El login NO devuelve el token: viaja en la cookie HttpOnly."""

    message: str
