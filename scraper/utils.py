import re
from typing import Optional

import requests
from bs4 import BeautifulSoup

from config import HEADERS


def clean_text(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    return re.sub(r"\s+", " ", value).strip()


def remove_emojis(text: str) -> str:
    emoji_pattern = re.compile(
        "["
        "\U0001F1E0-\U0001F1FF"
        "\U0001F300-\U0001FAFF"
        "\U00002600-\U000027BF"
        "\U0000FE0F"
        "\U0000200D"
        "]+",
        flags=re.UNICODE,
    )
    return clean_text(emoji_pattern.sub("", text)) or ""


def get_soup(url: str) -> BeautifulSoup:
    response = requests.get(url, headers=HEADERS, timeout=30)
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")


def is_valid_salon(salon: dict) -> bool:
    return bool(
        salon["name"]
        and salon["address"]
        and salon["district"]
    )