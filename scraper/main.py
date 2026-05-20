import json
import time

from playwright.sync_api import sync_playwright

from config import TARGET_SALONS
from parsers import parse_salon
from search import collect_profile_links
from utils import is_valid_salon


def main():
    profile_links = collect_profile_links()
    print(f"\nFound profile links: {len(profile_links)}")

    salons = []
    seen_urls = set()

    with sync_playwright() as p:
        browser = None
        page = None
        using_logged_in_chrome = False

        try:
            browser = p.chromium.connect_over_cdp("http://localhost:9222")
            context = browser.contexts[0]
            using_logged_in_chrome = True

            print("Connected to logged-in Chrome session.")

        except Exception:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()

            print(
                "Logged-in Chrome session not found. "
                "Running without authorization. Phone numbers will be null."
            )

        page = context.new_page()

        for i, url in enumerate(profile_links[:TARGET_SALONS], start=1):
            if len(salons) >= TARGET_SALONS:
                break

            if url in seen_urls:
                continue

            print(f"[{i}/{len(profile_links)}] Parsing: {url}")

            try:
                salon = parse_salon(url, page)

                if is_valid_salon(salon):
                    salons.append(salon)
                    seen_urls.add(url)

            except Exception as e:
                print(f"Failed: {url}")
                print(e)

            time.sleep(0.3)

        if page:
            page.close()

        if browser and not using_logged_in_chrome:
            browser.close()

    with open("salons.json", "w", encoding="utf-8") as f:
        json.dump(salons, f, ensure_ascii=False, indent=2)

    print(f"\nDone. Saved {len(salons)} salons to salons.json")


if __name__ == "__main__":
    main()