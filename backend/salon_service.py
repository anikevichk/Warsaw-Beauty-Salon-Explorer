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
price_min,
price_max,
currency
"""


def get_salons(
    district: Optional[str] = None,
    service: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    query = supabase.table("salons").select(SALON_LIST_FIELDS)

    if district:
        query = query.eq("district", district)

    if service:
        query = query.contains("services", [service])

    if search:
        query = query.ilike("name", f"%{search}%")

    response = (
        query
        .order("rating", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    return response.data


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