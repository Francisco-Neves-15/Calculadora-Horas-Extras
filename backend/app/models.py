from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db
from .utils import (
    CALCULATED_ENTRY_MODE,
    MANUAL_ENTRY_MODE,
    format_currency,
    format_minutes,
    format_multiplier_label,
    format_signed_minutes,
    format_time_value,
    signed_minutes_from_values,
)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last_login_at = db.Column(db.DateTime, nullable=True)

    settings = db.relationship(
        "UserSettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    entries = db.relationship("OvertimeEntry", back_populates="user")

    @property
    def first_name(self):
        return self.display_name.split(" ", maxsplit=1)[0]

    def set_password(self, raw_password):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)


class UserSettings(db.Model):
    __tablename__ = "user_settings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True, index=True)
    gross_salary_cents = db.Column(db.Integer, nullable=True)
    monthly_workload_minutes = db.Column(db.Integer, nullable=True)
    weekly_workload_minutes = db.Column(db.Integer, nullable=True)
    weekday_expected_minutes = db.Column(db.Integer, nullable=False, default=480)
    saturday_expected_minutes = db.Column(db.Integer, nullable=False, default=0)
    sunday_expected_minutes = db.Column(db.Integer, nullable=False, default=0)
    weekday_overtime_multiplier = db.Column(db.Float, nullable=False, default=1.5)
    saturday_overtime_multiplier = db.Column(db.Float, nullable=False, default=1.5)
    sunday_work_multiplier = db.Column(db.Float, nullable=False, default=2.0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    user = db.relationship("User", back_populates="settings")

    @property
    def salary_label(self):
        return format_currency(self.gross_salary_cents)

    @property
    def monthly_workload_label(self):
        return format_minutes(self.monthly_workload_minutes) if self.monthly_workload_minutes is not None else "-"

    @property
    def weekly_workload_label(self):
        return format_minutes(self.weekly_workload_minutes) if self.weekly_workload_minutes is not None else "-"

    @property
    def saturday_multiplier_label(self):
        return format_multiplier_label(self.saturday_overtime_multiplier)

    @property
    def schedule_summary(self):
        return (
            f"Seg-sex {format_minutes(self.weekday_expected_minutes)} ({format_multiplier_label(self.weekday_overtime_multiplier)}), "
            f"sab {format_minutes(self.saturday_expected_minutes)} ({format_multiplier_label(self.saturday_overtime_multiplier)}), "
            f"dom {format_minutes(self.sunday_expected_minutes)} ({format_multiplier_label(self.sunday_work_multiplier)})."
        )


class OvertimeEntry(db.Model):
    __tablename__ = "overtime_entries"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    entry_date = db.Column(db.Date, nullable=False, index=True)
    movement_type = db.Column(db.String(10), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(80), nullable=False, index=True)
    notes = db.Column(db.Text, nullable=False, default="")
    entry_mode = db.Column(db.String(20), nullable=False, default=MANUAL_ENTRY_MODE)
    start_time = db.Column(db.Time, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    break_minutes = db.Column(db.Integer, nullable=True)
    expected_minutes = db.Column(db.Integer, nullable=True)
    worked_minutes = db.Column(db.Integer, nullable=True)
    overtime_minutes = db.Column(db.Integer, nullable=True)
    night_minutes = db.Column(db.Integer, nullable=True)
    weekend_minutes = db.Column(db.Integer, nullable=True)
    weekend_credit_minutes = db.Column(db.Integer, nullable=True)
    night_bonus_minutes = db.Column(db.Integer, nullable=True)
    estimated_value_cents = db.Column(db.Integer, nullable=True)
    applied_weekday_expected_minutes = db.Column(db.Integer, nullable=True)
    applied_saturday_expected_minutes = db.Column(db.Integer, nullable=True)
    applied_sunday_expected_minutes = db.Column(db.Integer, nullable=True)
    applied_weekday_overtime_multiplier = db.Column(db.Float, nullable=True)
    applied_saturday_overtime_multiplier = db.Column(db.Float, nullable=True)
    applied_sunday_work_multiplier = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    user = db.relationship("User", back_populates="entries")

    @property
    def movement_label(self):
        return "Credito" if self.movement_type == "credit" else "Debito"

    @property
    def entry_mode_label(self):
        return "Calculado" if self.entry_mode == CALCULATED_ENTRY_MODE else "Manual"

    @property
    def duration_label(self):
        return format_minutes(self.duration_minutes)

    @property
    def signed_minutes(self):
        return signed_minutes_from_values(self.movement_type, self.duration_minutes)

    @property
    def signed_duration_label(self):
        return format_signed_minutes(self.signed_minutes)

    @property
    def estimated_value_label(self):
        return format_currency(self.estimated_value_cents)

    @property
    def worked_label(self):
        return format_minutes(self.worked_minutes) if self.worked_minutes is not None else "-"

    @property
    def expected_label(self):
        return format_minutes(self.expected_minutes) if self.expected_minutes is not None else "-"

    @property
    def overtime_label(self):
        return format_minutes(self.overtime_minutes) if self.overtime_minutes is not None else "-"

    @property
    def night_label(self):
        return format_minutes(self.night_minutes) if self.night_minutes is not None else "-"

    @property
    def night_bonus_label(self):
        return format_minutes(self.night_bonus_minutes) if self.night_bonus_minutes is not None else "-"

    @property
    def weekend_label(self):
        return format_minutes(self.weekend_minutes) if self.weekend_minutes is not None else "-"

    @property
    def weekend_credit_label(self):
        return format_minutes(self.weekend_credit_minutes) if self.weekend_credit_minutes is not None else "-"

    @property
    def break_label(self):
        return format_minutes(self.break_minutes) if self.break_minutes is not None else "-"

    @property
    def shift_label(self):
        if not self.start_time or not self.end_time:
            return "-"
        return f"{format_time_value(self.start_time)} - {format_time_value(self.end_time)}"

    @property
    def calculation_details(self):
        if self.entry_mode != CALCULATED_ENTRY_MODE:
            return []

        return [
            ("Turno", self.shift_label),
            ("Trabalhadas", self.worked_label),
            ("Previstas", self.expected_label),
            ("Extras", self.overtime_label),
            ("Noturnas", self.night_label),
            ("Sab/dom", self.weekend_label),
            ("Adicional noturno", self.night_bonus_label),
            ("Credito sab/dom", self.weekend_credit_label),
        ]

    @property
    def rules_snapshot_details(self):
        if self.entry_mode != CALCULATED_ENTRY_MODE:
            return []

        return [
            ("Dia util", format_multiplier_label(self.applied_weekday_overtime_multiplier)),
            ("Sabado", format_multiplier_label(self.applied_saturday_overtime_multiplier)),
            ("Domingo", format_multiplier_label(self.applied_sunday_work_multiplier)),
        ]
