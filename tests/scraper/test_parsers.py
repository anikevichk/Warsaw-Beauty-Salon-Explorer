from bs4 import BeautifulSoup

import parsers


def test_parse_rating_star_format():
    text = "★ 5.0 (126 opinii)"

    rating, reviews_count = parsers.parse_rating(text)

    assert rating == 5.0
    assert reviews_count == 126


def test_parse_rating_booksy_text_format():
    text = "5.0/5 Na podstawie 61 opinii"

    rating, reviews_count = parsers.parse_rating(text)

    assert rating == 5.0
    assert reviews_count == 61


def test_parse_rating_returns_none_when_missing():
    rating, reviews_count = parsers.parse_rating("Brak opinii")

    assert rating is None
    assert reviews_count is None


def test_extract_services_removes_ignored_headings_and_duplicates():
    html = """
    <html>
        <body>
            <h3>Usługi</h3>
            <h3>Popularne usługi</h3>
            <h3>🌷 Manicure hybrydowy</h3>
            <h4>Pedicure</h4>
            <h3>Opinie</h3>
            <h3>Manicure hybrydowy</h3>
        </body>
    </html>
    """

    soup = BeautifulSoup(html, "html.parser")

    assert parsers.extract_services(soup) == [
        "Manicure hybrydowy",
        "Pedicure",
    ]


def test_extract_prices_finds_polish_prices():
    text = "Manicure 120,00 zł Pedicure 1 200,00 zł"

    assert parsers.extract_prices(text) == [120.0, 1200.0]


def test_extract_price_range_returns_min_and_max():
    assert parsers.extract_price_range([120.0, 50.0, 300.0]) == "50-300 PLN"


def test_extract_price_range_returns_none_for_empty_list():
    assert parsers.extract_price_range([]) is None


def test_extract_average_price_returns_average():
    assert parsers.extract_average_price([100.0, 200.0, 300.0]) == 200.0


def test_extract_average_price_returns_none_for_empty_list():
    assert parsers.extract_average_price([]) is None


def test_parse_salon_builds_complete_salon(monkeypatch):
    html = """
    <html>
        <body>
            <div>
                <h1>🌷 Test Beauty Salon</h1>
                <p>Puławska 1, 00-001, Warszawa, Mokotów</p>
            </div>

            <h3>Usługi</h3>
            <h3>Manicure hybrydowy</h3>
            <h4>Pedicure</h4>

            <span>★ 5.0 (123 opinii)</span>
            <span>100,00 zł</span>
            <span>200,00 zł</span>
        </body>
    </html>
    """

    def fake_get_soup(url):
        return BeautifulSoup(html, "html.parser")

    def fake_extract_contacts(page, url):
        return {
            "phone": "123 456 789",
            "instagram": "https://instagram.com/test",
            "facebook": None,
            "website": "https://test-salon.pl",
        }

    monkeypatch.setattr(parsers, "get_soup", fake_get_soup)
    monkeypatch.setattr(parsers, "extract_contacts_from_rendered_page", fake_extract_contacts)

    salon = parsers.parse_salon("https://booksy.com/test", page=None)

    assert salon["name"] == "Test Beauty Salon"
    assert salon["address"] == "Puławska 1, 00-001, Warszawa, Mokotów"
    assert salon["district"] == "Mokotów"
    assert salon["phone"] == "123 456 789"
    assert salon["instagram"] == "https://instagram.com/test"
    assert salon["website"] == "https://test-salon.pl"
    assert salon["services"] == ["Manicure hybrydowy", "Pedicure"]
    assert salon["price_range"] == "100-200 PLN"
    assert salon["average_price"] == 150.0
    assert salon["rating"] == 5.0
    assert salon["reviews_count"] == 123