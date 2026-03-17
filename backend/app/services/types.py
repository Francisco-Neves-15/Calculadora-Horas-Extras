from dataclasses import dataclass
from datetime import date, time

from ..utils import MANUAL_ENTRY_MODE


@dataclass(slots=True)
class EntryInput:
    entry_date: date
    category: str
    notes: str = ""
    entry_mode: str = MANUAL_ENTRY_MODE
    movement_type: str = "credit"
    duration_minutes: int | None = None
    start_time: time | None = None
    end_time: time | None = None
    break_minutes: int = 0
    expected_minutes: int | None = None


@dataclass(slots=True)
class EntryFilters:
    month: int | None = None
    year: int | None = None
    category: str = ""
    page: int = 1
    page_size: int = 20

    @property
    def offset(self):
        return (self.page - 1) * self.page_size


@dataclass(slots=True)
class SettingsInput:
    gross_salary_cents: int | None
    monthly_workload_minutes: int | None
    weekly_workload_minutes: int | None
    weekday_expected_minutes: int
    saturday_expected_minutes: int
    sunday_expected_minutes: int
    weekday_overtime_multiplier: float
    saturday_overtime_multiplier: float
    sunday_work_multiplier: float
