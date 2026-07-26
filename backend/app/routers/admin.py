from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MediaFile
from app.schemas import LoginRequest, LoginResponse, MediaOut, SiteSettings, SiteSettingsUpdate
from app.services import site as site_service
from app.utils.auth import make_persistent_token, require_admin, verify_password
from app.utils.media import save_upload

router = APIRouter(tags=["admin"])


@router.post("/admin/login", response_model=LoginResponse)
def admin_login(payload: LoginRequest):
    if not verify_password(payload.password):
        return LoginResponse(success=False, token="", message="Contraseña incorrecta")
    token = make_persistent_token()
    return LoginResponse(success=True, token=token, message="Sesión iniciada")


@router.post("/admin/logout")
def admin_logout(_: str = Depends(require_admin)):
    return {"success": True}


@router.get("/admin/me")
def admin_me(_: str = Depends(require_admin)):
    return {"authenticated": True}


@router.get("/settings", response_model=SiteSettings)
def get_public_settings(db: Session = Depends(get_db)):
    """Public site branding — used by homepage, navbar, footer."""
    return site_service.get_site_settings(db)


@router.get("/admin/settings", response_model=SiteSettings)
def get_admin_settings(db: Session = Depends(get_db), _: str = Depends(require_admin)):
    return site_service.get_site_settings(db)


@router.put("/admin/settings", response_model=SiteSettings)
def update_admin_settings(
    payload: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    return site_service.update_site_settings(db, payload)


@router.post("/upload", response_model=MediaOut)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    media = await save_upload(file, db)
    return media


@router.get("/media", response_model=list[MediaOut])
def list_media(db: Session = Depends(get_db), _: str = Depends(require_admin)):
    return db.query(MediaFile).order_by(MediaFile.created_at.desc()).limit(200).all()
