
from unittest.mock import patch

import pymysql
from app import app


def test_home():
    client = app.test_client()
    response = client.get("/")

    assert response.status_code == 200
    assert response.get_json()["service"] == "progress-service"


def test_health():
    client = app.test_client()
    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json() == {"status": "UP"}


@patch(
    "app.get_db_connection",
    side_effect=pymysql.OperationalError("Database unavailable"),
)
def test_progress_handles_database_failure(mock_connection):
    client = app.test_client()
    response = client.get("/api/progress")

    assert response.status_code == 503
    assert response.is_json
    assert response.get_json() == {
        "error": "Database temporarily unavailable"
    }
    mock_connection.assert_called_once()
