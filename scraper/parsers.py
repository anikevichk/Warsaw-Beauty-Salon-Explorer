import re
from typing import Optional

from bs4 import BeautifulSoup

from contacts import extract_contacts_from_rendered_page
from utils import clean_text, get_soup, remove_emojis


def parse_rating(text: str) -> tuple[Optional[float], Optional[int]]:
    text = re.sub(r"\s+", " ", text.replace("\xa0", " ")).strip()

    match = re.search(
        r"★\s*([0-5](?:[.,]\d)?)\s*\(([\d\s]+)\s+opini",
        text
    )
    if match:
        rating = float(match.group(1).replace(",", "."))
        reviews_count = int(match.group(2).replace(" ", ""))
        return rating, reviews_count

    match = re.search(
        r"([0-5](?:[.,]\d)?)\s*/\s*5\s+Na podstawie\s+([\d\s]+)\s+opini",
        text
    )
    if match:
        rating = float(match.group(1).replace(",", "."))
        reviews_count = int(match.group(2).replace(" ", ""))
        return rating, reviews_count

    return None, None


def extract_services(soup: BeautifulSoup) -> list[str]:
    services = []

    for heading in soup.find_all(["h3", "h4"]):
        text = remove_emojis(clean_text(heading.get_text(" ", strip=True)) or "")
        if not text:
            continue

        bad_words = {
            "Usługi",
            "Popularne usługi",
            "Inne usługi",
            "Opinie",
        }

        if text not in bad_words and len(text) <= 120:
            services.append(text)

    unique_services = list(dict.fromkeys(services))
    return unique_services[:20]


def extract_prices(text: str) -> list[float]:
    prices = re.findall(r"(\d[\d\s]*,\d{2})\s*zł", text)

    values = []

    for price in prices:
        normalized = price.replace(" ", "").replace(",", ".")

        try:
            values.append(float(normalized))
        except ValueError:
            pass

    return values


def extract_price_range(prices: list[float]) -> Optional[str]:
    if not prices:
        return None

    min_price = int(min(prices))
    max_price = int(max(prices))
    return f"{min_price}-{max_price} PLN"


def extract_average_price(prices: list[float]) -> Optional[float]:
    if not prices:
        return None

    return round(sum(prices) / len(prices), 2)


def parse_salon(url: str, page) -> dict:
    soup = get_soup(url)
    page_text = clean_text(soup.get_text(" ", strip=True)) or ""

    h1 = soup.find("h1")
    name = remove_emojis(clean_text(h1.get_text(" ", strip=True)) or "") if h1 else None

    address = None
    district = None

    if h1:
        nearby_texts = []
        parent = h1.parent

        if parent:
            nearby_texts = [
                clean_text(x.get_text(" ", strip=True))
                for x in parent.find_all(["p", "div"])
            ]

        for text in nearby_texts:
            if text and "Warszawa" in text:
                address = remove_emojis(text)
                break

    if not address:
        match = re.search(
            r"([A-ZŁŚŻŹĆŃÓĄĘa-złśżźćńóąę0-9 .,/()-]+,\s*\d{2}-\d{3},\s*Warszawa,\s*[A-ZŁŚŻŹĆŃÓĄĘa-złśżźćńóąę-]+)",
            page_text,
        )

        if match:
            address = remove_emojis(clean_text(match.group(1)) or "")

    if address and "," in address:
        district = clean_text(address.split(",")[-1])

    rating, reviews_count = parse_rating(page_text)
    prices = extract_prices(page_text)
    contacts = extract_contacts_from_rendered_page(page, url)

    salon = {
        "name": name,
        "address": address,
        "district": district,
        "phone": contacts["phone"],
        "instagram": contacts["instagram"],
        "facebook": contacts["facebook"],
        "website": contacts["website"],
        "services": extract_services(soup),
        "price_range": extract_price_range(prices),
        "average_price": extract_average_price(prices),
        "rating": rating,
        "reviews_count": reviews_count,
        "source_url": url,
    }

    return salon
