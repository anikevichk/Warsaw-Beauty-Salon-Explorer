import pytest
from fastapi import HTTPException

from backend import salon_service


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeQuery:
    def __init__(self, data):
        self.data = data
        self.updated_data = None

    def select(self, *_):
        return self

    def eq(self, *_):
        return self

    def contains(self, *_):
        return self

    def ilike(self, *_):
        return self

    def order(self, *_args, **_kwargs):
        return self

    def range(self, *_):
        return self

    def limit(self, *_):
        return self

    def update(self, data):
        self.updated_data = data
        return self

    def execute(self):
        if self.updated_data:
            result = {"id": "1", **self.updated_data}
            return FakeResponse([result])

        return FakeResponse(self.data)


class FakeSupabase:
    def __init__(self, data):
        self.query = FakeQuery(data)

    def table(self, _):
        return self.query


def test_get_salons_returns_list(monkeypatch):
    fake_data = [
        {
            "id": "1",
            "name": "Test Salon",
            "district": "Wola",
            "rating": 5,
            "price_range": "50-100 PLN",
        }
    ]

    monkeypatch.setattr(
        salon_service,
        "supabase",
        FakeSupabase(fake_data),
    )

    result = salon_service.get_salons()

    assert len(result) == 1
    assert result[0]["name"] == "Test Salon"


def test_get_salon_by_id_returns_salon(monkeypatch):
    fake_data = [
        {
            "id": "1",
            "name": "Test Salon",
        }
    ]

    monkeypatch.setattr(
        salon_service,
        "supabase",
        FakeSupabase(fake_data),
    )

    result = salon_service.get_salon_by_id("1")

    assert result["id"] == "1"
    assert result["name"] == "Test Salon"


def test_get_salon_by_id_raises_404_when_not_found(monkeypatch):
    monkeypatch.setattr(
        salon_service,
        "supabase",
        FakeSupabase([]),
    )

    with pytest.raises(HTTPException) as error:
        salon_service.get_salon_by_id("missing-id")

    assert error.value.status_code == 404
    assert error.value.detail == "Salon not found"


def test_update_salon_updates_data(monkeypatch):
    monkeypatch.setattr(
        salon_service,
        "supabase",
        FakeSupabase([]),
    )

    result = salon_service.update_salon(
        "1",
        {"phone": "123 456 789"},
    )

    assert result["id"] == "1"
    assert result["phone"] == "123 456 789"
    assert "updated_at" in result


def test_update_salon_raises_400_for_empty_data():
    with pytest.raises(HTTPException) as error:
        salon_service.update_salon("1", {})

    assert error.value.status_code == 400
    assert error.value.detail == "No data provided"