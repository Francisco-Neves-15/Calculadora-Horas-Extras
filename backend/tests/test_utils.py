from types import SimpleNamespace
from datetime import date, time

from app.utils import (
    CalculationRules,
    calculate_entry_result,
    default_schedule_label,
    derive_monthly_minutes_from_weekly,
    estimated_value_from_minutes,
    format_currency,
    format_minutes,
    format_multiplier_label,
    format_signed_minutes,
    hourly_rate_cents,
    parse_duration_to_minutes,
    rules_from_settings,
    validate_email_address,
)


def test_parse_duration_to_minutes_supports_variable_hours():
    assert parse_duration_to_minutes("01:30") == 90
    assert parse_duration_to_minutes("173:20", allow_variable_hour_digits=True) == 10400


def test_derive_monthly_minutes_from_weekly():
    assert derive_monthly_minutes_from_weekly(2400) == 10400


def test_rules_from_settings():
    settings = SimpleNamespace(
        weekday_expected_minutes=480,
        saturday_expected_minutes=0,
        sunday_expected_minutes=0,
        weekday_overtime_multiplier=1.5,
        saturday_overtime_multiplier=1.5,
        sunday_work_multiplier=2.0,
    )
    defaults = {
        "DEFAULT_WEEKDAY_EXPECTED_MINUTES": 480,
        "DEFAULT_SATURDAY_EXPECTED_MINUTES": 0,
        "DEFAULT_SUNDAY_EXPECTED_MINUTES": 0,
        "DEFAULT_WEEKDAY_OVERTIME_MULTIPLIER": 1.5,
        "DEFAULT_SATURDAY_OVERTIME_MULTIPLIER": 1.5,
        "DEFAULT_SUNDAY_WORK_MULTIPLIER": 2.0,
    }

    rules = rules_from_settings(settings, defaults)
    assert isinstance(rules, CalculationRules)
    assert rules.saturday_overtime_multiplier == 1.5


def test_calculate_entry_result_for_saturday_rule():
    rules = CalculationRules(
        weekday_expected_minutes=480,
        saturday_expected_minutes=0,
        sunday_expected_minutes=0,
        weekday_overtime_multiplier=1.5,
        saturday_overtime_multiplier=1.5,
        sunday_work_multiplier=2.0,
    )

    result = calculate_entry_result(
        date(2026, 3, 7),
        time(9, 0),
        time(12, 0),
        0,
        None,
        rules,
    )

    assert result.worked_minutes == 180
    assert result.overtime_minutes == 180
    assert result.weekend_minutes == 180
    assert result.credited_minutes == 270


def test_calculate_entry_result_for_sunday_night_rule():
    rules = CalculationRules(
        weekday_expected_minutes=480,
        saturday_expected_minutes=0,
        sunday_expected_minutes=0,
        weekday_overtime_multiplier=1.5,
        saturday_overtime_multiplier=1.5,
        sunday_work_multiplier=2.0,
    )

    result = calculate_entry_result(
        date(2026, 3, 8),
        time(22, 0),
        time(23, 0),
        0,
        None,
        rules,
    )

    assert result.night_minutes == 60
    assert result.weekend_minutes == 60
    assert result.credited_minutes == 165


def test_financial_and_format_helpers():
    assert estimated_value_from_minutes(270, 431800, 10340) == 11275
    assert hourly_rate_cents(431800, 10340) == 2506
    assert format_currency(11275) == "R$ 112,75"
    assert format_minutes(10400) == "173:20"
    assert format_signed_minutes(-90) == "-01:30"
    assert format_multiplier_label(1.5) == "+50%"
    assert "sab 00:00" in default_schedule_label(
        CalculationRules(480, 0, 0, 1.5, 1.5, 2.0)
    )


def test_validate_email_address():
    assert validate_email_address("isaac@example.com") is True
    assert validate_email_address("isaac") is False
