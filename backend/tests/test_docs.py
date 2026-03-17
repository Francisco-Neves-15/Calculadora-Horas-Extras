from datetime import date

from app import create_app
from app.migrations import upgrade_database


def test_swagger_ui_and_spec_are_available(client):
    ui_response = client.get("/api/docs/")
    spec_response = client.get("/api/swagger.json")

    assert ui_response.status_code == 200
    assert "swagger-ui" in ui_response.get_data(as_text=True).lower()

    assert spec_response.status_code == 200
    spec = spec_response.get_json()
    assert spec["info"]["title"] == "Horas Extras API"
    assert "/api/v1/auth/login" in spec["paths"]
    assert "/api/v1/dashboard" in spec["paths"]
    assert "/api/v1/entries/{entry_id}" in spec["paths"]


def test_swagger_routes_disabled_when_flag_is_false(tmp_path):
    app = create_app(
        {
            "TESTING": True,
            "WTF_CSRF_ENABLED": False,
            "SQLALCHEMY_DATABASE_URI": f"sqlite:///{tmp_path / 'test.db'}",
            "CURRENT_DATE": date(2026, 3, 10),
            "INSTANCE_PATH": str(tmp_path / "instance"),
            "ENABLE_SWAGGER": False,
        }
    )

    with app.app_context():
        upgrade_database()

    client = app.test_client()
    assert client.get("/api/docs/").status_code == 404
    assert client.get("/api/swagger.json").status_code == 404
