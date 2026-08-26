"""standard provenance and keyword metadata"""
from alembic import op
import sqlalchemy as sa

revision = "c7d1_standard_provenance"
down_revision = "b4f2_phase23_intelligence"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("standards", sa.Column("keywords", sa.Text(), nullable=True))
    op.add_column("standards", sa.Column("is_mock", sa.Boolean(), nullable=False, server_default=sa.true()))


def downgrade():
    op.drop_column("standards", "is_mock")
    op.drop_column("standards", "keywords")