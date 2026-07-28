"""Add public_site_url to site_config.

Revision ID: 003_public_site_url
Revises: 002_site_config
Create Date: 2026-07-28
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003_public_site_url"
down_revision: Union[str, None] = "002_site_config"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "site_config",
        sa.Column(
            "public_site_url",
            sa.String(255),
            nullable=False,
            server_default="https://eca360.com.mx",
        ),
    )


def downgrade() -> None:
    op.drop_column("site_config", "public_site_url")
