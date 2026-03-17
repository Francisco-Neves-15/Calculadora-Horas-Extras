def test_cors_allows_configured_origin(client):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Origin": "http://localhost:5173"},
    )

    assert response.status_code == 200
    assert response.headers.get("Access-Control-Allow-Origin") == "http://localhost:5173"
    assert response.headers.get("Access-Control-Allow-Credentials") == "true"


def test_cors_blocks_unknown_origin(client):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Origin": "http://malicious.local"},
    )

    assert response.status_code == 200
    assert response.headers.get("Access-Control-Allow-Origin") is None
