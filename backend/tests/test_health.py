from app.services.discovery import find_ghostscript, find_libreoffice


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "mypdftools-api"
    labels = {dependency["label"] for dependency in body["dependencies"]}
    assert any("python" in label for label in labels)
    assert any("pdf_engine" in label for label in labels)


def test_health_includes_libreoffice_status(client):
    response = client.get("/api/health")
    dependencies = response.json()["dependencies"]
    libreoffice = next(d for d in dependencies if "libreoffice" in d["label"])
    assert libreoffice["available"] == (find_libreoffice() is not None)


def test_health_includes_ghostscript_status(client):
    response = client.get("/api/health")
    dependencies = response.json()["dependencies"]
    ghostscript = next(d for d in dependencies if "ghostscript" in d["label"])
    assert ghostscript["available"] == (find_ghostscript() is not None)