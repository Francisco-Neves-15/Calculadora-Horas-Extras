"""api first initial schema

Revision ID: 0001_api_first_initial
Revises:
Create Date: 2026-03-10 00:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_api_first_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = set(inspector.get_table_names())

    if "users" not in table_names:
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("display_name", sa.String(length=120), nullable=False),
            sa.Column("password_hash", sa.String(length=255), nullable=False),
            sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("last_login_at", sa.DateTime(), nullable=True),
        )
        op.create_index("ix_users_email", "users", ["email"], unique=True)

    if "user_settings" not in table_names:
        op.create_table(
            "user_settings",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("gross_salary_cents", sa.Integer(), nullable=True),
            sa.Column("monthly_workload_minutes", sa.Integer(), nullable=True),
            sa.Column("weekly_workload_minutes", sa.Integer(), nullable=True),
            sa.Column("weekday_expected_minutes", sa.Integer(), nullable=False, server_default="480"),
            sa.Column("saturday_expected_minutes", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("sunday_expected_minutes", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("weekday_overtime_multiplier", sa.Float(), nullable=False, server_default="1.5"),
            sa.Column("saturday_overtime_multiplier", sa.Float(), nullable=False, server_default="1.5"),
            sa.Column("sunday_work_multiplier", sa.Float(), nullable=False, server_default="2.0"),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
        )
        op.create_index("ix_user_settings_user_id", "user_settings", ["user_id"], unique=True)

    if "overtime_entries" not in table_names:
        op.create_table(
            "overtime_entries",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("entry_date", sa.Date(), nullable=False),
            sa.Column("movement_type", sa.String(length=10), nullable=False),
            sa.Column("duration_minutes", sa.Integer(), nullable=False),
            sa.Column("category", sa.String(length=80), nullable=False),
            sa.Column("notes", sa.Text(), nullable=False),
            sa.Column("entry_mode", sa.String(length=20), nullable=False, server_default="manual"),
            sa.Column("start_time", sa.Time(), nullable=True),
            sa.Column("end_time", sa.Time(), nullable=True),
            sa.Column("break_minutes", sa.Integer(), nullable=True),
            sa.Column("expected_minutes", sa.Integer(), nullable=True),
            sa.Column("worked_minutes", sa.Integer(), nullable=True),
            sa.Column("overtime_minutes", sa.Integer(), nullable=True),
            sa.Column("night_minutes", sa.Integer(), nullable=True),
            sa.Column("weekend_minutes", sa.Integer(), nullable=True),
            sa.Column("weekend_credit_minutes", sa.Integer(), nullable=True),
            sa.Column("night_bonus_minutes", sa.Integer(), nullable=True),
            sa.Column("estimated_value_cents", sa.Integer(), nullable=True),
            sa.Column("applied_weekday_expected_minutes", sa.Integer(), nullable=True),
            sa.Column("applied_saturday_expected_minutes", sa.Integer(), nullable=True),
            sa.Column("applied_sunday_expected_minutes", sa.Integer(), nullable=True),
            sa.Column("applied_weekday_overtime_multiplier", sa.Float(), nullable=True),
            sa.Column("applied_saturday_overtime_multiplier", sa.Float(), nullable=True),
            sa.Column("applied_sunday_work_multiplier", sa.Float(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
        )
        op.create_index("ix_overtime_entries_entry_date", "overtime_entries", ["entry_date"], unique=False)
        op.create_index("ix_overtime_entries_category", "overtime_entries", ["category"], unique=False)
        op.create_index("ix_overtime_entries_user_id", "overtime_entries", ["user_id"], unique=False)
        return

    existing_columns = {column["name"] for column in inspector.get_columns("overtime_entries")}
    required_columns = [
        ("user_id", sa.Column("user_id", sa.Integer(), nullable=True)),
        ("entry_mode", sa.Column("entry_mode", sa.String(length=20), nullable=False, server_default="manual")),
        ("start_time", sa.Column("start_time", sa.Time(), nullable=True)),
        ("end_time", sa.Column("end_time", sa.Time(), nullable=True)),
        ("break_minutes", sa.Column("break_minutes", sa.Integer(), nullable=True)),
        ("expected_minutes", sa.Column("expected_minutes", sa.Integer(), nullable=True)),
        ("worked_minutes", sa.Column("worked_minutes", sa.Integer(), nullable=True)),
        ("overtime_minutes", sa.Column("overtime_minutes", sa.Integer(), nullable=True)),
        ("night_minutes", sa.Column("night_minutes", sa.Integer(), nullable=True)),
        ("weekend_minutes", sa.Column("weekend_minutes", sa.Integer(), nullable=True)),
        ("weekend_credit_minutes", sa.Column("weekend_credit_minutes", sa.Integer(), nullable=True)),
        ("night_bonus_minutes", sa.Column("night_bonus_minutes", sa.Integer(), nullable=True)),
        ("estimated_value_cents", sa.Column("estimated_value_cents", sa.Integer(), nullable=True)),
        (
            "applied_weekday_expected_minutes",
            sa.Column("applied_weekday_expected_minutes", sa.Integer(), nullable=True),
        ),
        (
            "applied_saturday_expected_minutes",
            sa.Column("applied_saturday_expected_minutes", sa.Integer(), nullable=True),
        ),
        (
            "applied_sunday_expected_minutes",
            sa.Column("applied_sunday_expected_minutes", sa.Integer(), nullable=True),
        ),
        (
            "applied_weekday_overtime_multiplier",
            sa.Column("applied_weekday_overtime_multiplier", sa.Float(), nullable=True),
        ),
        (
            "applied_saturday_overtime_multiplier",
            sa.Column("applied_saturday_overtime_multiplier", sa.Float(), nullable=True),
        ),
        (
            "applied_sunday_work_multiplier",
            sa.Column("applied_sunday_work_multiplier", sa.Float(), nullable=True),
        ),
    ]

    for column_name, column in required_columns:
        if column_name not in existing_columns:
            op.add_column("overtime_entries", column)

    existing_indexes = {index["name"] for index in inspector.get_indexes("overtime_entries")}
    if "ix_overtime_entries_user_id" not in existing_indexes:
        op.create_index("ix_overtime_entries_user_id", "overtime_entries", ["user_id"], unique=False)


def downgrade():
    pass
