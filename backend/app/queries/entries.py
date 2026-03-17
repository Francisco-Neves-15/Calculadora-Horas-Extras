from math import ceil

from sqlalchemy import case, func, select

from ..extensions import db
from ..models import OvertimeEntry
from ..services.types import EntryFilters


def list_entries(user_id, filters: EntryFilters):
    conditions = _entry_conditions(user_id, filters)
    total_items = db.session.execute(
        select(func.count(OvertimeEntry.id)).where(*conditions)
    ).scalar_one()

    items = db.session.execute(
        select(OvertimeEntry)
        .where(*conditions)
        .order_by(OvertimeEntry.entry_date.desc(), OvertimeEntry.id.desc())
        .limit(filters.page_size)
        .offset(filters.offset)
    ).scalars().all()

    aggregates = db.session.execute(
        select(
            func.coalesce(func.sum(_signed_minutes_expression()), 0),
            func.coalesce(func.sum(OvertimeEntry.night_minutes), 0),
            func.coalesce(func.sum(OvertimeEntry.weekend_credit_minutes), 0),
            func.coalesce(func.sum(OvertimeEntry.estimated_value_cents), 0),
        ).where(*conditions)
    ).one()

    total_pages = ceil(total_items / filters.page_size) if total_items else 0

    return {
        "items": items,
        "meta": {
            "page": filters.page,
            "page_size": filters.page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "month": filters.month,
            "year": filters.year,
            "category": filters.category or None,
            "filtered_balance_minutes": int(aggregates[0] or 0),
            "filtered_night_minutes": int(aggregates[1] or 0),
            "filtered_weekend_credit_minutes": int(aggregates[2] or 0),
            "filtered_estimated_value_cents": int(aggregates[3] or 0),
        },
    }


def available_categories(user_id):
    return db.session.execute(
        select(OvertimeEntry.category)
        .where(OvertimeEntry.user_id == user_id)
        .distinct()
        .order_by(OvertimeEntry.category.asc())
    ).scalars().all()


def available_years(user_id, current_year):
    dates = db.session.execute(
        select(OvertimeEntry.entry_date).where(OvertimeEntry.user_id == user_id)
    ).scalars().all()
    years = {entry_date.year for entry_date in dates}
    years.add(current_year)
    return sorted(years, reverse=True)


def _entry_conditions(user_id, filters: EntryFilters):
    conditions = [OvertimeEntry.user_id == user_id]
    if filters.year is not None:
        conditions.append(db.extract("year", OvertimeEntry.entry_date) == filters.year)
    if filters.month is not None:
        conditions.append(db.extract("month", OvertimeEntry.entry_date) == filters.month)
    if filters.category:
        conditions.append(OvertimeEntry.category == filters.category)
    return conditions


def _signed_minutes_expression():
    return case(
        (OvertimeEntry.movement_type == "credit", OvertimeEntry.duration_minutes),
        else_=-OvertimeEntry.duration_minutes,
    )
