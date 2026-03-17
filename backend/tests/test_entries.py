from datetime import date

from sqlalchemy import select

from app.extensions import db
from app.models import OvertimeEntry, User, UserSettings
from app.services.entries import create_entry
from app.services.types import EntryInput


def api_csrf(client):
    return client.get("/api/v1/auth/me").headers["X-CSRF-Token"]


def register_and_login(client, email="isaac@example.com"):
    csrf_token = api_csrf(client)
    response = client.post(
        "/api/v1/auth/register",
        json={
            "display_name": "Isaac Silva",
            "email": email,
            "password": "segredo123",
            "password_confirm": "segredo123",
        },
        headers={"X-CSRF-Token": csrf_token},
    )
    assert response.status_code == 201
    return response.headers["X-CSRF-Token"]


def create_user(app, *, email, display_name, password):
    with app.app_context():
        user = User(email=email, display_name=display_name, is_admin=False)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        settings = UserSettings(
            user_id=user.id,
            gross_salary_cents=431800,
            monthly_workload_minutes=10340,
            weekly_workload_minutes=2400,
            weekday_expected_minutes=480,
            saturday_expected_minutes=0,
            sunday_expected_minutes=0,
            weekday_overtime_multiplier=1.5,
            saturday_overtime_multiplier=1.5,
            sunday_work_multiplier=2.0,
        )
        db.session.add(settings)
        db.session.commit()
        return user.id


def test_settings_patch_and_dashboard_flow(client):
    csrf_token = register_and_login(client)

    settings_response = client.patch(
        "/api/v1/settings",
        json={
            "gross_salary_cents": 431800,
            "monthly_workload_minutes": 10340,
            "weekly_workload_minutes": 2400,
            "weekday_expected_minutes": 480,
            "saturday_expected_minutes": 0,
            "sunday_expected_minutes": 0,
            "weekday_overtime_multiplier": 1.5,
            "saturday_overtime_multiplier": 1.5,
            "sunday_work_multiplier": 2.0,
        },
        headers={"X-CSRF-Token": csrf_token},
    )

    assert settings_response.status_code == 200
    assert settings_response.get_json()["hourly_rate_cents"] == 2506

    dashboard_response = client.get("/api/v1/dashboard")
    assert dashboard_response.status_code == 200
    assert dashboard_response.get_json()["summary"]["settings_ready"] is True


def test_entries_api_crud_with_filters_pagination_and_snapshot(client):
    csrf_token = register_and_login(client)

    manual_response = client.post(
        "/api/v1/entries",
        json={
            "entry_date": "2026-03-10",
            "entry_mode": "manual",
            "movement_type": "credit",
            "duration_minutes": 90,
            "category": "Hora extra",
            "notes": "Plantao de fechamento",
        },
        headers={"X-CSRF-Token": csrf_token},
    )
    assert manual_response.status_code == 201
    manual_id = manual_response.get_json()["id"]
    assert manual_response.get_json()["duration_minutes"] == 90

    calculated_response = client.post(
        "/api/v1/entries",
        json={
            "entry_date": "2026-03-07",
            "entry_mode": "calculated",
            "start_time": "09:00",
            "end_time": "12:00",
            "break_minutes": 0,
            "expected_minutes": 0,
            "category": "Plantao sabado",
            "notes": "Turno especial",
        },
        headers={"X-CSRF-Token": manual_response.headers["X-CSRF-Token"]},
    )
    calculated_payload = calculated_response.get_json()
    assert calculated_response.status_code == 201
    assert calculated_payload["weekend_minutes"] == 180
    assert calculated_payload["applied_saturday_overtime_multiplier"] == 1.5

    list_response = client.get("/api/v1/entries?page=1&page_size=1&month=3&year=2026")
    list_payload = list_response.get_json()
    assert list_response.status_code == 200
    assert list_payload["meta"]["total_items"] == 2
    assert list_payload["meta"]["total_pages"] == 2
    assert len(list_payload["items"]) == 1
    assert "Hora extra" in list_payload["filter_options"]["categories"]

    patch_response = client.patch(
        f"/api/v1/entries/{manual_id}",
        json={"notes": "Plantao ajustado", "duration_minutes": 120},
        headers={"X-CSRF-Token": list_response.headers["X-CSRF-Token"]},
    )
    assert patch_response.status_code == 200
    assert patch_response.get_json()["notes"] == "Plantao ajustado"
    assert patch_response.get_json()["duration_minutes"] == 120

    delete_response = client.delete(
        f"/api/v1/entries/{manual_id}",
        headers={"X-CSRF-Token": patch_response.headers["X-CSRF-Token"]},
    )
    assert delete_response.status_code == 200
    assert delete_response.get_json()["deleted"] is True


def test_entry_ownership_and_html_routes_are_not_available(client, app):
    owner_id = create_user(app, email="owner@example.com", display_name="Owner", password="senha12345")
    guest_id = create_user(app, email="guest@example.com", display_name="Guest", password="senha12345")

    with app.app_context():
        owner = db.session.get(User, owner_id)
        settings = owner.settings
        entry = create_entry(
            owner,
            settings,
            EntryInput(
                entry_date=date(2026, 3, 5),
                category="Hora extra",
                notes="Restrito ao dono",
                entry_mode="manual",
                movement_type="credit",
                duration_minutes=90,
            ),
            app.config,
        )
        entry_id = entry.id

    guest_client = app.test_client()
    csrf_token = guest_client.get("/api/v1/auth/me").headers["X-CSRF-Token"]
    register_response = guest_client.post(
        "/api/v1/auth/login",
        json={"email": "guest@example.com", "password": "senha12345"},
        headers={"X-CSRF-Token": csrf_token},
    )
    assert register_response.status_code == 200

    forbidden_response = guest_client.get(f"/api/v1/entries/{entry_id}")
    assert forbidden_response.status_code == 404

    assert client.get("/").status_code == 404
    assert client.get("/login").status_code == 404
    assert client.get("/entries").status_code == 404
    assert client.get("/settings").status_code == 404


def test_invalid_entry_payload_returns_structured_error(client):
    csrf_token = register_and_login(client)

    response = client.post(
        "/api/v1/entries",
        json={
            "entry_date": "2026-03-10",
            "entry_mode": "manual",
            "category": "Hora extra",
            "notes": "Sem duracao",
        },
        headers={"X-CSRF-Token": csrf_token},
    )

    payload = response.get_json()
    assert response.status_code == 422
    assert payload["error"]["code"] == "invalid_payload"
