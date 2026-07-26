"""Initial schema for ECA360 events CMS.

Revision ID: 001_initial
Revises:
Create Date: 2026-07-25
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("excerpt", sa.Text(), nullable=True),
        sa.Column("cover_image", sa.String(500), nullable=True),
        sa.Column("event_date", sa.DateTime(), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("template", sa.String(50), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("seo_title", sa.String(255), nullable=True),
        sa.Column("seo_description", sa.Text(), nullable=True),
        sa.Column("og_image", sa.String(500), nullable=True),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_events_id", "events", ["id"])
    op.create_index("ix_events_slug", "events", ["slug"], unique=True)
    op.create_index("ix_events_status", "events", ["status"])
    op.create_index("ix_events_year", "events", ["year"])

    op.create_table(
        "event_blocks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("content", sa.JSON(), nullable=True),
        sa.Column("settings", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_event_blocks_id", "event_blocks", ["id"])
    op.create_index("ix_event_blocks_event_id", "event_blocks", ["event_id"])

    op.create_table(
        "comments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("approved", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_comments_id", "comments", ["id"])
    op.create_index("ix_comments_event_id", "comments", ["event_id"])

    op.create_table(
        "media_files",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("original_name", sa.String(255), nullable=False),
        sa.Column("media_type", sa.String(20), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("thumbnail_url", sa.String(500), nullable=True),
        sa.Column("size_bytes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("duration", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_media_files_id", "media_files", ["id"])


def downgrade() -> None:
    op.drop_table("media_files")
    op.drop_table("comments")
    op.drop_table("event_blocks")
    op.drop_table("events")
