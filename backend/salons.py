from typing import Optional

from fastapi import APIRouter, Query

from backend.salon import SalonUpdate
from backend.salon_service import (
    get_salons,
    get_salon_by_id,
    update_salon,
)


router = APIRouter()


@router.get("")
def list_salons(
    district: Optional[str] = Query(default=None),
    service: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    return get_salons(
        district=district,
        service=service,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.get("/{salon_id}")
def get_salon(salon_id: str):
    return get_salon_by_id(salon_id)


@router.put("/{salon_id}")
def edit_salon(salon_id: str, salon: SalonUpdate):
    update_data = salon.model_dump(exclude_unset=True)

    return update_salon(salon_id, update_data)