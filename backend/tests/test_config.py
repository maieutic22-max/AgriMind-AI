from app.core.config import settings

def test_settings_defaults():
    assert settings.APP_NAME == "AgriMind AI API"
    assert settings.APP_VERSION == "1.0.0"
    assert settings.API_V1_PREFIX == "/api/v1"
    assert isinstance(settings.CORS_ORIGINS, list)
    assert len(settings.CORS_ORIGINS) >= 1
