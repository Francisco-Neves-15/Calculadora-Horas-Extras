from decimal import Decimal, ROUND_HALF_UP

from flask_wtf import FlaskForm
from wtforms import (
    DateField,
    DecimalField,
    PasswordField,
    SelectField,
    StringField,
    SubmitField,
    TextAreaField,
    TimeField,
)
from wtforms.validators import DataRequired, EqualTo, Length, NumberRange, Optional, ValidationError

from .utils import (
    CALCULATED_ENTRY_MODE,
    MANUAL_ENTRY_MODE,
    derive_monthly_minutes_from_weekly,
    normalize_email,
    parse_duration_to_minutes,
    parse_optional_duration_to_minutes,
    validate_email_address,
)

ENTRY_MODE_CHOICES = [
    (MANUAL_ENTRY_MODE, "Manual"),
    (CALCULATED_ENTRY_MODE, "Calculado"),
]

MOVEMENT_CHOICES = [
    ("credit", "Credito"),
    ("debit", "Debito"),
]

CATEGORY_SUGGESTIONS = [
    "Hora extra",
    "Plantao noturno",
    "Compensacao",
    "Ajuste",
]


class RegistrationForm(FlaskForm):
    display_name = StringField(
        "Nome de exibicao",
        validators=[
            DataRequired(message="Informe o nome de exibicao."),
            Length(min=2, max=120, message="Use entre 2 e 120 caracteres."),
        ],
    )
    email = StringField(
        "E-mail",
        validators=[DataRequired(message="Informe o e-mail.")],
        render_kw={"autocomplete": "email", "inputmode": "email"},
    )
    password = PasswordField(
        "Senha",
        validators=[
            DataRequired(message="Informe a senha."),
            Length(min=8, message="Use pelo menos 8 caracteres."),
        ],
        render_kw={"autocomplete": "new-password"},
    )
    password_confirm = PasswordField(
        "Confirmar senha",
        validators=[
            DataRequired(message="Confirme a senha."),
            EqualTo("password", message="As senhas precisam ser iguais."),
        ],
        render_kw={"autocomplete": "new-password"},
    )
    submit = SubmitField("Criar conta")

    def validate_email(self, field):
        from .models import User
        from .extensions import db

        normalized = normalize_email(field.data)
        if not validate_email_address(normalized):
            raise ValidationError("Informe um e-mail valido.")

        exists = db.session.query(User.id).filter_by(email=normalized).first()
        if exists:
            raise ValidationError("Ja existe uma conta com esse e-mail.")

        field.data = normalized


class LoginForm(FlaskForm):
    email = StringField(
        "E-mail",
        validators=[DataRequired(message="Informe o e-mail.")],
        render_kw={"autocomplete": "email", "inputmode": "email"},
    )
    password = PasswordField(
        "Senha",
        validators=[DataRequired(message="Informe a senha.")],
        render_kw={"autocomplete": "current-password"},
    )
    submit = SubmitField("Entrar")

    def validate_email(self, field):
        normalized = normalize_email(field.data)
        if not validate_email_address(normalized):
            raise ValidationError("Informe um e-mail valido.")
        field.data = normalized


class EntryForm(FlaskForm):
    entry_date = DateField(
        "Data",
        format="%Y-%m-%d",
        validators=[DataRequired(message="Informe a data do lancamento.")],
    )
    entry_mode = SelectField(
        "Modo do lancamento",
        choices=ENTRY_MODE_CHOICES,
        default=MANUAL_ENTRY_MODE,
        validators=[DataRequired(message="Selecione o modo do lancamento.")],
    )
    movement_type = SelectField(
        "Movimento",
        choices=MOVEMENT_CHOICES,
        default="credit",
        validate_choice=False,
    )
    duration = StringField("Duracao manual (HH:MM)", render_kw={"placeholder": "Ex.: 01:30"})
    start_time = TimeField(
        "Inicio",
        format="%H:%M",
        validators=[Optional()],
        render_kw={"step": 60},
    )
    end_time = TimeField(
        "Fim",
        format="%H:%M",
        validators=[Optional()],
        render_kw={"step": 60},
    )
    break_duration = StringField(
        "Intervalo (HH:MM)",
        default="00:00",
        render_kw={"placeholder": "Ex.: 00:30"},
    )
    expected_duration = StringField(
        "Horas normais dentro do lancamento (HH:MM)",
        render_kw={"placeholder": "Ex.: 00:00 para bloco totalmente extra"},
    )
    category = StringField(
        "Categoria",
        validators=[
            DataRequired(message="Informe uma categoria."),
            Length(max=80, message="A categoria pode ter no maximo 80 caracteres."),
        ],
    )
    notes = TextAreaField(
        "Observacao",
        validators=[Length(max=500, message="A observacao pode ter no maximo 500 caracteres.")],
    )
    submit = SubmitField("Salvar")

    parsed_duration_minutes = None
    parsed_break_minutes = 0
    parsed_expected_minutes = None

    def validate(self, extra_validators=None):
        is_valid = super().validate(extra_validators=extra_validators)
        mode = self.entry_mode.data or MANUAL_ENTRY_MODE

        if mode == MANUAL_ENTRY_MODE:
            if not self.movement_type.data:
                self.movement_type.errors.append("Selecione o tipo de movimento.")
                is_valid = False

            if not (self.duration.data or "").strip():
                self.duration.errors.append("Informe a duracao em HH:MM.")
                is_valid = False
            else:
                try:
                    self.parsed_duration_minutes = parse_duration_to_minutes((self.duration.data or "").strip())
                except ValueError as exc:
                    self.duration.errors.append(str(exc))
                    is_valid = False
        else:
            if not self.start_time.data:
                self.start_time.errors.append("Informe o horario de inicio.")
                is_valid = False
            if not self.end_time.data:
                self.end_time.errors.append("Informe o horario de fim.")
                is_valid = False

            break_value = (self.break_duration.data or "00:00").strip()
            try:
                self.parsed_break_minutes = parse_duration_to_minutes(break_value, allow_zero=True)
            except ValueError as exc:
                self.break_duration.errors.append(str(exc))
                is_valid = False

            try:
                self.parsed_expected_minutes = parse_optional_duration_to_minutes(
                    self.expected_duration.data,
                    allow_zero=True,
                )
            except ValueError as exc:
                self.expected_duration.errors.append(str(exc))
                is_valid = False

        return is_valid


class SettingsForm(FlaskForm):
    gross_salary = DecimalField(
        "Salario bruto mensal (R$)",
        validators=[Optional(), NumberRange(min=0, message="O salario bruto nao pode ser negativo.")],
        places=2,
        render_kw={"placeholder": "Ex.: 4318.00", "step": "0.01"},
    )
    monthly_workload = StringField(
        "Carga horaria mensal (HH:MM)",
        render_kw={"placeholder": "Ex.: 173:20"},
    )
    weekly_workload = StringField(
        "Jornada semanal (HH:MM)",
        render_kw={"placeholder": "Ex.: 40:00"},
    )
    weekday_expected_duration = StringField(
        "Seg-sex: horas normais por lancamento (HH:MM)",
        render_kw={"placeholder": "Ex.: 08:00"},
    )
    saturday_expected_duration = StringField(
        "Sabado: horas normais por lancamento (HH:MM)",
        render_kw={"placeholder": "Ex.: 00:00"},
    )
    sunday_expected_duration = StringField(
        "Domingo: horas normais por lancamento (HH:MM)",
        render_kw={"placeholder": "Ex.: 00:00"},
    )
    weekday_overtime_multiplier = DecimalField(
        "Multiplicador de hora extra em dia util",
        validators=[DataRequired(message="Informe o multiplicador de dia util."), NumberRange(min=1, message="Use um valor maior ou igual a 1.")],
        places=2,
        render_kw={"step": "0.01"},
    )
    saturday_overtime_multiplier = DecimalField(
        "Multiplicador de hora extra no sabado",
        validators=[DataRequired(message="Informe o multiplicador de sabado."), NumberRange(min=1, message="Use um valor maior ou igual a 1.")],
        places=2,
        render_kw={"step": "0.01"},
    )
    sunday_work_multiplier = DecimalField(
        "Multiplicador de trabalho no domingo",
        validators=[DataRequired(message="Informe o multiplicador de domingo."), NumberRange(min=1, message="Use um valor maior ou igual a 1.")],
        places=2,
        render_kw={"step": "0.01"},
    )
    submit = SubmitField("Salvar configuracoes")

    gross_salary_cents = None
    monthly_workload_minutes = None
    weekly_workload_minutes = None
    weekday_expected_minutes = None
    saturday_expected_minutes = None
    sunday_expected_minutes = None

    def validate(self, extra_validators=None):
        is_valid = super().validate(extra_validators=extra_validators)

        salary = self.gross_salary.data
        monthly_workload = (self.monthly_workload.data or "").strip()
        weekly_workload = (self.weekly_workload.data or "").strip()

        if salary is not None:
            self.gross_salary_cents = int(
                (Decimal(str(salary)) * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
            )

        try:
            self.monthly_workload_minutes = parse_optional_duration_to_minutes(
                monthly_workload,
                allow_zero=False,
                allow_variable_hour_digits=True,
            )
        except ValueError as exc:
            self.monthly_workload.errors.append(str(exc))
            is_valid = False

        try:
            self.weekly_workload_minutes = parse_optional_duration_to_minutes(
                weekly_workload,
                allow_zero=False,
                allow_variable_hour_digits=True,
            )
        except ValueError as exc:
            self.weekly_workload.errors.append(str(exc))
            is_valid = False

        if self.monthly_workload_minutes is None and self.weekly_workload_minutes is not None:
            self.monthly_workload_minutes = derive_monthly_minutes_from_weekly(self.weekly_workload_minutes)

        if self.gross_salary_cents is not None and self.monthly_workload_minutes is None:
            self.monthly_workload.errors.append("Informe a carga mensal ou a jornada semanal para calcular o valor/hora.")
            is_valid = False

        try:
            self.weekday_expected_minutes = parse_duration_to_minutes(
                (self.weekday_expected_duration.data or "").strip(),
                allow_zero=True,
            )
        except ValueError as exc:
            self.weekday_expected_duration.errors.append(str(exc))
            is_valid = False

        try:
            self.saturday_expected_minutes = parse_duration_to_minutes(
                (self.saturday_expected_duration.data or "").strip(),
                allow_zero=True,
            )
        except ValueError as exc:
            self.saturday_expected_duration.errors.append(str(exc))
            is_valid = False

        try:
            self.sunday_expected_minutes = parse_duration_to_minutes(
                (self.sunday_expected_duration.data or "").strip(),
                allow_zero=True,
            )
        except ValueError as exc:
            self.sunday_expected_duration.errors.append(str(exc))
            is_valid = False

        return is_valid


class DeleteForm(FlaskForm):
    submit = SubmitField("Excluir")


class LogoutForm(FlaskForm):
    submit = SubmitField("Sair")
