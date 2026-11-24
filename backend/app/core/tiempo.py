from datetime import datetime, timezone


def ahora() -> datetime:
    # Fecha y hora actuales en UTC, con zona horaria (SQLModel lo exige para datetime).
    return datetime.now(timezone.utc)
