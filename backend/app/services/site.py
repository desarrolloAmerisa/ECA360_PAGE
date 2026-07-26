from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from app.models import SiteConfig
from app.schemas import SiteSettings, SiteSettingsUpdate

DEFAULTS = SiteSettings().model_dump()


def get_or_create_config(db: Session) -> SiteConfig:
    row = db.query(SiteConfig).filter(SiteConfig.id == 1).first()
    if row:
        return row
    row = SiteConfig(id=1, **DEFAULTS)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def get_site_settings(db: Session) -> SiteSettings:
    row = get_or_create_config(db)
    return SiteSettings.model_validate(row)


def update_site_settings(db: Session, payload: SiteSettingsUpdate) -> SiteSettings:
    row = get_or_create_config(db)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(row, key, value)
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return SiteSettings.model_validate(row)
