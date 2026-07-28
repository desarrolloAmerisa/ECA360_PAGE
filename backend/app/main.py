from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app.config import get_settings
from app.database import Base, engine
from app.routers import admin, comments, events
from app.utils.media import ensure_upload_dirs

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="CMS de eventos ECA360",
    version="1.0.0",
)

if settings.cors_allow_all:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Create tables (Alembic also available for migrations)
Base.metadata.create_all(bind=engine)


def _ensure_sqlite_columns() -> None:
    """SQLite create_all no agrega columnas nuevas a tablas ya existentes."""
    insp = inspect(engine)
    if "site_config" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("site_config")}
    if "public_site_url" not in cols:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "ALTER TABLE site_config ADD COLUMN public_site_url "
                    "VARCHAR(255) DEFAULT 'https://eca360.com.mx'"
                )
            )
            conn.execute(
                text(
                    "UPDATE site_config SET public_site_url = 'https://eca360.com.mx' "
                    "WHERE public_site_url IS NULL OR public_site_url = ''"
                )
            )


_ensure_sqlite_columns()
ensure_upload_dirs()

upload_path = Path(settings.upload_dir)
upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")

app.include_router(events.router)
app.include_router(comments.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.app_name}
