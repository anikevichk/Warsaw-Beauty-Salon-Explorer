from fastapi.testclient import TestClient

from backend.main import app
from fastapi import HTTPException

client = TestClient(app)


def test_get_salons_route(monkeypatch):
    def fake_get_salons(
        district=None,
        service=None,
        search=None,
        limit=50,
        offset=0,
    ):
        return [
            {
                "id": "1",
                "name": "Test Salon",
                "district": "Wola",
                "rating": 5,
                "price_range": "50-100 PLN",
            }
        ]

    monkeypatch.setattr("backend.salons.get_salons", fake_get_salons)

    response = client.get("/api/salons")

    assert response.status_code == 200
    assert response.json()[0]["name"] == "Test Salon"


def test_get_single_salon_route(monkeypatch):
    def fake_get_salon_by_id(salon_id):
        return {
            "id": salon_id,
            "name": "Test Salon",
            "address": "Test Address",
            "services": ["Haircut"],
        }

    monkeypatch.setattr("backend.salons.get_salon_by_id", fake_get_salon_by_id)

    response = client.get("/api/salons/123")

    assert response.status_code == 200
    assert response.json()["id"] == "123"
    assert response.json()["services"] == ["Haircut"]


def test_update_salon_route(monkeypatch):
    def fake_update_salon(salon_id, update_data):
        return {
            "id": salon_id,
            **update_data,
        }

    monkeypatch.setattr("backend.salons.update_salon", fake_update_salon)

    response = client.put(
        "/api/salons/123",
        json={"phone": "999 888 777"},
    )

    assert response.status_code == 200
    assert response.json()["id"] == "123"
    assert response.json()["phone"] == "999 888 777"


def test_get_salons_with_district_filter(monkeypatch):
    captured = {}

    def fake_get_salons(
        district=None,
        service=None,
        search=None,
        limit=50,
        offset=0,
    ):
        captured["district"] = district
        return []

    monkeypatch.setattr("backend.salons.get_salons", fake_get_salons)

    response = client.get("/api/salons?district=Wola")

    assert response.status_code == 200
    assert captured["district"] == "Wola"


def test_get_salons_with_service_filter(monkeypatch):
    captured = {}

    def fake_get_salons(
        district=None,
        service=None,
        search=None,
        limit=50,
        offset=0,
    ):
        captured["service"] = service
        return []

    monkeypatch.setattr("backend.salons.get_salons", fake_get_salons)

    response = client.get("/api/salons?service=Koloryzacja")

    assert response.status_code == 200
    assert captured["service"] == "Koloryzacja"


def test_get_salons_with_search(monkeypatch):
    captured = {}

    def fake_get_salons(
        district=None,
        service=None,
        search=None,
        limit=50,
        offset=0,
    ):
        captured["search"] = search
        return []

    monkeypatch.setattr("backend.salons.get_salons", fake_get_salons)

    response = client.get("/api/salons?search=hair")

    assert response.status_code == 200
    assert captured["search"] == "hair"


def test_update_salon_with_empty_body_returns_400(monkeypatch):
    def fake_update_salon(salon_id, update_data):
        if not update_data:
            raise HTTPException(status_code=400, detail="No data provided")

    monkeypatch.setattr("backend.salons.update_salon", fake_update_salon)

    response = client.put("/api/salons/123", json={})

    assert response.status_code == 400
    assert response.json()["detail"] == "No data provided"