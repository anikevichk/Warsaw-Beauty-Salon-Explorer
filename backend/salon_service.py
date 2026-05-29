from datetime import datetime, timezone
from typing import Optional
import unicodedata

from fastapi import HTTPException

from backend.supabase_client import supabase


SALON_LIST_FIELDS = """
id,
name,
district,
rating,
reviews_count,
price_range,
average_price
"""

SALON_LIST_FIELDS_WITH_SERVICES = """
id,
name,
district,
rating,
reviews_count,
price_range,
average_price,
services
"""


def normalize_text(value: str) -> str:
    value = value.lower().replace("ł", "l")
    value = unicodedata.normalize("NFD", value)
    value = "".join(
        char for char in value
        if unicodedata.category(char) != "Mn"
    )
    return value.strip()


def levenshtein(a: str, b: str) -> int:
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]

    for i in range(len(a) + 1):
        dp[i][0] = i

    for j in range(len(b) + 1):
        dp[0][j] = j

    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],
                    dp[i][j - 1],
                    dp[i - 1][j - 1],
                )

    return dp[len(a)][len(b)]


def normalize_services(services):
    if services is None:
        return []

    if isinstance(services, list):
        return [
            str(service).strip()
            for service in services
            if str(service).strip()
        ]

    if isinstance(services, str):
        return [
            service.strip()
            for service in services.replace(";", ",").split(",")
            if service.strip()
        ]

    return []


def service_matches(salon: dict, service: str) -> bool:
    query = normalize_text(service)

    if not query:
        return True

    services = normalize_services(salon.get("services"))

    for item in services:
        normalized_item = normalize_text(item)

        if query in normalized_item:
            return True

        words = normalized_item.split()

        for word in words:
            if query in word:
                return True

            if len(query) >= 4 and levenshtein(word, query) <= 2:
                return True

    return False


def remove_services(salon: dict) -> dict:
    salon_copy = salon.copy()
    salon_copy.pop("services", None)
    return salon_copy


def get_salons(
    district: Optional[str] = None,
    service: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
):
    has_service_filter = bool(service and service.strip())

    fields = SALON_LIST_FIELDS_WITH_SERVICES if has_service_filter else SALON_LIST_FIELDS

    query = supabase.table("salons").select(fields)

    if district:
        query = query.eq("district", district)

    if search:
        query = query.ilike("name", f"%{search}%")

    if has_service_filter:
        response = (
            query
            .order("rating", desc=True)
            .range(0, 500)
            .execute()
        )

        salons = response.data or []
        salons = [salon for salon in salons if service_matches(salon, service)]
        salons = salons[offset:offset + limit]

        return [remove_services(salon) for salon in salons]

    response = (
        query
        .order("rating", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    return response.data or []


def get_salon_by_id(salon_id: str):
    response = (
        supabase
        .table("salons")
        .select("*")
        .eq("id", salon_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Salon not found")

    return response.data[0]


def update_salon(salon_id: str, update_data: dict):
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided")

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    response = (
        supabase
        .table("salons")
        .update(update_data)
        .eq("id", salon_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Salon not found")

    return response.data[0]