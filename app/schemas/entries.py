from datetime import date, datetime, time
from typing import Literal

from pydantic import Field, field_validator, model_validator

from ..services.types import EntryFilters, EntryInput
from ..utils import CALCULATED_ENTRY_MODE, MANUAL_ENTRY_MODE, signed_minutes_from_values
from .base import SchemaModel


class EntryResponse(SchemaModel):
    id: int
    entry_date: date
    movement_type: str
    duration_minutes: int
    signed_minutes: int
    category: str
    notes: str
    entry_mode: str
    start_time: time | None = None
    end_time: time | None = None
    break_minutes: int | None = None
    expected_minutes: int | None = None
    worked_minutes: int | None = None
    overtime_minutes: int | None = None
    night_minutes: int | None = None
    weekend_minutes: int | None = None
    weekend_credit_minutes: int | None = None
    night_bonus_minutes: int | None = None
    estimated_value_cents: int | None = None
    applied_weekday_expected_minutes: int | None = None
    applied_saturday_expected_minutes: int | None = None
    applied_sunday_expected_minutes: int | None = None
    applied_weekday_overtime_multiplier: float | None = None
    applied_saturday_overtime_multiplier: float | None = None
    applied_sunday_work_multiplier: float | None = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entry(cls, entry):
        return cls.model_validate(
            {
                "id": entry.id,
                "entry_date": entry.entry_date,
                "movement_type": entry.movement_type,
                "duration_minutes": entry.duration_minutes,
                "signed_minutes": signed_minutes_from_values(entry.movement_type, entry.duration_minutes),
                "category": entry.category,
                "notes": entry.notes,
                "entry_mode": entry.entry_mode,
                "start_time": entry.start_time,
                "end_time": entry.end_time,
                "break_minutes": entry.break_minutes,
                "expected_minutes": entry.expected_minutes,
                "worked_minutes": entry.worked_minutes,
                "overtime_minutes": entry.overtime_minutes,
                "night_minutes": entry.night_minutes,
                "weekend_minutes": entry.weekend_minutes,
                "weekend_credit_minutes": entry.weekend_credit_minutes,
                "night_bonus_minutes": entry.night_bonus_minutes,
                "estimated_value_cents": entry.estimated_value_cents,
                "applied_weekday_expected_minutes": entry.applied_weekday_expected_minutes,
                "applied_saturday_expected_minutes": entry.applied_saturday_expected_minutes,
                "applied_sunday_expected_minutes": entry.applied_sunday_expected_minutes,
                "applied_weekday_overtime_multiplier": entry.applied_weekday_overtime_multiplier,
                "applied_saturday_overtime_multiplier": entry.applied_saturday_overtime_multiplier,
                "applied_sunday_work_multiplier": entry.applied_sunday_work_multiplier,
                "created_at": entry.created_at,
                "updated_at": entry.updated_at,
            }
        )


class EntryCreateRequest(SchemaModel):
    entry_date: date
    entry_mode: Literal["manual", "calculated"] = MANUAL_ENTRY_MODE
    movement_type: Literal["credit", "debit"] = "credit"
    duration_minutes: int | None = Field(default=None, ge=1)
    start_time: time | None = None
    end_time: time | None = None
    break_minutes: int = Field(default=0, ge=0)
    expected_minutes: int | None = Field(default=None, ge=0)
    category: str = Field(min_length=1, max_length=80)
    notes: str = Field(default="", max_length=500)

    @field_validator("category")
    @classmethod
    def normalize_category(cls, value):
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Informe uma categoria.")
        return cleaned

    @field_validator("notes")
    @classmethod
    def normalize_notes(cls, value):
        return value.strip()

    @model_validator(mode="after")
    def validate_payload(self):
        if self.entry_mode == MANUAL_ENTRY_MODE and self.duration_minutes is None:
            raise ValueError("Informe `duration_minutes` para lancamentos manuais.")
        if self.entry_mode == CALCULATED_ENTRY_MODE:
            if self.start_time is None or self.end_time is None:
                raise ValueError("Informe `start_time` e `end_time` para lancamentos calculados.")
        return self

    def to_input(self):
        return EntryInput(
            entry_date=self.entry_date,
            entry_mode=self.entry_mode,
            movement_type=self.movement_type,
            duration_minutes=self.duration_minutes,
            start_time=self.start_time,
            end_time=self.end_time,
            break_minutes=self.break_minutes,
            expected_minutes=self.expected_minutes,
            category=self.category,
            notes=self.notes,
        )


class EntryUpdateRequest(SchemaModel):
    entry_date: date | None = None
    entry_mode: Literal["manual", "calculated"] | None = None
    movement_type: Literal["credit", "debit"] | None = None
    duration_minutes: int | None = Field(default=None, ge=1)
    start_time: time | None = None
    end_time: time | None = None
    break_minutes: int | None = Field(default=None, ge=0)
    expected_minutes: int | None = Field(default=None, ge=0)
    category: str | None = Field(default=None, min_length=1, max_length=80)
    notes: str | None = Field(default=None, max_length=500)

    @field_validator("category")
    @classmethod
    def normalize_category(cls, value):
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Informe uma categoria.")
        return cleaned

    @field_validator("notes")
    @classmethod
    def normalize_notes(cls, value):
        return value.strip() if value is not None else value

    @model_validator(mode="after")
    def validate_non_empty_patch(self):
        if not self.model_fields_set:
            raise ValueError("Informe ao menos um campo para atualizar.")
        return self

    def to_input(self, entry):
        mode = self.entry_mode if "entry_mode" in self.model_fields_set else entry.entry_mode
        is_existing_manual = entry.entry_mode == MANUAL_ENTRY_MODE
        is_existing_calculated = entry.entry_mode == CALCULATED_ENTRY_MODE

        payload = {
            "entry_date": self.entry_date if "entry_date" in self.model_fields_set else entry.entry_date,
            "entry_mode": mode,
            "movement_type": (
                self.movement_type
                if "movement_type" in self.model_fields_set
                else (entry.movement_type if is_existing_manual else "credit")
            ),
            "duration_minutes": (
                self.duration_minutes
                if "duration_minutes" in self.model_fields_set
                else (entry.duration_minutes if is_existing_manual and mode == MANUAL_ENTRY_MODE else None)
            ),
            "start_time": (
                self.start_time
                if "start_time" in self.model_fields_set
                else (entry.start_time if is_existing_calculated and mode == CALCULATED_ENTRY_MODE else None)
            ),
            "end_time": (
                self.end_time
                if "end_time" in self.model_fields_set
                else (entry.end_time if is_existing_calculated and mode == CALCULATED_ENTRY_MODE else None)
            ),
            "break_minutes": (
                self.break_minutes
                if "break_minutes" in self.model_fields_set
                else (entry.break_minutes if is_existing_calculated and entry.break_minutes is not None else 0)
            ),
            "expected_minutes": (
                self.expected_minutes
                if "expected_minutes" in self.model_fields_set
                else (entry.expected_minutes if is_existing_calculated and mode == CALCULATED_ENTRY_MODE else None)
            ),
            "category": self.category if "category" in self.model_fields_set else entry.category,
            "notes": self.notes if "notes" in self.model_fields_set else entry.notes,
        }

        return EntryCreateRequest.model_validate(payload).to_input()


class EntryListQuery(SchemaModel):
    month: int | None = Field(default=None, ge=1, le=12)
    year: int | None = Field(default=None, ge=2000, le=2100)
    category: str | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

    @field_validator("category")
    @classmethod
    def normalize_category(cls, value):
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    def to_filters(self):
        return EntryFilters(
            month=self.month,
            year=self.year,
            category=self.category or "",
            page=self.page,
            page_size=self.page_size,
        )


class EntryFilterOptions(SchemaModel):
    categories: list[str]
    years: list[int]


class EntryListMeta(SchemaModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int
    month: int | None = None
    year: int | None = None
    category: str | None = None
    filtered_balance_minutes: int
    filtered_night_minutes: int
    filtered_weekend_credit_minutes: int
    filtered_estimated_value_cents: int


class EntryListResponse(SchemaModel):
    items: list[EntryResponse]
    meta: EntryListMeta
    filter_options: EntryFilterOptions
