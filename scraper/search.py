import re
import time
from urllib.parse import urljoin

from config import BASE_URL, SEARCH_URLS, PAGES_PER_CATEGORY
from utils import get_soup


def collect_profile_links() -> list[str]:
    links = set()

    for search_url in SEARCH_URLS:
        for page in range(1, PAGES_PER_CATEGORY + 1):
            url = search_url if page == 1 else f"{search_url}?businessesPage={page}"
            print(f"Searching page: {url}")

            soup = get_soup(url)

            for a in soup.find_all("a", href=True):
                href = a["href"]

                if re.match(r"^/pl-pl/\d+_.+_3_warszawa", href):
                    links.add(urljoin(BASE_URL, href))

            time.sleep(1)

    return list(links)