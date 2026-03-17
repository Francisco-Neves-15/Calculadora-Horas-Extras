from collections.abc import Mapping

from sqlalchemy import inspect, text

from ..extensions import db
from ..models import OvertimeEntry, UserSettings
from .types import SettingsInput


def default_user_settings_values(defaults: Mapping[str, object]):
    return {
        "weekday_expected_minutes": defaults["DEFAULT_WEEKDAY_EXPECTED_MINUTES"],
        "saturday_expected_minutes": defaults["DEFAULT_SATURDAY_EXPECTED_MINUTES"],
        "sunday_expected_minutes": defaults["DEFAULT_SUNDAY_EXPECTED_MINUTES"],
        "weekday_overtime_multiplier": defaults["DEFAULT_WEEKDAY_OVERTIME_MULTIPLIER"],
        "saturday_overtime_multiplier": defaults["DEFAULT_SATURDAY_OVERTIME_MULTIPLIER"],
        "sunday_work_multiplier": defaults["DEFAULT_SUNDAY_WORK_MULTIPLIER"],
    }


def build_user_settings(user_id, defaults: Mapping[str, object], legacy_values=None):
    values = legacy_values or {}
    return UserSettings(
        user_id=user_id,
        gross_salary_cents=values.get("gross_salary_cents"),
        monthly_workload_minutes=values.get("monthly_workload_minutes"),
        weekly_workload_minutes=values.get("weekly_workload_minutes"),
        **default_user_settings_values(defaults),
    )


def get_legacy_settings():
    inspector = inspect(db.engine)
    if "app_settings" not in inspector.get_table_names():
        return None

    row = db.session.execute(
        text(
            "SELECT gross_salary_cents, monthly_workload_minutes "
            "FROM app_settings ORDER BY id ASC LIMIT 1"
        )
    ).mappings().first()
    return dict(row) if row else None


def claim_legacy_records(user, defaults: Mapping[str, object]):
    settings = build_user_settings(user.id, defaults, legacy_values=get_legacy_settings())
    db.session.add(settings)
    claimed_entries = (
        db.session.query(OvertimeEntry)
        .filter(OvertimeEntry.user_id.is_(None))
        .update({"user_id": user.id}, synchronize_session=False)
    )
    return settings, claimed_entries


def ensure_user_settings(user, defaults: Mapping[str, object]):
    if user.settings is not None:
        return user.settings

    settings = build_user_settings(user.id, defaults)
    db.session.add(settings)
    db.session.commit()
    return settings


def update_user_settings(settings, payload: SettingsInput):
    settings.gross_salary_cents = payload.gross_salary_cents
    settings.monthly_workload_minutes = payload.monthly_workload_minutes
    settings.weekly_workload_minutes = payload.weekly_workload_minutes
    settings.weekday_expected_minutes = payload.weekday_expected_minutes
    settings.saturday_expected_minutes = payload.saturday_expected_minutes
    settings.sunday_expected_minutes = payload.sunday_expected_minutes
    settings.weekday_overtime_multiplier = payload.weekday_overtime_multiplier
    settings.saturday_overtime_multiplier = payload.saturday_overtime_multiplier
    settings.sunday_work_multiplier = payload.sunday_work_multiplier
    db.session.commit()
    return settings
