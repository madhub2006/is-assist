"""phase 2 and 3 intelligence metadata"""
from alembic import op
import sqlalchemy as sa

revision = "b4f2_phase23_intelligence"
down_revision = "da62250322bb"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("analysis_requirements", sa.Column("source_text", sa.Text(), nullable=True))
    if op.get_bind().dialect.name == "postgresql":
        savepoint = op.get_bind().begin_nested()
        try:
            op.execute("CREATE EXTENSION IF NOT EXISTS vector")
            op.execute("ALTER TABLE standards ADD COLUMN IF NOT EXISTS embedding vector(384)")
            op.execute("CREATE INDEX IF NOT EXISTS ix_standards_embedding_hnsw ON standards USING hnsw (embedding vector_cosine_ops)")
            savepoint.commit()
        except Exception:
            # Some managed PostgreSQL plans do not expose pgvector; JSON embeddings remain usable.
            savepoint.rollback()


def downgrade():
    if op.get_bind().dialect.name == "postgresql":
        savepoint = op.get_bind().begin_nested()
        try:
            op.execute("DROP INDEX IF EXISTS ix_standards_embedding_hnsw")
            op.execute("ALTER TABLE standards DROP COLUMN IF EXISTS embedding")
            savepoint.commit()
        except Exception:
            savepoint.rollback()
    op.drop_column("analysis_requirements", "source_text")
