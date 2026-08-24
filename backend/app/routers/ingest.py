"""Recepción abierta de fotos para carruseles (sin auth).

URL: POST /ingest/{code}
Campo: file (uno o varios)
"""

from __future__ import annotations

import re

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.database import get_db
from app.models import EventBlock
from app.utils.media import save_upload

router = APIRouter(tags=["ingest"])

CODE_RE = re.compile(r"^[a-z0-9][a-z0-9\-_]{1,62}$")


def normalize_code(code: str) -> str:
    return (code or "").strip().lower()


def find_carousel_by_code(db: Session, code: str) -> EventBlock:
    code = normalize_code(code)
    if not CODE_RE.match(code):
        raise HTTPException(400, "Código inválido. Usa letras, números, guiones (ej: boda-ana).")

    blocks = db.query(EventBlock).filter(EventBlock.type == "carousel").all()
    for block in blocks:
        settings = block.settings or {}
        content = block.content or {}
        block_code = normalize_code(str(settings.get("ingest_code") or content.get("ingest_code") or ""))
        if block_code and block_code == code:
            return block
    raise HTTPException(404, f"No hay carrusel con código '{code}'. Configúralo en el editor del evento.")


@router.get("/ingest/{code}")
def ingest_info(code: str, db: Session = Depends(get_db)):
    block = find_carousel_by_code(db, code)
    items = (block.content or {}).get("items") or []
    return {
        "ok": True,
        "code": normalize_code(code),
        "event_id": block.event_id,
        "block_id": block.id,
        "items_count": len(items),
        "hint": "POST multipart campo 'file' (fotos o videos: jpg, png, webp, mp4, mov, webm).",
    }


@router.post("/ingest/{code}")
async def ingest_files(
    code: str,
    file: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    """Recibe una o varias fotos/videos y las agrega al carrusel."""
    block = find_carousel_by_code(db, code)

    uploads = [f for f in (file or []) if f and f.filename]
    if not uploads:
        raise HTTPException(400, "Envía al menos un archivo en el campo 'file'.")

    content = dict(block.content or {})
    items = list(content.get("items") or [])
    added = []

    for upload in uploads:
        media = await save_upload(upload, db)
        entry = {
            "type": media.media_type,
            "url": media.url,
            "alt": media.original_name or "",
        }
        if media.media_type == "video" and media.thumbnail_url:
            entry["poster"] = media.thumbnail_url
        items.append(entry)
        added.append({"url": media.url, "type": media.media_type, "id": media.id})

    content["items"] = items
    block.content = content
    flag_modified(block, "content")
    db.add(block)
    db.commit()

    return {
        "ok": True,
        "code": normalize_code(code),
        "added": len(added),
        "items_count": len(items),
        "files": added,
    }
