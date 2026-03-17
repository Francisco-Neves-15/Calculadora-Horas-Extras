from datetime import date

from sqlalchemy import select, text

from app.extensions import db
from app.models import OvertimeEntry, User


def api_csrf(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 200
    return response.headers["X-CSRF-Token"]


def seed_legacy_state(app):
    with app.app_context():
        db.session.execute(
            text(
                "CREATE TABLE app_settings ("
                "id INTEGER PRIMARY KEY, "
                "gross_salary_cents INTEGER, "
                "monthly_workload_minutes INTEGER)"
            )
        )
        db.session.execute(
            text(
                "INSERT INTO app_settings (id, gross_salary_cents, monthly_workload_minutes) "
                "VALUES (1, 431800, 10340)"
            )
        )
        legacy_entry = OvertimeEntry(
            entry_date=date(2026, 3, 4),
            movement_type="credit",
            duration_minutes=270,
            category="Legado equipe",
            notes="Historico anterior",
            user_id=None,
            entry_mode="calculated",
            expected_minutes=0,
            worked_minutes=180,
            overtime_minutes=180,
            night_minutes=0,
            weekend_minutes=0,
            weekend_credit_minutes=0,
            night_bonus_minutes=0,
            estimated_value_cents=11275,
        )
        db.session.add(legacy_entry)
        db.session.commit()
        return legacy_entry.id


def register_via_api(client, *, display_name="Isaac Silva", email="isaac@example.com", password="segredo123"):
    csrf_token = api_csrf(client)
    response = client.post(
        "/api/v1/auth/register",
        json={
            "display_name": display_name,
            "email": email,
            "password": password,
            "password_confirm": password,
        },
        headers={"X-CSRF-Token": csrf_token},
    )
    return response


def test_first_registration_claims_legacy_data_and_returns_session_payload(client, app):
    entry_id = seed_legacy_state(app)

    response = register_via_api(client)
    payload = response.get_json()

    assert response.status_code == 201
    assert payload["authenticated"] is True
    assert payload["user"]["email"] == "isaac@example.com"
    assert payload["claimed_legacy_entries"] == 1
    assert response.headers["X-CSRF-Token"]

    with app.app_context():
        user = db.session.execute(select(User)).scalar_one()
        entry = db.session.get(OvertimeEntry, entry_id)

        assert user.is_admin is True
        assert user.settings.gross_salary_cents == 431800
        assert user.settings.monthly_workload_minutes == 10340
        assert entry.user_id == user.id


def test_api_requires_csrf_for_mutating_requests(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "display_name": "Isaac Silva",
            "email": "isaac@example.com",
            "password": "segredo123",
            "password_confirm": "segredo123",
        },
    )

    payload = response.get_json()
    assert response.status_code == 403
    assert payload["error"]["code"] == "csrf_missing"


def test_me_login_and_logout_flow(client):
    register_via_api(client, email="maria@example.com")

    me_response = client.get("/api/v1/auth/me")
    assert me_response.status_code == 200
    assert me_response.get_json()["authenticated"] is True

    logout_response = client.post(
        "/api/v1/auth/logout",
        headers={"X-CSRF-Token": me_response.headers["X-CSRF-Token"]},
    )
    assert logout_response.status_code == 200
    assert logout_response.get_json()["authenticated"] is False

    login_csrf = api_csrf(client)
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "maria@example.com", "password": "segredo123"},
        headers={"X-CSRF-Token": login_csrf},
    )

    assert login_response.status_code == 200
    assert login_response.get_json()["authenticated"] is True


def test_protected_api_route_requires_authentication(client):
    response = client.get("/api/v1/dashboard")

    assert response.status_code == 401
    assert response.get_json()["error"]["code"] == "authentication_required"
