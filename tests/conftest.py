import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SCRAPER_DIR = PROJECT_ROOT / "scraper"

sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(SCRAPER_DIR))