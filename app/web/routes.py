from datetime import date
from decimal import Decimal

from flask import Blueprint, current_app, g, redirect, render_template, request, url_for, flash

from ..auth import current_user, log_user_in, log_user_out, login_required
from ..errors import AuthenticationError, ValidationError
from ..forms import (
    CATEGORY_SUGGESTIONS,
    DeleteForm,
    EntryForm,
    LoginForm,
    LogoutForm,
    RegistrationForm,
    SettingsForm,
)
from ..queries import available_categories, available_years, build_dashboard_data, list_entries as list_entries_query
from ..services.auth import authenticate_user, register_user, users_exist
from ..services.entries import (
    create_entry as create_entry_service,
    delete_entry as delete_entry_service,
    get_entry_for_user,
    update_entry as update_entry_service,
)
from ..services.settings import ensure_user_settings, update_user_settings
from ..services.types import EntryFilters, EntryInput, SettingsInput
from ..utils import (
    MONTH_NAMES,
    default_schedule_label,
    format_currency,
    format_minutes,
    format_multiplier_label,
    rules_from_settings,
)

bp = Blueprint("web", __name__)


def _current_date():
    return current_app.config.get("CURRENT_DATE", date.today())


def _parse_int(value, minimum=None, maximum=None):
    if value in (None, ""):
        return None
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return None

    if minimum is not None and parsed < minimum:
        return None
    if maximum is not None and parsed > maximum:
        return None
    return parsed


def _redirect_target(default_endpoint="web.dashboard"):
    target = request.args.get("next") or request.form.get("next")
    if target and target.startswith("/") and not target.startswith("//"):
        return target
    return url_for(default_endpoint)


def _entry_input_from_form(form):
    return EntryInput(
        entry_date=form.entry_date.data,
        entry_mode=form.entry_mode.data,
        movement_type=form.movement_type.data or "credit",
        duration_minutes=form.parsed_duration_minutes,
        start_time=form.start_time.data,
        end_time=form.end_time.data,
        break_minutes=form.parsed_break_minutes,
        expected_minutes=form.parsed_expected_minutes,
        category=form.category.data.strip(),
        notes=(form.notes.data or "").strip(),
    )


def _settings_input_from_form(form):
    return SettingsInput(
        gross_salary_cents=form.gross_salary_cents,
        monthly_workload_minutes=form.monthly_workload_minutes,
        weekly_workload_minutes=form.weekly_workload_minutes,
        weekday_expected_minutes=form.weekday_expected_minutes,
        saturday_expected_minutes=form.saturday_expected_minutes,
        sunday_expected_minutes=form.sunday_expected_minutes,
        weekday_overtime_multiplier=float(form.weekday_overtime_multiplier.data),
        saturday_overtime_multiplier=float(form.saturday_overtime_multiplier.data),
        sunday_work_multiplier=float(form.sunday_work_multiplier.data),
    )


def _seed_form(entry, form):
    form.entry_date.data = entry.entry_date
    form.entry_mode.data = entry.entry_mode
    form.movement_type.data = entry.movement_type
    form.duration.data = format_minutes(entry.duration_minutes)
    form.start_time.data = entry.start_time
    form.end_time.data = entry.end_time
    form.break_duration.data = format_minutes(entry.break_minutes) if entry.break_minutes is not None else "00:00"
    form.expected_duration.data = (
        format_minutes(entry.expected_minutes) if entry.expected_minutes is not None else ""
    )
    form.category.data = entry.category
    form.notes.data = entry.notes


@bp.app_context_processor
def inject_auth_helpers():
    return {
        "current_user": current_user(),
        "logout_form": LogoutForm() if current_user() is not None else None,
    }


@bp.route("/register", methods=["GET", "POST"])
def register():
    if current_user() is not None:
        return redirect(url_for("web.dashboard"))

    form = RegistrationForm()
    first_user = not users_exist()

    if form.validate_on_submit():
        try:
            user, claimed_entries = register_user(
                form.display_name.data,
                form.email.data,
                form.password.data,
                current_app.config,
            )
        except ValidationError as exc:
            form.email.errors.append(exc.message)
        else:
            log_user_in(user)
            flash("Conta criada com sucesso.", "success")
            if first_user and claimed_entries:
                flash("Os lancamentos e as configuracoes legadas foram vinculados a voce.", "success")
            return redirect(url_for("web.dashboard"))

    return render_template("auth/register.html", form=form, first_user=first_user)


@bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user() is not None:
        return redirect(url_for("web.dashboard"))

    form = LoginForm()
    if form.validate_on_submit():
        try:
            user = authenticate_user(form.email.data, form.password.data)
        except AuthenticationError as exc:
            form.password.errors.append(exc.message)
        else:
            log_user_in(user)
            flash("Sessao iniciada com sucesso.", "success")
            return redirect(_redirect_target())

    return render_template("auth/login.html", form=form, users_exist=users_exist())


@bp.route("/logout", methods=["POST"])
@login_required
def logout():
    form = LogoutForm()
    if form.validate_on_submit():
        log_user_out()
        flash("Sessao encerrada.", "success")
    return redirect(url_for("web.login"))


@bp.route("/")
@login_required
def dashboard():
    user = current_user()
    settings = ensure_user_settings(user, current_app.config)
    rules = rules_from_settings(settings, current_app.config)
    dashboard_data = build_dashboard_data(user.id, settings, _current_date())
    summary = dashboard_data["summary"]
    return render_template(
        "dashboard.html",
        summary={
            "current_month_label": summary["current_month_label"],
            "current_balance": summary["current_balance_minutes"],
            "accumulated_balance": summary["accumulated_balance_minutes"],
            "monthly_credit": summary["monthly_credit_minutes"],
            "monthly_debit": summary["monthly_debit_minutes"],
            "monthly_night": summary["monthly_night_minutes"],
            "monthly_weekend_credit": summary["monthly_weekend_credit_minutes"],
            "monthly_estimated_value_cents": summary["monthly_estimated_value_cents"],
            "hourly_rate_cents": summary["hourly_rate_cents"],
            "settings_ready": summary["settings_ready"],
            "entries_count": summary["entries_count"],
        },
        chart_data=dashboard_data["chart_data"],
        recent_entries=dashboard_data["recent_entries"],
        delete_form=DeleteForm(),
        settings=settings,
        schedule_help=default_schedule_label(rules),
    )


@bp.route("/entries")
@login_required
def list_entries():
    user = current_user()
    filters = EntryFilters(
        month=_parse_int(request.args.get("month"), minimum=1, maximum=12),
        year=_parse_int(request.args.get("year"), minimum=2000, maximum=2100),
        category=(request.args.get("category") or "").strip(),
        page=1,
        page_size=200,
    )
    result = list_entries_query(user.id, filters)
    meta = result["meta"]
    return render_template(
        "entries/list.html",
        entries=result["items"],
        delete_form=DeleteForm(),
        months=list(enumerate(MONTH_NAMES, start=1)),
        years=available_years(user.id, _current_date().year),
        categories=available_categories(user.id),
        filters={"month": filters.month, "year": filters.year, "category": filters.category},
        filtered_balance=meta["filtered_balance_minutes"],
        filtered_estimated_value=meta["filtered_estimated_value_cents"],
        filtered_night_minutes=meta["filtered_night_minutes"],
        filtered_weekend_credit=meta["filtered_weekend_credit_minutes"],
    )


@bp.route("/entries/new", methods=["GET", "POST"])
@login_required
def create_entry():
    user = current_user()
    settings = ensure_user_settings(user, current_app.config)
    rules = rules_from_settings(settings, current_app.config)
    form = EntryForm()

    if form.validate_on_submit():
        try:
            create_entry_service(user, settings, _entry_input_from_form(form), current_app.config)
        except ValidationError as exc:
            form.expected_duration.errors.append(exc.message)
        else:
            flash("Lancamento criado com sucesso.", "success")
            return redirect(url_for("web.list_entries"))

    return render_template(
        "entries/form.html",
        form=form,
        title="Novo lancamento",
        category_suggestions=CATEGORY_SUGGESTIONS,
        submit_label="Criar lancamento",
        schedule_help=default_schedule_label(rules),
        settings=settings,
        settings_ready=bool(settings.gross_salary_cents and settings.monthly_workload_minutes),
    )


@bp.route("/entries/<int:entry_id>/edit", methods=["GET", "POST"])
@login_required
def edit_entry(entry_id):
    user = current_user()
    settings = ensure_user_settings(user, current_app.config)
    rules = rules_from_settings(settings, current_app.config)
    entry = get_entry_for_user(user.id, entry_id)
    form = EntryForm()

    if request.method == "GET":
        _seed_form(entry, form)
    elif form.validate_on_submit():
        try:
            update_entry_service(entry, user, settings, _entry_input_from_form(form), current_app.config)
        except ValidationError as exc:
            form.expected_duration.errors.append(exc.message)
        else:
            flash("Lancamento atualizado com sucesso.", "success")
            return redirect(url_for("web.list_entries"))

    return render_template(
        "entries/form.html",
        form=form,
        title="Editar lancamento",
        category_suggestions=CATEGORY_SUGGESTIONS,
        submit_label="Salvar alteracoes",
        schedule_help=default_schedule_label(rules),
        settings=settings,
        settings_ready=bool(settings.gross_salary_cents and settings.monthly_workload_minutes),
    )


@bp.route("/entries/<int:entry_id>/delete", methods=["POST"])
@login_required
def delete_entry_view(entry_id):
    form = DeleteForm()
    if not form.validate_on_submit():
        current_app.logger.warning("Tentativa de exclusao sem validacao de formulario.")
        return redirect(url_for("web.list_entries"))

    entry = get_entry_for_user(current_user().id, entry_id)
    delete_entry_service(entry)
    flash("Lancamento excluido com sucesso.", "success")
    return redirect(request.referrer or url_for("web.list_entries"))


@bp.route("/settings", methods=["GET", "POST"])
@login_required
def settings():
    user = current_user()
    settings = ensure_user_settings(user, current_app.config)
    form = SettingsForm()

    if request.method == "GET":
        if settings.gross_salary_cents is not None:
            form.gross_salary.data = Decimal(settings.gross_salary_cents) / Decimal("100")
        if settings.monthly_workload_minutes is not None:
            form.monthly_workload.data = format_minutes(settings.monthly_workload_minutes)
        if settings.weekly_workload_minutes is not None:
            form.weekly_workload.data = format_minutes(settings.weekly_workload_minutes)
        form.weekday_expected_duration.data = format_minutes(settings.weekday_expected_minutes)
        form.saturday_expected_duration.data = format_minutes(settings.saturday_expected_minutes)
        form.sunday_expected_duration.data = format_minutes(settings.sunday_expected_minutes)
        form.weekday_overtime_multiplier.data = Decimal(str(settings.weekday_overtime_multiplier))
        form.saturday_overtime_multiplier.data = Decimal(str(settings.saturday_overtime_multiplier))
        form.sunday_work_multiplier.data = Decimal(str(settings.sunday_work_multiplier))
    elif form.validate_on_submit():
        update_user_settings(settings, _settings_input_from_form(form))
        flash("Configuracoes pessoais salvas com sucesso.", "success")
        return redirect(url_for("web.settings"))

    rules = rules_from_settings(settings, current_app.config)
    return render_template(
        "settings.html",
        form=form,
        settings=settings,
        hourly_rate_label=format_currency(
            dashboard_data_hourly_rate(settings)
        ),
        schedule_help=default_schedule_label(rules),
        saturday_multiplier_label=format_multiplier_label(settings.saturday_overtime_multiplier),
    )


def dashboard_data_hourly_rate(settings):
    from ..utils import hourly_rate_cents

    return hourly_rate_cents(settings.gross_salary_cents, settings.monthly_workload_minutes)
