from pydantic import Field, model_validator

from ..errors import ValidationError
from ..services.types import SettingsInput
from ..utils import hourly_rate_cents
from .base import SchemaModel


class SettingsResponse(SchemaModel):
    gross_salary_cents: int | None = None
    monthly_workload_minutes: int | None = None
    weekly_workload_minutes: int | None = None
    weekday_expected_minutes: int
    saturday_expected_minutes: int
    sunday_expected_minutes: int
    weekday_overtime_multiplier: float
    saturday_overtime_multiplier: float
    sunday_work_multiplier: float
    hourly_rate_cents: int | None = None

    @classmethod
    def from_settings(cls, settings):
        return cls.model_validate(
            {
                "gross_salary_cents": settings.gross_salary_cents,
                "monthly_workload_minutes": settings.monthly_workload_minutes,
                "weekly_workload_minutes": settings.weekly_workload_minutes,
                "weekday_expected_minutes": settings.weekday_expected_minutes,
                "saturday_expected_minutes": settings.saturday_expected_minutes,
                "sunday_expected_minutes": settings.sunday_expected_minutes,
                "weekday_overtime_multiplier": settings.weekday_overtime_multiplier,
                "saturday_overtime_multiplier": settings.saturday_overtime_multiplier,
                "sunday_work_multiplier": settings.sunday_work_multiplier,
                "hourly_rate_cents": hourly_rate_cents(
                    settings.gross_salary_cents,
                    settings.monthly_workload_minutes,
                ),
            }
        )


class SettingsPatchRequest(SchemaModel):
    gross_salary_cents: int | None = Field(default=None, ge=0)
    monthly_workload_minutes: int | None = Field(default=None, ge=1)
    weekly_workload_minutes: int | None = Field(default=None, ge=1)
    weekday_expected_minutes: int | None = Field(default=None, ge=0)
    saturday_expected_minutes: int | None = Field(default=None, ge=0)
    sunday_expected_minutes: int | None = Field(default=None, ge=0)
    weekday_overtime_multiplier: float | None = Field(default=None, ge=1)
    saturday_overtime_multiplier: float | None = Field(default=None, ge=1)
    sunday_work_multiplier: float | None = Field(default=None, ge=1)

    @model_validator(mode="after")
    def validate_non_empty_patch(self):
        if not self.model_fields_set:
            raise ValueError("Informe ao menos um campo para atualizar.")
        return self

    def to_input(self, settings):
        data = {
            "gross_salary_cents": self._value("gross_salary_cents", settings.gross_salary_cents),
            "monthly_workload_minutes": self._value(
                "monthly_workload_minutes",
                settings.monthly_workload_minutes,
            ),
            "weekly_workload_minutes": self._value(
                "weekly_workload_minutes",
                settings.weekly_workload_minutes,
            ),
            "weekday_expected_minutes": self._value(
                "weekday_expected_minutes",
                settings.weekday_expected_minutes,
            ),
            "saturday_expected_minutes": self._value(
                "saturday_expected_minutes",
                settings.saturday_expected_minutes,
            ),
            "sunday_expected_minutes": self._value(
                "sunday_expected_minutes",
                settings.sunday_expected_minutes,
            ),
            "weekday_overtime_multiplier": self._value(
                "weekday_overtime_multiplier",
                settings.weekday_overtime_multiplier,
            ),
            "saturday_overtime_multiplier": self._value(
                "saturday_overtime_multiplier",
                settings.saturday_overtime_multiplier,
            ),
            "sunday_work_multiplier": self._value(
                "sunday_work_multiplier",
                settings.sunday_work_multiplier,
            ),
        }

        if data["gross_salary_cents"] is not None and data["monthly_workload_minutes"] is None:
            raise ValidationError(
                "Informe a carga mensal para calcular o valor/hora.",
                code="missing_monthly_workload_minutes",
                details={"field": "monthly_workload_minutes"},
            )

        return SettingsInput(**data)

    def _value(self, name, default):
        if name in self.model_fields_set:
            return getattr(self, name)
        return default
