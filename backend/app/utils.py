import re
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from decimal import Decimal, ROUND_HALF_UP

MONTH_NAMES = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
]

MANUAL_ENTRY_MODE = "manual"
CALCULATED_ENTRY_MODE = "calculated"

_DURATION_PATTERN = re.compile(r"^\d{2}:\d{2}$")
_VARIABLE_HOUR_PATTERN = re.compile(r"^\d+:\d{2}$")
_EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_DECIMAL_ZERO = Decimal("0")
_DECIMAL_ONE = Decimal("1")
_NIGHT_EQUIVALENT_FACTOR = Decimal("48") / Decimal("35")


@dataclass(frozen=True)
class CalculationRules:
    weekday_expected_minutes: int
    saturday_expected_minutes: int
    sunday_expected_minutes: int
    weekday_overtime_multiplier: float
    saturday_overtime_multiplier: float
    sunday_work_multiplier: float


@dataclass(frozen=True)
class CalculationResult:
    worked_minutes: int
    expected_minutes: int
    overtime_minutes: int
    night_minutes: int
    weekend_minutes: int
    weekend_credit_minutes: int
    night_bonus_minutes: int
    credited_minutes: int


def parse_duration_to_minutes(value, *, allow_zero=False, allow_variable_hour_digits=False):
    cleaned = (value or "").strip()
    pattern = _VARIABLE_HOUR_PATTERN if allow_variable_hour_digits else _DURATION_PATTERN
    if not pattern.fullmatch(cleaned):
        raise ValueError("Use o formato HH:MM com dois digitos em cada parte.")

    hours, minutes = (int(part) for part in cleaned.split(":", maxsplit=1))
    if minutes > 59:
        raise ValueError("Os minutos devem ficar entre 00 e 59.")
    if not allow_zero and hours == 0 and minutes == 0:
        raise ValueError("A duracao deve ser maior que zero.")

    return hours * 60 + minutes


def parse_optional_duration_to_minutes(value, *, allow_zero=True, allow_variable_hour_digits=False):
    cleaned = (value or "").strip()
    if not cleaned:
        return None

    return parse_duration_to_minutes(
        cleaned,
        allow_zero=allow_zero,
        allow_variable_hour_digits=allow_variable_hour_digits,
    )


def normalize_email(value):
    return (value or "").strip().lower()


def validate_email_address(value):
    return bool(_EMAIL_PATTERN.fullmatch(normalize_email(value)))


def format_minutes(total_minutes):
    absolute_minutes = abs(int(total_minutes or 0))
    hours, minutes = divmod(absolute_minutes, 60)
    return f"{hours:02d}:{minutes:02d}"


def format_signed_minutes(total_minutes):
    prefix = "+" if int(total_minutes or 0) >= 0 else "-"
    return f"{prefix}{format_minutes(total_minutes)}"


def format_time_value(time_value):
    if not time_value:
        return "-"
    return time_value.strftime("%H:%M")


def format_currency(cents_value):
    if cents_value in (None, ""):
        return "-"

    value = int(cents_value)
    sign = "-" if value < 0 else ""
    absolute_value = abs(value)
    reais, cents = divmod(absolute_value, 100)
    formatted_reais = f"{reais:,}".replace(",", ".")
    return f"{sign}R$ {formatted_reais},{cents:02d}"


def format_multiplier_label(multiplier):
    if multiplier is None:
        return "-"

    bonus = (Decimal(str(multiplier)) - Decimal("1")) * Decimal("100")
    value = bonus.quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    prefix = "+" if value >= 0 else ""
    return f"{prefix}{value}%"


def month_start(year, month):
    return date(year, month, 1)


def previous_month_start(current_month):
    if current_month.month == 1:
        return date(current_month.year - 1, 12, 1)
    return date(current_month.year, current_month.month - 1, 1)


def month_label(year, month):
    return f"{MONTH_NAMES[month - 1]}/{year}"


def signed_minutes_from_values(movement_type, duration_minutes):
    if movement_type == "credit":
        return duration_minutes
    if movement_type == "debit":
        return -duration_minutes
    raise ValueError("Tipo de movimento invalido.")


def derive_monthly_minutes_from_weekly(weekly_minutes):
    if weekly_minutes in (None, 0):
        return None

    value = Decimal(weekly_minutes) * Decimal("52") / Decimal("12")
    return int(value.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def estimated_value_from_minutes(credited_minutes, gross_salary_cents, monthly_workload_minutes):
    if gross_salary_cents in (None, "") or monthly_workload_minutes in (None, 0):
        return None

    value = (Decimal(credited_minutes) * Decimal(gross_salary_cents)) / Decimal(monthly_workload_minutes)
    return _round_decimal(value)


def hourly_rate_cents(gross_salary_cents, monthly_workload_minutes):
    if gross_salary_cents in (None, "") or monthly_workload_minutes in (None, 0):
        return None

    value = (Decimal(gross_salary_cents) * Decimal("60")) / Decimal(monthly_workload_minutes)
    return _round_decimal(value)


def rules_from_settings(settings, defaults):
    if settings is None:
        return CalculationRules(
            weekday_expected_minutes=defaults["DEFAULT_WEEKDAY_EXPECTED_MINUTES"],
            saturday_expected_minutes=defaults["DEFAULT_SATURDAY_EXPECTED_MINUTES"],
            sunday_expected_minutes=defaults["DEFAULT_SUNDAY_EXPECTED_MINUTES"],
            weekday_overtime_multiplier=defaults["DEFAULT_WEEKDAY_OVERTIME_MULTIPLIER"],
            saturday_overtime_multiplier=defaults["DEFAULT_SATURDAY_OVERTIME_MULTIPLIER"],
            sunday_work_multiplier=defaults["DEFAULT_SUNDAY_WORK_MULTIPLIER"],
        )

    return CalculationRules(
        weekday_expected_minutes=settings.weekday_expected_minutes,
        saturday_expected_minutes=settings.saturday_expected_minutes,
        sunday_expected_minutes=settings.sunday_expected_minutes,
        weekday_overtime_multiplier=settings.weekday_overtime_multiplier,
        saturday_overtime_multiplier=settings.saturday_overtime_multiplier,
        sunday_work_multiplier=settings.sunday_work_multiplier,
    )


def default_expected_minutes_for_date(entry_date, rules):
    weekday = entry_date.weekday()
    if weekday == 5:
        return rules.saturday_expected_minutes
    if weekday == 6:
        return rules.sunday_expected_minutes
    return rules.weekday_expected_minutes


def default_schedule_label(rules):
    return (
        "Padrao do perfil: seg-sex "
        f"{format_minutes(rules.weekday_expected_minutes)} ({format_multiplier_label(rules.weekday_overtime_multiplier)}), "
        f"sab {format_minutes(rules.saturday_expected_minutes)} ({format_multiplier_label(rules.saturday_overtime_multiplier)}), "
        f"dom {format_minutes(rules.sunday_expected_minutes)} ({format_multiplier_label(rules.sunday_work_multiplier)})."
    )


def calculate_entry_result(entry_date, start_time, end_time, break_minutes, expected_minutes, rules):
    start_dt = datetime.combine(entry_date, start_time)
    end_dt = datetime.combine(entry_date, end_time)
    if end_dt <= start_dt:
        end_dt += timedelta(days=1)

    interval_minutes = int((end_dt - start_dt).total_seconds() // 60)
    if interval_minutes <= 0:
        raise ValueError("A jornada calculada precisa ser maior que zero.")
    if break_minutes < 0:
        raise ValueError("O intervalo nao pode ser negativo.")
    if break_minutes >= interval_minutes:
        raise ValueError("O intervalo precisa ser menor que a jornada total.")

    expected_minutes = expected_minutes if expected_minutes is not None else default_expected_minutes_for_date(entry_date, rules)

    raw_minutes = [start_dt + timedelta(minutes=index) for index in range(interval_minutes)]
    worked_minutes = _remove_break_from_minutes(raw_minutes, break_minutes)
    if not worked_minutes:
        raise ValueError("A jornada liquida nao pode ficar zerada.")

    total_credit = _DECIMAL_ZERO
    night_bonus = _DECIMAL_ZERO
    weekend_credit = _DECIMAL_ZERO

    overtime_minutes_count = 0
    night_minutes_count = 0
    weekend_minutes_count = 0

    weekday_overtime_factor = Decimal(str(rules.weekday_overtime_multiplier))
    saturday_overtime_factor = Decimal(str(rules.saturday_overtime_multiplier))
    sunday_factor = Decimal(str(rules.sunday_work_multiplier))

    for index, minute_dt in enumerate(worked_minutes):
        weekday = minute_dt.weekday()
        night_minute = _is_night_minute(minute_dt)

        if night_minute:
            night_minutes_count += 1
        if weekday >= 5:
            weekend_minutes_count += 1

        if weekday == 6:
            overtime_minutes_count += 1
            factor = sunday_factor * (_NIGHT_EQUIVALENT_FACTOR if night_minute else _DECIMAL_ONE)
            total_credit += factor
            weekend_credit += factor
            if night_minute:
                night_bonus += sunday_factor * (_NIGHT_EQUIVALENT_FACTOR - _DECIMAL_ONE)
            continue

        if index >= expected_minutes:
            overtime_minutes_count += 1
            overtime_factor = saturday_overtime_factor if weekday == 5 else weekday_overtime_factor
            factor = overtime_factor * (_NIGHT_EQUIVALENT_FACTOR if night_minute else _DECIMAL_ONE)
            total_credit += factor
            if weekday == 5:
                weekend_credit += factor
            if night_minute:
                night_bonus += overtime_factor * (_NIGHT_EQUIVALENT_FACTOR - _DECIMAL_ONE)
            continue

        if night_minute:
            factor = _NIGHT_EQUIVALENT_FACTOR - _DECIMAL_ONE
            total_credit += factor
            night_bonus += factor
            if weekday == 5:
                weekend_credit += factor

    credited_minutes = _round_decimal(total_credit)
    if credited_minutes <= 0:
        raise ValueError("Essa jornada nao gerou credito extra com as regras configuradas.")

    return CalculationResult(
        worked_minutes=len(worked_minutes),
        expected_minutes=expected_minutes,
        overtime_minutes=overtime_minutes_count,
        night_minutes=night_minutes_count,
        weekend_minutes=weekend_minutes_count,
        weekend_credit_minutes=_round_decimal(weekend_credit),
        night_bonus_minutes=_round_decimal(night_bonus),
        credited_minutes=credited_minutes,
    )


def _is_night_minute(minute_dt):
    current_time = minute_dt.time()
    return current_time >= time(22, 0) or current_time < time(5, 0)


def _remove_break_from_minutes(raw_minutes, break_minutes):
    if break_minutes == 0:
        return raw_minutes

    day_indexes = [index for index, minute_dt in enumerate(raw_minutes) if not _is_night_minute(minute_dt)]
    night_indexes = [index for index, minute_dt in enumerate(raw_minutes) if _is_night_minute(minute_dt)]
    remove_indexes = set((day_indexes + night_indexes)[:break_minutes])
    return [minute_dt for index, minute_dt in enumerate(raw_minutes) if index not in remove_indexes]


def _round_decimal(value):
    return int(Decimal(value).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
