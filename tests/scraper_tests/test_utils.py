from bs4 import BeautifulSoup

import utils


def test_clean_text_removes_extra_spaces_and_newlines():
    text = "  Hello\n\n   world   "
    assert utils.clean_text(text) == "Hello world"


def test_clean_text_returns_none_for_empty_values():
    assert utils.clean_text(None) is None
    assert utils.clean_text("") is None


def test_remove_emojis_removes_emojis():
    text = "🌷 Manicure hybrydowy ✨"
    assert utils.remove_emojis(text) == "Manicure hybrydowy"


def test_get_soup_returns_beautifulsoup(monkeypatch):
    class FakeResponse:
        text = "<html><body><h1>Test</h1></body></html>"

        def raise_for_status(self):
            pass

    def fake_get(url, headers, timeout):
        return FakeResponse()

    monkeypatch.setattr(utils.requests, "get", fake_get)

    soup = utils.get_soup("https://example.com")

    assert isinstance(soup, BeautifulSoup)
    assert soup.find("h1").get_text() == "Test"


def test_is_valid_salon_returns_true_for_required_fields():
    salon = {
        "name": "Test Salon",
        "address": "Puławska 1, Warszawa",
        "district": "Mokotów",
    }

    assert utils.is_valid_salon(salon) is True


def test_is_valid_salon_returns_false_without_name():
    salon = {
        "name": None,
        "address": "Puławska 1, Warszawa",
        "district": "Mokotów",
    }

    assert utils.is_valid_salon(salon) is False


def test_is_valid_salon_returns_false_without_address():
    salon = {
        "name": "Test Salon",
        "address": None,
        "district": "Mokotów",
    }

    assert utils.is_valid_salon(salon) is False


def test_is_valid_salon_returns_false_without_district():
    salon = {
        "name": "Test Salon",
        "address": "Puławska 1, Warszawa",
        "district": None,
    }

    assert utils.is_valid_salon(salon) is False