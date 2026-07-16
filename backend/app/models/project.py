from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
import uuid
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String, nullable=True)
    settings = Column(JSON, nullable=False, default=dict)  # { units: 'meters', gridSnap: true, etc }
    scene_data = Column(JSON, nullable=False, default=dict)  # { walls: [...], items: [...], floorColor: ... }
    thumbnail_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="projects")


class CatalogItem(Base):
    __tablename__ = "catalog_items"

    id = Column(String(100), primary_key=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # bedroom, living_room, kitchen, office, etc
    subcategory = Column(String(100), nullable=True)
    thumbnail = Column(String, nullable=True)
    model_url = Column(String, nullable=True)  # URL to GLTF/GLB in Supabase Storage
    dimensions = Column(JSON, nullable=False)  # { width, height, depth }
    default_color = Column(String(50), nullable=True)
    default_material = Column(String(50), nullable=True)
    price = Column(Numeric(10, 2), default=0.00)
    brand = Column(String(100), nullable=True)
