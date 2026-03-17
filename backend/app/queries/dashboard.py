from datetime import date

from sqlalchemy import case, func, select

from ..extensions import db
from ..models import OvertimeEntry
from ..utils import MONTH_NAMES, hourly_rate_cents, month_label, month_start, previous_month_start


def build_dashboard_data(user_id, settings, today: date):
    current_month_start = month_start(today.year, today.month)
    next_month = month_start(today.year + 1, 1) if today.month == 12 else month_start(today.year, today.month + 1)

    monthly_summary = db.session.execute(
        select(
            func.coalesce(func.sum(_signed_minutes_expression()), 0),
            func.coalesce(
                func.sum(
                    case(
                        (OvertimeEntry.movement_type == "credit", OvertimeEntry.duration_minutes),
                        else_=0,
                    )
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    case(
                        (OvertimeEntry.movement_type == "debit", OvertimeEntry.duration_minutes),
                        else_=0,
                    )
                ),
                0,
            ),
            func.coalesce(func.sum(OvertimeEntry.night_minutes), 0),
            func.coalesce(func.sum(OvertimeEntry.weekend_credit_minutes), 0),
            func.coalesce(func.sum(OvertimeEntry.estimated_value_cents), 0),
        )
        .where(OvertimeEntry.user_id == user_id)
        .where(OvertimeEntry.entry_date >= current_month_start)
        .where(OvertimeEntry.entry_date < next_month)
    ).one()

    total_summary = db.session.execute(
        select(
            func.coalesce(func.sum(_signed_minutes_expression()), 0),
            func.count(OvertimeEntry.id),
        ).where(OvertimeEntry.user_id == user_id)
    ).one()

    recent_entries = db.session.execute(
        select(OvertimeEntry)
        .where(OvertimeEntry.user_id == user_id)
        .order_by(OvertimeEntry.entry_date.desc(), OvertimeEntry.id.desc())
        .limit(6)
    ).scalars().all()

    return {
        "summary": {
            "current_month": today.month,
            "current_year": today.year,
            "current_month_label": f"{MONTH_NAMES[today.month - 1]} / {today.year}",
            "current_balance_minutes": int(monthly_summary[0] or 0),
            "accumulated_balance_minutes": int(total_summary[0] or 0),
            "monthly_credit_minutes": int(monthly_summary[1] or 0),
            "monthly_debit_minutes": int(monthly_summary[2] or 0),
            "monthly_night_minutes": int(monthly_summary[3] or 0),
            "monthly_weekend_credit_minutes": int(monthly_summary[4] or 0),
            "monthly_estimated_value_cents": int(monthly_summary[5] or 0),
            "hourly_rate_cents": hourly_rate_cents(
                settings.gross_salary_cents,
                settings.monthly_workload_minutes,
            ),
            "settings_ready": bool(settings.gross_salary_cents and settings.monthly_workload_minutes),
            "entries_count": int(total_summary[1] or 0),
        },
        "chart_data": _build_chart_data(user_id, today),
        "recent_entries": recent_entries,
    }


def _build_chart_data(user_id, today: date):
    current_month_start = month_start(today.year, today.month)
    months = []
    cursor = current_month_start

    for _ in range(6):
        months.append(cursor)
        cursor = previous_month_start(cursor)

    months.reverse()
    month_balances = {(item.year, item.month): 0 for item in months}

    entries = db.session.execute(
        select(OvertimeEntry)
        .where(OvertimeEntry.user_id == user_id)
        .where(OvertimeEntry.entry_date >= months[0])
    ).scalars().all()

    for entry in entries:
        key = (entry.entry_date.year, entry.entry_date.month)
        if key in month_balances:
            sign = 1 if entry.movement_type == "credit" else -1
            month_balances[key] += entry.duration_minutes * sign

    max_balance = max((abs(value) for value in month_balances.values()), default=0)

    chart_data = []
    for item in months:
        balance = month_balances[(item.year, item.month)]
        chart_data.append(
            {
                "year": item.year,
                "month": item.month,
                "label": month_label(item.year, item.month),
                "balance_minutes": balance,
                "width_percent": 0 if max_balance == 0 else round(abs(balance) / max_balance * 100, 1),
                "direction": "positive" if balance > 0 else "negative" if balance < 0 else "neutral",
            }
        )

    return chart_data


def _signed_minutes_expression():
    return case(
        (OvertimeEntry.movement_type == "credit", OvertimeEntry.duration_minutes),
        else_=-OvertimeEntry.duration_minutes,
    )
