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
