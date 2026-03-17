from datetime import date

from flasgger import swag_from
from flask import Blueprint, current_app, g, jsonify, request
from flask_wtf.csrf import generate_csrf, validate_csrf
from pydantic import ValidationError as PydanticValidationError
from wtforms.validators import ValidationError as WTValidationError

from ...auth import log_user_in, log_user_out, require_authenticated_user
from ...errors import AppError, AuthorizationError, ValidationError
from ...queries import available_categories, available_years, build_dashboard_data, list_entries
from .docs import (
    AUTH_LOGIN_DOC,
    AUTH_LOGOUT_DOC,
    AUTH_ME_DOC,
    AUTH_REGISTER_DOC,
    CREATE_ENTRY_DOC,
    DASHBOARD_DOC,
    DELETE_ENTRY_DOC,
    GET_ENTRY_DOC,
    GET_SETTINGS_DOC,
    LIST_ENTRIES_DOC,
    PATCH_ENTRY_DOC,
    PATCH_SETTINGS_DOC,
)
from ...schemas import (
    DashboardResponse,
    EntryCreateRequest,
    EntryListQuery,
    EntryListResponse,
    EntryResponse,
    EntryUpdateRequest,
    LoginRequest,
    RegisterRequest,
    SessionResponse,
    SettingsPatchRequest,
    SettingsResponse,
    UserResponse,
)
from ...services.auth import authenticate_user, register_user
from ...services.entries import create_entry, delete_entry, get_entry_for_user, update_entry
from ...services.settings import ensure_user_settings, update_user_settings

bp = Blueprint("api_v1", __name__, url_prefix="/api/v1")
_SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def _current_date():
    return current_app.config.get("CURRENT_DATE", date.today())


@bp.before_request
def validate_api_csrf():
    if request.method in _SAFE_METHODS:
        return

    token = request.headers.get("X-CSRF-Token")
    if not token:
        raise AuthorizationError(
            "Token CSRF obrigatorio.",
            code="csrf_missing",
        )

    try:
        validate_csrf(token)
    except WTValidationError as exc:
        raise AuthorizationError(
            "Token CSRF invalido.",
            code="csrf_invalid",
            details={"reason": str(exc)},
        ) from exc


@bp.after_request
def attach_api_csrf_token(response):
    token = _csrf_token()
    response.headers["X-CSRF-Token"] = token
    response.set_cookie(
        "csrf_token",
        token,
        httponly=False,
        samesite=current_app.config["SESSION_COOKIE_SAMESITE"],
        secure=bool(current_app.config.get("SESSION_COOKIE_SECURE")),
    )
    return response


@bp.app_errorhandler(AppError)
def handle_app_error(error):
    return _json({"error": error.to_dict()}, status=error.status_code)


@bp.app_errorhandler(PydanticValidationError)
def handle_pydantic_error(error):
    app_error = ValidationError(
        "Payload invalido.",
        code="invalid_payload",
        details={"issues": _pydantic_issues(error)},
    )
    return _json({"error": app_error.to_dict()}, status=app_error.status_code)


@bp.route("/auth/register", methods=["POST"])
@swag_from(AUTH_REGISTER_DOC)
def register():
    payload = _parse_body(RegisterRequest)
    user, claimed_entries = register_user(
        payload.display_name,
        payload.email,
        payload.password,
        current_app.config,
    )
    log_user_in(user)
    response = SessionResponse(
        authenticated=True,
        user=UserResponse.model_validate(user),
        csrf_token=_csrf_token(),
        claimed_legacy_entries=claimed_entries or None,
    )
    return _json(response.model_dump(mode="json"), status=201)


@bp.route("/auth/login", methods=["POST"])
@swag_from(AUTH_LOGIN_DOC)
def login():
    payload = _parse_body(LoginRequest)
    user = authenticate_user(payload.email, payload.password)
    log_user_in(user)
    response = SessionResponse(
        authenticated=True,
        user=UserResponse.model_validate(user),
        csrf_token=_csrf_token(),
    )
    return _json(response.model_dump(mode="json"))


@bp.route("/auth/logout", methods=["POST"])
@swag_from(AUTH_LOGOUT_DOC)
def logout():
    log_user_out()
    response = SessionResponse(
        authenticated=False,
        user=None,
        csrf_token=_csrf_token(),
    )
    return _json(response.model_dump(mode="json"))


@bp.route("/auth/me", methods=["GET"])
@swag_from(AUTH_ME_DOC)
def me():
    user = g.get("user")
    response = SessionResponse(
        authenticated=user is not None,
        user=UserResponse.model_validate(user) if user is not None else None,
        csrf_token=_csrf_token(),
    )
    return _json(response.model_dump(mode="json"))


@bp.route("/dashboard", methods=["GET"])
@swag_from(DASHBOARD_DOC)
def dashboard():
    user = require_authenticated_user()
    settings = ensure_user_settings(user, current_app.config)
    dashboard_data = build_dashboard_data(user.id, settings, _current_date())
    response = DashboardResponse(
        summary=dashboard_data["summary"],
        chart_data=dashboard_data["chart_data"],
        recent_entries=[EntryResponse.from_entry(entry) for entry in dashboard_data["recent_entries"]],
    )
    return _json(response.model_dump(mode="json"))


@bp.route("/settings", methods=["GET"])
@swag_from(GET_SETTINGS_DOC)
def get_settings():
    user = require_authenticated_user()
    settings = ensure_user_settings(user, current_app.config)
    response = SettingsResponse.from_settings(settings)
    return _json(response.model_dump(mode="json"))


@bp.route("/settings", methods=["PATCH"])
@swag_from(PATCH_SETTINGS_DOC)
def patch_settings():
    user = require_authenticated_user()
    settings = ensure_user_settings(user, current_app.config)
    payload = _parse_body(SettingsPatchRequest)
    updated_settings = update_user_settings(settings, payload.to_input(settings))
    response = SettingsResponse.from_settings(updated_settings)
    return _json(response.model_dump(mode="json"))


@bp.route("/entries", methods=["GET"])
@swag_from(LIST_ENTRIES_DOC)
def get_entries():
    user = require_authenticated_user()
    payload = _parse_query(EntryListQuery)
    filters = payload.to_filters()
    result = list_entries(user.id, filters)
    response = EntryListResponse(
        items=[EntryResponse.from_entry(entry) for entry in result["items"]],
        meta=result["meta"],
        filter_options={
            "categories": available_categories(user.id),
            "years": available_years(user.id, _current_date().year),
        },
    )
    return _json(response.model_dump(mode="json"))


@bp.route("/entries", methods=["POST"])
@swag_from(CREATE_ENTRY_DOC)
def post_entry():
    user = require_authenticated_user()
    settings = ensure_user_settings(user, current_app.config)
    payload = _parse_body(EntryCreateRequest)
    entry = create_entry(user, settings, payload.to_input(), current_app.config)
    return _json(EntryResponse.from_entry(entry).model_dump(mode="json"), status=201)


@bp.route("/entries/<int:entry_id>", methods=["GET"])
@swag_from(GET_ENTRY_DOC)
def get_entry(entry_id):
    user = require_authenticated_user()
    entry = get_entry_for_user(user.id, entry_id)
    return _json(EntryResponse.from_entry(entry).model_dump(mode="json"))


@bp.route("/entries/<int:entry_id>", methods=["PATCH"])
@swag_from(PATCH_ENTRY_DOC)
def patch_entry(entry_id):
    user = require_authenticated_user()
    settings = ensure_user_settings(user, current_app.config)
    entry = get_entry_for_user(user.id, entry_id)
    payload = _parse_body(EntryUpdateRequest)
    updated_entry = update_entry(
        entry,
        user,
        settings,
        payload.to_input(entry),
        current_app.config,
    )
    return _json(EntryResponse.from_entry(updated_entry).model_dump(mode="json"))


@bp.route("/entries/<int:entry_id>", methods=["DELETE"])
@swag_from(DELETE_ENTRY_DOC)
def remove_entry(entry_id):
    user = require_authenticated_user()
    entry = get_entry_for_user(user.id, entry_id)
    delete_entry(entry)
    return _json({"deleted": True, "id": entry_id})


def _parse_body(schema_cls):
    payload = request.get_json(silent=True)
    if payload is None:
        raise ValidationError(
            "Corpo JSON obrigatorio.",
            code="invalid_json",
        )
    return schema_cls.model_validate(payload)


def _parse_query(schema_cls):
    return schema_cls.model_validate(request.args.to_dict(flat=True))


def _json(payload, status=200):
    return jsonify(payload), status


def _csrf_token():
    return generate_csrf()


def _pydantic_issues(error):
    issues = []
    for issue in error.errors():
        issues.append(
            {
                "location": ".".join(str(item) for item in issue["loc"]),
                "message": issue["msg"],
            }
        )
    return issues
