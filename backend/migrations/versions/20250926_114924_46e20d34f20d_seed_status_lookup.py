"""seed status lookup

Revision ID: 46e20d34f20d
Revises: 659a7a1b5a2c
Create Date: 2025-09-26 11:49:24.092472

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "46e20d34f20d"
down_revision: Union[str, Sequence[str], None] = "659a7a1b5a2c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute(
        sa.text(
            """
            INSERT INTO status_lookup (code, label) VALUES
              ('created','Created'),
              ('queued','Queued'),
              ('running','Running'),
              ('failed','Failed'),
              ('completed','Completed')
            ON CONFLICT (code) DO NOTHING;
            """
        )
    )


def downgrade():
    op.execute(
        sa.text(
            "DELETE FROM status_lookup WHERE code IN ('created','queued','running','failed','completed');"
        )
    )
