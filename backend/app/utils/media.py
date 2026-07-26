from __future__ import annotations

import uuid
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, UploadFile
from PIL import Image
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import MediaFile

IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"}
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
VIDEO_EXTS = {".mp4", ".mov", ".webm", ".avi"}


def ensure_upload_dirs() -> dict[str, Path]:
    settings = get_settings()
    base = Path(settings.upload_dir)
    dirs = {
        "images": base / "images",
        "videos": base / "videos",
        "thumbnails": base / "thumbnails",
    }
    for d in dirs.values():
        d.mkdir(parents=True, exist_ok=True)
    return dirs


def _unique_name(original: str) -> str:
    ext = Path(original).suffix.lower() or ".bin"
    return f"{uuid.uuid4().hex}{ext}"


def compress_image(src: Path, dest: Path, max_width: int = 1920, quality: int = 82) -> tuple[int, int]:
    with Image.open(src) as img:
        img = img.convert("RGB") if img.mode in ("RGBA", "P") else img
        w, h = img.size
        if w > max_width:
            ratio = max_width / w
            img = img.resize((max_width, int(h * ratio)), Image.Resampling.LANCZOS)
        img.save(dest, optimize=True, quality=quality)
        return img.size


def make_thumbnail(src: Path, dest: Path, size: tuple[int, int] = (400, 400)) -> None:
    with Image.open(src) as img:
        img = img.convert("RGB") if img.mode in ("RGBA", "P") else img
        img.thumbnail(size, Image.Resampling.LANCZOS)
        img.save(dest, optimize=True, quality=75)


async def save_upload(file: UploadFile, db: Session) -> MediaFile:
    settings = get_settings()
    dirs = ensure_upload_dirs()

    content_type = file.content_type or "application/octet-stream"
    original = file.filename or "file"
    ext = Path(original).suffix.lower()

    is_image = content_type in IMAGE_TYPES or ext in IMAGE_EXTS
    is_video = content_type in VIDEO_TYPES or ext in VIDEO_EXTS

    if not is_image and not is_video:
        raise HTTPException(400, "Tipo de archivo no permitido. Usa imágenes o videos (MP4, MOV, WebM).")

    data = await file.read()
    size = len(data)
    max_mb = settings.max_image_size_mb if is_image else settings.max_video_size_mb
    if size > max_mb * 1024 * 1024:
        raise HTTPException(400, f"Archivo demasiado grande. Máximo {max_mb} MB.")

    filename = _unique_name(original)
    media_type = "image" if is_image else "video"
    folder = dirs["images"] if is_image else dirs["videos"]
    dest = folder / filename
    dest.write_bytes(data)

    width = height = None
    thumbnail_url: Optional[str] = None
    url = f"/uploads/{'images' if is_image else 'videos'}/{filename}"

    if is_image:
        try:
            compressed = folder / f"c_{filename}"
            if dest.suffix.lower() != ".gif":
                width, height = compress_image(dest, compressed)
                dest.unlink(missing_ok=True)
                compressed.rename(dest)
            else:
                with Image.open(dest) as img:
                    width, height = img.size

            thumb_name = f"t_{Path(filename).stem}.jpg"
            thumb_path = dirs["thumbnails"] / thumb_name
            make_thumbnail(dest, thumb_path)
            thumbnail_url = f"/uploads/thumbnails/{thumb_name}"
        except Exception:
            pass

    media = MediaFile(
        filename=filename,
        original_name=original,
        media_type=media_type,
        mime_type=content_type,
        url=url,
        thumbnail_url=thumbnail_url,
        size_bytes=size,
        width=width,
        height=height,
        duration=None,
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media
