import json
import os
import re
import time
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

data_path = Path("scraper/salons.json")


def parse_price_range(price_range: str | None):
    if not price_range:
        return None, None

    match = re.search(
        r"(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)",
        price_range
    )

    if not match:
        return None, None

    price_min = float(match.group(1).replace(",", "."))
    price_max = float(match.group(2).replace(",", "."))

    return price_min, price_max


with data_path.open("r", encoding="utf-8") as file:
    salons = json.load(file)


rows = []

for salon in salons:
    price_min, price_max = parse_price_range(salon.get("price_range"))

    rows.append({
        "name": salon.get("name"),
        "address": salon.get("address"),
        "district": salon.get("district"),

        "phone": salon.get("phone"),
        "instagram": salon.get("instagram"),
        "facebook": salon.get("facebook"),
        "website": salon.get("website"),

        "services": salon.get("services") or [],

        "price_range": salon.get("price_range"),
        "price_min": price_min,
        "price_max": price_max,
        "currency": "PLN",
        "average_price": salon.get("average_price"),

        "rating": salon.get("rating"),
        "reviews_count": salon.get("reviews_count"),

        "source_url": salon.get("source_url"),
    })


BATCH_SIZE = 25

for i in range(0, len(rows), BATCH_SIZE):
    batch = rows[i:i + BATCH_SIZE]

    try:
        supabase.table("salons").upsert(
            batch,
            on_conflict="source_url"
        ).execute()

        print(f"Uploaded batch {i // BATCH_SIZE + 1}: {len(batch)} rows")

    except Exception as error:
        print(f"Failed batch {i // BATCH_SIZE + 1}")
        print(error)
        raise

    time.sleep(0.3)

print(f"Done. Uploaded {len(rows)} salons")