from collections.abc import Mapping

from sqlalchemy import select

from ..errors import NotFoundError, ValidationError
from ..extensions import db
from ..models import OvertimeEntry
from ..utils import (
    CALCULATED_ENTRY_MODE,
    MANUAL_ENTRY_MODE,
    calculate_entry_result,
    estimated_value_from_minutes,
    rules_from_settings,
)
from .types import EntryInput


def get_entry_for_user(user_id, entry_id):
    entry = db.session.execute(
        select(OvertimeEntry)
        .where(OvertimeEntry.id == entry_id)
        .where(OvertimeEntry.user_id == user_id)
    ).scalars().first()

    if entry is None:
        raise NotFoundError(
            "Lancamento nao encontrado.",
            code="entry_not_found",
        )
    return entry


def create_entry(user, settings, payload: EntryInput, defaults: Mapping[str, object]):
    entry = OvertimeEntry()
    _populate_entry(entry, user.id, payload, settings, defaults)
    db.session.add(entry)
    db.session.commit()
    return entry


def update_entry(entry, user, settings, payload: EntryInput, defaults: Mapping[str, object]):
    _populate_entry(entry, user.id, payload, settings, defaults)
    db.session.commit()
    return entry


def delete_entry(entry):
    db.session.delete(entry)
    db.session.commit()


def _populate_entry(entry, user_id, payload: EntryInput, settings, defaults: Mapping[str, object]):
    rules = rules_from_settings(settings, defaults)

    entry.user_id = user_id
    entry.entry_date = payload.entry_date
    entry.entry_mode = payload.entry_mode or MANUAL_ENTRY_MODE
    entry.category = payload.category.strip()
    entry.notes = (payload.notes or "").strip()

    if entry.entry_mode == MANUAL_ENTRY_MODE:
        if payload.duration_minutes is None or payload.duration_minutes <= 0:
            raise ValidationError(
                "Informe uma duracao manual valida.",
                code="invalid_duration_minutes",
                details={"field": "duration_minutes"},
            )

        entry.movement_type = payload.movement_type
        entry.duration_minutes = payload.duration_minutes
        signed_minutes = (
            entry.duration_minutes
            if entry.movement_type == "credit"
            else -entry.duration_minutes
        )
        entry.estimated_value_cents = estimated_value_from_minutes(
            signed_minutes,
            settings.gross_salary_cents,
            settings.monthly_workload_minutes,
        )
        _reset_calculation_fields(entry)
        return

    if payload.start_time is None or payload.end_time is None:
        raise ValidationError(
            "Informe o horario de inicio e fim do lancamento calculado.",
            code="invalid_calculated_entry",
        )

    try:
        result = calculate_entry_result(
            payload.entry_date,
            payload.start_time,
            payload.end_time,
            payload.break_minutes,
            payload.expected_minutes,
            rules,
        )
    except ValueError as exc:
        raise ValidationError(str(exc), code="invalid_calculated_entry") from exc

    entry.movement_type = "credit"
    entry.duration_minutes = result.credited_minutes
    entry.start_time = payload.start_time
    entry.end_time = payload.end_time
    entry.break_minutes = payload.break_minutes
    entry.expected_minutes = result.expected_minutes
    entry.worked_minutes = result.worked_minutes
    entry.overtime_minutes = result.overtime_minutes
    entry.night_minutes = result.night_minutes
    entry.weekend_minutes = result.weekend_minutes
    entry.weekend_credit_minutes = result.weekend_credit_minutes
    entry.night_bonus_minutes = result.night_bonus_minutes
    entry.estimated_value_cents = estimated_value_from_minutes(
        entry.duration_minutes,
        settings.gross_salary_cents,
        settings.monthly_workload_minutes,
    )
    entry.applied_weekday_expected_minutes = rules.weekday_expected_minutes
    entry.applied_saturday_expected_minutes = rules.saturday_expected_minutes
    entry.applied_sunday_expected_minutes = rules.sunday_expected_minutes
    entry.applied_weekday_overtime_multiplier = rules.weekday_overtime_multiplier
    entry.applied_saturday_overtime_multiplier = rules.saturday_overtime_multiplier
    entry.applied_sunday_work_multiplier = rules.sunday_work_multiplier


def _reset_calculation_fields(entry):
    entry.start_time = None
    entry.end_time = None
    entry.break_minutes = None
    entry.expected_minutes = None
    entry.worked_minutes = None
    entry.overtime_minutes = None
    entry.night_minutes = None
    entry.weekend_minutes = None
    entry.weekend_credit_minutes = None
    entry.night_bonus_minutes = None
    entry.applied_weekday_expected_minutes = None
    entry.applied_saturday_expected_minutes = None
    entry.applied_sunday_expected_minutes = None
    entry.applied_weekday_overtime_multiplier = None
    entry.applied_saturday_overtime_multiplier = None
    entry.applied_sunday_work_multiplier = None
