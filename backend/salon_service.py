from datetime import datetime, timezone
from typing import Optional

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


def normalize_services(services):
    if services is None:
        return []

    if isinstance(services, list):
        return [str(service) for service in services]

    if isinstance(services, str):
        return [services]

    return []


def service_matches(salon: dict, service: str) -> bool:
    query = service.strip().lower()

    if not query:
        return True

    services = normalize_services(salon.get("services"))

    return any(query in item.lower() for item in services)


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