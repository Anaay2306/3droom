from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from uuid import UUID
import uuid
import datetime
from sqlalchemy.orm import Session

from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, AIRoomRequest, CatalogItemResponse
from app.services.ai_service import AIService
from app.database import engine, get_db
from app.models.project import Base, User, Project, CatalogItem

app = FastAPI(
    title="A&R Contractors & Builders API",
    description="Backend API for A&R Space/Construction 2D/3D Planner",
    version="1.0.0"
)

# Enable CORS for frontend clients (development and production deployments)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Automatically create tables on startup
Base.metadata.create_all(bind=engine)

# Database seeding handler
@app.on_event("startup")
def startup_db_setup():
    db = next(get_db())
    try:
        # 1. Ensure default demo user exists (ID match for hardcoded client UUID)
        demo_user_id = uuid.UUID("11111111-1111-1111-1111-111111111111")
        demo_user = db.query(User).filter(User.id == demo_user_id).first()
        if not demo_user:
            demo_user = User(
                id=demo_user_id,
                email="demo@argroupusa.com",
                created_at=datetime.datetime.utcnow()
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        
        # 2. Ensure initial catalog items exist in database
        initial_catalog = {
            "sofa_1": {
                "name": "3-Seater Comfort Sofa",
                "category": "living_room",
                "subcategory": "sofas",
                "thumbnail": "sofa.png",
                "dimensions": {"width": 2.2, "height": 0.85, "depth": 0.95},
                "default_color": "#4B5563",
                "default_material": "fabric",
                "price": 750.00,
                "brand": "SofaCraft"
            },
            "bed_1": {
                "name": "King Size Bed",
                "category": "bedroom",
                "subcategory": "beds",
                "thumbnail": "bed.png",
                "dimensions": {"width": 1.9, "height": 1.1, "depth": 2.1},
                "default_color": "#E5E7EB",
                "default_material": "fabric",
                "price": 899.00,
                "brand": "SleepWell"
            },
            "desk_1": {
                "name": "Executive Wooden Desk",
                "category": "office",
                "subcategory": "desk",
                "thumbnail": "desk.png",
                "dimensions": {"width": 1.6, "height": 0.75, "depth": 0.8},
                "default_color": "#8B5A2B",
                "default_material": "wood",
                "price": 320.00,
                "brand": "NordicWood"
            },
            "chair_1": {
                "name": "Ergonomic Mesh Chair",
                "category": "office",
                "subcategory": "chair",
                "thumbnail": "chair.png",
                "dimensions": {"width": 0.65, "height": 0.9, "depth": 0.65},
                "default_color": "#111827",
                "default_material": "plastic",
                "price": 249.00,
                "brand": "ErgoFlex"
            }
        }
        
        for item_id, data in initial_catalog.items():
            db_item = db.query(CatalogItem).filter(CatalogItem.id == item_id).first()
            if not db_item:
                db_item = CatalogItem(
                    id=item_id,
                    name=data["name"],
                    category=data["category"],
                    subcategory=data["subcategory"],
                    thumbnail=data["thumbnail"],
                    dimensions=data["dimensions"],
                    default_color=data["default_color"],
                    default_material=data["default_material"],
                    price=data["price"],
                    brand=data["brand"]
                )
                db.add(db_item)
        
        # 3. Ensure a default sample project exists
        first_project = db.query(Project).first()
        if not first_project:
            default_proj_id = uuid.UUID("3c7b37d4-8d48-43e9-a3b0-0cb29ffeb8f2")
            default_proj = Project(
                id=default_proj_id,
                user_id=demo_user_id,
                name="A&R Space Design Project",
                description="Design project by A&R Contractors & Builders Space Planner",
                settings={"units": "meters", "gridSnap": True, "gridSize": 0.5},
                scene_data={
                    "wall_color": "#F3F4F6",
                    "wall_finish": "Matte",
                    "floor_material": "light_oak_wood",
                    "walls": [
                        {"id": "w1", "start": {"x": -2.5, "y": -2.0}, "end": {"x": 2.5, "y": -2.0}},
                        {"id": "w2", "start": {"x": 2.5, "y": -2.0}, "end": {"x": 2.5, "y": 2.0}},
                        {"id": "w3", "start": {"x": 2.5, "y": 2.0}, "end": {"x": -2.5, "y": 2.0}},
                        {"id": "w4", "start": {"x": -2.5, "y": 2.0}, "end": {"x": -2.5, "y": -2.0}}
                    ],
                    "items": [
                        {
                            "id": "item_1",
                            "catalog_id": "sofa_1",
                            "name": "3-Seater Comfort Sofa",
                            "category": "living_room",
                            "x": 0.0,
                            "y": 0.42,
                            "z": 1.0,
                            "rotation": 180,
                            "width": 2.2,
                            "depth": 0.95,
                            "height": 0.85,
                            "color": "#4B5563",
                            "material": "fabric"
                        }
                    ],
                    "openings": [
                        {"id": "door_1", "type": "door", "wall_id": "w3", "distance": 1.5, "width": 0.9, "height": 2.1, "style": "single"}
                    ]
                },
                thumbnail_url=None
            )
            db.add(default_proj)
            
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database on startup: {e}")
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "Welcome to A&R Contractors & Builders API. The backend is operational."}


# Projects Endpoints
@app.get("/api/projects", response_model=List[ProjectResponse])
def get_projects(user_id: Optional[UUID] = None, db: Session = Depends(get_db)):
    query = db.query(Project)
    if user_id:
        query = query.filter(Project.user_id == user_id)
    return query.all()


@app.get("/api/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: UUID, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.post("/api/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_in: ProjectCreate, user_id: UUID = uuid.UUID("11111111-1111-1111-1111-111111111111"), db: Session = Depends(get_db)):
    new_project = Project(
        id=uuid.uuid4(),
        user_id=user_id,
        name=project_in.name,
        description=project_in.description,
        settings=project_in.settings,
        scene_data=project_in.scene_data,
        thumbnail_url=project_in.thumbnail_url
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@app.put("/api/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: UUID, project_in: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_in.name is not None:
        project.name = project_in.name
    if project_in.description is not None:
        project.description = project_in.description
    if project_in.settings is not None:
        project.settings = project_in.settings
    if project_in.scene_data is not None:
        project.scene_data = project_in.scene_data
    if project_in.thumbnail_url is not None:
        project.thumbnail_url = project_in.thumbnail_url
        
    project.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project


@app.delete("/api/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: UUID, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return None


# Catalog Endpoints
@app.get("/api/catalog", response_model=List[CatalogItemResponse])
def get_catalog(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CatalogItem)
    if category:
        query = query.filter(CatalogItem.category == category)
    return query.all()


# AI Layout Suggestion Endpoint
@app.post("/api/ai/generate-layout")
def generate_ai_layout(request: AIRoomRequest):
    try:
        scene = AIService.generate_layout(
            prompt=request.prompt,
            dimensions=request.room_dimensions,
            units=request.units
        )
        return {"status": "success", "scene": scene}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
