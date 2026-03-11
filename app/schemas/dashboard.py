from .base import SchemaModel
from .entries import EntryResponse


class DashboardSummary(SchemaModel):
    current_month: int
    current_year: int
    current_month_label: str
    current_balance_minutes: int
    accumulated_balance_minutes: int
    monthly_credit_minutes: int
    monthly_debit_minutes: int
    monthly_night_minutes: int
    monthly_weekend_credit_minutes: int
    monthly_estimated_value_cents: int
    hourly_rate_cents: int | None = None
    settings_ready: bool
    entries_count: int


class DashboardChartItem(SchemaModel):
    year: int
    month: int
    label: str
    balance_minutes: int
    width_percent: float
    direction: str


class DashboardResponse(SchemaModel):
    summary: DashboardSummary
    chart_data: list[DashboardChartItem]
    recent_entries: list[EntryResponse]
