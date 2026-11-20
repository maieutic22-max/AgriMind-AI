from app.api.v1.routes.health import get_health
from app.api.v1.routes.system import get_system_info


def test_health_endpoint_structure():
    data = get_health()
    assert data.status == "healthy"
    assert data.service == "AgriMind AI API"
    assert data.database is not None
    assert data.database.status in ["connected", "disconnected"]


def test_system_info_endpoint():
    data = get_system_info()
    assert data.core_capabilities_count == 26
    assert data.implementation_deliverables_count == 34
    assert len(data.modules) == 4
