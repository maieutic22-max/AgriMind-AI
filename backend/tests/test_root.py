from app.main import read_root


def test_root_endpoint():
    data = read_root()
    assert data["service"] == "AgriMind AI API"
    assert data["status"] == "online"
    assert "docs_url" in data
