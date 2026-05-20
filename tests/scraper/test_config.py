import config


def test_config_has_target_salons():
    assert isinstance(config.TARGET_SALONS, int)
    assert config.TARGET_SALONS > 0


def test_config_has_search_urls():
    assert isinstance(config.SEARCH_URLS, list)
    assert len(config.SEARCH_URLS) > 0
    assert all("booksy.com" in url for url in config.SEARCH_URLS)


def test_config_has_user_agent_header():
    assert "User-Agent" in config.HEADERS
    assert isinstance(config.HEADERS["User-Agent"], str)
    assert len(config.HEADERS["User-Agent"]) > 0