from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from decimal import Decimal

# Base User Schema
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# Project Schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    settings: Dict[str, Any] = Field(default_factory=dict)
    scene_data: Dict[str, Any] = Field(default_factory=dict)
    thumbnail_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    scene_data: Optional[Dict[str, Any]] = None
    thumbnail_url: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Catalog Schemas
class CatalogItemBase(BaseModel):
    id: str
    name: str
    category: str
    subcategory: Optional[str] = None
    thumbnail: Optional[str] = None
    model_url: Optional[str] = None
    dimensions: Dict[str, float]  # { width, height, depth }
    default_color: Optional[str] = None
    default_material: Optional[str] = None
    price: Decimal = Decimal("0.00")
    brand: Optional[str] = None

class CatalogItemCreate(CatalogItemBase):
    pass

class CatalogItemResponse(CatalogItemBase):
    class Config:
        from_attributes = True


# AI Prompt Schema
class AIRoomRequest(BaseModel):
    prompt: str  # e.g., "Modern Scandinavian Living Room"
    room_dimensions: Dict[str, float]  # { width, length, height }
    units: str = "meters"
