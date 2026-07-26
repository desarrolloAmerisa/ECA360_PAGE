"""Add site_config table for editable branding / homepage.

Revision ID: 002_site_config
Revises: 001_initial
Create Date: 2026-07-26
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002_site_config"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "site_config",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("site_name", sa.String(120), nullable=False, server_default="ECA360"),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("favicon_url", sa.String(500), nullable=True),
        sa.Column("hero_eyebrow", sa.String(120), nullable=False, server_default="ECA360"),
        sa.Column(
            "hero_title",
            sa.String(255),
            nullable=False,
            server_default="Eventos que se cuentan en imágenes",
        ),
        sa.Column(
            "hero_subtitle",
            sa.Text(),
            nullable=False,
            server_default="Explora galerías, videos y momentos de bodas, XV años, graduaciones y más.",
        ),
        sa.Column(
            "footer_text",
            sa.Text(),
            nullable=False,
            server_default="Historias visuales de eventos inolvidables. Bodas, XV años, graduaciones y más.",
        ),
        sa.Column("color_brand", sa.String(20), nullable=False, server_default="#C1121F"),
        sa.Column("color_brand_dark", sa.String(20), nullable=False, server_default="#9B0E18"),
        sa.Column("color_ink", sa.String(20), nullable=False, server_default="#0A0A0A"),
        sa.Column("color_surface", sa.String(20), nullable=False, server_default="#F5F5F5"),
        sa.Column(
            "seo_title",
            sa.String(255),
            nullable=False,
            server_default="ECA360 Eventos — Historias que se viven",
        ),
        sa.Column(
            "seo_description",
            sa.Text(),
            nullable=False,
            server_default="Blog de eventos ECA360: bodas, XV años, graduaciones y eventos corporativos.",
        ),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("site_config")
