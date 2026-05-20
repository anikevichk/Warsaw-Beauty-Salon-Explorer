from bs4 import BeautifulSoup

import search


def test_collect_profile_links_collects_matching_booksy_links(monkeypatch):
    html = """
    <html>
        <body>
            <a href="/pl-pl/123_test-salon_fryzjer_3_warszawa">Salon 1</a>
            <a href="/pl-pl/456_beauty-place_salon-kosmetyczny_3_warszawa">Salon 2</a>
            <a href="/pl-pl/s/fryzjer/3_warszawa">Not profile</a>
            <a href="/wrong/link">Wrong</a>
        </body>
    </html>
    """

    def fake_get_soup(url):
        return BeautifulSoup(html, "html.parser")

    monkeypatch.setattr(search, "SEARCH_URLS", ["https://booksy.com/pl-pl/s/fryzjer/3_warszawa"])
    monkeypatch.setattr(search, "PAGES_PER_CATEGORY", 1)
    monkeypatch.setattr(search, "get_soup", fake_get_soup)
    monkeypatch.setattr(search.time, "sleep", lambda seconds: None)

    links = search.collect_profile_links()

    assert set(links) == {
        "https://booksy.com/pl-pl/123_test-salon_fryzjer_3_warszawa",
        "https://booksy.com/pl-pl/456_beauty-place_salon-kosmetyczny_3_warszawa",
    }


def test_collect_profile_links_removes_duplicates(monkeypatch):
    html = """
    <html>
        <body>
            <a href="/pl-pl/123_test-salon_fryzjer_3_warszawa">Salon</a>
            <a href="/pl-pl/123_test-salon_fryzjer_3_warszawa">Salon duplicate</a>
        </body>
    </html>
    """

    monkeypatch.setattr(search, "SEARCH_URLS", ["https://booksy.com/pl-pl/s/fryzjer/3_warszawa"])
    monkeypatch.setattr(search, "PAGES_PER_CATEGORY", 1)
    monkeypatch.setattr(search, "get_soup", lambda url: BeautifulSoup(html, "html.parser"))
    monkeypatch.setattr(search.time, "sleep", lambda seconds: None)

    links = search.collect_profile_links()

    assert links == ["https://booksy.com/pl-pl/123_test-salon_fryzjer_3_warszawa"]