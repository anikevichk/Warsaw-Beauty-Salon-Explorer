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
        if self.updated_data is not None:
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
            "reviews_count": 10,
            "price_range": "50-100 PLN",
            "average_price": 75,
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


def test_get_salons_filters_by_service(monkeypatch):
    fake_data = [
        {
            "id": "1",
            "name": "Nail Salon",
            "district": "Wola",
            "rating": 5,
            "reviews_count": 10,
            "price_range": "50-100 PLN",
            "average_price": 75,
            "services": ["Classic manicure"],
        },
        {
            "id": "2",
            "name": "Hair Salon",
            "district": "Mokotów",
            "rating": 4,
            "reviews_count": 5,
            "price_range": "80-150 PLN",
            "average_price": 100,
            "services": ["Haircut"],
        },
    ]

    monkeypatch.setattr(
        salon_service,
        "supabase",
        FakeSupabase(fake_data),
    )

    result = salon_service.get_salons(service="manikure")

    assert len(result) == 1
    assert result[0]["name"] == "Nail Salon"
    assert "services" not in result[0]


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


def test_normalize_text_lowercase_and_remove_polish_diacritics():
    assert salon_service.normalize_text("Śródmieście") == "srodmiescie"
    assert salon_service.normalize_text("Łódź") == "lodz"
    assert salon_service.normalize_text("  MANICURE  ") == "manicure"


def test_levenshtein_exact_match():
    assert salon_service.levenshtein("manicure", "manicure") == 0


def test_levenshtein_with_typo():
    assert salon_service.levenshtein("manicure", "manikure") == 1
    assert salon_service.levenshtein("makeup", "makup") == 1


def test_normalize_services_none():
    assert salon_service.normalize_services(None) == []


def test_normalize_services_list():
    services = [" Manicure ", "", " Pedicure "]

    assert salon_service.normalize_services(services) == ["Manicure", "Pedicure"]


def test_normalize_services_string_with_commas_and_semicolons():
    services = "Manicure, Pedicure; Haircut"

    assert salon_service.normalize_services(services) == [
        "Manicure",
        "Pedicure",
        "Haircut",
    ]


def test_service_matches_exact_substring():
    salon = {
        "services": ["Classic manicure", "Haircut"],
    }

    assert salon_service.service_matches(salon, "manicure") is True


def test_service_matches_with_typo():
    salon = {
        "services": ["Classic manicure", "Haircut"],
    }

    assert salon_service.service_matches(salon, "manikure") is True


def test_service_matches_polish_letters():
    salon = {
        "services": ["Przedłużanie paznokci"],
    }

    assert salon_service.service_matches(salon, "przedluzanie") is True


def test_service_matches_returns_false_when_no_match():
    salon = {
        "services": ["Haircut", "Coloring"],
    }

    assert salon_service.service_matches(salon, "massage") is False


def test_service_matches_empty_query_returns_true():
    salon = {
        "services": ["Haircut"],
    }

    assert salon_service.service_matches(salon, "   ") is True


def test_remove_services_removes_services_field_without_mutating_original():
    salon = {
        "id": "123",
        "name": "Glow Beauty",
        "services": ["Manicure"],
    }

    result = salon_service.remove_services(salon)

    assert result == {
        "id": "123",
        "name": "Glow Beauty",
    }

    assert "services" in salon