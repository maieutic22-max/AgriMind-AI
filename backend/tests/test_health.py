from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint_structure():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "AgriMind AI API"
    assert "database" in data
    assert "status" in data["database"]
    assert "message" in data["database"]
    assert "timestamp" in data

def test_system_info_endpoint():
    response = client.get("/api/v1/system/info")
    assert response.status_code == 200
    data = response.json()
    assert data["core_capabilities_count"] == 26
    assert data["implementation_deliverables_count"] == 34
    assert len(data["modules"]) == 4
