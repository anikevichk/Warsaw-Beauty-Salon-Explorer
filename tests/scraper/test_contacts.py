import contacts


class FakeLocator:
    def __init__(self, count_value=0, href=None, text="", children=None):
        self.count_value = count_value
        self.href = href
        self.text = text
        self.children = children or {}

    @property
    def first(self):
        return self

    def count(self):
        return self.count_value

    def locator(self, selector):
        return self.children.get(selector, FakeLocator())

    def get_attribute(self, name):
        if name == "href":
            return self.href
        return None

    def inner_text(self):
        return self.text


class FakePage:
    def __init__(self, locators):
        self.locators = locators

    def goto(self, url, wait_until, timeout):
        pass

    def wait_for_load_state(self, state, timeout):
        pass

    def wait_for_timeout(self, timeout):
        pass

    def evaluate(self, script):
        pass

    def locator(self, selector):
        return self.locators.get(selector, FakeLocator())


def test_extract_contacts_from_rendered_page_returns_contacts():
    social_section = FakeLocator(
        count_value=1,
        children={
            'a[data-testid="social-media-instagram-button"]': FakeLocator(
                count_value=1,
                href="https://instagram.com/test"
            ),
            'a[data-testid="social-media-facebook-button"]': FakeLocator(
                count_value=1,
                href="https://facebook.com/test"
            ),
            'a[data-testid="social-media-website-button"]': FakeLocator(
                count_value=1,
                href="https://test-salon.pl"
            ),
        },
    )

    phone_block = FakeLocator(
        count_value=1,
        text="Telefon: 123 456 789"
    )

    page = FakePage(
        {
            'section[data-testid="social-media-section"]': social_section,
            'div[data-testid="business-contact-info-phone"]': phone_block,
        }
    )

    result = contacts.extract_contacts_from_rendered_page(
        page,
        "https://booksy.com/test"
    )

    assert result == {
        "phone": "123 456 789",
        "instagram": "https://instagram.com/test",
        "facebook": "https://facebook.com/test",
        "website": "https://test-salon.pl",
    }


def test_extract_contacts_from_rendered_page_returns_none_when_missing():
    page = FakePage({})

    result = contacts.extract_contacts_from_rendered_page(
        page,
        "https://booksy.com/test"
    )

    assert result == {
        "phone": None,
        "instagram": None,
        "facebook": None,
        "website": None,
    }