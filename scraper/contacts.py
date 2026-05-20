import re
from typing import Optional

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError

from utils import clean_text


def extract_contacts_from_rendered_page(page, url: str) -> dict[str, Optional[str]]:
    result = {
        "phone": None,
        "instagram": None,
        "facebook": None,
        "website": None,
    }

    try:
        page.goto(url, wait_until="commit", timeout=20000)

        try:
            page.wait_for_load_state("domcontentloaded", timeout=10000)
        except PlaywrightTimeoutError:
            pass

        page.wait_for_timeout(1200)

        scroll_positions = [
            "0",
            "document.body.scrollHeight * 0.35",
            "document.body.scrollHeight * 0.65",
            "document.body.scrollHeight",
        ]

        for position in scroll_positions:
            page.evaluate(f"window.scrollTo(0, {position})")
            page.wait_for_timeout(700)

            social_section = page.locator(
                'section[data-testid="social-media-section"]'
            )

            if social_section.count() > 0:
                section = social_section.first

                def get_href(selector: str) -> Optional[str]:
                    locator = section.locator(selector)

                    if locator.count() == 0:
                        return None

                    href = locator.first.get_attribute("href")
                    return href.strip() if href else None

                if result["instagram"] is None:
                    result["instagram"] = get_href(
                        'a[data-testid="social-media-instagram-button"]'
                    )

                if result["facebook"] is None:
                    result["facebook"] = get_href(
                        'a[data-testid="social-media-facebook-button"]'
                    )

                if result["website"] is None:
                    result["website"] = get_href(
                        'a[data-testid="social-media-website-button"]'
                    )

            phone_block = page.locator(
                'div[data-testid="business-contact-info-phone"]'
            )

            if phone_block.count() > 0 and result["phone"] is None:
                text = clean_text(phone_block.first.inner_text()) or ""

                match = re.search(
                    r"(?:\+48\s*)?\d{3}[\s-]?\d{3}[\s-]?\d{3}",
                    text
                )

                if match:
                    result["phone"] = match.group(0)

            if (
                result["phone"] is not None
                and (
                    result["instagram"] is not None
                    or result["facebook"] is not None
                    or result["website"] is not None
                )
            ):
                break

    except PlaywrightTimeoutError:
        pass

    return result