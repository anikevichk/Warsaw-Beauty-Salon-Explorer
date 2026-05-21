from typing import Optional

from pydantic import BaseModel


class SalonUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None

    phone: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    website: Optional[str] = None

    services: Optional[list[str]] = None

    price_range: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    currency: Optional[str] = None
    average_price: Optional[float] = None

    rating: Optional[float] = None
    reviews_count: Optional[int] = None